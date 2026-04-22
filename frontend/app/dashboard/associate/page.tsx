"use client";

import { useEffect, useState, useCallback, ChangeEvent } from "react";
import { useAuth } from "@/app/context/AuthContext";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Associate {
  id: number;
  full_name: string; date_of_birth: string; gender: string;
  mobile_primary: string; mobile_whatsapp: string; email: string;
  residential_address: string; city: string; district: string;
  state: string; pincode: string; legislative_assembly: string;
  current_profession: string; profession_other_specify: string;
  educational_qualification: string; special_skill: string;
  specialisation: string[]; languages_known: string[];
  languages_other: string; total_experience: string;
  experience_career_counselling: string; current_services_offered: string[];
  years_of_operation: string; avg_students_per_month: string;
  students_last_3_years: string; students_2024_25: string;
  students_2023_24: string; students_2022_23: string;
  has_office: string; office_no_street: string; office_area_name: string;
  office_location: string; office_district: string; office_city: string;
  office_pincode: string; office_legislative_assembly: string;
  office_area_sqft: string; has_separate_counselling_room: string;
  no_of_staff: string; interested_in_setting_up_office: string;
  linkedin: string; instagram: string; facebook: string;
  partnership_areas: string[]; expected_monthly_referrals: string;
  bank_account_holder: string; bank_name_branch: string;
  account_number: string; ifsc_code: string;
  additional_info: string; consent_agreed: boolean;
  consent_place: string; consent_date: string;
  status: string; has_password?: boolean; created_at: string;
  // file path fields returned by backend
  file_photo?: string;
  file_aadhaar_copy?: string;
  file_pan_copy?: string;
  file_gst_certificate?: string;
  file_address_proof?: string;
}

interface FileData {
  file_photo: File | null;
  file_aadhaar_copy: File | null;
  file_pan_copy: File | null;
  file_gst_certificate: File | null;
  file_address_proof: File | null;
}

interface Credentials { username: string; password: string; }
type Errors = Partial<Record<string, string>>;

const API = `${process.env.NEXT_PUBLIC_API_URL}/api/associate`;
const ITEMS_PER_PAGE = 5;

const STEPS = [
  "Personal Details", "Professional Details", "Service Details",
  "Office & Infrastructure", "Social & Partnership",
  "Bank & Documents", "Consent & Submit",
];

const STEP_ICONS = ["👤", "💼", "🎯", "🏢", "🔗", "📄", "✅"];

const blankForm = (): Omit<Associate, "id"|"created_at"|"status"|"has_password"> => ({
  full_name: "", date_of_birth: "", gender: "", mobile_primary: "",
  mobile_whatsapp: "", email: "", residential_address: "", city: "",
  district: "", state: "", pincode: "", legislative_assembly: "",
  current_profession: "", profession_other_specify: "",
  educational_qualification: "", special_skill: "", specialisation: [],
  languages_known: [], languages_other: "", total_experience: "",
  experience_career_counselling: "", current_services_offered: [],
  years_of_operation: "", avg_students_per_month: "",
  students_last_3_years: "", students_2024_25: "", students_2023_24: "",
  students_2022_23: "", has_office: "", office_no_street: "",
  office_area_name: "", office_location: "", office_district: "",
  office_city: "", office_pincode: "", office_legislative_assembly: "",
  office_area_sqft: "", has_separate_counselling_room: "",
  no_of_staff: "", interested_in_setting_up_office: "",
  linkedin: "", instagram: "", facebook: "", partnership_areas: [],
  expected_monthly_referrals: "", bank_account_holder: "",
  bank_name_branch: "", account_number: "", ifsc_code: "",
  additional_info: "", consent_agreed: false, consent_place: "", consent_date: "",
});

const blankFiles = (): FileData => ({
  file_photo: null, file_aadhaar_copy: null, file_pan_copy: null,
  file_gst_certificate: null, file_address_proof: null,
});

