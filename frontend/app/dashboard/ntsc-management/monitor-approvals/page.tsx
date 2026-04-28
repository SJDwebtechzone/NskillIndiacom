"use client";

import { useEffect, useState } from "react";
import {
  Eye, Check, AlertCircle, Clock, Loader2,
  Search, RefreshCw, X, CheckCircle, XCircle,
  User, BookOpen, Phone, Calendar, MessageSquare,
  Shield, Filter,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

const fmtDate = (d: string) =>
  d ? new Date(d).toLocaleDateString("en-IN") : "—";
const fmtAmt = (n: any) =>
  n ? `₹${Number(n).toLocaleString("en-IN")}` : "₹0";

// ─── Status config ─────────────────────────────────────────────────────────────
const VSTATUS: Record<string, { color: string; icon: any; label: string }> = {
  "Pending Review": { color: "amber",  icon: Clock,        label: "Pending Review" },
  "Verified":       { color: "green",  icon: CheckCircle,  label: "Verified"       },
  "Needs Update":   { color: "red",    icon: XCircle,      label: "Needs Update"   },
};

const VBADGE: Record<string, string> = {
  "Pending Review": "bg-amber-100 text-amber-700",
  "Verified":       "bg-emerald-100 text-emerald-700",
  "Needs Update":   "bg-red-100 text-red-700",
};

// ─── Verify Modal ──────────────────────────────────────────────────────────────
function VerifyModal({
  student,
  onClose,
  onSave,
}: {
  student:  any;
  onClose:  () => void;
  onSave:   (id: number, status: string, remarks: string) => Promise<void>;
}) {
  const [status,   setStatus]   = useState(student.verified_status ?? "Pending Review");
  const [remarks,  setRemarks]  = useState(student.verified_remarks ?? "");
  const [saving,   setSaving]   = useState(false);
  const [viewTab,  setViewTab]  = useState<"info" | "verify">("info");

  const handleSave = async () => {
    setSaving(true);
    await onSave(student.id, status, remarks);
    setSaving(false);
    onClose();
  };

  const backendBase = API ?? "http://localhost:5000";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {student.photo_url && (
              <img
                src={`${backendBase}/${student.photo_url?.replace(/\\/g, "/")}`}
                alt={student.full_name}
                className="w-11 h-11 rounded-xl object-cover border border-slate-200"
                onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            )}
            <div>
              <h3 className="font-black text-slate-800">{student.full_name}</h3>
              <p className="text-xs text-slate-400">{student.admission_number || student.enquiry_id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-6 shrink-0">
          {(["info", "verify"] as const).map(t => (
            <button
              key={t}
              onClick={() => setViewTab(t)}
              className={`px-4 py-3 text-sm font-bold capitalize border-b-2 transition -mb-px ${
                viewTab === t
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              {t === "info" ? "Student Info" : "Approve / Verify"}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6">

          {/* Info tab */}
          {viewTab === "info" && (
            <div className="space-y-4">
              {/* Personal */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <User className="w-3 h-3" /> Personal Details
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ["Full Name",    student.full_name],
                    ["Gender",       student.gender],
                    ["DOB",          fmtDate(student.dob)],
                    ["Mobile",       student.mobile_number],
                    ["WhatsApp",     student.whatsapp_number],
                    ["Email",        student.email_id],
                    ["City",         student.city],
                    ["State",        student.state],
                    ["Aadhaar",      student.aadhaar_number ? "✓ Provided" : "✗ Missing"],
                  ].map(([label, value]) => (
                    <div key={label} className="bg-slate-50 rounded-xl px-3 py-2.5">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</p>
                      <p className="text-sm font-semibold text-slate-700 mt-0.5">{value || "—"}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Course */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <BookOpen className="w-3 h-3" /> Course Details
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ["Course",         student.course_name || student.course_interested],
                    ["Level",          student.course_level],
                    ["Mode",           student.mode_of_training],
                    ["Batch",          student.batch_allotted || "Not assigned"],
                    ["Counsellor",     student.counsellor_name],
                    ["Referral Source",student.referral_source],
                    ["Admission Date", fmtDate(student.admission_date)],
                    ["Created By",     student.associate_name || "Admin"],
                  ].map(([label, value]) => (
                    <div key={label} className="bg-slate-50 rounded-xl px-3 py-2.5">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</p>
                      <p className="text-sm font-semibold text-slate-700 mt-0.5">{value || "—"}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fees */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <Shield className="w-3 h-3" /> Fee Details
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ["Total Fees",   fmtAmt(student.total_fees)],
                    ["Paid",         fmtAmt(student.paid_fees)],
                    ["Balance",      fmtAmt(student.balance_amount)],
                    ["Payment Mode", student.payment_mode],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className={`rounded-xl px-3 py-2.5 ${
                        label === "Balance" && Number(student.balance_amount) > 0
                          ? "bg-red-50 border border-red-100"
                          : "bg-slate-50"
                      }`}
                    >
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</p>
                      <p className={`text-sm font-semibold mt-0.5 ${
                        label === "Balance" && Number(student.balance_amount) > 0
                          ? "text-red-600"
                          : "text-slate-700"
                      }`}>{value || "—"}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Documents checklist */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
                  Documents Submitted
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ["Aadhaar",        student.has_aadhaar_file],
                    ["Education Cert", student.has_edu_certs_file],
                    ["Passport",       student.has_passport_file],
                    ["Resume",         student.has_resume_file],
                    ["Address Proof",  student.has_address_proof_file],
                    ["Photos",         student.has_photos_file],
                  ].map(([label, val]) => (
                    <div
                      key={label}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl ${
                        val ? "bg-emerald-50 border border-emerald-100" : "bg-slate-50 border border-slate-100"
                      }`}
                    >
                      {val
                        ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        : <XCircle    className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                      }
                      <span className={`text-xs font-semibold ${val ? "text-emerald-700" : "text-slate-400"}`}>
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Verify tab */}
          {viewTab === "verify" && (
            <div className="space-y-5">
              {/* Current status */}
              <div className="bg-slate-50 rounded-2xl p-4">
                <p className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Current Status</p>
                <span className={`px-3 py-1.5 rounded-xl text-sm font-black ${VBADGE[student.verified_status ?? "Pending Review"]}`}>
                  {student.verified_status ?? "Pending Review"}
                </span>
                {student.verified_at && (
                  <p className="text-xs text-slate-400 mt-2">
                    Last updated: {fmtDate(student.verified_at)}
                  </p>
                )}
                {student.verified_remarks && (
                  <div className="mt-3 bg-white rounded-xl px-3 py-2.5 border border-slate-100">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-0.5">Previous Remarks</p>
                    <p className="text-sm text-slate-600">{student.verified_remarks}</p>
                  </div>
                )}
              </div>

              {/* Update status */}
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2 block">
                  Update Verification Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(VSTATUS).map(([key, cfg]) => {
                    const Icon = cfg.icon;
                    const selected = status === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setStatus(key)}
                        className={`flex flex-col items-center gap-2 px-3 py-4 rounded-2xl border-2 transition-all ${
                          selected
                            ? cfg.color === "amber" ? "border-amber-400 bg-amber-50"
                            : cfg.color === "green" ? "border-emerald-400 bg-emerald-50"
                            : "border-red-400 bg-red-50"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${
                          selected
                            ? cfg.color === "amber" ? "text-amber-500"
                            : cfg.color === "green" ? "text-emerald-500"
                            : "text-red-500"
                            : "text-slate-300"
                        }`} />
                        <span className={`text-[11px] font-black text-center leading-tight ${
                          selected ? "text-slate-800" : "text-slate-400"
                        }`}>
                          {cfg.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2 block">
                  Remarks / Notes (optional)
                </label>
                <textarea
                  rows={4}
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  placeholder={
                    status === "Needs Update"
                      ? "Describe what needs to be corrected..."
                      : status === "Verified"
                      ? "All documents verified. Student details confirmed."
                      : "Add any notes..."
                  }
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Warning for Needs Update */}
              {status === "Needs Update" && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700 font-semibold">
                    This will flag the student record for correction. Please add remarks explaining what needs to be updated.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 shrink-0 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition"
          >
            Cancel
          </button>
          {viewTab === "verify" && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl font-bold text-sm transition"
            >
              {saving
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Check className="w-4 h-4" />
              }
              {saving ? "Saving..." : "Save Verification"}
            </button>
          )}
          {viewTab === "info" && (
            <button
              onClick={() => setViewTab("verify")}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition"
            >
              Proceed to Verify <CheckCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function MonitorApprovalsPage() {
  const [students,    setStudents]    = useState<any[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");
  const [filterV,     setFilterV]     = useState("all");
  const [selected,    setSelected]    = useState<any | null>(null);
  const [success,     setSuccess]     = useState("");

  const token = typeof window !== "undefined"
    ? localStorage.getItem("token") ?? ""
    : "";

  const headers = {
    "Content-Type": "application/json",
    Authorization:  `Bearer ${token}`,
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

  // ── Verify action ───────────────────────────────────────────────────────────
  const handleVerify = async (id: number, status: string, remarks: string) => {
    const res = await fetch(`${API}/api/admissions/${id}/verify`, {
      method: "PATCH",
      headers,
      body:   JSON.stringify({ verified_status: status, verified_remarks: remarks }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Failed to save");

    // Update local state
    setStudents(prev =>
      prev.map(s => s.id === id
        ? { ...s, verified_status: status, verified_remarks: remarks, verified_at: new Date().toISOString() }
        : s
      )
    );
    setSuccess(`${data.student?.full_name ?? "Student"} marked as ${status}`);
    setTimeout(() => setSuccess(""), 3000);
  };

  // ── Filter ───────────────────────────────────────────────────────────────────
  const filtered = students.filter(s => {
    const matchSearch = !search ||
      s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.admission_number?.toLowerCase().includes(search.toLowerCase()) ||
      s.mobile_number?.includes(search) ||
      s.course_name?.toLowerCase().includes(search.toLowerCase());

    const vs = s.verified_status ?? "Pending Review";
    const matchV = filterV === "all" || vs === filterV;

    return matchSearch && matchV;
  });

  // ── Counts ───────────────────────────────────────────────────────────────────
  const counts = {
    all:             students.length,
    "Pending Review":students.filter(s => (s.verified_status ?? "Pending Review") === "Pending Review").length,
    "Verified":      students.filter(s => s.verified_status === "Verified").length,
    "Needs Update":  students.filter(s => s.verified_status === "Needs Update").length,
  };

  return (
    <div className="space-y-6">

      {/* Modal */}
      {selected && (
        <VerifyModal
          student={selected}
          onClose={() => setSelected(null)}
          onSave={handleVerify}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
            <Eye className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800">Monitor Student Changes & Approval</h2>
            <p className="text-xs text-slate-400 font-semibold">
              {counts["Pending Review"]} pending review · {counts["Verified"]} verified · {counts["Needs Update"]} needs update
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

      {/* Alert if pending reviews exist */}
      {counts["Pending Review"] > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
          <div>
            <p className="text-sm font-black text-amber-800">
              {counts["Pending Review"]} student records pending review
            </p>
            <p className="text-xs text-amber-600 font-medium mt-0.5">
              Please verify student details and documents to approve or flag for update.
            </p>
          </div>
        </div>
      )}

      {/* Success toast */}
      {success && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm font-semibold">
          <Check className="w-4 h-4" /> {success}
        </div>
      )}

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: "all",             label: "All",           count: counts.all,              color: "" },
          { key: "Pending Review",  label: "Pending Review",count: counts["Pending Review"], color: "amber"   },
          { key: "Verified",        label: "Verified",      count: counts["Verified"],       color: "emerald" },
          { key: "Needs Update",    label: "Needs Update",  count: counts["Needs Update"],   color: "red"     },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilterV(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition ${
              filterV === tab.key
                ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {tab.label}
            <span className={`text-xs px-2 py-0.5 rounded-lg font-black ${
              filterV === tab.key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
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
          placeholder="Search by name, admission no, mobile, course..."
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
            <Eye className="w-10 h-10 text-slate-200 mx-auto mb-3" />
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
                  <th className="text-left px-4 py-3.5 text-xs font-black uppercase tracking-wider text-slate-400">Admitted By</th>
                  <th className="text-left px-4 py-3.5 text-xs font-black uppercase tracking-wider text-slate-400">Docs</th>
                  <th className="text-left px-4 py-3.5 text-xs font-black uppercase tracking-wider text-slate-400">Balance</th>
                  <th className="text-left px-4 py-3.5 text-xs font-black uppercase tracking-wider text-slate-400">Verification</th>
                  <th className="text-left px-4 py-3.5 text-xs font-black uppercase tracking-wider text-slate-400">Remarks</th>
                  <th className="text-left px-4 py-3.5 text-xs font-black uppercase tracking-wider text-slate-400">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => {
                  const vs       = s.verified_status ?? "Pending Review";
                  const docCount = [
                    s.has_aadhaar_file, s.has_edu_certs_file, s.has_passport_file,
                    s.has_resume_file, s.has_address_proof_file, s.has_photos_file,
                  ].filter(Boolean).length;

                  return (
                    <tr key={s.id} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/40"}>
                      <td className="px-4 py-3.5 text-slate-400 text-xs font-semibold">{i + 1}</td>

                      <td className="px-4 py-3.5">
                        <p className="font-bold text-slate-800">{s.full_name}</p>
                        <p className="text-[11px] text-slate-400">{s.mobile_number}</p>
                      </td>

                      <td className="px-4 py-3.5 text-slate-600 font-medium text-xs">
                        {s.course_name || s.course_interested}
                        <span className="block text-slate-400">{fmtDate(s.admission_date)}</span>
                      </td>

                      <td className="px-4 py-3.5 text-xs">
                        <p className="font-semibold text-slate-700">{s.associate_name ?? "Admin"}</p>
                        <p className="text-slate-400">{s.referral_source}</p>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className={`text-xs font-black px-2 py-0.5 rounded-lg ${
                          docCount === 6 ? "bg-emerald-100 text-emerald-700" :
                          docCount > 0   ? "bg-amber-100 text-amber-700"    :
                          "bg-slate-100 text-slate-500"
                        }`}>
                          {docCount}/6
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        {Number(s.balance_amount) > 0 ? (
                          <span className="text-xs font-black text-red-600">
                            ₹{Number(s.balance_amount).toLocaleString("en-IN")}
                          </span>
                        ) : (
                          <span className="text-xs font-black text-emerald-600">Cleared</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <span className={`px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider ${VBADGE[vs]}`}>
                          {vs}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 max-w-[150px]">
                        <p className="text-xs text-slate-500 truncate">
                          {s.verified_remarks || "—"}
                        </p>
                      </td>

                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => setSelected(s)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition"
                        >
                          <Eye className="w-3 h-3" />
                          {vs === "Pending Review" ? "Review" : "Update"}
                        </button>
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
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400">
              Showing {filtered.length} of {students.length} students
            </p>
            <div className="flex gap-3">
              <span className="text-xs font-semibold text-amber-600">
                Pending: <span className="font-black">{counts["Pending Review"]}</span>
              </span>
              <span className="text-xs font-semibold text-emerald-600">
                Verified: <span className="font-black">{counts["Verified"]}</span>
              </span>
              <span className="text-xs font-semibold text-red-600">
                Needs Update: <span className="font-black">{counts["Needs Update"]}</span>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
