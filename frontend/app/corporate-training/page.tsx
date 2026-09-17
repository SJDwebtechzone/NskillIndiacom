"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  Building2,
  ClipboardCheck,
  ClipboardList,
  GraduationCap,
  Handshake,
  Headphones,
  MonitorSmartphone,
  Phone,
  Presentation,
  Settings,
  ShieldCheck,
  Target,
  Users,
  UserRoundCog,
  Wrench,
} from "lucide-react";

const solutions = [
  ["Technical Skill Training", Wrench, "text-[#123a89]", ["Welding", "Electrical", "HVAC", "Plumbing & MEP", "Equipment Operation", "Maintenance"]],
  ["Safety Training", ShieldCheck, "text-emerald-600", ["Industrial Safety", "Fire Safety", "Electrical Safety", "PPE Training", "Workplace Safety", "Emergency Response"]],
  ["Quality & Productivity", Award, "text-orange-500", ["Quality Control", "5S & Lean", "TPM", "Root Cause Analysis", "Problem Solving", "Continuous Improvement"]],
  ["Leadership & Behavioural", Users, "text-violet-600", ["Leadership Development", "Communication Skills", "Team Building", "Supervisory Skills", "Conflict Management", "Time Management"]],
  ["Maintenance & Engineering", Settings, "text-[#123a89]", ["Preventive Maintenance", "Electrical Maintenance", "HVAC Maintenance", "Mechanical Maintenance", "Troubleshooting", "Reliability Improvement"]],
  ["Standards & Management Systems", ClipboardList, "text-teal-600", ["ISO 9001", "ISO 14001", "ISO 45001", "IATF 16949", "QMS / EMS / OHSMS"]],
] as const;

const benefits = [
  [Users, "Industry Experienced Trainers"],
  [Wrench, "Hands-on Practical Training"],
  [Settings, "Customized Programs"],
  [Target, "Improved Productivity"],
  [ClipboardCheck, "Assessment & Certification"],
  [Headphones, "End-to-End Support"],
] as const;

const formats = [
  [Presentation, "On-site Training"],
  [Building2, "N-Skill Centre Training"],
  [Users, "Customized Training"],
  [ClipboardCheck, "Assessment Based Training"],
  [Award, "Train-the-Trainer"],
  [MonitorSmartphone, "Online / Hybrid"],
] as const;

const industries = [
  ["Automotive", "/Corporate/Industries/automotive.png"],
  ["Manufacturing", "/Corporate/Industries/manufacturing.png"],
  ["Construction", "/Corporate/Industries/construction.png"],
  ["Oil & Gas", "/Corporate/Industries/oil&gass.png"],
  ["Power & Energy", "/Corporate/Industries/power&energy.png"],
  ["HVAC & Facilities", "/Infrastructure/HAVC.png"],
  ["Infrastructure", "/Corporate/Industries/infrastructure.png"],
  ["Steel", "/Corporate/Industries/Steel.png"],
] as const;

const programs = [
  "Welding Skill Development (SMAW, GMAW, GTAW)",
  "Industrial Electrical & Control Systems",
  "HVAC Maintenance & Troubleshooting",
  "Pump, Valve & Piping Systems",
  "Quality Control & Inspection",
  "5S, Kaizen & Lean Manufacturing",
  "Workplace Safety & Accident Prevention",
  "Fire Safety & Emergency Response",
  "Leadership & Team Building",
  "Supervisory Skills Development",
];

const trainingProcess = [
  [Users, "Understand Your Needs"],
  [ClipboardList, "Assess Skill Gaps"],
  [Target, "Design Training Plan"],
  [Presentation, "Deliver Training"],
  [ClipboardCheck, "Evaluate & Assess"],
  [BadgeCheck, "Certification & Report"],
  [Headphones, "Follow-up & Support"],
] as const;

const stats = [
  [Building2, "15+", "Years of Experience"],
  [Users, "250+", "Corporate Programs"],
  [GraduationCap, "10,000+", "Employees Trained"],
  [Handshake, "150+", "Industrial Clients"],
  [UserRoundCog, "25+", "Expert Trainers"],
] as const;

interface SuccessStory {
  id?: number | string;
  name: string;
  company?: string;
  program: string;
  quote: string;
  rating?: number;
}

const fallbackStories: SuccessStory[] = [
  {
    name: "Karthik R.",
    company: "TVS Motor Company",
    program: "Skill Development Training",
    quote: "Hands-on practical training significantly improved work quality and safety compliance for our workforce.",
    rating: 5,
  },
  {
    name: "Suresh M.",
    company: "Larsen & Toubro",
    program: "Welding & Safety Training",
    quote: "Industry-standard lab facilities and expert trainers provided top-tier technical skill elevation.",
    rating: 5,
  },
  {
    name: "Imran A.",
    company: "Saint-Gobain",
    program: "Industrial Electrical & Maintenance",
    quote: "Customized training modules and practical troubleshooting gave our technicians immense operational confidence.",
    rating: 5,
  },
];

