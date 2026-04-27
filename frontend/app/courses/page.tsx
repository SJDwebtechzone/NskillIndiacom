// "use client";

// import { courses } from "@/data/courses";
// import { motion } from "framer-motion";
// import { 
//     Clock, 
//     GraduationCap, 
//     ChevronRight, 
//     ArrowRight,
//     Award,
//     Zap,
//     Users
// } from "lucide-react";
// import Link from "next/link";

// export default function CoursesPage() {
//     // Group courses by category
//     const categories = Array.from(new Set(courses.map((c: any) => c.category)));

//     return (
//         <div className="min-h-screen bg-[#f8fafc] pt-32 pb-24">
//             <div className="container mx-auto px-6">
                
//                 {/* Header */}
//                 <div className="max-w-3xl mb-16">
//                     <motion.div 
//                         initial={{ opacity: 0, y: 20 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         className="flex items-center gap-3 mb-6"
//                     >
//                         <div className="w-12 h-1 bg-blue-600 rounded-full"></div>
//                         <span className="text-blue-600 font-black text-xs uppercase tracking-[0.3em]">Skill Training Programs</span>
//                     </motion.div>
                    
//                     <motion.h1 
//                         initial={{ opacity: 0, y: 20 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         transition={{ delay: 0.1 }}
//                         className="text-5xl md:text-6xl font-black text-slate-900 leading-tight mb-8 tracking-tight"
//                     >
//                         Master New Skills <br />
//                         <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Shape Your Future</span>
//                     </motion.h1>
                    
//                     <motion.p 
//                         initial={{ opacity: 0, y: 20 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         transition={{ delay: 0.2 }}
//                         className="text-slate-500 text-lg font-medium leading-relaxed"
//                     >
//                         Industry-recognized certifications with 100% hands-on practical training in state-of-the-art labs.
//                     </motion.p>
//                 </div>

//                 {/* Categories & Courses */}
//                 <div className="space-y-24">
//                     {categories.map((category: any, catIndex: number) => (
//                         <div key={category} className="space-y-10">
//                             <div className="flex items-center justify-between">
//                                 <h2 className="text-3xl font-black text-slate-800 tracking-tight">{category} Courses</h2>
//                                 <div className="h-px flex-1 bg-slate-200 mx-8 hidden md:block"></div>
//                             </div>

//                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//                                 {courses.filter((c: any) => c.category === category).map((course: any, index: number) => (
//                                     <motion.div
//                                         key={course.id}
//                                         initial={{ opacity: 0, y: 30 }}
//                                         whileInView={{ opacity: 1, y: 0 }}
//                                         viewport={{ once: true }}
//                                         transition={{ delay: index * 0.1 }}
//                                         className="group bg-white rounded-[32px] border border-slate-100 p-8 hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] transition-all duration-500 relative overflow-hidden"
//                                     >
//                                         <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-colors"></div>
                                        
//                                         <div className="relative z-10 h-full flex flex-col">
//                                             <div className="flex justify-between items-start mb-8">
//                                                 <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-sm">
//                                                     <Zap className="w-6 h-6" />
//                                                 </div>
//                                                 <div className="px-4 py-1.5 bg-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500">
//                                                     {course.duration}
//                                                 </div>
//                                             </div>

//                                             <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-4 group-hover:text-blue-600 transition-colors leading-tight">
//                                                 {course.title}
//                                             </h3>

//                                             <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8 line-clamp-3">
//                                                 {course.content[0].substring(0, 150).replace(/[#-]/g, '').trim()}...
//                                             </p>

//                                             <div className="mt-auto pt-8 border-t border-slate-50 flex items-center justify-between">
//                                                 <div className="flex items-center gap-2">
//                                                     <Award className="w-4 h-4 text-amber-500" />
//                                                     <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Certifed Program</span>
//                                                 </div>
//                                                 <Link 
//                                                     href={`/courses/${course.id}`}
//                                                     className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:translate-x-1"
//                                                 >
//                                                     <ArrowRight className="w-5 h-5" />
//                                                 </Link>
//                                             </div>
//                                         </div>
//                                     </motion.div>
//                                 ))}
//                             </div>
//                         </div>
//                     ))}
//                 </div>

