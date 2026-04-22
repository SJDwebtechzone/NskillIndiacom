'use client';
import { useEffect, useState, useRef } from 'react';

interface Assessment {
  id: number;
  title: string;
  description: string;
  due_date: string;
  course_name: string;
  submission_id: number | null;
  file_url: string | null;
  status: string | null;
  marks: number | null;
  remarks: string | null;
  submitted_at: string | null;
  verified_at: string | null;
}

export default function StudentAssessmentsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<{ [key: number]: File }>({});
  const [submitting, setSubmitting] = useState<number | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  useEffect(() => { fetchAssessments(); }, []);

  const fetchAssessments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/assessments/student`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setAssessments(data.assessments || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleFileChange = (assessmentId: number, file: File) => {
    setSelectedFile(prev => ({ ...prev, [assessmentId]: file }));
  };

  const handleSubmit = async (assessmentId: number) => {
  const file = selectedFile[assessmentId];
  if (!file) { showToast('❌ Please select a file first'); return; }

  setSubmitting(assessmentId);
  try {
    const token = localStorage.getItem('token');

    // Step 1 — Upload file to server
    const formData = new FormData();
    formData.append('file', file);

    const uploadRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/upload/assessment`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        // ← NO Content-Type header — browser sets it automatically for FormData
        body: formData,
      }
    );
    const uploadData = await uploadRes.json();
    if (!uploadRes.ok) throw new Error(uploadData.error || 'Upload failed');

    // Step 2 — Submit assessment with file_url
    const submitRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/assessments/student/${assessmentId}/submit`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ file_url: uploadData.file_url }),
      }
    );
    if (!submitRes.ok) throw new Error('Submit failed');

    showToast('✅ Assignment submitted successfully');
    setSelectedFile(prev => { const n = {...prev}; delete n[assessmentId]; return n; });
    fetchAssessments();
  } catch (err) {
    console.error(err);
    showToast('❌ Failed to submit');
  } finally {
    setSubmitting(null);
  }
};
  const getStatusBadge = (status: string | null) => {
    if (status === 'verified') return { bg: 'bg-green-100 text-green-700', label: '✅ Verified' };
    if (status === 'submitted') return { bg: 'bg-blue-100 text-blue-700', label: '📤 Submitted' };
    return { bg: 'bg-amber-100 text-amber-700', label: '⏳ Pending' };
  };

  const isOverdue = (due_date: string) => new Date(due_date) < new Date();

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
    </div>
  );

  if (assessments.length === 0) return (
    <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
      <div className="text-5xl mb-4">📋</div>
      <p className="text-gray-400 text-lg font-medium">No assessments assigned yet.</p>
      <p className="text-gray-400 text-sm mt-2">Your trainer will assign assessments soon.</p>
    </div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Assessment & Assignment</h1>
        <p className="text-gray-500 text-sm mt-1">View and submit your assessments</p>
      </div>

      <div className="space-y-4">
        {assessments.map((a) => {
          const badge = getStatusBadge(a.status);
          const overdue = isOverdue(a.due_date) && a.status !== 'submitted' && a.status !== 'verified';

          return (
            <div key={a.id} className={`bg-white border rounded-xl p-5 shadow-sm transition-all ${
              a.status === 'verified' ? 'border-green-200' :
              a.status === 'submitted' ? 'border-blue-200' :
              overdue ? 'border-red-200' : 'border-gray-200'
            }`}>
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-lg">{a.title}</h3>
                  {a.description && <p className="text-gray-500 text-sm mt-1">{a.description}</p>}
                </div>
                <span className={`ml-4 px-3 py-1 rounded-full text-xs font-bold ${badge.bg}`}>
                  {badge.label}
                </span>
              </div>

              {/* Due date */}
              <div className="flex items-center gap-3 mb-4">
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                  overdue ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600'
                }`}>
                  📅 Due: {new Date(a.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  {overdue && ' (Overdue)'}
                </span>
                {a.submitted_at && (
                  <span className="text-xs text-gray-400">
                    Submitted: {new Date(a.submitted_at).toLocaleDateString('en-IN')}
                  </span>
                )}
              </div>

              {/* Result section — shown when verified */}
              {a.status === 'verified' && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                  <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-2">Trainer Feedback</p>
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-xs text-gray-500">Marks</p>
                     <p className="text-2xl font-black text-green-600">{a.marks}<span className="text-sm text-gray-400">/10</span></p>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Remarks</p>
                      <p className="text-sm font-medium text-gray-800">{a.remarks}</p>
                    </div>
                  </div>
                  {a.verified_at && (
                    <p className="text-xs text-gray-400 mt-2">
                      Verified on: {new Date(a.verified_at).toLocaleDateString('en-IN')}
                    </p>
                  )}
                </div>
              )}

              {/* Submitted file link */}
              {a.file_url && a.status !== 'verified' && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl mb-4">
                  <span className="text-blue-600 text-sm font-medium">📄 Document submitted</span>
                </div>
              )}

              {/* Upload section — show if not verified */}
              {a.status !== 'verified' && (
                <div className="border-t border-gray-100 pt-4 mt-2">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    {a.status === 'submitted' ? 'Re-upload Document' : 'Upload Document'}
                  </p>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={e => e.target.files && handleFileChange(a.id, e.target.files[0])}
                      className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
                    />
                    <button
                      onClick={() => handleSubmit(a.id)}
                      disabled={!selectedFile[a.id] || submitting === a.id}
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                        selectedFile[a.id] && submitting !== a.id
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {submitting === a.id ? 'Uploading...' : '📤 Submit'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {toast && <div className="fixed bottom-8 right-8 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl font-bold text-sm z-50">{toast}</div>}
    </div>
  );
}