"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/app/context/AuthContext";

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

export default function NtscAdminPage() {
  const { can } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
     const res = await fetch(`${API}?role=Admin`, { headers: getAuthHeaders() });
      const json = await res.json();
      setUsers(json.data || []);
    } catch {
      showToast("❌ Failed to load NTSC Admins");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
if (!can("NTSC Admin", "view")) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: 12 }}>
        <div style={{ fontSize: 48 }}>⛔</div>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#1e293b" }}>Access Denied</h2>
        <p style={{ color: "#94a3b8", fontSize: "0.84rem" }}>You don't have permission to view NTSC Admins.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        .user-card { background: #fff; border-radius: 20px; padding: 24px; border: 1.5px solid #f1f5f9; transition: all 0.3s; }
        .user-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.05); }
      `}</style>

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">NTSC Admin Management</h1>
          <p className="text-slate-500 font-medium">Manage and monitor NTSC administrator accounts.</p>
        </div>
        <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-bold text-sm">
          {users.length} Active Admins
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <p className="text-blue-500 font-bold">Loading NTSC Admins...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user, i) => (
            <div key={user.id} className="user-card animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg shadow-blue-600/20">
                  {user.name[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{user.name}</h3>
                  <p className="text-xs text-slate-400 font-medium">{user.email}</p>
                </div>
              </div>
              <div className="border-t border-slate-50 pt-4 mt-4 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span>Joined {fmtDate(user.created_at)}</span>
                <span className="bg-slate-100 px-2 py-1 rounded-lg text-slate-500">ID: {user.id}</span>
              </div>
            </div>
          ))}
          {users.length === 0 && (
            <div className="col-span-full border-2 border-dashed border-slate-200 rounded-3xl p-20 text-center">
              <p className="text-slate-400 font-bold">No NTSC Admins found.</p>
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
