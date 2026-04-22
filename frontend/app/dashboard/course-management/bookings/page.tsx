"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Loader2, AlertCircle, Search, Phone, Mail } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

interface Booking {
  id:           number;
  name:         string;
  email:        string;
  phone:        string;
  address:      string;
  demo_date:    string;
  demo_time:    string;
  course_title: string;
  created_at:   string;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filtered, setFiltered] = useState<Booking[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [search, setSearch]     = useState("");

  useEffect(() => { fetchBookings(); }, []);

  useEffect(() => {
    if (!search) { setFiltered(bookings); return; }
    const q = search.toLowerCase();
    setFiltered(bookings.filter(b =>
      b.name.toLowerCase().includes(q) ||
      b.email.toLowerCase().includes(q) ||
      b.phone.includes(q) ||
      (b.course_title ?? "").toLowerCase().includes(q)
    ));
  }, [bookings, search]);

async function fetchBookings() {
  try {
    const res = await fetch(`${API}/api/bookings`);

    if (!res.ok) {
      setError(`Failed to load bookings (${res.status})`);
      return; // ← don't call setBookings with bad data
    }

    const data = await res.json();

    // Guard in case backend returns non-array
    if (!Array.isArray(data)) {
      console.error("Unexpected response:", data);
      setError("Unexpected response from server");
      return;
    }

    setBookings(data);
    setFiltered(data);
  } catch {
    setError("Failed to load bookings");
  } finally {
    setLoading(false);
  }
}

  const fmt = (d: string) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Demo Bookings</h2>
          <p className="text-sm text-slate-500 mt-0.5">{bookings.length} total requests</p>
        </div>
        <div className="flex items-center gap-2 bg-violet-50 border border-violet-100 rounded-xl px-4 py-2">
          <CalendarDays className="w-4 h-4 text-violet-500" />
          <span className="text-sm font-bold text-violet-700">{bookings.length} Bookings</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name, email, course..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <CalendarDays className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No bookings yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {["#", "Student", "Contact", "Course", "Demo Slot", "Location", "Booked On"].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-black uppercase tracking-wider text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((b, i) => (
                  <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4 text-xs text-slate-400 font-mono">{i + 1}</td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800 text-sm">{b.name}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-0.5">
                        <Mail className="w-3 h-3" /> {b.email}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Phone className="w-3 h-3" /> {b.phone}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-block bg-violet-50 text-violet-700 text-xs font-semibold px-2.5 py-1 rounded-lg max-w-[180px] truncate">
                        {b.course_title ?? "—"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-slate-700">{fmt(b.demo_date)}</p>
                      <p className="text-xs text-slate-400">{b.demo_time}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-500">{b.address || "—"}</td>
                    <td className="px-5 py-4 text-xs text-slate-400">{fmt(b.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