const Title = ({ children }: { children: React.ReactNode }) => (
  <h2 className="mb-5 text-[1.3rem] font-black uppercase leading-tight tracking-tight text-[#0a2d5c] md:text-[1.6rem]">
    {children}
  </h2>
);

export default function CorporateTrainingPage() {
  const [partners, setPartners] = useState<Array<{ company_name?: string; company_logo?: string; logo_url?: string }>>([]);
  const [stories, setStories] = useState<SuccessStory[]>(fallbackStories);

  useEffect(() => {
    const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    fetch(`${api}/api/partners`)
      .then((response) => (response.ok ? response.json() : []))
      .then((data) => setPartners(Array.isArray(data) ? data : []))
      .catch(() => setPartners([]));

    const fetchStories = async () => {
      try {
        const res = await fetch(`${api}/api/placement-feedback/testimonials/approved`);
        if (res.ok) {
          const data = await res.json();
          if (data.testimonials && Array.isArray(data.testimonials) && data.testimonials.length > 0) {
            const mapped: SuccessStory[] = data.testimonials.slice(0, 3).map((t: any) => ({
              id: t.id,
              name: t.full_name || "Trainee",
              company: t.company_name || "Corporate Client",
              program: t.course_name || "Skill Training",
              quote: t.testimonial || "",
              rating: t.rating || 5,
            }));
            setStories(mapped);
          }
        }
      } catch (err) {
        console.error("Error fetching corporate success stories:", err);
      }
    };

    fetchStories();
  }, []);

  return (
    <main className="corporate-training-page bg-white pb-10 font-sans text-slate-700">
      <style>{`
        .corporate-training-page > div > section + section { margin-top: 5.5rem !important; }
        .corporate-training-page h2, .corporate-training-page h3 { font-family: var(--font-heading); font-weight: 900; }
        @media (max-width: 768px) { .corporate-training-page > div > section + section { margin-top: 4rem !important; } }
      `}</style>

      {/* ─── Hero Banner ────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[315px] overflow-hidden bg-[#061f4d]">
        <Image
          src="/Corporate/Corporatebanner.png"
          alt="Corporate technical training session"
          fill
          priority
          className="object-cover object-top"
          sizes="100vw"
        />
        <div className="relative z-10 mx-auto flex min-h-[315px] max-w-[1420px] items-center px-6 py-10 md:px-10">
          <div className="max-w-[650px] text-white">
            <h1 className="!m-0 text-[40px] font-black leading-[1.12] tracking-tight !text-white md:text-[46px]">
              <span>Corporate Training That<br />Builds Skills, Safety &amp;</span><br />
              <span className="text-orange-500">Productivity</span>
            </h1>
            <p className="mt-4 max-w-[540px] text-sm font-medium leading-relaxed !text-white/90 md:text-base">
              Customized training solutions to upskill your workforce, improve performance and drive organizational excellence.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a href="#request" className="whitespace-nowrap rounded-md bg-orange-500 px-5 py-3 text-xs font-black uppercase text-white transition hover:bg-orange-600">
                Request Training Proposal
              </a>
              <a href="tel:+919884209774" className="inline-flex items-center gap-2 whitespace-nowrap rounded-md border border-white/70 px-5 py-3 text-xs font-black uppercase text-white transition hover:bg-white/10">
                <Phone size={14} /> Talk to Our Training Team
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats Strip ────────────────────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto -mt-5 w-[calc(100%-24px)] max-w-[1380px] rounded-2xl bg-white shadow-lg border border-slate-200/80 overflow-hidden">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
          {stats.map(([Icon, number, label]) => (
            <div key={label} className="flex items-center justify-center gap-3.5 px-4 py-4 md:py-5">
              <Icon size={32} strokeWidth={1.8} className="text-[#0a2d5c] shrink-0" />
              <div>
                <b className="block text-xl font-black leading-none text-[#0a2d5c] md:text-2xl">{number}</b>
                <span className="mt-1 block text-xs font-medium text-slate-500 whitespace-nowrap">{label}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Corporate Training Intro Banner ─────────────────────────────────── */}
      <div className="mx-auto max-w-[1380px] px-4 pt-6 sm:px-6">
        <div className="bg-gradient-to-r from-blue-50/80 via-white to-orange-50/60 border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 sm:gap-6">
            <div className="w-12 h-12 rounded-xl bg-[#0a2d5c] text-[#f97316] flex items-center justify-center shrink-0 shadow-md">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-base sm:text-lg font-black text-[#0a2d5c] mb-2 uppercase tracking-wide">
                Corporate Training &amp; Workforce Advancement
              </h3>
              <p className="text-slate-700 text-sm sm:text-[15px] font-normal leading-relaxed text-justify">
                Continuous employee training is essential. It enables your employees to advance their knowledge. Spending on your employees is very important to your company. You can improve on the basic skills gained in corporate training. This improves your business performance. When employees improve on what they learned, they can improve in their output. Your employees reflect on your business. How skilled they are is shown in your business output. Employees can bring more to the table if they know more. Invest in your employees&apos; knowledge. In turn, they will do the same for their work. Moreover, you and your company will be the ones reaping the fruits.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1380px] px-4 pt-6 sm:px-6">
        {/* ─── Solutions ──────────────────────────────────────────────────────── */}
        <section>
          <div className="mb-6 text-center">
            <h2 className="text-xl font-black uppercase tracking-tight text-[#0b1f3a] md:text-2xl">
              OUR CORPORATE TRAINING SOLUTIONS
            </h2>
            <div className="mx-auto mt-2 h-1 w-9 bg-[#f59e0b]" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            {solutions.map(([title, Icon, color, items]) => (
              <article key={title} className="rounded border border-slate-200 bg-white p-5 shadow-sm">
                <Icon size={40} className={color} />
                <h3 className="mt-4 min-h-12 text-sm font-extrabold leading-tight !text-slate-800 md:text-base">{title}</h3>
                <ul className="mt-4 space-y-2 text-xs font-medium leading-tight text-slate-600 md:text-[13px]">
                  {items.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
                <a href="#programs" className="mt-5 inline-flex items-center gap-1 text-xs font-extrabold text-[#123a89] md:text-[13px]">
                  View Programs <ArrowRight size={15} className="text-orange-500" />
                </a>
              </article>
            ))}
          </div>
        </section>

        {/* ─── Why Partner & Formats ──────────────────────────────────────────── */}
        <section className="mt-7 grid gap-6 lg:grid-cols-2">
          <div>
            <Title>WHY PARTNER WITH N-SKILL?</Title>
            <div className="grid grid-cols-3 divide-x divide-slate-200 rounded border border-slate-200">
              {benefits.map(([Icon, label]) => (
                <div key={label} className="flex min-h-36 flex-col items-center justify-center px-4 text-center">
                  <Icon size={38} className="text-[#123a89]" />
                  <span className="mt-3 text-xs font-bold leading-snug text-slate-600 md:text-sm">{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <Title>TRAINING FORMATS</Title>
            <div className="grid grid-cols-3 divide-x divide-slate-200 rounded border border-slate-200">
              {formats.map(([Icon, label]) => (
                <div key={label} className="flex min-h-36 flex-col items-center justify-center px-4 text-center">
                  <Icon size={38} className="text-[#123a89]" />
                  <span className="mt-3 text-xs font-bold leading-snug text-slate-600 md:text-sm">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Process ────────────────────────────────────────────────────────── */}
        <section className="mt-7">
          <Title>OUR TRAINING PROCESS</Title>
          <div className="flex items-start justify-between gap-4 overflow-x-auto rounded border border-slate-100 px-5 py-6">
            {trainingProcess.map(([Icon, label], index) => (
              <div key={label} className="flex min-w-[155px] items-center gap-4">
                <div className="flex flex-col items-center text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#9aa9c9] text-[#123a89]">
                    <Icon size={28} />
                  </span>
                  <b className="mt-2 text-base font-extrabold text-orange-500">{String(index + 1).padStart(2, "0")}</b>
                  <span className="text-sm font-bold leading-snug text-slate-600 md:text-base">{label}</span>
                </div>
                {index < trainingProcess.length - 1 && <ArrowRight size={22} className="shrink-0 text-[#123a89]" />}
              </div>
            ))}
          </div>
        </section>

        {/* ─── Industries, Programs & Request Form ────────────────────────────── */}
        <section className="mt-7 grid gap-6 lg:grid-cols-[1.05fr_1.1fr_1.3fr]">
          <div>
            <Title>INDUSTRIES WE SERVE</Title>
            <div className="grid grid-cols-2 gap-3">
              {industries.map(([name, src]) => (
                <div key={name} className="overflow-hidden rounded border border-slate-200 bg-white text-center shadow-sm">
                  <div className="relative h-24">
                    <Image src={src} alt={name} fill className="object-cover" sizes="220px" />
                  </div>
                  <span className="block py-2 text-xs font-bold text-slate-700">{name}</span>
                </div>
              ))}
            </div>
          </div>
          <div id="programs">
            <Title>POPULAR CORPORATE PROGRAMS</Title>
            <ul className="divide-y divide-slate-200">
              {programs.map((program) => (
                <li key={program}>
                  <a href="#request" className="flex items-center justify-between py-3 text-xs font-bold leading-snug text-slate-600 md:text-sm">
                    {program}
                    <ArrowRight size={16} className="ml-2 shrink-0 text-orange-500" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <RequestForm />
        </section>

        {/* ─── Success Stories & Experts ───────────────────────────────────────── */}
        <section className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[1.3rem] font-black uppercase leading-tight tracking-tight text-[#0a2d5c] md:text-[1.6rem]">
                SUCCESS STORIES
              </h2>
              <a href="/placements" className="text-xs font-bold text-orange-500 hover:text-orange-600">
                View All →
              </a>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {stories.map((story, idx) => (
                <article
                  key={story.id || idx}
                  className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 shrink-0 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-sm font-black text-[#0a2d5c]">
                        {(story.name || "S").charAt(0).toUpperCase()}
                      </div>
                      <div className="overflow-hidden">
                        <h3 className="text-sm font-black text-slate-800 truncate">{story.name}</h3>
                        <p className="text-[11px] font-semibold text-slate-500 truncate">{story.company}</p>
                      </div>
                    </div>

                    <div className="flex text-orange-500 text-sm mb-2">
                      {Array.from({ length: story.rating || 5 }).map((_, i) => (
                        <span key={i}>★</span>
                      ))}
                    </div>

                    <p className="text-xs leading-relaxed text-slate-600 italic line-clamp-3">
                      &quot;{story.quote}&quot;
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-[#123a89] block truncate">
                      {story.program}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div>
            <Title>OUR TRAINING EXPERTS</Title>
            {[
              ["/images/team/sivasankar.jpeg", "V. P. Sivasankar", "Managing Director"],
              ["/images/team/sriram.jpg", "Senior Technical Trainer", "Welding & NDT Expert"],
            ].map(([src, name, role]) => (
              <div className="mb-5 flex items-center gap-4" key={name}>
                <Image src={src} alt={name} width={60} height={60} className="h-14 w-14 rounded-full object-cover" />
                <p className="text-sm font-medium leading-relaxed text-slate-500">
                  <b className="text-base font-extrabold text-slate-800">{name}</b>
                  <br />
                  {role}
                  <br />
                  <span className="text-orange-500">10+ Years Industry Experience</span>
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Clients ────────────────────────────────────────────────────────── */}
        {partners.length > 0 && (
          <section className="mt-8 border-t border-slate-100 bg-slate-50/70 px-1 py-6">
            <div className="mb-4 flex items-center gap-3">
              <Title>OUR VALUED CLIENTS</Title>
              <a href="/placements" className="-mt-4 text-xs font-bold text-orange-500">
                View All Clients <ArrowRight size={14} className="inline" />
              </a>
            </div>
            <div className="overflow-hidden">
              <div className="flex w-max gap-4 animate-scroll-left pause-on-hover">
                {[...partners, ...partners].map((partner, index) => (
                  <div
                    key={`${partner.company_name || "client"}-${index}`}
                    className="flex h-24 w-44 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 shadow-sm"
                  >
                    <img
                      src={partner.company_logo || partner.logo_url || "/logo.png"}
                      alt={partner.company_name || "Corporate client"}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function RequestForm() {
  const fields = [
    ["Company Name *", "Contact Person *"],
    ["Designation *", "Email *"],
    ["Mobile Number *", "Industry *"],
    ["Number of Employees *", "Training Category *"],
  ];
  const input = "h-10 rounded border border-[#5470a8] bg-white px-3 text-xs text-slate-700 outline-none placeholder:text-slate-500";

  return (
    <div id="request" className="rounded bg-[#062464] p-5 shadow-md">
      <h2 className="mb-4 text-lg font-extrabold !text-white md:text-xl">
        REQUEST CORPORATE TRAINING PROPOSAL
      </h2>
      <form onSubmit={(event) => event.preventDefault()} className="space-y-2.5">
        {fields.map((row) => (
          <div key={row[0]} className="grid grid-cols-2 gap-2">
            {row.map((placeholder) => (
              <input key={placeholder} placeholder={placeholder} className={input} />
            ))}
          </div>
        ))}
        <input placeholder="Training Topic / Subject *" className={`${input} w-full`} />
        <div className="grid grid-cols-2 gap-2">
          <input placeholder="Training Location *" className={input} />
          <input type="date" aria-label="Preferred training date" className={input} />
        </div>
        <input placeholder="Number of Participants *" className={`${input} w-full`} />
        <textarea
          placeholder="Additional Requirements / Message"
          rows={4}
          className="w-full rounded border border-[#5470a8] bg-white p-3 text-xs text-slate-700 placeholder:text-slate-500"
        />
        <button className="w-full rounded bg-orange-500 py-3 text-sm font-extrabold text-white hover:bg-orange-600 transition">
          SUBMIT REQUEST
        </button>
        <p className="text-center text-xs !text-blue-100">We will get back to you within 24 hours!</p>
      </form>
    </div>
  );
}
