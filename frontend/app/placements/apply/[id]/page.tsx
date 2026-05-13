"use client";

import { useState, FormEvent, useRef } from "react";
import { useParams, useRouter } from "next/navigation";

type FormType = {
  name: string;
  email: string;
  location: string;
  qualification: string;
  skills: string;
  experience: string;
};

type SubmittedType = FormType & {
  resume_filename: string;
};



export default function ApplyPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormType>({
    name: "",
    email: "",
    location: "",
    qualification: "",
    skills: "",
    experience: "",
  });

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<SubmittedType | null>(null);
  const [fileError, setFileError] = useState("");
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError("");
    if (!file) { setResumeFile(null); return; }

    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowed.includes(file.type)) {
      setFileError("Only PDF, DOC, or DOCX files are allowed");
      setResumeFile(null);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFileError("File size must be under 5 MB");
      setResumeFile(null);
      return;
    }
    setResumeFile(file);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  if (!resumeFile) { setFileError("Please upload your resume"); return; }

  setSubmitting(true);

  try {
    const formData = new FormData();
    formData.append("job_id", id);
    formData.append("name", form.name);
    formData.append("email", form.email);
    formData.append("location", form.location);
    formData.append("qualification", form.qualification);
    formData.append("skills", form.skills);
    formData.append("experience", form.experience);
    formData.append("resume", resumeFile);

    const res = await fetch(`${API}/api/jobs/apply`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
  

    if (res.ok) {
      setSubmittedData({ ...form, resume_filename: resumeFile.name });
      setSubmitted(true);
    } else {
      alert("Failed to apply: " + (data.error || data.message || "Unknown error"));
    }
  } catch (err) {
    console.error("Submit error:", err);
    alert("Network error. Make sure the backend is running on port 5000.");
  }

  setSubmitting(false);
};
  // ── SUCCESS VIEW ────────────────────────────────────────────────────────────
  if (submitted && submittedData) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center px-4 py-8 sm:py-12 font-[Segoe_UI,sans-serif]">
        <div className="w-full max-w-[500px] flex flex-col gap-6 text-center">

          {/* Success Card */}
          <div className="bg-white border border-[#eff1f6] rounded-[40px] p-10 shadow-2xl shadow-blue-900/5">
            <div className="w-20 h-20 rounded-full bg-[#e3f4ec] flex items-center justify-center text-3xl mx-auto mb-8 border border-[#b6ddc8]">
              ✅
            </div>
            <h2 className="text-2xl font-black text-[#111827] mb-4 tracking-tight">
              Application submitted successfully!
            </h2>
            <p className="text-[#7c829c] font-bold leading-relaxed mb-10">
              Your application for <span className="text-blue-600">Job #{id}</span> has been received. We&apos;ll get back to you soon.
            </p>
            
            <button
              className="w-full bg-[#2f55e4] hover:bg-[#2242c2] text-white rounded-2xl py-4 text-[16px] font-black transition-all shadow-xl shadow-blue-900/20 active:scale-95"
              onClick={() => router.push("/placements/profile")}
            >
              ← Browse more jobs
            </button>
          </div>

        </div>
      </div>
    );
  }

  // ── FORM VIEW ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f8f9fc] flex items-start justify-center px-4 py-8 sm:py-12 font-[Segoe_UI,sans-serif]">
      <div className="bg-white border border-[#eff1f6] rounded-[32px] w-full max-w-3xl overflow-hidden shadow-[0_8px_30px_rgba(47,85,228,0.06)]">

        {/* Header */}
        <div className="px-6 sm:px-10 pt-10 pb-6">
          <button
            className="flex items-center gap-2 text-[#7c829c] hover:text-[#2f55e4] text-[15px] font-bold mb-6 bg-transparent border-none cursor-pointer p-0 transition-colors"
            onClick={() => router.push("/placements/profile")}
          >
            ← Back to jobs
          </button>
          <h1 className="text-[32px] font-extrabold text-[#111827] mb-2 tracking-tight">
            Apply for this position
          </h1>
          <p className="text-[16px] font-medium text-[#7c829c]">
            Fill in your details below to submit your application
          </p>
        </div>

        <hr className="border-t border-[#eff1f6]" />

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 sm:px-10 pt-8 pb-10 flex flex-col gap-6">

          {/* Row 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-bold text-[#4b5563]">
                Full Name <span className="text-red-500 ml-0.5">*</span>
              </label>
              <input
                className="h-12 px-4 border border-[#eff1f6] rounded-xl text-[15px] font-semibold text-[#111827] bg-[#f6f7fb] outline-none focus:bg-white focus:border-[#2f55e4] focus:ring-2 focus:ring-[#e8f0fb] transition-all placeholder:text-[#a0a5ba] placeholder:font-medium"
                placeholder="e.g. Ragul Sankar"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-bold text-[#4b5563]">
                Email Address <span className="text-red-500 ml-0.5">*</span>
              </label>
              <input
                className="h-12 px-4 border border-[#eff1f6] rounded-xl text-[15px] font-semibold text-[#111827] bg-[#f6f7fb] outline-none focus:bg-white focus:border-[#2f55e4] focus:ring-2 focus:ring-[#e8f0fb] transition-all placeholder:text-[#a0a5ba] placeholder:font-medium"
                type="email"
                placeholder="e.g. ragulsankar@email.com"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-bold text-[#4b5563]">
                Location <span className="text-red-500 ml-0.5">*</span>
              </label>
              <input
                className="h-12 px-4 border border-[#eff1f6] rounded-xl text-[15px] font-semibold text-[#111827] bg-[#f6f7fb] outline-none focus:bg-white focus:border-[#2f55e4] focus:ring-2 focus:ring-[#e8f0fb] transition-all placeholder:text-[#a0a5ba] placeholder:font-medium"
                placeholder="e.g. Chennai, Tamil Nadu"
                required
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-bold text-[#4b5563]">
                Qualification <span className="text-red-500 ml-0.5">*</span>
              </label>
              <input
                className="h-12 px-4 border border-[#eff1f6] rounded-xl text-[15px] font-semibold text-[#111827] bg-[#f6f7fb] outline-none focus:bg-white focus:border-[#2f55e4] focus:ring-2 focus:ring-[#e8f0fb] transition-all placeholder:text-[#a0a5ba] placeholder:font-medium"
                placeholder="e.g. B.E Computer Science"
                required
                value={form.qualification}
                onChange={(e) => setForm({ ...form, qualification: e.target.value })}
              />
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-bold text-[#4b5563]">
                Skills <span className="text-red-500 ml-0.5">*</span>
              </label>
              <input
                className="h-12 px-4 border border-[#eff1f6] rounded-xl text-[15px] font-semibold text-[#111827] bg-[#f6f7fb] outline-none focus:bg-white focus:border-[#2f55e4] focus:ring-2 focus:ring-[#e8f0fb] transition-all placeholder:text-[#a0a5ba] placeholder:font-medium"
                placeholder="e.g. React, Node.js, Python"
                required
                value={form.skills}
                onChange={(e) => setForm({ ...form, skills: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-bold text-[#4b5563]">
                Experience <span className="text-red-500 ml-0.5">*</span>
              </label>
              <input
                className="h-12 px-4 border border-[#eff1f6] rounded-xl text-[15px] font-semibold text-[#111827] bg-[#f6f7fb] outline-none focus:bg-white focus:border-[#2f55e4] focus:ring-2 focus:ring-[#e8f0fb] transition-all placeholder:text-[#a0a5ba] placeholder:font-medium"
                placeholder="e.g. 2 years"
                required
                value={form.experience}
                onChange={(e) => setForm({ ...form, experience: e.target.value })}
              />
            </div>
          </div>

          {/* Resume Upload */}
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-bold text-[#4b5563]">
              Resume <span className="text-red-500 ml-0.5">*</span>
            </label>
            <div
              className={`border-2 border-dashed rounded-[20px] px-6 py-8 cursor-pointer text-center transition-all ${
                fileError
                  ? "border-red-400 bg-red-50"
                  : resumeFile
                  ? "border-[#2f55e4] bg-[#e8f0fb]"
                  : "border-[#dce0ec] bg-[#f6f7fb] hover:border-[#2f55e4] hover:bg-[#f0f5ff]"
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={handleFileChange}
              />
              {resumeFile ? (
                <div className="flex items-center gap-4 text-left justify-center">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-2xl border border-[#eff1f6]">📄</div>
                  <div>
                    <p className="text-[16px] font-bold text-[#111827] m-0">{resumeFile.name}</p>
                    <p className="text-[14px] font-medium text-[#7c829c] m-0 mt-0.5">
                      {(resumeFile.size / 1024).toFixed(0)} KB · Click to change
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 bg-white rounded-full shadow-sm flex items-center justify-center text-2xl border border-[#eff1f6]">⬆️</div>
                  <div>
                    <p className="text-[16px] font-bold text-[#111827] m-0">Click to upload resume</p>
                    <p className="text-[14px] font-medium text-[#7c829c] m-0 mt-1">PDF, DOC, DOCX · Max 5 MB</p>
                  </div>
                </div>
              )}
            </div>
            {fileError && <p className="text-[14px] font-bold text-red-500 mt-1">{fileError}</p>}
          </div>

          {/* Submit Row */}
          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              className="bg-white hover:bg-[#f6f7fb] border border-[#dce0ec] transition-colors text-[#7c829c] hover:text-[#111827] font-bold text-[16px] px-8 py-3.5 rounded-full cursor-pointer"
              onClick={() => router.push("/placements/profile")}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`bg-[#2f55e4] hover:bg-[#2242c2] transition-colors text-white border-none rounded-full px-10 py-3.5 text-[16px] font-bold cursor-pointer inline-flex items-center justify-center min-w-[200px] shadow-sm ${
                submitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {submitting ? "Submitting..." : "Submit Application"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
