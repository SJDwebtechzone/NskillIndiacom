"use client";
import { useEffect, useRef, useState } from "react";
import ValidatedFileInput from "@/components/ValidatedFileInput";

export default function StudentFeedbackPage() {
  const [form, setForm] = useState({
    rating: 5,
    feedback_text: "",
    testimonial: "",
  });
  const [testimonialVideoFile, setTestimonialVideoFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [existing, setExisting] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const res = await fetch(`${API}/api/placement-feedback/feedback/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.feedback) {
          setExisting(data.feedback);
          setForm({
            rating: data.feedback.rating,
            feedback_text: data.feedback.feedback_text,
            testimonial: data.feedback.testimonial,
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeedback();
  }, []);

  const handleSubmit = async () => {
    if (!form.feedback_text || !form.testimonial) {
      setError("Please fill in all fields."); return;
    }
    setSaving(true); setError(""); setSuccess(""); setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("rating", String(form.rating));
      formData.append("feedback_text", form.feedback_text);
      formData.append("testimonial", form.testimonial);
      if (testimonialVideoFile) {
        formData.append("testimonial_video", testimonialVideoFile);
      }

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.open("POST", `${API}/api/placement-feedback/feedback`);
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else {
            try { reject(new Error(JSON.parse(xhr.responseText).error || "Failed to submit")); }
            catch { reject(new Error("Failed to submit")); }
          }
        };
        xhr.onerror = () => reject(new Error("Network error"));
        xhr.send(formData);
      });

      setSuccess(existing ? "Feedback updated successfully!" : "Feedback submitted successfully!");
      setExisting({ ...form, status: "pending" });
      setTestimonialVideoFile(null);
      setUploadProgress(0);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    if (status === "approved") return "bg-green-100 text-green-700";
    if (status === "rejected") return "bg-red-100 text-red-600";
    return "bg-yellow-100 text-yellow-700";
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px] text-gray-400">Loading...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Feedback &amp; Testimonial</h1>
        <p className="text-gray-500 text-sm mt-1">
          Share your experience — approved testimonials will appear on our home page
        </p>
      </div>

      {/* Status badge if already submitted */}
      {existing && (
        <div className={`mb-4 px-4 py-3 rounded-lg flex items-center justify-between border ${
          existing.status === "approved"
            ? "bg-green-50 border-green-200"
            : existing.status === "rejected"
            ? "bg-red-50 border-red-200"
            : "bg-yellow-50 border-yellow-200"
        }`}>
          <p className="text-sm font-semibold text-gray-700">
            {existing.status === "approved"
              ? "✅ Your testimonial is live on the home page!"
              : existing.status === "rejected"
              ? "❌ Your testimonial was not approved. You can edit and resubmit."
              : "⏳ Your testimonial is pending admin approval."}
          </p>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${getStatusColor(existing.status)}`}>
            {existing.status}
          </span>
        </div>
      )}

      {success && (
        <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          ✅ {success}
        </div>
      )}
      {error && (
        <div className="mb-4 px-4 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">

        {/* Star Rating */}
        <div className="mb-5">
          <label className="text-sm font-semibold text-gray-700 mb-2 block">Rating *</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setForm({ ...form, rating: star })}
                className="text-3xl transition-transform hover:scale-110"
              >
                {star <= form.rating ? "⭐" : "☆"}
              </button>
            ))}
            <span className="text-sm text-gray-500 ml-2 self-center">{form.rating}/5</span>
          </div>
        </div>

        {/* Feedback */}
        <div className="mb-5">
          <label className="text-sm font-semibold text-gray-700 mb-1 block">
            Feedback *
            <span className="text-gray-400 font-normal ml-1">(your overall experience)</span>
          </label>
          <textarea
            value={form.feedback_text}
            onChange={(e) => setForm({ ...form, feedback_text: e.target.value })}
            rows={3}
            placeholder="Share your overall experience with the course and training..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none resize-none"
          />
        </div>

        {/* Testimonial */}
        <div className="mb-5">
          <label className="text-sm font-semibold text-gray-700 mb-1 block">
            Testimonial *
            <span className="text-gray-400 font-normal ml-1">(will appear on home page if approved)</span>
          </label>
          <textarea
            value={form.testimonial}
            onChange={(e) => setForm({ ...form, testimonial: e.target.value })}
            rows={4}
            placeholder="Write your success story — how this course helped your career..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none resize-none"
          />
          <p className="text-xs text-gray-400 mt-1">
            💡 Tip: Include your course name and how it helped you get placed
          </p>
        </div>

        {/* Testimonial Video Upload */}
        <div className="mb-6">
          <label className="text-sm font-semibold text-gray-700 mb-1 block">
            Course Completion Review Video
            <span className="text-gray-400 font-normal ml-1">(optional — share a course completion review video)</span>
          </label>
          <div
            className={`border-2 border-dashed rounded-xl px-4 py-8 cursor-pointer text-center transition-all ${
              testimonialVideoFile ? "border-green-400 bg-green-50" : "border-gray-200 bg-gray-50 hover:border-gray-300"
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <ValidatedFileInput
              ref={fileInputRef as any}
              fileType="video"
              className="hidden"
              onChange={(e) => setTestimonialVideoFile(e.target.files?.[0] || null)}
            />
            {testimonialVideoFile ? (
              <div>
                <div className="text-4xl mb-2">🎬</div>
                <p className="text-sm font-semibold text-gray-800">{testimonialVideoFile.name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {(testimonialVideoFile.size / (1024 * 1024)).toFixed(1)} MB · Click to change
                </p>
              </div>
            ) : existing?.testimonial_video_url ? (
              <div>
                <div className="text-4xl mb-2">✅</div>
                <p className="text-sm font-semibold text-gray-700">Video already uploaded</p>
                <p className="text-xs text-gray-400 mt-1">Click to upload a new testimonial video</p>
              </div>
            ) : (
              <div>
                <div className="text-4xl mb-2">🎥</div>
                <p className="text-sm font-semibold text-gray-600">Click to upload your testimonial video</p>
                <p className="text-xs text-gray-400 mt-1">MP4, MOV, WEBM — Max 100MB</p>
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {saving && uploadProgress > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Uploading video...</span>
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
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-all"
        >
          {saving
            ? uploadProgress > 0
              ? `Uploading... ${uploadProgress}%`
              : "Submitting..."
            : existing
            ? "Update Feedback"
            : "Submit Feedback & Testimonial"}
        </button>
      </div>
    </div>
  );
}
