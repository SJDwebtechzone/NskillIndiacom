"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/app/lib/axiosInstance";
import { useAuth } from "@/app/context/AuthContext";
import {
  Users, Search, Mail, Calendar, Hash, Shield, Plus,
  Trash2, Edit2, AlertTriangle, X
} from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  role_id?: number;
  status: string;
  created_at: string;
}

const API = `${process.env.NEXT_PUBLIC_API_URL}/api/users`;

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
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

const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  SUPER_ADMIN:  { bg: "#fee2e2", text: "#991b1b" },
  NTSC_ADMIN:   { bg: "#dbeafe", text: "#1d4ed8" },
  ASSOCIATE:    { bg: "#d1fae5", text: "#065f46" },
  STAFF:        { bg: "#ede9fe", text: "#5b21b6" },
  STUDENT:      { bg: "#fef3c7", text: "#92400e" },
};

export default function ManageUsersPage() {
  const { can } = useAuth();
  const [users, setUsers]   = useState<User[]>([]);
  const [rolesList, setRolesList] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]  = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [toast, setToast]   = useState("");

  // Modals state
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Edit fields
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRoleId, setEditRoleId] = useState<number>(0);
  const [editStatus, setEditStatus] = useState("Active");
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingUser, setDeletingUser] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(API);
      const json = res.data;
      setUsers(json.data || []);
    } catch {
      showToast("❌ Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadRoles = useCallback(async () => {
    try {
      const res = await api.get(`${process.env.NEXT_PUBLIC_API_URL}/api/roles`);
      const json = res.data;
      setRolesList(json.data || []);
    } catch (err) {
      console.error("Failed to load roles", err);
    }
  }, []);

  useEffect(() => {
    load();
    loadRoles();
  }, [load, loadRoles]);

  if (!can("Manage Users", "view")) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: 12 }}>
        <div style={{ fontSize: 48 }}>⛔</div>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#1e293b" }}>Access Denied</h2>
        <p style={{ color: "#94a3b8", fontSize: "0.84rem" }}>You don&apos;t have permission to manage users.</p>
      </div>
    );
  }

  // Gather actual role names for filters (e.g. STUDENT, ASSOCIATE, Admin)
  const roles = ["ALL", ...Array.from(new Set(users.map(u => u.role || (u as any).role_name).filter(Boolean)))];

  const filtered = users.filter(u => {
    const userRole = u.role || (u as any).role_name;
    const matchRole = roleFilter === "ALL" || userRole === roleFilter;
    const matchSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const rc = (role: string) => {
    const cleanRole = (role || "").toUpperCase().replace(/\s+/g, "_");
    return ROLE_COLORS[cleanRole] || { bg: "#f1f5f9", text: "#475569" };
  };

  const handleEditClick = (u: any) => {
    setSelectedUser(u);
    setEditName(u.name || "");
    setEditEmail(u.email || "");
    setEditRoleId(u.role_id || 0);
    setEditStatus(u.status || "Active");
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;
    if (!editName.trim() || !editEmail.trim()) {
      showToast("❌ Name and Email are required");
      return;
    }
    setSavingEdit(true);
    try {
      const res = await fetch(`${API}/${selectedUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          name: editName.trim(),
          email: editEmail.trim(),
          role_id: editRoleId,
          status: editStatus,
        }),
      });
      const data = await res.json();
      if (!(res.status >= 200 && res.status < 300)) throw new Error(data.message || "Failed to update user");
      showToast("✅ User updated successfully");
      setShowEditModal(false);
      load();
    } catch (err: any) {
      showToast(`❌ ${err.message}`);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteClick = (u: any) => {
    setSelectedUser(u);
    setShowDeleteModal(true);
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setDeletingUser(true);
    try {
      const res = await api.delete(`${API}/${selectedUser.id}`);
      const data = res.data;
      if (!(res.status >= 200 && res.status < 300)) throw new Error(data.message || "Failed to delete user");
      showToast("✅ User deleted successfully");
      setShowDeleteModal(false);
      load();
    } catch (err: any) {
      showToast(`❌ ${err.message}`);
    } finally {
      setDeletingUser(false);
    }
  };

  return (
    <div className="space-y-6">
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        .user-row { background: #fff; border-radius: 14px; padding: 16px 20px; border: 1.5px solid #f1f5f9; transition: all 0.25s; animation: fadeUp 0.35s ease both; display: flex; align-items: center; gap: 16px; }
        .user-row:hover { box-shadow: 0 8px 20px rgba(0,0,0,0.06); transform: translateY(-2px); }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 100; animation: fadeIn 0.3s ease; }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes modalUp { from{opacity:0;transform:translateY(20px) scale(0.95)} to{opacity:1;transform:none} }
        .animate-up { animation: modalUp 0.3s ease both; }
      `}</style>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            Manage Users
          </h1>
          <p className="text-slate-500 font-medium mt-1">View and manage all system users.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search users…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all placeholder:text-slate-300"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {roles.map(role => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              style={
                roleFilter === role
                  ? role === "ALL"
                    ? { background: "#2563eb", color: "white", borderColor: "#2563eb" }
                    : { background: rc(role).bg, color: rc(role).text, borderColor: "transparent" }
                  : {}
              }
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                roleFilter === role
                  ? "border-transparent"
                  : "bg-white text-slate-500 border-slate-200 hover:border-blue-300"
              }`}
            >
              {role}
            </button>
          ))}
        </div>
        <span className="text-sm font-bold text-slate-400 ml-auto">{filtered.length} users</span>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <p className="text-blue-500 font-bold animate-pulse">Loading users...</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((user, i) => {
            const userRole = user.role || (user as any).role_name;
            const isAdminOrSuperAdmin = 
              userRole?.toLowerCase() === "admin" || 
              userRole?.toLowerCase() === "super admin" || 
              userRole?.toLowerCase() === "super_admin" ||
              user.email === "admin@example.com" ||
              user.id === 1;

            return (
              <div key={user.id} className="user-row" style={{ animationDelay: `${i * 40}ms` }}>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${rc(userRole).bg}, ${rc(userRole).text}30)`, color: rc(userRole).text }}
                >
                  {initials(user.name)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 text-sm truncate">{user.name}</p>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <Mail className="w-3 h-3" />{user.email}
                  </p>
                </div>

                <span
                  className="text-[10px] font-bold px-2 py-1 rounded-lg flex-shrink-0"
                  style={{ background: rc(userRole).bg, color: rc(userRole).text }}
                >
                  <Shield className="w-3 h-3 inline mr-1" />
                  {userRole}
                </span>

                <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1 flex-shrink-0 hidden sm:flex">
                  <Calendar className="w-3 h-3" />
                  {fmtDate(user.created_at)}
                </span>

                <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-2 py-1 rounded-lg flex-shrink-0 hidden sm:flex items-center gap-1">
                  <Hash className="w-3 h-3" />{user.id}
                </span>

                {can("Manage Users", "edit") && !isAdminOrSuperAdmin && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button 
                      onClick={() => handleEditClick(user)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                      title="Edit User"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(user)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-400 hover:bg-red-100 transition-colors"
                      title="Delete User"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="border-2 border-dashed border-slate-200 rounded-3xl p-20 text-center">
              <AlertTriangle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-400 font-bold">
                {search ? "No users match your search." : "No users found."}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="modal-overlay">
          <div className="bg-white p-8 rounded-[32px] w-full max-w-md shadow-2xl relative animate-up">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Edit2 size={20} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-800">Edit User</h2>
                  <p className="text-xs text-slate-400 font-bold">{selectedUser.name}</p>
                </div>
              </div>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <input 
                  type="text" 
                  value={editName} 
                  onChange={e => setEditName(e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl font-bold text-sm outline-none focus:border-blue-500 transition-all text-black" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email / Username</label>
                <input 
                  type="email" 
                  value={editEmail} 
                  onChange={e => setEditEmail(e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl font-bold text-sm outline-none focus:border-blue-500 transition-all text-black" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Role</label>
                  <select 
                    value={editRoleId} 
                    onChange={e => setEditRoleId(Number(e.target.value))} 
                    className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl font-bold text-sm outline-none focus:border-blue-500 transition-all text-black"
                  >
                    <option value={0}>Select Role</option>
                    {rolesList.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                  <select 
                    value={editStatus} 
                    onChange={e => setEditStatus(e.target.value)} 
                    className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl font-bold text-sm outline-none focus:border-blue-500 transition-all text-black"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setShowEditModal(false)} 
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveEdit} 
                disabled={savingEdit}
                style={{ color: "#ffffff", backgroundColor: "#2563eb" }}
                className="flex-1 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg active:scale-95 disabled:opacity-50"
              >
                {savingEdit ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="modal-overlay">
          <div className="bg-white p-8 rounded-[32px] w-full max-w-sm shadow-2xl relative animate-up text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-black text-slate-800 mb-2">Move to Restore?</h2>
            <p className="text-sm text-slate-500 font-medium mb-8">This record can be restored within 30 days. After 30 days it will be permanently deleted automatically.</p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setShowDeleteModal(false)} 
                className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black text-sm transition-all"
              >
                Cancel
              </button>
              <button 
                disabled={deletingUser}
                onClick={handleDeleteUser}
                style={{ color: "#ffffff", backgroundColor: "#dc2626" }}
                className="flex-1 py-4 hover:bg-red-700 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-red-600/20 active:scale-95"
              >
                {deletingUser ? "..." : "Move to Restore"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-8 right-8 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl font-bold text-sm animate-in slide-in-from-right duration-300">
          {toast}
        </div>
      )}
    </div>
  );
}
