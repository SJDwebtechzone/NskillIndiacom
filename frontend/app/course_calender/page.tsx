"use client";

import { useState, useEffect, useCallback } from "react";

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

  const loadEvents = useCallback(async () => {
    setLoading(true); setError("");
    try { setEvents(await fetchEvents()); }
    catch (e: any) { setError(e.message ?? "Failed to load"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadEvents(); }, [loadEvents]);
  useEffect(() => { setSelectedDay(null); }, [monthIdx, filterCourse, filterBatch]);

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
      <div className="bg-[#0b1f3a] text-white">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="text-blue-300 text-xs font-bold uppercase tracking-widest mb-2">FY 2026–2027</p>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase">Course Calendar</h1>
              <p className="text-slate-400 text-sm mt-2">Skill Training Schedule · Student View</p>
            </div>
            {/* Month Navigator */}
            <div className="flex items-center gap-4 bg-white/10 rounded-2xl px-5 py-3 border border-white/20">
              <button
                onClick={() => setMonthIdx((i) => Math.max(0, i - 1))}
                disabled={monthIdx === 0}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition disabled:opacity-30 text-white text-lg font-bold"
              >‹</button>
              <span className="min-w-[160px] text-center text-base font-bold text-white">{month} {year}</span>
              <button
                onClick={() => setMonthIdx((i) => Math.min(MONTHS_FY.length - 1, i + 1))}
                disabled={monthIdx === MONTHS_FY.length - 1}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition disabled:opacity-30 text-white text-lg font-bold"
              >›</button>
            </div>
          </div>

          {/* Month Tabs */}
          <div className="flex gap-2 mt-6 overflow-x-auto scrollbar-hide pb-1">
            {MONTHS_FY.map(({ month: m, year: y }, i) => (
              <button
                key={i}
                onClick={() => setMonthIdx(i)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  monthIdx === i
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : "bg-white/10 text-white/60 hover:bg-white/20 hover:text-white"
                }`}
              >
                {m.slice(0, 3)} '{String(y).slice(2)}
              </button>
            ))}
          </div>
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
            { label: "Total Sessions",   value: monthEvents.length,      icon: "📅", color: "text-blue-600",   bg: "bg-blue-50",   border: "border-blue-100" },
            { label: "Courses Running",  value: monthCourseNames.length, icon: "📚", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
            { label: "Batch 1 Sessions", value: batch1Count,             icon: "🔵", color: "text-violet-600",  bg: "bg-violet-50",  border: "border-violet-100" },
            { label: "Batch 2 Sessions", value: batch2Count,             icon: "🟡", color: "text-amber-600",   bg: "bg-amber-50",   border: "border-amber-100" },
          ].map((s) => (
            <div key={s.label} className={`rounded-2xl p-5 border ${s.bg} ${s.border}`}>
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-sm font-medium text-slate-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Filters ── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Filter by Batch</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {(["all", "batch1", "batch2"] as const).map((b) => (
              <button
                key={b}
                onClick={() => setFilterBatch(b)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all border ${
                  filterBatch === b
                    ? b === "batch1" ? "bg-blue-600 text-white border-blue-600 shadow-md"
                    : b === "batch2" ? "bg-violet-600 text-white border-violet-600 shadow-md"
                    : "bg-[#0b1f3a] text-white border-[#0b1f3a] shadow-md"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                }`}
              >
                {b === "all" ? "All Batches" : b === "batch1" ? "Batch 1" : "Batch 2"}
              </button>
            ))}
          </div>

          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Filter by Course</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterCourse("all")}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all border ${
                filterCourse === "all"
                  ? "bg-[#0b1f3a] text-white border-[#0b1f3a] shadow-md"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              }`}
            >All Courses</button>
            {monthCourseNames.map((cname) => {
              const p = getCourseColor(cname, allCourses);
              const isActive = filterCourse === cname;
              return (
                <button
                  key={cname}
                  onClick={() => setFilterCourse(filterCourse === cname ? "all" : cname)}
                  className="px-5 py-2 rounded-full text-sm font-semibold transition-all border flex items-center gap-2"
                  style={isActive ? {
                    background: p.solidColor, color: "#fff", borderColor: p.solidColor,
                    boxShadow: `0 4px 12px ${p.dotColor}40`,
                  } : {
                    background: "#fff", color: "#475569", borderColor: "#e2e8f0",
                  }}
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.dotColor }} />
                  {cname}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Calendar Grid ── */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm mb-6">
          {/* Day headers */}
          <div className="grid grid-cols-7 bg-[#0b1f3a]">
            {WEEK_DAYS.map((d) => (
              <div key={d} className="py-4 text-center text-sm font-bold uppercase tracking-widest text-white/70">{d}</div>
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
                        <p className="text-sm font-bold text-[#0b1f3a]">{ev.title}</p>
                        <p className="text-xs font-semibold mt-0.5" style={{ color: p.solidColor }}>{ev.course_name}</p>
                        {ev.description && <p className="text-xs mt-1 text-slate-500 leading-snug">{ev.description}</p>}
                        <div className="flex gap-2 mt-2 flex-wrap">
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: p.bgColor, color: p.solidColor, border: `1px solid ${p.borderColor}` }}>
                            {ev.event_type === "both" ? "Batch 1 & 2" : ev.event_type === "batch1" ? "Batch 1" : "Batch 2"}
                          </span>
                          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
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
        <div className="mb-8">
          <h2 className="text-base font-black text-[#0b1f3a] uppercase tracking-wide mb-4">Week-wise Overview · {month} {year}</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {WEEK_ORDER.map((week) => {
              const weekEvents = filteredEvents.filter((e) => dateToWeek(e.start_date) === week);
              return (
                <div key={week} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">{WEEK_LABEL[week]}</h3>
                  {weekEvents.length === 0 ? (
                    <p className="text-sm text-slate-300">No sessions</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {weekEvents.map((ev, idx) => {
                        const p = getCourseColor(ev.course_name, allCourses);
                        return (
                          <div key={idx} className="rounded-xl px-3 py-2.5 text-sm border" style={{
                            background: p.bgColor, borderColor: p.borderColor,
                          }}>
                            <div className="font-bold truncate" style={{ color: p.solidColor }}>{ev.course_name}</div>
                            <div className="mt-0.5 truncate text-slate-500 text-xs">{ev.title}</div>
                            <div className="mt-0.5 text-xs font-medium text-slate-400">
                              {ev.event_type === "both" ? "Batch 1 & 2" : ev.event_type === "batch1" ? "Batch 1" : "Batch 2"}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Course Legend ── */}
        {allCourses.length > 0 && (
          <div className="mb-10">
            <h2 className="text-base font-black text-[#0b1f3a] uppercase tracking-wide mb-4">Course Legend</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {allCourses.map((cname) => {
                const p = getCourseColor(cname, allCourses);
                const isActive = filterCourse === cname;
                return (
                  <button
                    key={cname}
                    onClick={() => setFilterCourse(filterCourse === cname ? "all" : cname)}
                    className="flex items-center gap-3 p-4 rounded-2xl text-left transition-all border hover:shadow-md"
                    style={{
                      background: isActive ? p.bgColor : "#fff",
                      borderColor: isActive ? p.borderColor : "#e2e8f0",
                      boxShadow: isActive ? `0 4px 16px ${p.dotColor}20` : undefined,
                    }}
                  >
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: p.dotColor, boxShadow: `0 0 6px ${p.dotColor}70` }} />
                    <div>
                      <p className="text-sm font-bold" style={{ color: isActive ? p.solidColor : "#0f172a" }}>{cname}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
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
