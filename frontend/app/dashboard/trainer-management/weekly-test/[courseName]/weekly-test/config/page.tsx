'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function TrainerPostTestConfigPage() {
  const { courseName } = useParams();
  const router = useRouter();
  const decoded = decodeURIComponent(courseName as string);
  const [form, setForm] = useState({ total_qs: 10, pass_percent: 50, time_limit: 600 });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/posttest/${encodeURIComponent(decoded)}/config`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data.config) setForm({ total_qs: data.config.total_qs, pass_percent: data.config.pass_percent, time_limit: data.config.time_limit });
      } catch (err) { console.error(err); }
    };
    fetchConfig();
  }, [courseName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/posttest/${encodeURIComponent(decoded)}/config`,
        { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(form) }
      );
      if (!res.ok) throw new Error('Failed');
      showToast('✅ Config saved');
      setTimeout(() => router.push(`/dashboard/trainer-management/weekly-test/${courseName}/weekly-test`), 1000);
    } catch { showToast('❌ Failed to save'); }
    finally { setSaving(false); }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <button onClick={() => router.push(`/dashboard/trainer-management/weekly-test/${courseName}/weekly-test`)} className="text-sm text-purple-600 hover:underline mb-4 block">← Back to Questions</button>
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Weekly-Test Config</h1>
      <p className="text-gray-500 text-sm mb-6">Course: <span className="font-medium text-purple-600">{decoded}</span></p>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Questions</label>
          <input type="number" min={1} value={form.total_qs} onChange={e => setForm({...form, total_qs: parseInt(e.target.value)})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-400 text-gray-800" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Pass Percentage (%)</label>
          <input type="number" min={1} max={100} value={form.pass_percent} onChange={e => setForm({...form, pass_percent: parseInt(e.target.value)})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-400 text-gray-800" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Time Limit (seconds)</label>
          <input type="number" min={60} value={form.time_limit} onChange={e => setForm({...form, time_limit: parseInt(e.target.value)})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-400 text-gray-800" />
          <p className="text-xs text-gray-400 mt-1">= {Math.round(form.time_limit / 60)} minutes</p>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => router.push(`/dashboard/trainer-management/weekly-test/${courseName}/weekly-test`)} className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-600 font-bold text-sm hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={saving} className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white font-bold text-sm rounded-xl">
            {saving ? 'Saving...' : '💾 Save Config'}
          </button>
        </div>
      </form>
      {toast && <div className="fixed bottom-8 right-8 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl font-bold text-sm z-50">{toast}</div>}
    </div>
  );
}