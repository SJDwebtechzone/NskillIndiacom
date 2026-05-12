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
  description: string;
  skills?: string;
}

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Overview");

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
    return <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center font-[Segoe_UI,sans-serif] font-bold text-[#2f55e4]">Loading premium insights...</div>;
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center gap-6 font-[Segoe_UI,sans-serif]">
        <div className="text-6xl">🔍</div>
        <h1 className="text-[28px] font-black text-[#111827]">Job details not found</h1>
        <button className="bg-[#2f55e4] text-white px-8 py-3 rounded-2xl font-black shadow-lg" onClick={() => router.push("/placements/profile")}>Back to Opportunities</button>
      </div>
    );
  }

  const rolePoints = job.description.split('\n').filter(p => p.trim().length > 5);

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 font-[Segoe_UI,sans-serif]">
      
      {/* ── TOP HEADER (GRADIENT) ── */}
      <div className="bg-white border-b border-[#eff1f6] pt-12 pb-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#2f55e4]/5 rounded-full blur-3xl -mr-40 -mt-40"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-orange-500/5 rounded-full blur-3xl -ml-20 -mb-20"></div>
        
        <div className="max-w-7xl mx-auto px-4 md:px-10 relative z-10">
          <button
            className="flex items-center gap-2 text-[#7c829c] hover:text-[#2f55e4] text-[15px] font-black mb-8 transition-colors group"
            onClick={() => router.push("/placements/profile")}
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to jobs
          </button>

          <div className="flex flex-col md:flex-row items-start justify-between gap-10">
            <div className="flex-1 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-[28px] bg-[#f6f7fb] border border-[#eff1f6] flex items-center justify-center text-[32px] font-black text-[#2f55e4] shadow-sm">
                  {job.company.charAt(0)}
                </div>
                <div>
                  <h1 className="text-[36px] md:text-[48px] font-black text-[#111827] tracking-tight leading-tight">
                    {job.title}
                  </h1>
                  <p className="text-[18px] md:text-[22px] font-bold text-[#4b5563] mt-1">
                    in <span className="text-[#2f55e4]">{job.company}</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-8 pt-4">
                <div className="space-y-1">
                  <p className="text-[12px] font-black text-[#7c829c] uppercase tracking-wider">Avg. Salary</p>
                  <p className="text-[20px] font-black text-orange-600">₹{job.salary || "Not disclosed"}</p>
                </div>
                <div className="w-px h-10 bg-[#eff1f6] hidden sm:block"></div>
                <div className="space-y-1">
                  <p className="text-[12px] font-black text-[#7c829c] uppercase tracking-wider">Key Skills</p>
                  <p className="text-[16px] font-bold text-[#111827]">{job.skills || "Technical Proficiency, Communication, Problem Solving"}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 w-full md:w-auto">
              <button
                className="bg-[#2f55e4] hover:bg-[#2242c2] text-white rounded-[24px] px-16 py-6 text-[18px] font-black shadow-2xl shadow-[#2f55e4]/30 hover:shadow-[#2f55e4]/50 hover:-translate-y-1.5 transition-all active:translate-y-0"
                onClick={() => router.push(`/placements/apply/${job.id}`)}
              >
                Apply Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT GRID ── */}
      <div className="max-w-7xl mx-auto px-4 md:px-10 mt-[-40px] relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
          
          <div className="flex flex-col gap-8">
            {/* TABS */}
            <div className="bg-white p-2 rounded-[24px] border border-[#eff1f6] flex flex-wrap items-center gap-2 shadow-xl shadow-[#eff1f6]/50">
              {["Overview"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-8 py-3 rounded-2xl text-[15px] font-black transition-all ${activeTab === tab ? 'bg-[#2f55e4] text-white shadow-lg' : 'text-[#7c829c] hover:bg-[#f6f7fb]'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* CONTENT AREA */}
            <div className="bg-white rounded-[40px] border border-[#eff1f6] p-8 md:p-12 shadow-2xl shadow-[#eff1f6]/50">
              <h2 className="text-[28px] font-black text-[#111827] mb-8 tracking-tight flex items-center gap-3">
                <span className="w-2 h-8 bg-[#2f55e4] rounded-full"></span>
                Role at a glance
              </h2>
              
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 pb-10 border-b border-[#f6f7fb]">
                   <div className="bg-[#f6f7fb] p-6 rounded-3xl border border-[#eff1f6]">
                      <p className="text-[11px] font-black text-[#7c829c] uppercase tracking-wider mb-2">Location</p>
                      <p className="text-[16px] font-bold text-[#111827]">📍 {job.location}</p>
                   </div>
                   <div className="bg-[#f6f7fb] p-6 rounded-3xl border border-[#eff1f6]">
                      <p className="text-[11px] font-black text-[#7c829c] uppercase tracking-wider mb-2">Job Type</p>
                      <p className="text-[16px] font-bold text-[#111827]">💼 {job.type || "Full Time"}</p>
                   </div>
                   <div className="bg-[#f6f7fb] p-6 rounded-3xl border border-[#eff1f6]">
                      <p className="text-[11px] font-black text-[#7c829c] uppercase tracking-wider mb-2">Work Mode</p>
                      <p className="text-[16px] font-bold text-[#111827]">🏠 {job.mode || "On-site"}</p>
                   </div>
                </div>

                <div className="space-y-4">
                  {rolePoints.length > 0 ? rolePoints.map((point, i) => (
                    <div key={i} className="flex gap-4 group">
                      <div className="mt-1.5 w-6 h-6 rounded-full bg-[#e8f0fb] flex items-center justify-center shrink-0 text-[#2f55e4] font-black text-[10px] group-hover:bg-[#2f55e4] group-hover:text-white transition-all">
                        {i + 1}
                      </div>
                      <p className="text-[17px] text-[#4b5563] leading-relaxed font-medium group-hover:text-[#111827] transition-colors">
                        {point.replace(/^[•\-\*]\s*/, '')}
                      </p>
                    </div>
                  )) : (
                    <p className="text-[17px] text-[#4b5563] leading-relaxed font-medium">
                      {job.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── SIDEBAR ACTIONS ── */}
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-[40px] border border-[#eff1f6] p-8 shadow-2xl shadow-[#eff1f6]/50 sticky top-24">
               {/* KEY SKILLS */}
               <div className="mb-10 pb-8 border-b border-[#f6f7fb]">
                  <h3 className="text-[20px] font-black text-[#111827] mb-6 flex items-center gap-2">
                    <span className="text-[24px]">⚡</span> Key Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(job.skills ? job.skills.split(/[,|/]+/) : (job.description.split(/[,.]/)[0].split(' ').filter(w => w.length > 4))).slice(0, 8).map((skill, i) => (
                      <span key={i} className="bg-[#f6f7fb] text-[#4b5563] px-4 py-2 rounded-xl text-[13px] font-black border border-[#eff1f6] hover:border-[#2f55e4] hover:text-[#2f55e4] transition-all cursor-default">
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
               </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function SidebarAction({ icon, label }: { icon: string, label: string }) {
  return (
    <button className="flex items-center gap-4 p-4 rounded-2xl hover:bg-[#f6f7fb] transition-all group w-full text-left">
      <span className="text-[20px] group-hover:scale-120 transition-transform">{icon}</span>
      <span className="text-[14px] font-bold text-[#4b5563] group-hover:text-[#2f55e4] transition-colors">{label}</span>
    </button>
  );
}
