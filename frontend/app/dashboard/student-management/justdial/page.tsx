"use client";
import { useEffect, useState } from "react";
import ValidatedFileInput from "@/components/ValidatedFileInput";

export default function StudentJustDialReviewsPage() {
  const [reviewForm, setReviewForm] = useState({ rating: 5, review_text: "", justdial_review_url: "" });
  const [existingReview, setExistingReview] = useState<any>(null);
  const [savingReview, setSavingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [completionVideoFile, setCompletionVideoFile] = useState<File | null>(null);
  const [reviewUploadProgress, setReviewUploadProgress] = useState(0);

  const [justdialLink, setJustdialLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const API = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reviewRes, linkRes] = await Promise.all([
          fetch(`${API}/api/reviews/justdial/my`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API}/api/reviews/justdial-link`),
        ]);
        const reviewData = await reviewRes.json();
        const linkData = await linkRes.json();

        if (reviewData.review) {
          setExistingReview(reviewData.review);
          setReviewForm({
            rating: reviewData.review.rating,
            review_text: reviewData.review.review_text,
            justdial_review_url: reviewData.review.justdial_review_url || "",
          });
        }
        if (linkData.link) setJustdialLink(linkData.link);
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
    setSavingReview(true); setReviewError(""); setReviewSuccess(""); setReviewUploadProgress(0);
    try {
      const formData = new FormData();
      formData.append("rating", String(reviewForm.rating));
      formData.append("review_text", reviewForm.review_text);
      formData.append("justdial_review_url", reviewForm.justdial_review_url);
      if (completionVideoFile) {
        formData.append("completion_video", completionVideoFile);
      }

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setReviewUploadProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.open("POST", `${API}/api/reviews/justdial`);
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(JSON.parse(xhr.responseText).error || "Failed"));
        };
        xhr.onerror = () => reject(new Error("Network error"));
        xhr.send(formData);
      });

      setReviewSuccess(existingReview ? "Review updated!" : "Review submitted successfully!");
      setExistingReview({ ...reviewForm, status: "pending" });
      setCompletionVideoFile(null);
      setReviewUploadProgress(0);
    } catch (err: any) {
      setReviewError(err.message);
    } finally {
      setSavingReview(false);
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
        <h1 className="text-2xl font-bold text-gray-800">Just Dial Review</h1>
        <p className="text-gray-500 text-sm mt-1">Share your experience to help other students</p>
      </div>

      <div>
        {/* Status */}
        {existingReview && (
          <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${getStatusBadge(existingReview.status)}`}>
            {getStatusText(existingReview.status)}
          </div>
        )}

        {/* Just Dial Review Link */}
        {justdialLink && (
          <a
            href={justdialLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full mb-5 py-3 rounded-xl border-2 border-dashed border-gray-200 text-sm font-semibold text-gray-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all"
          >
            <span className="text-xl">🔗</span>
            Click here to write your Just Dial Review first
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

          {/* Just Dial Review URL */}
          <div className="mb-5">
            <label className="text-sm font-semibold text-gray-700 mb-1 block">
              Just Dial Review Link
              <span className="text-gray-400 font-normal ml-1">(optional — paste your Just Dial Review link)</span>
            </label>
            <input
              value={reviewForm.justdial_review_url}
              onChange={(e) => setReviewForm({ ...reviewForm, justdial_review_url: e.target.value })}
              placeholder="https://www.justdial.com/..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
            />
          </div>

          {/* Completion Video */}
          <div className="mb-5">
            <label className="text-sm font-semibold text-gray-700 mb-1 block">
              Attach a Short Video
              <span className="text-gray-400 font-normal ml-1">(optional)</span>
            </label>
            <div
              className={`border-2 border-dashed rounded-xl p-4 cursor-pointer text-center transition-all ${
                completionVideoFile ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-gray-50 hover:border-gray-300"
              }`}
              onClick={() => document.getElementById("completion-video-input")?.click()}
            >
              <ValidatedFileInput
                id="completion-video-input"
                fileType="video"
                className="hidden"
                onChange={(e) => setCompletionVideoFile(e.target.files?.[0] || null)}
              />
              {completionVideoFile ? (
                <div>
                  <div className="text-3xl mb-1">🎥</div>
                  <p className="text-sm font-semibold text-gray-800">{completionVideoFile.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{(completionVideoFile.size / (1024 * 1024)).toFixed(1)} MB • Click to change</p>
                </div>
              ) : existingReview?.completion_video_url ? (
                <div>
                  <div className="text-3xl mb-1">✅</div>
                  <p className="text-sm font-semibold text-gray-700">Video already uploaded</p>
                  <p className="text-xs text-gray-400 mt-1">Click to upload a new video</p>
                </div>
              ) : (
                <div>
                  <div className="text-3xl mb-1">🎥</div>
                  <p className="text-sm font-semibold text-gray-600">Click to select your completion video</p>
                  <p className="text-xs text-gray-400 mt-1">MP4, MOV, WEBM — Max 100MB</p>
                </div>
              )}
            </div>
            {/* Upload Progress for review video */}
            {savingReview && reviewUploadProgress > 0 && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Uploading video...</span>
                  <span>{reviewUploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${reviewUploadProgress}%` }} />
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleReviewSubmit}
            disabled={savingReview}
            className="w-full py-2.5 rounded-lg text-sm font-semibold bg-[#2563eb] text-white hover:bg-[#1d4ed8] disabled:opacity-60 transition-all"
          >
            {savingReview ? "Submitting..." : existingReview ? "Update Review" : "Submit Review"}
          </button>
        </div>
      </div>
    </div>
  );
}
