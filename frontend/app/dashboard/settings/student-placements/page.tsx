"use client";
import { useEffect, useState } from "react";

interface Placement {
  id: number;
  full_name: string;
  email_id: string;
  photo_url: string;
  course_name: string;
  company_name: string;
  position: string;
  salary: string;
  job_location: string;
  offer_letter_url: string;
  status: string;
  submitted_at: string;
}

export default function AdminPlacementsPage() {
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const API = process.env.NEXT_PUBLIC_API_URL;

  const fetchPlacements = async () => {
    try {
      const res = await fetch(`${API}/api/placement-feedback/placement/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setPlacements(data.placements || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlacements(); }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      await fetch(`${API}/api/placement-feedback/placement/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      fetchPlacements();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = placements.filter((p) => {
    const matchSearch =
      p.full_name.toLowerCase().includes(search.toLowerCase()) ||
      p.company_name.toLowerCase().includes(search.toLowerCase()) ||
      p.course_name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || p.status === filter;
    return matchSearch && matchFilter;
  });

  const getStatusColor = (status: string) => {
    if (status === "verified") return "bg-green-100 text-green-700";
    if (status === "rejected") return "bg-red-100 text-red-600";
    return "bg-yellow-100 text-yellow-700";
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Student Placements</h1>
        <p className="text-gray-500 text-sm mt-1">View and verify student placement details</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total", count: placements.length, color: "bg-blue-50 text-blue-700" },
          { label: "Verified", count: placements.filter(p => p.status === "verified").length, color: "bg-green-50 text-green-700" },
          { label: "Pending", count: placements.filter(p => p.status === "pending").length, color: "bg-yellow-50 text-yellow-700" },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-xl p-4 text-center ${stat.color}`}>
            <p className="text-2xl font-bold">{stat.count}</p>
            <p className="text-xs font-semibold mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <input
          className="flex-1 max-w-sm border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none"
          placeholder="Search by name, company, course..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <div className="text-5xl mb-4">🎯</div>
          <p className="text-gray-400">No placements found.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((p) => (
            <div key={p.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 mb-3">
                  {p.photo_url ? (
                    <img src={`${API}/${p.photo_url.replace(/\\/g, '/')}`} alt={p.full_name}
                      className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-sm">
                      {p.full_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-800">{p.full_name}</p>
                    <p className="text-xs text-gray-400">{p.email_id} · {p.course_name}</p>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusColor(p.status)}`}>
                  {p.status}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {[
                  { label: "Company", value: p.company_name },
                  { label: "Position", value: p.position },
                  { label: "Salary", value: p.salary },
                  { label: "Location", value: p.job_location },
                ].map((item) => (
                  <div key={item.label} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                    <p className="text-sm font-semibold text-gray-800">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                {p.offer_letter_url ? (
                  <a
                    href={`${API}${p.offer_letter_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 text-xs font-semibold hover:underline flex items-center gap-1"
                  >
                    📄 View Offer Letter
                  </a>
                ) : (
                  <span className="text-xs text-gray-400">No offer letter uploaded</span>
                )}

                {p.status === "pending" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateStatus(p.id, "verified")}
                      className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700"
                    >
                      ✅ Verify
                    </button>
                    <button
                      onClick={() => updateStatus(p.id, "rejected")}
                      className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600"
                    >
                      ❌ Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
