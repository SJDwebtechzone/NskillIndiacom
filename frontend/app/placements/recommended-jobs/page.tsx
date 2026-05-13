"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SearchX, RotateCcw, Search } from "lucide-react";

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
  skills?: string;
}

export default function RecommendedJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const router = useRouter();
  const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

  useEffect(() => {
    fetch(`${API}/api/jobs/jobs`)
      .then((res) => res.json())
      .then((data: Job[]) => {
        setJobs(data || []);
        setFilteredJobs(data || []);
      })
      .catch((err) => console.error("Error fetching jobs:", err));

    // Show popup after 1 second initially
    const timer = setTimeout(() => {
      setShowPopup(true);
    }, 1000);

    // Recurring check every 10 seconds
    const interval = setInterval(() => {
      setShowPopup(true);
    }, 10000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [API]);

  const handleSearch = () => {
    const q = search.toLowerCase();
    const loc = location.toLowerCase();
    const results = jobs.filter((job) => {
      const matchSearch = q ? (job.title.toLowerCase().includes(q) || job.company.toLowerCase().includes(q) || job.description.toLowerCase().includes(q)) : true;
      const matchLoc = loc ? job.location.toLowerCase().includes(loc) : true;
      return matchSearch && matchLoc;
    });
    setFilteredJobs(results);
  };

  const resetFilters = () => {
    setSearch("");
    setLocation("");
    setFilteredJobs(jobs);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] pb-20 font-[Segoe_UI,sans-serif]">
      
      {/* ── HEADER ── */}
      <div className="bg-white border-b border-[#eff1f6] pt-16 pb-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#2f55e4]/5 rounded-full blur-3xl -mr-40 -mt-40"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-500/5 rounded-full blur-3xl -ml-20 -mb-20"></div>
        
        <div className="max-w-7xl mx-auto px-4 md:px-10 relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-[40px] md:text-[56px] font-black text-[#111827] tracking-tight mb-4 leading-tight">
              Recommended Jobs <span className="text-[#2f55e4]">for You</span>
            </h1>
            <p className="text-[18px] font-bold text-[#7c829c] max-w-2xl mx-auto">
              We've curated these opportunities based on your skills and career preferences.
            </p>
          </div>

          <div className="bg-white rounded-[32px] border border-[#eff1f6] shadow-2xl shadow-[#2f55e4]/10 p-3 flex flex-col sm:flex-row items-center gap-3 max-w-4xl mx-auto transition-all hover:shadow-[#2f55e4]/20">
            <div className="flex items-center gap-4 flex-1 px-5 py-2 w-full group">
              <span className="text-[20px]">🔍</span>
              <input
                className="border-none outline-none text-[16px] font-black text-[#111827] bg-transparent w-full placeholder:text-[#a0a5ba]"
                placeholder="Job title or company"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <div className="hidden sm:block w-px h-10 bg-[#eff1f6]" />
            <div className="flex items-center gap-4 flex-1 sm:max-w-[280px] px-5 py-2 w-full">
              <span className="text-[20px]">📍</span>
              <input
                className="border-none outline-none text-[16px] font-black text-[#111827] bg-transparent w-full placeholder:text-[#a0a5ba]"
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <button
              className="bg-[#2f55e4] hover:bg-[#2242c2] text-white rounded-2xl px-10 py-4 text-[16px] font-black cursor-pointer w-full sm:w-auto transition-all shadow-lg active:scale-95"
              onClick={handleSearch}
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* ── JOB LIST ── */}
      <div className="max-w-5xl mx-auto px-4 md:px-10 -mt-10 relative z-20">
        <div className="flex flex-col gap-6">
          {filteredJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[450px] p-10 bg-white rounded-[40px] border border-[#eff1f6] shadow-2xl shadow-blue-900/5 text-center">
              <div className="w-24 h-24 rounded-3xl bg-slate-50 flex items-center justify-center mb-8 border border-slate-100 shadow-sm">
                <SearchX className="w-12 h-12 text-slate-300" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">
                No matching jobs found
              </h3>
              <p className="text-slate-500 font-bold max-w-sm mb-10 leading-relaxed">
                We couldn't find any positions matching your current filters. Try adjusting your keywords or location.
              </p>
              <button 
                onClick={resetFilters}
                className="flex items-center gap-3 px-10 py-4 bg-[#2f55e4] text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-900/20 hover:bg-[#2242c2] transition-all active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Search Filters
              </button>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <div
                key={job.id}
                className="group bg-white rounded-[40px] p-6 md:p-10 transition-all duration-300 border border-[#eff1f6] hover:border-[#2f55e4] hover:shadow-2xl hover:shadow-[#2f55e4]/10 cursor-pointer flex flex-col md:flex-row gap-8"
                onClick={() => router.push(`/placements/job/${job.id}`)}
              >
                <div className="w-24 h-24 rounded-[32px] bg-[#f6f7fb] flex items-center justify-center text-[32px] font-black text-[#2f55e4] border border-[#eff1f6] group-hover:bg-[#2f55e4] group-hover:text-white transition-all duration-500 shadow-sm shrink-0">
                  {job.company[0]}
                </div>
                
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                      <h3 className="text-[26px] font-black text-[#111827] group-hover:text-[#2f55e4] transition-colors leading-tight">
                        {job.title}
                      </h3>
                      <div className="flex items-center gap-3">
                        <span className="bg-[#f0fdf4] text-green-600 px-4 py-1.5 rounded-xl text-[12px] font-black border border-[#dcfce7] uppercase tracking-wider">
                          {job.salary}
                        </span>
                        <span className="bg-[#f6f7fb] text-[#4b5563] px-4 py-1.5 rounded-xl text-[12px] font-bold uppercase border border-[#eff1f6]">
                          {job.type || "Full Time"}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-6 mb-6">
                      <span className="text-[15px] font-bold text-[#4b5563] flex items-center gap-2">
                        🏢 {job.company}
                      </span>
                      <span className="text-[15px] font-bold text-[#7c829c] flex items-center gap-2">
                        📍 {job.location}
                      </span>
                    </div>
                    
                    <p className="text-[16px] font-medium text-[#4b5563] line-clamp-2 leading-relaxed mb-6">
                      {job.description}
                    </p>

                    <div>
                      <p className="text-[11px] font-black text-[#7c829c] uppercase tracking-wider mb-3">Key Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {(job.skills ? job.skills.split(/[,|/]+/) : (job.description.split(/[,.]/)[0].split(' ').filter(w => w.length > 3))).slice(0, 6).map((skill, idx) => (
                          <span key={idx} className="bg-[#e8f0fb] text-[#2f55e4] px-4 py-1.5 rounded-xl text-[12px] font-black border border-[#d9e2f8] transition-colors group-hover:bg-white group-hover:shadow-sm">
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-[#f6f7fb]">
                    <div className="flex items-center gap-2 text-[13px] font-bold text-[#7c829c]">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                      Actively Hiring
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); router.push(`/placements/apply/${job.id}`); }}
                      className="bg-[#2f55e4] text-white px-8 py-3 rounded-2xl text-[14px] font-black shadow-lg shadow-[#2f55e4]/20 hover:shadow-[#2f55e4]/40 hover:-translate-y-0.5 transition-all"
                    >
                      Apply Now
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── PROFILE PROMPT FLOATING CARD (BESIDE) ── */}
      {showPopup && (
        <div className="fixed bottom-10 right-10 z-[100] w-[calc(100%-40px)] sm:w-[400px] animate-slideIn">
          <div className="bg-white rounded-[32px] p-8 shadow-[0_20px_70px_rgba(47,85,228,0.15)] relative overflow-hidden border border-[#eff1f6] group">
            {/* Close Icon */}
            <button 
              onClick={() => setShowPopup(false)}
              className="absolute top-6 right-6 w-8 h-8 rounded-full bg-[#f6f7fb] flex items-center justify-center text-[#7c829c] hover:bg-[#eff1f6] hover:text-[#111827] transition-all z-20 group-hover:rotate-90 duration-300"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>

            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#2f55e4]/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-[#f6f7fb] flex items-center justify-center text-2xl shadow-sm border border-[#eff1f6]">
                  🚀
                </div>
                <div>
                  <h2 className="text-[20px] font-black text-[#111827] leading-tight">
                    Nille Profile Create
                  </h2>
                </div>
              </div>
              
              <p className="text-[14px] font-medium text-[#7c829c] mb-6 leading-relaxed">
                Create your profile to apply and get personalized job recommendations.
              </p>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => router.push("/placements/register")}
                  className="flex-1 py-3.5 bg-[#2f55e4] text-white rounded-xl font-black text-[14px] shadow-lg shadow-[#2f55e4]/20 hover:bg-[#2242c2] transition-all active:scale-95"
                >
                  Yes
                </button>
                <button 
                  onClick={() => setShowPopup(false)}
                  className="px-6 py-3.5 bg-[#f6f7fb] text-[#4b5563] rounded-xl font-bold text-[14px] hover:bg-[#eff1f6] transition-all"
                >
                  No
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Enquiry Modal ── */}

      <style jsx global>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(50px) translateY(20px); }
          to { opacity: 1; transform: translateX(0) translateY(0); }
        }
        .animate-slideIn { animation: slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
}
