"use client";

import CourseForm from "../CourseForm";
import { BookOpen } from "lucide-react";

export default function AddCoursePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800">Add New Course</h2>
          <p className="text-sm text-slate-500">Fill in all details — they will appear live on the website</p>
        </div>
      </div>
      <CourseForm />
    </div>
  );
}
