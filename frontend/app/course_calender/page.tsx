"use client";

import { useEffect, useState, useMemo } from "react";

interface EventType {
  id: number;
  title: string;
  description: string;
  course_name: string;
  start_date: string;
  end_date: string;
  event_type: string;
}

// ─── CONSTANTS ─────────────────────────
const TYPE_CONFIG: Record<string, { color: string; light: string; border: string; icon: string; label: string }> = {
  course:  { color: "#6366F1", light: "#EEF2FF", border: "#C7D2FE", icon: "📚", label: "Course" },
  exam:    { color: "#F43F5E", light: "#FFF1F2", border: "#FECDD3", icon: "✍️", label: "Exam" },
  holiday: { color: "#10B981", light: "#ECFDF5", border: "#A7F3D0", icon: "🎉", label: "Holiday" },
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

// ─── HELPERS ─────────────────────────
function getStatus(start: string, end: string): "upcoming" | "ongoing" | "past" {
  if (!start) return "past";

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const s = new Date(start); s.setHours(0, 0, 0, 0);
  const e = end ? new Date(end) : new Date(start); e.setHours(0, 0, 0, 0);

  if (today < s) return "upcoming";
  if (today > e) return "past";
  return "ongoing";
}

function toDateStr(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function eventSpansDay(ev: EventType, dateStr: string): boolean {
  if (!ev?.start_date) return false;
  const end = ev.end_date || ev.start_date;
  return dateStr >= ev.start_date && dateStr <= end;
}

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ─── MAIN COMPONENT ─────────────────────────
export default function StudentEvents() {
  const today = new Date();

  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & sort
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState<"date" | "type">("date");

  // Calendar navigation
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

  // Selected day for detail panel
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // ─── FETCH ─────────────────────────
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`${API_URL}/api/course-events`);
        const data = await res.json();
        setEvents(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // ─── FILTERED EVENTS ─────────────────────────
  const filteredEvents = useMemo(() => {
    if (!Array.isArray(events)) return [];

    return events
      .filter((e) => {
        if (!e) return false;
        const s = searchTerm.toLowerCase();
        return (
          (!s ||
            e.title?.toLowerCase().includes(s) ||
            e.course_name?.toLowerCase().includes(s) ||
            e.description?.toLowerCase().includes(s)) &&
          (filterType === "all" || e.event_type === filterType) &&
          (filterStatus === "all" || getStatus(e.start_date, e.end_date) === filterStatus)
        );
      })
      .sort((a, b) =>
        sortBy === "date"
          ? (a.start_date || "").localeCompare(b.start_date || "")
          : (a.event_type || "").localeCompare(b.event_type || "")
      );
  }, [events, searchTerm, filterType, filterStatus, sortBy]);

  // ─── STATS ─────────────────────────
  const stats = useMemo(() => {
    if (!Array.isArray(events)) return { total: 0, upcoming: 0, ongoing: 0, exams: 0 };
    return {
      total: events.length,
      upcoming: events.filter(e => getStatus(e.start_date, e.end_date) === "upcoming").length,
      ongoing:  events.filter(e => getStatus(e.start_date, e.end_date) === "ongoing").length,
      exams:    events.filter(e => e.event_type === "exam").length,
    };
  }, [events]);

  // ─── CALENDAR LOGIC ─────────────────────────
  // FIX 1: firstDay is now used to build offset padding cells
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate());

  // FIX 2: Month navigation handlers
  function prevMonth() {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  }

  function nextMonth() {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  }

  // FIX 3: handleDayClick now sets selectedDate state
  function handleDayClick(day: number) {
    const dateStr = toDateStr(currentYear, currentMonth, day);
    setSelectedDate(prev => (prev === dateStr ? null : dateStr));
  }

  // Events for the selected day
  const selectedDayEvents = selectedDate
    ? filteredEvents.filter(e => eventSpansDay(e, selectedDate))
    : [];

  // ─── UPCOMING STRIP ─────────────────────────
  const monthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;

  const upcomingStrip = Array.isArray(filteredEvents)
    ? filteredEvents.filter((e) => {
        const s = getStatus(e.start_date, e.end_date);
        const inMonth =
          e.start_date?.startsWith(monthPrefix) ||
          (e.end_date || e.start_date)?.startsWith(monthPrefix);
        return s === "upcoming" && inMonth;
      })
    : [];

  // ─── UI ─────────────────────────
  return (
    <div style={styles.page}>

      {/* ── HEADER ── */}
      <div style={styles.header}>
        <h1 style={styles.h1}>📅 Student Events</h1>
        <p style={styles.subtitle}>Track your courses, exams, and holidays</p>
      </div>

      {/* ── STATS BAR (FIX 4: all stats now rendered) ── */}
      <div style={styles.statsBar}>
        {[
          { label: "Total",    value: stats.total,    color: "#6366F1" },
          { label: "Upcoming", value: stats.upcoming, color: "#F59E0B" },
          { label: "Ongoing",  value: stats.ongoing,  color: "#10B981" },
          { label: "Exams",    value: stats.exams,    color: "#F43F5E" },
        ].map(s => (
          <div key={s.label} style={{ ...styles.statCard, borderTop: `3px solid ${s.color}` }}>
            <span style={{ ...styles.statValue, color: s.color }}>{s.value}</span>
            <span style={styles.statLabel}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── FILTERS (FIX 5: search, filter, sort controls now rendered) ── */}
      <div style={styles.filterBar}>
        <input
          type="text"
          placeholder="🔍 Search events..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={styles.input}
        />

        <select value={filterType} onChange={e => setFilterType(e.target.value)} style={styles.select}>
          <option value="all">All Types</option>
          {Object.entries(TYPE_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>{v.icon} {v.label}</option>
          ))}
        </select>

        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={styles.select}>
          <option value="all">All Statuses</option>
          <option value="upcoming">Upcoming</option>
          <option value="ongoing">Ongoing</option>
          <option value="past">Past</option>
        </select>

        <select value={sortBy} onChange={e => setSortBy(e.target.value as "date" | "type")} style={styles.select}>
          <option value="date">Sort by Date</option>
          <option value="type">Sort by Type</option>
        </select>
      </div>

      {loading ? (
        <p style={{ textAlign: "center", padding: 40, color: "#6B7280" }}>Loading events…</p>
      ) : (
        <div style={styles.body}>

          {/* ── CALENDAR ── */}
          <div style={styles.calendar}>

            {/* Month navigation (FIX 6: prev/next buttons rendered) */}
            <div style={styles.calNav}>
              <button onClick={prevMonth} style={styles.navBtn}>‹</button>
              <span style={styles.calTitle}>
                {MONTH_NAMES[currentMonth]} {currentYear}
              </span>
              <button onClick={nextMonth} style={styles.navBtn}>›</button>
            </div>

            {/* Day-of-week labels */}
            <div style={styles.dayLabels}>
              {DAY_LABELS.map(d => (
                <div key={d} style={styles.dayLabel}>{d}</div>
              ))}
            </div>

            {/* Calendar grid (FIX 1: firstDay offset cells added) */}
            <div style={styles.grid}>
              {/* Padding cells for offset */}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`pad-${i}`} style={styles.emptyCell} />
              ))}

              {/* Day cells (FIX 7: todayStr used to highlight today) */}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                const dateStr = toDateStr(currentYear, currentMonth, day);
                const dayEvts = filteredEvents.filter(e => eventSpansDay(e, dateStr));
                const isToday = dateStr === todayStr;
                const isSelected = dateStr === selectedDate;

                return (
                  <div
                    key={dateStr}
                    onClick={() => handleDayClick(day)}
                    style={{
                      ...styles.cell,
                      background: isSelected ? "#6366F1" : isToday ? "#EEF2FF" : "#fff",
                      color: isSelected ? "#fff" : isToday ? "#6366F1" : "#111",
                      fontWeight: isToday ? 700 : 400,
                      border: isSelected
                        ? "2px solid #4F46E5"
                        : isToday
                        ? "2px solid #A5B4FC"
                        : "1px solid #E5E7EB",
                    }}
                  >
                    <span style={styles.dayNum}>{day}</span>

                    {/* Event dots (FIX 8: TYPE_CONFIG used for dot colors) */}
                    <div style={styles.dots}>
                      {dayEvts.slice(0, 3).map((ev, di) => {
                        const cfg = TYPE_CONFIG[ev.event_type] ?? { color: "#9CA3AF" };
                        return (
                          <span
                            key={di}
                            style={{
                              ...styles.dot,
                              background: isSelected ? "#fff" : cfg.color,
                            }}
                            title={ev.title}
                          />
                        );
                      })}
                      {dayEvts.length > 3 && (
                        <span style={{ fontSize: 9, color: isSelected ? "#ddd" : "#9CA3AF" }}>
                          +{dayEvts.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected day detail panel (FIX 3: renders events for clicked day) */}
            {selectedDate && (
              <div style={styles.dayPanel}>
                <div style={styles.dayPanelHeader}>
                  <strong>{selectedDate}</strong>
                  <button onClick={() => setSelectedDate(null)} style={styles.closeBtn}>✕</button>
                </div>
                {selectedDayEvents.length === 0 ? (
                  <p style={{ color: "#9CA3AF", fontSize: 13 }}>No events on this day.</p>
                ) : (
                  selectedDayEvents.map(ev => {
                    const cfg = TYPE_CONFIG[ev.event_type] ?? { color: "#9CA3AF", light: "#F3F4F6", border: "#E5E7EB", icon: "📌", label: ev.event_type };
                    return (
                      <div key={ev.id} style={{ ...styles.eventCard, background: cfg.light, border: `1px solid ${cfg.border}` }}>
                        <div style={styles.eventCardTop}>
                          <span>{cfg.icon}</span>
                          <strong style={{ color: cfg.color, fontSize: 13 }}>{ev.title}</strong>
                          <span style={{ ...styles.badge, background: cfg.color }}>{cfg.label}</span>
                        </div>
                        {ev.course_name && <p style={styles.eventMeta}>📖 {ev.course_name}</p>}
                        {ev.description && <p style={styles.eventDesc}>{ev.description}</p>}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* ── RIGHT PANEL ── */}
          <div style={styles.right}>

            {/* Upcoming strip (FIX 9: upcomingStrip now rendered) */}
            {upcomingStrip.length > 0 && (
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>⏳ Upcoming This Month</h3>
                {upcomingStrip.map(ev => {
                  const cfg = TYPE_CONFIG[ev.event_type] ?? { color: "#9CA3AF", light: "#F3F4F6", border: "#E5E7EB", icon: "📌", label: ev.event_type };
                  return (
                    <div key={ev.id} style={{ ...styles.listCard, borderLeft: `4px solid ${cfg.color}` }}>
                      <div style={styles.listCardTop}>
                        <span>{cfg.icon} <strong>{ev.title}</strong></span>
                        <span style={{ ...styles.badge, background: cfg.color }}>{cfg.label}</span>
                      </div>
                      <p style={styles.eventMeta}>{ev.start_date}{ev.end_date && ev.end_date !== ev.start_date ? ` → ${ev.end_date}` : ""}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* All filtered events list */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>📋 All Events ({filteredEvents.length})</h3>
              {filteredEvents.length === 0 ? (
                <p style={{ color: "#9CA3AF", fontSize: 13 }}>No events match your filters.</p>
              ) : (
                filteredEvents.map(ev => {
                  const cfg = TYPE_CONFIG[ev.event_type] ?? { color: "#9CA3AF", light: "#F3F4F6", border: "#E5E7EB", icon: "📌", label: ev.event_type };
                  const status = getStatus(ev.start_date, ev.end_date);
                  const statusColor = status === "upcoming" ? "#F59E0B" : status === "ongoing" ? "#10B981" : "#9CA3AF";
                  return (
                    <div key={ev.id} style={{ ...styles.listCard, borderLeft: `4px solid ${cfg.color}` }}>
                      <div style={styles.listCardTop}>
                        <span>{cfg.icon} <strong>{ev.title}</strong></span>
                        <div style={{ display: "flex", gap: 4 }}>
                          <span style={{ ...styles.badge, background: cfg.color }}>{cfg.label}</span>
                          <span style={{ ...styles.badge, background: statusColor }}>{status}</span>
                        </div>
                      </div>
                      {ev.course_name && <p style={styles.eventMeta}>📖 {ev.course_name}</p>}
                      <p style={styles.eventMeta}>
                        🗓 {ev.start_date}
                        {ev.end_date && ev.end_date !== ev.start_date ? ` → ${ev.end_date}` : ""}
                      </p>
                      {ev.description && <p style={styles.eventDesc}>{ev.description}</p>}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── STYLES ─────────────────────────
const styles: Record<string, React.CSSProperties> = {
  page:         { fontFamily: "'Segoe UI', sans-serif", maxWidth: 1100, margin: "0 auto", padding: "24px 16px", color: "#111" },
  header:       { marginBottom: 20 },
  h1:           { fontSize: 26, fontWeight: 700, margin: 0 },
  subtitle:     { color: "#6B7280", margin: "4px 0 0", fontSize: 14 },
  statsBar:     { display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" },
  statCard:     { flex: "1 1 120px", background: "#fff", borderRadius: 10, padding: "14px 18px", boxShadow: "0 1px 4px rgba(0,0,0,.07)", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 },
  statValue:    { fontSize: 26, fontWeight: 800 },
  statLabel:    { fontSize: 12, color: "#6B7280", textTransform: "uppercase", letterSpacing: ".5px" },
  filterBar:    { display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" },
  input:        { flex: "2 1 200px", padding: "8px 12px", border: "1px solid #D1D5DB", borderRadius: 8, fontSize: 14, outline: "none" },
  select:       { flex: "1 1 140px", padding: "8px 10px", border: "1px solid #D1D5DB", borderRadius: 8, fontSize: 14, background: "#fff", cursor: "pointer" },
  body:         { display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" },
  calendar:     { flex: "0 0 340px", background: "#fff", borderRadius: 14, boxShadow: "0 2px 8px rgba(0,0,0,.08)", padding: 16 },
  calNav:       { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  calTitle:     { fontWeight: 700, fontSize: 16 },
  navBtn:       { background: "#F3F4F6", border: "none", borderRadius: 8, width: 30, height: 30, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" },
  dayLabels:    { display: "grid", gridTemplateColumns: "repeat(7,1fr)", marginBottom: 4 },
  dayLabel:     { textAlign: "center", fontSize: 11, fontWeight: 600, color: "#9CA3AF", padding: "4px 0" },
  grid:         { display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3 },
  emptyCell:    { height: 48, borderRadius: 8 },
  cell:         { height: 48, borderRadius: 8, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, transition: "transform .1s", userSelect: "none" },
  dayNum:       { fontSize: 13 },
  dots:         { display: "flex", gap: 2, alignItems: "center" },
  dot:          { width: 5, height: 5, borderRadius: "50%", display: "inline-block" },
  dayPanel:     { marginTop: 14, padding: 14, background: "#F9FAFB", borderRadius: 10, border: "1px solid #E5E7EB" },
  dayPanelHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  closeBtn:     { background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#6B7280" },
  right:        { flex: "1 1 340px", display: "flex", flexDirection: "column", gap: 16 },
  section:      { background: "#fff", borderRadius: 14, boxShadow: "0 2px 8px rgba(0,0,0,.08)", padding: 16 },
  sectionTitle: { margin: "0 0 12px", fontSize: 15, fontWeight: 700 },
  eventCard:    { borderRadius: 8, padding: "10px 12px", marginBottom: 8 },
  eventCardTop: { display: "flex", alignItems: "center", gap: 6, marginBottom: 4 },
  listCard:     { padding: "10px 14px", marginBottom: 8, borderRadius: 8, background: "#F9FAFB", border: "1px solid #E5E7EB" },
  listCardTop:  { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4, flexWrap: "wrap", gap: 4 },
  badge:        { fontSize: 10, color: "#fff", padding: "2px 7px", borderRadius: 20, fontWeight: 600, textTransform: "capitalize" },
  eventMeta:    { margin: "2px 0", fontSize: 12, color: "#6B7280" },
  eventDesc:    { margin: "4px 0 0", fontSize: 12, color: "#374151" },
};
