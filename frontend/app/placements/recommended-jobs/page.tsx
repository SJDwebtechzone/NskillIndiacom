"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SearchX, RotateCcw, Search, MapPin, Building2, Briefcase, Sparkles, X } from "lucide-react";

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
  const [partners, setPartners] = useState<any[]>([]);
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

    fetch(`${API}/api/partners`)
      .then((res) => res.json())
      .then((data) => setPartners(data || []))
      .catch((err) => console.error("Error fetching partners:", err));

    // Show popup after 1.5 seconds initially
    const timer = setTimeout(() => {
      setShowPopup(true);
    }, 1500);

    // Recurring check every 15 seconds
    const interval = setInterval(() => {
      setShowPopup(true);
    }, 15000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [API]);

  const handleSearch = () => {
    const q = search.toLowerCase();
    const loc = location.toLowerCase();
    const results = jobs.filter((job) => {
      const matchSearch = q
        ? (job.title && job.title.toLowerCase().includes(q)) ||
          (job.company && job.company.toLowerCase().includes(q)) ||
          (job.description && job.description.toLowerCase().includes(q)) ||
          (job.skills && job.skills.toLowerCase().includes(q))
        : true;
      const matchLoc = loc ? job.location && job.location.toLowerCase().includes(loc) : true;
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
    <div className="flex flex-col min-h-screen bg-[#f3f5f9] pb-20 font-[Segoe_UI,sans-serif]">
      
      {/* ── HEADER HERO BANNER ── */}
      <div className="relative min-h-[380px] pb-12 pt-12 flex items-center overflow-hidden bg-[#061f4d]">
        <img
          src="/images/rec/recommended.png"
          alt="Find Jobs"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-30 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#061f4d] via-[#0a2d5c]/95 to-[#0a2d5c]/70" />
        <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#ff8c2a] via-[#0a2d5c] to-[#ff8c2a]" />
        
        <div className="max-w-7xl mx-auto px-4 md:px-10 relative z-10 w-full flex flex-col items-start justify-center">
          <div className="max-w-2xl text-left mb-8">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-[#ff8c2a] animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
                N-Skill Career Opportunities
              </span>
            </div>
            <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-black mb-3 uppercase tracking-tight leading-tight">
              Find Your <span className="text-[#ff8c2a]">Dream Career</span>
            </h1>
            <p className="text-[15px] md:text-[17px] font-medium text-blue-100/90 leading-relaxed max-w-xl">
              Connect with top employers and explore verified job opportunities tailored to your technical skills.
            </p>
          </div>

          {/* Search Box */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-2.5 sm:p-3 flex flex-col sm:flex-row items-center gap-2.5 w-full max-w-4xl transition-all">
            <div className="flex items-center gap-3 flex-1 px-4 py-2 w-full">
              <Search className="w-5 h-5 text-[#0a2d5c] shrink-0" />
              <input
                className="border-none outline-none text-[15px] font-bold text-[#0a2d5c] bg-transparent w-full placeholder:text-slate-400"
                placeholder="Job title, keywords, or company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <div className="hidden sm:block w-px h-8 bg-slate-200" />
            <div className="flex items-center gap-3 flex-1 sm:max-w-[260px] px-4 py-2 w-full">
              <MapPin className="w-5 h-5 text-[#ff8c2a] shrink-0" />
              <input
                className="border-none outline-none text-[15px] font-bold text-[#0a2d5c] bg-transparent w-full placeholder:text-slate-400"
                placeholder="Location (e.g. Chennai)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <button
              className="bg-[#ff8c2a] hover:bg-[#ef7f15] text-white rounded-xl px-8 py-3.5 text-[15px] font-black uppercase tracking-wide cursor-pointer w-full sm:w-auto transition-all shadow-lg shadow-orange-900/20 active:scale-95 whitespace-nowrap"
              onClick={handleSearch}
            >
              Find Jobs
            </button>
          </div>
        </div>
      </div>

      {/* ── JOB LIST ── */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 mt-10 relative z-20 w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-black text-[#0a2d5c] tracking-tight">
            Available Positions ({filteredJobs.length})
          </h2>
          {(search || location) && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#ff8c2a] hover:text-[#ef7f15]"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Clear Filters
            </button>
          )}
        </div>

        <div className="flex flex-col gap-5">
          {filteredJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[380px] p-8 bg-white rounded-2xl border border-slate-200 shadow-sm text-center">
              <div className="w-20 h-20 rounded-2xl bg-orange-50 flex items-center justify-center mb-6 border border-orange-100">
                <SearchX className="w-10 h-10 text-[#ff8c2a]" />
              </div>
              <h3 className="text-xl font-black text-[#0a2d5c] mb-2 tracking-tight">
                No matching jobs found
              </h3>
              <p className="text-slate-500 font-medium max-w-sm mb-8 text-sm leading-relaxed">
                We couldn&apos;t find any positions matching your current search. Try adjusting your keywords or location.
              </p>
              <button 
                onClick={resetFilters}
                className="flex items-center gap-2 px-8 py-3 bg-[#0a2d5c] text-white rounded-xl font-black text-xs uppercase tracking-wide shadow-md hover:bg-[#0d3b72] transition-all active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Search Filters
              </button>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <div
                key={job.id}
                className="group bg-white rounded-2xl p-6 md:p-8 transition-all duration-300 border border-slate-200 hover:border-[#ff8c2a]/80 hover:shadow-xl cursor-pointer flex flex-col md:flex-row gap-6 shadow-sm"
                onClick={() => router.push(`/placements/job/${job.id}`)}
              >
                {/* Company Initial Badge */}
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-[#0a2d5c] text-white flex items-center justify-center text-2xl md:text-3xl font-black border border-[#082d57] group-hover:bg-[#ff8c2a] transition-all duration-300 shadow-sm shrink-0">
                  {job.company ? job.company.charAt(0).toUpperCase() : "N"}
                </div>
                
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div>
                        <h3 className="text-[20px] md:text-[22px] font-black text-[#0a2d5c] group-hover:text-[#ff8c2a] transition-colors leading-tight">
                          {job.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-4 mt-1.5 text-sm text-slate-600 font-medium">
                          <span className="flex items-center gap-1.5 font-bold text-slate-700">
                            <Building2 className="w-4 h-4 text-[#0a2d5c]" />
                            {job.company}
                          </span>
                          <span className="flex items-center gap-1.5 text-slate-500">
                            <MapPin className="w-4 h-4 text-[#ff8c2a]" />
                            {job.location}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {job.salary && (
                          <span className="bg-orange-50 text-[#e67a18] px-3.5 py-1 rounded-lg text-[12px] font-black border border-orange-200 uppercase tracking-wide">
                            {job.salary}
                          </span>
                        )}
                        <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg text-[11px] font-bold uppercase border border-slate-200">
                          {job.type || "Full Time"}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-[14px] font-normal text-slate-600 line-clamp-2 leading-relaxed mb-4">
                      {job.description}
                    </p>

                    <div>
                      <p className="text-[10px] font-black text-[#0a2d5c] uppercase tracking-wider mb-2">Key Skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {(job.skills ? job.skills.split(/[,|/]+/) : (job.description ? job.description.split(/[,.]/)[0].split(' ').filter(w => w.length > 3) : [])).slice(0, 5).map((skill, idx) => (
                          <span key={idx} className="bg-[#f0f4fa] text-[#0a2d5c] px-3 py-1 rounded-md text-[11px] font-bold border border-[#dfe8f4] group-hover:bg-white transition-colors">
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-5 mt-5 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-[12px] font-bold text-emerald-600">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Actively Hiring
                    </div>
                    <div className="flex items-center gap-2.5">
                      <button 
                        onClick={(e) => { e.stopPropagation(); router.push(`/placements/job/${job.id}`); }}
                        className="px-4 py-2 border border-[#0a2d5c] text-[#0a2d5c] rounded-xl text-xs font-black uppercase tracking-wide hover:bg-[#0a2d5c] hover:text-white transition-all"
                      >
                        Details
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); router.push(`/placements/apply/${job.id}`); }}
                        className="bg-[#ff8c2a] hover:bg-[#ef7f15] text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wide shadow-md shadow-orange-900/10 hover:shadow-orange-900/20 active:scale-95 transition-all"
                      >
                        Apply Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── PARTNERS SECTION ── */}
      {partners.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 md:px-10 mt-16 relative z-20 w-full">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-black text-[#0a2d5c] uppercase tracking-tight">
              Our Corporate Hiring Partners
            </h2>
            <div className="mx-auto mt-2 h-1 w-10 bg-[#ff8c2a]" />
            <p className="mt-2 text-sm text-slate-500 font-medium">Top companies actively recruiting N-Skill certified candidates.</p>
          </div>
          <div className="relative overflow-hidden w-full py-2 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="flex animate-scroll-left pause-on-hover w-max">
              <div className="flex gap-4 pr-4">
                {[...partners, ...partners, ...partners].map((partner, i) => {
                  const inner = (
                    <div className="bg-white p-3 rounded-xl border border-slate-200 hover:border-[#ff8c2a] transition-all flex items-center justify-center w-36 h-20 shadow-xs">
                      <img src={partner.company_logo} alt={partner.company_name} className="max-h-full max-w-full object-contain" title={partner.company_name} />
                    </div>
                  );
                  return partner.website_url ? (
                    <a key={`r1a-${partner.id}-${i}`} href={partner.website_url} target="_blank" rel="noreferrer" className="block shrink-0">
                      {inner}
                    </a>
                  ) : (
                    <div key={`r1a-${partner.id}-${i}`} className="shrink-0">{inner}</div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── PROFILE PROMPT FLOATING MODAL ── */}
      {showPopup && (
        <div className="fixed bottom-6 right-6 z-[100] w-[calc(100%-32px)] sm:w-[380px] animate-slideIn">
          <div className="bg-white rounded-2xl p-6 shadow-[0_15px_50px_rgba(10,45,92,0.18)] relative overflow-hidden border border-[#dfe8f4]">
            {/* Close Icon */}
            <button 
              onClick={() => setShowPopup(false)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-all z-20"
              aria-label="Close popup"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Accent Corner */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-full -mr-10 -mt-10 pointer-events-none" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3.5 mb-3">
                <div className="w-11 h-11 rounded-xl bg-[#0a2d5c] text-[#ff8c2a] flex items-center justify-center text-xl shadow-sm">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-[17px] font-black text-[#0a2d5c] leading-tight">
                    Create Career Profile
                  </h3>
                  <p className="text-[11px] font-bold text-[#ff8c2a] uppercase tracking-wide">
                    100% Free Placement Support
                  </p>
                </div>
              </div>
              
              <p className="text-[13px] font-normal text-slate-600 mb-5 leading-relaxed">
                Register your profile to get personalized job recommendations and apply directly with one click.
              </p>
              
              <div className="flex items-center gap-2.5">
                <button 
                  onClick={() => router.push("/placements/register")}
                  className="flex-1 py-2.5 bg-[#ff8c2a] hover:bg-[#ef7f15] text-white rounded-xl font-black text-xs uppercase tracking-wide shadow-md shadow-orange-900/15 transition-all active:scale-95"
                >
                  Create Profile
                </button>
                <button 
                  onClick={() => setShowPopup(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs transition-all"
                >
                  Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-slideIn { animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
}
