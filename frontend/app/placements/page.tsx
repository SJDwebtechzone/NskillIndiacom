"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpenText,
  BriefcaseBusiness,
  Building2,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Handshake,
  TrendingUp,
  UserCheck,
} from "lucide-react";
import axios from "axios";

type Partner = {
  id?: number | string;
  company_name?: string;
  company_logo?: string;
  website_url?: string;
};

type JobRecord = {
  title?: string;
  role?: string;
  company?: string;
  industry?: string;
  location?: string;
  experience?: string;
  job_type?: string;
  salary?: string;
};

export default function PlacementsPage() {
  const router = useRouter();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const res = await axios.get(`${API}/api/partners`);
        setPartners(res.data);
      } catch (err) {
        console.error("Error fetching partners:", err);
      }
    };

    const fetchJobs = async () => {
      try {
        const res = await axios.get(`${API}/api/jobs/jobs`);
        setJobs(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setJobs([]);
      }
    };

    fetchPartners();
    fetchJobs();
  }, [API]);

  const fallbackJobs = [
    { title: "HVAC Technician", company: "HVAC", location: "Chennai", experience: "Fresh / 0-1 Yr", salary: "₹18,000 - ₹24,000" },
    { title: "Industrial Electrician", company: "Manufacturing", location: "Chennai", experience: "0-2 Yrs", salary: "₹16,000 - ₹22,000" },
    { title: "6G Welder", company: "Fabrication", location: "Chennai", experience: "1-3 Yrs", salary: "₹20,000 - ₹28,000" },
    { title: "QC Inspector", company: "Manufacturing", location: "Chennai", experience: "0-2 Yrs", salary: "₹16,000 - ₹24,000" },
    { title: "MEP Technician", company: "Construction", location: "Chennai", experience: "0-2 Yrs", salary: "₹18,000 - ₹25,000" },
  ];

  const displayJobs = jobs.length > 0 ? jobs.slice(0, 4).map((job) => ({
    title: job.title || job.role || "Unknown Role",
    company: job.company || job.industry || "Industry",
    location: job.location || "Chennai",
    experience: job.experience || job.job_type || "Fresh",
    salary: job.salary || "Not disclosed",
  })) : fallbackJobs.slice(0, 4);

  const faqItems = [
    "Does N-Skill guarantee a job?",
    "How can I register for placement support?",
    "Who can register for job opportunities?",
    "Is there any registration fee?",
    "Do you provide interview preparation?",
  ];

  return (
    <div className="bg-[#f3f5f9] min-h-screen">
      <section className="relative overflow-hidden bg-[#022d5c]">
        <div className="absolute inset-0">
          <img
            src="/placement/placementbanner.png"
            alt="N-Skill career placement banner"
            className="h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#032b59]/95 via-[#032b59]/88 to-[#032b59]/35" />
        </div>

        <div className="relative z-10 mx-auto max-w-[1500px] px-3 py-5 md:px-6 md:py-7 lg:px-10 lg:py-8">
          <div className="grid min-h-[360px] items-center gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="max-w-[620px] text-left">
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-2.5 py-1.5 backdrop-blur-sm"
              >
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff8c2a]" />
                <span className="text-[8px] font-black uppercase tracking-[0.22em] text-white md:text-[9px]">
                  N-Skill Career & Placement Cell
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: -18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-[2.1rem] font-black leading-[0.9] tracking-[-0.05em] text-white sm:text-[2.6rem] md:text-[3.2rem] lg:text-[3.8rem]"
              >
                <span className="block">Build Your Skills.</span>
                <span className="block">Get Job-Ready.</span>
                <span className="mt-1 block text-[#ff8c2a]">Start Your Career.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="mt-3 max-w-[520px] text-[0.8rem] font-medium leading-relaxed text-blue-50/95 md:text-[0.95rem]"
              >
                We connect talented and skilled candidates with top companies and career opportunities.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.6 }}
                className="mt-5 flex flex-col gap-2.5 sm:flex-row"
              >
                <button
                  onClick={() => router.push("/placements/profile")}
                  className="inline-flex items-center justify-center rounded-xl bg-[#ff8c2a] px-4 py-2.5 text-[0.65rem] font-black uppercase tracking-[0.06em] text-white shadow-lg shadow-orange-900/20 transition-all hover:bg-[#ef7f15] active:scale-95 md:px-5 md:text-[0.75rem]"
                >
                  View Jobs
                </button>
                <button
                  onClick={() => router.push("/placements/register")}
                  className="inline-flex items-center justify-center rounded-xl border border-white/60 bg-transparent px-4 py-2.5 text-[0.65rem] font-black uppercase tracking-[0.06em] text-white transition-all hover:bg-white/10 active:scale-95 md:px-5 md:text-[0.75rem]"
                >
                  Create Job Profile
                </button>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="flex justify-center lg:justify-end"
            >
              <div className="w-full max-w-[350px] rounded-[22px] border border-white/15 bg-[#082d57]/80 p-3 shadow-[0_25px_60px_rgba(4,22,38,0.45)] backdrop-blur-[2px] md:max-w-[380px] md:p-4">
                <div className="grid grid-cols-2 gap-2.5 md:gap-3">
                  {[
                    { value: "5,000+", label: "Students Trained", icon: "GraduationCap" },
                    { value: "1,000+", label: "Candidates Placed", icon: "BriefcaseBusiness" },
                    { value: "10+", label: "Industry Partners", icon: "Building2" },
                    { value: "85%+", label: "Placement Assistance", icon: "TrendingUp" },
                  ].map((stat) => {
                    const Icon = stat.icon === "GraduationCap"
                      ? GraduationCap
                      : stat.icon === "BriefcaseBusiness"
                        ? BriefcaseBusiness
                        : stat.icon === "Building2"
                          ? Building2
                          : TrendingUp;

                    return (
                      <div
                        key={stat.label}
                        className="rounded-[18px] border border-white/10 bg-[#0d3b72]/55 p-2.5 text-center shadow-inner shadow-[#0a2547]/30 md:p-3"
                      >
                        <div className="mb-1.5 flex items-center justify-center text-[#ff8c2a]">
                          <Icon className="h-5 w-5 md:h-6 md:w-6" />
                        </div>
                        <div className="text-[1.45rem] font-black leading-none text-white md:text-[1.7rem]">{stat.value}</div>
                        <div className="mt-1.5 text-[0.58rem] font-medium leading-snug text-blue-100/90 md:text-[0.68rem]">{stat.label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1320px] px-4 py-8 md:px-8 md:py-12">
        <div className="rounded-[18px] border border-slate-200 bg-white px-3 py-6 shadow-sm md:px-6 md:py-8">
          <div className="mb-7 text-center">
            <h2 className="text-[1.75rem] font-black tracking-tight text-[#0a2d5c] md:text-[2.3rem]">Your Journey With N-Skill</h2>
          </div>

          <div className="grid items-start gap-4 md:grid-cols-6">
            {[
              { no: "01", title: "Skill Training", desc: "Industry oriented\npractical training", icon: BookOpenText },
              { no: "02", title: "Skill Assessment", desc: "Evaluate your\ntechnical knowledge", icon: ClipboardCheck },
              { no: "03", title: "Resume Preparation", desc: "Create an industry\nready resume", icon: FileText },
              { no: "04", title: "Interview Preparation", desc: "Technical & HR\ninterview training", icon: UserCheck },
              { no: "05", title: "Interview Opportunity", desc: "Connect with top\nrecruiters", icon: BriefcaseBusiness },
              { no: "06", title: "Career Support", desc: "Continuous support\ntill you get placed", icon: Handshake },
            ].map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.no} className="flex items-center justify-center">
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="flex flex-col items-center text-center">
                      <div className="flex h-[62px] w-[62px] items-center justify-center rounded-full border-[2px] border-[#0a2d5c] bg-white text-[#0a2d5c] shadow-sm md:h-[72px] md:w-[72px]">
                        <Icon className="h-6 w-6 md:h-7 md:w-7" />
                      </div>

                      <div className="mt-3 text-[0.72rem] font-black uppercase tracking-wide text-[#ff8c2a] md:text-[0.78rem]">{step.no}</div>
                      <div className="mt-1 text-[0.8rem] font-black leading-tight text-[#0a2d5c] md:text-[0.92rem]">{step.title}</div>
                      <div className="mt-1 max-w-[150px] whitespace-pre-line text-[0.65rem] font-medium leading-relaxed text-slate-500 md:text-[0.72rem]">{step.desc}</div>
                    </div>

                    {index < 5 && (
                      <div className="hidden md:block">
                        <ArrowRight className="h-5 w-5 text-[#ff8c2a]" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1320px] px-4 pb-10 md:px-8 md:pb-14">
        <div className="mb-5">
          <h2 className="text-[1.65rem] font-black tracking-tight text-[#0a2d5c] md:text-[2.2rem]">Latest Job Opportunities</h2>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr_0.8fr]">
          <div className="rounded-[14px] border border-slate-200 bg-white p-3 shadow-sm md:p-4">
            <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_0.8fr] gap-3 border-b border-slate-200 pb-3 text-[0.72rem] font-black uppercase tracking-wide text-slate-500 md:text-[0.8rem]">
              <span>Job Role</span>
              <span>Industry</span>
              <span>Location</span>
              <span>Experience</span>
              <span>Salary</span>
            </div>

            {displayJobs.map((job, index) => (
              <div
                key={`${job.title}-${index}`}
                className={`grid grid-cols-[1.5fr_1fr_1fr_1fr_0.8fr] gap-3 py-3 text-[0.78rem] text-slate-700 md:text-[0.86rem] ${index !== displayJobs.length - 1 ? "border-b border-slate-100" : ""}`}
              >
                <span className="font-semibold text-slate-700">{job.title}</span>
                <span>{job.company}</span>
                <span>{job.location}</span>
                <span>{job.experience}</span>
                <span className="font-semibold text-slate-700">{job.salary}</span>
              </div>
            ))}

            <div className="mt-4">
              <button
                onClick={() => router.push("/placements/register")}
                className="rounded-xl border border-[#2a5fd6] bg-white px-6 py-3 text-sm font-black uppercase tracking-wide text-[#2a5fd6] shadow-sm transition hover:bg-blue-50"
              >
                View All Jobs
              </button>
            </div>
          </div>

          <div className="rounded-[14px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 text-[1.5rem] font-black leading-tight text-[#0a2d5c] md:text-[1.8rem]">Create Your Career Profile</div>
            <ul className="space-y-2 text-sm text-slate-600 md:text-[0.9rem]">
              <li className="flex gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-[#ff8c2a]" /> Register your profile and get recommended jobs that match your skills.</li>
              <li className="flex gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-[#ff8c2a]" /> Get relevant job recommendations.</li>
              <li className="flex gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-[#ff8c2a]" /> Apply to jobs in one click.</li>
              <li className="flex gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-[#ff8c2a]" /> Track interview calls & status.</li>
              <li className="flex gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-[#ff8c2a]" /> 100% Free Placement Support.</li>
            </ul>

            <button className="mt-5 w-full rounded-xl bg-[#ff8c2a] px-4 py-3 text-sm font-black uppercase tracking-wide text-white shadow-lg shadow-orange-200 transition hover:bg-[#ef7f15]">
              Create Profile Now
            </button>
            <div className="mt-3 text-center text-[0.75rem] text-slate-500">Already have an account? <span className="font-bold text-[#0a2d5c]">Login</span></div>
          </div>

          <div className="rounded-[14px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 text-[1.2rem] font-black leading-tight text-[#0a2d5c] md:text-[1.5rem]">Find Jobs on the Go!</div>
            <p className="text-sm text-slate-600">Scan the QR code to access recommended jobs.</p>
            <div className="mt-4 flex justify-center">
              <a
                href="/placements/recommended-jobs"
                target="_blank"
                rel="noreferrer"
                className="flex h-[140px] w-[140px] items-center justify-center rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:shadow-md"
              >
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent("https://nskillindia.com/placements/recommended-jobs")}`}
                  alt="QR Code"
                  className="h-full w-full object-contain"
                />
              </a>
            </div>
            <a
              href="/placements/recommended-jobs"
              className="mt-5 block w-full rounded-xl border border-[#2a5fd6] bg-white px-4 py-3 text-center text-sm font-black uppercase tracking-wide text-[#2a5fd6] shadow-sm transition hover:bg-blue-50"
            >
              Scan Me
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1320px] px-4 pb-14 md:px-8">
        {partners.length > 0 && (
          <div className="bg-white py-6">
            <div className="mb-4 text-center">
              <h2 className="text-[1.8rem] font-black text-[#0a2d5c] md:text-[2.2rem]">Our Hiring Partners</h2>
            </div>

            <div className="overflow-hidden">
              <div className="flex w-max animate-scroll-left gap-3 md:gap-5 px-1">
                {[...partners, ...partners, ...partners].map((partner, i) => {
                  const inner = (
                    <div className="flex h-[92px] w-[170px] items-center justify-center rounded-[12px] border border-slate-200 bg-white shadow-sm md:h-[100px] md:w-[190px]">
                      <img
                        src={partner.company_logo}
                        alt={partner.company_name}
                        className="max-h-[42px] max-w-[110px] object-contain md:max-h-[48px] md:max-w-[130px]"
                        title={partner.company_name}
                      />
                    </div>
                  );

                  return partner.website_url ? (
                    <a key={`partner-row-2-${partner.id}-${i}`} href={partner.website_url} target="_blank" rel="noreferrer" className="block shrink-0">
                      {inner}
                    </a>
                  ) : (
                    <div key={`partner-row-2-${partner.id}-${i}`} className="shrink-0">{inner}</div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mx-auto max-w-[1320px] px-4 pb-10 md:px-8 md:pb-14">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-[18px] border border-[#dfe8f4] bg-white p-4 md:p-5">
            <h3 className="mb-5 text-[2rem] font-black leading-none tracking-[-0.04em] text-[#0a2d5c] md:text-[2.2rem]">
              Why Recruiters Choose N-Skill Candidates?
            </h3>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {[
                { title: "Industry\nReady Skills", icon: BookOpenText },
                { title: "Hands-on\nTraining", icon: BriefcaseBusiness },
                { title: "Strong Technical\nKnowledge", icon: GraduationCap },
                { title: "Discipline &\nWork Ethic", icon: ClipboardCheck },
                { title: "Better\nRetention", icon: Handshake },
              ].map(({ title, icon: Icon }) => (
                <div key={title} className="flex flex-col items-center rounded-[14px] border border-slate-200 bg-white p-3 text-center shadow-sm">
                  <div className="mb-3 flex h-[52px] w-[52px] items-center justify-center rounded-full border border-[#dfe8f4] bg-[#f6f9ff] text-[#0a2d5c]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="whitespace-pre-line text-[0.82rem] font-semibold leading-tight text-[#0a2d5c] md:text-[0.9rem]">
                    {title}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-[18px] border border-[#dfe8f4] bg-white shadow-sm">
            <div className="grid h-full gap-0 md:grid-cols-[1fr_0.8fr]">
              <div className="flex flex-col justify-center p-5 md:p-6">
                <h3 className="mb-3 text-[2rem] font-black leading-none tracking-[-0.04em] text-[#0a2d5c] md:text-[2.3rem]">Are You Hiring?</h3>
                <p className="mb-4 max-w-[320px] text-[0.98rem] leading-relaxed text-slate-600">
                  Post your job requirements and connect with our skilled candidates.
                </p>

                <ul className="space-y-2 text-[0.96rem] font-medium text-slate-700">
                  {[
                    "Verified & Trained Candidates",
                    "Bulk Hiring Support",
                    "Customized Training",
                    "Pre-Screening Assistance",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-1 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#0a2d5c] text-[0.7rem] text-white">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <button className="mt-5 inline-flex w-fit items-center justify-center rounded-xl bg-[#0a2d5c] px-5 py-3 text-[0.78rem] font-black uppercase tracking-[0.08em] text-white shadow-lg shadow-blue-200 transition hover:bg-[#0b3670]">
                  Post Your Requirement
                </button>
              </div>

              <div className="relative min-h-[260px] bg-[#eef5ff]">
                <img
                  src="/placement/thub.png"
                  alt="Hiring candidate"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#eaf3ff]/10 via-transparent to-[#0b2d5e]/10" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="placement-faqs" className="mx-auto max-w-[1320px] px-4 pb-14 md:px-8">
        <div className="rounded-[16px] border border-[#dfe8f4] bg-white px-4 py-4 shadow-[0_8px_20px_rgba(15,23,42,0.03)] md:px-6 md:py-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-[1.8rem] font-black leading-tight text-[#0a2d5c] md:text-[2.2rem]">Placement Support - FAQs</h2>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {faqItems.map((item, index) => (
              <div
                key={item}
                className="flex min-h-[74px] items-center justify-between rounded-[12px] border border-slate-200 bg-white px-4 py-3 text-left shadow-sm transition hover:border-[#2a5fd6] hover:shadow-md"
              >
                <p className="pr-3 text-[0.9rem] font-medium text-slate-700 md:text-[0.95rem]">{item}</p>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200 text-xl font-light text-slate-400">+</span>
              </div>
            ))}
          </div>

          <div className="mt-5 flex justify-center">
            <a
              href="#placement-faqs"
              className="inline-flex items-center gap-2 text-[1rem] font-black uppercase tracking-[0.04em] text-[#ff8c2a] transition hover:text-[#e67a18]"
            >
              View All FAQs
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
