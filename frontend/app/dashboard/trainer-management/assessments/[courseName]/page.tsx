'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Assessment {
  id: number;
  title: string;
  description: string;
  due_date: string;
  course_name: string;
  created_at: string;
}

export default function TrainerCoursAssessmentsPage() {
  const { courseName } = useParams();
  const router = useRouter();
  const decoded = decodeURIComponent(courseName as string);

  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Assessment | null>(null);
  const [form, setForm] = useState({ title: '', description: '', due_date: '' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  useEffect(() => { fetchAssessments(); }, [courseName]);

  const fetchAssessments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/assessments/trainer/${encodeURIComponent(decoded)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setAssessments(data.assessments || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const openCreate = () => {
    setEditItem(null);
    setForm({ title: '', description: '', due_date: '' });
    setShowModal(true);
  };

  const openEdit = (a: Assessment) => {
    setEditItem(a);
    setForm({ title: a.title, description: a.description || '', due_date: a.due_date.split('T')[0] });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const url = editItem
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/assessments/trainer/${editItem.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/assessments/trainer/${encodeURIComponent(decoded)}`;
      const method = editItem ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed');
      showToast(editItem ? '✅ Assessment updated' : '✅ Assessment created');
      setShowModal(false);
      fetchAssessments();
    } catch { showToast('❌ Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this assessment?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/assessments/trainer/${id}`,
        { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
      );
      showToast('✅ Deleted');
      fetchAssessments();
    } catch { showToast('❌ Failed to delete'); }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <button onClick={() => router.push('/dashboard/trainer-management/assessments')} className="text-sm text-indigo-600 hover:underline mb-1 block">← Back to Courses</button>
          <h1 className="text-2xl font-bold text-gray-800">Assessments</h1>
          <p className="text-gray-500 text-sm mt-1">Course: <span className="font-medium text-indigo-600">{decoded}</span></p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
        >
          + Create Assessment
        </button>
      </div>

      {assessments.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-gray-400 text-lg">No assessments created yet.</p>
          <button onClick={openCreate} className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm">+ Create First Assessment</button>
        </div>
      ) : (
        <div className="space-y-4">
          {assessments.map((a) => (
            <div key={a.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-lg">{a.title}</h3>
                  {a.description && <p className="text-gray-500 text-sm mt-1">{a.description}</p>}
                  <div className="flex items-center gap-4 mt-3">
                    <span className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full font-medium">
                      📅 Due: {new Date(a.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="text-xs text-gray-400">
                      Created: {new Date(a.created_at).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => router.push(`/dashboard/trainer-management/assessments/${courseName}/${a.id}/submissions`)}
                    className="px-3 py-1.5 bg-green-50 text-green-600 border border-green-200 rounded-lg text-xs font-bold hover:bg-green-100"
                  >
                    👁️ Submissions
                  </button>
                  <button
                    onClick={() => openEdit(a)}
                    className="px-3 py-1.5 bg-yellow-50 text-yellow-600 border border-yellow-200 rounded-lg text-xs font-bold hover:bg-yellow-100"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-bold hover:bg-red-100"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              {editItem ? 'Edit Assessment' : 'Create Assessment'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Assessment Title *</label>
                <input
                  required type="text" value={form.title}
                  onChange={e => setForm({...form, title: e.target.value})}
                  placeholder="e.g. Unit 1 Assignment"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400 text-gray-800"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Description</label>
                <textarea
                  rows={3} value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                  placeholder="Optional description or instructions..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400 text-gray-800 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Due Date *</label>
                <input
                  required type="date" value={form.due_date}
                  onChange={e => setForm({...form, due_date: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400 text-gray-800"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-600 font-bold text-sm hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-bold text-sm rounded-xl">
                  {saving ? 'Saving...' : editItem ? '💾 Update' : '+ Create'}
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