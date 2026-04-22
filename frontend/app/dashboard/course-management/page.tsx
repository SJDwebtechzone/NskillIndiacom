"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen, Plus, Pencil, Trash2, Search,
  ChevronLeft, ChevronRight, AlertCircle, Loader2,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

interface Course {
  id: number;
  slug: string;
  title: string;
  category: string;
  duration: string;
  eligibility: string;
  certification: string;
  delivery_method: string;
  is_active: boolean;
}

export default function AllCoursesPage() {
  const router = useRouter();
  const [courses, setCourses]       = useState<Course[]>([]);
  const [filtered, setFiltered]     = useState<Course[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [category, setCategory]     = useState("All");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError]           = useState("");

  useEffect(() => { fetchCourses(); }, []);

  useEffect(() => {
    let list = courses;
    if (category !== "All") list = list.filter(c => c.category === category);
    if (search) list = list.filter(c => c.title.toLowerCase().includes(search.toLowerCase()) || c.category.toLowerCase().includes(search.toLowerCase()));
    setFiltered(list);
  }, [courses, search, category]);

  async function fetchCourses() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/courses`);
      const data = await res.json();
      setCourses(data);
    } catch {
      setError("Failed to load courses");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${API}/api/courses/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setCourses(prev => prev.filter(c => c.id !== id));
    } catch {
      alert("Failed to delete course");
    } finally {
      setDeletingId(null);
    }
  }

  const categories = ["All", ...Array.from(new Set(courses.map(c => c.category)))];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800">All Courses</h2>
          <p className="text-sm text-slate-500 mt-0.5">{courses.length} courses in the system</p>
        </div>
        <Link
          href="/dashboard/course-management/add"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl transition shadow-md shadow-blue-200 text-sm"
        >
          <Plus className="w-4 h-4" /> Add Course
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
          />
        </div>
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading courses...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No courses found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {["Title", "Category", "Duration", "Delivery", "Certification", "Status", "Actions"].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-black uppercase tracking-wider text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(course => (
                  <tr key={course.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-800 text-sm leading-snug max-w-[200px]">{course.title}</div>
                      <div className="text-xs text-slate-400 mt-0.5">/courses/{course.slug}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-lg">{course.category}</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">{course.duration}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-lg ${course.delivery_method === "Online" ? "bg-green-50 text-green-700" : course.delivery_method === "Hybrid" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
                        {course.delivery_method ?? "Offline"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-600 max-w-[150px] truncate">{course.certification}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-lg ${course.is_active ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                        {course.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/course-management/edit/${course.id}`}
                          className="flex items-center gap-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                        >
                          <Pencil className="w-3.5 h-3.5" /> Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(course.id, course.title)}
                          disabled={deletingId === course.id}
                          className="flex items-center gap-1.5 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 text-xs font-semibold px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                        >
                          {deletingId === course.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