//                 {/* CTA Section */}
//                 <motion.div 
//                     initial={{ opacity: 0, scale: 0.95 }}
//                     whileInView={{ opacity: 1, scale: 1 }}
//                     viewport={{ once: true }}
//                     className="mt-32 bg-white border border-slate-100 p-12 md:p-20 rounded-[48px] shadow-2xl shadow-blue-900/5 relative overflow-hidden"
//                 >
//                     <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
//                     <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
//                         <div>
//                             <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-6">Ready to Start Your Training?</h2>
//                             <p className="text-slate-500 text-lg font-medium leading-relaxed">
//                                 Join over 5,000+ students who have transformed their careers with NSkill India's technical training programs.
//                             </p>
//                         </div>
//                         <div className="flex flex-col sm:flex-row gap-6 lg:justify-end">
//                             <Link href="/contact" className="px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-600/20 text-center transition-all active:scale-95">
//                                 ENROLL NOW
//                             </Link>
//                             <Link href="/login" className="px-10 py-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-2xl text-center transition-all active:scale-95">
//                                 STUDENT LOGIN
//                             </Link>
//                         </div>
//                     </div>
//                 </motion.div>

//             </div>
//         </div>
//     );
// }
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  Award,
  ArrowRight,
  GraduationCap,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

// ─── Category → Unsplash cover image mapping ──────────────────────────────────
const CATEGORY_IMAGES: Record<string, string[]> = {
  "HVAC & Refrigeration": [
    "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&q=80",
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
  ],
  "Electrical": [
    "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&q=80",
    "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&q=80",
    "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&q=80",
  ],
  "Plumbing": [
    "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&q=80",
    "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=600&q=80",
    "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&q=80",
  ],
  "Welding": [
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80",
    "https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?w=600&q=80",
    "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=600&q=80",
  ],
  "Home Appliance": [
    "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&q=80",
    "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&q=80",
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80",
  ],
  "MEP": [
    "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=600&q=80",
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80",
    "https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?w=600&q=80",
  ],
  "Quality": [
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80",
    "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80",
    "https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=600&q=80",
  ],
  "Safety": [
    "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80",
    "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&q=80",
    "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=600&q=80",
  ],
  "Oil & Gas": [
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80",
    "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=600&q=80",
    "https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?w=600&q=80",
  ],
};

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&q=80",
  "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&q=80",
  "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80",
];

// ─── Category display order ───────────────────────────────────────────────────
const CATEGORY_ORDER = [
  "HVAC & Refrigeration",
  "Electrical",
  "Plumbing",
  "Welding",
  "Home Appliance",
  "MEP",
  "Quality",
  "Safety",
  "Oil & Gas",
];

function getCourseImage(category: string, index: number): string {
  const pool = CATEGORY_IMAGES[category] ?? FALLBACK_IMAGES;
  return pool[index % pool.length];
}

// Extract first 3 syllabus items from content string
function getDescription(content: string): string {
  if (!content) return "";
  return content
    .split("\n")
    .filter((l) => l.trim().startsWith("-"))
    .map((l) => l.replace(/^-\s*/, "").trim())
    .slice(0, 3)
    .join(" · ");
}

