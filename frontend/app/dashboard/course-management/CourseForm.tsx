"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Save, X, Plus, Trash2, Loader2, AlertCircle,
  Upload, Film, Link as LinkIcon,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

// ── Types ─────────────────────────────────────────────────────────────────────
interface FAQ       { q: string; a: string }
interface VideoItem { id: string; url: string; type: string; title: string; source: "url" | "upload" }

export interface CourseFormData {
  title:                string;
  slug:                 string;
  category:             string;
  duration:             string;
  eligibility:          string;
  certification:        string;
  delivery_method:      string;
  content:              string;
  career_opportunities: string[];
  videos:               VideoItem[];
  extra_sections:       FAQ[];
  brochure_url:         string;
  is_active:            boolean;
}

interface CourseFormProps {
  initialData?: Partial<CourseFormData>;
  courseId?:    number;
}

// ── Constants ─────────────────────────────────────────────────────────────────
const EMPTY: CourseFormData = {
  title: "", slug: "", category: "", duration: "", eligibility: "",
  certification: "NSDC Approved", delivery_method: "Offline",
  content: "", career_opportunities: [""],
  videos: [], extra_sections: [], brochure_url: "", is_active: true,
};

const CATEGORIES = [
  "HVAC & Refrigeration", "Electrical", "Plumbing", "Welding",
  "Home Appliance", "MEP", "Quality", "Safety", "Oil & Gas",
];

const DELIVERY    = ["Offline", "Online", "Hybrid"];
const VIDEO_TYPES = ["Demo", "Full", "Intro", "Testimonial"];

// ── Slug helper ───────────────────────────────────────────────────────────────
function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// ── Shared style ──────────────────────────────────────────────────────────────
const inputCls = "w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all";

