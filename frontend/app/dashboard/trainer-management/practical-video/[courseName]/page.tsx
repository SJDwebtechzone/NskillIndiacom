'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Task {
  id: number;
  title: string;
  description: string;
  course_name: string;
  created_at: string;
}

export default function TrainerPracticalCoursePage() {
  const { courseName } = useParams();
  const router = useRouter();
  const decoded = decodeURIComponent(courseName as string);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Task | null>(null);
  const [form, setForm] = useState({ title: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  useEffect(() => { fetchTasks(); }, [courseName]);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/practical/trainer/${encodeURIComponent(decoded)}/tasks`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setTasks(data.tasks || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const openCreate = () => {
    setEditItem(null);
    setForm({ title: '', description: '' });
    setShowModal(true);
  };

  const openEdit = (t: Task) => {
    setEditItem(t);
    setForm({ title: t.title, description: t.description || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const url = editItem
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/practical/trainer/tasks/${editItem.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/practical/trainer/${encodeURIComponent(decoded)}/tasks`;
      const method = editItem ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      showToast(editItem ? '✅ Task updated' : '✅ Task created');
      setShowModal(false);
      fetchTasks();
    } catch (err: any) {
      showToast(`❌ ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this task?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/practical/trainer/tasks/${id}`,
        { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
      );
      showToast('✅ Deleted');
      fetchTasks();
    } catch { showToast('❌ Failed to delete'); }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600" />
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <button onClick={() => router.push('/dashboard/trainer-management/practical-video')} className="text-sm text-orange-600 hover:underline mb-1 block">← Back to Courses</button>
          <h1 className="text-2xl font-bold text-gray-800">Practical Video Tasks</h1>
          <p className="text-gray-500 text-sm mt-1">
            Course: <span className="font-medium text-orange-600">{decoded}</span>
            <span className="ml-3 text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded-full">
              {tasks.length}/4 tasks
            </span>
          </p>
        </div>
        <button
          onClick={openCreate}
          disabled={tasks.length >= 4}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tasks.length >= 4
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-orange-600 text-white hover:bg-orange-700'
          }`}
        >
          {tasks.length >= 4 ? 'Max 4 Tasks Reached' : '+ Create Task'}
        </button>
      </div>

      {/* Max marks info */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 flex gap-8">
        <div>
          <p className="text-xs text-gray-500">Total Tasks</p>
          <p className="text-lg font-bold text-orange-600">{tasks.length} / 4</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Marks Per Task</p>
          <p className="text-lg font-bold text-orange-600">10</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Total Marks</p>
          <p className="text-lg font-bold text-orange-600">40</p>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <div className="text-5xl mb-4">🎥</div>
          <p className="text-gray-400 text-lg">No tasks created yet.</p>
          <button onClick={openCreate} className="mt-4 px-6 py-2 bg-orange-600 text-white rounded-lg text-sm">
            + Create First Task
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((t, index) => (
            <div key={t.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-4 flex-1">
                  <div className="bg-orange-100 text-orange-600 rounded-xl w-10 h-10 flex items-center justify-center font-black text-lg flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-lg">{t.title}</h3>
                    {t.description && <p className="text-gray-500 text-sm mt-1">{t.description}</p>}
                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-xs bg-orange-50 text-orange-600 px-3 py-1 rounded-full font-medium">
                        🏆 10 marks
                      </span>
                      <span className="text-xs text-gray-400">
                        Created: {new Date(t.created_at).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => router.push(`/dashboard/trainer-management/practical-video/${courseName}/${t.id}/submissions`)}
                    className="px-3 py-1.5 bg-green-50 text-green-600 border border-green-200 rounded-lg text-xs font-bold hover:bg-green-100"
                  >
                    👁️ Submissions
                  </button>
                  <button
                    onClick={() => openEdit(t)}
                    className="px-3 py-1.5 bg-yellow-50 text-yellow-600 border border-yellow-200 rounded-lg text-xs font-bold hover:bg-yellow-100"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
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
              {editItem ? 'Edit Task' : 'Create Practical Task'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Task Title *</label>
                <input
                  required type="text" value={form.title}
                  onChange={e => setForm({...form, title: e.target.value})}
                  placeholder="e.g. Install AC Unit"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400 text-gray-800"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Instructions</label>
                <textarea
                  rows={3} value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                  placeholder="Optional instructions for students..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400 text-gray-800 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-600 font-bold text-sm hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white font-bold text-sm rounded-xl">
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