'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function TrainerEditQuestionPage() {
  const { courseName, qId } = useParams();
  const router = useRouter();
  const decoded = decodeURIComponent(courseName as string);

  const [form, setForm] = useState({
    question: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_ans: 'A',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  useEffect(() => {
    fetchQuestion();
  }, [qId]);

  const fetchQuestion = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/pretest/questions/${qId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data.question) {
        setForm({
          question: data.question.question,
          option_a: data.question.option_a,
          option_b: data.question.option_b,
          option_c: data.question.option_c,
          option_d: data.question.option_d,
          correct_ans: data.question.correct_ans,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/pretest/questions/${qId}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(form),
        }
      );
      if (!res.ok) throw new Error('Failed');
      showToast('✅ Question updated successfully');
      setTimeout(() => {
        router.push(`/dashboard/trainer-management/pre-test/${courseName}/pre-test`);
      }, 1000);
    } catch (err) {
      showToast('❌ Failed to update question');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
    </div>
  );

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <button
        onClick={() => router.push(`/dashboard/trainer-management/pre-test/${courseName}/pre-test`)}
        className="text-sm text-blue-600 hover:underline mb-4 block"
      >
        ← Back to Questions
      </button>
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Edit Question</h1>
      <p className="text-gray-500 text-sm mb-6">
        Course: <span className="font-medium text-blue-600">{decoded}</span>
      </p>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
            Question <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            rows={3}
            value={form.question}
            onChange={e => setForm({ ...form, question: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 resize-none text-gray-800"
          />
        </div>

        {(['a', 'b', 'c', 'd'] as const).map(opt => (
          <div key={opt}>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              Option {opt.toUpperCase()} <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="text"
              value={form[`option_${opt}` as keyof typeof form]}
              onChange={e => setForm({ ...form, [`option_${opt}`]: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 text-gray-800"
            />
          </div>
        ))}

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
            Correct Answer <span className="text-red-500">*</span>
          </label>
          <select
            value={form.correct_ans}
            onChange={e => setForm({ ...form, correct_ans: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 text-gray-800"
          >
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.push(`/dashboard/trainer-management/pre-test/${courseName}/pre-test`)}
            className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-600 font-bold text-sm hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold text-sm rounded-xl transition-all"
          >
            {saving ? 'Saving...' : '💾 Update Question'}
          </button>
        </div>
      </form>

      {toast && (
        <div className="fixed bottom-8 right-8 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl font-bold text-sm z-50">
          {toast}
        </div>
      )}
    </div>
  );
}