"use client";

import { useEffect, useState } from "react";
import {
  Printer, Search, Loader2, Eye,
  RefreshCw, FileText, User, Filter,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

const fmtDate = (d: string) =>
  d ? new Date(d).toLocaleDateString("en-IN") : "—";
const fmtAmt = (n: any) =>
  n ? `₹${Number(n).toLocaleString("en-IN")}` : "₹0";

// ─── A4 Print Page ─────────────────────────────────────────────────────────────
function openPrintPage(student: any) {
  const backendBase = API ?? "http://localhost:5000";
  const photoUrl = student.photo_url
    ? `${backendBase}/${student.photo_url.replace(/\\/g, "/")}`
    : null;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Admission Form - ${student.full_name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: Arial, sans-serif;
      font-size: 11px;
      color: #1a1a1a;
      background: white;
    }
    .page {
      width: 210mm;
      min-height: 297mm;
      padding: 12mm 14mm;
      margin: 0 auto;
      background: white;
    }

    /* Header */
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 3px solid #1e3a6e;
      padding-bottom: 10px;
      margin-bottom: 12px;
    }
    .header-left { display: flex; align-items: center; gap: 12px; }
    .logo-box {
      width: 56px; height: 56px;
      background: #1e3a6e;
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      color: white; font-size: 18px; font-weight: 900;
    }
    .institute-name { font-size: 16px; font-weight: 900; color: #1e3a6e; }
    .institute-sub  { font-size: 10px; color: #666; margin-top: 2px; }
    .form-title {
      font-size: 13px; font-weight: 700;
      color: #1e3a6e; text-align: right;
    }
    .adm-no {
      font-size: 10px; color: #666;
      text-align: right; margin-top: 2px;
    }

    /* Photo box */
    .top-row {
      display: flex;
      gap: 12px;
      margin-bottom: 10px;
    }
    .photo-box {
      width: 90px; height: 110px;
      border: 1px solid #ccc;
      border-radius: 4px;
      overflow: hidden;
      flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      background: #f5f5f5;
      font-size: 10px; color: #999;
    }
    .photo-box img { width: 100%; height: 100%; object-fit: cover; }
    .top-info { flex: 1; }

    /* Section */
    .section {
      margin-bottom: 10px;
    }
    .section-title {
      background: #1e3a6e;
      color: white;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 4px 8px;
      margin-bottom: 6px;
      border-radius: 2px;
    }

    /* Grid */
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 12px; }
    .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4px 12px; }
    .field  { padding: 3px 0; border-bottom: 1px dotted #ddd; }
    .field-label { font-size: 9px; color: #888; text-transform: uppercase; letter-spacing: 0.04em; }
    .field-value { font-size: 11px; font-weight: 600; color: #1a1a1a; margin-top: 1px; }

    /* Fee table */
    .fee-table { width: 100%; border-collapse: collapse; }
    .fee-table th, .fee-table td {
      border: 1px solid #ddd;
      padding: 4px 8px;
      font-size: 10px;
      text-align: left;
    }
    .fee-table th {
      background: #f0f4ff;
      font-weight: 700;
      color: #1e3a6e;
    }
    .fee-table .highlight { background: #fff3f3; font-weight: 700; color: #c0392b; }
    .fee-table .cleared   { background: #f0fff4; font-weight: 700; color: #27ae60; }

    /* Declarations */
    .decl-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 4px;
    }
    .decl-item {
      display: flex; align-items: center; gap: 4px;
      font-size: 9px; color: #555;
    }
    .tick { color: #27ae60; font-size: 12px; }
    .cross { color: #ccc; font-size: 12px; }

    /* Signatures */
    .sig-row {
      display: flex; gap: 20px;
      margin-top: 16px;
      border-top: 1px solid #ddd;
      padding-top: 12px;
    }
    .sig-box { flex: 1; text-align: center; }
    .sig-line {
      border-top: 1px solid #333;
      margin: 24px 10px 4px;
    }
    .sig-label { font-size: 9px; color: #666; }

    /* Footer */
    .page-footer {
      margin-top: 16px;
      border-top: 2px solid #1e3a6e;
      padding-top: 6px;
      display: flex;
      justify-content: space-between;
      font-size: 9px;
      color: #888;
    }

    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
      .page { padding: 10mm 12mm; }
      @page { size: A4; margin: 0; }
    }
  </style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div class="header">
    <div class="header-left">
      <div class="logo-box">NS</div>
      <div>
        <div class="institute-name">NTSC Training Institute</div>
        <div class="institute-sub">Kovur, Chennai, Tamil Nadu | +91 98842 09774</div>
        <div class="institute-sub">Govt. Certified · NSDC Approved Skill Training Centre</div>
      </div>
    </div>
    <div>
      <div class="form-title">STUDENT ADMISSION FORM</div>
      <div class="adm-no">Admission No: ${student.admission_number || student.enquiry_id || "—"}</div>
      <div class="adm-no">Date: ${fmtDate(student.admission_date)}</div>
    </div>
  </div>

  <!-- Photo + Basic Info -->
  <div class="top-row">
    <div class="photo-box">
      ${photoUrl
        ? `<img src="${photoUrl}" alt="Student Photo" />`
        : "Photo"
      }
    </div>
    <div class="top-info">
      <div class="grid-2">
        <div class="field">
          <div class="field-label">Full Name</div>
          <div class="field-value">${student.full_name || "—"}</div>
        </div>
        <div class="field">
          <div class="field-label">Gender</div>
          <div class="field-value">${student.gender || "—"}</div>
        </div>
        <div class="field">
          <div class="field-label">Date of Birth</div>
          <div class="field-value">${fmtDate(student.dob)}</div>
        </div>
        <div class="field">
          <div class="field-label">Age</div>
          <div class="field-value">${student.age || "—"}</div>
        </div>
        <div class="field">
          <div class="field-label">Aadhaar Number</div>
          <div class="field-value">${student.aadhaar_number || "—"}</div>
        </div>
        <div class="field">
          <div class="field-label">Passport Number</div>
          <div class="field-value">${student.passport_number || "—"}</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Contact -->
  <div class="section">
    <div class="section-title">Contact Information</div>
    <div class="grid-3">
      <div class="field"><div class="field-label">Mobile</div><div class="field-value">${student.mobile_number || "—"}</div></div>
      <div class="field"><div class="field-label">WhatsApp</div><div class="field-value">${student.whatsapp_number || "—"}</div></div>
      <div class="field"><div class="field-label">Email</div><div class="field-value">${student.email_id || "—"}</div></div>
      <div class="field"><div class="field-label">City</div><div class="field-value">${student.city || "—"}</div></div>
      <div class="field"><div class="field-label">State</div><div class="field-value">${student.state || "—"}</div></div>
      <div class="field"><div class="field-label">Pin Code</div><div class="field-value">${student.pin_code || "—"}</div></div>
    </div>
    <div class="field" style="margin-top:4px">
      <div class="field-label">Address</div>
      <div class="field-value">${student.residential_address || "—"}</div>
    </div>
  </div>

  <!-- Education -->
  <div class="section">
    <div class="section-title">Educational Background</div>
    <div class="grid-3">
      <div class="field"><div class="field-label">Qualification</div><div class="field-value">${student.highest_qualification || "—"}</div></div>
      <div class="field"><div class="field-label">Year of Passing</div><div class="field-value">${student.year_of_passing || "—"}</div></div>
      <div class="field"><div class="field-label">Institution</div><div class="field-value">${student.institution_name || "—"}</div></div>
      <div class="field"><div class="field-label">Board / University</div><div class="field-value">${student.board_university || "—"}</div></div>
      <div class="field"><div class="field-label">Medium</div><div class="field-value">${student.medium_of_study || "—"}</div></div>
      <div class="field"><div class="field-label">Experience</div><div class="field-value">${student.total_experience || "—"}</div></div>
    </div>
  </div>

  <!-- Course -->
  <div class="section">
    <div class="section-title">Course Enrollment Details</div>
    <div class="grid-3">
      <div class="field"><div class="field-label">Course Name</div><div class="field-value">${student.course_name || student.course_interested || "—"}</div></div>
      <div class="field"><div class="field-label">Level</div><div class="field-value">${student.course_level || "—"}</div></div>
      <div class="field"><div class="field-label">Mode of Training</div><div class="field-value">${student.mode_of_training || "—"}</div></div>
      <div class="field"><div class="field-label">Batch Allotted</div><div class="field-value">${student.batch_allotted || "Not assigned"}</div></div>
      <div class="field"><div class="field-label">Training Location</div><div class="field-value">${student.training_location || "—"}</div></div>
      <div class="field"><div class="field-label">Career Goal</div><div class="field-value">${student.career_goal || "—"}</div></div>
      <div class="field"><div class="field-label">Counsellor</div><div class="field-value">${student.counsellor_name || "—"}</div></div>
      <div class="field"><div class="field-label">Counsellor Code</div><div class="field-value">${student.counsellor_code || "—"}</div></div>
      <div class="field"><div class="field-label">Referral Source</div><div class="field-value">${student.referral_source || "—"}</div></div>
    </div>
  </div>

  <!-- Fee Details -->
  <div class="section">
    <div class="section-title">Fee Details</div>
    <table class="fee-table">
      <thead>
        <tr>
          <th>Course Fees</th>
          <th>Total Fees</th>
          <th>Paid Fees</th>
          <th>Instalment 1</th>
          <th>Instalment 2</th>
          <th>Balance Due</th>
          <th>Payment Mode</th>
          <th>Payment Date</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${fmtAmt(student.course_fees)}</td>
          <td>${fmtAmt(student.total_fees)}</td>
          <td>${fmtAmt(student.paid_fees)}</td>
          <td>${fmtAmt(student.instalment_1)}</td>
          <td>${fmtAmt(student.instalment_2)}</td>
          <td class="${Number(student.balance_amount) > 0 ? "highlight" : "cleared"}">
            ${Number(student.balance_amount) > 0 ? fmtAmt(student.balance_amount) : "Cleared"}
          </td>
          <td>${student.payment_mode || "—"}</td>
          <td>${fmtDate(student.payment_date)}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Parent / Emergency -->
  <div class="section">
    <div class="section-title">Parent / Emergency Contact</div>
    <div class="grid-3">
      <div class="field"><div class="field-label">Parent Name</div><div class="field-value">${student.parent_name || "—"}</div></div>
      <div class="field"><div class="field-label">Relationship</div><div class="field-value">${student.relationship || "—"}</div></div>
      <div class="field"><div class="field-label">Parent Mobile</div><div class="field-value">${student.parent_mobile || "—"}</div></div>
      <div class="field"><div class="field-label">Emergency Contact</div><div class="field-value">${student.emergency_contact_name || "—"}</div></div>
      <div class="field"><div class="field-label">Emergency Mobile</div><div class="field-value">${student.emergency_contact_number || "—"}</div></div>
      <div class="field"><div class="field-label">Occupation</div><div class="field-value">${student.occupation || "—"}</div></div>
    </div>
  </div>

  <!-- Declarations -->
  <div class="section">
    <div class="section-title">Declarations Signed</div>
    <div class="decl-grid">
      ${[
        ["Student Declaration",   student.student_declaration],
        ["Parent Declaration",    student.parent_declaration],
        ["Placement Ack",         student.placement_ack],
        ["Discipline Ack",        student.discipline_ack],
        ["Photo Consent",         student.photo_consent],
        ["Refund Policy Ack",     student.refund_policy_ack],
        ["Data Privacy Ack",      student.data_privacy_ack],
        ["Final Undertaking",     student.final_undertaking],
        ["Overseas Disclaimer",   student.overseas_disclaimer],
      ].map(([label, val]) =>
        `<div class="decl-item">
          <span class="${val ? "tick" : "cross"}">${val ? "✓" : "✗"}</span>
          <span>${label}</span>
        </div>`
      ).join("")}
    </div>
  </div>

  <!-- Signatures -->
  <div class="sig-row">
    <div class="sig-box">
      <div class="sig-line"></div>
      <div class="sig-label">Student Signature</div>
    </div>
    <div class="sig-box">
      <div class="sig-line"></div>
      <div class="sig-label">Parent / Guardian Signature</div>
    </div>
    <div class="sig-box">
      <div class="sig-line"></div>
      <div class="sig-label">Counsellor Signature</div>
    </div>
    <div class="sig-box">
      <div class="sig-line"></div>
      <div class="sig-label">Authorised Signatory</div>
    </div>
  </div>

  <!-- Footer -->
  <div class="page-footer">
    <span>NTSC Training Institute · Kovur, Chennai · +91 98842 09774</span>
    <span>Printed on: ${new Date().toLocaleDateString("en-IN")}</span>
    <span>Admission No: ${student.admission_number || student.enquiry_id || "—"}</span>
  </div>

</div>

<script>
  window.onload = function() { window.print(); }
</script>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function DownloadA4Page() {
  const [students,  setStudents]  = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [printing,  setPrinting]  = useState<number | null>(null);

  const token = typeof window !== "undefined"
    ? localStorage.getItem("token") ?? ""
    : "";

  const fetchStudents = () => {
    setLoading(true);
    fetch(`${API}/api/admissions`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => setStudents(Array.isArray(d) ? d : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchStudents(); }, []);

  const handlePrint = (student: any) => {
    setPrinting(student.id);
    setTimeout(() => {
      openPrintPage(student);
      setPrinting(null);
    }, 300);
  };

  const filtered = students.filter(s =>
    !search ||
    s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.admission_number?.toLowerCase().includes(search.toLowerCase()) ||
    s.mobile_number?.includes(search) ||
    s.course_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
            <Printer className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800">Download A4 Sheet</h2>
            <p className="text-xs text-slate-400 font-semibold">
              {students.length} students · Print admission forms as A4 PDF
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

      {/* Info banner */}
      <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-2xl px-5 py-4">
        <Printer className="w-5 h-5 text-blue-500 shrink-0" />
        <div>
          <p className="text-sm font-bold text-blue-800">How to save as PDF</p>
          <p className="text-xs text-blue-600 mt-0.5">
            Click Print → a print dialog opens → change destination to <strong>"Save as PDF"</strong> → Save.
            Make sure paper size is set to <strong>A4</strong>.
          </p>
        </div>
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
            <FileText className="w-10 h-10 text-slate-200 mx-auto mb-3" />
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
                  <th className="text-left px-4 py-3.5 text-xs font-black uppercase tracking-wider text-slate-400">Fees Status</th>
                  <th className="text-left px-4 py-3.5 text-xs font-black uppercase tracking-wider text-slate-400">Admission Date</th>
                  <th className="text-left px-4 py-3.5 text-xs font-black uppercase tracking-wider text-slate-400">Print</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr key={s.id} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/40"}>
                    <td className="px-4 py-3.5 text-slate-400 text-xs font-semibold">{i + 1}</td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        {s.photo_url ? (
                          <img
                            src={`${API}/${s.photo_url.replace(/\\/g, "/")}`}
                            alt={s.full_name}
                            className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0"
                            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                            <User className="w-4 h-4 text-slate-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-800">{s.full_name}</p>
                          <p className="text-[11px] text-slate-400">{s.admission_number || s.enquiry_id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-slate-600 font-medium text-xs">
                      {s.course_name || s.course_interested}
                      <span className="block text-slate-400">{s.course_level}</span>
                    </td>

                    <td className="px-4 py-3.5">
                      {s.batch_allotted ? (
                        <span className="text-xs font-black bg-blue-100 text-blue-700 px-2 py-0.5 rounded-lg">
                          Batch {s.batch_allotted}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-slate-500 text-xs">{s.mobile_number}</td>

                    <td className="px-4 py-3.5">
                      {Number(s.balance_amount) > 0 ? (
                        <span className="text-xs font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-lg">
                          Due: ₹{Number(s.balance_amount).toLocaleString("en-IN")}
                        </span>
                      ) : (
                        <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">
                          Cleared
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-slate-400 text-xs">
                      {fmtDate(s.admission_date)}
                    </td>

                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => handlePrint(s)}
                        disabled={printing === s.id}
                        className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl text-xs font-bold transition shadow-sm shadow-blue-200"
                      >
                        {printing === s.id
                          ? <Loader2 className="w-3 h-3 animate-spin" />
                          : <Printer className="w-3 h-3" />
                        }
                        {printing === s.id ? "Opening..." : "Print / PDF"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
            <p className="text-xs font-semibold text-slate-400">
              Showing {filtered.length} of {students.length} students
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
