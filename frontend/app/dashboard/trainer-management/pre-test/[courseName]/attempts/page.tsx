'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface StudentAttempt {
  attempt_id: number;
  student_admission_id: number;
  student_name: string;
  email: string;
  score: number;
  total: number;
  passed: boolean;
  time_taken: number;
  submitted_at: string;
}

export default function CourseAttemptsPage() {
  const { courseName } = useParams<{ courseName: string }>();
  const router = useRouter();
  const [attempts, setAttempts] = useState<StudentAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  const decoded = decodeURIComponent(courseName);

  useEffect(() => {
    fetchAttempts();
  }, []);

  const fetchAttempts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/pretest/${encodeURIComponent(decoded)}/attempts`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setAttempts(data.attempts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (studentAdmissionId: number, studentName: string) => {
    if (!confirm(`Reset attempt for ${studentName}?`)) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/pretest/student/reset-attempt`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            student_admission_id: studentAdmissionId,
            course_name: decoded,
          }),
        }
      );
      const data = await res.json();
      if (data.success) {
        setToast(`✅ Attempt reset for ${studentName}`);
        setTimeout(() => setToast(''), 3000);
        fetchAttempts(); // refresh list
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
    </div>
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={() => router.back()}
            className="text-sm text-gray-400 hover:text-gray-600 mb-2 flex items-center gap-1"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Student Attempts</h1>
          <p className="text-gray-500 text-sm mt-1">
            Course: <span className="font-semibold text-blue-600">{decoded}</span>
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 text-center">
          <p className="text-xs text-blue-400 font-bold">Total Attempts</p>
          <p className="text-2xl font-black text-blue-600">{attempts.length}</p>
        </div>
      </div>

      {attempts.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-400 text-lg">No attempts yet for this course.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Student', 'Score', 'Percentage', 'Status', 'Time Taken', 'Submitted At', 'Action'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {attempts.map((attempt) => (
                <tr key={attempt.attempt_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-800">{attempt.student_name}</p>
                    <p className="text-xs text-gray-400">{attempt.email}</p>
                  </td>
                  <td className="px-4 py-3 font-bold text-gray-800">
                    {attempt.score}/{attempt.total}
                  </td>
                  <td className="px-4 py-3 font-bold text-gray-600">
                    {attempt.total > 0 ? Math.round((attempt.score / attempt.total) * 100) : 0}%
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      attempt.passed
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {attempt.passed ? '✅ Passed' : '❌ Failed'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {formatTime(attempt.time_taken)}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(attempt.submitted_at).toLocaleDateString('en-IN', {
                      day: '2-digit', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleReset(attempt.student_admission_id, attempt.student_name)}
                      className="bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                    >
                      🔄 Reset Attempt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-8 right-8 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl font-bold text-sm z-50">
          {toast}
        </div>
      )}
    </div>
  );
}