'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function PretestConfigPage() {
  const { courseName } = useParams();
  const router = useRouter();
  const decoded = decodeURIComponent(courseName as string);

  const [form, setForm] = useState({ total_qs: 20, pass_percent: 60, time_limit: 1200 });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => { fetchConfig(); }, [courseName]);

  const fetchConfig = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/pretest/${encodeURIComponent(decoded)}/config`,
        { credentials: 'include' }
      );
      const data = await res.json();
      if (data.config) setForm(data.config);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setSuccess('');
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/pretest/${encodeURIComponent(decoded)}/config`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(form),
        }
      );
      setSuccess('Config saved successfully!');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <div className="mb-6">
        <button onClick={() => router.push(`/dashboard/student-management/pretest/${courseName}/pre-test`)} className="text-sm text-blue-600 hover:underline mb-2 block">
          ← Back to Questions
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Pretest Config</h1>
        <p className="text-sm text-gray-500 mt-1">Course: <span className="font-medium text-blue-600">{decoded}</span></p>
      </div>

      <div className="bg-white rounded-xl shadow border border-gray-200 p-6 space-y-5">
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">✅ {success}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Total Questions</label>
          <input type="number" value={form.total_qs}
            onChange={(e) => setForm({ ...form, total_qs: Number(e.target.value) })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pass Percentage (%)</label>
          <input type="number" value={form.pass_percent}
            onChange={(e) => setForm({ ...form, pass_percent: Number(e.target.value) })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-400 mt-1">e.g. 60 means student needs 60% to pass</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Time Limit (seconds)</label>
          <input type="number" value={form.time_limit}
            onChange={(e) => setForm({ ...form, time_limit: Number(e.target.value) })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-400 mt-1">1200 = 20 minutes</p>
        </div>

        <div className="flex justify-end pt-2">
          <button onClick={handleSubmit} disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Config'}
          </button>
        </div>
      </div>
    </div>
  );
}
