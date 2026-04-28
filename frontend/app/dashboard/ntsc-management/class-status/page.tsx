"use client";

import { useEffect, useState } from "react";
import {
  Play, CheckCircle, StopCircle, Loader2,
  Search, Check, RefreshCw, Filter, X,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

const STATUS_OPTIONS = ["Approved", "Ongoing", "Completed", "Discontinue"];

const STATUS_STYLE: Record<string, string> = {
  Approved:    "bg-blue-100 text-blue-700",
  Ongoing:     "bg-emerald-100 text-emerald-700",
  Completed:   "bg-purple-100 text-purple-700",
  Discontinue: "bg-red-100 text-red-700",
};

const COURSES = [
  "AC", "HVAC", "Electrical", "Electrician", "Plumbing",
  "Welding", "MEP", "Safety", "Quality", "Oil & Gas", "Home Appliance",
];

export default function NTSCClassStatusPage() {
  const [students,     setStudents]     = useState<any[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCourse, setFilterCourse] = useState("all");
  const [updating,     setUpdating]     = useState<number | null>(null);
  const [editBatch,    setEditBatch]    = useState<number | null>(null);
  const [batchValue,   setBatchValue]   = useState("");
  const [success,      setSuccess]      = useState("");
  const [showFilters,  setShowFilters]  = useState(false);

  const token = typeof window !== "undefined"
    ? localStorage.getItem("token") ?? ""
    : "";

  // ── Fetch all students ────────────────────────────────────────────────────
  const fetchStudents = () => {
    setLoading(true);
    fetch(`${API}/api/admissions`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => setStudents(Array.isArray(d) ? d : []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchStudents(); }, []);

  // ── Update status ─────────────────────────────────────────────────────────
  const updateStatus = async (id: number, newStatus: string, studentName: string) => {
    setUpdating(id);
    try {
      const res = await fetch(`${API}/api/admissions/${id}`, {
        method:  "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization:  `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to update");

      // Update local state
      setStudents(prev =>
        prev.map(s => s.id === id ? { ...s, status: newStatus } : s)
      );
      setSuccess(`${studentName} marked as ${newStatus}`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      alert(err.message ?? "Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  // ── Update batch ──────────────────────────────────────────────────────────
  const updateBatch = async (id: number, studentName: string) => {
    if (!batchValue.trim()) return;
    setUpdating(id);
    try {
      const res = await fetch(`${API}/api/admissions/${id}`, {
        method:  "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization:  `Bearer ${token}`,
        },
        body: JSON.stringify({
          batch_allotted: batchValue.trim(),
          status: "Ongoing", // auto set to Ongoing when batch assigned
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to update batch");

      setStudents(prev =>
        prev.map(s => s.id === id
          ? { ...s, batch_allotted: batchValue.trim(), status: "Ongoing" }
          : s
        )
      );
      setEditBatch(null);
      setBatchValue("");
      setSuccess(`Batch assigned to ${studentName}`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      alert(err.message ?? "Failed to update batch");
    } finally {
      setUpdating(null);
    }
  };

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = students.filter(s => {
    const matchSearch = !search ||
      s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.course_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.batch_allotted?.toLowerCase().includes(search.toLowerCase()) ||
      s.mobile_number?.includes(search);

    const matchStatus = filterStatus === "all" || s.status === filterStatus;
    const matchCourse = filterCourse === "all" ||
      s.course_name?.toLowerCase().includes(filterCourse.toLowerCase()) ||
      s.course_interested?.toLowerCase().includes(filterCourse.toLowerCase());

    return matchSearch && matchStatus && matchCourse;
  });

  // ── Counts ────────────────────────────────────────────────────────────────
  const counts = {
    all:         students.length,
    Approved:    students.filter(s => s.status === "Approved").length,
    Ongoing:     students.filter(s => s.status === "Ongoing").length,
    Completed:   students.filter(s => s.status === "Completed").length,
    Discontinue: students.filter(s => s.status === "Discontinue").length,
  };

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
            <RefreshCw className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800">Update Class Status</h2>
            <p className="text-xs text-slate-400 font-semibold">
              {students.length} total students
            </p>
          </div>
        </div>
        <button
          onClick={fetchStudents}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* ── Status tabs ── */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: "all",         label: "All",         count: counts.all         },
          { key: "Approved",    label: "Approved",    count: counts.Approved    },
          { key: "Ongoing",     label: "Ongoing",     count: counts.Ongoing     },
          { key: "Completed",   label: "Completed",   count: counts.Completed   },
          { key: "Discontinue", label: "Discontinue", count: counts.Discontinue },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilterStatus(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition ${
              filterStatus === tab.key
                ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {tab.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-lg font-black ${
              filterStatus === tab.key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Success toast ── */}
      {success && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm font-semibold">
          <Check className="w-4 h-4" /> {success}
        </div>
      )}

      {/* ── Search + Filter ── */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search name, course, mobile, batch..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        <select
          value={filterCourse}
          onChange={e => setFilterCourse(e.target.value)}
          className="border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Courses</option>
          {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
            <span className="font-semibold text-sm">Loading students...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <RefreshCw className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 font-semibold">No students found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-4 py-3.5 text-xs font-black uppercase tracking-wider text-slate-400">#</th>
                  <th className="text-left px-4 py-3.5 text-xs font-black uppercase tracking-wider text-slate-400">Student</th>
                  <th className="text-left px-4 py-3.5 text-xs font-black uppercase tracking-wider text-slate-400">Course</th>
                  <th className="text-left px-4 py-3.5 text-xs font-black uppercase tracking-wider text-slate-400">Batch</th>
                  <th className="text-left px-4 py-3.5 text-xs font-black uppercase tracking-wider text-slate-400">Mobile</th>
                  <th className="text-left px-4 py-3.5 text-xs font-black uppercase tracking-wider text-slate-400">Status</th>
                  <th className="text-left px-4 py-3.5 text-xs font-black uppercase tracking-wider text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr key={s.id} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/40"}>
                    <td className="px-4 py-3.5 text-slate-400 font-semibold text-xs">{i + 1}</td>

                    {/* Student */}
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-slate-800">{s.full_name}</p>
                      <p className="text-[11px] text-slate-400">{s.admission_number || s.enquiry_id || "—"}</p>
                    </td>

                    {/* Course */}
                    <td className="px-4 py-3.5 text-slate-600 font-medium">
                      {s.course_name || s.course_interested}
                    </td>

                    {/* Batch — inline edit */}
                    <td className="px-4 py-3.5">
                      {editBatch === s.id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={batchValue}
                            onChange={e => setBatchValue(e.target.value)}
                            placeholder="e.g. Batch 3"
                            className="w-24 border border-blue-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                            autoFocus
                            onKeyDown={e => {
                              if (e.key === "Enter") updateBatch(s.id, s.full_name);
                              if (e.key === "Escape") { setEditBatch(null); setBatchValue(""); }
                            }}
                          />
                          <button
                            onClick={() => updateBatch(s.id, s.full_name)}
                            disabled={updating === s.id}
                            className="p-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                          >
                            {updating === s.id
                              ? <Loader2 className="w-3 h-3 animate-spin" />
                              : <Check className="w-3 h-3" />
                            }
                          </button>
                          <button
                            onClick={() => { setEditBatch(null); setBatchValue(""); }}
                            className="p-1 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditBatch(s.id);
                            setBatchValue(s.batch_allotted ?? "");
                          }}
                          className="text-xs font-semibold text-slate-600 hover:text-blue-600 underline underline-offset-2 transition"
                        >
                          {s.batch_allotted || "Assign batch"}
                        </button>
                      )}
                    </td>

                    {/* Mobile */}
                    <td className="px-4 py-3.5 text-slate-500 text-xs">{s.mobile_number}</td>

                    {/* Status badge */}
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider ${
                        STATUS_STYLE[s.status] ?? "bg-slate-100 text-slate-600"
                      }`}>
                        {s.status}
                      </span>
                    </td>

                    {/* Action buttons */}
                    <td className="px-4 py-3.5">
                      <div className="flex gap-1.5 flex-wrap">
                        {s.status !== "Ongoing" && (
                          <button
                            onClick={() => updateStatus(s.id, "Ongoing", s.full_name)}
                            disabled={updating === s.id}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition disabled:opacity-50"
                          >
                            {updating === s.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                            Ongoing
                          </button>
                        )}
                        {s.status !== "Completed" && (
                          <button
                            onClick={() => updateStatus(s.id, "Completed", s.full_name)}
                            disabled={updating === s.id}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-bold transition disabled:opacity-50"
                          >
                            {updating === s.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                            Completed
                          </button>
                        )}
                        {s.status !== "Discontinue" && (
                          <button
                            onClick={() => updateStatus(s.id, "Discontinue", s.full_name)}
                            disabled={updating === s.id}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-bold transition disabled:opacity-50"
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

        {/* Footer count */}
        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400">
              Showing {filtered.length} of {students.length} students
            </p>
            <div className="flex gap-3">
              {Object.entries(counts).filter(([k]) => k !== "all").map(([status, count]) => (
                <span key={status} className="text-xs font-semibold text-slate-500">
                  {status}: <span className="font-black text-slate-700">{count}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
