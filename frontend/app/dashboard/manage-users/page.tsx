"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/app/context/AuthContext";
import {
  Users, Search, Mail, Calendar, Hash, Shield, Plus,
  Trash2, Edit2, AlertTriangle
} from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
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
  const [loading, setLoading] = useState(true);
  const [search, setSearch]  = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [toast, setToast]   = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(API, { headers: getAuthHeaders() });
      const json = await res.json();
      setUsers(json.data || []);
    } catch {
      showToast("❌ Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (!can("Manage Users", "view")) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: 12 }}>
        <div style={{ fontSize: 48 }}>⛔</div>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#1e293b" }}>Access Denied</h2>
        <p style={{ color: "#94a3b8", fontSize: "0.84rem" }}>You don&apos;t have permission to manage users.</p>
      </div>
    );
  }

  const roles = ["ALL", ...Array.from(new Set(users.map(u => u.role).filter(Boolean)))];

  const filtered = users.filter(u => {
    const matchRole = roleFilter === "ALL" || u.role === roleFilter;
    const matchSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const rc = (role: string) => ROLE_COLORS[role] || { bg: "#f1f5f9", text: "#475569" };

  return (
    <div className="space-y-6">
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        .user-row { background: #fff; border-radius: 14px; padding: 16px 20px; border: 1.5px solid #f1f5f9; transition: all 0.25s; animation: fadeUp 0.35s ease both; display: flex; align-items: center; gap: 16px; }
        .user-row:hover { box-shadow: 0 8px 20px rgba(0,0,0,0.06); transform: translateY(-2px); }
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
        {can("Manage Users", "add") && (
          <button 
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-600/20 transition-all active:scale-95"
            style={{ color: "white" }}
          >
            <Plus className="w-4 h-4" style={{ color: "white" }} />
            Add User
          </button>
        )}
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
          {filtered.map((user, i) => (
            <div key={user.id} className="user-row" style={{ animationDelay: `${i * 40}ms` }}>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${rc(user.role).bg}, ${rc(user.role).text}30)`, color: rc(user.role).text }}
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
                style={{ background: rc(user.role).bg, color: rc(user.role).text }}
              >
                <Shield className="w-3 h-3 inline mr-1" />
                {user.role}
              </span>

              <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1 flex-shrink-0 hidden sm:flex">
                <Calendar className="w-3 h-3" />
                {fmtDate(user.created_at)}
              </span>

              <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-2 py-1 rounded-lg flex-shrink-0 hidden sm:flex items-center gap-1">
                <Hash className="w-3 h-3" />{user.id}
              </span>

              {can("Manage Users", "edit") && (
                <div className="flex gap-2 flex-shrink-0">
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-400 hover:bg-red-100 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}

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

      {toast && (
        <div className="fixed bottom-8 right-8 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl font-bold text-sm animate-in slide-in-from-right duration-300">
          {toast}
        </div>
      )}
    </div>
  );
}
