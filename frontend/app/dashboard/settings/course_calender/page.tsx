"use client";

import { useEffect, useState, useCallback } from "react";

interface EventType {
  id: number;
  title: string;
  description: string;
  course_name: string;
  start_date: string;
  end_date: string;
  event_type: string;
}

type FormData = Omit<EventType, "id">;

const EMPTY_FORM: FormData = {
  title: "",
  description: "",
  course_name: "",
  start_date: "",
  end_date: "",
  event_type: "course",
};

const EVENT_COLORS: Record<string, string> = {
  course: "#3B82F6",
  exam: "#EF4444",
  holiday: "#10B981",
};

const EVENT_BG: Record<string, string> = {
  course: "#EFF6FF",
  exam: "#FEF2F2",
  holiday: "#ECFDF5",
};

// FIX 3: API base URL from env, not hardcoded
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export default function AdminCalendar() {
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [editingEvent, setEditingEvent] = useState<EventType | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [sortField, setSortField] = useState<keyof EventType>("start_date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const showToast = useCallback((msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/course-events`);
      // FIX 4: check response status
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data: EventType[] = await res.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      showToast("Failed to fetch events", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.end_date && new Date(form.end_date) < new Date(form.start_date)) {
      showToast("End date cannot be before start date", "error");
      return;
    }

    try {
      let res: Response;

      if (editingEvent) {
        res = await fetch(`${API_URL}/api/course-events/${editingEvent.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      } else {
        res = await fetch(`${API_URL}/api/course-events`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }

      // FIX 4: check response status
      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      showToast(editingEvent ? "Event updated successfully!" : "Event added successfully!");
      setForm(EMPTY_FORM);
      setEditingEvent(null);
      setShowForm(false);
      // FIX 5: fetchEvents is stable via useCallback — safe to call directly
      fetchEvents();
    } catch (err) {
      console.error(err);
      showToast("Operation failed", "error");
    }
  };

  const startEdit = (event: EventType) => {
    setEditingEvent(event);
    setForm({
      title: event.title,
      description: event.description ?? "",
      course_name: event.course_name ?? "",
      start_date: event.start_date,
      end_date: event.end_date ?? "",
      event_type: event.event_type,
    });
    setShowForm(true);
  };

  const deleteEvent = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/api/course-events/${id}`, { method: "DELETE" });
      // FIX 4: check response status
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      setConfirmDelete(null);
      showToast("Event deleted!");
      fetchEvents();
    } catch (err) {
      console.error(err);
      showToast("Delete failed", "error");
    }
  };

  const bulkDelete = async () => {
    // FIX 2: capture count BEFORE clearing the set
    const count = selectedIds.size;

    try {
      const results = await Promise.allSettled(
        [...selectedIds].map((id) =>
          fetch(`${API_URL}/api/course-events/${id}`, { method: "DELETE" }).then((res) => {
            if (!res.ok) throw new Error(`Failed for id ${id}`);
          })
        )
      );

      const failed = results.filter((r) => r.status === "rejected").length;

      setSelectedIds(new Set());
      fetchEvents();

      if (failed > 0) {
        showToast(`${count - failed} deleted, ${failed} failed`, "error");
      } else {
        showToast(`${count} event${count !== 1 ? "s" : ""} deleted!`);
      }
    } catch (err) {
      console.error(err);
      showToast("Bulk delete failed", "error");
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredEvents.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredEvents.map((e) => e.id)));
    }
  };

  const handleSort = (field: keyof EventType) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
  };

  // FIX 1: optional chaining to guard against null/undefined fields
  const filteredEvents = events
    .filter((e) => {
      const term = searchTerm.toLowerCase();
      const matchSearch =
        (e.title?.toLowerCase() ?? "").includes(term) ||
        (e.course_name?.toLowerCase() ?? "").includes(term);
      const matchType = filterType === "all" || e.event_type === filterType;
      return matchSearch && matchType;
    })
    .sort((a, b) => {
      const av = a[sortField] ?? "";
      const bv = b[sortField] ?? "";
      return sortDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });

  const stats = {
    total: events.length,
    course: events.filter((e) => e.event_type === "course").length,
    exam: events.filter((e) => e.event_type === "exam").length,
    holiday: events.filter((e) => e.event_type === "holiday").length,
  };

  const SortIcon = ({ field }: { field: keyof EventType }) => (
    <span className="ml-1 text-gray-400">
      {sortField === field ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
    </span>
  );

  const closeForm = () => {
    setShowForm(false);
    setEditingEvent(null);
    setForm(EMPTY_FORM);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* TOAST */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-lg shadow-lg text-white font-medium transition-all ${
            toast.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {confirmDelete !== null && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 shadow-xl w-80">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Confirm Delete</h3>
            <p className="text-gray-500 mb-4">Are you sure you want to delete this event?</p>
            <div className="flex gap-3">
              <button
                onClick={() => deleteEvent(confirmDelete)}
                className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 font-medium"
              >
                Delete
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FORM MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                {editingEvent ? "✏️ Edit Event" : "➕ Add New Event"}
              </h2>
              <button
                onClick={closeForm}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* NOTE: intentionally not a <form> tag to avoid default browser submit behavior in some environments */}
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  name="title"
                  placeholder="Event title"
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
                <input
                  name="course_name"
                  placeholder="Course name"
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.course_name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                <select
                  name="event_type"
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.event_type}
                  onChange={handleChange}
                >
                  <option value="course">📚 Course</option>
                  <option value="exam">📝 Exam</option>
                  <option value="holiday">🎉 Holiday</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                <input
                  type="date"
                  name="start_date"
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.start_date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  name="end_date"
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.end_date}
                  onChange={handleChange}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  placeholder="Event description..."
                  rows={3}
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  value={form.description}
                  onChange={handleChange}
                />
              </div>
              <div className="md:col-span-2 flex gap-3">
                <button
                  onClick={handleSubmit}
                  disabled={!form.title || !form.start_date}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingEvent ? "Update Event" : "Add Event"}
                </button>
                <button
                  onClick={closeForm}
                  className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg hover:bg-gray-200 font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">📅 Course Calendar</h1>
          <p className="text-gray-500 text-sm mt-1">Admin Panel — Manage all events</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingEvent(null); setForm(EMPTY_FORM); }}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 font-semibold shadow transition flex items-center gap-2"
        >
          + Add Event
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Events", value: stats.total,   color: "#6366F1", bg: "#EEF2FF",        icon: "📋" },
          { label: "Courses",      value: stats.course,  color: EVENT_COLORS.course,  bg: EVENT_BG.course,  icon: "📚" },
          { label: "Exams",        value: stats.exam,    color: EVENT_COLORS.exam,    bg: EVENT_BG.exam,    icon: "📝" },
          { label: "Holidays",     value: stats.holiday, color: EVENT_COLORS.holiday, bg: EVENT_BG.holiday, icon: "🎉" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">{s.icon}</span>
              <span className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</span>
            </div>
            <p className="text-sm text-gray-500 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* SEARCH + FILTER + BULK */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="🔍 Search events or courses..."
          className="flex-1 min-w-48 border border-gray-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="border border-gray-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">All Types</option>
          <option value="course">📚 Course</option>
          <option value="exam">📝 Exam</option>
          <option value="holiday">🎉 Holiday</option>
        </select>
        {selectedIds.size > 0 && (
          <button
            onClick={bulkDelete}
            className="bg-red-500 text-white px-4 py-2.5 rounded-lg hover:bg-red-600 text-sm font-semibold flex items-center gap-1 transition"
          >
            🗑️ Delete {selectedIds.size} selected
          </button>
        )}
        <span className="text-sm text-gray-400 ml-auto">
          {filteredEvents.length} of {events.length} events
        </span>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="text-center p-12">
            <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 mt-3">Loading events...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-3 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === filteredEvents.length && filteredEvents.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded"
                    />
                  </th>
                  {(
                    [
                      { label: "Title",      field: "title"      as keyof EventType },
                      { label: "Course",     field: "course_name" as keyof EventType },
                      { label: "Start Date", field: "start_date" as keyof EventType },
                      { label: "End Date",   field: "end_date"   as keyof EventType },
                      { label: "Type",       field: "event_type" as keyof EventType },
                    ] as const
                  ).map(({ label, field }) => (
                    <th
                      key={field}
                      className="p-3 text-left font-semibold text-gray-600 cursor-pointer hover:text-gray-800 select-none"
                      onClick={() => handleSort(field)}
                    >
                      {label}<SortIcon field={field} />
                    </th>
                  ))}
                  <th className="p-3 text-left font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-12 text-gray-400">
                      <div className="text-4xl mb-2">📭</div>
                      No events found
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((event) => (
                    <tr
                      key={event.id}
                      className={`border-b border-gray-50 hover:bg-gray-50 transition ${
                        selectedIds.has(event.id) ? "bg-blue-50" : ""
                      }`}
                    >
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(event.id)}
                          onChange={() => toggleSelect(event.id)}
                          className="rounded"
                        />
                      </td>
                      <td className="p-3 font-medium text-gray-800">{event.title}</td>
                      <td className="p-3 text-gray-600">{event.course_name || "—"}</td>
                      <td className="p-3 text-gray-600">{event.start_date}</td>
                      <td className="p-3 text-gray-600">{event.end_date || "—"}</td>
                      <td className="p-3">
                        <span
                          className="px-2.5 py-1 rounded-full text-xs font-semibold capitalize"
                          style={{
                            color: EVENT_COLORS[event.event_type] ?? "#6B7280",
                            background: EVENT_BG[event.event_type] ?? "#F3F4F6",
                          }}
                        >
                          {event.event_type === "course"
                            ? "📚"
                            : event.event_type === "exam"
                            ? "📝"
                            : "🎉"}{" "}
                          {event.event_type}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(event)}
                            className="bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-lg hover:bg-yellow-200 text-xs font-semibold transition"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => setConfirmDelete(event.id)}
                            className="bg-red-100 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-200 text-xs font-semibold transition"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
