"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

interface Attempt {
  id: number;
  student_id: number;
  student_name: string;
  email: string;
  score: number;
  total: number;
  passed: boolean;
  time_taken: number;
  submitted_at: string;
}

export default function PostTestAttemptsPage() {
  const router = useRouter();
  const params = useParams();
  const courseName = decodeURIComponent(params?.courseName as string);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState<number | null>(null);

  const fetchAttempts = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/finaltest/${encodeURIComponent(courseName)}/attempts`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setAttempts(data.attempts || []);
    } catch (err) {
      console.error("Failed to fetch attempts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAttempts(); }, []);

  const handleReset = async (studentId: number) => {
    if (!confirm("Reset this student's post-test attempt?")) return;
    setResetting(studentId);
    try {
      const token = localStorage.getItem("token");
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/finaltest/student/reset-attempt`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ student_id: studentId, course_name: courseName }),
      });
      fetchAttempts();
    } catch (err) {
      console.error("Failed to reset attempt", err);
    } finally {
      setResetting(null);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <button
          onClick={() => router.push("/dashboard/trainer-management/post-test")}
          className="text-sm text-purple-600 hover:underline mb-1 block"
        >
          ← Back to courses
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Student Attempts</h1>
        <p className="text-gray-500 text-sm mt-1">{courseName} — Post-Test</p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading attempts...</div>
      ) : attempts.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-gray-400 text-lg">No attempts yet.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Student</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Score</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Status</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Time Taken</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Submitted</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {attempts.map((a) => (
                <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-800">{a.student_name}</p>
                    <p className="text-gray-400 text-xs">{a.email}</p>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-800">
                    {a.score}/{a.total}
                    <span className="text-xs text-gray-400 ml-1">
                      ({a.total > 0 ? Math.round((a.score / a.total) * 100) : 0}%)
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        a.passed
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {a.passed ? "✅ Passed" : "❌ Failed"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{formatTime(a.time_taken)}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(a.submitted_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleReset(a.student_id)}
                      disabled={resetting === a.student_id}
                      className="text-xs text-red-500 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50 disabled:opacity-50"
                    >
                      {resetting === a.student_id ? "Resetting..." : "🔄 Reset"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
