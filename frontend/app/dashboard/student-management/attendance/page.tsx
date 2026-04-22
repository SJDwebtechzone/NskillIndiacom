"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/app/context/AuthContext";
import {
  CalendarCheck, Search, Filter, Download,
  CheckCircle, XCircle, Clock, AlertTriangle,
  Users, UserCheck, Loader2, Save, LogIn, LogOut,
  QrCode, Camera, ClipboardList, TrendingUp,
  Award, Calendar
} from "lucide-react";

/* ─── Types ──────────────────────────────────────── */
interface StudentRow {
  id: number;
  admission_number: string;
  full_name: string;
  photo_url: string | null;
  course_name: string;
  batch_allotted: string;
  attendance: {
    status: "Present" | "Absent" | "Late" | null;
    method: string;
    punch_in: string | null;
    punch_out: string | null;
    time_in: string | null;
    time_out: string | null;
    early_exit: boolean;
    remarks: string;
    marked_by_name: string | null;
  };
}

interface EditRow {
  admission_id: number;
  status: "Present" | "Absent" | "Late";
  punch_in: string;
  punch_out: string;
  remarks: string;
}

interface MyRecord {
  date: string;
  batch: string;
  status: string;
  method: string;
  time_in: string | null;
  time_out: string | null;
  early_exit: boolean;
}

interface MyReport {
  full_name: string;
  admission_number: string;
  total: number;
  present: number;
  absent: number;
  late: number;
  percent: string;
  records: MyRecord[];
}

const API = process.env.NEXT_PUBLIC_API_URL ?? "";

const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") ?? "" : "";

/* ─── Helpers ─────────────────────────────────────── */
const fmt12 = (t: string | null) => {
  if (!t) return "—";
  try {
    if (t.includes("T")) {
      return new Date(t).toLocaleTimeString("en-IN", {
        hour: "2-digit", minute: "2-digit", hour12: true,
      });
    }
    const d = new Date(`1970-01-01T${t}`);
    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit", minute: "2-digit", hour12: true,
    });
  } catch { return t; }
};

const fmtDate = (d: string) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
};

const todayStr = () => new Date().toISOString().split("T")[0];

/* ════════════════════════════════════════════════════
   MAIN COMPONENT — Role-based router
════════════════════════════════════════════════════ */
export default function AttendancePage() {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-60">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // ✅ Student role → show their own attendance report
  if (user?.role === "Student") {
    return <StudentOwnAttendance />;
  }

  // ✅ All other roles (Admin, Super Admin, trainee, Staff) → show admin view
  return <AdminAttendancePage />;
}

