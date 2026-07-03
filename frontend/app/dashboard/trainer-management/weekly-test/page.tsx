'use client';
import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit3, Eye, File, Video, FileText, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

interface PosttestQuestion {
  id: number;
  course_name: string;
  question: string;
  is_upload: boolean;
  upload_type: 'document' | 'video' | 'both';
  created_at?: string;
}

interface CourseInfo {
  course_name: string;
  student_count: number;
}

interface Attempt {
  attempt_id: number;
  student_name: string;
  email: string;
  file_url: string;
  file_type: string;
  status: 'pending' | 'reviewed';
  review_note: string;
  submitted_at: string;
}

export default function TrainerWeeklyTestManagement() {
  const [courses, setCourses] = useState<CourseInfo[]>([]);
  const [requests, setRequests] = useState<PosttestQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Views
  const [view, setView] = useState<'list' | 'create' | 'submissions'>('list');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedRequest, setSelectedRequest] = useState<PosttestQuestion | null>(null);
  const [submissions, setSubmissions] = useState<Attempt[]>([]);
  
  // Form state
  const [form, setForm] = useState({
    question: '',
    upload_type: 'document'
  });
  
  const [reviewForm, setReviewForm] = useState({ id: 0, note: '' });

  const API = process.env.NEXT_PUBLIC_API_URL;
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const coursesRes = await fetch(`${API}/api/admin/posttest/trainer/courses`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      const coursesData = await coursesRes.json();
      setCourses(coursesData.courses || []);
      if (coursesData.courses?.length > 0) {
        setSelectedCourse(coursesData.courses[0].course_name);
        fetchRequests(coursesData.courses[0].course_name);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchRequests = async (courseName: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/posttest/${encodeURIComponent(courseName)}/questions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      // Filter only the ones that are file upload requests
      const uploadRequests = (data.questions || []).filter((q: any) => q.is_upload);
      setRequests(uploadRequests);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCourse(e.target.value);
    fetchRequests(e.target.value);
  };

  const fetchSubmissions = async (courseName: string) => {
    try {
      const res = await fetch(`${API}/api/admin/posttest/${encodeURIComponent(courseName)}/attempts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      // Filter only file upload attempts
      const uploadAttempts = (data.attempts || []).filter((a: any) => a.file_url);
      setSubmissions(uploadAttempts);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateRequest = async () => {
    try {
      const res = await fetch(`${API}/api/admin/posttest/${encodeURIComponent(selectedCourse)}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          question: form.question, 
          is_upload: true, 
          upload_type: form.upload_type 
        })
      });
      if (res.ok) {
        setView('list');
        setForm({ question: '', upload_type: 'document' });
        fetchRequests(selectedCourse);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Move this record to Restore? This record can be restored within 30 days. After 30 days it will be permanently deleted automatically.")) return;
    try {
      await fetch(`${API}/api/admin/posttest/questions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchRequests(selectedCourse);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReview = async () => {
    try {
      await fetch(`${API}/api/admin/posttest/attempts/${reviewForm.id}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ review_note: reviewForm.note })
      });
      setReviewForm({ id: 0, note: '' });
      if (selectedRequest) fetchSubmissions(selectedCourse);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && courses.length === 0) return <div className="flex justify-center items-center min-h-[60vh]"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600" /></div>;

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Weekly Test Management</h1>
          <p className="text-gray-500 text-sm mt-1">Request documents or videos from your students.</p>
        </div>
        {view === 'list' && (
          <div className="flex items-center gap-4">
            <select 
              value={selectedCourse} 
              onChange={handleCourseChange}
              className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium outline-none focus:border-purple-500 shadow-sm"
            >
              {courses.map(c => (
                <option key={c.course_name} value={c.course_name}>{c.course_name}</option>
              ))}
            </select>
            <button 
              onClick={() => setView('create')}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors text-sm shadow-sm"
            >
              <Plus size={18} /> New Request
            </button>
          </div>
        )}
      </div>

      {view === 'create' && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm max-w-2xl">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Create New Test Request</h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Course</label>
              <select 
                value={selectedCourse} 
                onChange={handleCourseChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-purple-500"
              >
                {courses.map(c => (
                  <option key={c.course_name} value={c.course_name}>{c.course_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Instructions / Request Title</label>
              <textarea 
                value={form.question} onChange={e => setForm({...form, question: e.target.value})}
                placeholder="What should the student upload? e.g. Upload your week 1 completed project PDF here."
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Required Format</label>
              <select 
                value={form.upload_type} onChange={e => setForm({...form, upload_type: e.target.value as any})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-purple-500"
              >
                <option value="document">Document (PDF, Word)</option>
                <option value="video">Video (MP4, WEBM)</option>
                <option value="both">Any (Document or Video)</option>
              </select>
            </div>
            <div className="pt-4 flex justify-end gap-3">
              <button onClick={() => setView('list')} className="px-6 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-sm">Cancel</button>
              <button onClick={handleCreateRequest} disabled={!form.question} className="px-6 py-2.5 bg-purple-600 text-white font-bold rounded-xl text-sm disabled:opacity-50">Create Request</button>
            </div>
          </div>
        </div>
      )}

      {view === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map(req => (
            <div key={req.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded-lg uppercase tracking-wider">
                  {req.course_name}
                </span>
                <span className={`text-xs font-bold px-2 py-1 rounded-lg uppercase tracking-wider ${
                  req.upload_type === 'video' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  {req.upload_type}
                </span>
              </div>
              <p className="text-sm text-slate-900 mb-4 flex-grow">{req.question}</p>
              
              <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button 
                  onClick={() => { setSelectedRequest(req); setView('submissions'); fetchSubmissions(selectedCourse); }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-xl transition-colors text-xs font-bold" title="View Submissions"
                >
                  <Eye size={14} /> View Submissions
                </button>
                <button 
                  onClick={() => handleDelete(req.id)}
                  className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors" title="Delete Request"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {requests.length === 0 && !loading && (
            <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
              <div className="text-5xl mb-4">📝</div>
              <p className="text-slate-500 font-bold text-lg">No file requests created for {selectedCourse} yet.</p>
            </div>
          )}
        </div>
      )}

      {view === 'submissions' && selectedRequest && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div>
              <h2 className="text-xl font-black text-slate-900">Submissions for {selectedCourse}</h2>
              <p className="text-slate-500 text-sm mt-1">{selectedRequest.question}</p>
            </div>
            <button onClick={() => setView('list')} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors text-sm">
              Back to Requests
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-widest text-slate-500">
                  <th className="p-4 font-bold">Student</th>
                  <th className="p-4 font-bold">File</th>
                  <th className="p-4 font-bold">Submitted</th>
                  <th className="p-4 font-bold">Status & Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {submissions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500 font-medium">
                      No submissions yet.
                    </td>
                  </tr>
                ) : (
                  submissions.map(sub => (
                    <tr key={sub.attempt_id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-slate-800 text-sm">{sub.student_name}</p>
                        <p className="text-xs text-slate-500">{sub.email}</p>
                      </td>
                      <td className="p-4">
                        <a 
                          href={`${API}${sub.file_url}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors"
                        >
                          {sub.file_type === 'video' ? <Video size={14} /> : <FileText size={14} />}
                          View {sub.file_type}
                        </a>
                      </td>
                      <td className="p-4 text-sm text-slate-600 font-medium">
                        {format(new Date(sub.submitted_at), 'MMM dd, h:mm a')}
                      </td>
                      <td className="p-4">
                        {sub.status === 'reviewed' ? (
                          <div>
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                              <CheckCircle2 size={12} /> Reviewed
                            </span>
                            {sub.review_note && <p className="text-xs text-slate-500 mt-1 italic">"{sub.review_note}"</p>}
                          </div>
                        ) : reviewForm.id === sub.attempt_id ? (
                          <div className="flex gap-2">
                            <input 
                              value={reviewForm.note} onChange={e => setReviewForm({...reviewForm, note: e.target.value})}
                              placeholder="Add a note..."
                              className="text-xs border border-slate-200 rounded px-2 py-1 outline-none w-32"
                            />
                            <button onClick={handleReview} className="text-xs bg-emerald-500 text-white px-2 py-1 rounded font-bold">Save</button>
                            <button onClick={() => setReviewForm({id: 0, note: ''})} className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded font-bold">Cancel</button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setReviewForm({ id: sub.attempt_id, note: '' })}
                            className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded-md transition-colors"
                          >
                            <Edit3 size={12} /> Mark Reviewed
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}