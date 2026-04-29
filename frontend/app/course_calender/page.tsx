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

// CORRECT
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
  { bgColor: "rgba(59,130,246,0.12)",  borderColor: "rgba(59,130,246,0.3)",  dotColor: "#3b82f6", solidColor: "#1d4ed8" },
  { bgColor: "rgba(16,185,129,0.12)",  borderColor: "rgba(16,185,129,0.3)",  dotColor: "#10b981", solidColor: "#059669" },
  { bgColor: "rgba(245,158,11,0.12)",  borderColor: "rgba(245,158,11,0.3)",  dotColor: "#f59e0b", solidColor: "#d97706" },
  { bgColor: "rgba(139,92,246,0.12)",  borderColor: "rgba(139,92,246,0.3)",  dotColor: "#8b5cf6", solidColor: "#7c3aed" },
  { bgColor: "rgba(239,68,68,0.12)",   borderColor: "rgba(239,68,68,0.3)",   dotColor: "#ef4444", solidColor: "#dc2626" },
  { bgColor: "rgba(236,72,153,0.12)",  borderColor: "rgba(236,72,153,0.3)",  dotColor: "#ec4899", solidColor: "#db2777" },
  { bgColor: "rgba(20,184,166,0.12)",  borderColor: "rgba(20,184,166,0.3)",  dotColor: "#14b8a6", solidColor: "#0d9488" },
  { bgColor: "rgba(249,115,22,0.12)",  borderColor: "rgba(249,115,22,0.3)",  dotColor: "#f97316", solidColor: "#ea580c" },
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

