"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Clock, MapPin, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import EnquiryModal from "./EnquiryModal";

interface CourseItem {
  id?: number | string;
  slug?: string;
  title: string;
  duration?: string;
  timing?: string;
  location?: string;
  status?: "Admissions Open" | "Few Seats Available" | "Upcoming Batch";
  thumbnail_url?: string;
  image_url?: string;
  category?: string;
}

const FALLBACK_POPULAR_COURSES: CourseItem[] = [
  {
    id: "hvac-engineer",
    slug: "hvac-engineer",
    title: "HVAC Engineer",
    duration: "30 Days",
    timing: "10:00 AM - 02:00 PM",
    location: "Chennai",
    status: "Admissions Open",
    thumbnail_url: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&auto=format&fit=crop&q=80",
    category: "HVAC & Refrigeration",
  },
  {
    id: "industrial-electrician",
    slug: "industrial-electrician",
    title: "Industrial Electrician",
    duration: "30 Days",
    timing: "10:00 AM - 02:00 PM",
    location: "Chennai",
    status: "Admissions Open",
    thumbnail_url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80",
    category: "Electrical",
  },
  {
    id: "6g-welding-training",
    slug: "6g-welding-training",
    title: "6G Welding Training",
    duration: "45 Days",
    timing: "10:00 AM - 04:00 PM",
    location: "Chennai",
    status: "Admissions Open",
    thumbnail_url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80",
    category: "Welding",
  },
  {
    id: "quality-inspector",
    slug: "quality-inspector",
    title: "Quality Inspector",
    duration: "30 Days",
    timing: "10:00 AM - 02:00 PM",
    location: "Chennai",
    status: "Few Seats Available",
    thumbnail_url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80",
    category: "Quality",
  },
  {
    id: "plumbing-technician",
    slug: "plumbing-technician",
    title: "Plumbing Technician",
    duration: "15 Days",
    timing: "10:00 AM - 02:00 PM",
    location: "Chennai",
    status: "Upcoming Batch",
    thumbnail_url: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&auto=format&fit=crop&q=80",
    category: "Plumbing",
  },
  {
    id: "mep-technician",
    slug: "mep-technician",
    title: "MEP Technician",
    duration: "30 Days",
    timing: "10:00 AM - 02:00 PM",
    location: "Chennai",
    status: "Admissions Open",
    thumbnail_url: "https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?w=600&auto=format&fit=crop&q=80",
    category: "MEP",
  },
];

