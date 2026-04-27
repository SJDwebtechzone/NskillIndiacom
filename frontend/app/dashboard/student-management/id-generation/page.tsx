"use client";
import { useEffect, useState, useRef } from "react";
import { useBackgroundImage } from "@/app/hooks/useBackgroundImage";

interface StudentData {
  id: number;
  full_name: string;
  admission_number: string;
  dob: string;
  mobile_number: string;
  course_name: string;
  batch_allotted: string;
  photo_url: string;
  admission_date: string;
  email_id: string;
}

interface CompanyInfo {
  company_name: string;
  address: string;
  primary_phone: string;
  email: string;
}

export default function IDGenerationPage() {
  const [student, setStudent] = useState<StudentData | null>(null);
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const { bgImageUrl } = useBackgroundImage("ID Card");

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const API = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentRes, companyRes] = await Promise.all([
        fetch(`${API}/api/admissions/my-profile`, {
  headers: { Authorization: `Bearer ${token}` },
}),
          fetch(`${API}/api/settings/contact-info`),
        ]);
        const studentData = await studentRes.json();
        const companyData = await companyRes.json();

        if (studentData.student) {
          setStudent(studentData.student);
        } else {
          setError("Student profile not found.");
        }
        if (companyData) setCompany(companyData);
      } catch (err) {
        console.error(err);
        setError("Failed to load ID card data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getPhotoUrl = (photoUrl: string) => {
    if (!photoUrl) return null;
    const cleaned = photoUrl.replace(/\\/g, "/");
    const withSlash = cleaned.startsWith("/") ? cleaned : `/${cleaned}`;
    return `${API}${withSlash}`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit", month: "2-digit", year: "numeric"
    });
  };

const getValidUntil = (admissionDate: string) => {
  if (!admissionDate) return "N/A";
  const date = new Date(admissionDate);
  if (isNaN(date.getTime())) return "N/A";
  date.setFullYear(date.getFullYear() + 1);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit", month: "2-digit", year: "numeric"
  });
};

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#0b1f3a",
        imageTimeout: 15000,
        onclone: (clonedDoc) => {
          const images = clonedDoc.querySelectorAll("img");
          images.forEach((img) => {
            img.crossOrigin = "anonymous";
          });
        },
      });
      const link = document.createElement("a");
      link.download = `ID_Card_${student?.admission_number || "student"}.png`;
      link.href = canvas.toDataURL("image/png");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
        Loading ID card...
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

  const photoUrl = getPhotoUrl(student.photo_url);

  return (
    <div className="p-6 flex flex-col items-center">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-800">My ID Card</h1>
        <p className="text-gray-500 text-sm mt-1">Your official student identity card</p>
      </div>

      {/* ID Card */}
<div
  ref={cardRef}
  className="relative w-[320px] rounded-3xl overflow-hidden shadow-2xl"
  style={{
    background: "linear-gradient(135deg, #0b1f3a 0%, #1a3a6b 50%, #0b1f3a 100%)",
    minHeight: "520px",
  }}
>
  {/* Background image — only in top header area */}
  {bgImageUrl && (
    <div
      className="absolute top-0 left-0 right-0"
      style={{
        height: "120px",
        backgroundImage: `url(${bgImageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center top",
        opacity: 0.15,
      }}
    />
  )}
  {/* Dark overlay */}
  <div
    className="absolute inset-0"
    style={{ background: "linear-gradient(135deg, rgba(11,31,58,0.95) 0%, rgba(26,58,107,0.95) 100%)" }}
  />

        {/* Card Content */}
        <div className="relative z-10 flex flex-col items-center px-6 py-7">

          {/* Company Name */}
          <div className="w-full text-center mb-4">
            <p className="text-blue-300 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">
              Student Identity Card
            </p>
            <h2 className="text-white text-lg font-black uppercase tracking-tight">
              {company?.company_name || "NSkill India"}
            </h2>
            {company?.address && (
              <p className="text-blue-200 text-[9px] mt-0.5 leading-tight">
                {company.address}
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-white/20 mb-5" />

          {/* Photo */}
          <div className="mb-4">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={student.full_name}
                crossOrigin="anonymous"
                className="w-24 h-24 rounded-full object-cover"
                style={{
                  border: "3px solid rgba(255,255,255,0.8)",
                  boxShadow: "0 0 0 4px rgba(59,130,246,0.4)",
                }}
              />
            ) : (
              <div
                className="w-24 h-24 rounded-full bg-blue-700 flex items-center justify-center text-white text-3xl font-black"
                style={{
                  border: "3px solid rgba(255,255,255,0.8)",
                  boxShadow: "0 0 0 4px rgba(59,130,246,0.4)",
                }}
              >
                {student.full_name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Name */}
          <h3 className="text-white text-xl font-black uppercase tracking-wide mb-1 text-center">
            {student.full_name}
          </h3>
          <p className="text-blue-300 text-xs font-semibold mb-4 text-center">
            {student.course_name}
          </p>

          {/* Details */}
          <div className="w-full bg-white/10 rounded-2xl p-4 space-y-2.5 backdrop-blur-sm">
            {[
      { label: "Admission No", value: student.admission_number || student.id.toString() },
              { label: "Date of Birth", value: formatDate(student.dob) },
              { label: "Mobile", value: student.mobile_number },
              { label: "Batch", value: student.batch_allotted || "N/A" },
              { label: "Valid Until", value: getValidUntil(student.admission_date) },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-blue-300 text-[10px] font-semibold uppercase tracking-wide">
                  {item.label}
                </span>
                <span className="text-white text-xs font-bold text-right max-w-[55%] truncate">
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-white/20 mt-5 mb-3" />

          {/* Footer */}
          <div className="text-center">
            <p className="text-blue-300 text-[9px] font-medium">
              If found, please contact: {company?.primary_phone || ""}
            </p>
            <p className="text-blue-400 text-[9px] mt-0.5">
              {company?.email || ""}
            </p>
          </div>
        </div>
      </div>

      {/* Download Button */}
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="mt-6 flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-all shadow-lg shadow-blue-200"
      >
        {downloading ? <>⏳ Generating...</> : <>⬇️ Download ID Card</>}
      </button>
      <p className="text-gray-400 text-xs mt-2">Downloads as high quality PNG image</p>
    </div>
  );
}