"use client";

import { useEffect, useState } from "react";
import { Printer, Loader2, FileText,Upload, CheckCircle2 } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

const fmtDate = (d: string) =>
  d ? new Date(d).toLocaleDateString("en-IN") : "—";
const fmtAmt = (n: any) =>
  n ? `₹${Number(n).toLocaleString("en-IN")}` : "₹0";

const parseRefField = (refField: string, defaultMode: string, defaultDate: string) => {
  if (!refField) return { mode: defaultMode, date: defaultDate, ref: "—" };
  const parts = refField.split(" | ");
  if (parts.length === 3) {
    return { mode: parts[0], date: parts[1], ref: parts[2] };
  }
  const colonParts = refField.split(":");
  if (colonParts.length >= 2) {
    const mode = colonParts[0].trim();
    if (["Cash", "UPI", "Card", "Bank Transfer", "Cheque", "DD"].includes(mode)) {
      return { mode, date: defaultDate, ref: colonParts.slice(1).join(":").trim() || "—" };
    }
  }
  if (["Cash", "UPI", "Card", "Bank Transfer", "Cheque", "DD"].includes(refField.trim())) {
    return { mode: refField.trim(), date: defaultDate, ref: "—" };
  }
  return { mode: defaultMode, date: defaultDate, ref: refField };
};

