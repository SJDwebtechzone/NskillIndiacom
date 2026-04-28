"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { Briefcase, Search, Mail, Calendar, Hash, Shield, Users, Eye, Key, X, Copy, CheckCircle2, BookOpen } from "lucide-react";

interface StaffMember {
  id: number;
  name: string;
  email: string;
  role_name: string;
  phone_number: string;
  dob: string;
  created_at: string;
}

interface Course {
  id: number;
  title: string;
  trainer_id: number | null;
}

const API = `${process.env.NEXT_PUBLIC_API_URL}/api/users`;

function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function fmtDate(d: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function initials(name: string) {
  return (name || "?").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

export default function StaffPage() {
  const { can } = useAuth();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "", phone_number: "", dob: "", email: "", password: "", role_id: 1,
  });
  const [saving, setSaving] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetCreds, setResetCreds] = useState<{username: string, password: string} | null>(null);
  const [resetting, setResetting] = useState(false);

  // ── Assign Courses Modal ──────────────────────────────
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [assigningCourses, setAssigningCourses] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}?role=trainer`, { headers: getAuthHeaders() });
      const json = await res.json();
      setStaff(json.data || []);
    } catch {
      showToast("❌ Failed to load Staff / Trainees");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Fetch all courses ─────────────────────────────────
  const fetchCourses = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/courses/all`,
        { headers: getAuthHeaders() }
      );
      const data = await res.json();
      setAllCourses(data.courses || []);
    } catch {
      showToast("❌ Failed to load courses");
    }
  };

  // ── Open assign modal ─────────────────────────────────
  const openAssignModal = async (member: StaffMember) => {
    setSelectedStaff(member);
    await fetchCourses();
    setShowAssignModal(true);
  };

  // ── Toggle course assignment ──────────────────────────
  const toggleCourse = async (courseId: number, currentTrainerId: number | null) => {
    if (!selectedStaff) return;
    setAssigningCourses(true);
    try {
      // If already assigned to this trainer → unassign, else assign
      const newTrainerId = currentTrainerId === selectedStaff.id ? null : selectedStaff.id;
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/courses/${courseId}/assign-trainer`,
        {
          method: 'PUT',
          headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
          body: JSON.stringify({ trainer_id: newTrainerId }),
        }
      );
      if (res.ok) {
        // Update local state
        setAllCourses(prev =>
          prev.map(c => c.id === courseId ? { ...c, trainer_id: newTrainerId } : c)
        );
        showToast(newTrainerId ? '✅ Course assigned' : '✅ Course unassigned');
      }
    } catch {
      showToast('❌ Failed to update assignment');
    } finally {
      setAssigningCourses(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, status: 'Active' }),
      });
      const json = await res.json();
      if (res.ok) {
        showToast("✅ Staff credential created successfully");
        setIsModalOpen(false);
        setFormData({ name: "", phone_number: "", dob: "", email: "", password: "", role_id: 1 });
        load();
      } else {
        showToast(`❌ ${json.message}`);
      }
    } catch {
      showToast("❌ Server error");
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedStaff) return;
    setResetting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/${selectedStaff.id}/reset-password`,
        { method: "PUT", headers: getAuthHeaders() }
      );
      const data = await res.json();
      if (res.ok) {
        setResetCreds({ username: selectedStaff.email, password: data.plainPassword });
        showToast("✅ Password reset successfully");
      } else {
        showToast(`❌ ${data.message || "Reset failed"}`);
      }
    } catch {
      showToast("❌ Server error");
    } finally {
      setResetting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast("📋 Copied to clipboard");
  };

  if (!can("Staff / Trainee", "view")) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <div className="text-5xl">⛔</div>
        <h2 className="text-xl font-black text-slate-800">Access Denied</h2>
        <p className="text-slate-400 font-bold text-sm">You don't have permission to view Staff / Trainees.</p>
      </div>
    );
  }

  const filtered = staff.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        .staff-card { background: #fff; border-radius: 20px; padding: 24px; border: 1.5px solid #f1f5f9; transition: all 0.3s; animation: fadeUp 0.4s ease both; }
        .staff-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.06); }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 100; animation: fadeIn 0.3s ease; }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes modalUp { from{opacity:0;transform:translateY(20px) scale(0.95)} to{opacity:1;transform:none} }
        .animate-up { animation: modalUp 0.3s ease both; }
      `}</style>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-purple-600" />
            </div>
            Staff / Trainer
          </h1>
          <p className="text-slate-500 font-medium mt-1">View and manage all staff members and trainers.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-purple-600/20 active:scale-95 transition-all"
          >
            + Create New Staff
          </button>
          <div className="bg-purple-50 text-purple-700 px-4 py-2 rounded-xl font-bold text-sm border border-purple-100">
           {staff.length} Total Trainers
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all placeholder:text-slate-300"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <p className="text-purple-500 font-bold animate-pulse">Loading staff...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
          {filtered.map((member, i) => (
            <div key={member.id} className="staff-card group" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center text-white text-sm font-black shadow-lg shadow-purple-500/20">
                  {initials(member.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-800 truncate">{member.name}</h3>
                  <p className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                    <Mail className="w-3 h-3" />
                    <span className="truncate">{member.email}</span>
                  </p>
                </div>
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => { setSelectedStaff(member); setShowViewModal(true); }}
                    className="p-1.5 bg-slate-50 text-slate-400 hover:text-purple-600 rounded-lg border border-slate-100 transition-colors"
                    title="View Details"
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    onClick={() => { setSelectedStaff(member); setShowResetModal(true); setResetCreds(null); }}
                    className="p-1.5 bg-slate-50 text-slate-400 hover:text-amber-600 rounded-lg border border-slate-100 transition-colors"
                    title="Reset Password"
                  >
                    <Key size={14} />
                  </button>
                  <button
                    onClick={() => openAssignModal(member)}
                    className="p-1.5 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-lg border border-slate-100 transition-colors"
                    title="Assign Courses"
                  >
                    <BookOpen size={14} />
                  </button>
                </div>
              </div>

              <div className="pt-3 mt-2 flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1 text-[10px] font-bold bg-purple-50 text-purple-600 px-2 py-1 rounded-lg uppercase tracking-widest">
                  <Shield className="w-3 h-3" />
                  {member.role_name || "TRAINER"}
                </span>
                {member.phone_number && (
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                    {member.phone_number}
                  </span>
                )}
              </div>

              {/* Assign Courses button always visible */}
              <div className="mt-4 pt-3 border-t border-slate-50">
                <button
                  onClick={() => openAssignModal(member)}
                  className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <BookOpen size={12} />
                  Assign Courses
                </button>
              </div>

              <div className="flex justify-between items-center mt-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {fmtDate(member.created_at)}
                </span>
                <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-lg flex items-center gap-1">
                  <Hash className="w-3 h-3" />
                  {member.id}
                </span>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full border-2 border-dashed border-slate-200 rounded-3xl p-20 text-center">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-400 font-bold">
                {search ? "No staff match your search." : "No staff / trainers found."}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Assign Courses Modal ── */}
      {showAssignModal && selectedStaff && (
        <div className="modal-overlay">
          <div className="bg-white p-8 rounded-[32px] w-full max-w-md shadow-2xl relative animate-up">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <BookOpen size={20} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-800">Assign Courses</h2>
                  <p className="text-xs text-slate-400 font-bold">{selectedStaff.name}</p>
                </div>
              </div>
              <button onClick={() => setShowAssignModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {allCourses.length === 0 ? (
                <p className="text-center text-slate-400 py-8 font-bold text-sm">No courses found</p>
              ) : (
                allCourses.map(course => {
                  const isAssignedToThis = course.trainer_id === selectedStaff.id;
                  const isAssignedToOther = course.trainer_id !== null && course.trainer_id !== selectedStaff.id;
                  const otherTrainer = isAssignedToOther
                    ? staff.find(s => s.id === course.trainer_id)
                    : null;

                  return (
                    <div
                      key={course.id}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                        isAssignedToThis
                          ? 'bg-blue-50 border-blue-200'
                          : isAssignedToOther
                          ? 'bg-slate-50 border-slate-200 opacity-60'
                          : 'bg-white border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{course.title}</p>
                        {isAssignedToThis && (
                          <p className="text-[10px] text-blue-500 font-bold mt-0.5">✅ Assigned to you</p>
                        )}
                        {isAssignedToOther && otherTrainer && (
                          <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                            Assigned to {otherTrainer.name}
                          </p>
                        )}
                        {!course.trainer_id && (
                          <p className="text-[10px] text-slate-400 font-bold mt-0.5">Not assigned</p>
                        )}
                      </div>
                      <button
                        disabled={isAssignedToOther || assigningCourses}
                        onClick={() => toggleCourse(course.id, course.trainer_id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          isAssignedToThis
                            ? 'bg-red-100 text-red-600 hover:bg-red-200'
                            : isAssignedToOther
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {isAssignedToThis ? 'Unassign' : isAssignedToOther ? 'Taken' : 'Assign'}
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <button
              onClick={() => setShowAssignModal(false)}
              className="w-full mt-6 py-3 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showViewModal && selectedStaff && (
        <div className="modal-overlay">
          <div className="bg-white p-8 rounded-[32px] w-full max-w-md shadow-2xl relative animate-up">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Shield size={20} className="text-purple-600" />
                </div>
                <h2 className="text-xl font-black text-slate-800">Account Details</h2>
              </div>
              <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400"><X size={20} /></button>
            </div>
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center text-white text-xl font-black">
                  {initials(selectedStaff.name)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{selectedStaff.name}</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{selectedStaff.role_name || "TRAINER"}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl relative group">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email / Username</p>
                  <p className="text-sm font-bold text-slate-800">{selectedStaff.email}</p>
                  <button onClick={() => copyToClipboard(selectedStaff.email)} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-white rounded-lg opacity-0 group-hover:opacity-100 transition-all text-slate-400 hover:text-purple-600">
                    <Copy size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Phone</p>
                    <p className="text-sm font-bold text-slate-800">{selectedStaff.phone_number || "—"}</p>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Created At</p>
                    <p className="text-sm font-bold text-slate-800">{fmtDate(selectedStaff.created_at)}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => { setShowViewModal(false); setShowResetModal(true); setResetCreds(null); }}
                className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <Key size={14} /> Reset Academic Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetModal && selectedStaff && (
        <div className="modal-overlay">
          <div className="bg-white p-8 rounded-[32px] w-full max-w-md shadow-2xl relative animate-up">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Key size={20} className="text-amber-600" />
                </div>
                <h2 className="text-xl font-black text-slate-800">Reset Credentials</h2>
              </div>
              <button onClick={() => setShowResetModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400"><X size={20} /></button>
            </div>
            {!resetCreds ? (
              <div className="space-y-6">
                <p className="text-sm font-medium text-slate-500 leading-relaxed">
                  This will generate a new <span className="text-slate-900 font-bold">one-time password</span> for
                  <span className="text-slate-900 font-bold"> {selectedStaff.name}</span>.
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setShowResetModal(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all">Cancel</button>
                  <button onClick={handleResetPassword} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-amber-500/20">
                    {resetting ? "Wait..." : "Generate"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-emerald-50 rounded-[24px] p-6 border-2 border-emerald-100 flex flex-col items-center text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
                  <h3 className="text-lg font-black text-slate-800">New Credentials</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Share these with the user</p>
                </div>
                <div className="space-y-3">
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl relative">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Username / Email</p>
                    <p className="text-sm font-bold text-slate-800">{resetCreds.username}</p>
                    <button onClick={() => copyToClipboard(resetCreds.username)} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-purple-600"><Copy size={16} /></button>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl relative">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">New Password</p>
                    <p className="text-sm font-mono font-black text-slate-800">{resetCreds.password}</p>
                    <button onClick={() => copyToClipboard(resetCreds.password)} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-amber-600"><Copy size={16} /></button>
                  </div>
                </div>
                <button onClick={() => setShowResetModal(false)} className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl">Done & Close</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Staff Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="bg-white p-8 rounded-[32px] w-full max-w-lg shadow-2xl relative animate-up">
            <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users size={18} className="text-purple-600" />
              </div>
              Create Staff Credentials
            </h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="John Doe" className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl font-bold text-sm outline-none focus:border-purple-500 transition-all text-black" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                  <input type="text" required value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})} placeholder="9123456780" className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl font-bold text-sm outline-none focus:border-purple-500 transition-all text-black" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">DOB</label>
                  <input type="date" required value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl font-bold text-sm outline-none focus:border-purple-500 transition-all text-black" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Role</label>
                  <select value={formData.role_id} onChange={e => setFormData({...formData, role_id: parseInt(e.target.value)})} className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl font-bold text-sm outline-none focus:border-purple-500 transition-all text-black">
                    <option value={1}>Trainer</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email / Username</label>
                <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="name@nskill.in" className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl font-bold text-sm outline-none focus:border-purple-500 transition-all text-black" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Set Password</label>
                <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="••••••••" className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl font-bold text-sm outline-none focus:border-purple-500 transition-all text-black" />
              </div>
              <div className="flex gap-3 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-purple-600/20 active:scale-95 transition-all disabled:opacity-50">
                  {saving ? "Saving..." : "Create Credential"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-8 right-8 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl font-bold text-sm animate-in slide-in-from-right duration-300 z-[200]">
          {toast}
        </div>
      )}
    </div>
  );
}