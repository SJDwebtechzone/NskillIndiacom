"use client";

import { useEffect, useState } from "react";

interface Applicant {
  id: number;
  job_id: number;
  name: string;
  email: string;
  location: string;
  qualification: string;
  skills: string;
  experience: string;
  resume_filename: string;
  resume_mimetype: string;
  applied_at: string;
}

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "AP";
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const DownloadIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

export default function AdminApplicationsPage() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterJob, setFilterJob] = useState("all");
  const [downloading, setDownloading] = useState<number | null>(null);

  const fetchApplicants = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/jobs/applications");
      const data = await res.json();
      console.log("API response:", data); // check what comes back
      setApplicants(Array.isArray(data) ? data : data.applications || data.applicants || []);
    } catch (err) {
      console.error("Failed to fetch applicants", err);
      setApplicants([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  const handleDownload = async (applicant: Applicant) => {
    setDownloading(applicant.id);
    try {
      const res = await fetch(`http://localhost:5000/api/jobs/resume/${applicant.id}`);
      if (!res.ok) throw new Error("Failed to fetch resume");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = applicant.resume_filename || `resume_${applicant.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Could not download resume. Please try again.");
      console.error(err);
    }
    setDownloading(null);
  };

const jobIds = Array.from(new Set((applicants || []).map((a) => a.job_id))).sort();

  const filtered = applicants.filter((a) => {
    const matchSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()) ||
      a.skills.toLowerCase().includes(search.toLowerCase());
    const matchJob = filterJob === "all" || a.job_id === Number(filterJob);
    return matchSearch && matchJob;
  });

  return (
    <div className="bg-[#f3f2ee] min-h-screen font-sans">

      {/* TOP BAR */}
      <div className="bg-white border-b border-[#e4e2e0] px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="bg-[#2557a7] text-white font-bold text-[13px] px-2.5 py-1 rounded">
            indeed
          </span>
          <span className="text-[13px] text-[#767676]">Admin Console</span>
        </div>
        <span className="bg-[#e8f0fe] text-[#1a3f7a] text-[11px] font-semibold px-2.5 py-1 rounded-full">
          Applications
        </span>
      </div>

      {/* MAIN */}
      <div className="max-w-4xl mx-auto px-4 py-7">

        {/* PAGE HEADER */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h1 className="text-[22px] font-bold text-[#1a1a1a] mb-1">All Applications</h1>
            <p className="text-[13px] text-[#767676]">
              {applicants.length} total · {filtered.length} shown
            </p>
          </div>
          <button
            className="bg-white border border-[#d4d2cc] rounded-lg px-4 py-2 text-[13px] text-[#1a1a1a] cursor-pointer font-sans hover:bg-gray-50 transition-colors"
            onClick={fetchApplicants}
          >
            ↻ Refresh
          </button>
        </div>

        {/* FILTERS */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            className="flex-1 h-10 px-3.5 border border-[#d4d2cc] rounded-lg text-[13px] text-[#1a1a1a] bg-white outline-none font-sans"
            placeholder="Search by name, email or skill…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="h-10 px-3 border border-[#d4d2cc] rounded-lg text-[13px] text-[#1a1a1a] bg-white outline-none font-sans cursor-pointer"
            value={filterJob}
            onChange={(e) => setFilterJob(e.target.value)}
          >
            <option value="all">All Jobs</option>
            {jobIds.map((jid) => (
              <option key={jid} value={jid}>
                Job #{jid}
              </option>
            ))}
          </select>
        </div>

        {/* TABLE PANEL */}
        <div className="bg-white border border-[#e4e2e0] rounded-xl overflow-hidden">

          {loading ? (
            <div className="text-center py-12 text-[#767676]">
              <p className="text-[14px]">Loading applications…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-[#767676]">
              <p className="text-[28px] opacity-40 mb-2">📭</p>
              <p className="text-[14px]">No applications found</p>
            </div>
          ) : (
            filtered.map((applicant) => {
              const skills = applicant.skills
                ? applicant.skills.split(",").map((s) => s.trim()).filter(Boolean)
                : [];

              return (
                <div
                  key={applicant.id}
                  className="grid grid-cols-1 sm:grid-cols-[200px_1fr] lg:grid-cols-[220px_1fr_160px] gap-4 px-5 py-4 border-b border-[#e4e2e0] items-start lg:items-center"
                >

                  {/* LEFT — Avatar + Name */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#e8f0fe] border border-[#b3c9ef] flex items-center justify-center font-bold text-[13px] text-[#2557a7] shrink-0">
                      {getInitials(applicant.name)}
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold text-[#1a1a1a] mb-0.5">
                        {applicant.name}
                      </p>
                      <p className="text-[12px] text-[#767676]">{applicant.email}</p>
                    </div>
                  </div>

                  {/* MIDDLE — Details */}
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap gap-1.5">
                      {applicant.location && (
                        <span className="text-[11px] text-[#555] bg-[#f3f2ee] px-2 py-0.5 rounded-full">
                          📍 {applicant.location}
                        </span>
                      )}
                      {applicant.experience && (
                        <span className="text-[11px] text-[#555] bg-[#f3f2ee] px-2 py-0.5 rounded-full">
                          💼 {applicant.experience}
                        </span>
                      )}
                      {applicant.qualification && (
                        <span className="text-[11px] text-[#555] bg-[#f3f2ee] px-2 py-0.5 rounded-full">
                          🎓 {applicant.qualification}
                        </span>
                      )}
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#e8f0fe] text-[#1a3f7a]">
                        Job #{applicant.job_id}
                      </span>
                    </div>

                    {skills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {skills.slice(0, 4).map((sk, i) => (
                          <span
                            key={i}
                            className="text-[11px] text-[#555] bg-[#f3f2ee] px-2 py-0.5 rounded-full border border-[#e4e2e0]"
                          >
                            {sk}
                          </span>
                        ))}
                        {skills.length > 4 && (
                          <span className="text-[11px] text-[#555] bg-[#f3f2ee] px-2 py-0.5 rounded-full border border-[#e4e2e0]">
                            +{skills.length - 4}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* RIGHT — Time + Download */}
                  <div className="flex flex-row lg:flex-col items-center lg:items-end gap-2 lg:gap-2">
                    <p className="text-[11px] text-[#767676]">{timeAgo(applicant.applied_at)}</p>

                    <button
                      className={`flex items-center gap-1.5 bg-[#2557a7] text-white border-none rounded-lg px-3.5 py-2 text-[12px] font-semibold cursor-pointer font-sans transition-opacity ${
                        downloading === applicant.id ? "opacity-60 cursor-not-allowed" : "opacity-100"
                      }`}
                      disabled={downloading === applicant.id}
                      onClick={() => handleDownload(applicant)}
                    >
                      <DownloadIcon />
                      {downloading === applicant.id ? "Downloading…" : "Resume"}
                    </button>

                    {applicant.resume_filename && (
                      <p className="text-[11px] text-[#767676] max-w-[140px] overflow-hidden text-ellipsis whitespace-nowrap">
                        📄 {applicant.resume_filename}
                      </p>
                    )}
                  </div>

                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
