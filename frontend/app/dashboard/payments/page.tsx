"use client";

import { useEffect, useState } from "react";
import {
  DollarSign, Search, Loader2, RefreshCw,
  CheckCircle, Clock, AlertCircle, X, Check,
  TrendingUp, Users, CreditCard, Wallet,
  ChevronDown, Eye, Plus,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

const fmtDate = (d: string) =>
  d ? new Date(d).toLocaleDateString("en-IN") : "—";
const fmtAmt = (n: any) =>
  `₹${Number(n || 0).toLocaleString("en-IN")}`;

function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("token") ?? "" : "";
}

// ─── Payment Status ────────────────────────────────────────────────────────────
function paymentStatus(student: any) {
  const balance = Number(student.balance_amount || 0);
  const paid    = Number(student.paid_fees || 0);
  const total   = Number(student.total_fees || 0);
  if (balance <= 0 && paid > 0) return "paid";
  if (paid > 0 && balance > 0) return "partial";
  return "pending";
}

const STATUS_STYLE = {
  paid:    "bg-emerald-100 text-emerald-700",
  partial: "bg-amber-100 text-amber-700",
  pending: "bg-red-100 text-red-700",
};
const STATUS_LABEL = {
  paid:    "Paid",
  partial: "Partial",
  pending: "Pending",
};

