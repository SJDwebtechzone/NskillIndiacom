"use client";

import { useState, useEffect, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type EventType = "batch1" | "batch2" | "both";
type Week = "First" | "Second" | "Third" | "Fourth";

interface CourseEvent {
  id?: number;
  title: string;
  description: string;
  course_name: string;
  start_date: string;
  end_date: string;
  event_type: EventType;
}

interface ColorPalette {
  bgColor: string;
  borderColor: string;
  dotColor: string;
  textColor: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

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
  First:  "1st Week",
  Second: "2nd Week",
  Third:  "3rd Week",
  Fourth: "4th Week",
};

const COLOR_PALETTES: ColorPalette[] = [
  { bgColor: "rgba(30,64,175,0.18)",   borderColor: "rgba(59,130,246,0.35)",  dotColor: "#60a5fa", textColor: "#ffffff" },
  { bgColor: "rgba(5,150,105,0.18)",   borderColor: "rgba(16,185,129,0.35)",  dotColor: "#34d399", textColor: "#ffffff" },
  { bgColor: "rgba(180,83,9,0.18)",    borderColor: "rgba(245,158,11,0.35)",  dotColor: "#fbbf24", textColor: "#ffffff" },
  { bgColor: "rgba(109,40,217,0.18)",  borderColor: "rgba(167,139,250,0.35)", dotColor: "#a78bfa", textColor: "#ffffff" },
  { bgColor: "rgba(185,28,28,0.18)",   borderColor: "rgba(248,113,113,0.35)", dotColor: "#f87171", textColor: "#ffffff" },
  { bgColor: "rgba(190,24,93,0.18)",   borderColor: "rgba(244,114,182,0.35)", dotColor: "#f472b6", textColor: "#ffffff" },
  { bgColor: "rgba(13,148,136,0.18)",  borderColor: "rgba(45,212,191,0.35)",  dotColor: "#2dd4bf", textColor: "#ffffff" },
  { bgColor: "rgba(194,65,12,0.18)",   borderColor: "rgba(251,146,60,0.35)",  dotColor: "#fb923c", textColor: "#ffffff" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCourseColor(courseName: string, allCourseNames: string[]): ColorPalette {
  const idx = allCourseNames.indexOf(courseName);
  return COLOR_PALETTES[(idx < 0 ? 0 : idx) % COLOR_PALETTES.length];
}

function parseDayFromDateStr(dateStr: string): number {
  return parseInt(dateStr.split("-")[2], 10);
}

function weekToDateRange(week: Week, month: string, year: number): { start: string; end: string } {
  const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
  const totalDays  = new Date(year, monthIndex + 1, 0).getDate();
  const wi         = WEEK_ORDER.indexOf(week);
  const startDay   = wi * 7 + 1;
  const endDay     = wi === 3 ? totalDays : Math.min(startDay + 6, totalDays);
  const pad        = (n: number) => String(n).padStart(2, "0");
  const m          = String(monthIndex + 1).padStart(2, "0");
  return {
    start: `${year}-${m}-${pad(startDay)}`,
    end:   `${year}-${m}-${pad(endDay)}`,
  };
}

function dateToWeek(dateStr: string): Week {
  const day = parseDayFromDateStr(dateStr);
  if (day <= 7)  return "First";
  if (day <= 14) return "Second";
  if (day <= 21) return "Third";
  return "Fourth";
}

function dateToMonthYear(dateStr: string): { month: string; year: number } {
  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];
  const parts = dateStr.split("-");
  const year  = parseInt(parts[0], 10);
  const month = monthNames[parseInt(parts[1], 10) - 1];
  return { month, year };
}

// ─── API helpers ──────────────────────────────────────────────────────────────

async function fetchEvents(): Promise<CourseEvent[]> {
  const res = await fetch(API_BASE, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch events");
  return res.json();
}

async function createEvent(ev: Omit<CourseEvent, "id">): Promise<CourseEvent> {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ev),
  });
  if (!res.ok) throw new Error("Failed to create event");
  return res.json();
}

async function updateEvent(id: number, ev: Omit<CourseEvent, "id">): Promise<CourseEvent> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ev),
  });
  if (!res.ok) throw new Error("Failed to update event");
  return res.json();
}

