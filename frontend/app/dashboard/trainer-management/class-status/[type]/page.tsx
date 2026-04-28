"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Play, CheckCircle, StopCircle,
  Loader2, Search, Check,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

const STATUS_MAP: Record<string, {
  label:   string;
  color:   string;
  icon:    any;
  update:  string;
}> = {
  ongoing: {
    label:  "Ongoing Students",
    color:  "blue",
    icon:   Play,
    update: "Ongoing",
  },
  completed: {
    label:  "Completed Students",
    color:  "emerald",
    icon:   CheckCircle,
    update: "Completed",
  },
  discontinue: {
    label:  "Discontinued Students",
    color:  "red",
    icon:   StopCircle,
    update: "Discontinue",
  },
};

export default function ClassStatusPage() {
  const params  = useParams();
  const type    = (params?.type as string) ?? "ongoing";
  const config  = STATUS_MAP[type] ?? STATUS_MAP.ongoing;

  const [students,  setStudents]  = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [updating,  setUpdating]  = useState<number | null>(null);
  const [success,   setSuccess]   = useState("");

  // Fetch students based on type
  useEffect(() => {
    setLoading(true);
    setStudents([]);
    
    // Map URL type to DB status
    const statusMap: Record<string, string> = {
      ongoing:     "Ongoing",
      completed:   "Completed",
      discontinue: "Discontinue",
    };
    
    // For ongoing — also include Approved students with batch assigned
const fetchUrl = type === "ongoing"
  ? `${API}/api/class-status?status=Ongoing&includeApproved=true`
  : `${API}/api/class-status?status=${statusMap[type]}`;

    fetch(fetchUrl)
      .then(r => r.json())
      .then(d => setStudents(Array.isArray(d) ? d : []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [type]);

  // Update single student status
  const updateStatus = async (id: number, newStatus: string) => {
    setUpdating(id);
    try {
      const res = await fetch(`${API}/api/class-status/${id}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Remove from current list since status changed
      setStudents(prev => prev.filter(s => s.id !== id));
      setSuccess(`${data.student.full_name} marked as ${newStatus}`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      alert(err.message ?? "Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  const filtered = students.filter(s =>
    s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.course_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.batch_allotted?.toLowerCase().includes(search.toLowerCase())
  );

  const Icon = config.icon;

  const colorMap: Record<string, string> = {
    blue:   "bg-blue-50 text-blue-600 border-blue-100",
    emerald:"bg-emerald-50 text-emerald-600 border-emerald-100",
    red:    "bg-red-50 text-red-600 border-red-100",
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${colorMap[config.color]}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800">{config.label}</h2>
            <p className="text-xs text-slate-400 font-semibold">
              {students.length} students
            </p>
          </div>
        </div>
      </div>

      {/* Success toast */}
      {success && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm font-semibold">
          <Check className="w-4 h-4" /> {success}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name, course, batch..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
            <span className="font-semibold text-sm">Loading students...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Icon className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 font-semibold">No {type} students found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-5 py-3.5 text-xs font-black uppercase tracking-wider text-slate-400">#</th>
                  <th className="text-left px-5 py-3.5 text-xs font-black uppercase tracking-wider text-slate-400">Student</th>
                  <th className="text-left px-5 py-3.5 text-xs font-black uppercase tracking-wider text-slate-400">Course</th>
                  <th className="text-left px-5 py-3.5 text-xs font-black uppercase tracking-wider text-slate-400">Batch</th>
                  <th className="text-left px-5 py-3.5 text-xs font-black uppercase tracking-wider text-slate-400">Mobile</th>
                  <th className="text-left px-5 py-3.5 text-xs font-black uppercase tracking-wider text-slate-400">Status</th>
                  <th className="text-left px-5 py-3.5 text-xs font-black uppercase tracking-wider text-slate-400">Update To</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr key={s.id} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/40"}>
                    <td className="px-5 py-3.5 text-slate-400 font-semibold">{i + 1}</td>
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-800">{s.full_name}</p>
                      <p className="text-[11px] text-slate-400">{s.admission_number || "—"}</p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 font-medium">{s.course_name}</td>
                    <td className="px-5 py-3.5 text-slate-500">{s.batch_allotted || "—"}</td>
                    <td className="px-5 py-3.5 text-slate-500">{s.mobile_number}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider ${
                        s.status === "Completed"   ? "bg-emerald-100 text-emerald-700" :
                        s.status === "Discontinue" ? "bg-red-100 text-red-700" :
                        s.status === "Ongoing"     ? "bg-blue-100 text-blue-700" :
                        "bg-slate-100 text-slate-600"
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-2 flex-wrap">
                        {/* Show action buttons based on current page type */}
                        {type !== "ongoing" && (
                          <button
                            onClick={() => updateStatus(s.id, "Ongoing")}
                            disabled={updating === s.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition disabled:opacity-50"
                          >
                            {updating === s.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                            Ongoing
                          </button>
                        )}
                        {type !== "completed" && (
                          <button
                            onClick={() => updateStatus(s.id, "Completed")}
                            disabled={updating === s.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition disabled:opacity-50"
                          >
                            {updating === s.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                            Completed
                          </button>
                        )}
                        {type !== "discontinue" && (
                          <button
                            onClick={() => updateStatus(s.id, "Discontinue")}
                            disabled={updating === s.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-bold transition disabled:opacity-50"
                          >
                            {updating === s.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <StopCircle className="w-3 h-3" />}
                            Discontinue
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}