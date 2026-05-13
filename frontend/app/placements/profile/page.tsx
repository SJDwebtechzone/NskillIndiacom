"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SearchX, RotateCcw } from "lucide-react";

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
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const router = useRouter();
  const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
  const [user, setUser] = useState<{ full_name?: string; email_id?: string; course_name?: string; photo_url?: string; college_name?: string; preferred_job_type?: string; availability?: string; preferred_location?: string } | null>(null);

  useEffect(() => {
    fetch(`${API}/api/jobs/jobs`)
      .then((res) => res.json())
      .then((data: Job[]) => {
        setJobs(data || []);
        setFilteredJobs(data || []);
      })
      .catch((err) => console.error("Error fetching jobs:", err));

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Error parsing stored user:", e);
      }
    }

    const token = localStorage.getItem("token");
    if (token) {
      fetch(`${API}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => {
          if (data && data.user) {
            setUser(data.user);
            localStorage.setItem("user", JSON.stringify(data.user));
          }
        })
        .catch(err => console.error(err));
    }
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

  const getPhotoUrl = (url: string | undefined) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return `${API}${cleanUrl}`;
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/placements/login");
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] pb-20 font-[Segoe_UI,sans-serif]">
      
      {/* ── SEARCH HEADER ── */}
      <div className="bg-white border-b border-[#eff1f6] pt-12 pb-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#2f55e4]/5 rounded-full blur-3xl -mr-40 -mt-40"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-orange-500/5 rounded-full blur-3xl -ml-20 -mb-20"></div>
        
        <div className="max-w-7xl mx-auto px-4 md:px-10 relative z-10">
          <div className="mb-10 text-center sm:text-left">
            <h1 className="text-[32px] md:text-[48px] font-black text-[#111827] tracking-tight mb-4">Find your dream career</h1>
            <p className="text-[16px] md:text-[18px] font-bold text-[#7c829c] max-w-2xl">Connect with top employers and explore opportunities tailored to your skills and preferences.</p>
          </div>

          <div className="bg-white rounded-[32px] border border-[#eff1f6] shadow-2xl shadow-[#2f55e4]/10 p-3 flex flex-col sm:flex-row items-center gap-3 max-w-4xl transition-all hover:shadow-[#2f55e4]/20">
            <div className="flex items-center gap-4 flex-1 px-5 py-2 w-full group">
              <span className="text-[20px] transition-transform group-focus-within:scale-110">🔍</span>
              <input
                className="border-none outline-none text-[16px] font-black text-[#111827] bg-transparent w-full placeholder:text-[#a0a5ba] placeholder:font-bold"
                placeholder="Job title, keywords, or company"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <div className="hidden sm:block w-px h-10 bg-[#eff1f6]" />
            <div className="flex items-center gap-4 flex-1 sm:max-w-[280px] px-5 py-2 w-full group">
              <span className="text-[20px] transition-transform group-focus-within:scale-110">📍</span>
              <input
                className="border-none outline-none text-[16px] font-black text-[#111827] bg-transparent w-full placeholder:text-[#a0a5ba] placeholder:font-bold"
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <button
              className="bg-[#2f55e4] hover:bg-[#2242c2] text-white rounded-2xl px-10 py-4 text-[16px] font-black cursor-pointer w-full sm:w-auto transition-all shadow-lg hover:shadow-[#2f55e4]/30 active:scale-95"
              onClick={handleSearch}
            >
              Find jobs
            </button>
          </div>
        </div>
      </div>

      {/* ── CONTENT ROW ── */}
      <div className="max-w-7xl mx-auto px-4 md:px-10 mt-[-40px] relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-10">

          {/* ── STUDENT PROFILE (LEFT) ── */}
          <div className="hidden lg:flex flex-col gap-6">
            <div className="bg-white border border-[#eff1f6] rounded-[40px] overflow-hidden flex flex-col sticky top-24 shadow-2xl shadow-[#eff1f6]">
              <div className="h-28 bg-gradient-to-br from-[#2f55e4] to-[#7c9bff] relative">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              </div>
              <div className="px-8 pb-8 relative flex flex-col items-center text-center">
                <div className="w-32 h-32 rounded-[40px] bg-white p-2 -mt-16 mb-6 shadow-2xl relative border border-[#eff1f6]">
                  {user?.photo_url ? (
                    <img src={getPhotoUrl(user.photo_url) || ""} alt="Profile" className="w-full h-full rounded-[32px] object-cover" />
                  ) : (
                    <div className="w-full h-full rounded-[32px] bg-[#e8f0fb] flex items-center justify-center text-3xl font-black text-[#2f55e4]">
                      {user?.full_name ? getInitials(user.full_name) : "RS"}
                    </div>
                  )}
                  <div className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-green-500 border-4 border-white flex items-center justify-center text-white text-[12px] shadow-sm">✔</div>
                </div>
                
                <h2 
                  className="text-[22px] font-black text-[#111827] leading-tight hover:text-[#2f55e4] transition-colors cursor-pointer"
                  onClick={() => router.push('/placements/profile/edit')}
                >
                  {user?.full_name || "Guest Student"}
                </h2>
                
                <div className="mt-4 space-y-2 w-full text-left">
                  <div className="bg-[#f6f7fb] p-4 rounded-2xl border border-[#eff1f6]">
                    <p className="text-[11px] font-black text-[#7c829c] uppercase tracking-wider mb-1">Current Course</p>
                    <p className="text-[14px] font-bold text-[#111827] leading-snug">{user?.course_name || "Update your degree"}</p>
                  </div>
                  <div className="bg-[#f6f7fb] p-4 rounded-2xl border border-[#eff1f6]">
                    <p className="text-[11px] font-black text-[#7c829c] uppercase tracking-wider mb-1">University / College</p>
                    <p className="text-[14px] font-bold text-[#111827] leading-snug">{user?.college_name || "Update college name"}</p>
                  </div>
                </div>

                {/* ── CAREER PREFERENCES ── */}
                <div className="mt-8 pt-6 border-t border-[#eff1f6] w-full text-left">
                  <div className="flex items-center justify-between mb-4 px-1">
                    <p className="text-[11px] font-black text-[#7c829c] uppercase tracking-wider">Career Preferences</p>
                    <button 
                      onClick={() => router.push('/placements/profile/edit')}
                      className="text-[#2f55e4] hover:bg-[#f0f4ff] p-2 rounded-xl transition-all"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                  </div>
                  
                  <div className="bg-[#f6f7fb] p-5 rounded-[28px] border border-[#eff1f6] flex flex-col gap-5 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-white border border-[#eff1f6] flex items-center justify-center text-lg shadow-sm">💼</div>
                      <div>
                        <p className="text-[10px] font-black text-[#7c829c] uppercase tracking-widest mb-0.5">Job Type</p>
                        <p className="text-[14px] font-black text-[#111827]">{user?.preferred_job_type || "Full Time"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-white border border-[#eff1f6] flex items-center justify-center text-lg shadow-sm">📅</div>
                      <div>
                        <p className="text-[10px] font-black text-[#7c829c] uppercase tracking-widest mb-0.5">Availability</p>
                        <p className="text-[14px] font-black text-[#111827]">{user?.availability || "Immediately"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-white border border-[#eff1f6] flex items-center justify-center text-lg shadow-sm">📍</div>
                      <div>
                        <p className="text-[10px] font-black text-[#7c829c] uppercase tracking-widest mb-0.5">Location</p>
                        <p className="text-[14px] font-black text-[#111827]">{user?.preferred_location || "Chennai"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => router.push('/placements/profile/edit')}
                  className="mt-6 w-full py-4 rounded-2xl bg-[#2f55e4] text-white font-black text-[14px] shadow-lg shadow-[#2f55e4]/20 hover:bg-[#2242c2] transition-all group flex items-center justify-center gap-2"
                >
                  Complete profile
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>

                <button 
                  onClick={handleLogout}
                  className="mt-3 w-full py-3 rounded-2xl bg-white text-red-600 font-black text-[13px] border-2 border-red-50 hover:bg-red-50 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm"
                >
                  Logout
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                </button>
              </div>
            </div>
          </div>

          {/* ── JOB LIST (RIGHT) ── */}
          <div className="flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 px-2">
              <div>
                <h2 className="text-[32px] font-black text-[#111827] tracking-tight">Recommended Jobs</h2>
                <p className="text-[14px] font-bold text-[#7c829c] mt-1 uppercase tracking-[2px]">
                  {filteredJobs.length === 0 ? "No results found" : `Showing ${filteredJobs.length} active opportunities`}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
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
                    className="group bg-white rounded-[40px] p-6 md:p-10 transition-all duration-300 border border-[#eff1f6] hover:border-[#2f55e4] hover:shadow-2xl hover:shadow-[#2f55e4]/10 cursor-pointer relative flex flex-col gap-6"
                    onClick={() => router.push(`/placements/job/${job.id}`)}
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                      <div className="flex gap-6">
                        <div className="w-20 h-20 rounded-[28px] bg-[#f6f7fb] flex items-center justify-center text-[28px] font-black text-[#2f55e4] border border-[#eff1f6] group-hover:bg-[#2f55e4] group-hover:text-white transition-all duration-500 shadow-sm">
                          {job.company[0]}
                        </div>
                        <div>
                          <h3 className="text-[24px] font-black text-[#111827] group-hover:text-[#2f55e4] transition-colors leading-tight mb-2">{job.title}</h3>
                          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                            <span className="text-[16px] font-bold text-[#4b5563] flex items-center gap-2">🏢 {job.company}</span>
                            <span className="text-[16px] font-bold text-[#7c829c] flex items-center gap-2">📍 {job.location}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-3 shrink-0">
                         <div className="bg-orange-50 text-orange-600 px-5 py-2.5 rounded-2xl text-[15px] font-black border border-orange-100 uppercase tracking-wider">
                           {job.salary}
                         </div>
                         <span className="bg-[#f6f7fb] text-[#4b5563] px-4 py-1.5 rounded-xl text-[13px] font-bold uppercase border border-[#eff1f6]">{job.type || "Full Time"}</span>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <p className="text-[16px] font-medium text-[#4b5563] line-clamp-3 leading-relaxed border-l-4 border-[#eff1f6] pl-6 group-hover:border-[#2f55e4] transition-all">
                        {job.description}
                      </p>
                      
                      <div>
                        <p className="text-[12px] font-black text-[#7c829c] uppercase tracking-wider mb-3">Key Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {(job.skills ? job.skills.split(/[,|/]+/) : (job.description.split(/[,.]/)[0].split(' ').filter(w => w.length > 3))).slice(0, 6).map((skill, idx) => (
                            <span key={idx} className="bg-[#e8f0fb] text-[#2f55e4] px-4 py-2 rounded-xl text-[13px] font-black border border-[#d9e2f8] transition-colors group-hover:bg-white group-hover:shadow-md">
                              {skill.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-[#f6f7fb] gap-4">
                      <div className="flex items-center gap-3 text-[14px] font-bold text-[#7c829c]">
                         <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                         Actively hiring
                      </div>
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <button className="flex-1 sm:flex-none px-8 py-4 rounded-2xl text-[15px] font-black text-[#4b5563] hover:bg-[#f6f7fb] transition-all">View details</button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); router.push(`/placements/apply/${job.id}`); }}
                          className="flex-1 sm:flex-none bg-[#2f55e4] text-white px-10 py-4 rounded-2xl text-[15px] font-black shadow-xl shadow-[#2f55e4]/20 hover:shadow-[#2f55e4]/40 hover:-translate-y-1 transition-all active:translate-y-0"
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
        </div>
      </div>
    </div>
  );
}
