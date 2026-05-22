"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { X, User, Mail, Phone, BookOpen, Send, CheckCircle2, ChevronRight, Loader2, Rocket, BadgeCheck, MessageSquare, CalendarDays, Users } from "lucide-react";
import EnquiryModal from "../components/EnquiryModal";
import AnimatedCalendarBanner from "../components/AnimatedCalendarBanner";

type EventType = "batch1" | "batch2" | "both";
type Week      = "First" | "Second" | "Third" | "Fourth";

interface CourseEvent {
  id:          number;
  title:       string;
  description: string;
  course_name: string;
  start_date:  string;
  end_date:    string;
  event_type:  EventType;
}

interface ColorPalette {
  bgColor:     string;
  borderColor: string;
  dotColor:    string;
  solidColor:  string;
}

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}/api/course_events`;

const MONTHS_FY: { month: string; year: number }[] = [
  { month: "April",     year: 2026 },
  { month: "May",       year: 2026 },
  { month: "June",      year: 2026 },
  { month: "July",      year: 2026 },
  { month: "August",    year: 2026 },
  { month: "September", year: 2026 },
  { month: "October",   year: 2026 },
  { month: "November",  year: 2026 },
  { month: "December",  year: 2026 },
  { month: "January",   year: 2027 },
  { month: "February",  year: 2027 },
  { month: "March",     year: 2027 },
];

const WEEK_ORDER: Week[] = ["First", "Second", "Third", "Fourth"];
const WEEK_LABEL: Record<Week, string> = {
  First: "1st Week", Second: "2nd Week", Third: "3rd Week", Fourth: "4th Week",
};
const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const COLOR_PALETTES: ColorPalette[] = [
  { bgColor: "rgba(59,130,246,0.1)",  borderColor: "rgba(59,130,246,0.25)",  dotColor: "#3b82f6", solidColor: "#1d4ed8" },
  { bgColor: "rgba(16,185,129,0.1)",  borderColor: "rgba(16,185,129,0.25)",  dotColor: "#10b981", solidColor: "#059669" },
  { bgColor: "rgba(245,158,11,0.1)",  borderColor: "rgba(245,158,11,0.25)",  dotColor: "#f59e0b", solidColor: "#d97706" },
  { bgColor: "rgba(139,92,246,0.1)",  borderColor: "rgba(139,92,246,0.25)",  dotColor: "#8b5cf6", solidColor: "#7c3aed" },
  { bgColor: "rgba(239,68,68,0.1)",   borderColor: "rgba(239,68,68,0.25)",   dotColor: "#ef4444", solidColor: "#dc2626" },
  { bgColor: "rgba(236,72,153,0.1)",  borderColor: "rgba(236,72,153,0.25)",  dotColor: "#ec4899", solidColor: "#db2777" },
  { bgColor: "rgba(20,184,166,0.1)",  borderColor: "rgba(20,184,166,0.25)",  dotColor: "#14b8a6", solidColor: "#0d9488" },
  { bgColor: "rgba(249,115,22,0.1)",  borderColor: "rgba(249,115,22,0.25)",  dotColor: "#f97316", solidColor: "#ea580c" },
];

function getCourseColor(courseName: string, allCourseNames: string[]): ColorPalette {
  const idx = allCourseNames.indexOf(courseName);
  return COLOR_PALETTES[(idx < 0 ? 0 : idx) % COLOR_PALETTES.length];
}

function getDaysInMonth(month: string, year: number): number {
  return new Date(year, new Date(`${month} 1, ${year}`).getMonth() + 1, 0).getDate();
}

function getFirstDayOfMonth(month: string, year: number): number {
  return new Date(year, new Date(`${month} 1, ${year}`).getMonth(), 1).getDay();
}

function isToday(day: number, month: string, year: number): boolean {
  const t = new Date();
  return t.getDate() === day &&
    t.getMonth() === new Date(`${month} 1, ${year}`).getMonth() &&
    t.getFullYear() === year;
}

function dateToWeek(dateStr: string): Week {
  const day = parseInt(dateStr.split("-")[2], 10);
  if (day <= 7)  return "First";
  if (day <= 14) return "Second";
  if (day <= 21) return "Third";
  return "Fourth";
}

function dateToMonthYear(dateStr: string): { month: string; year: number } {
  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const parts = dateStr.split("-");
  return { year: parseInt(parts[0], 10), month: monthNames[parseInt(parts[1], 10) - 1] };
}

function buildDateMap(events: CourseEvent[], totalDays: number): Record<number, CourseEvent[]> {
  const map: Record<number, CourseEvent[]> = {};
  events.forEach((ev) => {
    const wi = WEEK_ORDER.indexOf(dateToWeek(ev.start_date));
    if (wi < 0) return;
    const start = wi * 7 + 1;
    const end   = wi === 3 ? totalDays : Math.min(start + 6, totalDays);
    for (let d = start; d <= end; d++) {
      if (!map[d]) map[d] = [];
      map[d].push(ev);
    }
  });
  return map;
}

async function fetchEvents(): Promise<CourseEvent[]> {
  const res = await fetch(API_BASE, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch events");
  return res.json();
}

export default function StudentCalendar() {
  const [events,       setEvents]       = useState<CourseEvent[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [monthIdx,     setMonthIdx]     = useState(0);
  const [selectedDay,  setSelectedDay]  = useState<number | null>(null);
  const [filterCourse, setFilterCourse] = useState<string>("all");
  const [filterBatch,  setFilterBatch]  = useState<"all" | "batch1" | "batch2">("all");
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [submittedDemo, setSubmittedDemo] = useState(false);
  const [demoForm, setDemoForm] = useState({
    name: "", address: "", email: "", phone: "", date: "", time: "", course_id: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadEvents = useCallback(async () => {
    setLoading(true); setError("");
    try { setEvents(await fetchEvents()); }
    catch (e: any) { setError(e.message ?? "Failed to load"); }
    finally { setLoading(false); }
  }, []);

  const handleDemoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(demoForm),
      });
      if (!res.ok) throw new Error("Failed to book demo");
      setSubmittedDemo(true);
      setDemoForm({ name: "", address: "", email: "", phone: "", date: "", time: "", course_id: "" });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => { loadEvents(); }, [loadEvents]);
  useEffect(() => { setSelectedDay(null); }, [monthIdx, filterCourse, filterBatch]);

  // Handle modal close
  const closeDemoModal = () => {
    setShowDemoModal(false);
    setSubmittedDemo(false);
  };

  const { month, year } = MONTHS_FY[monthIdx];

  const monthEvents = events.filter((e) => {
    const { month: em, year: ey } = dateToMonthYear(e.start_date);
    return em === month && ey === year;
  });

  const filteredEvents = monthEvents.filter((e) => {
    const courseMatch = filterCourse === "all" || e.course_name === filterCourse;
    const batchMatch  = filterBatch === "all" || e.event_type === filterBatch || e.event_type === "both";
    return courseMatch && batchMatch;
  });

  const totalDays        = getDaysInMonth(month, year);
  const startDay         = getFirstDayOfMonth(month, year);
  const dateMap          = buildDateMap(filteredEvents, totalDays);
  const allCourses       = [...new Set(events.map((e) => e.course_name))].sort();
  const monthCourseNames = [...new Set(monthEvents.map((e) => e.course_name))];
  const batch1Count      = monthEvents.filter((e) => e.event_type === "batch1" || e.event_type === "both").length;
  const batch2Count      = monthEvents.filter((e) => e.event_type === "batch2" || e.event_type === "both").length;

  return (
    <div className="min-h-screen bg-slate-50">
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.25s ease; }
        .cal-cell {
          border-bottom: 1px solid #e2e8f0;
          border-right: 1px solid #e2e8f0;
          min-height: 110px;
          padding: 10px;
          transition: background 0.15s;
        }
        .cal-cell:hover { background: #f8fafc !important; }
      `}</style>

      {/* ── Page Banner ── */}
      <div className="relative h-[280px] md:h-[400px] flex items-center overflow-hidden bg-white mb-8">
        <AnimatedCalendarBanner />
        <div className="absolute bottom-0 left-0 w-full h-1 bg-[#2563eb] z-20" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 w-full">
                  {/* Header Text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 bg-[#dbeafe] border border-[#bfdbfe] rounded-full px-4 py-1 mb-4 shadow-sm">
                <span className="text-[#2563eb] text-[11px] font-black tracking-widest uppercase">FY 2026–2027</span>
              </div>
              <h1 className="text-[#0f172a] text-4xl md:text-5xl font-black uppercase tracking-tight mb-3">
                Course Calendar
              </h1>
            </motion.div>

            {/* Month Navigator */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="flex items-center gap-4 bg-white rounded-2xl px-5 py-3 border border-slate-200 shadow-sm"
            >
              <button
                onClick={() => setMonthIdx((i) => Math.max(0, i - 1))}
                disabled={monthIdx === 0}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 transition disabled:opacity-40 text-white text-xl shadow-sm"
              >‹</button>
              <span className="min-w-[140px] text-center text-[17px] font-black text-[#0f172a]">{month} {year}</span>
              <button
                onClick={() => setMonthIdx((i) => Math.max(MONTHS_FY.length - 1, i + 1))}
                disabled={monthIdx === MONTHS_FY.length - 1}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 transition disabled:opacity-40 text-white text-xl shadow-sm"
              >›</button>
            </motion.div>
          </div>

          {/* Month Tabs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            className="flex gap-3 mt-12 overflow-x-auto scrollbar-hide pb-2 pt-1"
          >
            {MONTHS_FY.map(({ month: m, year: y }, i) => {
              const isActive = monthIdx === i;
              return (
                <button
                  key={i}
                  onClick={() => setMonthIdx(i)}
                  className={`flex-shrink-0 px-6 py-3 rounded-2xl text-[15px] font-bold transition-all shadow-sm ${
                    isActive
                      ? "bg-white text-[#0f172a] border-2 border-[#3b82f6] shadow-md shadow-blue-500/10 scale-105 transform -translate-y-1"
                      : "bg-[#e0e7ff]/60 text-[#0f172a] border border-[#c7d2fe] hover:bg-[#dbeafe] hover:-translate-y-0.5"
                  }`}
                >
                  {m.slice(0, 3)} '{String(y).slice(2)}
                </button>
              );
            })}
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {error && (
          <div className="mb-6 p-4 rounded-xl text-sm bg-red-50 border border-red-200 text-red-700">
            ⚠️ {error} — <button onClick={loadEvents} className="underline font-semibold">Retry</button>
          </div>
        )}

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Sessions",   value: monthEvents.length,      icon: <CalendarDays className="w-6 h-6 text-blue-600" />,   color: "text-blue-600",   iconBg: "bg-blue-100" },
            { label: "Courses Running",  value: monthCourseNames.length, icon: <BookOpen className="w-6 h-6 text-indigo-600" />,     color: "text-indigo-600", iconBg: "bg-indigo-100" },
            { label: "Batch 1 Sessions", value: batch1Count,             icon: <Users className="w-6 h-6 text-sky-600" />,           color: "text-sky-600",    iconBg: "bg-sky-100" },
            { label: "Batch 2 Sessions", value: batch2Count,             icon: <Users className="w-6 h-6 text-cyan-600" />,          color: "text-cyan-600",   iconBg: "bg-cyan-100" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${s.iconBg}`}>
                {s.icon}
              </div>
              <div className={`text-4xl font-black ${s.color} mb-1 leading-none`}>{s.value}</div>
              <div className="text-[17px] font-black text-[#0f172a]">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Filters + CTA ── */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          <div className="flex-1 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-600 mb-4">Filter by Batch</p>
            <div className="flex flex-wrap gap-2 mb-8">
              {(["all", "batch1", "batch2"] as const).map((b) => (
                <button
                  key={b}
                  onClick={() => setFilterBatch(b)}
                  className={`px-5 py-3 rounded-xl text-base font-bold transition-all border ${
                    filterBatch === b
                      ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                      : "bg-white text-slate-600 border-slate-200 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  {b === "all" ? "All Batches" : b === "batch1" ? "Batch 1" : "Batch 2"}
                </button>
              ))}
            </div>

            <p className="text-sm font-bold uppercase tracking-widest text-blue-600 mb-4">Filter by Course</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterCourse("all")}
                className={`px-5 py-3 rounded-xl text-base font-bold transition-all border ${
                  filterCourse === "all"
                    ? "bg-[#0b1f3a] text-white border-[#0b1f3a] shadow-md"
                    : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600"
                }`}
              >All Courses</button>
              {monthCourseNames.map((cname) => {
                const p = getCourseColor(cname, allCourses);
                const isActive = filterCourse === cname;
                return (
                  <button
                    key={cname}
                    onClick={() => setFilterCourse(filterCourse === cname ? "all" : cname)}
                    className="px-5 py-3 rounded-xl text-base font-bold transition-all border flex items-center gap-2 hover:shadow-md"
                    style={isActive ? {
                      background: p.solidColor, color: "#fff", borderColor: p.solidColor,
                      boxShadow: `0 4px 12px ${p.dotColor}40`,
                    } : {
                      background: "#fff", color: "#475569", borderColor: "#e2e8f0",
                    }}
                  >
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p.dotColor }} />
                    {cname}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="w-full lg:w-[360px] flex flex-col gap-4">
            <div className="flex-1 bg-white rounded-2xl p-8 text-slate-900 relative overflow-hidden shadow-sm border border-slate-200 group">
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-blue-50 rounded-full blur-2xl group-hover:scale-125 transition-transform"></div>
              <div className="relative z-10">
                <h3 className="text-2xl font-black mb-3 text-[#0b1f3a]">Join a Batch</h3>
                <p className="text-slate-600 text-[15px] mb-8 font-medium leading-relaxed">Have questions about our schedule or courses? Reach out to our team today.</p>
                <div className="flex flex-col gap-4">
                  <button 
                    onClick={() => setShowEnquiryModal(true)}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-base transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-2"
                  >
                    Enquire Now
                    <span className="text-xl leading-none">→</span>
                  </button>
                  <button 
                    onClick={() => setShowDemoModal(true)}
                    className="w-full py-4 bg-white hover:bg-blue-50 text-blue-700 hover:border-blue-200 rounded-xl font-black text-base transition-all border border-slate-200 active:scale-95"
                  >
                    Book a Free Demo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Demo Booking Modal ── */}
        {showDemoModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={closeDemoModal}>
            <div className="bg-white rounded-[40px] w-full max-w-[500px] max-h-[90vh] overflow-y-auto scrollbar-hide shadow-2xl relative animate-scaleUp" onClick={e => e.stopPropagation()}>
              
              {!submittedDemo ? (
                <>
                  {/* Modal Header */}
                  <div className="p-8 pb-4 flex items-center justify-between sticky top-0 bg-white z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0b1f3a] to-indigo-600 text-white flex items-center justify-center text-2xl shadow-lg shadow-[#0b1f3a]/30">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                      </div>
                      <div>
                        <h2 className="text-[22px] font-black text-[#111827] leading-tight">Book Your Free Demo</h2>
                        <p className="text-[13px] font-bold text-[#7c829c]">Reserve a slot with our expert counsellor</p>
                      </div>
                    </div>
                    <button 
                      onClick={closeDemoModal}
                      className="w-10 h-10 rounded-full bg-[#f6f7fb] flex items-center justify-center text-[#7c829c] hover:bg-[#eff1f6] hover:text-[#111827] transition-all"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  </div>

                  <form onSubmit={handleDemoSubmit} className="p-8 pt-0 space-y-6">
                    {/* Selected Course Display */}
                    <div className="bg-[#f5f3ff] p-4 rounded-2xl border border-[#ede9fe] flex items-center gap-3">
                      <span className="text-xl">📖</span>
                      <span className="text-[14px] font-black text-[#7c3aed] uppercase tracking-wide">
                        {filterCourse === "all" ? "General Demo (All Courses)" : filterCourse}
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-black text-[#7c829c] uppercase tracking-widest flex items-center gap-2">
                          👤 Full Name <span className="text-red-500">*</span>
                        </label>
                        <input 
                          required
                          type="text"
                          placeholder="Your full name"
                          className="w-full px-5 py-4 rounded-2xl bg-[#f6f7fb] border border-[#eff1f6] focus:border-blue-800 focus:bg-white transition-all outline-none text-[15px] font-bold"
                          value={demoForm.name}
                          onChange={e => setDemoForm({...demoForm, name: e.target.value})}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-black text-[#7c829c] uppercase tracking-widest flex items-center gap-2">
                          📍 Address
                        </label>
                        <input 
                          type="text"
                          placeholder="City / Area"
                          className="w-full px-5 py-4 rounded-2xl bg-[#f6f7fb] border border-[#eff1f6] focus:border-blue-800 focus:bg-white transition-all outline-none text-[15px] font-bold"
                          value={demoForm.address}
                          onChange={e => setDemoForm({...demoForm, address: e.target.value})}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-black text-[#7c829c] uppercase tracking-widest flex items-center gap-2">
                          ✉️ Email Address <span className="text-red-500">*</span>
                        </label>
                        <input 
                          required
                          type="email"
                          placeholder="you@example.com"
                          className="w-full px-5 py-4 rounded-2xl bg-[#f6f7fb] border border-[#eff1f6] focus:border-blue-800 focus:bg-white transition-all outline-none text-[15px] font-bold"
                          value={demoForm.email}
                          onChange={e => setDemoForm({...demoForm, email: e.target.value})}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-black text-[#7c829c] uppercase tracking-widest flex items-center gap-2">
                          📞 Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input 
                          required
                          type="tel"
                          placeholder="+91 XXXXX XXXXX"
                          className="w-full px-5 py-4 rounded-2xl bg-[#f6f7fb] border border-[#eff1f6] focus:border-blue-800 focus:bg-white transition-all outline-none text-[15px] font-bold"
                          value={demoForm.phone}
                          onChange={e => setDemoForm({...demoForm, phone: e.target.value})}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-black text-[#7c829c] uppercase tracking-widest flex items-center gap-2">
                            📅 Date <span className="text-red-500">*</span>
                          </label>
                          <input 
                            required
                            type="date"
                            className="w-full px-5 py-4 rounded-2xl bg-[#f6f7fb] border border-[#eff1f6] focus:border-blue-800 focus:bg-white transition-all outline-none text-[15px] font-bold"
                            value={demoForm.date}
                            onChange={e => setDemoForm({...demoForm, date: e.target.value})}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-black text-[#7c829c] uppercase tracking-widest flex items-center gap-2">
                            🕒 Time <span className="text-red-500">*</span>
                          </label>
                          <select 
                            required
                            className="w-full px-5 py-4 rounded-2xl bg-[#f6f7fb] border border-[#eff1f6] focus:border-blue-800 focus:bg-white transition-all outline-none text-[15px] font-bold appearance-none"
                            value={demoForm.time}
                            onChange={e => setDemoForm({...demoForm, time: e.target.value})}
                          >
                            <option value="">Select slot</option>
                            <option value="10:00 AM">10:00 AM</option>
                            <option value="12:00 PM">12:00 PM</option>
                            <option value="02:00 PM">02:00 PM</option>
                            <option value="04:00 PM">04:00 PM</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <button 
                      disabled={isSubmitting}
                      className="w-full py-5 bg-[#0b1f3a] hover:bg-[#071527] text-white rounded-[24px] font-black text-[17px] shadow-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                      {isSubmitting ? "Confirming..." : "Confirm My Demo Slot"}
                    </button>
                  </form>
                </>
              ) : (
                <div className="p-12 text-center">
                  <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-100">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  </div>
                  <h3 className="text-[28px] font-black text-[#111827] mb-2 leading-tight">Done! 🎉</h3>
                  <p className="text-[15px] font-medium text-[#7c829c] mb-8">
                    Your free demo slot is booked. We'll contact you shortly to confirm the details!
                  </p>
                  <button
                    onClick={closeDemoModal}
                    className="w-full py-4 bg-[#0b1f3a] hover:bg-[#071527] text-white rounded-2xl font-black text-[16px] transition-all"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Enquiry Modal ── */}
        <EnquiryModal 
          isOpen={showEnquiryModal} 
          onClose={() => setShowEnquiryModal(false)} 
          defaultCourse={filterCourse !== "all" ? filterCourse : undefined}
        />

        {/* ── Calendar Grid ── */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm mb-6">
          {/* Day headers */}
          <div className="grid grid-cols-7 bg-[#0b1f3a]">
            {WEEK_DAYS.map((d) => (
              <div key={d} className="py-4 text-center text-[17px] font-black uppercase tracking-widest text-white">{d}</div>
            ))}
          </div>

          {loading ? (
            <div className="py-24 text-center text-slate-400 animate-pulse text-base">Loading schedule…</div>
          ) : (
            <div className="grid grid-cols-7">
              {Array.from({ length: startDay }).map((_, i) => (
                <div key={`pad-${i}`} className="cal-cell bg-slate-50/60" />
              ))}
              {Array.from({ length: totalDays }).map((_, i) => {
                const day        = i + 1;
                const dayEvents  = dateMap[day] ?? [];
                const hasEvents  = dayEvents.length > 0;
                const colIndex   = (startDay + i) % 7;
                const weekend    = colIndex === 0 || colIndex === 6;
                const isSelected = selectedDay === day;
                const today      = isToday(day, month, year);

                return (
                  <div
                    key={day}
                    role="button"
                    tabIndex={0}
                    onClick={() => hasEvents && setSelectedDay(isSelected ? null : day)}
                    onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && hasEvents) setSelectedDay(isSelected ? null : day); }}
                    className="cal-cell select-none"
                    style={{
                      background: isSelected ? "#eff6ff" : weekend ? "#f8fafc" : "#fff",
                      boxShadow: isSelected ? "inset 0 0 0 2px #3b82f6" : undefined,
                      cursor: hasEvents ? "pointer" : "default",
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className="text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full"
                        style={today ? {
                          background: "#1d4ed8", color: "#fff",
                          boxShadow: "0 0 0 3px rgba(59,130,246,0.25)",
                        } : {
                          color: weekend ? "#94a3b8" : "#0f172a",
                        }}
                      >{day}</span>
                      {hasEvents && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
                          {dayEvents.length}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      {dayEvents.slice(0, 2).map((ev, idx) => {
                        const p = getCourseColor(ev.course_name, allCourses);
                        return (
                          <span
                            key={idx}
                            className="rounded-lg text-left truncate px-2 py-1 text-[11px] font-semibold block"
                            style={{
                              background: p.bgColor,
                              border: `1px solid ${p.borderColor}`,
                              color: p.solidColor,
                            }}
                          >
                            <span className="inline-block w-1.5 h-1.5 rounded-full mr-1 align-middle" style={{ backgroundColor: p.dotColor }} />
                            {ev.course_name} · {ev.event_type === "both" ? "B1+2" : ev.event_type === "batch1" ? "B1" : "B2"}
                          </span>
                        );
                      })}
                      {dayEvents.length > 2 && (
                        <span className="text-[11px] pl-1 font-medium text-slate-400">+{dayEvents.length - 2} more</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Day Detail Panel ── */}
        {selectedDay !== null && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 shadow-sm animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-black text-[#0b1f3a]">{month} {selectedDay}, {year}</h2>
              <button
                onClick={() => setSelectedDay(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition text-lg"
              >×</button>
            </div>
            {(dateMap[selectedDay] ?? []).length === 0 ? (
              <p className="text-slate-400 text-sm">No sessions scheduled.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {(dateMap[selectedDay] ?? []).map((ev, idx) => {
                  const p = getCourseColor(ev.course_name, allCourses);
                  return (
                    <div key={idx} className="rounded-xl p-4 flex items-start gap-3 border" style={{
                      background: p.bgColor, borderColor: p.borderColor,
                    }}>
                      <span className="mt-1 w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: p.dotColor, boxShadow: `0 0 8px ${p.dotColor}60` }} />
                      <div>
                        <p className="text-lg font-black text-[#0b1f3a] mb-0.5">{ev.title}</p>
                        <p className="text-base font-bold" style={{ color: p.solidColor }}>{ev.course_name}</p>
                        {ev.description && <p className="text-[15px] mt-2 text-slate-600 leading-relaxed font-medium">{ev.description}</p>}
                        <div className="flex gap-2 mt-4 flex-wrap">
                          <span className="text-sm font-bold px-3 py-1.5 rounded-full shadow-sm" style={{ background: p.bgColor, color: p.solidColor, border: `1px solid ${p.borderColor}` }}>
                            {ev.event_type === "both" ? "Batch 1 & 2" : ev.event_type === "batch1" ? "Batch 1" : "Batch 2"}
                          </span>
                          <span className="text-sm font-bold px-3 py-1.5 rounded-full shadow-sm bg-slate-100 text-slate-600 border border-slate-200">
                            {WEEK_LABEL[dateToWeek(ev.start_date)]}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Week-wise Overview ── */}
        <div className="mb-10">
          <h2 className="text-xl font-black text-[#0b1f3a] uppercase tracking-wide mb-6">Week-wise Overview · {month} {year}</h2>
          <div className="flex flex-col gap-8">
            {WEEK_ORDER.map((week) => {
              const weekEvents = filteredEvents.filter((e) => dateToWeek(e.start_date) === week);
              return (
                <div key={week} className="flex flex-col gap-3">
                  <div className="flex items-end justify-between px-2">
                    <h3 className="text-xl font-black uppercase tracking-widest text-blue-600">{WEEK_LABEL[week]}</h3>
                    <span className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold">{weekEvents.length} Sessions</span>
                  </div>
                  
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-blue-300 transition-colors">
                    {weekEvents.length === 0 ? (
                      <div className="flex items-center justify-center py-6">
                        <p className="text-[17px] font-medium text-slate-400">No sessions scheduled for this week</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {weekEvents.map((ev, idx) => {
                          const p = getCourseColor(ev.course_name, allCourses);
                          return (
                            <div key={idx} className="rounded-xl px-6 py-5 border shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow" style={{
                              background: p.bgColor, borderColor: p.borderColor,
                            }}>
                              <div>
                                <div className="text-[18px] font-black leading-snug mb-2" style={{ color: p.solidColor }}>{ev.course_name}</div>
                                <div className="text-[16px] font-bold text-slate-800 mb-5 leading-relaxed">{ev.title}</div>
                              </div>
                              <div>
                                <div className="inline-block px-4 py-2 rounded-full text-[15px] font-black shadow-sm" style={{ background: "#fff", color: p.solidColor, border: `1px solid ${p.borderColor}` }}>
                                  {ev.event_type === "both" ? "Batch 1 & 2" : ev.event_type === "batch1" ? "Batch 1" : "Batch 2"}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Course Legend ── */}
        {allCourses.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-black text-[#0b1f3a] uppercase tracking-wide mb-6">Course Legend</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {allCourses.map((cname) => {
                const p = getCourseColor(cname, allCourses);
                const isActive = filterCourse === cname;
                return (
                  <button
                    key={cname}
                    onClick={() => setFilterCourse(filterCourse === cname ? "all" : cname)}
                    className="flex items-center gap-4 p-5 rounded-2xl text-left transition-all border hover:border-blue-400 hover:shadow-md bg-white"
                    style={{
                      borderColor: isActive ? p.borderColor : "#e2e8f0",
                      boxShadow: isActive ? `0 6px 20px ${p.dotColor}25` : undefined,
                      transform: isActive ? "translateY(-2px)" : "none",
                    }}
                  >
                    <span className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: p.dotColor, boxShadow: `0 0 8px ${p.dotColor}80` }} />
                    <div>
                      <p className="text-base font-bold" style={{ color: isActive ? p.solidColor : "#0f172a" }}>{cname}</p>
                      <p className="text-[14px] font-medium text-slate-500 mt-1">
                        {events.filter((e) => e.course_name === cname).length} sessions total
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
