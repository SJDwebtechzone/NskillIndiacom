"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer,
} from "recharts";
import {
  Users, GraduationCap, ClipboardList, UserCheck,
  TrendingUp, AlertCircle, X, Clock, DollarSign,
  UserPlus, BookOpen, ArrowUpRight, CheckCircle2,
  Activity, CreditCard, Loader2,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

// ── Colours ───────────────────────────────────────────────────────────────────
const PIE_COLORS = ["#3b82f6","#10b981","#f59e0b","#ef4444","#8b5cf6","#06b6d4","#f97316","#84cc16","#ec4899"];

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt  = (n: number) => n?.toLocaleString("en-IN") ?? "0";
const fmtR = (n: number) => `₹${Number(n).toLocaleString("en-IN")}`;

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({
  label, value, icon: Icon, color, sub, alert,
}: {
  label:   string;
  value:   string | number;
  icon:    any;
  color:   string;
  sub?:    string;
  alert?:  boolean;
}) {
  const colors: Record<string, string> = {
    blue:   "bg-blue-50 text-blue-600",
    emerald:"bg-emerald-50 text-emerald-600",
    amber:  "bg-amber-50 text-amber-600",
    red:    "bg-red-50 text-red-600",
    purple: "bg-purple-50 text-purple-600",
    cyan:   "bg-cyan-50 text-cyan-600",
    orange: "bg-orange-50 text-orange-600",
    pink:   "bg-pink-50 text-pink-600",
  };
  return (
    <div className={`bg-white rounded-2xl p-6 shadow-sm border ${alert ? "border-red-200" : "border-slate-50"} relative overflow-hidden group hover:shadow-md transition-all`}>
      <div className={`absolute top-0 right-0 w-20 h-20 -mr-6 -mt-6 rounded-full opacity-10 ${colors[color]}`} />
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-xl ${colors[color]} shadow-sm`}>
          <Icon className="w-5 h-5" />
        </div>
        <ArrowUpRight className="w-4 h-4 text-slate-300" />
      </div>
      <div className="mt-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <h3 className="text-3xl font-black text-slate-800 mt-1">{value}</h3>
        {sub && <p className={`text-xs font-semibold mt-2 ${alert ? "text-red-500" : "text-emerald-600"}`}>{sub}</p>}
      </div>
    </div>
  );
}

// ── Status Card ───────────────────────────────────────────────────────────────
function StatusCard({
  label, value, total, color,
}: {
  label: string; value: number; total: number; color: string;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  const barColors: Record<string, string> = {
    blue:   "bg-blue-500",
    emerald:"bg-emerald-500",
    amber:  "bg-amber-500",
  };
  const textColors: Record<string, string> = {
    blue:   "text-blue-600",
    emerald:"text-emerald-600",
    amber:  "text-amber-600",
  };
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-50">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-bold text-slate-600">{label}</p>
        <span className={`text-2xl font-black ${textColors[color]}`}>{fmt(value)}</span>
      </div>
      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${barColors[color]} transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-slate-400 font-semibold mt-2">{pct}% of total students</p>
    </div>
  );
}

// ── Pending Fees Popup ────────────────────────────────────────────────────────
function PendingFeesPopup({
  list,
  totalAmount,
  onClose,
}: {
  list:        any[];
  totalAmount: number;
  onClose:     () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-red-50 border-b border-red-100 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-black text-red-800 text-lg">Pending Fees Alert</h3>
              <p className="text-xs text-red-500 font-semibold">
                {list.length} students have outstanding dues · Total: {fmtR(totalAmount)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-red-100 hover:bg-red-200 flex items-center justify-center transition"
          >
            <X className="w-4 h-4 text-red-600" />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 sticky top-0">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-wider text-slate-500">Student</th>
                <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-wider text-slate-500">Course</th>
                <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-wider text-slate-500">Mobile</th>
                <th className="text-right px-4 py-3 text-xs font-black uppercase tracking-wider text-slate-500">Due Amount</th>
                <th className="text-right px-4 py-3 text-xs font-black uppercase tracking-wider text-slate-500">Paid</th>
              </tr>
            </thead>
            <tbody>
              {list.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                  <td className="px-4 py-3 font-semibold text-slate-800">{row.full_name}</td>
                  <td className="px-4 py-3 text-slate-600">{row.course_name}</td>
                  <td className="px-4 py-3 text-slate-500">{row.mobile_number}</td>
                  <td className="px-4 py-3 text-right font-black text-red-600">{fmtR(row.balance_amount)}</td>
                  <td className="px-4 py-3 text-right text-emerald-600 font-semibold">{fmtR(row.paid_fees)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex justify-between items-center shrink-0 bg-slate-50/50">
          <p className="text-sm font-black text-slate-700">
            Total Outstanding: <span className="text-red-600">{fmtR(totalAmount)}</span>
          </p>
          <button
            onClick={onClose}
            className="bg-slate-800 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-700 transition"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [data,         setData]         = useState<any>(null);
  const [loading,      setLoading]      = useState(true);
  const [showPopup,    setShowPopup]    = useState(false);
  const [error,        setError]        = useState("");

  useEffect(() => {
    fetch(`${API}/api/dashboard/stats`)
      .then(r => {
        if (!r.ok) throw new Error("Failed to fetch");
        return r.json();
      })
      .then(d => {
        setData(d);
        // Show popup if there are pending fees
        if (d?.pending_fees_list?.length > 0) {
          setShowPopup(true);
        }
      })
      .catch(err => {
        console.error(err);
        setError("Failed to load dashboard data");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="font-semibold">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-slate-600 font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  const c  = data?.counts          ?? {};
  const st = data?.student_status  ?? {};
  const totalStudents = (Number(st.ongoing) + Number(st.completed) + Number(st.pending)) || 1;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* ── Pending Fees Popup ── */}
      {showPopup && data?.pending_fees_list?.length > 0 && (
        <PendingFeesPopup
          list={data.pending_fees_list}
          totalAmount={Number(c.pending_fees_amount)}
          onClose={() => setShowPopup(false)}
        />
      )}

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Super Admin Dashboard
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Live overview of NTSC Training Institute
          </p>
        </div>
        <div className="flex items-center gap-3">
          {Number(c.pending_fees_count) > 0 && (
            <button
              onClick={() => setShowPopup(true)}
              className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-100 transition"
            >
              <AlertCircle className="w-4 h-4" />
              {c.pending_fees_count} Pending Fees
            </button>
          )}
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-bold text-slate-700">
              Revenue: <span className="text-emerald-500">{fmtR(c.revenue_this_month ?? 0)}</span>
            </span>
          </div>
        </div>
      </div>

      {/* ── Row 1: 8 Stat Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Students"        value={fmt(c.total_students)}        icon={GraduationCap} color="blue"   sub={`${c.total_admissions} admissions`} />
        <StatCard label="Total Associates"      value={fmt(c.total_associates)}      icon={UserCheck}     color="emerald" />
        <StatCard label="Total Enquiries"       value={fmt(c.total_enquiries)}       icon={ClipboardList} color="purple" />
        <StatCard label="Total Admissions"      value={fmt(c.total_admissions)}      icon={UserPlus}      color="cyan" />
        <StatCard label="Direct Enquiries"      value={fmt(c.direct_enquiries)}      icon={Users}         color="orange" />
        <StatCard label="Associate Admissions"  value={fmt(c.associate_admissions)}  icon={BookOpen}      color="pink" />
        <StatCard label="Revenue This Month"    value={fmtR(c.revenue_this_month ?? 0)} icon={DollarSign} color="emerald" />
        <StatCard label="Pending Fees"          value={fmtR(c.pending_fees_amount ?? 0)} icon={AlertCircle} color="red" alert={Number(c.pending_fees_count) > 0} sub={`${c.pending_fees_count} students`} />
      </div>

      {/* ── Row 2: Student Status ── */}
      <div>
        <h2 className="text-lg font-black text-slate-800 mb-4">Student Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatusCard label="Ongoing"   value={Number(st.ongoing)}   total={totalStudents} color="blue"    />
          <StatusCard label="Completed" value={Number(st.completed)} total={totalStudents} color="emerald" />
          <StatusCard label="Pending"   value={Number(st.pending)}   total={totalStudents} color="amber"   />
        </div>
      </div>

      {/* ── Row 3: Monthly Bar Chart + Revenue Bar Chart ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Monthly Trends */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-50">
          <h3 className="font-black text-slate-800 mb-1">Monthly Trends</h3>
          <p className="text-xs text-slate-400 font-semibold mb-4">Enquiries · Admissions · Associates</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data?.monthly_trends ?? []} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 600 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
              />
              <Legend wrapperStyle={{ fontSize: 12, fontWeight: 600 }} />
              <Bar dataKey="enquiries"  name="Enquiries"  fill="#8b5cf6" radius={[4,4,0,0]} />
              <Bar dataKey="admissions" name="Admissions" fill="#3b82f6" radius={[4,4,0,0]} />
              <Bar dataKey="associates" name="Associates" fill="#10b981" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Bar Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-50">
          <h3 className="font-black text-slate-800 mb-1">Monthly Revenue</h3>
          <p className="text-xs text-slate-400 font-semibold mb-4">Fees collected per month (₹)</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data?.monthly_trends ?? []} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 600 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(v: any) => [fmtR(v), "Revenue"]}
                contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
              />
              <Bar dataKey="revenue" name="Revenue" fill="#10b981" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Row 4: Pie Chart + Leads/Bookings Line Chart ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Pie Chart — students by category */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-50">
          <h3 className="font-black text-slate-800 mb-1">Students by Course</h3>
          <p className="text-xs text-slate-400 font-semibold mb-4">Distribution across categories</p>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
             <Pie
  data={data?.category_distribution ?? []}
  dataKey="count"
  nameKey="category"
  cx="50%"
  cy="50%"
  outerRadius={90}
// AFTER — cast to any to suppress Recharts type warning
label={({ name, percent }: any) =>
  `${name?.split(" ")[0]} ${(percent * 100).toFixed(0)}%`
}
  labelLine={false}
>
                {(data?.category_distribution ?? []).map((_: any, i: number) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v: any, n: any) => [v, n]}
                contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
              />
              <Legend wrapperStyle={{ fontSize: 11, fontWeight: 600 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart — leads + bookings trend */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-50">
          <h3 className="font-black text-slate-800 mb-1">Leads & Bookings Trend</h3>
          <p className="text-xs text-slate-400 font-semibold mb-4">Brochure leads vs demo bookings</p>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data?.leads_bookings_trend ?? []} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 600 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
              />
              <Legend wrapperStyle={{ fontSize: 12, fontWeight: 600 }} />
              <Line type="monotone" dataKey="leads"    name="Leads"    stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="bookings" name="Bookings" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Row 5: Recent Bookings + Recent Leads ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Bookings */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-50 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center">
                <Activity className="w-4 h-4 text-violet-600" />
              </div>
              <h3 className="font-black text-slate-800">Recent Demo Bookings</h3>
            </div>
            <span className="text-xs font-bold text-violet-600 bg-violet-50 px-3 py-1 rounded-lg">
              Latest 5
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-wider text-slate-400">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-wider text-slate-400">Course</th>
                  <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-wider text-slate-400">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-wider text-slate-400">Time</th>
                </tr>
              </thead>
              <tbody>
                {(data?.recent_bookings ?? []).length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-8 text-slate-400 text-sm">No bookings yet</td></tr>
                ) : (
                  (data?.recent_bookings ?? []).map((b: any, i: number) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                      <td className="px-4 py-3 font-semibold text-slate-800">{b.name}</td>
                      <td className="px-4 py-3 text-slate-600 truncate max-w-[120px]">{b.course_name ?? "N/A"}</td>
                      <td className="px-4 py-3 text-slate-500">{b.demo_date}</td>
                      <td className="px-4 py-3 text-slate-500">{b.demo_time}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Leads */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-50 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="font-black text-slate-800">Recent Brochure Leads</h3>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
              Latest 5
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-wider text-slate-400">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-wider text-slate-400">Course</th>
                  <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-wider text-slate-400">Phone</th>
                  <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-wider text-slate-400">Date</th>
                </tr>
              </thead>
              <tbody>
                {(data?.recent_leads ?? []).length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-8 text-slate-400 text-sm">No leads yet</td></tr>
                ) : (
                  (data?.recent_leads ?? []).map((l: any, i: number) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                      <td className="px-4 py-3 font-semibold text-slate-800">{l.name}</td>
                      <td className="px-4 py-3 text-slate-600 truncate max-w-[120px]">{l.course_name ?? "N/A"}</td>
                      <td className="px-4 py-3 text-slate-500">{l.phone}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{new Date(l.created_at).toLocaleDateString("en-IN")}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}
