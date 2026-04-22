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
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
);

const LocationIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7z" />
    <circle cx="12" cy="9" r="2.5" />
  </svg>
);

const SalaryIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

export default function AdminJobPage() {
  const [form, setForm] = useState({
    title: "", company: "", location: "", salary: "",
    job_type: "", skills: "", experience: "", description: "",
  });

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchJobs = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/jobs/jobs");
      const data = await res.json();
      // Handle both array response and object response
      setJobs(Array.isArray(data) ? data : data.jobs || data.data || []);
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
      setJobs([]);
    }
  };

  useEffect(() => { fetchJobs(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
      const res = await fetch("http://localhost:5000/api/jobs/add-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to post job");
      }
      setSuccess("Job posted successfully!");
      setForm({
        title: "", company: "", location: "", salary: "",
        job_type: "", skills: "", experience: "", description: "",
      });
      fetchJobs();
    } catch (err: any) {
      console.error("Error posting job:", err);
      setError(err.message || "Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to remove this job?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/jobs/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete job");
      fetchJobs();
    } catch (err) {
      console.error("Error deleting job:", err);
      alert("Failed to delete job. Please try again.");
    }
  };

  return (
    <div className="bg-[#f3f2ee] min-h-screen font-sans">

      {/* TOP BAR */}
      <div className="bg-white border-b border-[#e4e2e0] px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="bg-[#2557a7] text-white font-semibold text-[13px] px-2.5 py-1 rounded tracking-tight">
            indeed
          </span>
          <span className="text-[13px] text-[#767676]">Admin Console</span>
        </div>
        <span className="bg-[#e8f0fe] text-[#1a3f7a] text-[11px] font-medium px-2.5 py-1 rounded-full">
          Job Manager
        </span>
      </div>

      {/* CONTAINER */}
      <div className="max-w-2xl mx-auto mt-8 px-4 pb-10">

        {/* FORM PANEL */}
        <div className="bg-white border border-[#e4e2e0] rounded-xl overflow-hidden mb-6">

          {/* Panel Header */}
          <div className="px-5 py-4 border-b border-[#e4e2e0]">
            <p className="text-[15px] font-semibold text-[#1a1a1a]">Post a new job</p>
            <p className="text-[12px] text-[#767676] mt-0.5">Fill in the details below to publish</p>
          </div>

          {/* Error / Success Messages */}
          {error && (
            <div className="mx-5 mt-4 px-4 py-2.5 bg-red-50 border border-red-200 rounded-lg text-[13px] text-red-600">
              {error}
            </div>
          )}
          {success && (
            <div className="mx-5 mt-4 px-4 py-2.5 bg-green-50 border border-green-200 rounded-lg text-[13px] text-green-600">
              {success}
            </div>
          )}

          {/* Form Body */}
          <div className="px-5 py-4 flex flex-col gap-2.5">

            <div className="flex flex-col">
              <label className="text-[12px] font-medium text-[#555] mb-1">Job title *</label>
              <input
                name="title"
                value={form.title}
                placeholder="e.g. Frontend Developer"
                onChange={handleChange}
                className="w-full px-2.5 py-2 text-[13px] border border-[#e4e2e0] rounded-lg bg-white text-[#1a1a1a] outline-none font-sans"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-[12px] font-medium text-[#555] mb-1">Company *</label>
              <input
                name="company"
                value={form.company}
                placeholder="e.g. Infosys"
                onChange={handleChange}
                className="w-full px-2.5 py-2 text-[13px] border border-[#e4e2e0] rounded-lg bg-white text-[#1a1a1a] outline-none font-sans"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="flex flex-col">
                <label className="text-[12px] font-medium text-[#555] mb-1">Location</label>
                <input
                  name="location"
                  value={form.location}
                  placeholder="e.g. Chennai"
                  onChange={handleChange}
                  className="w-full px-2.5 py-2 text-[13px] border border-[#e4e2e0] rounded-lg bg-white text-[#1a1a1a] outline-none font-sans"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-[12px] font-medium text-[#555] mb-1">Salary</label>
                <input
                  name="salary"
                  value={form.salary}
                  placeholder="e.g. ₹8–12 LPA"
                  onChange={handleChange}
                  className="w-full px-2.5 py-2 text-[13px] border border-[#e4e2e0] rounded-lg bg-white text-[#1a1a1a] outline-none font-sans"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="flex flex-col">
                <label className="text-[12px] font-medium text-[#555] mb-1">Job type</label>
                <input
                  name="job_type"
                  value={form.job_type}
                  placeholder="Full-time / Remote"
                  onChange={handleChange}
                  className="w-full px-2.5 py-2 text-[13px] border border-[#e4e2e0] rounded-lg bg-white text-[#1a1a1a] outline-none font-sans"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-[12px] font-medium text-[#555] mb-1">Experience</label>
                <input
                  name="experience"
                  value={form.experience}
                  placeholder="e.g. 2–4 years"
                  onChange={handleChange}
                  className="w-full px-2.5 py-2 text-[13px] border border-[#e4e2e0] rounded-lg bg-white text-[#1a1a1a] outline-none font-sans"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-[12px] font-medium text-[#555] mb-1">Skills</label>
              <input
                name="skills"
                value={form.skills}
                placeholder="React, Node.js, SQL…"
                onChange={handleChange}
                className="w-full px-2.5 py-2 text-[13px] border border-[#e4e2e0] rounded-lg bg-white text-[#1a1a1a] outline-none font-sans"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-[12px] font-medium text-[#555] mb-1">Description</label>
              <textarea
                name="description"
                value={form.description}
                placeholder="Describe the role, responsibilities…"
                onChange={handleChange}
                className="w-full px-2.5 py-2 text-[13px] border border-[#e4e2e0] rounded-lg bg-white text-[#1a1a1a] outline-none font-sans min-h-[80px] resize-y"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full mt-1 py-2.5 bg-[#2557a7] text-white border-none rounded-lg text-[13px] font-semibold cursor-pointer font-sans disabled:opacity-60 hover:bg-[#1e4a96] transition-colors"
            >
              {loading ? "Posting…" : "Post job"}
            </button>
          </div>
        </div>

        {/* POSTED JOBS PANEL */}
        <div className="bg-white border border-[#e4e2e0] rounded-xl overflow-hidden">

          {/* Results Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#e4e2e0]">
            <span className="text-[15px] font-semibold text-[#1a1a1a]">Posted jobs</span>
            <span className="text-[13px] text-[#767676]">
              {jobs.length} {jobs.length === 1 ? "job" : "jobs"}
            </span>
          </div>

          {/* Empty State */}
          {jobs.length === 0 ? (
            <div className="text-center py-12 px-5 text-[#767676]">
              <p className="text-[28px] opacity-40 mb-2">📋</p>
              <p className="text-[14px]">No jobs posted yet. Add your first job!</p>
            </div>
          ) : (
            jobs.map((job) => {
              const skills = job.skills
                ? job.skills.split(",").map((s) => s.trim()).filter(Boolean)
                : [];

              return (
                <div key={job.id} className="px-5 py-4 border-b border-[#e4e2e0] last:border-b-0">

                  {/* Card Top */}
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3 items-start">
                      <div className="w-10 h-10 rounded-lg bg-[#e8f0fe] border border-[#c5d5f0] flex items-center justify-center font-semibold text-[13px] text-[#2557a7] shrink-0">
                        {getInitials(job.company)}
                      </div>
                      <div>
                        <p className="text-[14px] font-semibold text-[#1a1a1a] mb-0.5">{job.title}</p>
                        <p className="text-[13px] text-[#2557a7]">{job.company}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(job.id)}
                      className="flex items-center gap-1 bg-transparent border border-[#e4e2e0] rounded-lg px-2.5 py-1.5 cursor-pointer text-[#767676] text-[11px] font-sans hover:bg-[#f3f2ee] transition-colors"
                    >
                      <TrashIcon />
                      Remove
                    </button>
                  </div>

                  {/* Meta Row */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {job.location && (
                      <span className="flex items-center gap-1 text-[11px] text-[#555] bg-[#f3f2ee] px-2 py-0.5 rounded-full">
                        <LocationIcon /> {job.location}
                      </span>
                    )}
                    {job.salary && (
                      <span className="flex items-center gap-1 text-[11px] text-[#555] bg-[#f3f2ee] px-2 py-0.5 rounded-full">
                        <SalaryIcon /> {job.salary}
                      </span>
                    )}
                    {job.experience && (
                      <span className="flex items-center gap-1 text-[11px] text-[#555] bg-[#f3f2ee] px-2 py-0.5 rounded-full">
                        {job.experience}
                      </span>
                    )}
                    {job.job_type && (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#e8f4ea] text-[#2a6b3b]">
                        {job.job_type}
                      </span>
                    )}
                  </div>

                  {/* Skills Row */}
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
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
