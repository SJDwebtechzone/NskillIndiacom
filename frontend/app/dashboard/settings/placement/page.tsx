// "use client";

// import { useEffect, useState } from "react";

// interface Job {
//   id: number;
//   title: string;
//   company: string;
//   location: string;
//   salary: string;
//   job_type: string;
//   skills: string;
//   experience: string;
//   description: string;
// }

// function getInitials(name: string) {
//   return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "JB";
// }

// const TrashIcon = () => (
//   <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
//     stroke="currentColor" strokeWidth="2" strokeLinecap="round">
//     <polyline points="3 6 5 6 21 6" />
//     <path d="M19 6l-1 14H6L5 6" />
//     <path d="M10 11v6M14 11v6" />
//     <path d="M9 6V4h6v2" />
//   </svg>
// );

// const LocationIcon = () => (
//   <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//     <path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7z" />
//     <circle cx="12" cy="9" r="2.5" />
//   </svg>
// );

// const SalaryIcon = () => (
//   <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//     <line x1="12" y1="1" x2="12" y2="23" />
//     <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
//   </svg>
// );

// export default function AdminJobPage() {
//   const [form, setForm] = useState({
//     title: "", company: "", location: "", salary: "",
//     job_type: "", skills: "", experience: "", description: "",
//   });

//   const [jobs, setJobs] = useState<Job[]>([]);
//   const [loading, setLoading] = useState(false);

//   const fetchJobs = async () => {
//     const res = await fetch("http://localhost:5000/api/jobs/jobs");
//     const data = await res.json();
//     setJobs(data);
//   };

//   useEffect(() => { fetchJobs(); }, []);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async () => {
//     if (!form.title || !form.company) return;
//     setLoading(true);
//     await fetch("http://localhost:5000/api/jobs/add-job", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(form),
//     });
//     setForm({
//       title: "", company: "", location: "", salary: "",
//       job_type: "", skills: "", experience: "", description: "",
//     });
//     setLoading(false);
//     fetchJobs();
//   };

//   const handleDelete = async (id: number) => {
//     await fetch(`http://localhost:5000/api/jobs/${id}`, { method: "DELETE" });
//     fetchJobs();
//   };

//   return (
//     <div className="bg-[#f3f2ee] min-h-screen font-sans">

//       {/* TOP BAR */}
//       <div className="bg-white border-b border-[#e4e2e0] px-6 h-14 flex items-center justify-between">
//         <div className="flex items-center gap-2">
//           <span className="bg-[#2557a7] text-white font-semibold text-[13px] px-2.5 py-1 rounded tracking-tight">
//             indeed
//           </span>
//           <span className="text-[13px] text-[#767676]">Admin Console</span>
//         </div>
//         <span className="bg-[#e8f0fe] text-[#1a3f7a] text-[11px] font-medium px-2.5 py-1 rounded-full">
//           Job Manager
//         </span>
//       </div>

//       {/* CONTAINER */}
//       <div className="max-w-2xl mx-auto mt-8 px-4 pb-10">

//         {/* FORM PANEL */}
//         <div className="bg-white border border-[#e4e2e0] rounded-xl overflow-hidden mb-6">

//           {/* Panel Header */}
//           <div className="px-5 py-4 border-b border-[#e4e2e0]">
//             <p className="text-[15px] font-semibold text-[#1a1a1a]">Post a new job</p>
//             <p className="text-[12px] text-[#767676] mt-0.5">Fill in the details below to publish</p>
//           </div>

//           {/* Form Body */}
//           <div className="px-5 py-4 flex flex-col gap-2.5">

//             <div className="flex flex-col">
//               <label className="text-[12px] font-medium text-[#555] mb-1">Job title *</label>
//               <input
//                 name="title"
//                 value={form.title}
//                 placeholder="e.g. Frontend Developer"
//                 onChange={handleChange}
//                 className="w-full px-2.5 py-2 text-[13px] border border-[#e4e2e0] rounded-lg bg-white text-[#1a1a1a] outline-none font-sans"
//               />
//             </div>