export default function PopularCoursesSection() {
  const [courses, setCourses] = useState<CourseItem[]>(FALLBACK_POPULAR_COURSES);
  const [activeDot, setActiveDot] = useState(0);
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/courses`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const mapped: CourseItem[] = data.slice(0, 8).map((c: any, idx: number) => {
              let status: CourseItem["status"] = "Admissions Open";
              if (idx === 3 || idx === 6) status = "Few Seats Available";
              else if (idx === 4 || idx === 7) status = "Upcoming Batch";

              const fallbackImg = FALLBACK_POPULAR_COURSES[idx % FALLBACK_POPULAR_COURSES.length].thumbnail_url;

              return {
                id: c.id,
                slug: c.slug || c.id,
                title: c.title,
                duration: c.duration || "30 Days",
                timing: idx % 3 === 2 ? "10:00 AM - 04:00 PM" : "10:00 AM - 02:00 PM",
                location: "Chennai",
                status,
                thumbnail_url: c.thumbnail_url || c.image_url || fallbackImg,
                category: c.category,
              };
            });
            setCourses(mapped);
          }
        }
      } catch (err) {
        console.error("Error loading popular courses:", err);
      }
    };

    fetchCourses();
  }, []);

  const handleScroll = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = 320;
      carouselRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleScrollEvent = () => {
    if (carouselRef.current) {
      const scrollLeft = carouselRef.current.scrollLeft;
      const cardWidth = 300;
      const newIndex = Math.round(scrollLeft / cardWidth);
      setActiveDot(Math.min(Math.max(newIndex, 0), 3));
    }
  };

  const handleOpenEnquiry = (courseTitle: string) => {
    setSelectedCourse(courseTitle);
    setIsEnquiryOpen(true);
  };

  return (
    <section className="py-14 md:py-18 bg-slate-50/60 border-t border-slate-100 relative overflow-hidden">
      <div className="mx-auto max-w-[1440px] px-4 md:px-8 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 md:mb-10 gap-4">
          <div>
            <p className="text-[#f97316] font-extrabold text-xs sm:text-sm tracking-wider uppercase mb-1.5">
              OUR POPULAR COURSES
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0b1f3a] tracking-tight leading-tight">
              Industry-Focused Training Programs
            </h2>
          </div>

          <Link
            href="/courses"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#0b1f3a] hover:text-[#f97316] transition-colors pb-1 border-b-2 border-transparent hover:border-[#f97316] w-fit"
          >
            <span>View All Courses</span>
            <ArrowRight className="w-4 h-4 text-[#f97316]" />
          </Link>
        </div>

        {/* Carousel Container */}
        <div className="relative group">
          {/* Left Arrow Button */}
          <button
            type="button"
            onClick={() => handleScroll("left")}
            className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white text-slate-700 shadow-md border border-slate-200 flex items-center justify-center hover:bg-slate-50 hover:border-[#0b1f3a] transition-all cursor-pointer"
            aria-label="Previous courses"
          >
            <ChevronLeft className="w-5 h-5 text-slate-700" />
          </button>

          {/* Right Arrow Button */}
          <button
            type="button"
            onClick={() => handleScroll("right")}
            className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white text-slate-700 shadow-md border border-slate-200 flex items-center justify-center hover:bg-slate-50 hover:border-[#0b1f3a] transition-all cursor-pointer"
            aria-label="Next courses"
          >
            <ChevronRight className="w-5 h-5 text-slate-700" />
          </button>

          {/* Scrolling Track */}
          <div
            ref={carouselRef}
            onScroll={handleScrollEvent}
            className="flex gap-4 sm:gap-5 overflow-x-auto scrollbar-hide py-2 pb-4 snap-x snap-mandatory scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {courses.map((course, idx) => {
              let badgeStyle = "bg-[#e6f7ed] text-[#16a34a] border border-[#bbf7d0]";
              if (course.status === "Few Seats Available") {
                badgeStyle = "bg-[#fff7ed] text-[#ea580c] border border-[#ffedd5]";
              } else if (course.status === "Upcoming Batch") {
                badgeStyle = "bg-[#eff6ff] text-[#2563eb] border border-[#dbeafe]";
              }

              return (
                <div
                  key={course.id || idx}
                  className="w-[260px] sm:w-[280px] md:w-[290px] shrink-0 snap-start bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:border-slate-300 transition-all duration-300 group/card"
                >
                  {/* Top Image */}
                  <div className="h-44 sm:h-48 overflow-hidden relative bg-slate-100">
                    <img
                      src={course.thumbnail_url || course.image_url}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>

                  {/* Card Body */}
                  <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
                    <div>
                      {/* Course Title */}
                      <h3 className="font-bold text-base text-[#0b1f3a] leading-snug mb-3 line-clamp-1 group-hover/card:text-[#f97316] transition-colors" title={course.title}>
                        {course.title}
                      </h3>

                      {/* Meta Rows */}
                      <div className="space-y-1.5 mb-3 text-xs font-medium text-slate-600">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                          <span>{course.duration || "30 Days"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                          <span>{course.timing || "10:00 AM - 02:00 PM"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                          <span>{course.location || "Chennai"}</span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="mb-4">
                        <span className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-extrabold ${badgeStyle}`}>
                          {course.status || "Admissions Open"}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                      <Link
                        href={`/courses/${course.slug || course.id || ""}`}
                        className="bg-[#0b1f3a] hover:bg-[#152e52] text-white text-center text-[11px] font-black py-2.5 rounded-lg transition-colors flex items-center justify-center"
                      >
                        View Details
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleOpenEnquiry(course.title)}
                        className="bg-[#f97316] hover:bg-[#ea580c] text-white text-center text-[11px] font-black py-2.5 rounded-lg transition-colors cursor-pointer shadow-xs"
                      >
                        Enquire Now
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Carousel Pagination Dots */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {[0, 1, 2, 3].map((dot) => (
              <button
                key={dot}
                type="button"
                onClick={() => {
                  if (carouselRef.current) {
                    carouselRef.current.scrollTo({ left: dot * 320, behavior: "smooth" });
                    setActiveDot(dot);
                  }
                }}
                className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                  activeDot === dot ? "bg-[#f97316] w-5" : "bg-slate-300 hover:bg-slate-400"
                }`}
                aria-label={`Go to slide ${dot + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Enquiry Modal */}
      <EnquiryModal
        isOpen={isEnquiryOpen}
        onClose={() => setIsEnquiryOpen(false)}
        defaultCourse={selectedCourse}
      />
    </section>
  );
}