// ─── A4 Print Page ─────────────────────────────────────────────────────────────
function buildAdmissionHtml(student: any) {
  if (!student) return "<p>Loading...</p>";   // ← add this line first

  const backendBase = API ?? "http://localhost:5000";
  const photoUrl = student.photo_url
    ? `${backendBase}/${student.photo_url.replace(/\\/g, "/")}`
    : null

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
      font-size: 10px;
      color: #1a1a1a;
      background: white;
      line-height: 1.15;
    }
    .page {
      width: 210mm;
      min-height: 297mm;
      padding: 8mm 10mm;
      margin: 20px auto;
      background: white;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      border: 1px solid #ddd;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2px solid #1e3a6e;
      padding-bottom: 6px;
      margin-bottom: 8px;
    }
    .header-left { display: flex; align-items: center; gap: 10px; }
    .logo-box {
      width: 48px; height: 48px;
      background: #1e3a6e;
      border-radius: 6px;
      display: flex; align-items: center; justify-content: center;
      color: white; font-size: 16px; font-weight: 900;
    }
    .institute-name { font-size: 14px; font-weight: 900; color: #1e3a6e; }
    .institute-sub  { font-size: 9px; color: #666; margin-top: 1px; }
    .form-title {
      font-size: 11px; font-weight: 700;
      color: #1e3a6e; text-align: right;
    }
    .adm-no {
      font-size: 9px; color: #666;
      text-align: right; margin-top: 1px;
    }
    .top-row {
      display: flex;
      gap: 10px;
      margin-bottom: 8px;
    }
    .photo-box {
      width: 80px; height: 95px;
      border: 1px solid #ccc;
      border-radius: 4px;
      overflow: hidden;
      flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      background: #f5f5f5;
      font-size: 9px; color: #999;
    }
    .photo-box img { width: 100%; height: 100%; object-fit: cover; }
    .top-info { flex: 1; }
    .section {
      margin-bottom: 7px;
    }
    .section-title {
      background: #1e3a6e;
      color: white;
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 3px 6px;
      margin-bottom: 4px;
      border-radius: 2px;
    }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 3px 10px; }
    .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 3px 10px; }
    .field  { padding: 2px 0; border-bottom: 1px dotted #ddd; }
    .field-label { font-size: 8px; color: #888; text-transform: uppercase; letter-spacing: 0.04em; }
    .field-value { font-size: 10px; font-weight: 600; color: #1a1a1a; margin-top: 0.5px; }
    .fee-table { width: 100%; border-collapse: collapse; }
    .fee-table th, .fee-table td {
      border: 1px solid #ddd;
      padding: 3px 6px;
      font-size: 9px;
      text-align: left;
    }
    .fee-table th {
      background: #f0f4ff;
      font-weight: 700;
      color: #1e3a6e;
    }
    .fee-table .highlight { background: #fff3f3; font-weight: 700; color: #c0392b; }
    .fee-table .cleared   { background: #f0fff4; font-weight: 700; color: #27ae60; }
    .decl-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 3px;
    }
    .decl-item {
      display: flex; align-items: center; gap: 4px;
      font-size: 8px; color: #555;
    }
    .tick { color: #27ae60; font-size: 10px; }
    .cross { color: #ccc; font-size: 10px; }
    .sig-row {
      display: flex; gap: 15px;
      margin-top: 10px;
      border-top: 1px solid #ddd;
      padding-top: 8px;
    }
    .sig-box { flex: 1; text-align: center; }
    .sig-line {
      border-top: 1px solid #333;
      margin: 16px 10px 3px;
    }
    .sig-label { font-size: 8px; color: #666; }
    .page-footer {
      margin-top: 10px;
      border-top: 1.5px solid #1e3a6e;
      padding-top: 4px;
      display: flex;
      justify-content: space-between;
      font-size: 8.5px;
      color: #888;
    }
    .print-spacer-header { display: none; }
    .print-spacer-footer { display: none; }
    .page-border { display: none; }
    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; background: white; margin: 0; padding: 0; }
      .page {
        margin: 0 !important;
        border: none !important;
        box-shadow: none !important;
        padding: 5mm !important;
        width: 100% !important;
        height: auto !important;
        min-height: 0 !important;
        overflow: visible !important;
      }
      .print-spacer-header { display: table-header-group; }
      .print-spacer-footer { display: table-footer-group; }
      @page { size: A4; margin: 5mm; }
    }
  </style>
</head>
<body>
<div class="page">
  <table style="width: 100%; border-collapse: collapse; border-left: 2px solid #000; border-right: 2px solid #000; box-sizing: border-box;">
    <thead class="print-spacer-header">
      <tr>
        <td style="border-top: 2px solid #000; padding: 0;"><div style="height: 5mm;"></div></td>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="border: none; padding: 0 10mm; vertical-align: top;">
          <div style="display: flex; flex-direction: column; height: 100%; min-height: 540mm;">
            <div style="flex: 1 0 auto;">

  <div class="header">
    <div class="header-left">
      <div class="logo-box">NS</div>
      <div>
        <div class="institute-name">NTSC Training Institute</div>
        <div class="institute-sub">Kovur, Chennai, Tamil Nadu | +91 98842 09774</div>
        <div class="institute-sub">Govt. Approved Certified Skill Training Centre</div>
      </div>
    </div>
    <div>
      <div class="form-title">STUDENT ADMISSION FORM</div>
      <div class="adm-no">Admission No: ${student.admission_number || student.enquiry_id || "—"}</div>
      <div class="adm-no">Date: ${fmtDate(student.admission_date)}</div>
      <div class="adm-no">Course: ${student.course_name || "—"}</div>
    </div>
  </div>

  <div class="top-row">
    <div class="photo-box">
      ${photoUrl ? `<img src="${photoUrl}" alt="Student Photo" />` : "Photo"}
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

  <div class="section">
    <div class="section-title">Fee Summary</div>
    <table class="fee-table" style="margin-bottom: 8px;">
      <thead>
        <tr>
          <th>Course Fees</th>
          <th>Discount Fee</th>
          <th>Discount Remark</th>
          <th>Total Fees</th>
          <th>Paid Fees</th>
          <th>Balance Due</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${fmtAmt(student.course_fees)}</td>
          <td>${fmtAmt(student.discount_fee || 0)}</td>
          <td>${student.discount_remark || "-"}</td>
          <td>${fmtAmt(student.total_fees)}</td>
          <td>${fmtAmt(student.paid_fees)}</td>
          <td class="${Number(student.balance_amount) > 0 ? "highlight" : "cleared"}">
            ${Number(student.balance_amount) > 0 ? fmtAmt(student.balance_amount) : "Cleared"}
          </td>
        </tr>
      </tbody>
    </table>

    <div class="section-title" style="margin-top: 8px;">Payment Instalments</div>
    <table class="fee-table">
      <thead>
        <tr>
          <th>Payment Row</th>
          <th>Amount</th>
          <th>Reference No</th>
          <th>Payment Mode</th>
          <th>Payment Date</th>
        </tr>
      </thead>
      <tbody>
        ${[
          ["Instalment 1", student.instalment_1, student.instalment_1_ref],
          ["Instalment 2", student.instalment_2, student.instalment_2_ref],
          ["Instalment 3", student.instalment_3, student.instalment_3_ref],
          ["Instalment 4", student.instalment_4, student.instalment_4_ref],
        ].filter(([_, amt]) => Number(amt) > 0).map(([label, amt, ref]) => {
          const parsed = parseRefField(ref, student.payment_mode || "Cash", student.payment_date);
          return `
            <tr>
              <td style="font-weight: bold;">${label}</td>
              <td>${fmtAmt(amt)}</td>
              <td>${parsed.ref}</td>
              <td>${parsed.mode}</td>
              <td>${fmtDate(parsed.date)}</td>
            </tr>
          `;
        }).join("")}
      </tbody>
    </table>
  </div>

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

  <div class="section">
    <div class="section-title"><span style="color: #27ae60; margin-right: 4px;">✓</span> STUDENT DECLARATION & DISCLAIMER</div>
    <p style="font-size: 8.5px; font-weight: bold; margin-bottom: 5px; text-align: justify; color: #111;">
      <span style="color: #27ae60; margin-right: 4px;">✓</span> I hereby declare that I have voluntarily enrolled in the above-mentioned course at Niile Technical Skill and Consulting (NTSC). I have read, understood, and agree to abide by the following terms and conditions:
    </p>

    <div style="font-size: 7px; line-height: 1.25; color: #222; margin-bottom: 5px; display: flex; flex-direction: column; gap: 8px;">

      <div>
        <strong style="color: #1e3a6e;"><span style="color: #27ae60; margin-right: 4px;">✓</span> FEES & REFUND POLICY</strong>
        <ol style="margin-left: 12px; list-style-type: decimal;">
          <li>All admission, registration, examination, and course fees paid to the institute are non-refundable and non-transferable.</li>
          <li>Students discontinuing the course after admission shall not be entitled to any refund.</li>
          <li>Any refund, if approved, shall be solely at the discretion of the management.</li>
          <li>Fees paid for Theory and Practical’s study Soft Copy materials, examinations, or certifications are non-refundable.</li>
        </ol>
      </div>

      <div>
        <strong style="color: #1e3a6e;"><span style="color: #27ae60; margin-right: 4px;">✓</span> TRAINING & ATTENDANCE</strong>
        <ol style="margin-left: 12px; list-style-type: decimal;">
          <li>Students must maintain a minimum attendance of 80%.</li>
          <li>Practical training and assessments are compulsory.</li>
          <li>Students shall follow all workshop, laboratory, hostel, and safety regulations.</li>
          <li>Misconduct, indiscipline, harassment, violence, intoxication, or damage to institute property may result in suspension or cancellation of admission without fee refund.</li>
        </ol>
      </div>

      <div>
        <strong style="color: #1e3a6e;"><span style="color: #27ae60; margin-right: 4px;">✓</span> CERTIFICATE POLICY</strong>
        <ol style="margin-left: 12px; list-style-type: decimal;">
          <li>Certificates will be issued only after successful completion of the course.</li>
          <li>Students must complete attendance requirements, practical training, assessments, and fee payments before certificate issuance.</li>
          <li>Students leaving the course before completion shall not be eligible for course completion certificates.</li>
          <li>The institute reserves the right to withhold certificates in case of pending dues or disciplinary issues.</li>
        </ol>
      </div>

      <div>
        <strong style="color: #1e3a6e;">${student.placement_assistance_required === "Yes" ? '<span style="color: #27ae60; margin-right: 4px;">✓</span>' : '<span style="color: #e74c3c; margin-right: 4px;">✗</span>'} PLACEMENT ASSISTANCE</strong>
        <ol style="margin-left: 12px; list-style-type: decimal;">
          <li>The institute provides placement assistance only and does not guarantee employment.</li>
          <li>Job selection depends on student performance, skills, attendance, employer requirements, interview performance, and market conditions.</li>
          <li>Salary, location, designation, accommodation, and employment terms are decided solely by the recruiting company.</li>
          <li>The institute shall not be held responsible if a student is not selected by an employer.</li>
          <li>Students must attend interviews arranged by the institute when called.</li>
        </ol>
        <p style="margin-top: 3px; margin-left: 12px; font-weight: bold; color: #1a1a1a;">
          Placement Assistance Required: <span style="color: ${student.placement_assistance_required === "Yes" ? "#27ae60" : "#c0392b"};">${student.placement_assistance_required || "—"}</span>
        </p>
        ${student.placement_assistance_required === "No" && student.placement_no_reason ? `
        <p style="margin-top: 2px; margin-left: 12px; color: #444;">
          Reason: <strong>${student.placement_no_reason}</strong>
        </p>` : ""}
      </div>

      <div>
        <strong style="color: #1e3a6e;"><span style="color: #27ae60; margin-right: 4px;">✓</span> DOCUMENT VERIFICATION</strong>
        <ol style="margin-left: 12px; list-style-type: decimal;">
          <li>All documents submitted by me are genuine and valid.</li>
          <li>Submission of false, forged, or misleading documents may result in cancellation of admission, cancellation of certification, and legal action.</li>
        </ol>
      </div>

      <div>
        <strong style="color: #1e3a6e;"><span style="color: #27ae60; margin-right: 4px;">✓</span> Code of Conduct Training & Workshop</strong>
        <p style="margin: 1px 0;">I agree to maintain professional behaviour and discipline throughout the training and workshop sessions conducted by NTSC. I understand and agree that I will:</p>
        <ul style="margin-left: 12px; list-style-type: disc;">
          <li>Attend all training sessions punctually.</li>
          <li>Follow the instructions of trainers and NTSC staff.</li>
          <li>Wear appropriate attire and Personal Protective Equipment (PPE) during practical sessions.</li>
          <li>Handle tools, machines, instruments, and training equipment safely and responsibly.</li>
          <li>Respect fellow trainees, trainers, staff, and visitors.</li>
          <li>Refrain from using abusive language, discrimination, harassment, or disruptive behavior.</li>
          <li>Keep classrooms, laboratories, and workshop areas clean and organized.</li>
          <li>Not use mobile phones during training sessions unless permitted by the trainer.</li>
          <li>Not consume alcohol, tobacco, narcotics, or any prohibited substances within the training premises.</li>
          <li>Immediately report any unsafe conditions, accidents, or damage to equipment.</li>
        </ul>
        <p style="margin-top: 1px;">I understand that failure to comply with the above rules may result in disciplinary action, suspension, or termination from the training program.</p>
      </div>

      <div>
        <strong style="color: #1e3a6e;"><span style="color: #27ae60; margin-right: 4px;">✓</span> Code of Conduct Hostel</strong>
        <p style="margin: 1px 0;">I understand that staying in the hostel is a privilege and agree to abide by the hostel rules and regulations. I agree to:</p>
        <ul style="margin-left: 12px; list-style-type: disc;">
          <li>Maintain discipline and respect hostel staff and fellow residents.</li>
          <li>Keep my room and common areas clean and hygienic.</li>
          <li>Avoid damaging hostel property. Any damages caused by negligence may be recovered from me.</li>
          <li>Follow the hostel timings and visitor policies.</li>
          <li>Maintain peace and avoid causing inconvenience to other residents.</li>
          <li>Not possess or consume alcohol, tobacco, drugs, or other prohibited substances.</li>
          <li>Follow all safety and emergency procedures.</li>
          <li>Inform the hostel warden before leaving the hostel for any extended period.</li>
        </ul>
        <p style="margin-top: 1px;">I understand that violation of hostel rules may lead to disciplinary action, including cancellation of hostel accommodation.</p>
      </div>

      <div>
        <strong style="color: #1e3a6e;"><span style="color: #27ae60; margin-right: 4px;">✓</span> Security Deposit (Caution Deposit)</strong>
        <ol style="margin-left: 12px; list-style-type: decimal;">
          <li>Every student shall pay a refundable caution deposit of Rs. 1,000 at the time of hostel admission.</li>
          <li>The caution deposit will be refunded after the student vacates the hostel, subject to:
            <ul style="margin-left: 10px; list-style-type: circle;">
              <li>No damage to hostel property.</li>
              <li>Return of any hostel property (if issued).</li>
              <li>Compliance with all hostel rules and regulations.</li>
            </ul>
          </li>
          <li>If any damage is caused to the hostel building, furniture, electrical fittings, plumbing fixtures, appliances, equipment, or any other hostel property due to the student's negligence, misuse, or intentional act, the cost of repair or replacement will be deducted from the caution deposit.</li>
          <li>If the actual cost of repair or replacement exceeds the caution deposit amount of Rs. 1,000, the student and/or parent/guardian shall pay the balance amount immediately before vacating the hostel or receiving any refund.</li>
          <li>The hostel management's assessment of the damage and repair cost shall be final and binding.</li>
        </ol>
      </div>

      <div>
        <strong style="color: #1e3a6e;"><span style="color: #27ae60; margin-right: 4px;">✓</span> Data Privacy & Confidentiality</strong>
        <p style="margin: 1px 0;">I understand that NTSC will collect and maintain my personal information for admission, training, certification, placement assistance, statutory compliance, and communication purposes. I hereby consent to NTSC collecting, storing, processing, and using my information solely for official purposes. I further agree that:</p>
        <ul style="margin-left: 12px; list-style-type: disc;">
          <li>I will maintain the confidentiality of all NTSC training materials, assessments, and any confidential information shared during the course.</li>
          <li>I will not copy, reproduce, distribute, record, or share NTSC training materials without prior written permission.</li>
          <li>I will not disclose confidential information obtained during industrial visits or company-sponsored training programs.</li>
        </ul>
        <p style="margin-top: 1px;">NTSC will make reasonable efforts to protect my personal information and use it only for legitimate educational and administrative purposes.</p>
      </div>

      <div>
        <strong style="color: #1e3a6e;"><span style="color: #27ae60; margin-right: 4px;">✓</span> Photography & Video Consent</strong>
        <p style="margin: 1px 0;">I hereby grant permission to Niile Technical Skill & Consulting Pvt Ltd (NTSC) to capture photographs, audio recordings, and video recordings of me during training programs, workshops, seminars, industrial visits, placement activities, competitions, and other official events.</p>
        <p style="margin: 1px 0;">I understand that these photographs and videos may be used by NTSC for:</p>
        <ul style="margin-left: 12px; list-style-type: disc;">
          <li>Training and educational purposes</li>
          <li>Certificates and course documentation</li>
          <li>Website and social media platforms</li>
          <li>Brochures, newsletters, and promotional materials</li>
          <li>Marketing and branding activities</li>
          <li>Reports and presentations</li>
        </ul>
        <p style="margin-top: 1px;">I understand that no financial compensation will be provided for the use of these photographs or videos. If I do not wish to be photographed or recorded, I will inform NTSC in writing before the commencement of the training program.</p>
      </div>

      <div>
        <strong style="color: #1e3a6e;"><span style="color: #27ae60; margin-right: 4px;">✓</span> GENERAL CONDITIONS</strong>
        <ol style="margin-left: 12px; list-style-type: decimal; display: grid; grid-template-columns: 1fr 1fr; gap: 0 10px;">
          <li>The institute reserves the right to modify batch timings, trainers, syllabus, examination schedules, training locations, or course structure whenever required.</li>
          <li>Management decisions regarding admission, training, certification, and placement shall be final and binding.</li>
          <li style="grid-column: span 2;">Any dispute shall be subject to the jurisdiction of Chennai courts only.</li>
        </ol>
      </div>

    </div>
  </div>

            </div>

            <div style="flex-grow: 1;"></div>

            <div style="margin-top: 20px; page-break-inside: avoid; padding-top: 20px; flex-shrink: 0;">
              <div style="font-size: 8px; font-weight: bold; border-top: 1.5px solid #1e3a6e; padding-top: 4px; margin-bottom: 6px;">
                <span style="color: #1e3a6e; text-transform: uppercase;">STUDENT CONSENT:</span>
                <p style="margin-top: 2px; font-weight: normal; color: #444;">I confirm that I have read and understood all the above terms and conditions. I agree to comply with the rules and regulations of Niile Technical Skill and Consulting (NTSC).</p>
              </div>

              <div class="sig-row" style="margin-top: 15px;">
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

              <div class="page-footer">
                <span>NTSC Training Institute · Kovur, Chennai · +91 98842 09774</span>
                <span>Printed on: ${new Date().toLocaleDateString("en-IN")}</span>
              </div>
            </div>

          </div>
        </td>
      </tr>
    </tbody>
    <tfoot class="print-spacer-footer">
      <tr>
        <td style="border-bottom: 2px solid #000; padding: 0;"><div style="height: 5mm;"></div></td>
      </tr>
    </tfoot>
  </table>
</div>

</body>
</html>`;

//   const win = window.open("", "_blank");
//   if (win) {
//     win.document.write(html);
//     win.document.close();
//   }
  return html
}

// ─── Main Page ─────────────────────────────────────────────────────────────────


export default function MyAdmissionPage() {
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const token = typeof window !== "undefined"
    ? localStorage.getItem("token") ?? ""
    : "";

  const fetchStudent = () => {
    setLoading(true);
    fetch(`${API}/api/admissions/admission-form`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => setStudent(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchStudent(); }, []);

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("signed_admission_file", selectedFile);

      const res = await fetch(`${API}/api/admissions/upload-signed`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setSelectedFile(null);
      fetchStudent();
      alert("Signed admission form uploaded successfully!");
    } catch (err: any) {
      alert(`❌ ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
        <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
        <span className="font-semibold text-sm">Loading your admission form...</span>
      </div>
    );
  }

  if (!student || student.error) {
    return (
      <div className="text-center py-16">
        <FileText className="w-10 h-10 text-slate-200 mx-auto mb-3" />
        <p className="text-slate-400 font-semibold">No admission record found for your account.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      <iframe
        title="My Admission Form"
        srcDoc={buildAdmissionHtml(student)}
        style={{ width: "100%", height: "90vh", border: "1px solid #e2e8f0", borderRadius: "16px" }}
      />

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h3 className="font-black text-slate-800 mb-2">Upload Signed Admission Form</h3>
        <p className="text-xs text-slate-400 font-semibold mb-4">
          Print the form above, sign it, then upload a scanned copy or photo (PDF/JPG/PNG).
        </p>

        {student.signed_admission_file && (
          <div className="flex items-center gap-2 mb-4 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-bold">
            <CheckCircle2 className="w-4 h-4" /> Signed form already uploaded
          </div>
        )}

        <div className="flex items-center gap-3">
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={e => setSelectedFile(e.target.files?.[0] || null)}
            className="text-sm"
          />
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition"
          >
            <Upload className="w-4 h-4" />
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}