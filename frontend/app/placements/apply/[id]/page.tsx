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

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

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
    const skillList = submittedData.skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    return (
      <div className="min-h-screen bg-[#f3f2ee] flex items-start justify-center px-4 py-8 sm:py-12 font-[Segoe_UI,sans-serif]">
        <div className="w-full max-w-[720px] flex flex-col gap-4">

          {/* Success Banner */}
          <div className="bg-[#e3f4ec] border border-[#b6ddc8] rounded-xl px-5 py-4 flex items-start gap-4">
            <span className="text-xl flex-shrink-0 mt-0.5">✅</span>
            <div>
              <p className="text-[15px] font-bold text-[#0d5c2f] mb-1">
                Application submitted successfully!
              </p>
              <p className="text-[13px] text-[#1a6b3a]">
                Your application for Job #{id} has been received. We&apos;ll get back to you soon.
              </p>
            </div>
          </div>

          {/* Profile Card */}
          <div className="bg-white border border-[#d4d2cc] rounded-xl overflow-hidden">

            {/* Card Header */}
            <div className="px-6 sm:px-7 pt-7 pb-5 flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-[#e8f0fb] border-2 border-[#b3c9ef] flex items-center justify-center text-[22px] font-bold text-[#2557a7] flex-shrink-0">
                {getInitials(submittedData.name)}
              </div>
              <div>
                <h1 className="text-[22px] font-bold text-[#1a1a1a] mb-1">
                  {submittedData.name}
                </h1>
                <p className="text-sm text-[#555] mb-0.5">📧 {submittedData.email}</p>
                <p className="text-sm text-[#767676]">📍 {submittedData.location}</p>
              </div>
            </div>

            <hr className="border-t border-[#e8e8e8]" />

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[#e8e8e8]">
              {[
                { label: "🎓 Qualification", value: submittedData.qualification },
                { label: "💼 Experience", value: submittedData.experience },
                { label: "🆔 Job Applied", value: `Job #${id}` },
                {
                  label: "📄 Resume",
                  value: `✓ ${submittedData.resume_filename}`,
                  blue: true,
                },
              ].map((item, i) => (
                <div key={i} className="bg-white px-5 sm:px-6 py-[18px]">
                  <p className="text-[11px] font-semibold text-[#767676] uppercase tracking-[0.06em] mb-1.5">
                    {item.label}
                  </p>
                  <p className={`text-sm font-semibold ${item.blue ? "text-[#2557a7]" : "text-[#1a1a1a]"}`}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            <hr className="border-t border-[#e8e8e8]" />

            {/* Skills */}
            <div className="px-5 sm:px-6 py-5">
              <p className="text-[11px] font-semibold text-[#767676] uppercase tracking-[0.06em] mb-3">
                🛠 Skills
              </p>
              <div className="flex flex-wrap gap-2">
                {skillList.length > 0 ? (
                  skillList.map((skill, i) => (
                    <span
                      key={i}
                      className="bg-[#e8f0fb] text-[#2557a7] border border-[#b3c9ef] rounded-full px-3.5 py-1 text-[13px] font-medium"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-sm font-semibold text-[#1a1a1a]">{submittedData.skills}</p>
                )}
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex justify-between gap-3">
            <button
              className="h-[42px] px-5 border-[1.5px] border-[#d4d2cc] rounded-full bg-white text-[#1a1a1a] text-sm font-semibold cursor-pointer"
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
    <div className="min-h-screen bg-[#f3f2ee] flex items-start justify-center px-4 py-8 sm:py-10 font-[Segoe_UI,sans-serif]">
      <div className="bg-white border border-[#d4d2cc] rounded-xl w-full max-w-[760px] overflow-hidden">

        {/* Header */}
        <div className="px-6 sm:px-8 pt-7 pb-5">
          <button
            className="bg-transparent border-none text-[#2557a7] text-[13px] cursor-pointer p-0 mb-3 block font-[inherit]"
            onClick={() => router.push("/placements/profile")}
          >
            ← Back to jobs
          </button>
          <h1 className="text-[22px] font-bold text-[#1a1a1a] mb-1.5">
            Apply for this position
          </h1>
          <p className="text-sm text-[#767676]">
            Fill in your details below to submit your application
          </p>
        </div>

        <hr className="border-t border-[#e8e8e8]" />

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 sm:px-8 pt-7 pb-8 flex flex-col gap-5">

          {/* Row 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-[#1a1a1a]">
                Full Name <span className="text-[#c40000] ml-0.5">*</span>
              </label>
              <input
                className="h-[42px] px-3.5 border border-[#d4d2cc] rounded-md text-sm text-[#1a1a1a] bg-white outline-none font-[inherit]"
                placeholder="e.g. Arun Kumar"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-[#1a1a1a]">
                Email Address <span className="text-[#c40000] ml-0.5">*</span>
              </label>
              <input
                className="h-[42px] px-3.5 border border-[#d4d2cc] rounded-md text-sm text-[#1a1a1a] bg-white outline-none font-[inherit]"
                type="email"
                placeholder="e.g. arun@email.com"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-[#1a1a1a]">
                Location <span className="text-[#c40000] ml-0.5">*</span>
              </label>
              <input
                className="h-[42px] px-3.5 border border-[#d4d2cc] rounded-md text-sm text-[#1a1a1a] bg-white outline-none font-[inherit]"
                placeholder="e.g. Chennai, Tamil Nadu"
                required
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-[#1a1a1a]">
                Qualification <span className="text-[#c40000] ml-0.5">*</span>
              </label>
              <input
                className="h-[42px] px-3.5 border border-[#d4d2cc] rounded-md text-sm text-[#1a1a1a] bg-white outline-none font-[inherit]"
                placeholder="e.g. B.E Computer Science"
                required
                value={form.qualification}
                onChange={(e) => setForm({ ...form, qualification: e.target.value })}
              />
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-[#1a1a1a]">
                Skills <span className="text-[#c40000] ml-0.5">*</span>
              </label>
              <input
                className="h-[42px] px-3.5 border border-[#d4d2cc] rounded-md text-sm text-[#1a1a1a] bg-white outline-none font-[inherit]"
                placeholder="e.g. React, Node.js, Python"
                required
                value={form.skills}
                onChange={(e) => setForm({ ...form, skills: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-[#1a1a1a]">
                Experience <span className="text-[#c40000] ml-0.5">*</span>
              </label>
              <input
                className="h-[42px] px-3.5 border border-[#d4d2cc] rounded-md text-sm text-[#1a1a1a] bg-white outline-none font-[inherit]"
                placeholder="e.g. 2 years"
                required
                value={form.experience}
                onChange={(e) => setForm({ ...form, experience: e.target.value })}
              />
            </div>
          </div>

          {/* Resume Upload */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-[#1a1a1a]">
              Resume <span className="text-[#c40000] ml-0.5">*</span>
            </label>
            <div
              className={`border-[1.5px] border-dashed rounded-lg px-4 py-5 cursor-pointer text-center transition-all ${
                fileError
                  ? "border-[#c40000] bg-[#fafaf8]"
                  : resumeFile
                  ? "border-[#2557a7] bg-[#f0f5ff]"
                  : "border-[#d4d2cc] bg-[#fafaf8]"
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
                <div className="flex items-center gap-3.5 text-left">
                  <span className="text-[28px] flex-shrink-0">📄</span>
                  <div>
                    <p className="text-sm font-semibold text-[#1a1a1a] m-0">{resumeFile.name}</p>
                    <p className="text-xs text-[#767676] m-0">
                      {(resumeFile.size / 1024).toFixed(0)} KB · Click to change
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5">
                  <span className="text-2xl">⬆️</span>
                  <p className="text-sm font-semibold text-[#1a1a1a] m-0">Click to upload resume</p>
                  <p className="text-xs text-[#767676] m-0">PDF, DOC, DOCX · Max 5 MB</p>
                </div>
              )}
            </div>
            {fileError && <p className="text-xs text-[#c40000] mt-1">{fileError}</p>}
          </div>

          {/* Submit Row */}
          <div className="flex justify-end gap-3 mt-2">
            <button
              type="button"
              className="h-[42px] px-5 border-[1.5px] border-[#d4d2cc] rounded-full bg-white text-[#1a1a1a] text-sm font-semibold cursor-pointer font-[inherit]"
              onClick={() => router.push("/placements/profile")}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`h-[42px] px-7 border-none rounded-full bg-[#2557a7] text-white text-sm font-semibold cursor-pointer font-[inherit] transition-opacity ${
                submitting ? "opacity-70" : ""
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