// ── Sub-components OUTSIDE the main component ─────────────────────────────────
// IMPORTANT: Defining Section/Field inside CourseForm caused them to remount
// on every render, which unmounted inputs and caused focus/typing loss.

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <h3 className="font-black text-slate-700 text-sm uppercase tracking-wider">{title}</h3>
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function CourseForm({ initialData, courseId }: CourseFormProps) {
  const router = useRouter();
  const isEdit = courseId !== undefined;

  const [form,    setForm]    = useState<CourseFormData>({ ...EMPTY, ...initialData });
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);

  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ── Generic setter ─────────────────────────────────────────────────────────
  const set = (key: keyof CourseFormData, value: any) =>
    setForm(f => ({ ...f, [key]: value }));

  // ── Title change: single setState keeps title + slug in sync without double render
  const handleTitleChange = (val: string) => {
    setForm(f => ({
      ...f,
      title: val,
      slug:  isEdit ? f.slug : toSlug(val),
    }));
  };

  // ── Career opportunities ───────────────────────────────────────────────────
  const setCareer    = (idx: number, val: string) => {
    const arr = [...form.career_opportunities]; arr[idx] = val;
    set("career_opportunities", arr);
  };
  const addCareer    = () => set("career_opportunities", [...form.career_opportunities, ""]);
  const removeCareer = (idx: number) =>
    set("career_opportunities", form.career_opportunities.filter((_, i) => i !== idx));

  // ── FAQs ───────────────────────────────────────────────────────────────────
  const setFAQ = (idx: number, key: "q" | "a", val: string) => {
    const arr = [...form.extra_sections]; arr[idx] = { ...arr[idx], [key]: val };
    set("extra_sections", arr);
  };
  const addFAQ    = () => set("extra_sections", [...form.extra_sections, { q: "", a: "" }]);
  const removeFAQ = (idx: number) =>
    set("extra_sections", form.extra_sections.filter((_, i) => i !== idx));

  // ── Videos ────────────────────────────────────────────────────────────────
  const addVideo = () =>
    set("videos", [...form.videos, {
      id: Date.now().toString(), url: "", type: "Demo", title: "", source: "url",
    }]);

  const removeVideo = (idx: number) =>
    set("videos", form.videos.filter((_, i) => i !== idx));

  const setVideo = (idx: number, key: keyof VideoItem, val: string) => {
    const arr = [...form.videos]; arr[idx] = { ...arr[idx], [key]: val };
    set("videos", arr);
  };

  const handleVideoUpload = async (idx: number, file: File) => {
    setUploadingIdx(idx);
    try {
      const fd = new FormData();
      fd.append("video", file);
      const res  = await fetch(`${API}/api/upload/video`, { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      const arr  = [...form.videos];
      arr[idx]   = { ...arr[idx], url: data.url, source: "upload" };
      set("videos", arr);
    } catch {
      alert("Video upload failed. Try pasting a URL instead.");
    } finally {
      setUploadingIdx(null);
    }
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setError(""); setSuccess("");
    if (!form.title.trim()) { setError("Course title is required"); return; }
    if (!form.slug.trim())  { setError("Slug is required"); return; }
    if (!form.category)     { setError("Please select a category"); return; }

    setSaving(true);
    try {
      const payload = {
        ...form,
        career_opportunities: form.career_opportunities.filter(Boolean),
        extra_sections:       form.extra_sections.filter(f => f.q || f.a),
        videos:               form.videos.filter(v => v.url),
      };
      const url    = isEdit ? `${API}/api/courses/${courseId}` : `${API}/api/courses`;
      const method = isEdit ? "PUT" : "POST";
      const res    = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to save");
      }
      setSuccess(isEdit ? "Course updated successfully!" : "Course created successfully!");
      setTimeout(() => router.push("/dashboard/course-management"), 1200);
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-4xl">

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm">
          ✅ {success}
        </div>
      )}

      {/* Basic Info */}
      <Section title="Basic Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <Field label="Course Title" required>
            <input
              className={inputCls}
              placeholder="e.g. HVAC & Refrigeration – Basic"
              value={form.title}
              onChange={e => handleTitleChange(e.target.value)}
            />
          </Field>

          <Field label="URL Slug" required>
            <input
              className={inputCls}
              placeholder="e.g. hvac-refrigeration-basic"
              value={form.slug}
              onChange={e => set("slug", e.target.value)}
              onBlur={e => set("slug", toSlug(e.target.value))}
            />
            <p className="text-[11px] text-slate-400 mt-1">/courses/{form.slug || "..."}</p>
          </Field>

          <Field label="Category" required>
            <select className={inputCls} value={form.category} onChange={e => set("category", e.target.value)}>
              <option value="">Select category</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>

          <Field label="Duration">
            <input
              className={inputCls}
              placeholder="e.g. 30 Days"
              value={form.duration}
              onChange={e => set("duration", e.target.value)}
            />
          </Field>

          <Field label="Eligibility">
            <input
              className={inputCls}
              placeholder="e.g. 10th Pass / ITI"
              value={form.eligibility}
              onChange={e => set("eligibility", e.target.value)}
            />
          </Field>

          <Field label="Certification">
            <input
              className={inputCls}
              placeholder="e.g. NSDC Approved"
              value={form.certification}
              onChange={e => set("certification", e.target.value)}
            />
          </Field>

          <Field label="Delivery Method">
            <select className={inputCls} value={form.delivery_method} onChange={e => set("delivery_method", e.target.value)}>
              {DELIVERY.map(d => <option key={d}>{d}</option>)}
            </select>
          </Field>

          <Field label="Status">
            <select
              className={inputCls}
              value={form.is_active ? "active" : "inactive"}
              onChange={e => set("is_active", e.target.value === "active")}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </Field>

        </div>
      </Section>

      {/* Syllabus */}
      <Section title="Course Syllabus / Content">
        <Field label="Syllabus (one topic per line, start each line with -)">
          <textarea
            rows={10}
            className={inputCls}
            placeholder={"- Introduction to HVAC Systems\n- Refrigeration Cycle Fundamentals\n- Types of Refrigerants"}
            value={form.content}
            onChange={e => set("content", e.target.value)}
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Each line starting with "- " will appear as a syllabus item on the course page.
          </p>
        </Field>
      </Section>

      {/* Career Opportunities */}
      <Section title="Career Opportunities">
        <div className="space-y-2">
          {form.career_opportunities.map((role, idx) => (
            <div key={idx} className="flex gap-2">
              <input
                className={`${inputCls} flex-1`}
                placeholder="e.g. HVAC Technician"
                value={role}
                onChange={e => setCareer(idx, e.target.value)}
              />
              <button type="button" onClick={() => removeCareer(idx)}
                className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button type="button" onClick={addCareer}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-semibold mt-1">
            <Plus className="w-4 h-4" /> Add Role
          </button>
        </div>
      </Section>

      {/* Videos */}
      <Section title="Course Videos (optional)">
        <div className="space-y-4">
          {form.videos.map((v, idx) => (
            <div key={v.id} className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">

              {/* Title + Type + Delete */}
              <div className="flex gap-2">
                <input
                  className={`${inputCls} flex-1`}
                  placeholder="Video Title"
                  value={v.title}
                  onChange={e => setVideo(idx, "title", e.target.value)}
                />
                <select
                  className="border border-slate-200 bg-white rounded-xl px-3 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={v.type}
                  onChange={e => setVideo(idx, "type", e.target.value)}
                >
                  {VIDEO_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
                <button type="button" onClick={() => removeVideo(idx)}
                  className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Source toggle: URL vs Upload */}
              <div className="flex gap-2">
                <button type="button" onClick={() => setVideo(idx, "source", "url")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    v.source !== "upload"
                      ? "bg-blue-600 text-white"
                      : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}>
                  <LinkIcon className="w-3 h-3" /> Paste URL
                </button>
                <button type="button" onClick={() => setVideo(idx, "source", "upload")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    v.source === "upload"
                      ? "bg-blue-600 text-white"
                      : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}>
                  <Upload className="w-3 h-3" /> Upload File
                </button>
              </div>

              {/* URL input or file upload area */}
              {v.source === "upload" ? (
                <div>
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    ref={el => { fileInputRefs.current[idx] = el; }}
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) handleVideoUpload(idx, file);
                    }}
                  />
                  {v.url ? (
                    <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                      <Film className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-xs text-emerald-700 font-medium truncate flex-1">{v.url}</span>
                      <button type="button" onClick={() => setVideo(idx, "url", "")}
                        className="text-xs text-red-500 hover:text-red-700 font-semibold shrink-0">
                        Remove
                      </button>
                    </div>
                  ) : uploadingIdx === idx ? (
                    <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-4">
                      <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                      <span className="text-xs text-blue-600 font-medium">Uploading video…</span>
                    </div>
                  ) : (
                    <button type="button" onClick={() => fileInputRefs.current[idx]?.click()}
                      className="w-full flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-300 hover:border-blue-400 bg-white hover:bg-blue-50 rounded-xl py-8 transition">
                      <Upload className="w-6 h-6 text-slate-400" />
                      <span className="text-sm text-slate-500 font-medium">Click to upload video</span>
                      <span className="text-xs text-slate-400">MP4, MOV, AVI — up to 500MB</span>
                    </button>
                  )}
                </div>
              ) : (
                <input
                  className={inputCls}
                  placeholder="https://youtube.com/watch?v=... or https://example.com/video.mp4"
                  value={v.url}
                  onChange={e => setVideo(idx, "url", e.target.value)}
                />
              )}

            </div>
          ))}

          <button type="button" onClick={addVideo}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-semibold">
            <Plus className="w-4 h-4" /> Add Video
          </button>
        </div>
      </Section>

      {/* FAQs */}
      <Section title="FAQs (optional)">
        <div className="space-y-3">
          {form.extra_sections.map((faq, idx) => (
            <div key={idx} className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2">
              <div className="flex gap-2">
                <input
                  className={`${inputCls} flex-1`}
                  placeholder="Question"
                  value={faq.q}
                  onChange={e => setFAQ(idx, "q", e.target.value)}
                />
                <button type="button" onClick={() => removeFAQ(idx)}
                  className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <textarea
                rows={2}
                className={inputCls}
                placeholder="Answer"
                value={faq.a}
                onChange={e => setFAQ(idx, "a", e.target.value)}
              />
            </div>
          ))}
          <button type="button" onClick={addFAQ}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-semibold">
            <Plus className="w-4 h-4" /> Add FAQ
          </button>
        </div>
      </Section>

      {/* Brochure */}
      <Section title="Brochure PDF">
        <Field label="Brochure URL (paste a public PDF link or /brochures/filename.pdf)">
          <input
            className={inputCls}
            placeholder="https://... or /brochures/hvac-basic.pdf"
            value={form.brochure_url}
            onChange={e => set("brochure_url", e.target.value)}
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Students will download this file after OTP verification.
          </p>
        </Field>
      </Section>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold px-6 py-3 rounded-xl transition shadow-md shadow-blue-200 text-sm"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving…" : isEdit ? "Update Course" : "Create Course"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/dashboard/course-management")}
          className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-6 py-3 rounded-xl transition text-sm"
        >
          <X className="w-4 h-4" /> Cancel
        </button>
      </div>

    </div>
  );
}
