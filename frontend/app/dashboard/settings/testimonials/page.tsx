"use client";
import { useEffect, useState } from "react";

interface Feedback {
  id: number;
  full_name: string;
  email_id: string;
  course_name: string;
  rating: number;
  feedback_text: string;
  testimonial: string;
  photo_url: string;
  status: string;
  submitted_at: string;
}

export default function AdminTestimonialsPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const API = process.env.NEXT_PUBLIC_API_URL;

  const fetchFeedback = async () => {
    try {
      const res = await fetch(`${API}/api/placement-feedback/feedback/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setFeedback(data.feedback || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFeedback(); }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      await fetch(`${API}/api/placement-feedback/feedback/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      fetchFeedback();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = feedback.filter((f) =>
    filter === "all" || f.status === filter
  );

  const getStatusColor = (status: string) => {
    if (status === "approved") return "bg-green-100 text-green-700";
    if (status === "rejected") return "bg-red-100 text-red-600";
    return "bg-yellow-100 text-yellow-700";
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Testimonials</h1>
        <p className="text-gray-500 text-sm mt-1">
          Approve testimonials to display them on the home page
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total", count: feedback.length, color: "bg-blue-50 text-blue-700" },
          { label: "Approved", count: feedback.filter(f => f.status === "approved").length, color: "bg-green-50 text-green-700" },
          { label: "Pending", count: feedback.filter(f => f.status === "pending").length, color: "bg-yellow-50 text-yellow-700" },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-xl p-4 text-center ${stat.color}`}>
            <p className="text-2xl font-bold">{stat.count}</p>
            <p className="text-xs font-semibold mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="mb-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <div className="text-5xl mb-4">💬</div>
          <p className="text-gray-400">No testimonials found.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((f) => (
            <div key={f.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {f.photo_url ? (
                    <img src={`${API}/${f.photo_url.replace(/\\/g, '/')}`} alt={f.full_name}
                      className="w-12 h-12 rounded-full object-cover border border-gray-200" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                      {f.full_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-800">{f.full_name}</p>
                    <p className="text-xs text-gray-400">{f.course_name}</p>
                    <div className="flex gap-0.5 mt-1">
                      {[1,2,3,4,5].map((s) => (
                        <span key={s} className="text-sm">{s <= f.rating ? "⭐" : "☆"}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusColor(f.status)}`}>
                  {f.status}
                </span>
              </div>

              {/* Feedback */}
              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-500 mb-1">FEEDBACK</p>
                <p className="text-sm text-gray-700">{f.feedback_text}</p>
              </div>

              {/* Testimonial */}
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4">
                <p className="text-xs font-semibold text-blue-600 mb-1">TESTIMONIAL (Home Page)</p>
                <p className="text-sm text-gray-700 italic">"{f.testimonial}"</p>
              </div>

              {/* Actions */}
              {f.status === "pending" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => updateStatus(f.id, "approved")}
                    className="flex-1 text-sm bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-semibold"
                  >
                    ✅ Approve & Show on Home
                  </button>
                  <button
                    onClick={() => updateStatus(f.id, "rejected")}
                    className="flex-1 text-sm bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 font-semibold"
                  >
                    ❌ Reject
                  </button>
                </div>
              )}
              {f.status === "approved" && (
                <button
                  onClick={() => updateStatus(f.id, "rejected")}
                  className="text-xs text-red-500 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50"
                >
                  Remove from home page
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
