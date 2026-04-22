'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function TrainerAddQuestionPage() {
  const { courseName } = useParams();
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
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/pretest/${encodeURIComponent(decoded)}/questions`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(form),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      showToast('✅ Question added successfully');
      setTimeout(() => {
        router.push(`/dashboard/trainer-management/pre-test/${courseName}/pre-test`);
      }, 1000);
    } catch (err) {
      showToast('❌ Failed to add question');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <button
        onClick={() => router.push(`/dashboard/trainer-management/pre-test/${courseName}/pre-test`)}
        className="text-sm text-blue-600 hover:underline mb-4 block"
      >
        ← Back to Questions
      </button>
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Add Question</h1>
      <p className="text-gray-500 text-sm mb-6">
        Course: <span className="font-medium text-blue-600">{decoded}</span>
      </p>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
        {/* Question */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
            Question <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            rows={3}
            value={form.question}
            onChange={e => setForm({ ...form, question: e.target.value })}
            placeholder="Enter your question here..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 resize-none text-gray-800"
          />
        </div>

        {/* Options */}
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
              placeholder={`Option ${opt.toUpperCase()}`}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 text-gray-800"
            />
          </div>
        ))}

        {/* Correct Answer */}
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

        {/* Buttons */}
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
            {saving ? 'Saving...' : '+ Add Question'}
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