//             <div className="flex flex-col">
//               <label className="text-[12px] font-medium text-[#555] mb-1">Company *</label>
//               <input
//                 name="company"
//                 value={form.company}
//                 placeholder="e.g. Infosys"
//                 onChange={handleChange}
//                 className="w-full px-2.5 py-2 text-[13px] border border-[#e4e2e0] rounded-lg bg-white text-[#1a1a1a] outline-none font-sans"
//               />
//             </div>

//             <div className="grid grid-cols-2 gap-2.5">
//               <div className="flex flex-col">
//                 <label className="text-[12px] font-medium text-[#555] mb-1">Location</label>
//                 <input
//                   name="location"
//                   value={form.location}
//                   placeholder="e.g. Chennai"
//                   onChange={handleChange}
//                   className="w-full px-2.5 py-2 text-[13px] border border-[#e4e2e0] rounded-lg bg-white text-[#1a1a1a] outline-none font-sans"
//                 />
//               </div>
//               <div className="flex flex-col">
//                 <label className="text-[12px] font-medium text-[#555] mb-1">Salary</label>
//                 <input
//                   name="salary"
//                   value={form.salary}
//                   placeholder="e.g. ₹8–12 LPA"
//                   onChange={handleChange}
//                   className="w-full px-2.5 py-2 text-[13px] border border-[#e4e2e0] rounded-lg bg-white text-[#1a1a1a] outline-none font-sans"
//                 />
//               </div>
//             </div>

//             <div className="grid grid-cols-2 gap-2.5">
//               <div className="flex flex-col">
//                 <label className="text-[12px] font-medium text-[#555] mb-1">Job type</label>
//                 <input
//                   name="job_type"
//                   value={form.job_type}
//                   placeholder="Full-time / Remote"
//                   onChange={handleChange}
//                   className="w-full px-2.5 py-2 text-[13px] border border-[#e4e2e0] rounded-lg bg-white text-[#1a1a1a] outline-none font-sans"
//                 />
//               </div>
//               <div className="flex flex-col">
//                 <label className="text-[12px] font-medium text-[#555] mb-1">Experience</label>
//                 <input
//                   name="experience"
//                   value={form.experience}
//                   placeholder="e.g. 2–4 years"
//                   onChange={handleChange}
//                   className="w-full px-2.5 py-2 text-[13px] border border-[#e4e2e0] rounded-lg bg-white text-[#1a1a1a] outline-none font-sans"
//                 />
//               </div>
//             </div>

//             <div className="flex flex-col">
//               <label className="text-[12px] font-medium text-[#555] mb-1">Skills</label>
//               <input
//                 name="skills"
//                 value={form.skills}
//                 placeholder="React, Node.js, SQL…"
//                 onChange={handleChange}
//                 className="w-full px-2.5 py-2 text-[13px] border border-[#e4e2e0] rounded-lg bg-white text-[#1a1a1a] outline-none font-sans"
//               />
//             </div>

//             <div className="flex flex-col">
//               <label className="text-[12px] font-medium text-[#555] mb-1">Description</label>
//               <textarea
//                 name="description"
//                 value={form.description}
//                 placeholder="Describe the role, responsibilities…"
//                 onChange={handleChange}
//                 className="w-full px-2.5 py-2 text-[13px] border border-[#e4e2e0] rounded-lg bg-white text-[#1a1a1a] outline-none font-sans min-h-[80px] resize-y"
//               />
//             </div>

//             <button
//               onClick={handleSubmit}
//               disabled={loading}
//               className="w-full mt-1 py-2.5 bg-[#2557a7] text-white border-none rounded-lg text-[13px] font-semibold cursor-pointer font-sans disabled:opacity-60 hover:bg-[#1e4a96] transition-colors"
//             >
//               {loading ? "Posting…" : "Post job"}
//             </button>
//           </div>
//         </div>

//         {/* POSTED JOBS PANEL */}
//         <div className="bg-white border border-[#e4e2e0] rounded-xl overflow-hidden">

//           {/* Results Header */}
//           <div className="flex items-center justify-between px-5 py-4 border-b border-[#e4e2e0]">
//             <span className="text-[15px] font-semibold text-[#1a1a1a]">Posted jobs</span>
//             <span className="text-[13px] text-[#767676]">
//               {jobs.length} {jobs.length === 1 ? "job" : "jobs"}
//             </span>
//           </div>

