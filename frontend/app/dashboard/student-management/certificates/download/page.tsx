"use client";
import { useEffect, useState, useRef } from "react";

interface Condition {
  key: string;
  label: string;
  passed: boolean;
  message: string;
}

interface CertificateStatus {
  student: {
    full_name: string;
    admission_number: string;
    course_name: string;
    batch_allotted: string;
    admission_date: string;
  };
  conditions: Condition[];
  allPassed: boolean;
  passedCount: number;
  totalConditions: number;
}

interface CompanyInfo {
  company_name: string;
  address: string;
  primary_phone: string;
  email: string;
}

export default function CertificateDownloadPage() {
  const [status, setStatus] = useState<CertificateStatus | null>(null);
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [bgImageUrl, setBgImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const certificateRef = useRef<HTMLDivElement>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const API = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statusRes, companyRes, bgRes] = await Promise.all([
          fetch(`${API}/api/admissions/certificate-status`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API}/api/settings/contact-info`),
          fetch(`${API}/api/background-images/active?category=Certificate`),
        ]);

        const statusData = await statusRes.json();
        const companyData = await companyRes.json();
        const bgData = await bgRes.json();

        if (statusData.student) setStatus(statusData);
        else setError(statusData.error || "Failed to load status.");

        if (companyData) setCompany(companyData);

    if (bgData.image?.image_url) {
  const url = bgData.image.image_url.replace(/\\/g, "/");
  const withSlash = url.startsWith("/") ? url : `/${url}`;
  const fullUrl = `${API}${withSlash}`;
  console.log('Certificate bg URL:', fullUrl);
  setBgImageUrl(fullUrl);
}
      } catch (err) {
        console.error(err);
        setError("Failed to load certificate data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit", month: "long", year: "numeric",
    });
  };

  const handleDownload = async () => {
    if (!certificateRef.current) return;
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      const canvas = await html2canvas(certificateRef.current, {
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
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Certificate_${status?.student.admission_number || "student"}.pdf`);
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
        Loading certificate...
      </div>
    );
  }

  if (error || !status) {
    return (
      <div className="p-6 text-center py-20">
        <div className="text-5xl mb-4">⚠️</div>
        <p className="text-red-500 font-semibold">{error}</p>
      </div>
    );
  }

  const progressPercent = Math.round((status.passedCount / status.totalConditions) * 100);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Download Certificate</h1>
        <p className="text-gray-500 text-sm mt-1">
          Complete all conditions to unlock your certificate
        </p>
      </div>

      {/* Progress Overview */}
      <div className={`rounded-2xl p-6 mb-6 border-2 ${status.allPassed ? "bg-green-50 border-green-300" : "bg-white border-gray-200"}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className={`text-xl font-black ${status.allPassed ? "text-green-700" : "text-gray-800"}`}>
              {status.allPassed ? "🎉 All Conditions Met!" : "🎓 Certificate Progress"}
            </h2>
            <p className={`text-sm mt-1 ${status.allPassed ? "text-green-600" : "text-gray-500"}`}>
              {status.allPassed
                ? "You are eligible to download your certificate!"
                : `${status.passedCount} of ${status.totalConditions} conditions completed`}
            </p>
          </div>
          <div className={`text-3xl font-black ${status.allPassed ? "text-green-600" : "text-blue-600"}`}>
            {progressPercent}%
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-100 rounded-full h-3 mb-4">
          <div
            className="h-3 rounded-full transition-all duration-700"
            style={{
              width: `${progressPercent}%`,
              background: status.allPassed
                ? "linear-gradient(90deg, #16a34a, #22c55e)"
                : "linear-gradient(90deg, #2563eb, #3b82f6)",
            }}
          />
        </div>

        {/* Download button if all passed */}
        {status.allPassed && (
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full mt-2 bg-green-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-green-700 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
          >
            {downloading ? "⏳ Generating Certificate..." : "⬇️ Download Certificate PDF"}
          </button>
        )}
      </div>

      {/* Conditions Checklist */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm mb-6">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">Conditions Checklist</h3>
          <p className="text-xs text-gray-400 mt-0.5">All conditions must be met to download your certificate</p>
        </div>
        <div className="p-5 flex flex-col gap-3">
          {status.conditions.map((condition) => (
            <div
              key={condition.key}
              className={`flex items-center justify-between p-4 rounded-xl border ${
                condition.passed
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
                  condition.passed ? "bg-green-500 text-white" : "bg-red-400 text-white"
                }`}>
                  {condition.passed ? "✓" : "✗"}
                </div>
                <div>
                  <p className={`font-semibold text-sm ${condition.passed ? "text-green-800" : "text-red-800"}`}>
                    {condition.label}
                  </p>
                  <p className={`text-xs ${condition.passed ? "text-green-600" : "text-red-500"}`}>
                    {condition.message}
                  </p>
                </div>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                condition.passed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
              }`}>
                {condition.passed ? "Done" : "Pending"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Certificate Preview — only shown when all passed */}
      {status.allPassed && (
        <div>
          <h3 className="font-bold text-gray-800 mb-3">Certificate Preview</h3>

          {/* A4 Landscape Certificate */}
          <div
            ref={certificateRef}
            style={{
              width: "1123px",
              height: "794px",
              position: "relative",
              background: "#ffffff",
              fontFamily: "Georgia, serif",
              overflow: "hidden",
            }}
          >
            {/* Background image */}
         {bgImageUrl && (
  <div style={{
    position: "absolute", inset: 0,
    backgroundImage: `url(${bgImageUrl})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    opacity: 0.15,
  }} />
)}

            {/* Border decoration */}
            <div style={{
              position: "absolute", inset: "20px",
              border: "3px solid #0b1f3a",
              borderRadius: "4px",
            }} />
            <div style={{
              position: "absolute", inset: "28px",
              border: "1px solid #0b1f3a",
              borderRadius: "2px",
            }} />

            {/* Content */}
            <div style={{
              position: "relative", zIndex: 1,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "60px 80px",
              textAlign: "center",
            }}>

              {/* Company */}
              <p style={{ fontSize: "13px", color: "#555", letterSpacing: "3px", textTransform: "uppercase", margin: "0 0 4px" }}>
                {company?.company_name || "Institution Name"}
              </p>
              <div style={{ width: "60px", height: "2px", background: "#0b1f3a", margin: "8px auto" }} />

              {/* Title */}
              <h1 style={{ fontSize: "36px", fontWeight: "700", color: "#0b1f3a", margin: "16px 0 8px", letterSpacing: "4px", textTransform: "uppercase" }}>
                Certificate of Completion
              </h1>

              {/* Subtitle */}
              <p style={{ fontSize: "14px", color: "#777", letterSpacing: "1px", margin: "0 0 32px" }}>
                This is to certify that
              </p>

              {/* Student Name */}
              <h2 style={{ fontSize: "48px", fontWeight: "700", color: "#1a3a6b", margin: "0 0 16px", fontStyle: "italic" }}>
                {status.student.full_name}
              </h2>

              {/* Course */}
              <p style={{ fontSize: "16px", color: "#555", margin: "0 0 8px" }}>
                has successfully completed the course
              </p>
              <h3 style={{ fontSize: "28px", fontWeight: "700", color: "#0b1f3a", margin: "0 0 32px", textTransform: "uppercase", letterSpacing: "2px" }}>
                {status.student.course_name}
              </h3>

              {/* Details Row */}
              <div style={{ display: "flex", gap: "48px", marginBottom: "40px" }}>
                {[
                  { label: "Admission No", value: status.student.admission_number || "N/A" },
                  { label: "Batch", value: status.student.batch_allotted || "N/A" },
                  { label: "Date", value: formatDate(new Date().toISOString()) },
                ].map((item) => (
                  <div key={item.label} style={{ textAlign: "center" }}>
                    <p style={{ fontSize: "10px", color: "#888", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 4px" }}>
                      {item.label}
                    </p>
                    <p style={{ fontSize: "14px", fontWeight: "700", color: "#1a1a1a", margin: 0 }}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Signature */}
              <div style={{ display: "flex", gap: "80px" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ width: "120px", borderTop: "1px solid #333", paddingTop: "8px" }}>
                    <p style={{ fontSize: "11px", color: "#555", margin: 0 }}>Student Signature</p>
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ width: "120px", borderTop: "1px solid #333", paddingTop: "8px" }}>
                    <p style={{ fontSize: "11px", color: "#555", margin: 0 }}>Authorized Signatory</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <p className="text-gray-400 text-xs mt-3 text-center">
            Certificate is in A4 Landscape format
          </p>
        </div>
      )}
    </div>
  );
}
