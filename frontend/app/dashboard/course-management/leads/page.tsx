"use client";

import { useEffect, useState } from "react";
import { Inbox, Loader2, AlertCircle, Search, Phone, Mail, Download } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

interface Lead {
  id:           number;
  name:         string;
  email:        string;
  phone:        string;
  course_title: string;
  created_at:   string;
}

export default function LeadsPage() {
  const [leads,    setLeads]    = useState<Lead[]>([]);
  const [filtered, setFiltered] = useState<Lead[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [search,   setSearch]   = useState("");

  useEffect(() => { fetchLeads(); }, []);

  useEffect(() => {
    if (!search) { setFiltered(leads); return; }
    const q = search.toLowerCase();
    setFiltered(leads.filter(l =>
      l.name.toLowerCase().includes(q) ||
      l.email.toLowerCase().includes(q) ||
      l.phone.includes(q) ||
      (l.course_title ?? "").toLowerCase().includes(q)
    ));
  }, [leads, search]);

async function fetchLeads() {
  try {
    const res = await fetch(`${API}/api/leads`);

    if (!res.ok) {
      setError(`Failed to load leads (${res.status})`);
      return; // ← stops setLeads from being called with bad data
    }

    const data = await res.json();

    if (!Array.isArray(data)) {
      console.error("Unexpected leads response:", data);
      setError("Unexpected response from server");
      return;
    }

    setLeads(data);
    setFiltered(data);
  } catch {
    setError("Failed to load leads");
  } finally {
    setLoading(false);
  }
}

  // CSV export
  function exportCSV() {
    const headers = ["ID", "Name", "Email", "Phone", "Course", "Date"];
    const rows    = filtered.map(l => [
      l.id, l.name, l.email, l.phone,
      l.course_title ?? "", new Date(l.created_at).toLocaleDateString("en-IN"),
    ]);
    const csv  = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `brochure-leads-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const fmt = (d: string) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Brochure Leads</h2>
          <p className="text-sm text-slate-500 mt-0.5">{leads.length} students downloaded brochures</p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-xl transition shadow-md shadow-emerald-200 text-sm"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Stats strip */}
     {/* Stats strip — only render when data is loaded and valid */}
{!loading && !error && (
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
    {[
      { label: "Total Leads",    value: leads.length, color: "bg-blue-50 text-blue-700" },
      { label: "This Month",     value: leads.filter(l => new Date(l.created_at).getMonth() === new Date().getMonth()).length, color: "bg-violet-50 text-violet-700" },
      { label: "Unique Courses", value: new Set(leads.map(l => l.course_title)).size, color: "bg-amber-50 text-amber-700" },
      { label: "Today",          value: leads.filter(l => new Date(l.created_at).toDateString() === new Date().toDateString()).length, color: "bg-emerald-50 text-emerald-700" },
    ].map(s => (
      <div key={s.label} className={`rounded-2xl border border-white/50 px-5 py-4 ${s.color}`}>
        <p className="text-2xl font-black">{s.value}</p>
        <p className="text-xs font-semibold opacity-70 mt-0.5">{s.label}</p>
      </div>
    ))}
  </div>
)}

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
            <Inbox className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No leads yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {["#", "Name", "Contact", "Course Interested In", "Downloaded On"].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-black uppercase tracking-wider text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((l, i) => (
                  <tr key={l.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4 text-xs text-slate-400 font-mono">{i + 1}</td>
                    <td className="px-5 py-4 font-semibold text-slate-800 text-sm">{l.name}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-0.5">
                        <Mail className="w-3 h-3" /> {l.email}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Phone className="w-3 h-3" /> {l.phone}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-lg max-w-[200px] truncate">
                        {l.course_title ?? "—"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500">{fmt(l.created_at)}</td>
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
