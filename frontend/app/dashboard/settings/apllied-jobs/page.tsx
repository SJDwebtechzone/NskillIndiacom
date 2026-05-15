"use client";

import { useEffect, useState } from "react";
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCcw, 
  Users, 
  Briefcase, 
  MapPin, 
  GraduationCap, 
  Calendar,
  FileText,
  Clock,
  MoreHorizontal,
  Mail,
  User,
  Trash2,
  Phone
} from "lucide-react";

interface Applicant {
  id: number;
  job_id: number;
  name: string;
  email: string;
  mobile_number: string;
  location: string;
  qualification: string;
  skills: string;
  experience: string;
  resume_filename: string;
  resume_mimetype: string;
  applied_at: string;
  job_title?: string;
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

export default function AdminApplicationsPage() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterJob, setFilterJob] = useState("all");
  const [downloading, setDownloading] = useState<number | null>(null);
  
  const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

  const fetchApplicants = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/jobs/applications`);
      const data = await res.json();
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
      const res = await fetch(`${API}/api/jobs/resume/${applicant.id}`);
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

  const handleDeleteApplication = async (id: number) => {
    if (!confirm("Are you sure you want to permanently delete this application?")) return;
    try {
      const res = await fetch(`${API}/api/jobs/application/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      fetchApplicants();
    } catch (err) {
      console.error("Delete application error:", err);
      alert("Failed to delete application. Please try again.");
    }
  };

  const jobIds = Array.from(new Set((applicants || []).map((a) => a.job_id))).sort();

  const filtered = applicants.filter((a) => {
    const matchSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()) ||
      (a.mobile_number || "").toLowerCase().includes(search.toLowerCase()) ||
      a.skills.toLowerCase().includes(search.toLowerCase()) ||
      (a.job_title || "").toLowerCase().includes(search.toLowerCase());
    const matchJob = filterJob === "all" || a.job_id === Number(filterJob);
    return matchSearch && matchJob;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* ── Header ── */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-md flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">Admin Console</h1>
            <span className="hidden sm:inline-block w-px h-6 bg-slate-200 mx-2" />
            <p className="text-sm font-medium text-slate-500">Applications Management</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={fetchApplicants}
              className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-md transition-colors"
            >
              <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Sync Data
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        
        {/* ── Summary Stats ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Candidates", value: applicants.length, icon: Users },
            { label: "New Applied", value: filtered.length, icon: Clock },
            { label: "Jobs Active", value: jobIds.length, icon: Briefcase },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className="w-5 h-5 text-slate-400" />
                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full uppercase">Live</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-xs font-medium text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ── Filters Bar ── */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, or skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={filterJob}
                onChange={(e) => setFilterJob(e.target.value)}
                className="h-10 pl-10 pr-8 text-sm font-semibold border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white appearance-none cursor-pointer"
              >
                <option value="all">All Jobs</option>
                {jobIds.map((jid) => (
                  <option key={jid} value={jid}>Job #{jid}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ── Content Table Area ── */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Candidate</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Details</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Skills</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status & Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <RefreshCcw className="w-6 h-6 text-indigo-600 animate-spin" />
                        <p className="text-sm text-slate-500 font-medium">Fetching records...</p>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-20 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center">
                          <Search className="w-6 h-6 text-slate-300" />
                        </div>
                        <p className="text-sm font-medium">No results found matching your criteria</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((applicant) => (
                    <tr key={applicant.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-black text-indigo-600 shrink-0 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                              {getInitials(applicant.name)}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                              <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
                            </div>
                          </div>
                          <div className="min-w-0">
                            <p className="text-[15px] font-black text-slate-900 truncate mb-1.5 leading-none">
                              {applicant.name}
                            </p>
                            <div className="flex flex-col gap-1.5">
                              <a 
                                href={`mailto:${applicant.email}`} 
                                className="flex items-center gap-2 text-[12px] font-bold text-slate-500 hover:text-indigo-600 transition-colors"
                              >
                                <Mail className="w-3.5 h-3.5 text-slate-400" />
                                <span className="truncate">{applicant.email}</span>
                              </a>
                              <a 
                                href={applicant.mobile_number ? `tel:${applicant.mobile_number}` : "#"} 
                                className={`flex items-center gap-2 text-[12px] font-bold transition-colors ${
                                  applicant.mobile_number 
                                    ? 'text-slate-500 hover:text-indigo-600' 
                                    : 'text-slate-300 italic pointer-events-none'
                                }`}
                              >
                                <Phone className={`w-3.5 h-3.5 ${applicant.mobile_number ? 'text-slate-400' : 'text-slate-200'}`} />
                                <span className="truncate">{applicant.mobile_number || "Phone not provided"}</span>
                              </a>
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-5 hidden md:table-cell">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2 text-[12px] font-bold text-slate-600">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" /> {applicant.location || "Location N/A"}
                          </div>
                          <div className="flex items-center gap-2 text-[12px] font-bold text-slate-600">
                            <GraduationCap className="w-3.5 h-3.5 text-slate-400" /> {applicant.qualification || "Qualification N/A"}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded w-fit uppercase tracking-wider">
                            <Briefcase className="w-3 h-3" /> {applicant.experience || "Freshers"}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1.5 max-w-[240px]">
                          {applicant.skills.split(",").slice(0, 3).map((s, i) => (
                            <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded border border-slate-200">
                              {s.trim()}
                            </span>
                          ))}
                          {applicant.skills.split(",").length > 3 && (
                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded border border-indigo-100">
                              +{applicant.skills.split(",").length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center justify-between gap-6">
                          <div className="flex flex-col items-end shrink-0">
                            <div className="flex items-center gap-1 text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">
                              <Clock className="w-3 h-3" />
                              {timeAgo(applicant.applied_at)}
                            </div>
                            <span className="text-[12px] font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 max-w-[140px] truncate shadow-sm">
                              {applicant.job_title || `Job #${applicant.job_id}`}
                            </span>
                          </div>
                          
                          <button
                            onClick={() => handleDownload(applicant)}
                            disabled={downloading === applicant.id}
                            className={`flex items-center gap-2 h-9 px-4 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all border ${
                              downloading === applicant.id
                                ? "bg-slate-50 text-slate-400 border-slate-200"
                                : "bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-600 hover:text-white hover:border-indigo-600"
                            }`}
                          >
                            {downloading === applicant.id ? (
                              <RefreshCcw className="w-3 h-3 animate-spin" />
                            ) : (
                              <Download className="w-3 h-3" />
                            )}
                            Resume
                          </button>

                          <button
                            onClick={() => handleDeleteApplication(applicant.id)}
                            className="flex items-center justify-center w-9 h-9 rounded-md border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-100 hover:bg-red-50 transition-all"
                            title="Delete Application"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        {applicant.resume_filename && (
                          <div className="mt-1.5 text-[10px] text-slate-400 flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            <span className="truncate max-w-[120px]">{applicant.resume_filename}</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* ── Footer Info ── */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">
              Showing <span className="font-bold text-slate-900">{filtered.length}</span> candidates out of <span className="font-bold text-slate-900">{applicants.length}</span> total
            </p>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 text-xs font-bold text-slate-400 cursor-not-allowed">Previous</button>
              <button className="px-3 py-1.5 text-xs font-bold text-slate-400 cursor-not-allowed">Next</button>
            </div>
          </div>

        </div>
      </main>

    </div>
  );
}


