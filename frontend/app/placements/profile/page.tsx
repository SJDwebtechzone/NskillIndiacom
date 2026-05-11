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
  const [location, setLocation] = useState("");
  const [showDetail, setShowDetail] = useState(false);
  const router = useRouter();
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
  const [user, setUser] = useState<{ full_name?: string; email_id?: string; course_name?: string; photo_url?: string; college_name?: string } | null>(null);

  useEffect(() => {
    fetch(`${API}/api/jobs/jobs`)
      .then((res) => res.json())
      .then((data: Job[]) => {
        setJobs(data || []);
        setFilteredJobs(data || []);
        if (data && data.length > 0) setSelectedJob(data[0]);
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
        .then(res => {
          if (res.status === 404) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            return null;
          }
          return res.json();
        })
        .then(data => {
          if (data && data.user) {
            setUser(data.user);
            // Sync back to localStorage for consistency
            localStorage.setItem("user", JSON.stringify(data.user));
          }
        })
        .catch(err => console.error(err));
    } else if (!storedUser) {
      // Mock user if not logged in and no stored user
      setUser({ full_name: "Student Profile", email_id: "student@example.com", course_name: "HVAC Training" });
    }
  }, []);

  const handleSearch = () => {
    const q = search.toLowerCase();
    const loc = location.toLowerCase();
    
    const results = jobs.filter((job) => {
      const matchSearch = q ? (job.title.toLowerCase().includes(q) || job.company.toLowerCase().includes(q) || job.description.toLowerCase().includes(q)) : true;
      const matchLoc = loc ? job.location.toLowerCase().includes(loc) : true;
      return matchSearch && matchLoc;
    });
    
    setFilteredJobs(results);
    setSelectedJob(results.length > 0 ? results[0] : null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fc] p-4 md:p-6 gap-6 font-[Segoe_UI,sans-serif]">

      {/* ── SEARCH BAR ── */}
      <div className="bg-white rounded-[24px] md:rounded-[32px] border border-[#eff1f6] shadow-[0_8px_30px_rgba(47,85,228,0.06)] px-3 py-3 flex flex-col sm:flex-row items-center gap-4 sm:gap-0 z-20 sticky top-6 max-w-7xl mx-auto w-full mt-2">
        {/* Keyword input */}
        <div className="flex items-center gap-3 flex-1 px-4 py-1 w-full">
          <span className="text-xl text-[#7c829c]">🔍</span>
          <input
            className="border-none outline-none text-[16px] font-semibold text-[#111827] bg-transparent w-full font-[inherit] placeholder:text-[#a0a5ba] placeholder:font-medium"
            placeholder="Job title, keywords, or company"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-10 bg-[#eff1f6] mx-2" />

        {/* Location input */}
        <div className="flex items-center gap-3 flex-1 sm:max-w-[280px] px-4 py-1 w-full">
          <span className="text-xl text-[#7c829c]">📍</span>
          <input
            className="border-none outline-none text-[16px] font-semibold text-[#111827] bg-transparent w-full font-[inherit] placeholder:text-[#a0a5ba] placeholder:font-medium"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>

        {/* Button */}
        <button
          className="bg-[#2f55e4] hover:bg-[#2242c2] text-white border-none rounded-full px-8 py-3.5 text-[16px] font-bold cursor-pointer whitespace-nowrap font-[inherit] ml-0 sm:ml-4 w-full sm:w-auto transition-colors shadow-sm"
          onClick={handleSearch}
        >
          Find jobs
        </button>
      </div>

      {/* ── CONTENT ROW ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] xl:grid-cols-[320px_1fr] gap-6 min-h-[480px] mt-2 max-w-7xl mx-auto w-full">

        {/* ── STUDENT PROFILE (LEFT) ── */}
        <div className="hidden lg:flex flex-col gap-3">
          <div className="bg-white border border-[#d4d2cc] rounded-lg overflow-hidden flex flex-col sticky top-24 shadow-sm">
            <div className="h-20 bg-gradient-to-r from-[#a0b4b7] to-[#809ba0]" />
            <div className="px-5 pb-5 relative flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-white p-1 -mt-10 mb-3 border border-[#ebebeb] shadow-sm">
                {user?.photo_url ? (
                  <img src={`${API}/${user.photo_url}`} alt="Profile" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <div className="w-full h-full rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-[#2557a7]">
                    {user?.full_name ? getInitials(user.full_name) : "RS"}
                  </div>
                )}
              </div>
              <h2 
                className="text-[19px] font-bold text-[#1a1a1a] leading-tight hover:text-[#2f55e4] hover:underline cursor-pointer transition-colors"
                onClick={() => router.push('/placements/profile/edit')}
              >
                {user?.full_name || "Guest Student"}
              </h2>
              <p className="text-[14px] font-semibold text-[#333] mt-2 leading-snug px-1">
                {user?.course_name || "Update your degree/course"}
              </p>
              <p className="text-[13px] text-[#555] mt-1.5 leading-snug">
                {user?.college_name ? `@ ${user.college_name}` : "Update your college name"}
              </p>
            </div>
            <div 
              className="border-t border-[#ebebeb] px-5 py-4 cursor-pointer hover:bg-[#f6f7fb] transition-colors flex items-center justify-between group"
              onClick={() => router.push('/placements/profile/edit')}
            >
              <span className="text-[14px] font-bold text-[#2f55e4] group-hover:underline">Complete profile</span>
              <span className="text-[#555] text-[18px] leading-none transition-transform group-hover:translate-x-1">→</span>
            </div>
          </div>
        </div>

        {/* ── JOB LIST (CENTER/RIGHT) ── */}
        <div className="flex flex-col">
          <div className="px-1 py-2.5">
            <p className="text-[22px] font-bold text-[#1a1a1a]">Recommended Jobs</p>
            <p className="text-[13px] font-medium text-[#767676] mt-1">
              {filteredJobs.length === 0
                ? "No results"
                : `Showing ${filteredJobs.length} result${filteredJobs.length > 1 ? "s" : ""}`}
            </p>
          </div>

          <div className="flex flex-col pr-1" style={{ scrollbarWidth: 'thin' }}>
            {filteredJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[300px] gap-2 bg-white rounded-lg border border-[#d4d2cc]">
                <div className="text-[32px] opacity-20">🔍</div>
                <p className="text-[14px] font-semibold text-[#767676]">No jobs found</p>
                <p className="text-[13px] text-[#aaa]">Try adjusting your search criteria</p>
              </div>
            ) : (
              filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className={`bg-white rounded-3xl p-5 md:p-6 lg:p-7 cursor-pointer mb-5 relative transition-all duration-200 border border-[#eff1f6] hover:border-[#dce0ec] hover:shadow-xl hover:shadow-[#eff1f6]`}
                  onClick={() => router.push(`/placements/job/${job.id}`)}
                >
                  <h3 className="text-[22px] font-bold text-[#111827] leading-tight mb-1.5 tracking-tight">{job.title}</h3>
                  <p className="text-[15px] font-medium text-[#7c829c] mb-6">{job.type || 'Full Time'} / {job.location}</p>

                  <div className="mb-5">
                    <p className="text-[14px] font-medium text-[#7c829c] mb-1">Avg. Salary</p>
                    <p className="text-[17px] font-medium text-[#111827]">{job.salary || "Not disclosed"}</p>
                  </div>

                  <div className="mb-6">
                    <p className="text-[14px] font-medium text-[#7c829c] mb-1">Key Skills</p>
                    <p className="text-[16px] font-medium text-[#111827] leading-relaxed line-clamp-2 pr-4">
                      {job.description && job.description.length > 10 ? job.description.replace(/\n/g, ', ').substring(0, 150) + "..." : "User Empathy, Research, Market Research, Communication, Collaboration, Analytical Skills"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-2 border-t border-transparent">
                    <button 
                      onClick={(e) => { e.stopPropagation(); router.push(`/placements/apply/${job.id}`); }}
                      className="bg-[#2f55e4] hover:bg-[#2242c2] transition-colors text-white font-bold text-[15px] px-8 py-3 rounded-full inline-flex items-center justify-center shadow-sm"
                    >
                      Apply Now
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); router.push(`/placements/job/${job.id}`); }}
                      className="text-[#7c829c] hover:text-[#2f55e4] font-bold text-[14px] flex items-center gap-1.5 transition-colors group"
                    >
                      View details <span className="text-[16px] transition-transform group-hover:translate-x-1">→</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