// ─── Course Card ──────────────────────────────────────────────────────────────
function CourseCard({
  course,
  index,
  category,
}: {
  course: any;
  index: number;
  category: string;
}) {
 const imgSrc = course.thumbnail_url
  ? course.thumbnail_url
  : getCourseImage(category, index);
  const desc   = getDescription(course.content ?? "");

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      className="group bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-[0_24px_60px_-12px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-400 flex flex-col"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-slate-100">
        <img
          src={imgSrc}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

        {/* Duration badge */}
        <div className="absolute top-3 right-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-black uppercase tracking-widest text-slate-700 shadow-sm">
          {course.duration ?? "N/A"}
        </div>

        {/* Category pill */}
        <div className="absolute bottom-3 left-3 px-3 py-1 bg-blue-600/90 backdrop-blur-sm rounded-full text-[10px] font-bold uppercase tracking-wider text-white">
          {category}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-6">
        {/* Eligibility */}
        <div className="flex items-center gap-1.5 mb-3">
          <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {course.eligibility ?? "Open to All"}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-black text-slate-800 leading-snug mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
          {course.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 mb-5 flex-1">
          {desc || (course.content ?? "").substring(0, 120).replace(/[#\-]/g, "").trim()}
        </p>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-500" />
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Certified Program
            </span>
          </div>
          <Link
            href={`/courses/${course.slug}`}
            className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 px-3 py-2 rounded-xl transition-all duration-200 group/btn"
          >
            View Course
            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/courses`)
      .then(r => {
        if (!r.ok) throw new Error(`Failed to load courses (${r.status})`);
        return r.json();
      })
      .then(data => {
        if (!Array.isArray(data)) throw new Error("Unexpected response");
        setCourses(data);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Group courses by category in defined order
  const grouped: Record<string, any[]> = {};
  courses.forEach(c => {
    const cat = c.category ?? "Other";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(c);
  });

  // Sort categories by CATEGORY_ORDER, unknowns go to end
  const categories = [
    ...CATEGORY_ORDER.filter(cat => grouped[cat]),
    ...Object.keys(grouped).filter(cat => !CATEGORY_ORDER.includes(cat)),
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-32 pb-24">
      <div className="container mx-auto px-6">

        {/* ── Header ── */}
        <div className="max-w-3xl mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="w-12 h-1 bg-blue-600 rounded-full" />
            <span className="text-blue-600 font-black text-xs uppercase tracking-[0.3em]">
              Skill Training Programs
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-black text-slate-900 leading-tight mb-8 tracking-tight"
          >
            Master New Skills <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Shape Your Future
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 text-lg font-medium leading-relaxed"
          >
            Industry-recognized certifications with 100% hands-on practical
            training in state-of-the-art labs.
          </motion.p>
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div className="flex items-center justify-center py-32 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mr-3" />
            <span className="text-lg font-medium">Loading courses...</span>
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-6 py-4 mb-8">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm font-semibold">{error}</span>
          </div>
        )}

        {/* ── Categories & Cards ── */}
        {!loading && !error && (
          <div className="space-y-20">
            {categories.map((category) => {
              const categoryCourses = grouped[category];
              return (
                <div key={category}>
                  {/* Category header */}
                  <div className="flex items-center gap-6 mb-8">
                    <div>
                      <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                        {category} Courses
                      </h2>
                      <p className="text-sm text-slate-400 font-medium mt-0.5">
                        {categoryCourses.length} programs available
                      </p>
                    </div>
                    <div className="h-px flex-1 bg-slate-200 hidden md:block" />
                    <Link
                      href={`/courses?category=${category.toLowerCase().replace(/\s+/g, "-")}`}
                      className="hidden md:flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 shrink-0"
                    >
                      View all <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {/* Cards grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categoryCourses.map((course: any, index: number) => (
                      <CourseCard
                        key={course.id ?? course.slug}
                        course={course}
                        index={index}
                        category={category}
                      />
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Empty state */}
            {categories.length === 0 && (
              <div className="text-center py-32 text-slate-400">
                <GraduationCap className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-xl font-bold mb-2">No courses yet</p>
                <p className="text-sm">Add courses through the admin panel to see them here.</p>
              </div>
            )}
          </div>
        )}

        {/* ── CTA Section ── */}
        {!loading && !error && categories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mt-32 bg-white border border-slate-100 p-12 md:p-20 rounded-[48px] shadow-2xl shadow-blue-900/5 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-600" />
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-6">
                  Ready to Start Your Training?
                </h2>
                <p className="text-slate-500 text-lg font-medium leading-relaxed">
                  Join over 5,000+ students who have transformed their careers
                  with NSkill India's technical training programs.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-6 lg:justify-end">
                <Link
                  href="/contact"
                  className="px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-600/20 text-center transition-all active:scale-95"
                >
                  ENROLL NOW
                </Link>
                <Link
                  href="/login"
                  className="px-10 py-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-2xl text-center transition-all active:scale-95"
                >
                  STUDENT LOGIN
                </Link>
              </div>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