async function deleteEvent(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete event");
}

// ─── Session Modal ────────────────────────────────────────────────────────────

interface SessionModalProps {
  event:      CourseEvent | null;
  monthIdx:   number;
  allCourses: string[];
  onSave:     () => void;
  onClose:    () => void;
}

function SessionModal({ event, monthIdx, allCourses, onSave, onClose }: SessionModalProps) {
  const { month, year } = MONTHS_FY[monthIdx];

  const [title,       setTitle]       = useState(event?.title       ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [courseName,  setCourseName]  = useState(event?.course_name ?? (allCourses[0] ?? ""));
  const [newCourse,   setNewCourse]   = useState("");
  const [addingNew,   setAddingNew]   = useState(false);

  const [week, setWeek] = useState<Week>(
    event?.start_date ? dateToWeek(event.start_date) : "First"
  );

  const [eventType, setEventType] = useState<EventType>(
    (event?.event_type as EventType) ?? "batch1"
  );
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  const preview    = weekToDateRange(week, month, year);
  const finalCourse = addingNew ? newCourse.trim() : courseName;
  const isValid     = title.trim().length > 0 && finalCourse.length > 0;

  async function handleSave() {
    if (!isValid) return;
    setSaving(true);
    setError("");
    try {
      const { start, end } = weekToDateRange(week, month, year);
      const payload = {
        title:       title.trim(),
        description: description.trim(),
        course_name: finalCourse,
        start_date:  start,
        end_date:    end,
        event_type:  eventType,
      };
      if (event?.id) {
        await updateEvent(event.id, payload);
      } else {
        await createEvent(payload);
      }
      onSave();
    } catch (e: any) {
      setError(e.message ?? "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  /* shared input style */
  const inputStyle = {
    width: "100%",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "12px",
    padding: "10px 14px",
    fontSize: "14px",
    color: "#ffffff",
    outline: "none",
  } as React.CSSProperties;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 relative overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #0a1628 0%, #0d1f3c 100%)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
      >
        {/* top gloss */}
        <div className="absolute inset-x-0 top-0 h-[35%] pointer-events-none rounded-t-2xl"
          style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.06) 0%, transparent 100%)" }} />

        <h2 className="text-base font-bold mb-5" style={{ color: "#ffffff" }}>
          {event ? "Edit session" : "Add new session"}
        </h2>

        {error && (
          <div className="mb-4 p-3 rounded-xl text-xs border"
            style={{ background: "rgba(127,29,29,0.3)", borderColor: "rgba(248,113,113,0.3)", color: "#fca5a5" }}>
            {error}
          </div>
        )}

        {/* Title */}
        <div className="mb-4">
          <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5"
            style={{ color: "rgba(255,255,255,0.45)" }}>
            Session title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. React Fundamentals"
            style={inputStyle}
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5"
            style={{ color: "rgba(255,255,255,0.45)" }}>
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description..."
            rows={2}
            style={{ ...inputStyle, resize: "none" }}
          />
        </div>

        {/* Course */}
        <div className="mb-4">
          <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5"
            style={{ color: "rgba(255,255,255,0.45)" }}>
            Course
          </label>
          {!addingNew ? (
            <div className="flex gap-2">
              <select
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                style={{ ...inputStyle, flex: 1 }}
              >
                {allCourses.map((c) => <option key={c} value={c} style={{ background: "#0a1628" }}>{c}</option>)}
                {allCourses.length === 0 && <option value="" style={{ background: "#0a1628" }}>No courses yet</option>}
              </select>
              <button
                type="button"
                onClick={() => setAddingNew(true)}
                className="px-3 py-2 rounded-xl text-xs font-semibold transition"
                style={{
                  border: "1px dashed rgba(255,255,255,0.2)",
                  color: "rgba(255,255,255,0.55)",
                  background: "transparent",
                }}
              >
                + New
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={newCourse}
                onChange={(e) => setNewCourse(e.target.value)}
                placeholder="New course name"
                autoFocus
                style={{ ...inputStyle, flex: 1 }}
              />
              <button
                type="button"
                onClick={() => setAddingNew(false)}
                className="px-3 py-2 rounded-xl text-xs font-semibold transition"
                style={{
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.5)",
                  background: "rgba(255,255,255,0.04)",
                }}
              >
                ← Back
              </button>
            </div>
          )}
        </div>

        {/* Batch */}
        <div className="mb-4">
          <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5"
            style={{ color: "rgba(255,255,255,0.45)" }}>
            Batch
          </label>
          <div className="flex gap-2">
            {(["batch1", "batch2", "both"] as EventType[]).map((b) => {
              const isActive = eventType === b;
              let activeStyle = {};
              if (isActive && b === "batch1") activeStyle = { background: "linear-gradient(135deg,#1d4ed8,#2563eb)", border: "1px solid rgba(96,165,250,0.5)", color: "#fff" };
              else if (isActive && b === "batch2") activeStyle = { background: "linear-gradient(135deg,#5b21b6,#7c3aed)", border: "1px solid rgba(167,139,250,0.5)", color: "#fff" };
              else if (isActive) activeStyle = { background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)", color: "#fff" };
              return (
                <button
                  key={b}
                  type="button"
                  onClick={() => setEventType(b)}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
                  style={isActive ? activeStyle : {
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.5)",
                  }}
                >
                  {b === "batch1" ? "Batch 1" : b === "batch2" ? "Batch 2" : "Both"}
                </button>
              );
            })}
          </div>
        </div>

        {/* Week */}
        <div className="mb-3">
          <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5"
            style={{ color: "rgba(255,255,255,0.45)" }}>
            Week
          </label>
          <div className="grid grid-cols-2 gap-2">
            {WEEK_ORDER.map((w) => {
              const isActive = week === w;
              return (
                <button
                  key={w}
                  type="button"
                  onClick={() => setWeek(w)}
                  className="py-2 rounded-xl text-xs font-semibold transition-all"
                  style={isActive ? {
                    background: "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,255,255,0.25)",
                    color: "#ffffff",
                  } : {
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.45)",
                  }}
                >
                  {WEEK_LABEL[w]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Date preview */}
        <div className="mb-6 px-3 py-2 rounded-xl text-xs"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.5)",
          }}>
          📅 Dates:{" "}
          <span style={{ color: "#ffffff", fontWeight: 600 }}>{preview.start}</span>
          {" → "}
          <span style={{ color: "#ffffff", fontWeight: 600 }}>{preview.end}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.6)",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!isValid || saving}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={isValid && !saving ? {
              background: "linear-gradient(135deg, #1d4ed8, #0ea5e9)",
              border: "1px solid rgba(96,165,250,0.4)",
              color: "#ffffff",
              boxShadow: "0 4px 14px rgba(30,64,175,0.4)",
            } : {
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.25)",
              cursor: "not-allowed",
            }}
          >
            {saving ? "Saving…" : event ? "Save changes" : "Add session"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────

export default function AdminPage() {
  const [events,         setEvents]         = useState<CourseEvent[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState("");
  const [activeMonthIdx, setActiveMonthIdx] = useState(0);
  const [showModal,      setShowModal]      = useState(false);
  const [editingEvent,   setEditingEvent]   = useState<CourseEvent | null>(null);
  const [tab,            setTab]            = useState<"sessions" | "courses">("sessions");
  const [deletingId,     setDeletingId]     = useState<number | null>(null);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchEvents();
      setEvents(data);
    } catch (e: any) {
      setError(e.message ?? "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  const { month, year } = MONTHS_FY[activeMonthIdx];

  const monthEvents = events.filter((e) => {
    const { month: em, year: ey } = dateToMonthYear(e.start_date);
    return em === month && ey === year;
  });

  const allCourses   = [...new Set(events.map((e) => e.course_name))].sort();
  const monthCourses = [...new Set(monthEvents.map((e) => e.course_name))];
  const batch1Count  = monthEvents.filter((e) => e.event_type === "batch1" || e.event_type === "both").length;
  const batch2Count  = monthEvents.filter((e) => e.event_type === "batch2" || e.event_type === "both").length;

  const courseStats = allCourses.map((c) => ({
    name:    c,
    total:   events.filter((e) => e.course_name === c).length,
    batch1:  events.filter((e) => e.course_name === c && (e.event_type === "batch1" || e.event_type === "both")).length,
    batch2:  events.filter((e) => e.course_name === c && (e.event_type === "batch2" || e.event_type === "both")).length,
    palette: getCourseColor(c, allCourses),
  }));

  async function handleDelete(id: number) {
    if (!window.confirm("Delete this session?")) return;
    setDeletingId(id);
    try {
      await deleteEvent(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch {
      alert("Delete failed. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  function handleEdit(ev: CourseEvent) { setEditingEvent(ev); setShowModal(true); }
  function handleAdd()                  { setEditingEvent(null); setShowModal(true); }

  async function handleModalSave() {
    setShowModal(false);
    setEditingEvent(null);
    await loadEvents();
  }

  return (
    <div className="min-h-screen" style={{
      background: "linear-gradient(160deg, #060d1f 0%, #0a1628 30%, #0d1f3c 60%, #091628 100%)",
      fontFamily: "'DM Sans', sans-serif",
      color: "#ffffff",
    }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.25); }
        input:focus, textarea:focus, select:focus {
          outline: none;
          border-color: rgba(96,165,250,0.5) !important;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
        }
      `}</style>

      {/* ── Ambient blobs ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(30,64,175,0.25) 0%, transparent 65%)" }} />
        <div className="absolute top-1/2 -right-32 w-[400px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(14,116,144,0.18) 0%, transparent 65%)" }} />
        <div className="absolute bottom-0 left-1/3 w-[350px] h-[350px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(30,58,138,0.22) 0%, transparent 65%)" }} />
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(1px 1px at 15% 20%, rgba(255,255,255,0.4) 0%, transparent 100%),
            radial-gradient(1px 1px at 40% 60%, rgba(255,255,255,0.3) 0%, transparent 100%),
            radial-gradient(1px 1px at 70% 10%, rgba(255,255,255,0.35) 0%, transparent 100%),
            radial-gradient(1px 1px at 85% 75%, rgba(255,255,255,0.3) 0%, transparent 100%),
            radial-gradient(1px 1px at 25% 85%, rgba(255,255,255,0.25) 0%, transparent 100%)`
        }} />
      </div>

      {/* ── Header ── */}
      <header className="sticky top-0 z-20 border-b"
        style={{
          background: "rgba(6,13,31,0.75)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderColor: "rgba(255,255,255,0.07)",
        }}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold tracking-tight" style={{ color: "#ffffff" }}>⚙️ Admin Panel</h1>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
              Skill Training · FY 2026–2027 · Manage sessions
            </p>
          </div>
          {loading && (
            <span className="text-xs animate-pulse" style={{ color: "rgba(255,255,255,0.35)" }}>Syncing with DB…</span>
          )}
        </div>

        {/* Month tabs */}
        {tab === "sessions" && (
          <div className="max-w-5xl mx-auto px-6 pb-3 flex gap-1.5 overflow-x-auto scrollbar-hide">
            {MONTHS_FY.map(({ month: m, year: y }, i) => {
              const isActive = activeMonthIdx === i;
              return (
                <button
                  key={i}
                  onClick={() => setActiveMonthIdx(i)}
                  className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all relative overflow-hidden"
                  style={isActive ? {
                    background: "linear-gradient(135deg, rgba(30,64,175,0.9) 0%, rgba(14,116,144,0.85) 50%, rgba(30,58,138,0.9) 100%)",
                    border: "1px solid rgba(96,165,250,0.5)",
                    color: "#ffffff",
                    boxShadow: "0 4px 20px rgba(30,64,175,0.5), inset 0 1px 0 rgba(255,255,255,0.2)",
                  } : {
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  {isActive && (
                    <span className="absolute inset-x-0 top-0 h-[45%] rounded-t-xl pointer-events-none"
                      style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.22) 0%, transparent 100%)" }} />
                  )}
                  {m.slice(0, 3)} &apos;{String(y).slice(2)}
                </button>
              );
            })}
          </div>
        )}

        {/* Tab switcher */}
        <div className="max-w-5xl mx-auto px-6 pb-3 flex gap-2 border-t pt-2 mt-1"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          {(["sessions", "courses"] as const).map((t) => {
            const isActive = tab === t;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={isActive ? {
                  background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
                  border: "1px solid rgba(96,165,250,0.4)",
                  color: "#ffffff",
                  boxShadow: "0 4px 14px rgba(37,99,235,0.4)",
                } : {
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.55)",
                }}
              >
                {t === "sessions" ? "📅 Sessions" : "📚 Courses"}
              </button>
            );
          })}
        </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-6">

        {error && (
          <div className="mb-4 p-3 rounded-2xl text-sm border"
            style={{ background: "rgba(127,29,29,0.3)", backdropFilter: "blur(10px)", borderColor: "rgba(248,113,113,0.3)", color: "#fca5a5" }}>
            ⚠️ {error} —{" "}
            <button onClick={loadEvents} className="underline font-semibold">Retry</button>
          </div>
        )}

        {/* ── SESSIONS TAB ── */}
        {tab === "sessions" && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { label: "Total sessions",   value: monthEvents.length,  icon: "📅" },
                { label: "Courses active",   value: monthCourses.length, icon: "📚" },
                { label: "Batch 1 sessions", value: batch1Count,         icon: "1️⃣" },
                { label: "Batch 2 sessions", value: batch2Count,         icon: "2️⃣" },
              ].map((card) => (
                <div key={card.label}
                  className="rounded-2xl p-4 relative overflow-hidden"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.09)",
                    backdropFilter: "blur(16px)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07)",
                  }}>
                  <div className="absolute inset-x-0 top-0 h-[40%] rounded-t-2xl pointer-events-none"
                    style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.06) 0%, transparent 100%)" }} />
                  <div className="text-2xl mb-1">{card.icon}</div>
                  <div className="text-2xl font-bold" style={{ color: "#ffffff" }}>{card.value}</div>
                  <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>{card.label}</div>
                </div>
              ))}
            </div>

            {/* Section header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.6)" }}>
                Sessions · {month} {year}
              </h2>
              <button
                onClick={handleAdd}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl transition-all active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #059669, #10b981)",
                  border: "1px solid rgba(52,211,153,0.4)",
                  color: "#ffffff",
                  boxShadow: "0 4px 14px rgba(5,150,105,0.4)",
                }}
              >
                <span className="text-base leading-none">+</span> Add session
              </button>
            </div>

            {/* Table card */}
            <div className="rounded-2xl overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.09)",
                backdropFilter: "blur(20px)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
              }}>
              {loading ? (
                <div className="py-16 text-center text-sm animate-pulse" style={{ color: "rgba(255,255,255,0.35)" }}>
                  Loading sessions from database…
                </div>
              ) : monthEvents.length === 0 ? (
                <div className="py-16 text-center text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
                  No sessions for {month} {year}.{" "}
                  <button onClick={handleAdd} className="underline font-semibold" style={{ color: "rgba(255,255,255,0.6)" }}>
                    + Add session
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.03)" }}>
                        {["#", "Title", "Course", "Batch", "Week", "Dates", "Actions"].map((h) => (
                          <th key={h}
                            className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide"
                            style={{ color: "rgba(255,255,255,0.35)" }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {monthEvents.map((ev, idx) => {
                        const palette    = getCourseColor(ev.course_name, allCourses);
                        const week       = ev.start_date ? dateToWeek(ev.start_date) : "First";
                        const batchLabel = ev.event_type === "both" ? "Both" : ev.event_type === "batch1" ? "Batch 1" : "Batch 2";
                        return (
                          <tr key={ev.id}
                            className="border-t transition-colors"
                            style={{
                              borderColor: "rgba(255,255,255,0.05)",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >
                            <td className="px-4 py-3 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{idx + 1}</td>
                            <td className="px-4 py-3">
                              <p className="font-semibold truncate max-w-[160px]" style={{ color: "#ffffff" }}>{ev.title}</p>
                              {ev.description && (
                                <p className="text-xs truncate max-w-[160px]" style={{ color: "rgba(255,255,255,0.4)" }}>{ev.description}</p>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: palette.dotColor }} />
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full border"
                                  style={{
                                    backgroundColor: palette.bgColor,
                                    borderColor:     palette.borderColor,
                                    color:           "#ffffff",
                                  }}>
                                  {ev.course_name}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                                style={
                                  ev.event_type === "batch1"
                                    ? { background: "rgba(37,99,235,0.25)", border: "1px solid rgba(96,165,250,0.35)", color: "#ffffff" }
                                    : ev.event_type === "batch2"
                                    ? { background: "rgba(124,58,237,0.25)", border: "1px solid rgba(167,139,250,0.35)", color: "#ffffff" }
                                    : { background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "#ffffff" }
                                }>
                                {batchLabel}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                              {WEEK_LABEL[week]}
                            </td>
                            <td className="px-4 py-3 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                              {ev.start_date} → {ev.end_date}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleEdit(ev)}
                                  className="px-3 py-1 rounded-lg text-xs font-semibold transition-colors"
                                  style={{ background: "rgba(245,158,11,0.2)", border: "1px solid rgba(245,158,11,0.3)", color: "#fbbf24" }}
                                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(245,158,11,0.3)")}
                                  onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(245,158,11,0.2)")}
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => ev.id && handleDelete(ev.id)}
                                  disabled={deletingId === ev.id}
                                  className="px-3 py-1 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                                  style={{ background: "rgba(220,38,38,0.2)", border: "1px solid rgba(248,113,113,0.3)", color: "#f87171" }}
                                  onMouseEnter={(e) => { if (deletingId !== ev.id) e.currentTarget.style.background = "rgba(220,38,38,0.3)"; }}
                                  onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(220,38,38,0.2)")}
                                >
                                  {deletingId === ev.id ? "…" : "Delete"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── COURSES TAB ── */}
        {tab === "courses" && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.6)" }}>
                All courses{" "}
                <span style={{ color: "rgba(255,255,255,0.3)", fontWeight: 400 }}>({allCourses.length})</span>
              </h2>
              <button
                onClick={handleAdd}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl transition-all active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #059669, #10b981)",
                  border: "1px solid rgba(52,211,153,0.4)",
                  color: "#ffffff",
                  boxShadow: "0 4px 14px rgba(5,150,105,0.4)",
                }}
              >
                <span className="text-base leading-none">+</span> Add session
              </button>
            </div>

            {loading ? (
              <div className="py-16 text-center text-sm animate-pulse" style={{ color: "rgba(255,255,255,0.35)" }}>Loading…</div>
            ) : allCourses.length === 0 ? (
              <div className="py-16 text-center text-sm rounded-2xl"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.3)",
                }}>
                No courses yet. Add a session to create a course.
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {courseStats.map((c) => (
                  <div key={c.name}
                    className="rounded-2xl border p-4 relative overflow-hidden"
                    style={{
                      backgroundColor: c.palette.bgColor,
                      borderColor:     c.palette.borderColor,
                      backdropFilter:  "blur(12px)",
                      boxShadow:       "inset 0 1px 0 rgba(255,255,255,0.08)",
                    }}>
                    <div className="absolute inset-x-0 top-0 h-[40%] rounded-t-2xl pointer-events-none"
                      style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.07) 0%, transparent 100%)" }} />
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: c.palette.dotColor, boxShadow: `0 0 6px ${c.palette.dotColor}80` }} />
                      <p className="text-sm font-bold truncate" style={{ color: "#ffffff" }}>{c.name}</p>
                    </div>
                    <div className="h-px mb-3" style={{ background: `${c.palette.dotColor}40` }} />
                    <div className="flex gap-4 text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
                      <span>📅 {c.total} sessions</span>
                      <span style={{ color: "#60a5fa" }}>B1: {c.batch1}</span>
                      <span style={{ color: "#a78bfa" }}>B2: {c.batch2}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {showModal && (
        <SessionModal
          event={editingEvent}
          monthIdx={activeMonthIdx}
          allCourses={allCourses}
          onSave={handleModalSave}
          onClose={() => { setShowModal(false); setEditingEvent(null); }}
        />
      )}
    </div>
  );
}
