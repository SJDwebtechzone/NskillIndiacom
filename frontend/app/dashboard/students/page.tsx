"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { GraduationCap, Search, Mail, Calendar, Hash, Plus, X, Copy, CheckCircle2, UserPlus, Phone, BookOpen, Eye, Pencil, Key, Trash2, ShieldCheck, AlertCircle, ChevronDown } from "lucide-react";

interface Student {
  id: number;
  name: string;
  email: string;
  role_name: string;
  status: string;
  created_at: string;
}

interface Admission {
  id: number;
  full_name: string;
  email_id: string;
  mobile_number: string;
  course_interested: string;
  has_credential?: boolean;
}

const API_USERS = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/users`;
const API_ADMISSIONS = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/admissions`;

function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
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

export default function StudentsPage() {
  const { can, user: currentUser } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Data States
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [loadingAdmissions, setLoadingAdmissions] = useState(false);
  const [selectedAdmId, setSelectedAdmId] = useState<string>("");
  const [generating, setGenerating] = useState(false);
  const [createdCreds, setCreatedCreds] = useState<{username: string, password: string} | null>(null);

  // Edit Form State
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editStatus, setEditStatus] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_USERS}?role=student`, { headers: getAuthHeaders() });
      const json = await res.json();
      setStudents(json.data || []);
    } catch {
      showToast("❌ Failed to load students");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const loadAdmissions = async () => {
    setLoadingAdmissions(true);
    try {
      const res = await fetch(`${API_ADMISSIONS}/no-credential`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (res.ok) setAdmissions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAdmissions(false);
    }
  };

  useEffect(() => {
    if (showAddModal) {
      loadAdmissions();
      setCreatedCreds(null);
      setSelectedAdmId("");
    }
  }, [showAddModal]);

  const handleCreateCredentials = async () => {
    if (!selectedAdmId) return;
    setGenerating(true);
    try {
      const res = await fetch(`${API_USERS}/from-admission`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ admission_id: selectedAdmId }),
      });
      const data = await res.json();
      if (res.ok) {
        setCreatedCreds(data.credentials);
        showToast("✅ Credentials generated successfully");
        load();
      } else {
        showToast(`❌ ${data.message || "Failed to generate"}`);
      }
    } catch (err) {
      showToast("❌ Server error");
    } finally {
      setGenerating(false);
    }
  };

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setEditName(student.name);
    setEditEmail(student.email);
    setEditStatus(student.status);
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (!selectedStudent) return;
    setGenerating(true);
    try {
      const res = await fetch(`${API_USERS}/${selectedStudent.id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: editName,
          email: editEmail,
          status: editStatus,
          role_id: 6 // Assuming 6 is Student based on earlier setup
        }),
      });
      if (res.ok) {
        showToast("✅ Student updated successfully");
        setShowEditModal(false);
        load();
      } else {
        const data = await res.json();
        showToast(`❌ ${data.message || "Update failed"}`);
      }
    } catch {
        showToast("❌ Server error");
    } finally {
        setGenerating(false);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedStudent) return;
    setGenerating(true);
    try {
      const res = await fetch(`${API_USERS}/${selectedStudent.id}/reset-password`, {
        method: "PUT",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (res.ok) {
        setCreatedCreds({ username: selectedStudent.email, password: data.plainPassword });
        showToast("✅ Password reset successfully");
      } else {
        showToast(`❌ ${data.message || "Reset failed"}`);
      }
    } catch {
        showToast("❌ Server error");
    } finally {
        setGenerating(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedStudent) return;
    setGenerating(true);
    try {
      const res = await fetch(`${API_USERS}/${selectedStudent.id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        showToast("✅ Student deleted successfully");
        setShowDeleteModal(false);
        load();
      } else {
        showToast("❌ Delete failed");
      }
    } catch {
        showToast("❌ Server error");
    } finally {
        setGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast("📋 Copied to clipboard");
  };

  if (!can("Students", "view")) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: 12 }}>
        <div style={{ fontSize: 48 }}>⛔</div>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#1e293b" }}>Access Denied</h2>
        <p style={{ color: "#94a3b8", fontSize: "0.84rem" }}>You don&apos;t have permission to view Students.</p>
      </div>
    );
  }

  const filtered = students.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
        .animate-fade-in { animation: fadeIn 0.4s ease both; }
        .table-row-hover:hover { background-color: #f8fafc; }
        .action-btn { transition: all 0.2s; border: 1px solid #e2e8f0; }
        .action-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
      `}</style>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-emerald-600" />
            </div>
            Students
          </h1>
          <p className="text-slate-500 font-medium mt-1">View and manage all registered students.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl font-bold text-sm border border-emerald-100">
            {students.length} Total Students
          </div>
          {can("Students", "add") && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Add Student
            </button>
          )}
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
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-400 transition-all placeholder:text-slate-300"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Student</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hidden md:table-cell">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hidden lg:table-cell">Registered</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                   <td colSpan={4} className="px-6 py-20 text-center">
                      <p className="text-emerald-500 font-bold animate-pulse">Loading students...</p>
                   </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <GraduationCap className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold">No students found.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((student) => (
                  <tr key={student.id} className="table-row-hover transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 text-xs font-black">
                          {initials(student.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 truncate">{student.name}</p>
                          <p className="text-xs text-slate-400 font-medium truncate">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                        student.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <p className="text-xs font-bold text-slate-500">{fmtDate(student.created_at)}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => { setSelectedStudent(student); setShowViewModal(true); }}
                          show-tip="View"
                          className="action-btn p-2 bg-white text-slate-400 hover:text-emerald-600 rounded-xl cursor-alias"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEdit(student)}
                          className="action-btn p-2 bg-white text-slate-400 hover:text-blue-600 rounded-xl"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => { setSelectedStudent(student); setShowResetModal(true); setCreatedCreds(null); }}
                          className="action-btn p-2 bg-white text-slate-400 hover:text-amber-600 rounded-xl"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => { setSelectedStudent(student); setShowDeleteModal(true); }}
                          className="action-btn p-2 bg-white text-slate-400 hover:text-red-600 rounded-xl"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                    <UserPlus className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-800">Add New Student</h2>
                    <p className="text-sm text-slate-500 font-medium">Generate login credentials</p>
                  </div>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {!createdCreds ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Select Admission Record</label>
                    <div className="relative">
                      <select
                        value={selectedAdmId}
                        onChange={(e) => setSelectedAdmId(e.target.value)}
                        className="w-full p-4 pr-12 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 focus:bg-white transition-all appearance-none cursor-pointer"
                      >
                        <option value="">Choose a student from admissions...</option>
                        {admissions.map(adm => (
                          <option key={adm.id} value={adm.id}>
                            {adm.full_name} ({adm.email_id}) {adm.has_credential ? "• Credentials Exist" : "⏳ Pending"}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                    </div>
                    {loadingAdmissions && <p className="text-xs text-emerald-600 font-bold animate-pulse mt-2 ml-1">Loading admissions...</p>}
                    {!loadingAdmissions && admissions.length === 0 && <p className="text-xs text-amber-600 font-bold mt-2 ml-1 flex items-center gap-1"> <AlertCircle className="w-3 h-3" /> No admissions found. </p>}
                    {selectedAdmId && admissions.find(adm => String(adm.id) === selectedAdmId)?.has_credential && (
                      <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mt-3">
                        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                        <p className="text-xs text-amber-700 font-bold">
                          Warning: Credentials already exist for this email. Generating again will overwrite their password.
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    disabled={!selectedAdmId || generating}
                    onClick={handleCreateCredentials}
                    className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {generating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Generate One-Time Credentials"}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                   <div className="bg-emerald-50 rounded-[24px] p-6 border-2 border-emerald-100 flex flex-col items-center text-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
                    <h3 className="text-lg font-black text-slate-800">Credentials Ready!</h3>
                    <p className="text-sm text-slate-500 font-medium">Please share these details with the student.</p>
                  </div>
                  <div className="space-y-3">
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl relative">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Username</p>
                      <p className="text-sm font-bold text-slate-800">{createdCreds.username}</p>
                      <Copy className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 cursor-pointer hover:text-emerald-500" onClick={() => copyToClipboard(createdCreds.username)} />
                    </div>
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl relative">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">One-Time Password</p>
                      <p className="text-sm font-bold text-slate-800">{createdCreds.password}</p>
                      <Copy className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 cursor-pointer hover:text-emerald-500" onClick={() => copyToClipboard(createdCreds.password)} />
                    </div>
                  </div>
                  <button onClick={() => setShowAddModal(false)} className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm transition-all">Done</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowViewModal(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-800">Student Account</h2>
                    <p className="text-sm text-slate-500 font-medium">Quick detail view</p>
                  </div>
                </div>
                <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400"> <X className="w-5 h-5" /> </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-[28px] border border-slate-100">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-emerald-500/20">
                    {initials(selectedStudent.name)}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-800">{selectedStudent.name}</h3>
                    <p className="text-sm text-slate-400 font-bold mb-2">{selectedStudent.email}</p>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-lg">Student Account</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Status</p>
                      <p className="text-sm font-black text-emerald-600">{selectedStudent.status}</p>
                   </div>
                   <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Member Since</p>
                      <p className="text-sm font-black text-slate-700">{fmtDate(selectedStudent.created_at)}</p>
                   </div>
                </div>
              </div>
              <button 
                onClick={() => setShowViewModal(false)}
                className="w-full mt-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-black transition-all"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowEditModal(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-slate-800">Edit Student</h2>
                <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400"> <X className="w-5 h-5" /> </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-500 uppercase ml-1">Full Name</label>
                  <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-500 uppercase ml-1">Email Address</label>
                  <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-500 uppercase ml-1">Status</label>
                  <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 appearance-none">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <button 
                disabled={generating}
                onClick={handleUpdate}
                className="w-full mt-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-blue-600/20"
              >
                {generating ? "Updating..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowResetModal(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in slide-in-from-top-4 duration-300">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                   <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center">
                    <Key className="w-6 h-6 text-amber-600" />
                  </div>
                  <h2 className="text-xl font-black text-slate-800">Reset Password</h2>
                </div>
                <button onClick={() => setShowResetModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400"> <X className="w-5 h-5" /> </button>
              </div>

              {!createdCreds ? (
                <div className="space-y-6">
                  <p className="text-sm font-medium text-slate-500">Are you sure you want to generate a new one-time password for <span className="text-slate-800 font-bold">{selectedStudent.name}</span>?</p>
                  <button 
                    disabled={generating}
                    onClick={handleResetPassword}
                    className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black text-sm transition-all"
                  >
                    {generating ? "Generating..." : "Generate New Password"}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                   <div className="bg-amber-50 rounded-[24px] p-6 border-2 border-amber-100 flex flex-col items-center text-center">
                    <CheckCircle2 className="w-8 h-8 text-amber-500 mb-2" />
                    <h3 className="text-lg font-black text-slate-800">New Password Ready!</h3>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl relative">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">New One-Time Password</p>
                    <p className="text-sm font-bold text-slate-800">{createdCreds.password}</p>
                    <Copy className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 cursor-pointer hover:text-emerald-500" onClick={() => copyToClipboard(createdCreds.password)} />
                  </div>
                  <button onClick={() => setShowResetModal(false)} className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-sm transition-all font-bold">Close</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-center">
            <div className="p-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-black text-slate-800 mb-2">Delete Student?</h2>
              <p className="text-sm text-slate-500 font-medium mb-8">This action cannot be undone. Account for <span className="font-bold text-slate-700">{selectedStudent.name}</span> will be removed.</p>
              
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black text-sm transition-all">Cancel</button>
                <button 
                  disabled={generating}
                  onClick={handleDelete}
                  className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-red-600/20"
                >
                  {generating ? "..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-8 right-8 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl font-bold text-sm animate-in slide-in-from-right duration-300 z-[100]">
          {toast}
        </div>
      )}
    </div>
  );
}
