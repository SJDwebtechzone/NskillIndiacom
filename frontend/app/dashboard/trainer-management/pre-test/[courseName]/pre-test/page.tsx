'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Question {
  id: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_ans: string;
}

interface Config {
  total_qs: number;
  pass_percent: number;
  time_limit: number;
}

export default function TrainerPretestQuestionsPage() {
  const { courseName } = useParams();
  const router = useRouter();
  const decoded = decodeURIComponent(courseName as string);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchQuestions();
    fetchConfig();
  }, [courseName]);

  const fetchQuestions = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/pretest/${encodeURIComponent(decoded)}/questions`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setQuestions(data.questions || []);
    } catch (err) {
      console.error('Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchConfig = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/pretest/${encodeURIComponent(decoded)}/config`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setConfig(data.config);
    } catch (err) {
      console.error('Error fetching config:', err);
    }
  };

  const handleDelete = async (qId: number) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/pretest/questions/${qId}`,
        { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
      );
      setQuestions(prev => prev.filter(q => q.id !== qId));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <button
            onClick={() => router.push('/dashboard/trainer-management/pre-test')}
            className="text-sm text-blue-600 hover:underline mb-1 block"
          >
            ← Back to Courses
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Pretest Questions</h1>
          <p className="text-gray-500 text-sm mt-1">
            Course: <span className="font-medium text-blue-600">{decoded}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/dashboard/trainer-management/pre-test/${courseName}/pre-test/config`}
            className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 text-sm font-medium"
          >
            ⚙️ Config
          </Link>
          <Link
            href={`/dashboard/trainer-management/pre-test/${courseName}/pre-test/add`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            + Add Question
          </Link>
        </div>
      </div>

      {/* Config bar */}
      {config && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex gap-8">
          <div>
            <p className="text-xs text-gray-500">Total Questions</p>
            <p className="text-lg font-bold text-blue-700">{config.total_qs}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Pass Mark</p>
            <p className="text-lg font-bold text-green-600">{config.pass_percent}%</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Time Limit</p>
            <p className="text-lg font-bold text-orange-600">{config.time_limit / 60} mins</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Questions Added</p>
            <p className="text-lg font-bold text-gray-700">{questions.length} / {config.total_qs}</p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {questions.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <div className="text-5xl mb-4">📝</div>
          <p className="text-gray-400 text-lg">No questions added yet.</p>
          <Link
            href={`/dashboard/trainer-management/pre-test/${courseName}/pre-test/add`}
            className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg text-sm"
          >
            + Add First Question
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Question</th>
                <th className="px-4 py-3 text-center">Options</th>
                <th className="px-4 py-3 text-center">Answer</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {questions.map((q, index) => (
                <tr key={q.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                  <td className="px-4 py-3 text-gray-800 max-w-xs">{q.question}</td>
                  <td className="px-4 py-3 text-gray-500 text-center">
                    <div className="text-xs space-y-0.5">
                      <p>A: {q.option_a}</p>
                      <p>B: {q.option_b}</p>
                      <p>C: {q.option_c}</p>
                      <p>D: {q.option_d}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="bg-green-100 text-green-700 font-bold px-3 py-1 rounded-full text-xs">
                      {q.correct_ans}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() =>
                          router.push(
                            `/dashboard/trainer-management/pre-test/${courseName}/pre-test/edit/${q.id}`
                          )
                        }
                        className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs hover:bg-yellow-200"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(q.id)}
                        className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-xs hover:bg-red-200"
                      >
                        🗑️ Delete
                      </button>
                    </div>
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