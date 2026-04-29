"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  type?: string;
  mode?: string;
  openBadge?: string;
  description: string;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function PlacementPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("Chennai, Tamil Nadu");
  const [showDetail, setShowDetail] = useState(false);
  const router = useRouter();
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
  useEffect(() => {
    fetch(`${API}/api/jobs/jobs`)
      .then((res) => res.json())
      .then((data: Job[]) => {
        setJobs(data);
        setFilteredJobs(data);
        if (data.length > 0) setSelectedJob(data[0]);
      });
  }, []);

  const handleSearch = () => {
    const q = search.toLowerCase();
    const results = q
      ? jobs.filter(
          (job) =>
            job.title.toLowerCase().includes(q) ||
            job.company.toLowerCase().includes(q)
        )
      : [...jobs];
    setFilteredJobs(results);
    setSelectedJob(results.length > 0 ? results[0] : null);
  };

  const handleSelectJob = (job: Job) => {
    setSelectedJob(job);
    setShowDetail(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f3f2ee] p-4 md:p-5 gap-3.5 font-[Segoe_UI,sans-serif]">

      {/* ── SEARCH BAR ── */}
      <div className="bg-white rounded-full shadow-[0_2px_14px_rgba(0,0,0,0.12)] px-4 py-2.5 flex flex-col sm:flex-row items-center gap-2 sm:gap-0">
        {/* Keyword input */}
        <div className="flex items-center gap-2 flex-1 px-2 py-1 w-full">
          <span className="text-base text-[#555]">🔍</span>
          <input
            className="border-none outline-none text-[14px] text-[#222] bg-transparent w-full font-[inherit]"
            placeholder="Job title, keywords, or company"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-7 bg-[#e0e0e0]" />

        {/* Location input */}
        <div className="flex items-center gap-2 flex-1 sm:max-w-[230px] px-2 py-1 w-full">
          <span className="text-base text-[#555]">📍</span>
          <input
            className="border-none outline-none text-[14px] text-[#222] bg-transparent w-full font-[inherit]"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        {/* Button */}
        <button
          className="bg-[#2557a7] text-white border-none rounded-full px-5 py-2.5 text-[14px] font-semibold cursor-pointer whitespace-nowrap font-[inherit] ml-0 sm:ml-2.5 w-full sm:w-auto"
          onClick={handleSearch}
        >
          Find jobs
        </button>
      </div>

      {/* ── CONTENT ROW ── */}
      <div className="grid grid-cols-1 md:grid-cols-[360px_1fr] gap-4 min-h-[480px]">

        {/* ── JOB LIST ── */}
        <div className={`flex flex-col ${showDetail ? "hidden md:flex" : "flex"}`}>
          <div className="px-1 py-2.5">
            <p className="text-[20px] font-bold text-[#1a1a1a]">Jobs for you</p>
            <p className="text-[12px] text-[#767676] mt-0.5">
              {filteredJobs.length === 0
                ? "No results"
                : `Showing ${filteredJobs.length} result${filteredJobs.length > 1 ? "s" : ""}`}
            </p>
          </div>

          <div className="flex flex-col overflow-y-auto max-h-[480px]">
            {filteredJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[300px] gap-2">
                <div className="text-[28px] opacity-20">🔍</div>
                <p className="text-[13px] font-semibold text-[#767676]">No jobs found</p>
                <p className="text-[12px] text-[#aaa]">Try different keywords or clear your search</p>
              </div>
            ) : (
              filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className={`bg-white rounded-lg p-4 cursor-pointer mb-2 relative transition-shadow duration-150 ${
                    selectedJob?.id === job.id
                      ? "border-2 border-[#2557a7] shadow-[0_0_0_1px_#2557a7]"
                      : "border border-[#d4d2cc]"
                  }`}
                  onClick={() => handleSelectJob(job)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {job.openBadge && (
                        <span className="bg-[#e3f4ec] text-[#0d5c2f] text-[12px] px-2.5 py-0.5 rounded font-medium inline-block mb-1.5">
                          ✉ {job.openBadge}
                        </span>
                      )}
                      <p className="text-[16px] font-bold text-[#2557a7] mb-0.5">{job.title}</p>
                      <p className="text-[14px] text-[#1a1a1a] mb-0.5">{job.company}</p>
                      <p className="text-[13px] text-[#767676] mb-2">{job.location}</p>
                    </div>
                    <span className="text-[16px] text-[#767676] cursor-pointer ml-2 shrink-0" title="Save">🔖</span>
                  </div>

                  <div className="flex gap-1.5 flex-wrap mt-1.5">
                    {job.salary && (
                      <span className="text-[12px] px-2.5 py-0.5 rounded bg-[#e3f4ec] text-[#0d5c2f] border border-[#b6ddc8]">
                        ✓ {job.salary}
                      </span>
                    )}
                    {job.type && (
                      <span className="text-[12px] px-2.5 py-0.5 rounded bg-[#f3f2ee] text-[#1a1a1a] border border-[#d4d2cc]">
                        ✓ {job.type}
                      </span>
                    )}
                  </div>

                  <span
                    className="absolute bottom-3.5 right-3.5 text-[16px] text-[#ccc] cursor-pointer"
                    title="Not interested"
                    onClick={(e) => e.stopPropagation()}
                  >
                    👎
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── JOB DETAIL ── */}
        <div className={`bg-white border border-[#d4d2cc] rounded-lg p-6 md:p-7 overflow-y-auto max-h-[520px] ${showDetail ? "block" : "hidden md:block"}`}>
          {/* Mobile back button */}
          {showDetail && (
            <button
              className="flex items-center gap-1 text-[#2557a7] text-[13px] font-semibold mb-4 md:hidden bg-transparent border-none cursor-pointer p-0"
              onClick={() => setShowDetail(false)}
            >
              ← Back to jobs
            </button>
          )}

          {!selectedJob ? (
            <div className="flex flex-col items-center justify-center h-[300px] gap-2">
              <div className="text-[32px] opacity-20">📄</div>
              <p className="text-[13px] text-[#767676]">Select a job to view details</p>
            </div>
          ) : (
            <>
              <p className="text-[24px] font-bold text-[#1a1a1a] mb-1.5">{selectedJob.title}</p>
              <a className="text-[15px] text-[#2557a7] no-underline inline-flex items-center gap-1 mb-3.5 cursor-pointer" href="#">
                {selectedJob.company} <span className="text-[12px]">↗</span>
              </a>

              <p className="text-[14px] text-[#1a1a1a] mb-1">
                📍 {selectedJob.location}
                {selectedJob.mode && ` · ${selectedJob.mode}`}
              </p>

              <p className="text-[18px] font-semibold text-[#1a1a1a] my-2.5 mb-4">
                💰 {selectedJob.salary}
              </p>

              {/* Action Row */}
              <div className="flex flex-wrap items-center gap-2 mb-4.5">
                <button
                  className="bg-[#2557a7] text-white border-none rounded-full px-6 py-2.5 text-[15px] font-semibold cursor-pointer font-[inherit]"
                  onClick={() => router.push(`/placements/apply/${selectedJob.id}`)}
                >
                  Apply now
                </button>
                {["🔖", "💬", "👎", "↗"].map((icon, i) => (
                  <button
                    key={i}
                    className="w-10 h-10 rounded-full border-[1.5px] border-[#d4d2cc] bg-white cursor-pointer flex items-center justify-center text-[16px] text-[#555]"
                  >
                    {icon}
                  </button>
                ))}
              </div>

              <hr className="border-none border-t border-[#e8e8e8] my-4" />

              <p className="text-[18px] font-bold text-[#1a1a1a] mb-1.5">Job details</p>
              <p className="text-[13px] text-[#767676] mb-3.5">
                Here&apos;s how the job details align with your profile
              </p>

              {/* Pay Row */}
              <div className="flex items-start gap-2.5 mb-3.5">
                <span className="text-[20px] shrink-0 mt-0.5">💳</span>
                <div>
                  <p className="text-[15px] font-semibold text-[#1a1a1a] mb-1">Pay</p>
                  <span className="inline-flex items-center gap-1 bg-[#f3f2ee] border border-[#d4d2cc] rounded px-3 py-1 text-[13px] text-[#1a1a1a] mr-1.5 mb-1">
                    <span className="text-[#2557a7] font-bold mr-0.5">✓</span>
                    {selectedJob.salary}
                    <span className="text-[#767676] ml-1">▾</span>
                  </span>
                </div>
              </div>

              {/* Job Type Row */}
              <div className="flex items-start gap-2.5 mb-3.5">
                <span className="text-[20px] shrink-0 mt-0.5">💼</span>
                <div>
                  <p className="text-[15px] font-semibold text-[#1a1a1a] mb-1">Job type</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedJob.type && (
                      <span className="inline-flex items-center gap-1 bg-[#f3f2ee] border border-[#d4d2cc] rounded px-3 py-1 text-[13px] text-[#1a1a1a]">
                        <span className="text-[#2557a7] font-bold mr-0.5">✓</span>
                        {selectedJob.type}
                        <span className="text-[#767676] ml-1">▾</span>
                      </span>
                    )}
                    {selectedJob.mode && (
                      <span className="inline-flex items-center gap-1 bg-[#f3f2ee] border border-[#d4d2cc] rounded px-3 py-1 text-[13px] text-[#1a1a1a]">
                        {selectedJob.mode}
                        <span className="text-[#767676] ml-1">▾</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <hr className="border-none border-t border-[#e8e8e8] my-4" />

              <p className="text-[18px] font-bold text-[#1a1a1a] mb-1.5">About this role</p>
              <p className="text-[14px] text-[#333] leading-[1.7]">
                {selectedJob.description.split("\n").map((line, i) => (
                  <span key={i}>
                    {line}
                    <br />
                  </span>
                ))}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

