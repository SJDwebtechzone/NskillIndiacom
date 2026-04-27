"use client";
import { useEffect, useState, useRef } from "react";

interface StudentFeeData {
  id: number;
  full_name: string;
  admission_number: string;
  course_name: string;
  batch_allotted: string;
  mobile_number: string;
  email_id: string;
  admission_date: string;
  course_fees: number;
  total_fees: number;
  paid_fees: number;
  balance_amount: number;
  payment_mode: string;
  payment_ref_no: string;
  payment_date: string;
  instalment_1: number;
  instalment_2: number;
}

interface CompanyInfo {
  company_name: string;
  address: string;
  primary_phone: string;
  email: string;
}

export default function FeesReceiptPage() {
  const [student, setStudent] = useState<StudentFeeData | null>(null);
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [bgImageUrl, setBgImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const receiptRef = useRef<HTMLDivElement>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const API = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentRes, companyRes, bgRes] = await Promise.all([
  fetch(`${API}/api/admissions/fees-receipt`, {
    headers: { Authorization: `Bearer ${token}` },
  }),
  fetch(`${API}/api/settings/contact-info`),
  fetch(`${API}/api/background-images/active?category=Fees Receipt`),  // ← updated
]);

        const studentData = await studentRes.json();
        const companyData = await companyRes.json();
        const bgData = await bgRes.json();

        if (studentData.student) setStudent(studentData.student);
        else setError("Student not found.");

        if (companyData) setCompany(companyData);

        if (bgData.image?.image_url) {
          const url = bgData.image.image_url.replace(/\\/g, "/");
          const withSlash = url.startsWith("/") ? url : `/${url}`;
          setBgImageUrl(`${API}${withSlash}`);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load receipt.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit", month: "2-digit", year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    if (!amount && amount !== 0) return "₹0";
    return `₹${Number(amount).toLocaleString("en-IN")}`;
  };

  const getReceiptNo = () => {
    if (!student) return "RCPT-001";
    return `RCPT-${student.admission_number || student.id}`;
  };

  const handleDownload = async () => {
    if (!receiptRef.current) return;
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        imageTimeout: 15000,
        onclone: (clonedDoc) => {
          const images = clonedDoc.querySelectorAll("img");
          images.forEach((img) => { img.crossOrigin = "anonymous"; });
        },
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasAspect = canvas.height / canvas.width;
      const imgHeight = pdfWidth * canvasAspect;

      if (imgHeight <= pdfHeight) {
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, imgHeight);
      } else {
        // Multi page if content is long
        let position = 0;
        let remainingHeight = imgHeight;
        while (remainingHeight > 0) {
          pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
          remainingHeight -= pdfHeight;
          position -= pdfHeight;
          if (remainingHeight > 0) pdf.addPage();
        }
      }

      pdf.save(`Fees_Receipt_${student?.admission_number || "student"}.pdf`);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Download failed: " + err);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-gray-400">
        Loading receipt...
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="p-6 text-center py-20">
        <div className="text-5xl mb-4">⚠️</div>
        <p className="text-red-500 font-semibold">{error || "Student not found"}</p>
      </div>
    );
  }

  // Build payments list
  const payments = [];
  if (student.paid_fees > 0 && student.instalment_1 === 0 && student.instalment_2 === 0) {
    payments.push({
      sno: 1,
      description: "Course Fee Payment",
      amount: student.paid_fees,
      mode: student.payment_mode,
      ref: student.payment_ref_no,
      date: student.payment_date,
    });
  } else {
    if (student.instalment_1 > 0) {
      payments.push({
        sno: 1,
        description: "Instalment 1",
        amount: student.instalment_1,
        mode: student.payment_mode,
        ref: student.payment_ref_no,
        date: student.payment_date,
      });
    }
    if (student.instalment_2 > 0) {
      payments.push({
        sno: 2,
        description: "Instalment 2",
        amount: student.instalment_2,
        mode: student.payment_mode,
        ref: student.payment_ref_no,
        date: student.payment_date,
      });
    }
    const remaining = student.paid_fees - student.instalment_1 - student.instalment_2;
    if (remaining > 0) {
      payments.push({
        sno: payments.length + 1,
        description: "Additional Payment",
        amount: remaining,
        mode: student.payment_mode,
        ref: student.payment_ref_no,
        date: student.payment_date,
      });
    }
  }

  return (
    <div className="p-6 flex flex-col items-center">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-800">Fees Receipt</h1>
        <p className="text-gray-500 text-sm mt-1">Your official fee payment receipt</p>
      </div>

      {/* A4 Receipt */}
  <div
  ref={receiptRef}
  className="relative bg-white shadow-2xl"
  style={{
    width: "794px",
    minHeight: "1123px",
    padding: "48px",
    fontFamily: "Arial, sans-serif",
    WebkitPrintColorAdjust: "exact",
    printColorAdjust: "exact",
    colorScheme: "light",
  }}
>
        {/* Background watermark */}
        {bgImageUrl && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${bgImageUrl})`,
              backgroundSize: "60%",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              opacity: 0.03,
              pointerEvents: "none",
            }}
          />
        )}

        {/* Content */}
        <div style={{ position: "relative", zIndex: 1 }}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "32px", borderBottom: "2px solid #0b1f3a", paddingBottom: "20px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: "900", color: "#0b1f3a", margin: 0, textTransform: "uppercase", letterSpacing: "2px" }}>
              {company?.company_name || "Institution Name"}
            </h1>
            <p style={{ fontSize: "12px", color: "#555", margin: "6px 0 0" }}>
              {company?.address}
            </p>
            <p style={{ fontSize: "12px", color: "#555", margin: "3px 0 0" }}>
              📞 {company?.primary_phone} &nbsp;|&nbsp; ✉ {company?.email}
            </p>
          </div>

          {/* Receipt Title */}
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ display: "inline-block", border: "2px solid #0b1f3a", padding: "8px 32px", borderRadius: "4px" }}>
  <h2 style={{ margin: 0, fontSize: "16px", fontWeight: "700", letterSpacing: "3px", textTransform: "uppercase", color: "#0b1f3a" }}>
    Fee Receipt
  </h2>
</div>
          </div>

          {/* Receipt No + Date */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px", background: "#f8f9fa", padding: "12px 16px", borderRadius: "6px", border: "1px solid #e9ecef" }}>
            <div>
              <span style={{ fontSize: "11px", color: "#888", fontWeight: "600", textTransform: "uppercase" }}>Receipt No</span>
              <p style={{ margin: "2px 0 0", fontSize: "14px", fontWeight: "700", color: "#0b1f3a" }}>{getReceiptNo()}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "11px", color: "#888", fontWeight: "600", textTransform: "uppercase" }}>Date</span>
              <p style={{ margin: "2px 0 0", fontSize: "14px", fontWeight: "700", color: "#0b1f3a" }}>{formatDate(student.payment_date)}</p>
            </div>
          </div>

          {/* Student Details */}
          <div style={{ marginBottom: "24px", border: "1px solid #e9ecef", borderRadius: "6px", overflow: "hidden" }}>
            <div style={{ background: "#0b1f3a", color: "white", padding: "8px 16px" }}>
              <h3 style={{ margin: 0, fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px" }}>
                Student Details
              </h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0" }}>
              {[
                { label: "Student Name", value: student.full_name },
                { label: "Admission No", value: student.admission_number || `STU-${student.id}` },
                { label: "Course", value: student.course_name },
                { label: "Batch", value: student.batch_allotted || "N/A" },
                { label: "Mobile", value: student.mobile_number },
                { label: "Email", value: student.email_id },
              ].map((item, i) => (
                <div
                  key={item.label}
                  style={{
                    padding: "10px 16px",
                    borderBottom: i < 4 ? "1px solid #f0f0f0" : "none",
                    borderRight: i % 2 === 0 ? "1px solid #f0f0f0" : "none",
                  }}
                >
                  <span style={{ fontSize: "10px", color: "#888", fontWeight: "600", textTransform: "uppercase", display: "block" }}>
                    {item.label}
                  </span>
                  <span style={{ fontSize: "13px", fontWeight: "600", color: "#1a1a1a" }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Details Table */}
          <div style={{ marginBottom: "24px" }}>
            <div style={{ background: "#0b1f3a", color: "white", padding: "8px 16px", borderRadius: "6px 6px 0 0" }}>
              <h3 style={{ margin: 0, fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px" }}>
                Payment Details
              </h3>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #e9ecef", borderTop: "none" }}>
              <thead>
                <tr style={{ background: "#f8f9fa" }}>
                  {["S.No", "Description", "Payment Mode", "Reference No", "Date", "Amount"].map((h) => (
                    <th key={h} style={{ padding: "10px 12px", fontSize: "11px", fontWeight: "700", color: "#555", textTransform: "uppercase", textAlign: "left", borderBottom: "1px solid #e9ecef" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.map((p, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "white" : "#fafafa" }}>
                    <td style={{ padding: "10px 12px", fontSize: "13px", color: "#333", borderBottom: "1px solid #f0f0f0" }}>{p.sno}</td>
                    <td style={{ padding: "10px 12px", fontSize: "13px", color: "#333", borderBottom: "1px solid #f0f0f0" }}>{p.description}</td>
                    <td style={{ padding: "10px 12px", fontSize: "13px", color: "#333", borderBottom: "1px solid #f0f0f0" }}>{p.mode || "Cash"}</td>
                    <td style={{ padding: "10px 12px", fontSize: "13px", color: "#333", borderBottom: "1px solid #f0f0f0" }}>{p.ref || "-"}</td>
                    <td style={{ padding: "10px 12px", fontSize: "13px", color: "#333", borderBottom: "1px solid #f0f0f0" }}>{formatDate(p.date)}</td>
                    <td style={{ padding: "10px 12px", fontSize: "13px", fontWeight: "700", color: "#0b1f3a", borderBottom: "1px solid #f0f0f0" }}>{formatCurrency(p.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Fee Summary */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "32px" }}>
            <div style={{ width: "280px", border: "1px solid #e9ecef", borderRadius: "6px", overflow: "hidden" }}>
              {[
                { label: "Course Fees", value: formatCurrency(student.course_fees), bold: false },
                { label: "Total Fees", value: formatCurrency(student.total_fees), bold: false },
                { label: "Amount Paid", value: formatCurrency(student.paid_fees), bold: false, color: "#16a34a" },
                { label: "Balance Amount", value: formatCurrency(student.balance_amount), bold: true, color: student.balance_amount > 0 ? "#dc2626" : "#16a34a" },
              ].map((row, i) => (
                <div
                  key={row.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "10px 16px",
                    background: i === 3 ? "#f8f9fa" : "white",
                    borderBottom: i < 3 ? "1px solid #f0f0f0" : "none",
                  }}
                >
                  <span style={{ fontSize: "12px", color: "#555", fontWeight: row.bold ? "700" : "500" }}>
                    {row.label}
                  </span>
                  <span style={{ fontSize: "13px", fontWeight: "700", color: row.color || "#1a1a1a" }}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Status Banner */}
          <div
            style={{
              textAlign: "center",
              padding: "12px",
              borderRadius: "6px",
              marginBottom: "32px",
              background: student.balance_amount <= 0 ? "#dcfce7" : "#fef9c3",
              border: `1px solid ${student.balance_amount <= 0 ? "#86efac" : "#fde047"}`,
            }}
          >
            <p style={{ margin: 0, fontWeight: "700", fontSize: "14px", color: student.balance_amount <= 0 ? "#15803d" : "#854d0e" }}>
              {student.balance_amount <= 0
                ? "✅ Full Payment Received — No Balance Due"
                : `⚠️ Balance Due: ${formatCurrency(student.balance_amount)}`}
            </p>
          </div>

          {/* Footer */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", paddingTop: "24px", borderTop: "1px solid #e9ecef" }}>
            <div>
              <p style={{ fontSize: "10px", color: "#888", margin: "0 0 4px" }}>
                This is a computer generated receipt.
              </p>
              <p style={{ fontSize: "10px", color: "#888", margin: 0 }}>
                For queries contact: {company?.primary_phone}
              </p>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ width: "120px", borderTop: "1px solid #333", paddingTop: "6px" }}>
                <p style={{ fontSize: "11px", color: "#333", margin: 0, fontWeight: "600" }}>
                  Authorized Signatory
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Download Button */}
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="mt-6 flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-all shadow-lg shadow-blue-200"
      >
        {downloading ? <>⏳ Generating PDF...</> : <>⬇️ Download PDF Receipt</>}
      </button>
      <p className="text-gray-400 text-xs mt-2">Downloads as A4 PDF document</p>
    </div>
  );
}