// ─── Validation ───────────────────────────────────────────────────────────────
function validateStep(step: number, form: any, files: FileData, isEdit: boolean): Errors {
  const e: Errors = {};
  if (step === 0) {
    if (!form.full_name?.trim()) e.full_name = "Full name is required";
    else if (form.full_name.trim().length < 3) e.full_name = "Min 3 characters";
    if (!form.date_of_birth) e.date_of_birth = "Date of birth is required";
    if (!form.gender) e.gender = "Please select gender";
    if (!form.mobile_primary?.trim()) e.mobile_primary = "Mobile number is required";
    else if (!/^[6-9]\d{9}$/.test(form.mobile_primary)) e.mobile_primary = "Enter valid 10-digit mobile";
    if (form.mobile_whatsapp && !/^[6-9]\d{9}$/.test(form.mobile_whatsapp))
      e.mobile_whatsapp = "Enter valid WhatsApp number";
    if (!form.email?.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    if (!form.residential_address?.trim()) e.residential_address = "Address is required";
    if (!form.city?.trim()) e.city = "City is required";
    if (!form.district?.trim()) e.district = "District is required";
    if (!form.state?.trim()) e.state = "State is required";
    if (!form.pincode?.trim()) e.pincode = "Pincode is required";
    else if (!/^\d{6}$/.test(form.pincode)) e.pincode = "Enter valid 6-digit pincode";
  }
  if (step === 1) {
    if (!form.current_profession) e.current_profession = "Please select profession";
    if (form.current_profession === "Other Business (Pl Specify)" && !form.profession_other_specify?.trim())
      e.profession_other_specify = "Please specify your profession";
    if (!form.educational_qualification?.trim()) e.educational_qualification = "Qualification is required";
  }
  if (step === 5 && !isEdit) {
    if (!files.file_aadhaar_copy) e.file_aadhaar_copy = "Aadhaar card is required";
    if (!files.file_pan_copy) e.file_pan_copy = "PAN card is required";
    if (form.account_number && !/^\d{9,18}$/.test(form.account_number))
      e.account_number = "Enter valid account number (9–18 digits)";
    if (form.ifsc_code && !/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/.test(form.ifsc_code))
      e.ifsc_code = "Enter valid IFSC (e.g. SBIN0001234)";
  }
  if (step === 6 && !isEdit) {
    if (!form.consent_agreed) e.consent_agreed = "You must agree to the declaration";
    if (!form.consent_place?.trim()) e.consent_place = "Place is required";
    if (!form.consent_date) e.consent_date = "Date is required";
  }
  return e;
}

// ─── STATUS CONFIG ────────────────────────────────────────────────────────────
const STATUS_CFG: Record<string, { bg: string; color: string; dot: string }> = {
  approved: { bg: "#d1fae5", color: "#065f46", dot: "#10b981" },
  pending:  { bg: "#fef3c7", color: "#92400e", dot: "#f59e0b" },
  rejected: { bg: "#fee2e2", color: "#991b1b", dot: "#ef4444" },
};

// ─── MINI HELPERS ─────────────────────────────────────────────────────────────
function initials(name: string) {
  return (name || "?").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}
function fmtDate(d: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function parseArr(v: any): string[] {
  if (Array.isArray(v)) return v;
  try { const p = JSON.parse(v); return Array.isArray(p) ? p : []; } catch { return []; }
}

// ─── DOCUMENT HELPERS ─────────────────────────────────────────────────────────
const DOC_FIELDS = [
  { field: "file_photo",           label: "Profile Photo",   icon: "👤" },
  { field: "file_aadhaar_copy",    label: "Aadhaar Card",    icon: "🪪" },
  { field: "file_pan_copy",        label: "PAN Card",        icon: "💳" },
  { field: "file_gst_certificate", label: "GST Certificate", icon: "🏢" },
  { field: "file_address_proof",   label: "Address Proof",   icon: "📄" },
];

function getFileUrl(associateId: number, field: string): string {
  const token = localStorage.getItem("token") || "";
  return `${process.env.NEXT_PUBLIC_API_URL}/api/associate/${associateId}/files/${field}?token=${token}`;
}

function viewDoc(associateId: number, field: string) {
  window.open(getFileUrl(associateId, field), "_blank");
}

async function downloadDoc(associateId: number, field: string, label: string) {
  try {
    const res = await fetch(getFileUrl(associateId, field));
    if (!res.ok) throw new Error("File not found on server");
    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = label.replace(/\s+/g, "_");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err: any) {
    alert("Download failed: " + err.message);
  }
}

async function printDoc(associateId: number, field: string, label: string) {
  try {
    const res  = await fetch(getFileUrl(associateId, field));
    if (!res.ok) throw new Error("File not found on server");
    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    const mime = blob.type;
    const w    = window.open("", "_blank");
    if (!w) { alert("Please allow popups to print."); return; }

    if (mime === "application/pdf") {
      w.document.write(`<!DOCTYPE html><html><head><title>${label}</title>
        <style>*{margin:0;padding:0}html,body,iframe{width:100%;height:100vh;border:none;overflow:hidden}</style>
        </head><body>
        <iframe src="${url}" onload="this.contentWindow.focus();this.contentWindow.print()"></iframe>
        </body></html>`);
    } else {
      // image (JPG / PNG)
      w.document.write(`<!DOCTYPE html><html><head><title>${label}</title>
        <style>
          *{margin:0;padding:0;box-sizing:border-box}
          body{display:flex;align-items:center;justify-content:center;
               min-height:100vh;background:#fff}
          img{max-width:100%;max-height:100vh;object-fit:contain}
        </style></head><body>
        <img src="${url}" onload="window.focus();window.print()" />
        </body></html>`);
    }
    w.document.close();
  } catch (err: any) {
    alert("Print failed: " + err.message);
  }
}

// ─── DOCUMENT SECTION COMPONENT ───────────────────────────────────────────────
const DocSection = ({ assoc }: { assoc: Associate }) => {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [printing,    setPrinting]    = useState<string | null>(null);

  const handleDownload = async (field: string, label: string) => {
    setDownloading(field);
    await downloadDoc(assoc.id, field, label);
    setDownloading(null);
  };

  const handlePrint = async (field: string, label: string) => {
    setPrinting(field);
    await printDoc(assoc.id, field, label);
    setPrinting(null);
  };

  const uploaded = DOC_FIELDS.filter(d => !!(assoc as any)[d.field]);
  const missing  = DOC_FIELDS.filter(d =>  !(assoc as any)[d.field]);

  return (
    <div style={{ gridColumn: "1/-1" }}>
      {/* Section heading */}
      <div style={{
        gridColumn: "1/-1", borderBottom: "1.5px solid #f1f5f9",
        paddingBottom: 6, marginTop: 8, marginBottom: 12,
      }}>
        <p style={{
          fontSize: "0.62rem", fontWeight: 800, textTransform: "uppercase",
          letterSpacing: "0.12em", color: "#6366f1",
        }}>📎 Documents &amp; Files</p>
      </div>

      {uploaded.length === 0 && (
        <p style={{ fontSize: "0.78rem", color: "#94a3b8", fontStyle: "italic" }}>
          No documents uploaded yet.
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {uploaded.map(({ field, label, icon }) => (
          <div key={field} style={{
            display: "flex", alignItems: "center", gap: 14,
            border: "1.5px solid #e0e7ff", borderRadius: 12,
            padding: "12px 16px", background: "#fafbff",
          }}>
            {/* Icon */}
            <div style={{
              width: 40, height: 40, borderRadius: 10, flexShrink: 0,
              background: "#eef2ff", display: "flex",
              alignItems: "center", justifyContent: "center", fontSize: 20,
            }}>{icon}</div>

            {/* Label */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: "0.84rem", fontWeight: 700, color: "#1e293b", margin: 0 }}>{label}</p>
              <p style={{ fontSize: "0.7rem", color: "#10b981", margin: "2px 0 0", fontWeight: 600 }}>
                ✅ Uploaded
              </p>
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 7, flexShrink: 0 }}>
              {/* View */}
              <button
                title="Open in new tab"
                onClick={() => viewDoc(assoc.id, field)}
                style={{
                  padding: "6px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0",
                  background: "#fff", cursor: "pointer", fontSize: "0.74rem",
                  fontWeight: 700, color: "#475569", fontFamily: "inherit",
                  display: "flex", alignItems: "center", gap: 5,
                }}>
                👁 View
              </button>

              {/* Download */}
              <button
                title="Download file"
                onClick={() => handleDownload(field, label)}
                disabled={downloading === field}
                style={{
                  padding: "6px 12px", borderRadius: 8,
                  border: "1.5px solid #a5b4fc",
                  background: downloading === field ? "#e0e7ff" : "#eef2ff",
                  cursor: downloading === field ? "not-allowed" : "pointer",
                  fontSize: "0.74rem", fontWeight: 700,
                  color: "#4338ca", fontFamily: "inherit",
                  display: "flex", alignItems: "center", gap: 5,
                }}>
                {downloading === field
                  ? <><span style={{ width: 10, height: 10, border: "2px solid #a5b4fc", borderTopColor: "#4338ca", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} /> Saving…</>
                  : "⬇ Download"}
              </button>

              {/* Print */}
              <button
                title="Print document"
                onClick={() => handlePrint(field, label)}
                disabled={printing === field}
                style={{
                  padding: "6px 12px", borderRadius: 8,
                  border: "1.5px solid #86efac",
                  background: printing === field ? "#dcfce7" : "#f0fdf4",
                  cursor: printing === field ? "not-allowed" : "pointer",
                  fontSize: "0.74rem", fontWeight: 700,
                  color: "#16a34a", fontFamily: "inherit",
                  display: "flex", alignItems: "center", gap: 5,
                }}>
                {printing === field
                  ? <><span style={{ width: 10, height: 10, border: "2px solid #86efac", borderTopColor: "#16a34a", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} /> Printing…</>
                  : "🖨️ Print"}
              </button>
            </div>
          </div>
        ))}

        {/* Missing docs */}
        {missing.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
            {missing.map(({ field, label, icon }) => (
              <div key={field} style={{
                display: "flex", alignItems: "center", gap: 8,
                border: "1.5px dashed #e2e8f0", borderRadius: 10,
                padding: "8px 14px", background: "#f8fafc", opacity: 0.6,
              }}>
                <span style={{ fontSize: 15 }}>{icon}</span>
                <span style={{ fontSize: "0.74rem", color: "#94a3b8", fontWeight: 600 }}>{label} — not uploaded</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── PRINT / PDF EXPORT ───────────────────────────────────────────────────────
function printAssociatePDF(assoc: Associate) {
  const fmt = (v: any) => (!v || v === "false" || v === "[]") ? "—" : String(v);
  const arr = (v: any): string[] => parseArr(v);

  const section = (title: string, rows: [string, any][]) => `
    <div class="section">
      <div class="section-title">${title}</div>
      <div class="grid">
        ${rows.map(([label, val]) => `
          <div class="field">
            <div class="label">${label}</div>
            <div class="value">${fmt(val)}</div>
          </div>
        `).join("")}
      </div>
    </div>`;

  const chips = (title: string, items: string[]) =>
    items.length ? `<div class="field full"><div class="label">${title}</div>
      <div class="chips">${items.map(i => `<span class="chip">${i}</span>`).join("")}</div>
    </div>` : "";

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <title>Associate Form – ${assoc.full_name}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 11px; color: #1e293b; padding: 28px 32px; }
    .header { display: flex; align-items: center; gap: 16px; border-bottom: 2.5px solid #6366f1; padding-bottom: 14px; margin-bottom: 20px; }
    .avatar { width: 56px; height: 56px; border-radius: 12px; background: linear-gradient(135deg,#6366f1,#8b5cf6); color: #fff; font-size: 20px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .header-info h1 { font-size: 19px; font-weight: 800; color: #1e293b; }
    .header-info p  { font-size: 11px; color: #6366f1; margin-top: 3px; }
    .status-badge { margin-left: auto; padding: 4px 14px; border-radius: 99px; font-size: 10px; font-weight: 700; text-transform: uppercase; }
    .status-approved { background: #d1fae5; color: #065f46; }
    .status-pending  { background: #fef3c7; color: #92400e; }
    .status-rejected { background: #fee2e2; color: #991b1b; }
    .section { margin-bottom: 14px; page-break-inside: avoid; }
    .section-title { font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #6366f1; border-bottom: 1px solid #e0e7ff; padding-bottom: 5px; margin-bottom: 10px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; }
    .field { }
    .full { grid-column: 1 / -1; }
    .label { font-size: 8px; font-weight: 700; text-transform: uppercase; color: #94a3b8; margin-bottom: 2px; letter-spacing: 0.06em; }
    .value { font-size: 11px; font-weight: 600; color: #1e293b; word-break: break-word; }
    .chips { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
    .chip { background: #eef2ff; color: #6366f1; padding: 2px 9px; border-radius: 99px; font-size: 9px; font-weight: 600; }
    .footer { margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 9px; color: #94a3b8; display: flex; justify-content: space-between; }
    .org-name { font-size: 13px; font-weight: 800; color: #6366f1; }
    @media print { body { padding: 16px; } }
  </style></head><body>

  <div class="header">
    <div class="avatar">${initials(assoc.full_name)}</div>
    <div class="header-info">
      <div class="org-name">NTSC Associate Enrolment Form</div>
      <h1>${assoc.full_name}</h1>
      <p>${assoc.current_profession || "Associate"} &nbsp;·&nbsp; Registered: ${fmtDate(assoc.created_at)} &nbsp;·&nbsp; ID: ${assoc.id}</p>
    </div>
    <span class="status-badge status-${assoc.status || "pending"}">${assoc.status || "pending"}</span>
  </div>

  ${section("👤 Personal Details", [
    ["Email ID", assoc.email],
    ["Mobile (Primary)", assoc.mobile_primary],
    ["WhatsApp Number", assoc.mobile_whatsapp],
    ["Gender", assoc.gender],
    ["Date of Birth", fmtDate(assoc.date_of_birth)],
    ["City", assoc.city],
    ["District", assoc.district],
    ["State", assoc.state],
    ["Pincode", assoc.pincode],
    ["Legislative Assembly", assoc.legislative_assembly],
  ])}
  <div class="section">
    <div class="grid">
      <div class="field full"><div class="label">Residential Address</div><div class="value">${fmt(assoc.residential_address)}</div></div>
    </div>
  </div>

  ${section("💼 Professional Details", [
    ["Current Profession", assoc.current_profession],
    ["Profession (Other Specified)", assoc.profession_other_specify],
    ["Educational Qualification", assoc.educational_qualification],
    ["Special Skill", assoc.special_skill],
    ["Total Experience", assoc.total_experience],
    ["Experience in Career Counselling", assoc.experience_career_counselling],
    ["Languages Other", assoc.languages_other],
  ])}
  <div class="section">
    <div class="grid">
      ${chips("Specialisation", arr(assoc.specialisation))}
      ${chips("Languages Known", arr(assoc.languages_known))}
    </div>
  </div>

  ${section("🎯 Service Details", [
    ["Years of Operation", assoc.years_of_operation],
    ["Avg Students / Month", assoc.avg_students_per_month],
    ["Students Last 3 Years", assoc.students_last_3_years],
    ["Students 2024–25", assoc.students_2024_25],
    ["Students 2023–24", assoc.students_2023_24],
    ["Students 2022–23", assoc.students_2022_23],
  ])}
  <div class="section">
    <div class="grid">
      ${chips("Current Services Offered", arr(assoc.current_services_offered))}
    </div>
  </div>

  ${section("🏢 Office & Infrastructure", [
    ["Has Office", assoc.has_office],
    ["Interested in Setting Up Office", assoc.interested_in_setting_up_office],
    ["Office No. / Street", assoc.office_no_street],
    ["Office Area Name", assoc.office_area_name],
    ["Office Location / Landmark", assoc.office_location],
    ["Office District", assoc.office_district],
    ["Office City", assoc.office_city],
    ["Office Pincode", assoc.office_pincode],
    ["Office Legislative Assembly", assoc.office_legislative_assembly],
    ["Office Area (sqft)", assoc.office_area_sqft],
    ["No. of Staff", assoc.no_of_staff],
    ["Separate Counselling Room", assoc.has_separate_counselling_room],
  ])}

  ${section("🔗 Social Media & Partnership", [
    ["LinkedIn", assoc.linkedin],
    ["Instagram", assoc.instagram],
    ["Facebook", assoc.facebook],
    ["Expected Monthly Referrals", assoc.expected_monthly_referrals],
  ])}
  <div class="section">
    <div class="grid">
      ${chips("Partnership Areas with NTSC", arr(assoc.partnership_areas))}
    </div>
  </div>

  ${section("🏦 Bank Account Details", [
    ["Account Holder Name", assoc.bank_account_holder],
    ["Bank Name & Branch", assoc.bank_name_branch],
    ["Account Number", assoc.account_number],
    ["IFSC Code", assoc.ifsc_code],
  ])}

  ${section("✅ Consent & Declaration", [
    ["Consent Place", assoc.consent_place],
    ["Consent Date", fmtDate(assoc.consent_date)],
    ["Consent Agreed", assoc.consent_agreed ? "Yes" : "No"],
  ])}
  ${assoc.additional_info ? `<div class="section"><div class="grid"><div class="field full"><div class="label">Additional Information</div><div class="value">${fmt(assoc.additional_info)}</div></div></div></div>` : ""}

  <div class="footer">
    <span>NTSC Associate Enrolment &nbsp;·&nbsp; Printed on ${new Date().toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })}</span>
    <span>${assoc.email} &nbsp;·&nbsp; ${assoc.mobile_primary}</span>
  </div>
</body></html>`;

  const w = window.open("", "_blank");
  if (w) {
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 600);
  }
}

// ─── EXCEL EXPORT ─────────────────────────────────────────────────────────────
async function exportAssociatesToExcel(associates: Associate[], filename = "associates.xlsx") {
  await new Promise<void>((resolve, reject) => {
    if ((window as any).XLSX) { resolve(); return; }
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load SheetJS"));
    document.head.appendChild(s);
  });

  const XLSX = (window as any).XLSX;
  const arrStr = (v: any): string => {
    if (Array.isArray(v)) return v.join(", ");
    try { const p = JSON.parse(v); return Array.isArray(p) ? p.join(", ") : (v || ""); }
    catch { return v || ""; }
  };

 const rows = associates.map((a, i) => ({
  "#":             (i + 1),
  "Full Name":     a.full_name || "",
  "Email":         a.email || "",
  "Mobile":        a.mobile_primary || "",
  "City":          a.city || "",
  "Profession":    a.current_profession || "",
  "Credentials":   a.has_password ? "Set" : "Not Set",
  "Status":        a.status || "",
  "Registered On": a.created_at
                    ? new Date(a.created_at).toLocaleDateString("en-IN")
                    : "",
}));

  const ws = XLSX.utils.json_to_sheet(rows);

  ws["!cols"] = [
  { wch: 4  },  // #
  { wch: 24 },  // Full Name
  { wch: 28 },  // Email
  { wch: 16 },  // Mobile
  { wch: 14 },  // City
  { wch: 26 },  // Profession
  { wch: 14 },  // Credentials
  { wch: 12 },  // Status
  { wch: 16 },  // Registered On
];

  const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellAddr = XLSX.utils.encode_cell({ r: 0, c: col });
    if (!ws[cellAddr]) continue;
    ws[cellAddr].s = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "6366F1" } },
      alignment: { horizontal: "center" },
    };
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Associates");

  const approved = associates.filter(a => a.status === "approved").length;
  const pending  = associates.filter(a => a.status === "pending").length;
  const rejected = associates.filter(a => a.status === "rejected").length;
  const summary = [
    ["NTSC Associate Export Report"],
    [],
    ["Generated On",        new Date().toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })],
    ["Total Associates",    associates.length],
    [],
    ["Status",              "Count"],
    ["Approved",            approved],
    ["Pending",             pending],
    ["Rejected",            rejected],
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(summary);
  ws2["!cols"] = [{wch:22},{wch:16}];
  XLSX.utils.book_append_sheet(wb, ws2, "Summary");

  XLSX.writeFile(wb, filename);
}

// ─── FORM FIELD COMPONENTS ────────────────────────────────────────────────────
const FLabel = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
  <label style={{ display:"block", fontSize:"0.72rem", fontWeight:700, color:"#475569",
    textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:5 }}>
    {children}{required && <span style={{ color:"#ef4444", marginLeft:2 }}>*</span>}
  </label>
);

const FInp = ({ name, value, onChange, placeholder, type="text", error }: {
  name: string; value: string; onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; type?: string; error?: string;
}) => (
  <div>
    <input name={name} value={value} onChange={onChange} type={type} placeholder={placeholder}
      style={{ width:"100%", padding:"9px 12px", borderRadius:9, fontSize:"0.84rem",
        border: error ? "1.5px solid #ef4444" : "1.5px solid #e2e8f0",
        background: error ? "#fef2f2" : "#fff", outline:"none",
        boxSizing:"border-box", fontFamily:"inherit", color:"#1e293b",
        transition:"border-color 0.15s" }} />
    {error && <p style={{ color:"#ef4444", fontSize:"0.68rem", marginTop:3 }}>⚠ {error}</p>}
  </div>
);

const FSel = ({ name, value, onChange, options, placeholder, error }: {
  name: string; value: string; onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  options: string[]; placeholder?: string; error?: string;
}) => (
  <div>
    <select name={name} value={value} onChange={onChange}
      style={{ width:"100%", padding:"9px 12px", borderRadius:9, fontSize:"0.84rem",
        border: error ? "1.5px solid #ef4444" : "1.5px solid #e2e8f0",
        background:"#fff", outline:"none", boxSizing:"border-box",
        fontFamily:"inherit", color: value ? "#1e293b" : "#94a3b8",
        appearance:"none" }}>
      <option value="">{placeholder || "Select…"}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
    {error && <p style={{ color:"#ef4444", fontSize:"0.68rem", marginTop:3 }}>⚠ {error}</p>}
  </div>
);

const FTxta = ({ name, value, onChange, placeholder, rows=3, error }: {
  name: string; value: string; onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string; rows?: number; error?: string;
}) => (
  <div>
    <textarea name={name} value={value} onChange={onChange} rows={rows} placeholder={placeholder}
      style={{ width:"100%", padding:"9px 12px", borderRadius:9, fontSize:"0.84rem",
        border: error ? "1.5px solid #ef4444" : "1.5px solid #e2e8f0",
        background: error ? "#fef2f2" : "#fff", outline:"none", resize:"none",
        boxSizing:"border-box", fontFamily:"inherit", color:"#1e293b" }} />
    {error && <p style={{ color:"#ef4444", fontSize:"0.68rem", marginTop:3 }}>⚠ {error}</p>}
  </div>
);

const FChecks = ({ options, selected, onChange, cols=2 }: {
  options: string[]; selected: string[]; onChange: (v: string) => void; cols?: number;
}) => (
  <div style={{ display:"grid", gridTemplateColumns:`repeat(${cols},1fr)`, gap:8 }}>
    {options.map(opt => (
      <label key={opt} style={{
        display:"flex", alignItems:"center", gap:8, padding:"9px 12px",
        borderRadius:9, border: selected.includes(opt) ? "1.5px solid #6366f1" : "1.5px solid #e2e8f0",
        background: selected.includes(opt) ? "#eef2ff" : "#fff",
        cursor:"pointer", fontSize:"0.82rem", fontWeight: selected.includes(opt) ? 600 : 400,
        color: selected.includes(opt) ? "#4338ca" : "#475569", transition:"all 0.12s",
      }}>
        <input type="checkbox" checked={selected.includes(opt)} onChange={() => onChange(opt)}
          style={{ accentColor:"#6366f1" }} />
        {opt}
      </label>
    ))}
  </div>
);

const FRadios = ({ name, options, value, onChange }: {
  name: string; options: string[]; value: string; onChange: (v: string) => void;
}) => (
  <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
    {options.map(opt => (
      <label key={opt} style={{
        display:"flex", alignItems:"center", gap:7, padding:"8px 14px",
        borderRadius:9, border: value===opt ? "1.5px solid #6366f1" : "1.5px solid #e2e8f0",
        background: value===opt ? "#eef2ff" : "#fff",
        cursor:"pointer", fontSize:"0.82rem", fontWeight: value===opt ? 600 : 400,
        color: value===opt ? "#4338ca" : "#475569", transition:"all 0.12s",
      }}>
        <input type="radio" name={name} value={opt} checked={value===opt}
          onChange={() => onChange(opt)} style={{ accentColor:"#6366f1" }} />
        {opt}
      </label>
    ))}
  </div>
);

const SecTitle = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16,
    paddingBottom:10, borderBottom:"1.5px solid #e0e7ff" }}>
    <span style={{ width:3, height:18, background:"linear-gradient(to bottom,#6366f1,#8b5cf6)",
      borderRadius:2, display:"inline-block" }} />
    <h3 style={{ fontSize:"0.7rem", fontWeight:800, color:"#6366f1",
      textTransform:"uppercase", letterSpacing:"0.12em" }}>{children as string}</h3>
  </div>
);

const FileCard = ({ field, label, icon, required, file, onChange, onRemove, error }: {
  field: string; label: string; icon: string; required?: boolean;
  file: File | null; onChange: (f: string, v: File | null) => void;
  onRemove: (f: string) => void; error?: string;
}) => (
  <div>
    <div style={{
      border: file ? "2px dashed #22c55e" : error ? "2px dashed #ef4444" : "2px dashed #cbd5e1",
      borderRadius:12, padding:14,
      background: file ? "#f0fdf4" : error ? "#fef2f2" : "#f8fafc",
      transition:"all 0.15s",
    }}>
      <label style={{ cursor:"pointer", display:"block" }}>
        <input type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display:"none" }}
          onChange={(e) => {
            const f = e.target.files?.[0] || null;
            if (f && f.size > 5 * 1024 * 1024) { alert(`${label}: File must be under 5MB`); return; }
            onChange(field, f);
          }} />
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:42, height:42, borderRadius:10, display:"flex", alignItems:"center",
            justifyContent:"center", fontSize:20, flexShrink:0,
            background: file ? "#dcfce7" : "#fff", border:"1px solid #e2e8f0" }}>
            {file ? "✅" : icon}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ fontSize:"0.82rem", fontWeight:600, color:"#1e293b" }}>
              {label}{required && <span style={{ color:"#ef4444" }}>*</span>}
            </p>
            {file ? (
              <p style={{ fontSize:"0.7rem", color:"#16a34a", fontWeight:500 }}>
                {file.name} · {(file.size/1024).toFixed(1)} KB
              </p>
            ) : (
              <p style={{ fontSize:"0.7rem", color:"#94a3b8" }}>PDF, JPG, PNG · Max 5MB</p>
            )}
          </div>
          {file ? (
            <button type="button" onClick={(e) => { e.preventDefault(); onRemove(field); }}
              style={{ width:26, height:26, borderRadius:"50%", border:"none", background:"#fee2e2",
                color:"#ef4444", cursor:"pointer", fontSize:12, fontWeight:700,
                display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
          ) : (
            <span style={{ fontSize:"0.72rem", background:"#6366f1", color:"#fff",
              padding:"5px 12px", borderRadius:7, fontWeight:700, flexShrink:0 }}>Upload</span>
          )}
        </div>
      </label>
    </div>
    {error && <p style={{ color:"#ef4444", fontSize:"0.68rem", marginTop:3 }}>⚠ {error}</p>}
  </div>
);

// ─── CREDENTIAL CARD ──────────────────────────────────────────────────────────
const CredCard = ({ creds, onClose }: { creds: Credentials; onClose: () => void }) => {
  const [copied, setCopied] = useState<"u"|"p"|null>(null);
  const copy = (val: string, w: "u"|"p") => {
    navigator.clipboard.writeText(val); setCopied(w);
    setTimeout(() => setCopied(null), 2000);
  };
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(11,31,58,0.6)", zIndex:10000,
      display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background:"#fff", borderRadius:20, padding:"32px 28px", maxWidth:400,
        width:"100%", boxShadow:"0 24px 64px rgba(0,0,0,0.2)" }}>
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <div style={{ width:56, height:56, borderRadius:16, background:"rgba(99,102,241,0.1)",
            display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px", fontSize:26 }}>🔐</div>
          <h3 style={{ fontSize:"1.1rem", fontWeight:800, color:"#1e293b" }}>Credentials Generated!</h3>
          <p style={{ fontSize:"0.77rem", color:"#94a3b8", marginTop:4 }}>Share these securely with the associate.</p>
        </div>
        {([["Login Email", creds.username, "u"], ["Password", creds.password, "p"]] as [string,string,"u"|"p"][])
          .map(([label, val, w]) => (
          <div key={label} style={{ marginBottom:12 }}>
            <p style={{ fontSize:"0.65rem", fontWeight:700, color:"#64748b", textTransform:"uppercase",
              letterSpacing:"0.1em", marginBottom:4 }}>{label}</p>
            <div style={{ display:"flex", gap:8, alignItems:"center", background:"#f8fafc",
              border:"1.5px solid #e2e8f0", borderRadius:10, padding:"10px 14px" }}>
              <code style={{ flex:1, fontSize:"0.88rem", fontWeight:700, color:"#1e293b",
                fontFamily:"'Courier New',monospace", wordBreak:"break-all" }}>{val}</code>
              <button onClick={() => copy(val, w)}
                style={{ fontSize:"0.7rem", fontWeight:700, background:"none", border:"none",
                  cursor:"pointer", color: copied===w ? "#10b981":"#6366f1", whiteSpace:"nowrap" }}>
                {copied===w ? "✓ Copied" : "Copy"}
              </button>
            </div>
          </div>
        ))}
        <div style={{ marginTop:16, padding:"11px 14px", background:"#fffbeb",
          borderRadius:10, border:"1px solid #fde68a" }}>
          <p style={{ fontSize:"0.72rem", color:"#92400e", fontWeight:600 }}>
            ⚠ Password shown once only — save it now!
          </p>
        </div>
        <button onClick={onClose} style={{ marginTop:18, width:"100%", padding:11,
          background:"#6366f1", color:"#fff", border:"none", borderRadius:11,
          fontWeight:700, fontSize:"0.88rem", cursor:"pointer", fontFamily:"inherit" }}>
          Done
        </button>
      </div>
    </div>
  );
};

// ─── VIEW MODAL ───────────────────────────────────────────────────────────────
const SectionHead = ({ children }: { children: React.ReactNode }) => (
  <div style={{ gridColumn:"1/-1", borderBottom:"1.5px solid #f1f5f9", paddingBottom:6,
    marginTop:8, marginBottom:2 }}>
    <p style={{ fontSize:"0.62rem", fontWeight:800, textTransform:"uppercase",
      letterSpacing:"0.12em", color:"#6366f1" }}>{children as string}</p>
  </div>
);
const FV = ({ label, value, wide }: { label:string; value:string; wide?:boolean }) => (
  <div style={{ gridColumn: wide ? "1/-1" : undefined }}>
    <p style={{ fontSize:"0.6rem", fontWeight:700, textTransform:"uppercase",
      letterSpacing:"0.1em", color:"#94a3b8", marginBottom:2 }}>{label}</p>
    <p style={{ fontSize:"0.82rem", fontWeight:600, color:"#1e293b", wordBreak:"break-word" }}>{value||"—"}</p>
  </div>
);
const Chips = ({ label, items }: { label:string; items:string[] }) => (
  items?.length > 0 ? (
    <div style={{ gridColumn:"1/-1" }}>
      <p style={{ fontSize:"0.6rem", fontWeight:700, textTransform:"uppercase",
        letterSpacing:"0.1em", color:"#94a3b8", marginBottom:6 }}>{label}</p>
      <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
        {items.map(s => (
          <span key={s} style={{ background:"#eef2ff", color:"#6366f1",
            padding:"3px 10px", borderRadius:99, fontSize:"0.72rem", fontWeight:600 }}>{s}</span>
        ))}
      </div>
    </div>
  ) : null
);

const ViewModal = ({ assoc, onClose, onEdit, onGenCreds, canEdit }: {
  assoc: Associate; onClose:()=>void; onEdit:(a:Associate)=>void;
  onGenCreds:(id:number)=>void; canEdit: boolean;
}) => {
  const s = STATUS_CFG[assoc.status] || STATUS_CFG.pending;
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(11,31,58,0.55)", zIndex:9000,
      display:"flex", alignItems:"center", justifyContent:"center", padding:20, overflowY:"auto" }}>
      <div style={{ background:"#fff", borderRadius:20, width:"100%", maxWidth:680,
        boxShadow:"0 24px 64px rgba(0,0,0,0.18)", maxHeight:"92vh", overflowY:"auto" }}>

        {/* Header */}
        <div style={{ padding:"20px 24px 16px", borderBottom:"1px solid #f1f5f9",
          display:"flex", alignItems:"center", gap:14, position:"sticky", top:0,
          background:"#fff", zIndex:1 }}>
          <div style={{ width:48, height:48, borderRadius:14,
            background:"linear-gradient(135deg,#6366f1,#8b5cf6)", color:"#fff",
            fontWeight:800, fontSize:"1rem", display:"flex", alignItems:"center",
            justifyContent:"center", flexShrink:0 }}>{initials(assoc.full_name)}</div>
          <div style={{ flex:1 }}>
            <h3 style={{ fontSize:"1rem", fontWeight:800, color:"#1e293b" }}>{assoc.full_name}</h3>
            <p style={{ fontSize:"0.74rem", color:"#94a3b8", marginTop:1 }}>{assoc.current_profession||"—"}</p>
          </div>
          <span style={{ background:s.bg, color:s.color, padding:"4px 12px", borderRadius:99,
            fontSize:"0.72rem", fontWeight:700, display:"inline-flex", alignItems:"center", gap:5 }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:s.dot }} />{assoc.status}
          </span>
          <button onClick={onClose} style={{ width:30, height:30, borderRadius:"50%",
            border:"1px solid #e2e8f0", background:"#f8fafc", cursor:"pointer",
            fontSize:13, color:"#64748b", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ padding:"20px 24px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px 20px" }}>
          <SectionHead>👤 Personal Details</SectionHead>
          <FV label="Email"             value={assoc.email} wide />
          <FV label="Mobile (Primary)"  value={assoc.mobile_primary} />
          <FV label="WhatsApp"          value={assoc.mobile_whatsapp} />
          <FV label="Gender"            value={assoc.gender} />
          <FV label="Date of Birth"     value={fmtDate(assoc.date_of_birth)} />
          <FV label="Residential Address" value={assoc.residential_address} wide />
          <FV label="City"              value={assoc.city} />
          <FV label="District"          value={assoc.district} />
          <FV label="State"             value={assoc.state} />
          <FV label="Pincode"           value={assoc.pincode} />
          <FV label="Legislative Assembly" value={assoc.legislative_assembly} wide />

          <SectionHead>💼 Professional Details</SectionHead>
          <FV label="Profession"         value={assoc.current_profession} />
          <FV label="Qualification"      value={assoc.educational_qualification} />
          <FV label="Special Skill"      value={assoc.special_skill} />
          <FV label="Total Experience"   value={assoc.total_experience} />
          <FV label="Career Counselling Exp" value={assoc.experience_career_counselling} />
          <FV label="Languages Other"    value={assoc.languages_other} />
          <Chips label="Specialisation"  items={assoc.specialisation||[]} />
          <Chips label="Languages Known" items={assoc.languages_known||[]} />

          <SectionHead>🎯 Service Details</SectionHead>
          <FV label="Years of Operation"     value={assoc.years_of_operation} />
          <FV label="Avg Students / Month"   value={assoc.avg_students_per_month} />
          <FV label="Students Last 3 Years"  value={assoc.students_last_3_years} />
          <FV label="Students 2024–25"       value={assoc.students_2024_25} />
          <FV label="Students 2023–24"       value={assoc.students_2023_24} />
          <FV label="Students 2022–23"       value={assoc.students_2022_23} />
          <Chips label="Services Offered"    items={assoc.current_services_offered||[]} />

          <SectionHead>🏢 Office & Infrastructure</SectionHead>
          <FV label="Has Office"         value={assoc.has_office} />
          <FV label="Office Area (sqft)" value={assoc.office_area_sqft} />
          <FV label="No. of Staff"       value={assoc.no_of_staff} />
          <FV label="Counselling Room"   value={assoc.has_separate_counselling_room} />
          <FV label="Office City"        value={assoc.office_city} />
          <FV label="Office District"    value={assoc.office_district} />

          <SectionHead>🔗 Social & Partnership</SectionHead>
          <FV label="LinkedIn"  value={assoc.linkedin} />
          <FV label="Instagram" value={assoc.instagram} />
          <FV label="Facebook"  value={assoc.facebook} />
          <FV label="Expected Monthly Referrals" value={assoc.expected_monthly_referrals} />
          <Chips label="Partnership Areas" items={assoc.partnership_areas||[]} />

          <SectionHead>🏦 Bank Details</SectionHead>
          <FV label="Account Holder" value={assoc.bank_account_holder} />
          <FV label="Bank Name & Branch" value={assoc.bank_name_branch} />
          <FV label="Account Number" value={assoc.account_number} />
          <FV label="IFSC Code"      value={assoc.ifsc_code} />

          <SectionHead>🔐 Account & System</SectionHead>
          <FV label="Login Email"  value={assoc.email} />
          <FV label="Password"     value={assoc.has_password ? "••••••••• (set)" : "Not generated"} />
          <FV label="Status"       value={assoc.status} />
          <FV label="Registered"   value={fmtDate(assoc.created_at)} />
          <FV label="Consent Place" value={assoc.consent_place} />
          <FV label="Consent Date"  value={fmtDate(assoc.consent_date)} />
          {assoc.additional_info && <FV label="Additional Info" value={assoc.additional_info} wide />}

          {/* ── DOCUMENTS SECTION ── */}
          <DocSection assoc={assoc} />
        </div>

        {/* Footer actions */}
        <div style={{ padding:"16px 24px", borderTop:"1px solid #f1f5f9",
          display:"flex", gap:10, flexWrap:"wrap", position:"sticky", bottom:0, background:"#fff" }}>
          <button
            onClick={() => printAssociatePDF(assoc)}
            style={{ flex:1, padding:"10px 16px", background:"#f0fdf4", color:"#16a34a",
              border:"1.5px solid #86efac", borderRadius:10, fontWeight:700, fontSize:"0.84rem",
              cursor:"pointer", fontFamily:"inherit" }}>
            🖨️ Print Profile
          </button>
          {canEdit && (
            <button onClick={() => { onClose(); onEdit(assoc); }}
              style={{ flex:1, padding:"10px 16px", background:"#6366f1", color:"#fff",
                border:"none", borderRadius:10, fontWeight:700, fontSize:"0.84rem",
                cursor:"pointer", fontFamily:"inherit" }}>✏️ Edit</button>
          )}
          {canEdit && (
            <button onClick={() => { onClose(); onGenCreds(assoc.id); }}
              style={{ flex:1, padding:"10px 16px", background:"#f0f9ff", color:"#0284c7",
                border:"1.5px solid #bae6fd", borderRadius:10, fontWeight:700, fontSize:"0.84rem",
                cursor:"pointer", fontFamily:"inherit" }}>
              🔑 {assoc.has_password ? "Regenerate Password" : "Generate Credentials"}
            </button>
          )}
          <button onClick={onClose}
            style={{ padding:"10px 16px", background:"#f8fafc", color:"#64748b",
              border:"1.5px solid #e2e8f0", borderRadius:10, fontWeight:700, fontSize:"0.84rem",
              cursor:"pointer", fontFamily:"inherit" }}>Close</button>
        </div>
      </div>
    </div>
  );
};

// ─── DELETE CONFIRM ───────────────────────────────────────────────────────────
const DeleteConfirm = ({ assoc, onClose, onConfirm }: {
  assoc: Associate; onClose:()=>void; onConfirm:()=>Promise<void>;
}) => {
  const [deleting, setDeleting] = useState(false);
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(11,31,58,0.55)", zIndex:9000,
      display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background:"#fff", borderRadius:20, padding:"28px 24px", maxWidth:380,
        width:"100%", boxShadow:"0 24px 64px rgba(0,0,0,0.18)", textAlign:"center" }}>
        <div style={{ width:52, height:52, borderRadius:14, background:"#fee2e2",
          display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px", fontSize:24 }}>🗑️</div>
        <h3 style={{ fontSize:"1rem", fontWeight:800, color:"#1e293b" }}>Delete Associate?</h3>
        <p style={{ fontSize:"0.8rem", color:"#94a3b8", marginTop:6, lineHeight:1.6 }}>
          Permanently remove <strong style={{ color:"#1e293b" }}>{assoc.full_name}</strong> and all their data?
        </p>
        <div style={{ display:"flex", gap:10, marginTop:22 }}>
          <button onClick={onClose} style={{ flex:1, padding:10, background:"#f8fafc",
            border:"1.5px solid #e2e8f0", borderRadius:10, fontWeight:700, fontSize:"0.82rem",
            cursor:"pointer", color:"#64748b", fontFamily:"inherit" }}>Cancel</button>
          <button onClick={async()=>{setDeleting(true);await onConfirm();setDeleting(false);}}
            disabled={deleting}
            style={{ flex:1, padding:10, background:deleting?"#fca5a5":"#ef4444",
              border:"none", borderRadius:10, fontWeight:700, fontSize:"0.82rem",
              cursor:deleting?"not-allowed":"pointer", color:"#fff", fontFamily:"inherit" }}>
            {deleting?"Deleting…":"Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── PAGINATION COMPONENT ─────────────────────────────────────────────────────
const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }: {
  currentPage: number; totalPages: number; onPageChange: (p: number) => void;
  totalItems: number; itemsPerPage: number;
}) => {
  const start = Math.min((currentPage - 1) * itemsPerPage + 1, totalItems);
  const end   = Math.min(currentPage * itemsPerPage, totalItems);

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
    .reduce<(number | "...")[]>((acc, p, idx, arr) => {
      if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
      acc.push(p);
      return acc;
    }, []);

  const btnBase: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    borderRadius: 8, fontSize: "0.76rem", fontWeight: 700,
    cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
    border: "1.5px solid #e2e8f0", background: "#fff", color: "#64748b",
  };

  return (
    <div style={{
      padding: "14px 16px", borderTop: "1px solid #f8fafc",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      flexWrap: "wrap", gap: 10, background: "#fff",
    }}>
      <span style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: 600 }}>
        Showing <strong style={{ color: "#475569" }}>{start}–{end}</strong> of{" "}
        <strong style={{ color: "#475569" }}>{totalItems}</strong> associates
      </span>
      {totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
            style={{ ...btnBase, padding: "5px 12px", opacity: currentPage === 1 ? 0.4 : 1,
              cursor: currentPage === 1 ? "not-allowed" : "pointer" }}>← Prev</button>
          {pages.map((p, idx) =>
            p === "..." ? (
              <span key={`dot-${idx}`} style={{ padding: "0 4px", color: "#94a3b8", fontSize: "0.76rem" }}>…</span>
            ) : (
              <button key={p} onClick={() => onPageChange(p as number)}
                style={{ ...btnBase, width: 32, height: 32,
                  background: currentPage === p ? "#6366f1" : "#fff",
                  color: currentPage === p ? "#fff" : "#64748b",
                  border: currentPage === p ? "none" : "1.5px solid #e2e8f0",
                  boxShadow: currentPage === p ? "0 2px 8px rgba(99,102,241,0.3)" : "none" }}>{p}</button>
            )
          )}
          <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}
            style={{ ...btnBase, padding: "5px 12px", opacity: currentPage === totalPages ? 0.4 : 1,
              cursor: currentPage === totalPages ? "not-allowed" : "pointer" }}>Next →</button>
        </div>
      )}
    </div>
  );
};

// ─── FULL 7-STEP FORM MODAL ───────────────────────────────────────────────────
export const AssociateFormModal = ({ existing, onClose, onSaved, isPublic = false }: {
  existing: Associate | null;
  onClose: () => void;
  onSaved: () => void;
  isPublic?: boolean;
}) => {
  const isEdit = !!existing;

  const [form, setForm] = useState<any>(() =>
    existing ? { ...existing } : { ...blankForm(), status:"pending" }
  );
  const [files,        setFiles]        = useState<FileData>(blankFiles());
  const [photoPreview, setPhotoPreview] = useState<string|null>(null);
  const [step,         setStep]         = useState(0);
  const [errors,       setErrors]       = useState<Errors>({});
  const [submitting,   setSubmitting]   = useState(false);
  const [apiError,     setApiError]     = useState("");

  const hc = (e: ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((p: any) => ({ ...p, [name]: type==="checkbox" ? checked : value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]:"" }));
  };
  const tog = (field: string, val: string) =>
    setForm((p: any) => {
      const arr: string[] = p[field] || [];
      return { ...p, [field]: arr.includes(val) ? arr.filter((x:string)=>x!==val) : [...arr, val] };
    });
  const rad = (field: string, val: string) => setForm((p: any) => ({ ...p, [field]: val }));
  const hfc = (field: string, file: File | null) => {
    setFiles(p => ({ ...p, [field]: file }));
    if (errors[field]) setErrors(p => ({ ...p, [field]:"" }));
  };
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    if (f && f.size > 2*1024*1024) { alert("Photo must be under 2MB"); return; }
    hfc("file_photo", f);
    if (f) { const r = new FileReader(); r.onloadend = () => setPhotoPreview(r.result as string); r.readAsDataURL(f); }
    else setPhotoPreview(null);
  };

  const goNext = () => {
    const errs = validateStep(step, form, files, isEdit);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setStep(s => Math.min(s+1, STEPS.length-1));
  };
  const goBack = () => setStep(s => Math.max(s-1, 0));

  const handleSubmit = async () => {
    const errs = validateStep(step, form, files, isEdit);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true); setApiError("");
    try {
      if (isEdit) {
        const res = await fetch(`${API}/${existing!.id}`, {
          method:"PATCH",
          headers:{ "Content-Type":"application/json", ...getAuthHeaders() },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Update failed");
      } else {
        const payload = new FormData();
        Object.entries(form).forEach(([k,v]) =>
          payload.append(k, Array.isArray(v) ? JSON.stringify(v) : String(v))
        );
        Object.entries(files).forEach(([k,f]) => { if (f) payload.append(k, f as File); });
        const res = await fetch(API, {
          method:"POST",
          headers: isPublic ? {} : getAuthHeaders(),
          body: payload
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Submission failed");
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setApiError(err.message);
    } finally { setSubmitting(false); }
  };

  const renderStep = () => {
    switch(step) {
      case 0: return (
        <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
          <SecTitle>Personal Details</SecTitle>
          <div>
            <FLabel>Profile Photo</FLabel>
            <div style={{ border: files.file_photo ? "2px dashed #22c55e" : "2px dashed #cbd5e1", borderRadius:14, padding:16, background: files.file_photo ? "#f0fdf4" : "#f8fafc" }}>
              <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                <div style={{ flexShrink:0 }}>
                  {photoPreview ? <img src={photoPreview} alt="Preview" style={{ width:72, height:72, borderRadius:"50%", objectFit:"cover", border:"3px solid #86efac" }} />
                    : <div style={{ width:72, height:72, borderRadius:"50%", background:"#e2e8f0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28 }}>👤</div>}
                </div>
                <div style={{ flex:1 }}>
                  {files.file_photo ? <p style={{ fontSize:"0.82rem", fontWeight:600, color:"#16a34a" }}>{files.file_photo.name}</p>
                    : <><p style={{ fontSize:"0.84rem", fontWeight:600, color:"#1e293b" }}>Upload Profile Photo</p><p style={{ fontSize:"0.72rem", color:"#94a3b8", marginTop:2 }}>Passport size · JPG, PNG · Max 2MB</p></>}
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:10 }}>
                    <label style={{ cursor:"pointer" }}>
                      <input type="file" accept=".jpg,.jpeg,.png" style={{ display:"none" }} onChange={handlePhotoChange} />
                      <span style={{ display:"inline-block", fontSize:"0.75rem", background:"#6366f1", color:"#fff", padding:"6px 14px", borderRadius:8, fontWeight:700 }}>{files.file_photo ? "Change" : "Choose Photo"}</span>
                    </label>
                    {files.file_photo && <button type="button" onClick={() => { hfc("file_photo",null); setPhotoPreview(null); }} style={{ fontSize:"0.75rem", color:"#ef4444", fontWeight:600, background:"none", border:"none", cursor:"pointer", fontFamily:"inherit" }}>Remove</button>}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px 16px" }}>
            <div style={{ gridColumn:"1/-1" }}><FLabel required>Full Name (as per ID proof)</FLabel><FInp name="full_name" value={form.full_name||""} onChange={hc} placeholder="Full name" error={errors.full_name} /></div>
            <div><FLabel required>Date of Birth</FLabel><FInp name="date_of_birth" value={form.date_of_birth||""} onChange={hc} type="date" error={errors.date_of_birth} /></div>
            <div><FLabel required>Gender</FLabel><FSel name="gender" value={form.gender||""} onChange={hc as any} options={["Male","Female","Transgender","Prefer not to say"]} placeholder="Select gender" error={errors.gender} /></div>
            <div><FLabel required>Mobile (Primary)</FLabel><FInp name="mobile_primary" value={form.mobile_primary||""} onChange={hc} placeholder="10-digit number" error={errors.mobile_primary} /></div>
            <div><FLabel>WhatsApp Number</FLabel><FInp name="mobile_whatsapp" value={form.mobile_whatsapp||""} onChange={hc} placeholder="If different" error={errors.mobile_whatsapp} /></div>
            <div style={{ gridColumn:"1/-1" }}><FLabel required>Email ID</FLabel><FInp name="email" value={form.email||""} onChange={hc} type="email" placeholder="email@example.com" error={errors.email} /></div>
            <div style={{ gridColumn:"1/-1" }}><FLabel required>Residential Address</FLabel><FTxta name="residential_address" value={form.residential_address||""} onChange={hc} placeholder="Full address" error={errors.residential_address} /></div>
            <div><FLabel required>City</FLabel><FInp name="city" value={form.city||""} onChange={hc} placeholder="City" error={errors.city} /></div>
            <div><FLabel required>District</FLabel><FInp name="district" value={form.district||""} onChange={hc} placeholder="District" error={errors.district} /></div>
            <div><FLabel required>State</FLabel><FInp name="state" value={form.state||""} onChange={hc} placeholder="State" error={errors.state} /></div>
            <div><FLabel required>Pincode</FLabel><FInp name="pincode" value={form.pincode||""} onChange={hc} placeholder="6-digit pincode" error={errors.pincode} /></div>
            <div style={{ gridColumn:"1/-1" }}><FLabel>Legislative Assembly</FLabel><FInp name="legislative_assembly" value={form.legislative_assembly||""} onChange={hc} placeholder="Constituency name" /></div>
          </div>
        </div>
      );
      case 1: return (
        <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
          <SecTitle>Professional Details</SecTitle>
          <div>
            <FLabel required>Current Profession</FLabel>
            <FRadios name="current_profession" options={["Individual Counsellor","Career Guidance Centre","School / College Counsellor","E-Seva Centre","Recruitment Services","Other Business (Pl Specify)"]} value={form.current_profession||""} onChange={v => rad("current_profession",v)} />
            {errors.current_profession && <p style={{ color:"#ef4444", fontSize:"0.68rem", marginTop:4 }}>⚠ {errors.current_profession}</p>}
            {form.current_profession === "Other Business (Pl Specify)" && <div style={{ marginTop:8 }}><FInp name="profession_other_specify" value={form.profession_other_specify||""} onChange={hc} placeholder="Specify profession" error={errors.profession_other_specify} /></div>}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px 16px" }}>
            <div style={{ gridColumn:"1/-1" }}><FLabel required>Educational Qualification</FLabel><FInp name="educational_qualification" value={form.educational_qualification||""} onChange={hc} placeholder="e.g. MBA, B.Ed, MSc Psychology" error={errors.educational_qualification} /></div>
            <div style={{ gridColumn:"1/-1" }}><FLabel>Special Skill</FLabel><FInp name="special_skill" value={form.special_skill||""} onChange={hc} placeholder="Any special skills" /></div>
            <div style={{ gridColumn:"1/-1" }}><FLabel>Specialisation</FLabel><FChecks options={["Career Guidance","Psychology","HR","Educational Consultant","Others"]} selected={form.specialisation||[]} onChange={v=>tog("specialisation",v)} /></div>
            <div style={{ gridColumn:"1/-1" }}><FLabel>Languages Known</FLabel><FChecks options={["Tamil","English","Hindi","Other"]} selected={form.languages_known||[]} onChange={v=>tog("languages_known",v)} cols={4} />{(form.languages_known||[]).includes("Other") && <div style={{ marginTop:8 }}><FInp name="languages_other" value={form.languages_other||""} onChange={hc} placeholder="Specify other language" /></div>}</div>
            <div><FLabel>Total Experience</FLabel><FSel name="total_experience" value={form.total_experience||""} onChange={hc as any} options={["Less than 1 year","1-3 years","3-5 years","5-10 years","10+ years"]} placeholder="Select" /></div>
            <div><FLabel>Experience in Career Counselling</FLabel><FSel name="experience_career_counselling" value={form.experience_career_counselling||""} onChange={hc as any} options={["Less than 1 year","1-3 years","3-5 years","5-10 years","10+ years"]} placeholder="Select" /></div>
          </div>
        </div>
      );
      case 2: return (
        <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
          <SecTitle>Service Details</SecTitle>
          <div><FLabel>Current Services Offered</FLabel><FChecks options={["Career Guidance","College Admissions","Skill Counselling","Abroad Job Guidance"]} selected={form.current_services_offered||[]} onChange={v=>tog("current_services_offered",v)} /></div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px 16px" }}>
            <div><FLabel>Years of Operation</FLabel><FInp name="years_of_operation" value={form.years_of_operation||""} onChange={hc} placeholder="e.g. 5" /></div>
            <div><FLabel>Avg Students / Month</FLabel><FInp name="avg_students_per_month" value={form.avg_students_per_month||""} onChange={hc} type="number" placeholder="e.g. 20" /></div>
          </div>
          <div style={{ background:"#f8fafc", borderRadius:12, padding:16, border:"1.5px solid #e2e8f0" }}>
            <p style={{ fontSize:"0.8rem", fontWeight:700, color:"#475569", marginBottom:12 }}>Students Counselled / Placed</p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:"12px 16px" }}>
              {[["students_last_3_years","Last 3 Years"],["students_2024_25","2024–25"],["students_2023_24","2023–24"],["students_2022_23","2022–23"]].map(([n,l]) => (
                <div key={n}><FLabel>{l}</FLabel><FInp name={n} value={form[n]||""} onChange={hc} type="number" placeholder="Count" /></div>
              ))}
            </div>
          </div>
        </div>
      );
      case 3: return (
        <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
          <SecTitle>Office & Infrastructure</SecTitle>
          <div><FLabel>Do you have an office?</FLabel><FRadios name="has_office" options={["Already available","Not available","Planning to Set up shortly"]} value={form.has_office||""} onChange={v=>rad("has_office",v)} /></div>
          {form.has_office === "Already available" && (
            <div style={{ background:"#eef2ff", borderRadius:14, padding:16, border:"1.5px solid #c7d2fe" }}>
              <p style={{ fontSize:"0.78rem", fontWeight:700, color:"#6366f1", marginBottom:14 }}>Office Address</p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px 16px" }}>
                <div style={{ gridColumn:"1/-1" }}><FLabel>No. / Street</FLabel><FInp name="office_no_street" value={form.office_no_street||""} onChange={hc} placeholder="Street" /></div>
                <div><FLabel>Area</FLabel><FInp name="office_area_name" value={form.office_area_name||""} onChange={hc} placeholder="Area" /></div>
                <div><FLabel>Location / Landmark</FLabel><FInp name="office_location" value={form.office_location||""} onChange={hc} placeholder="Landmark" /></div>
                <div><FLabel>District</FLabel><FInp name="office_district" value={form.office_district||""} onChange={hc} placeholder="District" /></div>
                <div><FLabel>City</FLabel><FInp name="office_city" value={form.office_city||""} onChange={hc} placeholder="City" /></div>
                <div><FLabel>Pincode</FLabel><FInp name="office_pincode" value={form.office_pincode||""} onChange={hc} placeholder="Pincode" /></div>
                <div><FLabel>Legislative Assembly</FLabel><FInp name="office_legislative_assembly" value={form.office_legislative_assembly||""} onChange={hc} placeholder="Assembly" /></div>
                <div><FLabel>Office Area (sqft)</FLabel><FInp name="office_area_sqft" value={form.office_area_sqft||""} onChange={hc} type="number" placeholder="e.g. 400" /></div>
                <div><FLabel>No. of Staff</FLabel><FInp name="no_of_staff" value={form.no_of_staff||""} onChange={hc} type="number" placeholder="e.g. 3" /></div>
                <div><FLabel>Separate Counselling Room?</FLabel><FRadios name="has_separate_counselling_room" options={["Yes","No"]} value={form.has_separate_counselling_room||""} onChange={v=>rad("has_separate_counselling_room",v)} /></div>
              </div>
            </div>
          )}
          {form.has_office === "Not available" && (
            <div><FLabel>Interested in setting up office?</FLabel><FRadios name="interested_in_setting_up_office" options={["Yes, I will do immediately","No, Not Immediately"]} value={form.interested_in_setting_up_office||""} onChange={v=>rad("interested_in_setting_up_office",v)} /></div>
          )}
        </div>
      );
      case 4: return (
        <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
          <SecTitle>Social Media Presence</SecTitle>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"14px 16px" }}>
            {[{n:"linkedin",p:"LinkedIn URL",pfx:"in"},{n:"instagram",p:"Instagram handle",pfx:"IG"},{n:"facebook",p:"Facebook URL",pfx:"fb"}].map(s => (
              <div key={s.n}><FLabel>{s.n.charAt(0).toUpperCase()+s.n.slice(1)}</FLabel>
                <div style={{ position:"relative" }}>
                  <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", fontSize:"0.68rem", fontWeight:800, color:"#6366f1" }}>{s.pfx}</span>
                  <input name={s.n} value={form[s.n]||""} onChange={hc} placeholder={s.p} style={{ width:"100%", paddingLeft:30, paddingRight:12, paddingTop:9, paddingBottom:9, borderRadius:9, border:"1.5px solid #e2e8f0", fontSize:"0.82rem", outline:"none", fontFamily:"inherit", boxSizing:"border-box" as any }} />
                </div>
              </div>
            ))}
          </div>
          <SecTitle>Partnership Areas with NTSC</SecTitle>
          <FChecks options={["Skill Training Counselling","Abroad Job Counselling","Diploma / Technical Course Counselling","Entrepreneurship Guidance","All the above"]} selected={form.partnership_areas||[]} onChange={v=>tog("partnership_areas",v)} />
          <div style={{ maxWidth:260 }}><FLabel>Expected Monthly Student Referrals</FLabel><FInp name="expected_monthly_referrals" value={form.expected_monthly_referrals||""} onChange={hc} type="number" placeholder="e.g. 10" /></div>
          <div><FLabel>Status</FLabel><FSel name="status" value={form.status||"pending"} onChange={hc as any} options={["pending","approved","rejected"]} /></div>
        </div>
      );
      case 5: return (
        <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
          <SecTitle>Document Upload</SecTitle>
          {isEdit && <div style={{ background:"#fffbeb", border:"1.5px solid #fde68a", borderRadius:10, padding:"10px 14px" }}><p style={{ fontSize:"0.75rem", color:"#92400e", fontWeight:600 }}>ℹ️ Editing mode — uploading new files is optional. Existing files are kept.</p></div>}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <FileCard field="file_aadhaar_copy" label="Aadhaar Card" icon="🪪" required={!isEdit} file={files.file_aadhaar_copy} onChange={hfc} onRemove={f=>hfc(f,null)} error={errors.file_aadhaar_copy} />
            <FileCard field="file_pan_copy" label="PAN Card" icon="💳" required={!isEdit} file={files.file_pan_copy} onChange={hfc} onRemove={f=>hfc(f,null)} error={errors.file_pan_copy} />
            <FileCard field="file_gst_certificate" label="GST Certificate" icon="🏢" file={files.file_gst_certificate} onChange={hfc} onRemove={f=>hfc(f,null)} />
            <FileCard field="file_address_proof" label="Address Proof" icon="📄" file={files.file_address_proof} onChange={hfc} onRemove={f=>hfc(f,null)} />
          </div>
          <SecTitle>Bank Account Details</SecTitle>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px 16px" }}>
            <div style={{ gridColumn:"1/-1" }}><FLabel>Account Holder Name</FLabel><FInp name="bank_account_holder" value={form.bank_account_holder||""} onChange={hc} placeholder="As per bank records" /></div>
            <div style={{ gridColumn:"1/-1" }}><FLabel>Bank Name, Branch & Address</FLabel><FInp name="bank_name_branch" value={form.bank_name_branch||""} onChange={hc} placeholder="e.g. SBI, Anna Nagar, Chennai" /></div>
            <div><FLabel>Account Number</FLabel><FInp name="account_number" value={form.account_number||""} onChange={hc} placeholder="Account number" error={errors.account_number} /></div>
            <div><FLabel>IFSC Code</FLabel><FInp name="ifsc_code" value={form.ifsc_code||""} onChange={hc} placeholder="e.g. SBIN0001234" error={errors.ifsc_code} /></div>
          </div>
          <FLabel>Additional Information</FLabel>
          <FTxta name="additional_info" value={form.additional_info||""} onChange={hc} rows={3} placeholder="Anything else to share…" />
        </div>
      );
      case 6: return (
        <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
          <SecTitle>Consent & Review</SecTitle>
          <div style={{ background:"#eef2ff", border:"1.5px solid #c7d2fe", borderRadius:12, padding:18 }}>
            <p style={{ fontSize:"0.84rem", color:"#3730a3", lineHeight:1.7 }}>
              I hereby confirm my interest in partnering with <strong>NTSC</strong>, expecting a long-term association, in an ethical way to contribute to the skill and career development of the student community and society.
            </p>
          </div>
          <label style={{ display:"flex", alignItems:"flex-start", gap:12, padding:16, borderRadius:12, border: form.consent_agreed ? "1.5px solid #6366f1" : errors.consent_agreed ? "1.5px solid #ef4444" : "1.5px solid #e2e8f0", background: form.consent_agreed ? "#eef2ff" : "#fff", cursor:"pointer" }}>
            <input type="checkbox" name="consent_agreed" checked={!!form.consent_agreed} onChange={hc} style={{ accentColor:"#6366f1", width:16, height:16, marginTop:1, flexShrink:0 }} />
            <span style={{ fontSize:"0.84rem", color:"#1e293b", fontWeight:500 }}>I agree to the above declaration and confirm all information is accurate.</span>
          </label>
          {errors.consent_agreed && <p style={{ color:"#ef4444", fontSize:"0.68rem", marginTop:-10 }}>⚠ {errors.consent_agreed}</p>}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px 16px" }}>
            <div><FLabel required>Place</FLabel><FInp name="consent_place" value={form.consent_place||""} onChange={hc} placeholder="City / Town" error={errors.consent_place} /></div>
            <div><FLabel required>Date</FLabel><FInp name="consent_date" value={form.consent_date||""} onChange={hc} type="date" error={errors.consent_date} /></div>
          </div>
          <div style={{ background:"#f8fafc", borderRadius:14, padding:18, border:"1.5px solid #e2e8f0" }}>
            <p style={{ fontSize:"0.65rem", fontWeight:800, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:14 }}>Submission Summary</p>
            <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:14 }}>
              {photoPreview ? <img src={photoPreview} alt="Profile" style={{ width:52, height:52, borderRadius:"50%", objectFit:"cover", border:"2px solid #a5b4fc", flexShrink:0 }} />
                : <div style={{ width:52, height:52, borderRadius:"50%", background:"linear-gradient(135deg,#6366f1,#8b5cf6)", color:"#fff", fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1rem", flexShrink:0 }}>{initials(form.full_name||"")}</div>}
              <div><p style={{ fontWeight:800, color:"#1e293b" }}>{form.full_name||"—"}</p><p style={{ fontSize:"0.75rem", color:"#94a3b8" }}>{form.current_profession||"—"}</p></div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px 20px" }}>
              {[["Email",form.email],["Mobile",form.mobile_primary],["City",form.city],["District",form.district],
                ["Aadhaar", files.file_aadhaar_copy?.name || (isEdit ? "On file" : "—")],
                ["PAN", files.file_pan_copy?.name || (isEdit ? "On file" : "—")]].map(([k,v])=>(
                <div key={k}><p style={{ fontSize:"0.65rem", color:"#94a3b8", fontWeight:600 }}>{k}</p><p style={{ fontSize:"0.8rem", fontWeight:700, color:"#1e293b" }}>{v||"—"}</p></div>
              ))}
            </div>
          </div>
          {apiError && <div style={{ background:"#fef2f2", border:"1.5px solid #fca5a5", borderRadius:10, padding:"12px 14px" }}><p style={{ color:"#dc2626", fontSize:"0.82rem", fontWeight:600 }}>⚠ {apiError}</p></div>}
        </div>
      );
      default: return null;
    }
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"#fff", zIndex:9000, display:"flex", alignItems:"stretch", justifyContent:"center" }}>
      <div style={{ width:"100%", maxWidth:"100%", background:"#fff", display:"flex", flexDirection:"column", height:"100vh", overflowY:"hidden", animation:"slideDrawer 0.28s cubic-bezier(0.4,0,0.2,1)" }}>
        <div style={{ padding:"22px 24px 18px", borderBottom:"1.5px solid #f1f5f9", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
          <div style={{ position:"absolute", left:0, right:0, textAlign:"center", pointerEvents:"none" }}>
            <h2 style={{ fontSize:"2.05rem", fontWeight:800, color:"#6366f1" }}>{isEdit ? `Edit: ${existing!.full_name}` : "New Associate Form"}</h2>
            <p style={{ fontSize:"0.73rem", color:"#94a3b8", marginTop:2 }}>Step {step+1} of {STEPS.length} — {STEPS[step]}</p>
          </div>
          {!isPublic && (
            <button onClick={onClose} style={{ width:32, height:32, borderRadius:"50%", border:"1.5px solid #e2e8f0", background:"#f8fafc", cursor:"pointer", fontSize:14, color:"#64748b", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
          )}
        </div>
        <div style={{ padding:"14px 24px 0", flexShrink:0 }}>
          <div style={{ width:"100%", background:"#e2e8f0", borderRadius:99, height:4 }}>
            <div style={{ height:4, borderRadius:99, background:"linear-gradient(90deg,#6366f1,#8b5cf6)", width:`${((step+1)/STEPS.length)*100}%`, transition:"width 0.4s ease" }} />
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:10, gap:4 }}>
            {STEPS.map((s,i) => (
              <div key={s} style={{ display:"flex", flexDirection:"column", alignItems:"center", minWidth:0, flex:1 }}>
                <div style={{ width:28, height:28, borderRadius:"50%", background: i<step ? "#6366f1" : i===step ? "#fff" : "#f1f5f9", border: i===step ? "2px solid #6366f1" : i<step ? "none" : "2px solid #e2e8f0", display:"flex", alignItems:"center", justifyContent:"center", fontSize: i<step ? "0.72rem" : "0.82rem", color: i<step ? "#fff" : i===step ? "#6366f1" : "#cbd5e1", fontWeight:700, boxShadow: i===step ? "0 0 0 4px rgba(99,102,241,0.15)" : "none", transition:"all 0.2s" }}>
                  {i<step ? "✓" : STEP_ICONS[i]}
                </div>
                <span style={{ fontSize:"0.58rem", marginTop:4, color: i===step ? "#6366f1":"#94a3b8", fontWeight: i===step ? 700:400, textAlign:"center", lineHeight:1.2, display:"block", maxWidth:52, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.split(" ")[0]}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:"20px 24px" }}>{renderStep()}</div>
        <div style={{ padding:"16px 24px", borderTop:"1.5px solid #f1f5f9", display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0, background:"#fff" }}>
          <button onClick={goBack} disabled={step===0} style={{ padding:"10px 20px", borderRadius:10, border:"1.5px solid #e2e8f0", background:"#fff", fontSize:"0.84rem", fontWeight:700, color:"#64748b", cursor: step===0?"not-allowed":"pointer", opacity: step===0?0.4:1, fontFamily:"inherit" }}>← Back</button>
          {step < STEPS.length-1
            ? <button onClick={goNext} style={{ padding:"10px 28px", borderRadius:10, background:"linear-gradient(135deg,#6366f1,#7c3aed)", color:"#fff", border:"none", fontSize:"0.84rem", fontWeight:700, cursor:"pointer", fontFamily:"inherit", boxShadow:"0 4px 12px rgba(99,102,241,0.3)" }}>Continue →</button>
            : <button onClick={handleSubmit} disabled={submitting} style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 28px", borderRadius:10, background: submitting ? "#a5b4fc":"#16a34a", color:"#fff", border:"none", fontSize:"0.84rem", fontWeight:700, cursor: submitting?"not-allowed":"pointer", fontFamily:"inherit", boxShadow:"0 4px 12px rgba(22,163,74,0.3)" }}>
                {submitting ? <><span style={{ width:14, height:14, border:"2px solid rgba(255,255,255,0.4)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin 0.7s linear infinite", display:"inline-block" }} /> Saving…</> : `✓ ${isEdit?"Save Changes":"Submit Enrolment"}`}
              </button>}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform:rotate(360deg); } } @keyframes slideDrawer { from { opacity:0; transform:scale(0.97) translateY(12px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>
    </div>
  );
};

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function AssociateManagementPage() {
  const { can } = useAuth();

  const [data,          setData]          = useState<Associate[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState("");
  const [statusFilter,  setStatusFilter]  = useState("all");
  const [currentPage,   setCurrentPage]   = useState(1);
  const [viewAssoc,     setViewAssoc]     = useState<Associate|null>(null);
  const [formAssoc,     setFormAssoc]     = useState<Associate|null|undefined>(undefined);
  const [delAssoc,      setDelAssoc]      = useState<Associate|null>(null);
  const [creds,         setCreds]         = useState<Credentials|null>(null);
  const [toast,         setToast]         = useState("");
  const [exporting,     setExporting]     = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(()=>setToast(""),3000); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(API, { headers: getAuthHeaders() });
      const json = await res.json();
      setData(json.data || []);
    } catch { showToast("❌ Failed to load data"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setCurrentPage(1); }, [search, statusFilter]);

  const fetchFull = async (id: number): Promise<Associate | null> => {
    try {
      const res  = await fetch(`${API}/${id}`, { headers: getAuthHeaders() });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      const row = json.data;
      return {
        ...row,
        specialisation:           parseArr(row.specialisation),
        languages_known:          parseArr(row.languages_known),
        current_services_offered: parseArr(row.current_services_offered),
        partnership_areas:        parseArr(row.partnership_areas),
      };
    } catch (e: any) { showToast(`❌ ${e.message}`); return null; }
  };

  const generateCreds = async (id: number) => {
    try {
      const res  = await fetch(`${API}/${id}/credentials`, {
        method: "POST", headers: getAuthHeaders()
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Server error");
      if (!json.credentials) throw new Error("No credentials in response");
      setCreds(json.credentials);
      showToast("🔑 Credentials generated!");
      await load();
    } catch (e: any) { showToast(`❌ ${e.message}`); }
  };

  const deleteAssoc = async () => {
    if (!delAssoc) return;
    try {
      const res  = await fetch(`${API}/${delAssoc.id}`, {
        method:"DELETE", headers: getAuthHeaders()
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error||"Failed");
      showToast("🗑️ Associate deleted.");
      setDelAssoc(null);
      await load();
    } catch (e: any) { showToast(`❌ ${e.message}`); }
  };

  const changeStatus = async (id: number, status: string) => {
    try {
      await fetch(`${API}/${id}/status`, {
        method:"PATCH",
        headers:{"Content-Type":"application/json", ...getAuthHeaders()},
        body: JSON.stringify({ status }),
      });
      showToast("✅ Status updated");
      await load();
    } catch { showToast("❌ Failed"); }
  };

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const label = statusFilter === "all" ? "all" : statusFilter;
      const dateStr = new Date().toISOString().slice(0,10);
      await exportAssociatesToExcel(filtered, `NTSC_Associates_${label}_${dateStr}.xlsx`);
      showToast(`📥 Exported ${filtered.length} associates to Excel`);
    } catch (e: any) {
      showToast(`❌ Export failed: ${e.message}`);
    } finally {
      setExporting(false);
    }
  };

  const counts = {
    all:      data.length,
    approved: data.filter(d=>d.status==="approved").length,
    pending:  data.filter(d=>d.status==="pending").length,
    rejected: data.filter(d=>d.status==="rejected").length,
  };

  const filtered = data
    .filter(d => statusFilter==="all" || d.status===statusFilter)
    .filter(d => {
      const q = search.toLowerCase();
      return !q || d.full_name?.toLowerCase().includes(q) ||
        d.email?.toLowerCase().includes(q) || d.city?.toLowerCase().includes(q) ||
        d.mobile_primary?.includes(q);
    });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated  = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (!can("Associate", "view")) {
    return (
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center",
        justifyContent:"center", height:"60vh", gap:12 }}>
        <div style={{ fontSize:48 }}>⛔</div>
        <h2 style={{ fontSize:"1.1rem", fontWeight:800, color:"#1e293b" }}>Access Denied</h2>
        <p style={{ color:"#94a3b8", fontSize:"0.84rem" }}>You don't have permission to view this page.</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,500,600,700,800&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        @keyframes spin   { to { transform:rotate(360deg); } }
        @keyframes toastIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
        .am-root { font-family:'Cabinet Grotesk',sans-serif; color:#1e293b; }
        .action-btn { width:30px; height:30px; borderRadius:8px; border:1.5px solid #e2e8f0; background:#fff; cursor:pointer; fontSize:13px; display:inline-flex; align-items:center; justify-content:center; transition:all 0.15s; }
        .action-btn:hover { border-color:#a5b4fc; background:#eef2ff; }
        .action-btn.red:hover { border-color:#fca5a5; background:#fee2e2; }
        .skeleton { background:linear-gradient(90deg,#f1f5f9 25%,#e9eef5 50%,#f1f5f9 75%); background-size:200% 100%; animation:shimmer 1.4s infinite; border-radius:6px; }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
      `}</style>

      <div className="am-root">
        {/* ── Page Header ── */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
          flexWrap:"wrap", gap:14, marginBottom:24 }}>
          <div>
            <h1 style={{ fontSize:"1.45rem", fontWeight:800, color:"#1e293b" }}>Associate Management</h1>
            <p style={{ fontSize:"0.78rem", color:"#94a3b8", marginTop:2 }}>{data.length} total associates</p>
          </div>
          {can("Associate", "add") && (
            <button onClick={() => setFormAssoc(null)}
              style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 20px",
                background:"linear-gradient(135deg,#6366f1,#7c3aed)", color:"#fff", border:"none",
                borderRadius:11, fontWeight:700, fontSize:"0.86rem", cursor:"pointer",
                fontFamily:"inherit", boxShadow:"0 4px 16px rgba(99,102,241,0.35)" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width:15, height:15 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Associate
            </button>
          )}
        </div>

        {/* ── Toolbar ── */}
        <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap", marginBottom:16 }}>
          <div style={{ display:"flex", borderRadius:10, overflow:"hidden", border:"1.5px solid #e2e8f0" }}>
            {(["all","pending","approved","rejected"] as const).map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                style={{ padding:"7px 14px", fontSize:"0.76rem", fontWeight:700, border:"none",
                  cursor:"pointer", fontFamily:"inherit", transition:"background 0.12s",
                  background: statusFilter===s ? "#6366f1":"#fff",
                  color: statusFilter===s ? "#fff":"#64748b" }}>
                {s.charAt(0).toUpperCase()+s.slice(1)} ({counts[s]})
              </button>
            ))}
          </div>

          <div style={{ position:"relative", flex:1, minWidth:180, maxWidth:280 }}>
            <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", fontSize:13 }}>🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, email, mobile…"
              style={{ width:"100%", padding:"8px 12px 8px 32px", borderRadius:10, border:"1.5px solid #e2e8f0",
                fontSize:"0.8rem", outline:"none", fontFamily:"inherit", boxSizing:"border-box" as any }} />
          </div>

          <button onClick={load}
            style={{ padding:"8px 14px", borderRadius:10, border:"1.5px solid #e2e8f0",
              background:"#fff", cursor:"pointer", fontSize:"0.78rem", fontWeight:700,
              color:"#64748b", fontFamily:"inherit" }}>↻ Refresh</button>

          <button
            onClick={handleExportExcel}
            disabled={exporting || filtered.length === 0}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px",
              borderRadius:10, border:"1.5px solid #bbf7d0",
              background: exporting ? "#f0fdf4" : "#fff",
              cursor: (exporting || filtered.length === 0) ? "not-allowed" : "pointer",
              fontSize:"0.78rem", fontWeight:700, color:"#16a34a", fontFamily:"inherit",
              opacity: filtered.length === 0 ? 0.5 : 1,
              transition:"all 0.15s" }}>
            {exporting
              ? <><span style={{ width:12, height:12, border:"2px solid #86efac", borderTopColor:"#16a34a", borderRadius:"50%", animation:"spin 0.7s linear infinite", display:"inline-block" }} /> Exporting…</>
              : <>📥 Export Excel {statusFilter !== "all" ? `(${filtered.length})` : ""}</>
            }
          </button>
        </div>

        {/* ── Table ── */}
        <div style={{ background:"#fff", borderRadius:16, border:"1.5px solid #f1f5f9", overflow:"hidden" }}>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"0.82rem" }}>
              <thead>
                <tr style={{ background:"#f8fafc" }}>
                  {["#","Associate","Mobile","City","Profession","Credentials","Status","Date","Actions"].map(h => (
                    <th key={h} style={{ padding:"12px 16px", textAlign:"left", fontSize:"0.62rem",
                      fontWeight:800, textTransform:"uppercase", letterSpacing:"0.09em",
                      color:"#94a3b8", whiteSpace:"nowrap", borderBottom:"1.5px solid #f1f5f9" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && Array.from({length:5}).map((_,i) => (
                  <tr key={i}>{Array.from({length:9}).map((_,j) => (
                    <td key={j} style={{ padding:"14px 16px", borderTop:"1px solid #f8fafc" }}>
                      <div className="skeleton" style={{ height:14, width: j===1?120:60 }} />
                    </td>
                  ))}</tr>
                ))}
                {!loading && paginated.length===0 && (
                  <tr><td colSpan={9} style={{ textAlign:"center", padding:"52px 16px", color:"#cbd5e1" }}>
                    <div style={{ fontSize:32, marginBottom:8 }}>🔍</div>No associates found.
                  </td></tr>
                )}
                {!loading && paginated.map((row, i) => {
                  const s = STATUS_CFG[row.status] || STATUS_CFG.pending;
                  const rowNum = (currentPage - 1) * ITEMS_PER_PAGE + i + 1;
                  return (
                    <tr key={row.id}
                      style={{ borderTop:"1px solid #f8fafc", transition:"background 0.1s",
                        animation:"fadeUp 0.22s ease both", animationDelay:`${i*0.03}s` }}
                      onMouseEnter={e=>(e.currentTarget.style.background="#fafbff")}
                      onMouseLeave={e=>(e.currentTarget.style.background="")}>
                      <td style={{ padding:"12px 16px", color:"#cbd5e1", fontSize:"0.72rem", fontWeight:600 }}>{rowNum}</td>
                      <td style={{ padding:"12px 16px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                          <div style={{ width:34, height:34, borderRadius:10, background:"linear-gradient(135deg,#6366f1,#8b5cf6)",
                            color:"#fff", fontWeight:800, fontSize:"0.72rem", display:"flex",
                            alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                            {initials(row.full_name)}
                          </div>
                          <div>
                            <div style={{ fontWeight:700, color:"#1e293b" }}>{row.full_name}</div>
                            <div style={{ fontSize:"0.7rem", color:"#94a3b8" }}>{row.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding:"12px 16px", fontFamily:"'Courier New',monospace", fontSize:"0.78rem", color:"#374151" }}>{row.mobile_primary}</td>
                      <td style={{ padding:"12px 16px", color:"#475569" }}>{row.city||"—"}</td>
                      <td style={{ padding:"12px 16px" }}>
                        <span style={{ background:"rgba(99,102,241,0.08)", color:"#6366f1", padding:"3px 9px", borderRadius:99, fontSize:"0.7rem", fontWeight:600 }}>
                          {(row.current_profession||"—").split(" ").slice(0,2).join(" ")}
                        </span>
                      </td>
                      <td style={{ padding:"12px 16px" }}>
                        {row.has_password
                          ? <span style={{ display:"inline-flex", alignItems:"center", gap:4, background:"#eff6ff", color:"#1d4ed8", padding:"3px 9px", borderRadius:99, fontSize:"0.7rem", fontWeight:700 }}>🔑 Set</span>
                          : <span style={{ color:"#cbd5e1", fontSize:"0.72rem" }}>Not set</span>}
                      </td>
                      <td style={{ padding:"12px 16px" }}>
                        {can("Associate", "edit") ? (
                          <select value={row.status||"pending"} onChange={e=>changeStatus(row.id, e.target.value)}
                            style={{ background:s.bg, color:s.color, padding:"3px 9px", borderRadius:99,
                              border:"none", fontSize:"0.72rem", fontWeight:700, cursor:"pointer",
                              fontFamily:"inherit", appearance:"none" as any }}>
                            <option value="pending">⏳ Pending</option>
                            <option value="approved">✅ Approved</option>
                            <option value="rejected">❌ Rejected</option>
                          </select>
                        ) : (
                          <span style={{ background:s.bg, color:s.color, padding:"3px 9px", borderRadius:99, fontSize:"0.72rem", fontWeight:700 }}>
                            {row.status}
                          </span>
                        )}
                      </td>
                      <td style={{ padding:"12px 16px", fontSize:"0.72rem", color:"#94a3b8", whiteSpace:"nowrap" }}>
                        {fmtDate(row.created_at)}
                      </td>
                      <td style={{ padding:"12px 16px" }}>
                        <div style={{ display:"flex", gap:5 }}>
                          <button title="View"
                            onClick={async()=>{ const full=await fetchFull(row.id); if(full) setViewAssoc(full); }}
                            className="action-btn" style={{ width:30, height:30, borderRadius:8, border:"1.5px solid #e2e8f0", background:"#fff", cursor:"pointer", fontSize:13, display:"inline-flex", alignItems:"center", justifyContent:"center" }}>👁</button>
                          <button title="Print / PDF"
                            onClick={async()=>{
                              const full = await fetchFull(row.id);
                              if (full) printAssociatePDF(full);
                            }}
                            className="action-btn" style={{ width:30, height:30, borderRadius:8, border:"1.5px solid #e2e8f0", background:"#fff", cursor:"pointer", fontSize:13, display:"inline-flex", alignItems:"center", justifyContent:"center" }}>🖨️</button>
                          {can("Associate", "edit") && (
                            <button title="Edit"
                              onClick={async()=>{ const full=await fetchFull(row.id); if(full) setFormAssoc(full); }}
                              className="action-btn" style={{ width:30, height:30, borderRadius:8, border:"1.5px solid #e2e8f0", background:"#fff", cursor:"pointer", fontSize:13, display:"inline-flex", alignItems:"center", justifyContent:"center" }}>✏️</button>
                          )}
                          {can("Associate", "edit") && (
                            <button title="Credentials"
                              onClick={()=>generateCreds(row.id)}
                              className="action-btn" style={{ width:30, height:30, borderRadius:8, border:"1.5px solid #e2e8f0", background:"#fff", cursor:"pointer", fontSize:13, display:"inline-flex", alignItems:"center", justifyContent:"center" }}>🔑</button>
                          )}
                          {can("Associate", "delete") && (
                            <button title="Delete"
                              onClick={()=>setDelAssoc(row)}
                              className="action-btn red" style={{ width:30, height:30, borderRadius:8, border:"1.5px solid #e2e8f0", background:"#fff", cursor:"pointer", fontSize:13, display:"inline-flex", alignItems:"center", justifyContent:"center" }}>🗑️</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {!loading && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filtered.length}
              itemsPerPage={ITEMS_PER_PAGE}
            />
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      {viewAssoc && (
        <ViewModal assoc={viewAssoc} onClose={()=>setViewAssoc(null)}
          onEdit={a=>{setViewAssoc(null);setFormAssoc(a);}}
          onGenCreds={id=>{setViewAssoc(null);generateCreds(id);}}
          canEdit={can("Associate", "edit")}
        />
      )}
      {formAssoc !== undefined && (
        <AssociateFormModal
          existing={formAssoc}
          onClose={()=>setFormAssoc(undefined)}
          onSaved={()=>{ showToast(formAssoc ? "✅ Associate updated!" : "✅ Associate added!"); load(); }}
        />
      )}
      {delAssoc && (
        <DeleteConfirm assoc={delAssoc} onClose={()=>setDelAssoc(null)} onConfirm={deleteAssoc} />
      )}
      {creds && <CredCard creds={creds} onClose={()=>setCreds(null)} />}

      {toast && (
        <div style={{ position:"fixed", bottom:24, right:24, zIndex:10000, background:"#1e293b",
          color:"#fff", padding:"12px 20px", borderRadius:12, fontSize:"0.83rem",
          fontWeight:600, boxShadow:"0 8px 24px rgba(0,0,0,0.2)", animation:"toastIn 0.25s ease" }}>
          {toast}
        </div>
      )}
    </>
  );
}
