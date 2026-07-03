"use client";
import { useEffect, useState } from "react";

export default function AdminJustDialReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const API = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${API}/api/reviews/justdial/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.reviews) setReviews(data.reviews);
    } catch (err) {
      console.error("Error fetching justdial reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateReviewStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`${API}/api/reviews/justdial/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setReviews(reviews.map(r => r.id === id ? { ...r, status } : r));
      } else {
        alert("Failed to update status");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating status");
    }
  };

  const getStatusColor = (status: string) => {
    if (status === "approved") return "bg-green-100 text-green-700";
    if (status === "rejected") return "bg-red-100 text-red-700";
    return "bg-yellow-100 text-yellow-700";
  };

  const getPhotoUrl = (url: string | null) => {
    if (!url) return null;
    return url.startsWith("http") ? url : `${API}${url}`;
  };

  const filteredReviews = reviews.filter(r => statusFilter === "all" || r.status === statusFilter);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Just Dial Reviews</h1>
          <p className="text-gray-500 text-sm mt-1">Approve or reject student Just Dial reviews</p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading...</div>
      ) : (
        filteredReviews.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <div className="text-5xl mb-4">⭐</div>
            <p className="text-gray-400">No reviews found.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredReviews.map((r) => {
              const photoUrl = getPhotoUrl(r.photo_url);
              return (
                <div key={r.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {photoUrl ? (
                        <img src={photoUrl} alt={r.full_name}
                          className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-sm">
                          {r.full_name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-800">{r.full_name}</p>
                        <p className="text-xs text-gray-400">{r.course_name}</p>
                        <div className="flex gap-0.5 mt-1">
                          {[1,2,3,4,5].map(s => (
                            <span key={s} className="text-sm">{s <= r.rating ? "⭐" : "☆"}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusColor(r.status)}`}>
                      {r.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 mb-3 italic">"{r.review_text}"</p>
                  {r.justdial_review_url && (
                    <a href={r.justdial_review_url} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline mb-3 block">
                      🔗 View on Just Dial
                    </a>
                  )}
                  {r.completion_video_url && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-gray-500 mb-1">Attached Video:</p>
                      <video src={`${API}${r.completion_video_url}`} controls className="w-full max-w-sm rounded-lg border border-gray-200" />
                    </div>
                  )}
                  {r.status === "pending" && (
                    <div className="flex gap-2">
                      <button onClick={() => updateReviewStatus(r.id, "approved")}
                        className="flex-1 text-sm bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-semibold">
                        ✅ Approve
                      </button>
                      <button onClick={() => updateReviewStatus(r.id, "rejected")}
                        className="flex-1 text-sm bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 font-semibold">
                        ❌ Reject
                      </button>
                    </div>
                  )}
                  {r.status === "approved" && (
                    <button onClick={() => updateReviewStatus(r.id, "rejected")}
                      className="text-xs text-red-500 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50">
                      Remove from home page
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