/* ════════════════════════════════════════════════════
   STUDENT VIEW — Shows own attendance history
════════════════════════════════════════════════════ */
function StudentOwnAttendance() {
  const { user } = useAuth();
  const [report, setReport]   = useState<MyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res  = await fetch(`${API}/api/attendance/student-report`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const data = await res.json();
        if (data.success) {
          setReport(data.data);
        } else {
          setError(data.message ?? "Failed to load attendance");
        }
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-60">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <XCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <p className="text-red-700 font-bold">{error}</p>
      </div>
    );
  }

  if (!report) return null;

  const percent = parseFloat(report.percent);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
            <CalendarCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800">My Attendance</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {report.full_name} — {report.admission_number || "No admission number"}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Days",  value: report.total,   color: "bg-slate-50  border-slate-200  text-slate-700",  icon: Calendar    },
          { label: "Present",     value: report.present, color: "bg-green-50  border-green-200  text-green-700",  icon: CheckCircle },
          { label: "Absent",      value: report.absent,  color: "bg-red-50    border-red-200    text-red-700",    icon: XCircle     },
          { label: "Late",        value: report.late,    color: "bg-amber-50  border-amber-200  text-amber-700",  icon: Clock       },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`rounded-2xl border p-4 flex items-center gap-3 ${s.color}`}>
              <Icon className="w-5 h-5 flex-shrink-0 opacity-70" />
              <div>
                <p className="text-2xl font-black">{s.value}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Attendance percentage card */}
      <div className="bg-[#0b1f3a] rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-blue-300" />
            <p className="font-bold text-blue-200">Overall Attendance Rate</p>
          </div>
          <div className="flex items-center gap-2">
            <Award className={`w-5 h-5 ${percent >= 75 ? "text-green-400" : "text-red-400"}`} />
            <span className={`text-2xl font-black ${percent >= 75 ? "text-green-400" : "text-red-400"}`}>
              {report.percent}%
            </span>
          </div>
        </div>
        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              percent >= 75 ? "bg-green-400" : "bg-red-400"
            }`}
            style={{ width: `${Math.min(percent, 100)}%` }}
          />
        </div>
        <p className={`text-xs mt-2 font-medium ${percent >= 75 ? "text-green-300" : "text-red-300"}`}>
          {percent >= 75
            ? "✅ Good attendance! Keep it up."
            : "⚠️ Your attendance is below 75%. Please improve."}
        </p>
      </div>

      {/* Attendance history table */}
      {report.records.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
            <h2 className="font-black text-slate-700 text-sm uppercase tracking-wide">
              Attendance History ({report.records.length} records)
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Batch</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Time In</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Time Out</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {report.records.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3 font-bold text-slate-700 text-[13px]">
                      {fmtDate(r.date)}
                    </td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-lg text-[11px] font-bold">
                        {r.batch}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        r.status === "Present" ? "bg-green-100 text-green-700" :
                        r.status === "Late"    ? "bg-amber-100 text-amber-700" :
                                                  "bg-red-50 text-red-500"
                      }`}>
                        {r.status === "Present" ? <CheckCircle className="w-3 h-3" /> :
                         r.status === "Late"    ? <Clock        className="w-3 h-3" /> :
                                                  <XCircle      className="w-3 h-3" />}
                        {r.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[13px]">
                      {r.time_in ? (
                        <span className="flex items-center gap-1 text-green-600 font-medium">
                          <LogIn className="w-3 h-3" />{fmt12(r.time_in)}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-5 py-3 text-[13px]">
                      {r.time_out ? (
                        <span className={`flex items-center gap-1 font-medium ${r.early_exit ? "text-amber-600" : "text-slate-500"}`}>
                          <LogOut className="w-3 h-3" />{fmt12(r.time_out)}
                          {r.early_exit && <span className="text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-full border border-amber-200 ml-1">Early</span>}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`flex items-center gap-1.5 text-[11px] font-bold uppercase ${
                        r.method === "qr"     ? "text-blue-500"   :
                        r.method === "photo"  ? "text-purple-500" :
                                               "text-slate-400"
                      }`}>
                        {r.method === "qr"    && <QrCode        className="w-3 h-3" />}
                        {r.method === "photo" && <Camera        className="w-3 h-3" />}
                        {r.method === "manual"&& <ClipboardList className="w-3 h-3" />}
                        {r.method || "—"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm py-16 flex flex-col items-center gap-3">
          <CalendarCheck className="w-10 h-10 text-slate-200" />
          <p className="text-slate-400 font-medium">No attendance records yet</p>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════
   ADMIN VIEW — Shows all students, edit mode
════════════════════════════════════════════════════ */
function AdminAttendancePage() {
  const { user } = useAuth();

  const [date, setDate]                 = useState(todayStr());
  const [batch, setBatch]               = useState("");
  const [course, setCourse]             = useState("");
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Present" | "Absent" | "Late">("All");

  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [fetched, setFetched]   = useState(false);
  const [saveMsg, setSaveMsg]   = useState("");

  const [editMap, setEditMap]   = useState<Record<number, EditRow>>({});
  const [editMode, setEditMode] = useState(false);

  /* ── Fetch students ──────────────────────────── */
  const fetchStudents = useCallback(async () => {
    if (!batch || !date) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        batch,
        date,
        batchAllotted: batch,
        ...(course && { course }),
      });

      const res  = await fetch(`${API}/api/attendance/students?${params}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();

      if (data.success) {
        setStudents(data.data);
        setFetched(true);

        const map: Record<number, EditRow> = {};
        data.data.forEach((s: StudentRow) => {
          map[s.id] = {
            admission_id: s.id,
            status:    s.attendance.status   ?? "Absent",
            punch_in:  s.attendance.punch_in  ?? "09:00",
            punch_out: s.attendance.punch_out ?? "18:00",
            remarks:   s.attendance.remarks   ?? "",
          };
        });
        setEditMap(map);
      }
    } catch (e) {
      console.error("fetchStudents error:", e);
    } finally {
      setLoading(false);
    }
  }, [batch, date, course]);

  /* ── Save attendance ─────────────────────────── */
  const saveAttendance = async () => {
    setSaving(true);
    setSaveMsg("");
    try {
      const records = Object.values(editMap);
      const res = await fetch(`${API}/api/attendance/mark`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:  `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ date, batch, marked_by_id: user?.id, records }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveMsg("✅ Attendance saved successfully!");
        setEditMode(false);
        fetchStudents();
        setTimeout(() => setSaveMsg(""), 3000);
      } else {
        setSaveMsg(`❌ ${data.message}`);
      }
    } catch {
      setSaveMsg("❌ Server error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const markAllPresent = () => {
    setEditMap(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(k => {
        next[Number(k)] = { ...next[Number(k)], status: "Present" };
      });
      return next;
    });
  };

  const exportCsv = () => {
    const rows = [
      ["Admission No", "Name", "Course", "Batch", "Status", "Time In", "Time Out", "Method", "Early Exit", "Remarks"],
      ...students.map(s => [
        s.admission_number, s.full_name, s.course_name, s.batch_allotted,
        s.attendance.status ?? "Absent",
        s.attendance.punch_in ?? "", s.attendance.punch_out ?? "",
        s.attendance.method ?? "manual",
        s.attendance.early_exit ? "Yes" : "No",
        s.attendance.remarks ?? "",
      ]),
    ];
    const csv  = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url;
    a.download = `attendance_${batch}_${date}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const total   = students.length;
  const present = students.filter(s => s.attendance.status === "Present").length;
  const absent  = students.filter(s => !s.attendance.status || s.attendance.status === "Absent").length;
  const late    = students.filter(s => s.attendance.status === "Late").length;
  const earlyEx = students.filter(s => s.attendance.early_exit).length;

  const filtered = students.filter(s => {
    const matchSearch =
      s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.admission_number.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "All" || (s.attendance.status ?? "Absent") === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">

      {/* Title */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Daily Attendance</h1>
          <p className="text-sm text-slate-400 mt-0.5">View, mark and export student attendance</p>
        </div>
        {fetched && students.length > 0 && (
          <div className="flex items-center gap-3">
            {editMode ? (
              <>
                <button onClick={markAllPresent}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 text-green-700 border border-green-200 text-sm font-bold hover:bg-green-100 transition-all">
                  <UserCheck className="w-4 h-4" /> Mark All Present
                </button>
                <button onClick={() => setEditMode(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all">
                  Cancel
                </button>
                <button onClick={saveAttendance} disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-60 transition-all shadow-sm">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? "Saving..." : "Save Attendance"}
                </button>
              </>
            ) : (
              <>
                <button onClick={exportCsv}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-sm font-bold hover:bg-slate-200 transition-all">
                  <Download className="w-4 h-4" /> Export CSV
                </button>
                <button onClick={() => setEditMode(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all shadow-sm">
                  <ClipboardList className="w-4 h-4" /> Edit Attendance
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Save message */}
      {saveMsg && (
        <div className={`px-4 py-3 rounded-xl text-sm font-bold ${
          saveMsg.startsWith("✅") ? "bg-green-50 text-green-700 border border-green-200"
                                   : "bg-red-50 text-red-700 border border-red-200"
        }`}>{saveMsg}</div>
      )}

      {/* Filter bar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Batch</label>
            <input value={batch} onChange={e => setBatch(e.target.value)} placeholder="e.g. 2"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Course</label>
            <input value={course} onChange={e => setCourse(e.target.value)} placeholder="e.g. AC"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
          </div>
          <div className="flex items-end">
            <button onClick={fetchStudents} disabled={!batch || !date || loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#0b1f3a] hover:bg-[#0f2a4a] disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-bold transition-all">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Filter className="w-4 h-4" />}
              {loading ? "Loading..." : "Fetch Attendance"}
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      {fetched && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: "Total",     value: total,   color: "bg-slate-50  border-slate-200  text-slate-700",  icon: Users         },
            { label: "Present",   value: present, color: "bg-green-50  border-green-200  text-green-700",  icon: CheckCircle   },
            { label: "Absent",    value: absent,  color: "bg-red-50    border-red-200    text-red-700",    icon: XCircle       },
            { label: "Late",      value: late,    color: "bg-amber-50  border-amber-200  text-amber-700",  icon: Clock         },
            { label: "Early Out", value: earlyEx, color: "bg-orange-50 border-orange-200 text-orange-700", icon: AlertTriangle },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className={`rounded-2xl border p-4 flex items-center gap-3 ${s.color}`}>
                <Icon className="w-5 h-5 flex-shrink-0 opacity-70" />
                <div>
                  <p className="text-2xl font-black">{s.value}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">{s.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Search + filter */}
      {fetched && students.length > 0 && (
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or admission number..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
          </div>
          <div className="flex gap-2">
            {(["All", "Present", "Absent", "Late"] as const).map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === s ? "bg-[#0b1f3a] text-white" : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}>{s}</button>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      {!fetched ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm py-24 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
            <CalendarCheck className="w-8 h-8 text-blue-400" />
          </div>
          <div className="text-center">
            <p className="text-base font-black text-slate-700">Select a batch and date</p>
            <p className="text-sm text-slate-400 mt-1">Enter batch name, pick a date, then click Fetch Attendance</p>
          </div>
        </div>
      ) : students.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm py-24 flex flex-col items-center gap-4">
          <Users className="w-10 h-10 text-slate-200" />
          <p className="text-slate-400 font-medium">No students found for this batch</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Student</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Time In</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Time Out</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Method</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Flags</th>
                  {editMode && <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Edit</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(s => {
                  const att    = s.attendance;
                  const status = att.status ?? "Absent";
                  const edit   = editMap[s.id];
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {s.photo_url ? (
                            <img src={`${API}/${s.photo_url}`} alt={s.full_name}
                              className="w-9 h-9 rounded-xl object-cover flex-shrink-0"
                              onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(s.full_name)}&background=0b1f3a&color=fff`; }} />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-black text-sm flex-shrink-0">
                              {s.full_name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-800 text-[13px] leading-tight">{s.full_name}</p>
                            <p className="text-[11px] text-slate-400">{s.admission_number || `ADM-${s.id}`}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          status === "Present" ? "bg-green-100 text-green-700" :
                          status === "Late"    ? "bg-amber-100 text-amber-700" : "bg-red-50 text-red-500"
                        }`}>
                          {status === "Present" ? <CheckCircle className="w-3 h-3" /> :
                           status === "Late"    ? <Clock        className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[13px] font-medium">
                        {att.time_in ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <LogIn className="w-3 h-3" />{fmt12(att.time_in)}
                          </span>
                        ) : att.punch_in ? <span className="text-slate-400">{fmt12(att.punch_in)}</span> : "—"}
                      </td>
                      <td className="px-5 py-3.5 text-[13px] font-medium">
                        {att.time_out ? (
                          <span className={`flex items-center gap-1 ${att.early_exit ? "text-amber-600" : "text-slate-600"}`}>
                            <LogOut className="w-3 h-3" />{fmt12(att.time_out)}
                          </span>
                        ) : att.punch_out ? <span className="text-slate-400">{fmt12(att.punch_out)}</span> : "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider ${
                          att.method === "qr" ? "text-blue-500" : att.method === "photo" ? "text-purple-500" : "text-slate-400"
                        }`}>
                          {att.method === "qr"     && <QrCode        className="w-3 h-3" />}
                          {att.method === "photo"  && <Camera        className="w-3 h-3" />}
                          {att.method === "manual" && <ClipboardList className="w-3 h-3" />}
                          {att.method || "—"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {att.early_exit ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            <AlertTriangle className="w-3 h-3" /> Early Exit
                          </span>
                        ) : <span className="text-slate-200 text-xs">—</span>}
                      </td>
                      {editMode && edit && (
                        <td className="px-5 py-3.5">
                          <select value={edit.status}
                            onChange={e => setEditMap(prev => ({ ...prev, [s.id]: { ...prev[s.id], status: e.target.value as EditRow["status"] } }))}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                            <option value="Present">Present</option>
                            <option value="Absent">Absent</option>
                            <option value="Late">Late</option>
                          </select>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-[11px] text-slate-400">
              Showing <strong className="text-slate-600">{filtered.length}</strong> of <strong className="text-slate-600">{total}</strong> students
            </p>
            {total > 0 && (
              <p className="text-[11px] text-slate-500">
                Attendance rate: <strong className="text-green-600">{((present / total) * 100).toFixed(1)}%</strong>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