// ─── Record Payment Modal ──────────────────────────────────────────────────────
function RecordPaymentModal({
  student,
  onClose,
  onSave,
}: {
  student:  any;
  onClose:  () => void;
  onSave:   (id: number, data: any) => Promise<void>;
}) {
  const balance    = Number(student.balance_amount || 0);
  const [amount,   setAmount]   = useState("");
  const [mode,     setMode]     = useState("Cash");
  const [refNo,    setRefNo]    = useState("");
  const [date,     setDate]     = useState(new Date().toISOString().split("T")[0]);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState("");

  const handleSave = async () => {
    const amt = Number(amount);
    if (!amt || amt <= 0) { setError("Enter a valid amount"); return; }
    if (amt > balance)    { setError(`Amount cannot exceed balance ${fmtAmt(balance)}`); return; }
    setSaving(true);
    try {
      const newPaid    = Number(student.paid_fees || 0) + amt;
      const newBalance = balance - amt;
      await onSave(student.id, {
        paid_fees:      newPaid,
        balance_amount: newBalance,
        payment_mode:   mode,
        payment_ref_no: refNo || null,
        payment_date:   date,
      });
      onClose();
    } catch (err: any) {
      setError(err.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Plus className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-black text-slate-800">Record Payment</h3>
              <p className="text-xs text-slate-400 font-semibold">{student.full_name}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">

          {/* Fee summary */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Total Fees",  value: fmtAmt(student.total_fees),   color: "slate"   },
              { label: "Paid So Far", value: fmtAmt(student.paid_fees),    color: "emerald" },
              { label: "Balance Due", value: fmtAmt(student.balance_amount), color: "red"   },
            ].map(({ label, value, color }) => (
              <div key={label} className={`rounded-xl px-3 py-3 text-center ${
                color === "red"     ? "bg-red-50 border border-red-100"     :
                color === "emerald" ? "bg-emerald-50 border border-emerald-100" :
                "bg-slate-50"
              }`}>
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">{label}</p>
                <p className={`text-sm font-black ${
                  color === "red"     ? "text-red-600"     :
                  color === "emerald" ? "text-emerald-600" :
                  "text-slate-800"
                }`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Amount */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5 block">
              Payment Amount <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
              <input
                type="number"
                placeholder="0"
                value={amount}
                onChange={e => { setAmount(e.target.value); setError(""); }}
                className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
              />
            </div>
            {/* Quick amount buttons */}
            <div className="flex gap-2 mt-2">
              {[balance, balance / 2, 5000, 10000].filter(v => v > 0 && v <= balance).map((v, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setAmount(String(Math.round(v)))}
                  className="text-xs font-bold px-3 py-1.5 bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-700 rounded-lg transition"
                >
                  {i === 0 ? "Full" : i === 1 ? "Half" : fmtAmt(v)}
                </button>
              ))}
            </div>
          </div>

          {/* Payment mode */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5 block">
              Payment Mode
            </label>
            <select
              value={mode}
              onChange={e => setMode(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {["Cash", "UPI", "Bank Transfer", "Cheque", "DD", "Card"].map(m => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Reference number */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5 block">
              Reference / Transaction No (optional)
            </label>
            <input
              type="text"
              placeholder="UTR / Transaction ID"
              value={refNo}
              onChange={e => setRefNo(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Payment date */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5 block">
              Payment Date
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving || !amount}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-emerald-200 text-sm"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {saving ? "Saving..." : "Record Payment"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── View Payment History Modal ────────────────────────────────────────────────
function ViewPaymentModal({
  student,
  onClose,
  onRecord,
}: {
  student:  any;
  onClose:  () => void;
  onRecord: () => void;
}) {
  const status = paymentStatus(student);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-black text-slate-800">{student.full_name}</h3>
            <p className="text-xs text-slate-400">{student.course_name || student.course_interested}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
        <div className="p-6 space-y-4">

          {/* Status badge */}
          <div className="flex items-center justify-between">
            <span className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider ${STATUS_STYLE[status]}`}>
              {STATUS_LABEL[status]}
            </span>
            {Number(student.balance_amount) > 0 && (
              <button
                onClick={() => { onClose(); onRecord(); }}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition"
              >
                <Plus className="w-3 h-3" /> Record Payment
              </button>
            )}
          </div>

          {/* Fee breakdown */}
          <div className="space-y-2">
            {[
              { label: "Course Fees",    value: fmtAmt(student.course_fees),    bold: false },
              { label: "Total Fees",     value: fmtAmt(student.total_fees),     bold: false },
              { label: "Paid Fees",      value: fmtAmt(student.paid_fees),      bold: false, green: true },
              { label: "Instalment 1",   value: fmtAmt(student.instalment_1),   bold: false },
              { label: "Instalment 2",   value: fmtAmt(student.instalment_2),   bold: false },
              { label: "Balance Due",    value: fmtAmt(student.balance_amount), bold: true,  red: Number(student.balance_amount) > 0 },
            ].map(({ label, value, bold, green, red }) => (
              <div key={label} className={`flex items-center justify-between px-4 py-3 rounded-xl ${
                red ? "bg-red-50 border border-red-100" : green ? "bg-emerald-50 border border-emerald-100" : "bg-slate-50"
              }`}>
                <p className="text-sm font-semibold text-slate-600">{label}</p>
                <p className={`text-sm font-black ${red ? "text-red-600" : green ? "text-emerald-600" : "text-slate-800"}`}>
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Payment info */}
          <div className="bg-slate-50 rounded-xl px-4 py-3 space-y-1.5">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Last Payment Details</p>
            {[
              ["Mode",       student.payment_mode   || "—"],
              ["Date",       fmtDate(student.payment_date)],
              ["Ref No",     student.payment_ref_no || "—"],
              ["Counsellor", student.counsellor_name || "—"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between">
                <span className="text-xs text-slate-400 font-semibold">{label}</span>
                <span className="text-xs text-slate-700 font-bold">{value}</span>
              </div>
            ))}
          </div>

          <button onClick={onClose} className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-700 transition">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Payment Page ─────────────────────────────────────────────────────────
export default function PaymentPage() {
  const [students,   setStudents]   = useState<any[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [filter,     setFilter]     = useState("all");
  const [selected,   setSelected]   = useState<any | null>(null);
  const [showView,   setShowView]   = useState(false);
  const [showRecord, setShowRecord] = useState(false);
  const [success,    setSuccess]    = useState("");

  const token = getToken();
  const headers = {
    Authorization:  `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // ── Fetch ───────────────────────────────────────────────────────────────────
  const fetchStudents = () => {
    setLoading(true);
    fetch(`${API}/api/admissions`, { headers })
      .then(r => r.json())
      .then(d => setStudents(Array.isArray(d) ? d : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchStudents(); }, []);

  // ── Record payment ──────────────────────────────────────────────────────────
  const handleRecordPayment = async (id: number, data: any) => {
    const res = await fetch(`${API}/api/admissions/${id}`, {
      method:  "PATCH",
      headers,
      body:    JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error ?? "Failed to update");

    // Update local state
    setStudents(prev =>
      prev.map(s => s.id === id ? { ...s, ...data } : s)
    );
    setSuccess(`Payment recorded for ${students.find(s => s.id === id)?.full_name}`);
    setTimeout(() => setSuccess(""), 3000);
  };

  // ── Stats ────────────────────────────────────────────────────────────────────
  const totalRevenue  = students.reduce((sum, s) => sum + Number(s.paid_fees || 0), 0);
  const totalPending  = students.reduce((sum, s) => sum + Number(s.balance_amount || 0), 0);
  const paidCount     = students.filter(s => paymentStatus(s) === "paid").length;
  const partialCount  = students.filter(s => paymentStatus(s) === "partial").length;
  const pendingCount  = students.filter(s => paymentStatus(s) === "pending").length;

  // ── Filter ───────────────────────────────────────────────────────────────────
  const filtered = students.filter(s => {
    const matchSearch = !search ||
      s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.course_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.mobile_number?.includes(search);
    const matchFilter = filter === "all" || paymentStatus(s) === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6">

      {/* Modals */}
      {showView && selected && (
        <ViewPaymentModal
          student={selected}
          onClose={() => setShowView(false)}
          onRecord={() => setShowRecord(true)}
        />
      )}
      {showRecord && selected && (
        <RecordPaymentModal
          student={selected}
          onClose={() => setShowRecord(false)}
          onSave={handleRecordPayment}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800">Payments</h2>
            <p className="text-xs text-slate-400 font-semibold">
              {students.length} students · Track and record fee payments
            </p>
          </div>
        </div>
        <button
          onClick={fetchStudents}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Success toast */}
      {success && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm font-semibold">
          <Check className="w-4 h-4" /> {success}
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Collected", value: fmtAmt(totalRevenue),  icon: TrendingUp,    color: "emerald" },
          { label: "Total Pending",   value: fmtAmt(totalPending),  icon: AlertCircle,   color: "red",    alert: totalPending > 0 },
          { label: "Fully Paid",      value: `${paidCount} students`, icon: CheckCircle, color: "blue"   },
          { label: "Partial / Pending", value: `${partialCount + pendingCount} students`, icon: Clock, color: "amber" },
        ].map(({ label, value, icon: Icon, color, alert }) => (
          <div key={label} className={`bg-white rounded-2xl p-5 shadow-sm border ${alert ? "border-red-200" : "border-slate-50"}`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${
              color === "emerald" ? "bg-emerald-50" :
              color === "red"     ? "bg-red-50"     :
              color === "blue"    ? "bg-blue-50"    :
              "bg-amber-50"
            }`}>
              <Icon className={`w-4 h-4 ${
                color === "emerald" ? "text-emerald-600" :
                color === "red"     ? "text-red-600"     :
                color === "blue"    ? "text-blue-600"    :
                "text-amber-600"
              }`} />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
            <p className={`text-xl font-black mt-1 ${
              color === "emerald" ? "text-emerald-600" :
              color === "red"     ? "text-red-600"     :
              "text-slate-800"
            }`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: "all",     label: "All",     count: students.length },
          { key: "paid",    label: "Paid",    count: paidCount       },
          { key: "partial", label: "Partial", count: partialCount    },
          { key: "pending", label: "Pending", count: pendingCount    },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition ${
              filter === tab.key
                ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {tab.label}
            <span className={`text-xs px-2 py-0.5 rounded-lg font-black ${
              filter === tab.key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name, course, mobile..."
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
            <span className="font-semibold text-sm">Loading payments...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <CreditCard className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 font-semibold">No records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-4 py-3.5 text-xs font-black uppercase tracking-wider text-slate-400">#</th>
                  <th className="text-left px-4 py-3.5 text-xs font-black uppercase tracking-wider text-slate-400">Student</th>
                  <th className="text-left px-4 py-3.5 text-xs font-black uppercase tracking-wider text-slate-400">Course</th>
                  <th className="text-left px-4 py-3.5 text-xs font-black uppercase tracking-wider text-slate-400">Total Fees</th>
                  <th className="text-left px-4 py-3.5 text-xs font-black uppercase tracking-wider text-slate-400">Paid</th>
                  <th className="text-left px-4 py-3.5 text-xs font-black uppercase tracking-wider text-slate-400">Balance</th>
                  <th className="text-left px-4 py-3.5 text-xs font-black uppercase tracking-wider text-slate-400">Mode</th>
                  <th className="text-left px-4 py-3.5 text-xs font-black uppercase tracking-wider text-slate-400">Status</th>
                  <th className="text-left px-4 py-3.5 text-xs font-black uppercase tracking-wider text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => {
                  const status = paymentStatus(s);
                  return (
                    <tr key={s.id} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/40"}>
                      <td className="px-4 py-3.5 text-slate-400 text-xs font-semibold">{i + 1}</td>

                      <td className="px-4 py-3.5">
                        <p className="font-bold text-slate-800">{s.full_name}</p>
                        <p className="text-[11px] text-slate-400">{s.mobile_number}</p>
                      </td>

                      <td className="px-4 py-3.5 text-slate-600 font-medium text-xs">
                        {s.course_name || s.course_interested}
                      </td>

                      <td className="px-4 py-3.5 font-semibold text-slate-700 text-xs">
                        {fmtAmt(s.total_fees)}
                      </td>

                      <td className="px-4 py-3.5 font-black text-emerald-600 text-xs">
                        {fmtAmt(s.paid_fees)}
                      </td>

                      <td className="px-4 py-3.5">
                        <span className={`text-xs font-black ${Number(s.balance_amount) > 0 ? "text-red-600" : "text-emerald-600"}`}>
                          {Number(s.balance_amount) > 0 ? fmtAmt(s.balance_amount) : "Cleared"}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-slate-500 text-xs">
                        {s.payment_mode || "—"}
                      </td>

                      <td className="px-4 py-3.5">
                        <span className={`px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider ${STATUS_STYLE[status]}`}>
                          {STATUS_LABEL[status]}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setSelected(s); setShowView(true); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold transition"
                          >
                            <Eye className="w-3 h-3" /> View
                          </button>
                          {Number(s.balance_amount) > 0 && (
                            <button
                              onClick={() => { setSelected(s); setShowRecord(true); }}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition"
                            >
                              <Plus className="w-3 h-3" /> Pay
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between flex-wrap gap-2">
            <p className="text-xs font-semibold text-slate-400">
              Showing {filtered.length} of {students.length} students
            </p>
            <div className="flex gap-4">
              <span className="text-xs font-semibold text-emerald-600">
                Collected: <span className="font-black">{fmtAmt(totalRevenue)}</span>
              </span>
              <span className="text-xs font-semibold text-red-600">
                Pending: <span className="font-black">{fmtAmt(totalPending)}</span>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