//           {/* Empty State */}
//           {jobs.length === 0 ? (
//             <div className="text-center py-12 px-5 text-[#767676]">
//               <p className="text-[28px] opacity-40 mb-2">📋</p>
//               <p className="text-[14px]">No jobs posted yet. Add your first job!</p>
//             </div>
//           ) : (
//             jobs.map((job) => {
//               const skills = job.skills
//                 ? job.skills.split(",").map((s) => s.trim()).filter(Boolean)
//                 : [];

//               return (
//                 <div key={job.id} className="px-5 py-4 border-b border-[#e4e2e0] last:border-b-0">

//                   {/* Card Top */}
//                   <div className="flex justify-between items-start">
//                     <div className="flex gap-3 items-start">
//                       <div className="w-10 h-10 rounded-lg bg-[#e8f0fe] border border-[#c5d5f0] flex items-center justify-center font-semibold text-[13px] text-[#2557a7] shrink-0">
//                         {getInitials(job.company)}
//                       </div>
//                       <div>
//                         <p className="text-[14px] font-semibold text-[#1a1a1a] mb-0.5">{job.title}</p>
//                         <p className="text-[13px] text-[#2557a7]">{job.company}</p>
//                       </div>
//                     </div>

//                     <button
//                       onClick={() => handleDelete(job.id)}
//                       className="flex items-center gap-1 bg-transparent border border-[#e4e2e0] rounded-lg px-2.5 py-1.5 cursor-pointer text-[#767676] text-[11px] font-sans hover:bg-[#f3f2ee] transition-colors"
//                     >
//                       <TrashIcon />
//                       Remove
//                     </button>
//                   </div>

//                   {/* Meta Row */}
//                   <div className="flex flex-wrap gap-1.5 mt-2">
//                     {job.location && (
//                       <span className="flex items-center gap-1 text-[11px] text-[#555] bg-[#f3f2ee] px-2 py-0.5 rounded-full">
//                         <LocationIcon /> {job.location}
//                       </span>
//                     )}
//                     {job.salary && (
//                       <span className="flex items-center gap-1 text-[11px] text-[#555] bg-[#f3f2ee] px-2 py-0.5 rounded-full">
//                         <SalaryIcon /> {job.salary}
//                       </span>
//                     )}
//                     {job.experience && (
//                       <span className="flex items-center gap-1 text-[11px] text-[#555] bg-[#f3f2ee] px-2 py-0.5 rounded-full">
//                         {job.experience}
//                       </span>
//                     )}
//                     {job.job_type && (
//                       <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#e8f4ea] text-[#2a6b3b]">
//                         {job.job_type}
//                       </span>
//                     )}
//                   </div>

//                   {/* Skills Row */}
//                   {skills.length > 0 && (
//                     <div className="flex flex-wrap gap-1 mt-2">
//                       {skills.slice(0, 4).map((sk, i) => (
//                         <span
//                           key={i}
//                           className="text-[11px] text-[#555] bg-[#f3f2ee] px-2 py-0.5 rounded-full border border-[#e4e2e0]"
//                         >
//                           {sk}
//                         </span>
//                       ))}
//                       {skills.length > 4 && (
//                         <span className="text-[11px] text-[#555] bg-[#f3f2ee] px-2 py-0.5 rounded-full border border-[#e4e2e0]">
//                           +{skills.length - 4} more
//                         </span>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               );
//             })
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
"use client";

import { useEffect, useState } from "react";

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  job_type: string;
  skills: string;
  experience: string;
  description: string;
}

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "JB";
}

const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
);

const LocationIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7z" />
    <circle cx="12" cy="9" r="2.5" />
  </svg>
);

const SalaryIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const ClockIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export default function AdminJobPage() {
  const [form, setForm] = useState({
    title: "", company: "", location: "", salary: "",
    job_type: "", skills: "", experience: "", description: "",
    use_default_email: true, thank_you_template_id: "", reminder_template_id: "",
    enable_reminder: false, event_date: "", event_time: "", event_location: ""
  });

  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
  const [templates, setTemplates] = useState<any[]>([]);

  const fetchJobs = async () => {
    try {
      const res = await fetch(`${API}/api/jobs/jobs`);
      const data = await res.json();
      setJobs(Array.isArray(data) ? data : data.jobs || data.data || []);
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
      setJobs([]);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await fetch(`${API}/api/mail-templates`);
      const data = await res.json();
      setTemplates(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchJobs(); fetchTemplates(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setForm({ ...form, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async () => {
    if (!form.title || !form.company) {
      setError("Job title and company are required.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const url = editId ? `${API}/api/jobs/update-job/${editId}` : `${API}/api/jobs/add-job`;
      const method = editId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || `Failed to ${editId ? "update" : "post"} job`);
      }
      setSuccess(editId ? "Job updated successfully!" : "Job posted successfully!");
      setForm({
        title: "", company: "", location: "", salary: "",
        job_type: "", skills: "", experience: "", description: "",
        use_default_email: true, thank_you_template_id: "", reminder_template_id: "",
        enable_reminder: false, event_date: "", event_time: "", event_location: ""
      });
      setEditId(null);
      fetchJobs();
    } catch (err: any) {
      console.error("Error posting/updating job:", err);
      setError(err.message || "Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  const handleEdit = (job: any) => {
    setEditId(job.id);
    
    // Format date properly if it exists
    let formattedDate = "";
    if (job.event_date) {
      formattedDate = new Date(job.event_date).toISOString().split('T')[0];
    }
    
    setForm({
      title: job.title || "",
      company: job.company || "",
      location: job.location || "",
      salary: job.salary || "",
      job_type: job.job_type || "",
      skills: job.skills || "",
      experience: job.experience || "",
      description: job.description || "",
      use_default_email: job.use_default_email !== undefined ? job.use_default_email : true,
      thank_you_template_id: job.thank_you_template_id || "",
      reminder_template_id: job.reminder_template_id || "",
      enable_reminder: job.enable_reminder || false,
      event_date: formattedDate,
      event_time: job.event_time || "",
      event_location: job.event_location || ""
    });
    setError("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setForm({
      title: "", company: "", location: "", salary: "",
      job_type: "", skills: "", experience: "", description: "",
      use_default_email: true, thank_you_template_id: "", reminder_template_id: "",
      enable_reminder: false, event_date: "", event_time: "", event_location: ""
    });
    setError("");
    setSuccess("");
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to remove this job?")) return;
    try {
      const res = await fetch(`${API}/api/jobs/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete job");
      fetchJobs();
    } catch (err) {
      console.error("Error deleting job:", err);
      alert("Failed to delete job. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 font-sans">

      {/* ── PAGE HEADER ── */}
      <div className="bg-white border-b-4 border-blue-600 px-6 py-7 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-1.5 h-14 bg-gradient-to-b from-blue-600 to-blue-800 rounded-full"></div>
            <div>
              <h1 className="text-slate-900 font-black text-3xl tracking-tight">Placement Portal</h1>
              <p className="text-blue-600 text-sm font-bold uppercase tracking-[0.2em] mt-1">Job Manager · Admin Console</p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="bg-blue-600 text-white text-sm font-black px-5 py-2 rounded-full shadow-md tracking-wide">
              {jobs.length} {jobs.length === 1 ? "Job" : "Jobs"} Posted
            </span>
          </div>
        </div>
      </div>

      {/* ── CONTAINER ── */}
      <div className="max-w-2xl mx-auto mt-8 px-4 pb-12 space-y-6">

        {/* ── FORM PANEL ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-blue-100 overflow-hidden">

          {/* Panel Header */}
          <div className="px-6 py-5 border-b border-blue-50 bg-gradient-to-r from-blue-50 to-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                {editId ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                )}
              </div>
              <div>
                <p className="text-[15px] font-black text-slate-800">{editId ? "Edit job" : "Post a new job"}</p>
                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                  {editId ? "Update the details below to save changes" : "Fill in the details below to publish"}
                </p>
              </div>
            </div>
          </div>

          {/* Error / Success */}
          {error && (
            <div className="mx-6 mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-[13px] text-red-600 font-medium flex items-center gap-2">
              <span className="text-red-400">⚠</span> {error}
            </div>
          )}
          {success && (
            <div className="mx-6 mt-4 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-[13px] text-blue-700 font-medium flex items-center gap-2">
              <span>✓</span> {success}
            </div>
          )}

          {/* Form Body */}
          <div className="px-6 py-5 flex flex-col gap-4">

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Job title <span className="text-blue-600">*</span></label>
              <input
                name="title"
                value={form.title}
                placeholder="e.g. Frontend Developer"
                onChange={handleChange}
                className="w-full px-3 py-2.5 text-[13px] border border-slate-200 rounded-xl bg-white text-slate-800 outline-none font-sans focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Company <span className="text-blue-600">*</span></label>
              <input
                name="company"
                value={form.company}
                placeholder="e.g. Infosys"
                onChange={handleChange}
                className="w-full px-3 py-2.5 text-[13px] border border-slate-200 rounded-xl bg-white text-slate-800 outline-none font-sans focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Location</label>
                <input
                  name="location"
                  value={form.location}
                  placeholder="e.g. Chennai"
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 text-[13px] border border-slate-200 rounded-xl bg-white text-slate-800 outline-none font-sans focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Salary</label>
                <input
                  name="salary"
                  value={form.salary}
                  placeholder="e.g. ₹8–12 LPA"
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 text-[13px] border border-slate-200 rounded-xl bg-white text-slate-800 outline-none font-sans focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Job type</label>
                <input
                  name="job_type"
                  value={form.job_type}
                  placeholder="Full-time / Remote"
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 text-[13px] border border-slate-200 rounded-xl bg-white text-slate-800 outline-none font-sans focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Experience</label>
                <input
                  name="experience"
                  value={form.experience}
                  placeholder="e.g. 2–4 years"
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 text-[13px] border border-slate-200 rounded-xl bg-white text-slate-800 outline-none font-sans focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Skills</label>
              <input
                name="skills"
                value={form.skills}
                placeholder="React, Node.js, SQL…"
                onChange={handleChange}
                className="w-full px-3 py-2.5 text-[13px] border border-slate-200 rounded-xl bg-white text-slate-800 outline-none font-sans focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Description</label>
              <textarea
                name="description"
                value={form.description}
                placeholder="Describe the role, responsibilities…"
                onChange={handleChange}
                className="w-full px-3 py-2.5 text-[13px] border border-slate-200 rounded-xl bg-white text-slate-800 outline-none font-sans min-h-[90px] resize-y focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            {/* ── EMAIL SETTINGS ── */}
            <div className="mt-2 pt-4 border-t border-slate-200 flex flex-col gap-4">
              <h3 className="text-[13px] font-black text-slate-800 uppercase tracking-wide">Email Settings</h3>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="use_default_email"
                  checked={form.use_default_email}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span className="text-[13px] font-semibold text-slate-700">Use Default Confirmation Email</span>
              </label>

              {!form.use_default_email && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col gap-4">
                  <h4 className="text-[12px] font-bold text-slate-700 uppercase tracking-wide border-b border-slate-200 pb-2">Custom Email Configuration</h4>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Thank You Template *</label>
                    <select
                      name="thank_you_template_id"
                      value={form.thank_you_template_id}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 text-[13px] border border-slate-200 rounded-xl bg-white text-slate-800 outline-none font-sans focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                    >
                      <option value="">Select Template</option>
                      {templates.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Event Date</label>
                      <input
                        type="date"
                        name="event_date"
                        value={form.event_date}
                        onChange={handleChange}
                        className="w-full px-3 py-2.5 text-[13px] border border-slate-200 rounded-xl bg-white text-slate-800 outline-none font-sans focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Event Time</label>
                      <input
                        name="event_time"
                        value={form.event_time}
                        placeholder="e.g. 10:00 AM"
                        onChange={handleChange}
                        className="w-full px-3 py-2.5 text-[13px] border border-slate-200 rounded-xl bg-white text-slate-800 outline-none font-sans focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Event Location</label>
                    <input
                      name="event_location"
                      value={form.event_location}
                      placeholder="e.g. Main Campus Auditorium"
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 text-[13px] border border-slate-200 rounded-xl bg-white text-slate-800 outline-none font-sans focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer mt-2">
                    <input
                      type="checkbox"
                      name="enable_reminder"
                      checked={form.enable_reminder}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    />
                    <span className="text-[13px] font-semibold text-slate-700">Enable Reminders</span>
                  </label>

                  {form.enable_reminder && (
                    <div className="flex flex-col gap-1.5 pl-4 border-l-2 border-blue-200 ml-1">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Reminder Template *</label>
                      <select
                        name="reminder_template_id"
                        value={form.reminder_template_id}
                        onChange={handleChange}
                        className="w-full px-3 py-2.5 text-[13px] border border-slate-200 rounded-xl bg-white text-slate-800 outline-none font-sans focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                      >
                        <option value="">Select Template</option>
                        {templates.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-1">
              {editId && (
                <button
                  onClick={handleCancelEdit}
                  disabled={loading}
                  className="w-1/3 py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-[13px] font-black cursor-pointer font-sans transition-all tracking-wide uppercase"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl text-[13px] font-black cursor-pointer font-sans disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm shadow-blue-200 tracking-wide uppercase"
              >
                {loading ? (editId ? "Updating…" : "Posting…") : (editId ? "Update job" : "Post job")}
              </button>
            </div>
          </div>
        </div>

        {/* ── POSTED JOBS PANEL ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-blue-100 overflow-hidden">

          {/* Results Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-blue-50 bg-gradient-to-r from-blue-50 to-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" />
                  <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                </svg>
              </div>
              <span className="text-[15px] font-black text-slate-800">Posted jobs</span>
            </div>
            <span className="bg-blue-600 text-white text-[11px] font-black px-3 py-1 rounded-full">
              {jobs.length} {jobs.length === 1 ? "job" : "jobs"}
            </span>
          </div>

          {/* Empty State */}
          {jobs.length === 0 ? (
            <div className="text-center py-16 px-5">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📋</span>
              </div>
              <p className="text-slate-800 font-black text-[15px]">No jobs posted yet</p>
              <p className="text-slate-400 text-[13px] mt-1">Add your first job using the form above.</p>
            </div>
          ) : (
            jobs.map((job) => {
              const skills = job.skills
                ? job.skills.split(",").map((s: string) => s.trim()).filter(Boolean)
                : [];

              return (
                <div key={job.id} className="px-6 py-5 border-b border-slate-50 last:border-b-0 hover:bg-blue-50/30 transition-colors group">

                  {/* Card Top */}
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3 items-start">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center font-black text-[13px] text-white shrink-0 shadow-sm">
                        {getInitials(job.company)}
                      </div>
                      <div>
                        <p className="text-[14px] font-black text-slate-800 mb-0.5">{job.title}</p>
                        <p className="text-[12px] text-blue-600 font-bold">{job.company}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(job)}
                        className="flex items-center gap-1.5 bg-transparent border border-slate-200 rounded-lg px-3 py-1.5 cursor-pointer text-slate-500 text-[11px] font-bold font-sans hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 transition-all"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(job.id)}
                        className="flex items-center gap-1.5 bg-transparent border border-slate-200 rounded-lg px-3 py-1.5 cursor-pointer text-slate-400 text-[11px] font-bold font-sans hover:border-red-200 hover:bg-red-50 hover:text-red-500 transition-all"
                      >
                        <TrashIcon />
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Meta Row */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {job.location && (
                      <span className="flex items-center gap-1 text-[11px] text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full font-semibold">
                        <LocationIcon /> {job.location}
                      </span>
                    )}
                    {job.salary && (
                      <span className="flex items-center gap-1 text-[11px] text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full font-semibold">
                        <SalaryIcon /> {job.salary}
                      </span>
                    )}
                    {job.experience && (
                      <span className="flex items-center gap-1 text-[11px] text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full font-semibold">
                        {job.experience}
                      </span>
                    )}
                    {job.job_type && (
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-600 text-white">
                        {job.job_type}
                      </span>
                    )}
                  </div>

                  {/* Skills Row */}
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {skills.slice(0, 4).map((sk: string, i: number) => (
                        <span
                          key={i}
                          className="text-[11px] text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full font-semibold"
                        >
                          {sk}
                        </span>
                      ))}
                      {skills.length > 4 && (
                        <span className="text-[11px] text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full font-semibold">
                          +{skills.length - 4} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
