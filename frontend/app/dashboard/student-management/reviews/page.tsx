"use client";
import { useEffect, useState } from "react";

export default function StudentReviewsPage() {
  const [activeTab, setActiveTab] = useState<"review" | "video">("review");

  // Google Review state
  const [reviewForm, setReviewForm] = useState({ rating: 5, review_text: "", google_review_url: "" });
  const [existingReview, setExistingReview] = useState<any>(null);
  const [savingReview, setSavingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [reviewError, setReviewError] = useState("");

  // Video state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [existingVideo, setExistingVideo] = useState<any>(null);
  const [savingVideo, setSavingVideo] = useState(false);
  const [videoSuccess, setVideoSuccess] = useState("");
  const [videoError, setVideoError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  // Google link
  const [googleLink, setGoogleLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const API = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reviewRes, videoRes, linkRes] = await Promise.all([
          fetch(`${API}/api/reviews/google/my`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API}/api/reviews/video/my`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API}/api/reviews/google-link`),
        ]);
        const reviewData = await reviewRes.json();
        const videoData = await videoRes.json();
        const linkData = await linkRes.json();

        if (reviewData.review) {
          setExistingReview(reviewData.review);
          setReviewForm({
            rating: reviewData.review.rating,
            review_text: reviewData.review.review_text,
            google_review_url: reviewData.review.google_review_url || "",
          });
        }
        if (videoData.video) setExistingVideo(videoData.video);
        if (linkData.link) setGoogleLink(linkData.link);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleReviewSubmit = async () => {
    if (!reviewForm.review_text) { setReviewError("Please write your review."); return; }
    setSavingReview(true); setReviewError(""); setReviewSuccess("");
    try {
      const res = await fetch(`${API}/api/reviews/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(reviewForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setReviewSuccess(existingReview ? "Review updated!" : "Review submitted successfully!");
      setExistingReview({ ...reviewForm, status: "pending" });
    } catch (err: any) {
      setReviewError(err.message);
    } finally {
      setSavingReview(false);
    }
  };

  const handleVideoSubmit = async () => {
    if (!videoFile && !existingVideo) { setVideoError("Please select a video file."); return; }
    if (!videoFile) { setVideoError("Please select a new video file to update."); return; }
    setSavingVideo(true); setVideoError(""); setVideoSuccess(""); setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("video", videoFile);
      formData.append("description", description);

      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setUploadProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      await new Promise<void>((resolve, reject) => {
        xhr.open("POST", `${API}/api/reviews/video`);
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(JSON.parse(xhr.responseText).error || "Upload failed"));
        };
        xhr.onerror = () => reject(new Error("Network error"));
        xhr.send(formData);
      });

      setVideoSuccess("Video submitted successfully!");
      setExistingVideo({ video_url: "uploaded", description, status: "pending" });
      setVideoFile(null);
      setUploadProgress(100);
    } catch (err: any) {
      setVideoError(err.message);
    } finally {
      setSavingVideo(false);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "approved") return "bg-green-100 text-green-700 border border-green-200";
    if (status === "rejected") return "bg-red-100 text-red-600 border border-red-200";
    return "bg-yellow-100 text-yellow-700 border border-yellow-200";
  };

  const getStatusText = (status: string) => {
    if (status === "approved") return "✅ Approved — visible on home page";
    if (status === "rejected") return "❌ Rejected — you can edit and resubmit";
    return "⏳ Pending admin approval";
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px] text-gray-400">Loading...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Google Review & Videos</h1>
        <p className="text-gray-500 text-sm mt-1">Share your experience to help other students</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab("review")}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === "review" ? "bg-white shadow text-gray-800" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          ⭐ Google Review
        </button>
        <button
          onClick={() => setActiveTab("video")}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === "video" ? "bg-white shadow text-gray-800" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          🎥 Video Testimonial
        </button>
      </div>

      {/* ── GOOGLE REVIEW TAB ── */}
      {activeTab === "review" && (
        <div>
          {/* Status */}
          {existingReview && (
            <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${getStatusBadge(existingReview.status)}`}>
              {getStatusText(existingReview.status)}
            </div>
          )}

          {/* Google Review Button */}
          {googleLink && (
            <a
              href={googleLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full mb-5 py-3 rounded-xl border-2 border-dashed border-gray-200 text-sm font-semibold text-gray-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all"
            >
              <span className="text-xl">🔗</span>
              Click here to write your Google Review first
            </a>
          )}

          {reviewSuccess && (
            <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">✅ {reviewSuccess}</div>
          )}
          {reviewError && (
            <div className="mb-4 px-4 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{reviewError}</div>
          )}

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            {/* Star Rating */}
            <div className="mb-5">
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Your Rating *</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                    className="text-3xl transition-transform hover:scale-110"
                  >
                    {star <= reviewForm.rating ? "⭐" : "☆"}
                  </button>
                ))}
                <span className="text-sm text-gray-500 ml-2 self-center">{reviewForm.rating}/5</span>
              </div>
            </div>

            {/* Review Text */}
            <div className="mb-5">
              <label className="text-sm font-semibold text-gray-700 mb-1 block">
                Your Review *
              </label>
              <textarea
                value={reviewForm.review_text}
                onChange={(e) => setReviewForm({ ...reviewForm, review_text: e.target.value })}
                rows={4}
                placeholder="Share your honest experience about the course, trainers, and placement support..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">{reviewForm.review_text.length} characters</p>
            </div>

            {/* Google Review URL */}
            <div className="mb-5">
              <label className="text-sm font-semibold text-gray-700 mb-1 block">
                Google Review Link
                <span className="text-gray-400 font-normal ml-1">(optional — paste your Google review link)</span>
              </label>
              <input
                value={reviewForm.google_review_url}
                onChange={(e) => setReviewForm({ ...reviewForm, google_review_url: e.target.value })}
                placeholder="https://g.page/r/..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
              />
            </div>

            <button
              onClick={handleReviewSubmit}
              disabled={savingReview}
              className="w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:opacity-60 transition-all"
            >
              {savingReview ? "Submitting..." : existingReview ? "Update Review" : "Submit Review"}
            </button>
          </div>
        </div>
      )}

      {/* ── VIDEO TAB ── */}
      {activeTab === "video" && (
        <div>
          {/* Status */}
          {existingVideo && (
            <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${getStatusBadge(existingVideo.status)}`}>
              {getStatusText(existingVideo.status)}
            </div>
          )}

          {videoSuccess && (
            <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">✅ {videoSuccess}</div>
          )}
          {videoError && (
            <div className="mb-4 px-4 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{videoError}</div>
          )}

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            {/* Tips */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-5">
              <p className="text-xs font-semibold text-blue-700 mb-2">💡 Tips for a great video testimonial:</p>
              <ul className="text-xs text-blue-600 space-y-1">
                <li>• Keep it 1–3 minutes long</li>
                <li>• Talk about your course experience and placement</li>
                <li>• Good lighting and clear audio makes a big difference</li>
                <li>• Max file size: 50MB (MP4, MOV, WEBM)</li>
              </ul>
            </div>

            {/* Video Upload */}
            <div className="mb-5">
              <label className="text-sm font-semibold text-gray-700 mb-1 block">
                Upload Video *
              </label>
              <div
                className={`border-2 border-dashed rounded-xl px-4 py-8 cursor-pointer text-center transition-all ${
                  videoFile ? "border-green-400 bg-green-50" : "border-gray-200 bg-gray-50 hover:border-gray-300"
                }`}
                onClick={() => document.getElementById("video-input")?.click()}
              >
                <input
                  id="video-input"
                  type="file"
                  accept=".mp4,.mov,.avi,.webm,.mkv"
                  className="hidden"
                  onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                />
                {videoFile ? (
                  <div>
                    <div className="text-4xl mb-2">🎬</div>
                    <p className="text-sm font-semibold text-gray-800">{videoFile.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {(videoFile.size / (1024 * 1024)).toFixed(1)} MB · Click to change
                    </p>
                  </div>
                ) : existingVideo ? (
                  <div>
                    <div className="text-4xl mb-2">✅</div>
                    <p className="text-sm font-semibold text-gray-700">Video already uploaded</p>
                    <p className="text-xs text-gray-400 mt-1">Click to upload a new video</p>
                  </div>
                ) : (
                  <div>
                    <div className="text-4xl mb-2">🎥</div>
                    <p className="text-sm font-semibold text-gray-600">Click to select your video</p>
                    <p className="text-xs text-gray-400 mt-1">MP4, MOV, WEBM, AVI — Max 50MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* Upload Progress */}
            {savingVideo && uploadProgress > 0 && (
              <div className="mb-5">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mb-5">
              <label className="text-sm font-semibold text-gray-700 mb-1 block">
                Short Description
                <span className="text-gray-400 font-normal ml-1">(optional)</span>
              </label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. My journey from fresher to placed AC Technician"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
              />
            </div>

            <button
              onClick={handleVideoSubmit}
              disabled={savingVideo}
              className="w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:opacity-60 transition-all"
            >
              {savingVideo ? `Uploading... ${uploadProgress}%` : existingVideo ? "Replace Video" : "Submit Video"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
