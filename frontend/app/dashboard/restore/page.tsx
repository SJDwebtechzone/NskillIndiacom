"use client";

import { useEffect, useState } from "react";
import api from "@/app/lib/axiosInstance";
import { RotateCcw, Trash2, Search, Filter, Loader2, Info } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api`;

interface DeletedRecord {
  id: number;
  title: string;
  module_name: string;
  table_name: string;
  deleted_at: string;
  deleted_by_name: string;
  days_remaining: number;
  status: string;
}

export default function RestorePage() {
  const { user } = useAuth();
  const [records, setRecords] = useState<DeletedRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("All");
  const [toastMsg, setToastMsg] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToastMsg({ msg, ok });
    setTimeout(() => setToastMsg(null), 3000);
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const res = await api.get(`${API_BASE}/restore`);
      setRecords(res.data);
    } catch (error) {
      showToast("Failed to load deleted records", false);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (table: string, id: number) => {
    if (!window.confirm("Are you sure you want to restore this record?")) return;
    
    try {
      await api.post(`${API_BASE}/restore/${table}/${id}`);
      showToast("Record restored successfully", true);
      fetchRecords();
    } catch (error) {
      showToast("Failed to restore record", false);
    }
  };

  const handlePermanentDelete = async (table: string, id: number) => {
    if (!window.confirm("WARNING: This will permanently delete the record. This action cannot be undone. Are you sure?")) return;
    
    try {
      await api.delete(`${API_BASE}/restore/permanent/${table}/${id}`);
      showToast("Record permanently deleted", true);
      fetchRecords();
    } catch (error) {
      showToast("Failed to permanently delete record", false);
    }
  };

  const modules = ["All", ...new Set(records.map(r => r.module_name))];

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.title?.toLowerCase().includes(search.toLowerCase()) || false;
    const matchesModule = moduleFilter === "All" || record.module_name === moduleFilter;
    return matchesSearch && matchesModule;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <RotateCcw className="text-blue-600" />
            Restore Records
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Records can be restored within 30 days of deletion.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search records..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-700"
          />
        </div>
        <div className="relative min-w-[200px]">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-700 appearance-none"
          >
            {modules.map(mod => <option key={mod} value={mod}>{mod}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Module</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Record Title</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Deleted By</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Days Left</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-medium">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    Loading records...
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-medium">
                    <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Info className="w-8 h-8 text-slate-400" />
                    </div>
                    No deleted records found
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={`${record.table_name}-${record.id}`} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider">
                        {record.module_name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-700">{record.title || `ID: ${record.id}`}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-500">{record.deleted_by_name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700">
                          {new Date(record.deleted_at).toLocaleDateString()}
                        </span>
                        <span className="text-xs font-medium text-slate-400">
                          {new Date(record.deleted_at).toLocaleTimeString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-xl text-xs font-black uppercase tracking-widest ${
                        record.days_remaining <= 3 ? "bg-red-100 text-red-600" :
                        record.days_remaining <= 10 ? "bg-amber-100 text-amber-600" :
                        "bg-green-100 text-green-600"
                      }`}>
                        {record.days_remaining} Days
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleRestore(record.table_name, record.id)}
                          className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-xl transition-colors tooltip"
                          title="Restore"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        {user?.role === "Admin" && (
                          <button
                            onClick={() => handlePermanentDelete(record.table_name, record.id)}
                            className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors tooltip"
                            title="Delete Permanently"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        @keyframes toastIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
      `}</style>

      {/* ── Toast ── */}
      {toastMsg && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 9999,
          background: toastMsg.ok ? "#1e293b" : "#ef4444",
          color: "#fff", padding: "12px 24px", borderRadius: 12,
          fontWeight: 600, fontSize: "0.85rem",
          boxShadow: "0 8px 24px rgba(0,0,0,0.2)", animation: "toastIn 0.25s ease"
        }}>
          {toastMsg.msg}
        </div>
      )}
    </div>
  );
}
