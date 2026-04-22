'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Submission {
  id: number;
  student_admission_id: number;
  student_name: string;
  admission_number: string;
  email: string;
  video_url: string;
  status: string;
  marks: number | null;
  remarks: string | null;
  submitted_at: string;
  verified_at: string | null;
}

export default function PracticalSubmissionsPage() {
  const { courseName, taskId } = useParams();
  const router = useRouter();
  const decoded = decodeURIComponent(courseName as string);

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [verifyForm, setVerifyForm] = useState({ marks: '', remarks: '' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  useEffect(() => { fetchSubmissions(); }, [taskId]);

  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/practical/trainer/tasks/${taskId}/submissions`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setSubmissions(data.submissions || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const openVerify = (sub: Submission) => {
    setSelectedSub(sub);
    setVerifyForm({ marks: sub.marks?.toString() || '', remarks: sub.remarks || '' });
    setShowVerifyModal(true);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/practical/trainer/submissions/${selectedSub.id}/verify`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ marks: parseInt(verifyForm.marks), remarks: verifyForm.remarks }),
        }
      );
      if (!res.ok) throw new Error('Failed');
      showToast('✅ Submission verified');
      setShowVerifyModal(false);
      fetchSubmissions();
    } catch { showToast('❌ Failed to verify'); }
    finally { setSaving(false); }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'verified') return 'bg-green-100 text-green-700';
    if (status === 'submitted') return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-500';
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600" />
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <button onClick={() => router.back()} className="text-sm text-orange-600 hover:underline mb-1 block">← Back to Tasks</button>
          <h1 className="text-2xl font-bold text-gray-800">Practical Video Submissions</h1>
          <p className="text-gray-500 text-sm mt-1">Course: <span className="font-semibold text-orange-600">{decoded}</span></p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-2 text-center">
          <p className="text-xs text-orange-400 font-bold">Total</p>
          <p className="text-2xl font-black text-orange-600">{submissions.length}</p>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-gray-400 text-lg">No submissions yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Student', 'Status', 'Video', 'Marks', 'Remarks', 'Submitted At', 'Action'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {submissions.map(sub => (
                <tr key={sub.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-800">{sub.student_name}</p>
                    <p className="text-xs text-gray-400">{sub.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusBadge(sub.status)}`}>
                      {sub.status === 'verified' ? '✅ Verified' : sub.status === 'submitted' ? '📤 Submitted' : '⏳ Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {sub.video_url ? (
                      <button
                        onClick={() => window.open(sub.video_url, '_blank')}
                        className="text-orange-600 hover:underline text-xs font-medium"
                      >
                        🎥 Watch Video
                      </button>
                    ) : (
                      <span className="text-gray-400 text-xs">Not submitted</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-bold text-gray-800">
                    {sub.marks !== null ? `${sub.marks}/10` : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs max-w-xs">
                    {sub.remarks || '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {sub.video_url && (
                      <button
                        onClick={() => openVerify(sub)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          sub.status === 'verified'
                            ? 'bg-green-50 text-green-600 border border-green-200 hover:bg-green-100'
                            : 'bg-orange-600 text-white hover:bg-orange-700'
                        }`}
                      >
                        {sub.status === 'verified' ? '✏️ Re-verify' : '✅ Verify'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Verify Modal */}
      {showVerifyModal && selectedSub && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Verify Practical Video</h2>
            <p className="text-gray-500 text-sm mb-4">
              Student: <span className="font-semibold text-gray-800">{selectedSub.student_name}</span>
            </p>
            {selectedSub.video_url && (
              <button
                onClick={() => window.open(selectedSub.video_url, '_blank')}
                className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-xl text-orange-600 text-sm font-medium mb-6 hover:bg-orange-100 transition-all w-full"
              >
                🎥 Watch Submitted Video
              </button>
            )}
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Marks * (0-10)</label>
                <input
                  required type="number" min={0} max={10}
                  value={verifyForm.marks}
                  onChange={e => setVerifyForm({...verifyForm, marks: e.target.value})}
                  placeholder="Enter marks (0-10)"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400 text-gray-800"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Remarks *</label>
                <textarea
                  required rows={3}
                  value={verifyForm.remarks}
                  onChange={e => setVerifyForm({...verifyForm, remarks: e.target.value})}
                  placeholder="Enter your feedback..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400 text-gray-800 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowVerifyModal(false)} className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-600 font-bold text-sm hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white font-bold text-sm rounded-xl">
                  {saving ? 'Saving...' : '✅ Verify & Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <div className="fixed bottom-8 right-8 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl font-bold text-sm z-50">{toast}</div>}
    </div>
  );
}