// ─── Glass style helper ────────────────────────────────────────────────────────
const glass = {
  card: {
    background: "rgba(255,255,255,0.55)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    border: "1px solid rgba(255,255,255,0.75)",
    boxShadow: "0 4px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)",
  },
  cardStrong: {
    background: "rgba(255,255,255,0.7)",
    backdropFilter: "blur(24px) saturate(200%)",
    WebkitBackdropFilter: "blur(24px) saturate(200%)",
    border: "1px solid rgba(255,255,255,0.85)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,1)",
  },
  cell: {
    background: "rgba(255,255,255,0.45)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
  },
  cellWeekend: {
    background: "rgba(241,245,249,0.6)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
  },
  cellSelected: {
    background: "rgba(59,130,246,0.12)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    boxShadow: "inset 0 0 0 2px rgba(59,130,246,0.4)",
  },
};

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
    <div className="min-h-screen" style={{
      background: "linear-gradient(135deg, #f0f4ff 0%, #fafbff 40%, #f0f7f4 70%, #fdf4ff 100%)",
      fontFamily: "'DM Sans', sans-serif",
      color: "#0f172a",
      position: "relative",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.2s ease; }
        .cal-cell {
          border-bottom: 1px solid rgba(0,0,0,0.05);
          border-right: 1px solid rgba(0,0,0,0.05);
          min-height: 84px;
          padding: 6px;
          transition: background 0.15s;
        }
        .cal-cell:hover { background: rgba(255,255,255,0.7) !important; }
        .month-tab-inactive:hover {
          background: rgba(255,255,255,0.7) !important;
          border-color: rgba(255,255,255,0.9) !important;
        }
      `}</style>

      {/* Soft blurred color blobs behind everything */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-80px", left: "-80px", width: "420px", height: "420px", borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", top: "30%", right: "-60px", width: "320px", height: "320px", borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "10%", left: "30%", width: "360px", height: "360px", borderRadius: "50%", background: "radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "-40px", right: "10%", width: "280px", height: "280px", borderRadius: "50%", background: "radial-gradient(circle, rgba(236,72,153,0.09) 0%, transparent 70%)" }} />
      </div>

      {/* ── Header ── */}
      <header className="sticky top-0 z-20 border-b" style={{
        background: "rgba(255,255,255,0.65)",
        backdropFilter: "blur(28px) saturate(200%)",
        WebkitBackdropFilter: "blur(28px) saturate(200%)",
        borderColor: "rgba(255,255,255,0.8)",
        boxShadow: "0 1px 0 rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.04)"
      }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold tracking-tight" style={{ color: "#0f172a" }}>🎓 Skill Training Schedule</h1>
            <p className="text-xs mt-0.5" style={{ color: "rgba(15,23,42,0.45)" }}>FY 2026–2027 · Student view</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setMonthIdx((i) => Math.max(0, i - 1))} disabled={monthIdx === 0}
              className="w-9 h-9 flex items-center justify-center rounded-full transition-all disabled:opacity-30"
              style={{ ...glass.card, color: "#0f172a", fontSize: "18px" }}>‹</button>
            <span className="min-w-[148px] text-center text-sm font-bold" style={{ color: "#0f172a" }}>{month} {year}</span>
            <button onClick={() => setMonthIdx((i) => Math.min(MONTHS_FY.length - 1, i + 1))} disabled={monthIdx === MONTHS_FY.length - 1}
              className="w-9 h-9 flex items-center justify-center rounded-full transition-all disabled:opacity-30"
              style={{ ...glass.card, color: "#0f172a", fontSize: "18px" }}>›</button>
          </div>
        </div>

        {/* Month tabs */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-3 flex gap-1.5 overflow-x-auto scrollbar-hide">
          {MONTHS_FY.map(({ month: m, year: y }, i) => {
            const isActive = monthIdx === i;
            return (
              <button key={i} onClick={() => setMonthIdx(i)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${!isActive ? "month-tab-inactive" : ""}`}
                style={isActive ? {
                  background: "rgba(29,78,216,0.9)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1px solid rgba(59,130,246,0.5)",
                  color: "#ffffff",
                  boxShadow: "0 2px 12px rgba(29,78,216,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
                } : {
                  background: "rgba(255,255,255,0.5)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.7)",
                  color: "rgba(15,23,42,0.55)",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                }}>
                {m.slice(0, 3)} '{String(y).slice(2)}
              </button>
            );
          })}
        </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-6">

        {error && (
          <div className="mb-4 p-3 rounded-2xl text-sm border" style={{
            background: "rgba(254,226,226,0.8)", backdropFilter: "blur(12px)",
            borderColor: "rgba(239,68,68,0.3)", color: "#991b1b"
          }}>
            ⚠️ {error} — <button onClick={loadEvents} className="underline font-semibold">Retry</button>
          </div>
        )}

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total sessions",  value: monthEvents.length,      icon: "📅", accent: "#3b82f6" },
            { label: "Courses running", value: monthCourseNames.length, icon: "📚", accent: "#10b981" },
            { label: "Batch 1",         value: batch1Count,             icon: "1️⃣", accent: "#8b5cf6" },
            { label: "Batch 2",         value: batch2Count,             icon: "2️⃣", accent: "#f59e0b" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl p-4 relative overflow-hidden" style={glass.cardStrong}>
              {/* top gloss */}
              <div style={{ position: "absolute", inset: "0 0 auto 0", height: "45%", borderRadius: "16px 16px 0 0", background: "linear-gradient(to bottom, rgba(255,255,255,0.6) 0%, transparent 100%)", pointerEvents: "none" }} />
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-2xl font-bold" style={{ color: s.accent }}>{s.value}</div>
              <div className="text-xs mt-0.5 font-medium" style={{ color: "rgba(15,23,42,0.5)" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Filter: Batch ── */}
        <div className="flex flex-wrap gap-2 mb-3">
          {(["all", "batch1", "batch2"] as const).map((b) => {
            const isActive = filterBatch === b;
            let activeStyle: any = {};
            if (isActive && b === "batch1") activeStyle = { background: "rgba(29,78,216,0.9)", border: "1px solid rgba(59,130,246,0.5)", color: "#fff", boxShadow: "0 2px 12px rgba(29,78,216,0.25)" };
            else if (isActive && b === "batch2") activeStyle = { background: "rgba(109,40,217,0.9)", border: "1px solid rgba(139,92,246,0.5)", color: "#fff", boxShadow: "0 2px 12px rgba(109,40,217,0.25)" };
            else if (isActive) activeStyle = { background: "rgba(15,23,42,0.85)", border: "1px solid rgba(15,23,42,0.5)", color: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" };
            return (
              <button key={b} onClick={() => setFilterBatch(b)}
                className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={isActive ? { ...activeStyle, backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" } : {
                  background: "rgba(255,255,255,0.55)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.8)", color: "rgba(15,23,42,0.6)",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                }}>
                {b === "all" ? "All batches" : b === "batch1" ? "Batch 1" : "Batch 2"}
              </button>
            );
          })}
        </div>

        {/* ── Filter: Course ── */}
        <div className="flex flex-wrap gap-2 mb-5">
          <button onClick={() => setFilterCourse("all")}
            className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={filterCourse === "all" ? {
              background: "rgba(15,23,42,0.85)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
              border: "1px solid rgba(15,23,42,0.4)", color: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            } : {
              background: "rgba(255,255,255,0.55)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.8)", color: "rgba(15,23,42,0.6)",
              boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
            }}>All courses</button>

          {monthCourseNames.map((cname) => {
            const p = getCourseColor(cname, allCourses);
            const isActive = filterCourse === cname;
            return (
              <button key={cname} onClick={() => setFilterCourse(filterCourse === cname ? "all" : cname)}
                className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5"
                style={isActive ? {
                  background: `${p.solidColor}dd`, backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
                  border: `1px solid ${p.solidColor}`, color: "#fff",
                  boxShadow: `0 2px 10px ${p.dotColor}40`,
                } : {
                  background: "rgba(255,255,255,0.55)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.8)", color: "rgba(15,23,42,0.6)",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.dotColor }} />
                {cname}
              </button>
            );
          })}
        </div>

        {/* ── Calendar Grid ── */}
        <div className="rounded-2xl overflow-hidden mb-5" style={{
          background: "rgba(255,255,255,0.5)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          border: "1px solid rgba(255,255,255,0.8)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.95)",
        }}>
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b" style={{ borderColor: "rgba(0,0,0,0.05)", background: "rgba(255,255,255,0.6)" }}>
            {WEEK_DAYS.map((d) => (
              <div key={d} className="py-3 text-center text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(15,23,42,0.4)" }}>{d}</div>
            ))}
          </div>

          {loading ? (
            <div className="py-16 text-center text-sm animate-pulse" style={{ color: "rgba(15,23,42,0.35)" }}>Loading schedule…</div>
          ) : (
            <div className="grid grid-cols-7">
              {Array.from({ length: startDay }).map((_, i) => (
                <div key={`pad-${i}`} className="cal-cell" style={{ background: "rgba(248,250,252,0.5)" }} />
              ))}

              {Array.from({ length: totalDays }).map((_, i) => {
                const day       = i + 1;
                const dayEvents = dateMap[day] ?? [];
                const hasEvents = dayEvents.length > 0;
                const colIndex  = (startDay + i) % 7;
                const weekend   = colIndex === 0 || colIndex === 6;
                const isSelected = selectedDay === day;
                const today     = isToday(day, month, year);

                const cellBg = isSelected
                  ? glass.cellSelected
                  : weekend
                  ? glass.cellWeekend
                  : glass.cell;

                return (
                  <div key={day} role="button" tabIndex={0}
                    aria-label={`${month} ${day}`} aria-pressed={isSelected}
                    onClick={() => hasEvents && setSelectedDay(isSelected ? null : day)}
                    onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && hasEvents) setSelectedDay(isSelected ? null : day); }}
                    className="cal-cell select-none"
                    style={{ ...cellBg, cursor: hasEvents ? "pointer" : "default" }}>

                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full transition-all"
                        style={today ? {
                          background: "linear-gradient(135deg, #1d4ed8, #0ea5e9)",
                          color: "#fff",
                          boxShadow: "0 0 0 3px rgba(59,130,246,0.2)",
                        } : {
                          color: weekend ? "rgba(15,23,42,0.3)" : "rgba(15,23,42,0.7)"
                        }}>
                        {day}
                      </span>
                      {hasEvents && (
                        <span className="text-[9px] font-semibold px-1 py-0.5 rounded-full" style={{ background: "rgba(0,0,0,0.06)", color: "rgba(15,23,42,0.45)" }}>
                          {dayEvents.length}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-0.5">
                      {dayEvents.slice(0, 2).map((ev, idx) => {
                        const p = getCourseColor(ev.course_name, allCourses);
                        return (
                          <span key={idx}
                            className="rounded-md text-left truncate leading-tight px-1.5 py-0.5 text-[9px] block font-semibold"
                            style={{
                              background: `${p.solidColor}18`,
                              border: `1px solid ${p.solidColor}35`,
                              color: p.solidColor,
                            }}>
                            <span className="inline-block w-1.5 h-1.5 rounded-full mr-1 align-middle" style={{ backgroundColor: p.dotColor }} />
                            {ev.course_name} · {ev.event_type === "both" ? "B1+2" : ev.event_type === "batch1" ? "B1" : "B2"}
                          </span>
                        );
                      })}
                      {dayEvents.length > 2 && (
                        <span className="text-[9px] pl-0.5 font-medium" style={{ color: "rgba(15,23,42,0.4)" }}>+{dayEvents.length - 2} more</span>
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
          <div className="rounded-2xl p-5 mb-6 animate-fade-in" style={glass.cardStrong}>
            <div style={{ position: "absolute", inset: "0 0 auto 0", height: "40%", borderRadius: "16px 16px 0 0", background: "linear-gradient(to bottom, rgba(255,255,255,0.7) 0%, transparent 100%)", pointerEvents: "none" }} />
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold" style={{ color: "#0f172a" }}>{month} {selectedDay}, {year}</h2>
              <button onClick={() => setSelectedDay(null)}
                className="text-xl font-light w-7 h-7 flex items-center justify-center rounded-full transition"
                style={{ color: "rgba(15,23,42,0.4)", background: "rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.08)" }}>×</button>
            </div>
            {(dateMap[selectedDay] ?? []).length === 0 ? (
              <p className="text-sm" style={{ color: "rgba(15,23,42,0.4)" }}>No sessions scheduled.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {(dateMap[selectedDay] ?? []).map((ev, idx) => {
                  const p = getCourseColor(ev.course_name, allCourses);
                  return (
                    <div key={idx} className="rounded-xl p-4 flex items-start gap-3" style={{
                      background: `${p.solidColor}0f`,
                      border: `1px solid ${p.solidColor}30`,
                      boxShadow: `0 2px 12px ${p.dotColor}15`,
                    }}>
                      <span className="mt-0.5 w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: p.dotColor, boxShadow: `0 0 8px ${p.dotColor}60` }} />
                      <div>
                        <p className="text-sm font-bold" style={{ color: "#0f172a" }}>{ev.title}</p>
                        <p className="text-xs font-semibold mt-0.5" style={{ color: p.solidColor }}>{ev.course_name}</p>
                        {ev.description && <p className="text-xs mt-0.5 leading-snug" style={{ color: "rgba(15,23,42,0.5)" }}>{ev.description}</p>}
                        <div className="flex gap-2 mt-2 flex-wrap">
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: `${p.solidColor}18`, color: p.solidColor, border: `1px solid ${p.solidColor}30` }}>
                            {ev.event_type === "both" ? "Batch 1 & 2" : ev.event_type === "batch1" ? "Batch 1" : "Batch 2"}
                          </span>
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ background: "rgba(0,0,0,0.05)", color: "rgba(15,23,42,0.5)", border: "1px solid rgba(0,0,0,0.08)" }}>
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
          <h2 className="text-sm font-semibold mb-3" style={{ color: "rgba(15,23,42,0.5)" }}>Week-wise overview · {month} {year}</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {WEEK_ORDER.map((week) => {
              const weekEvents = filteredEvents.filter((e) => dateToWeek(e.start_date) === week);
              return (
                <div key={week} className="rounded-2xl p-4 relative overflow-hidden" style={glass.card}>
                  <div style={{ position: "absolute", inset: "0 0 auto 0", height: "40%", borderRadius: "16px 16px 0 0", background: "linear-gradient(to bottom, rgba(255,255,255,0.7) 0%, transparent 100%)", pointerEvents: "none" }} />
                  <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "rgba(15,23,42,0.4)" }}>{WEEK_LABEL[week]}</h3>
                  {weekEvents.length === 0 ? (
                    <p className="text-xs" style={{ color: "rgba(15,23,42,0.28)" }}>No sessions</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {weekEvents.map((ev, idx) => {
                        const p = getCourseColor(ev.course_name, allCourses);
                        return (
                          <div key={idx} className="rounded-xl px-3 py-2 text-xs" style={{
                            background: `${p.solidColor}12`,
                            border: `1px solid ${p.solidColor}28`,
                          }}>
                            <div className="font-bold truncate" style={{ color: p.solidColor }}>{ev.course_name}</div>
                            <div className="mt-0.5 truncate" style={{ color: "rgba(15,23,42,0.5)" }}>{ev.title}</div>
                            <div className="mt-0.5 font-medium" style={{ color: "rgba(15,23,42,0.38)" }}>
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
          <div>
            <h2 className="text-sm font-semibold mb-3" style={{ color: "rgba(15,23,42,0.5)" }}>Course legend</h2>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {allCourses.map((cname) => {
                const p = getCourseColor(cname, allCourses);
                const isActive = filterCourse === cname;
                return (
                  <button key={cname} onClick={() => setFilterCourse(filterCourse === cname ? "all" : cname)}
                    className="flex items-start gap-2.5 p-3 rounded-xl text-left transition-all relative overflow-hidden"
                    style={{
                      background: isActive ? `${p.solidColor}15` : "rgba(255,255,255,0.55)",
                      backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
                      border: isActive ? `1.5px solid ${p.solidColor}50` : "1px solid rgba(255,255,255,0.8)",
                      boxShadow: isActive ? `0 4px 16px ${p.dotColor}20` : "0 1px 6px rgba(0,0,0,0.04)",
                    }}>
                    <div style={{ position: "absolute", inset: "0 0 auto 0", height: "40%", borderRadius: "12px 12px 0 0", background: "linear-gradient(to bottom, rgba(255,255,255,0.5) 0%, transparent 100%)", pointerEvents: "none" }} />
                    <span className="mt-0.5 w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.dotColor, boxShadow: `0 0 6px ${p.dotColor}70` }} />
                    <div>
                      <p className="text-xs font-bold" style={{ color: isActive ? p.solidColor : "#0f172a" }}>{cname}</p>
                      <p className="text-xs mt-0.5" style={{ color: "rgba(15,23,42,0.42)" }}>
                        {events.filter((e) => e.course_name === cname).length} sessions total
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
