"use client";
import { useEffect, useState } from "react";

interface Review {
  id: number;
  full_name: string;
  email_id: string;
  course_name: string;
  rating: number;
  review_text: string;
  google_review_url: string;
  photo_url: string;
  status: string;
  submitted_at: string;
}

interface Video {
  id: number;
  full_name: string;
  email_id: string;
  course_name: string;
  video_url: string;
  description: string;
  photo_url: string;
  status: string;
  submitted_at: string;
}

export default function AdminReviewsPage() {
  const [activeTab, setActiveTab] = useState<"reviews" | "videos">("reviews");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const API = process.env.NEXT_PUBLIC_API_URL;

  const fetchData = async () => {
    try {
      const [reviewRes, videoRes] = await Promise.all([
        fetch(`${API}/api/reviews/google/all`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/api/reviews/video/all`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const reviewData = await reviewRes.json();
      const videoData = await videoRes.json();
      setReviews(reviewData.reviews || []);
      setVideos(videoData.videos || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const updateReviewStatus = async (id: number, status: string) => {
    await fetch(`${API}/api/reviews/google/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    fetchData();
  };

  const updateVideoStatus = async (id: number, status: string) => {
    await fetch(`${API}/api/reviews/video/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    fetchData();
  };

  const getStatusColor = (status: string) => {
    if (status === "approved") return "bg-green-100 text-green-700";
    if (status === "rejected") return "bg-red-100 text-red-600";
    return "bg-yellow-100 text-yellow-700";
  };

const getPhotoUrl = (photoUrl: string) => {
  if (!photoUrl) return null;
  const cleaned = photoUrl.replace(/\\/g, "/");
  const withSlash = cleaned.startsWith("/") ? cleaned : `/${cleaned}`;
  return `${API}${withSlash}`;
};

  const filteredReviews = reviews.filter(r => filter === "all" || r.status === filter);
  const filteredVideos = videos.filter(v => filter === "all" || v.status === filter);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Google Reviews & Videos</h1>
        <p className="text-gray-500 text-sm mt-1">Approve content to display on the home page</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Reviews", count: reviews.length, color: "bg-blue-50 text-blue-700" },
          { label: "Approved Reviews", count: reviews.filter(r => r.status === "approved").length, color: "bg-green-50 text-green-700" },
          { label: "Total Videos", count: videos.length, color: "bg-purple-50 text-purple-700" },
          { label: "Approved Videos", count: videos.filter(v => v.status === "approved").length, color: "bg-green-50 text-green-700" },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-xl p-4 text-center ${stat.color}`}>
            <p className="text-2xl font-bold">{stat.count}</p>
            <p className="text-xs font-semibold mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs + Filter */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("reviews")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "reviews" ? "bg-white shadow text-gray-800" : "text-gray-500"
            }`}
          >
            ⭐ Reviews ({reviews.length})
          </button>
          <button
            onClick={() => setActiveTab("videos")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "videos" ? "bg-white shadow text-gray-800" : "text-gray-500"
            }`}
          >
            🎥 Videos ({videos.length})
          </button>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
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
        <>
          {/* Reviews Tab */}
          {activeTab === "reviews" && (
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
                      {r.google_review_url && (
                        <a href={r.google_review_url} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline mb-3 block">
                          🔗 View on Google
                        </a>
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

          {/* Videos Tab */}
          {activeTab === "videos" && (
            filteredVideos.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <div className="text-5xl mb-4">🎥</div>
                <p className="text-gray-400">No videos found.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {filteredVideos.map((v) => {
                  const photoUrl = getPhotoUrl(v.photo_url);
                  const videoUrl = `${API}/${v.video_url.replace(/\\/g, "/")}`;
                  return (
                    <div key={v.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {photoUrl ? (
                            <img src={photoUrl} alt={v.full_name}
                              className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-600 text-sm">
                              {v.full_name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-800">{v.full_name}</p>
                            <p className="text-xs text-gray-400">{v.course_name}</p>
                          </div>
                        </div>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusColor(v.status)}`}>
                          {v.status}
                        </span>
                      </div>

                      {/* Video Player */}
                      <div className="rounded-xl overflow-hidden mb-3 bg-black">
                        <video
                          src={videoUrl}
                          controls
                          className="w-full max-h-64 object-contain"
                          preload="metadata"
                        />
                      </div>

                      {v.description && (
                        <p className="text-sm text-gray-600 mb-3 italic">"{v.description}"</p>
                      )}

                      {v.status === "pending" && (
                        <div className="flex gap-2">
                          <button onClick={() => updateVideoStatus(v.id, "approved")}
                            className="flex-1 text-sm bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-semibold">
                            ✅ Approve & Show on Home
                          </button>
                          <button onClick={() => updateVideoStatus(v.id, "rejected")}
                            className="flex-1 text-sm bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 font-semibold">
                            ❌ Reject
                          </button>
                        </div>
                      )}
                      {v.status === "approved" && (
                        <button onClick={() => updateVideoStatus(v.id, "rejected")}
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
        </>
      )}
    </div>
  );
}
