"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import CourseForm, { CourseFormData } from "../../CourseForm";
import { Pencil, Loader2, AlertCircle } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id }  = use(params);
  const [data,  setData]  = useState<Partial<CourseFormData> | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API}/api/courses/${id}`)
      .then(r => r.json())
      .then(raw => {
        setData({
          title:                raw.title               ?? "",
          slug:                 raw.slug                ?? "",
          category:             raw.category            ?? "",
          duration:             raw.duration            ?? "",
          eligibility:          raw.eligibility         ?? "",
          certification:        raw.certification       ?? "NSDC Approved",
          delivery_method:      raw.delivery_method     ?? "Offline",
          content:              raw.content             ?? "",
          career_opportunities: raw.career_opportunities ?? [""],
          videos:               raw.videos              ?? [],
          extra_sections:       raw.extra_sections      ?? [],
          brochure_url:         raw.brochure_url        ?? "",
          is_active:            raw.is_active           ?? true,
        });
      })
      .catch(() => setError("Failed to load course data"));
  }, [id]);

  if (error) return (
    <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
      <AlertCircle className="w-4 h-4" /> {error}
    </div>
  );

  if (!data) return (
    <div className="flex items-center justify-center py-20 text-slate-400">
      <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading course...
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
          <Pencil className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800">Edit Course</h2>
          <p className="text-sm text-slate-500">Changes will reflect live on the website immediately</p>
        </div>
      </div>
      <CourseForm initialData={data} courseId={parseInt(id)} />
    </div>
  );
}
