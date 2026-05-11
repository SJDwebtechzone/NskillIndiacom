"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

  useEffect(() => {
    fetch(`${API}/api/jobs/jobs`)
      .then((res) => res.json())
      .then((data: Job[]) => {
        const found = data.find((j) => j.id.toString() === id);
        setJob(found || null);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching jobs:", err);
        setLoading(false);
      });
  }, [id, API]);

  if (loading) {
    return <div className="min-h-screen bg-[#f3f2ee] flex items-center justify-center font-[Segoe_UI,sans-serif]">Loading job details...</div>;
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-[#f3f2ee] flex flex-col items-center justify-center gap-4 font-[Segoe_UI,sans-serif]">
        <h1 className="text-2xl font-bold">Job not found</h1>
        <button className="text-blue-600 underline" onClick={() => router.push("/placements/profile")}>Back to jobs</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-4 md:p-8 font-[Segoe_UI,sans-serif] flex justify-center items-start">
      <div className="bg-white border border-[#eff1f6] rounded-[32px] p-6 md:p-10 w-full max-w-4xl shadow-[0_8px_30px_rgba(47,85,228,0.06)] mt-4 md:mt-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[140px] bg-gradient-to-r from-[#e8f0fb] to-[#f6f7fb]"></div>
        
        {/* Top Navigation */}
        <button
          className="relative z-10 flex items-center gap-2 text-[#2f55e4] hover:text-[#111827] text-[15px] font-bold mb-4 bg-transparent border-none cursor-pointer p-0 transition-colors"
          onClick={() => router.push("/placements/profile")}
        >
          ← Back to jobs
        </button>

        {/* Header Section */}
        <div className="relative z-10 flex flex-col md:flex-row gap-6 md:gap-8 items-start mb-10">
          <div className="w-[100px] h-[100px] rounded-[24px] bg-white border-4 border-white flex items-center justify-center shadow-sm shrink-0">
            <span className="text-[40px] font-black text-[#2f55e4]">{job.company.charAt(0)}</span>
          </div>
          <div className="mt-2 md:mt-10">
            <h1 className="text-[32px] md:text-[42px] font-extrabold text-[#111827] leading-[1.1] tracking-tight mb-2">
              {job.title}
            </h1>
            <div className="flex items-center gap-3">
              <p className="text-[20px] md:text-[22px] text-[#2f55e4] font-bold">
                {job.company}
              </p>
              <span className="bg-[#e8f0fb] text-[#2f55e4] text-[13px] font-bold px-3 py-1 rounded-full">Actively hiring</span>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#f6f7fb] rounded-2xl p-5 border border-[#eff1f6]">
            <p className="text-[13px] font-medium text-[#7c829c] mb-1">Avg. Salary</p>
            <p className="text-[16px] font-bold text-[#111827]">{job.salary || "Not disclosed"}</p>
          </div>
          <div className="bg-[#f6f7fb] rounded-2xl p-5 border border-[#eff1f6]">
            <p className="text-[13px] font-medium text-[#7c829c] mb-1">Location</p>
            <p className="text-[16px] font-bold text-[#111827]">{job.location}</p>
          </div>
          <div className="bg-[#f6f7fb] rounded-2xl p-5 border border-[#eff1f6]">
            <p className="text-[13px] font-medium text-[#7c829c] mb-1">Job Type</p>
            <p className="text-[16px] font-bold text-[#111827]">{job.type || "Full Time"}</p>
          </div>
          <div className="bg-[#f6f7fb] rounded-2xl p-5 border border-[#eff1f6]">
            <p className="text-[13px] font-medium text-[#7c829c] mb-1">Work Mode</p>
            <p className="text-[16px] font-bold text-[#111827]">{job.mode || "On-site"}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-4 pb-10 border-b border-[#eff1f6]">
          <button
            className="bg-[#2f55e4] hover:bg-[#2242c2] transition-colors text-white border-none rounded-full px-10 py-3.5 text-[16px] font-bold cursor-pointer inline-flex items-center justify-center min-w-[200px]"
            onClick={() => router.push(`/placements/apply/${job.id}`)}
          >
            Apply for this role
          </button>
          <button className="bg-white hover:bg-[#f6f7fb] border border-[#dce0ec] transition-colors text-[#2f55e4] font-bold text-[16px] px-8 py-3.5 rounded-full cursor-pointer flex items-center gap-2">
            <span>🔖</span> Save Job
          </button>
          <button className="w-12 h-12 rounded-full border border-[#dce0ec] bg-white cursor-pointer flex items-center justify-center text-[18px] text-[#7c829c] hover:bg-[#f6f7fb] hover:text-[#111827] transition-colors">
            ↗
          </button>
        </div>

        {/* Description Section */}
        <div className="mt-10">
          <h2 className="text-[24px] font-bold text-[#111827] mb-6 tracking-tight">About this role</h2>
          <div className="text-[16px] text-[#4b5563] leading-[1.8] whitespace-pre-line font-medium">
            {job.description}
          </div>
        </div>
        
      </div>
    </div>
  );
}
