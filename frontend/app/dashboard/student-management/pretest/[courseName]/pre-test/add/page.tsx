'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface QuestionForm {
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_ans: string;
}

export default function AddQuestionPage() {
  const { courseName } = useParams();
  const router = useRouter();
  const decoded = decodeURIComponent(courseName as string);

  const [form, setForm] = useState<QuestionForm>({
    question: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_ans: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.question || !form.option_a || !form.option_b || !form.option_c || !form.option_d || !form.correct_ans) {
      setError('All fields are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/pretest/${encodeURIComponent(decoded)}/questions`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(form),
        }
      );
      if (res.ok) {
        router.push(`/dashboard/student-management/pretest/${courseName}/pre-test`);
      } else {
        setError('Failed to add question. Try again.');
      }
    } catch {
      setError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <button onClick={() => router.back()} className="text-sm text-blue-600 hover:underline mb-2 block">
          ← Back to Questions
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Add New Question</h1>
        <p className="text-sm text-gray-500 mt-1">Course: <span className="font-medium text-blue-600">{decoded}</span></p>
      </div>

      <div className="bg-white rounded-xl shadow border border-gray-200 p-6 space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Question <span className="text-red-500">*</span></label>
          <textarea
            name="question"
            value={form.question}
            onChange={handleChange}
            rows={3}
            placeholder="Enter your question here..."
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {(['a', 'b', 'c', 'd'] as const).map((opt) => (
          <div key={opt}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Option {opt.toUpperCase()} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name={`option_${opt}`}
              value={form[`option_${opt}` as keyof QuestionForm]}
              onChange={handleChange}
              placeholder={`Enter option ${opt.toUpperCase()}`}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Correct Answer <span className="text-red-500">*</span></label>
          <div className="flex gap-3">
            {(['A', 'B', 'C', 'D'] as const).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setForm({ ...form, correct_ans: opt })}
                className={`w-12 h-12 rounded-full font-bold text-sm border-2 transition-all ${
                  form.correct_ans === opt
                    ? 'bg-green-500 text-white border-green-500'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-green-400'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={() => router.back()} className="px-6 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 text-sm">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Question'}
          </button>
        </div>
      </div>
    </div>
  );
}