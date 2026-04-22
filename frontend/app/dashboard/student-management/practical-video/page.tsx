'use client';
import { useEffect, useState, useRef } from 'react';

interface Task {
  id: number;
  title: string;
  description: string;
  course_name: string;
  submission_id: number | null;
  video_url: string | null;
  status: string | null;
  marks: number | null;
  remarks: string | null;
  submitted_at: string | null;
  verified_at: string | null;
}

export default function StudentPracticalVideoPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalMarks, setTotalMarks] = useState(0);
  const [toast, setToast] = useState('');
  const [selectedFile, setSelectedFile] = useState<{ [key: number]: File }>({});
  const [submitting, setSubmitting] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ [key: number]: number }>({});

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/practical/student`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setTasks(data.tasks || []);
      setTotalMarks(data.total_marks || 0);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleFileChange = (taskId: number, file: File) => {
    setSelectedFile(prev => ({ ...prev, [taskId]: file }));
  };

  const handleSubmit = async (taskId: number) => {
    const file = selectedFile[taskId];
    if (!file) { showToast('❌ Please select a video first'); return; }

    setSubmitting(taskId);
    try {
      const token = localStorage.getItem('token');

      // Step 1 — Upload video
      const formData = new FormData();
      formData.append('video', file);

      const uploadRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/upload/practical-video`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || 'Upload failed');

      // Step 2 — Submit task
      const submitRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/practical/student/${taskId}/submit`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ video_url: uploadData.file_url }),
        }
      );
      if (!submitRes.ok) throw new Error('Submit failed');

      showToast('✅ Practical video submitted successfully');
      setSelectedFile(prev => { const n = {...prev}; delete n[taskId]; return n; });
      fetchTasks();
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

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600" />
    </div>
  );

  if (tasks.length === 0) return (
    <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
      <div className="text-5xl mb-4">🎥</div>
      <p className="text-gray-400 text-lg font-medium">No practical tasks assigned yet.</p>
      <p className="text-gray-400 text-sm mt-2">Your trainer will assign tasks soon.</p>
    </div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Practical Video</h1>
        <p className="text-gray-500 text-sm mt-1">Upload your practical videos for each task</p>
      </div>

      {/* Total marks summary */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Marks</p>
          <p className="text-3xl font-black text-orange-600">
            {totalMarks}
            <span className="text-lg text-gray-400 font-normal"> / 40</span>
          </p>
        </div>
        <div className="flex gap-4">
          <div className="text-center">
            <p className="text-xs text-gray-500">Tasks</p>
            <p className="text-xl font-black text-gray-700">{tasks.length}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Verified</p>
            <p className="text-xl font-black text-green-600">
              {tasks.filter(t => t.status === 'verified').length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Pending</p>
            <p className="text-xl font-black text-amber-600">
              {tasks.filter(t => !t.status || t.status === 'pending').length}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {tasks.map((task, index) => {
          const badge = getStatusBadge(task.status);
          return (
            <div key={task.id} className={`bg-white border rounded-xl p-5 shadow-sm transition-all ${
              task.status === 'verified' ? 'border-green-200' :
              task.status === 'submitted' ? 'border-blue-200' : 'border-gray-200'
            }`}>
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="bg-orange-100 text-orange-600 rounded-xl w-9 h-9 flex items-center justify-center font-black flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-lg">{task.title}</h3>
                    {task.description && <p className="text-gray-500 text-sm mt-1">{task.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <span className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded-full font-bold">
                    10 marks
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${badge.bg}`}>
                    {badge.label}
                  </span>
                </div>
              </div>

              {/* Result section — shown when verified */}
              {task.status === 'verified' && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                  <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-2">Trainer Feedback</p>
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-xs text-gray-500">Marks</p>
                      <p className="text-2xl font-black text-green-600">
                        {task.marks}<span className="text-sm text-gray-400">/10</span>
                      </p>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Remarks</p>
                      <p className="text-sm font-medium text-gray-800">{task.remarks}</p>
                    </div>
                  </div>
                  {task.verified_at && (
                    <p className="text-xs text-gray-400 mt-2">
                      Verified on: {new Date(task.verified_at).toLocaleDateString('en-IN')}
                    </p>
                  )}
                </div>
              )}

              {/* Submitted video link */}
              {task.video_url && task.status !== 'verified' && (
                <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-xl mb-4">
                  <span className="text-blue-600 text-sm font-medium">🎥 Video submitted</span>
                  <button
                    onClick={() => window.open(task.video_url!, '_blank')}
                    className="text-blue-600 hover:underline text-xs font-bold"
                  >
                    Watch →
                  </button>
                </div>
              )}

              {/* Upload section */}
              {task.status !== 'verified' && (
                <div className="border-t border-gray-100 pt-4 mt-2">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    {task.status === 'submitted' ? 'Re-upload Video' : 'Upload Practical Video'}
                  </p>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="video/mp4,video/quicktime,video/x-msvideo,video/webm"
                      onChange={e => e.target.files && handleFileChange(task.id, e.target.files[0])}
                      className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100"
                    />
                    <button
                      onClick={() => handleSubmit(task.id)}
                      disabled={!selectedFile[task.id] || submitting === task.id}
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                        selectedFile[task.id] && submitting !== task.id
                          ? 'bg-orange-600 text-white hover:bg-orange-700'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {submitting === task.id ? 'Uploading...' : '🎥 Submit'}
                    </button>
                  </div>
                  {selectedFile[task.id] && (
                    <p className="text-xs text-gray-400 mt-1">
                      Selected: {selectedFile[task.id].name} ({(selectedFile[task.id].size / 1024 / 1024).toFixed(1)} MB)
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {toast && (
        <div className="fixed bottom-8 right-8 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl font-bold text-sm z-50">
          {toast}
        </div>
      )}
    </div>
  );
}