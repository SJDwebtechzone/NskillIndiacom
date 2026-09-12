"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Download,
  GraduationCap,
  Wrench,
  Building2,
  Award,
  Briefcase,
  Wallet,
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileSearch,
  CalendarDays,
  Headphones,
  UserCheck,
  PlayCircle,
} from "lucide-react";
import EnquiryModal from "./EnquiryModal";

interface BatchItem {
  id: string | number;
  courseName: string;
  startDate: string;
  duration: string;
  timing: string;
  seats: number;
  status: "Admissions Open" | "Few Seats" | "Upcoming";
}

const FALLBACK_BATCHES: BatchItem[] = [
  {
    id: 1,
    courseName: "HVAC Engineer",
    startDate: "01 Sep 2026",
    duration: "30 Days",
    timing: "10AM - 02PM",
    seats: 15,
    status: "Admissions Open",
  },
  {
    id: 2,
    courseName: "Industrial Electrician",
    startDate: "07 Sep 2026",
    duration: "30 Days",
    timing: "10AM - 02PM",
    seats: 12,
    status: "Admissions Open",
  },
  {
    id: 3,
    courseName: "6G Welding Training",
    startDate: "14 Sep 2026",
    duration: "45 Days",
    timing: "10AM - 04PM",
    seats: 10,
    status: "Few Seats",
  },
  {
    id: 4,
    courseName: "Quality Inspector",
    startDate: "21 Sep 2026",
    duration: "30 Days",
    timing: "10AM - 02PM",
    seats: 15,
    status: "Few Seats",
  },
  {
    id: 5,
    courseName: "MEP Technician",
    startDate: "28 Sep 2026",
    duration: "30 Days",
    timing: "10AM - 02PM",
    seats: 12,
    status: "Upcoming",
  },
];

const JOIN_STEPS = [
  {
    step: "01",
    title: "Select Course",
    desc: "Choose your preferred training program",
    icon: FileSearch,
  },
  {
    step: "02",
    title: "Check Batch",
    desc: "Select available batch from course calendar",
    icon: CalendarDays,
  },
  {
    step: "03",
    title: "Counselling",
    desc: "Talk to our course counsellor for guidance",
    icon: Headphones,
  },
  {
    step: "04",
    title: "Registration",
    desc: "Complete your admission process",
    icon: UserCheck,
  },
  {
    step: "05",
    title: "Start Training",
    desc: "Begin your learning journey",
    icon: PlayCircle,
  },
];

export default function UpcomingBatchesSection() {
  const [batches, setBatches] = useState<BatchItem[]>(FALLBACK_BATCHES);
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>("");

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/course_events`
        );
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const mapped: BatchItem[] = data.slice(0, 5).map((ev: any, idx: number) => {
              const d = ev.start_date ? new Date(ev.start_date) : new Date();
              const months = [
                "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
              ];
              const dateStr = `${d.getDate().toString().padStart(2, "0")} ${months[d.getMonth()]} ${d.getFullYear()}`;
              
              let status: BatchItem["status"] = "Admissions Open";
              if (ev.event_type === "batch2" || idx === 2 || idx === 3) status = "Few Seats";
              else if (idx === 4) status = "Upcoming";

              return {
                id: ev.id || idx,
                courseName: ev.course_name || ev.title,
                startDate: dateStr,
                duration: "30 Days",
                timing: idx % 3 === 2 ? "10AM - 04PM" : "10AM - 02PM",
                seats: 10 + (idx % 6),
                status,
              };
            });
            setBatches(mapped);
          }
        }
      } catch (err) {
        console.error("Error loading upcoming batches:", err);
      }
    };

    fetchBatches();
  }, []);

  const handleOpenEnquiry = (courseName: string) => {
    setSelectedCourse(courseName);
    setIsEnquiryOpen(true);
  };

  const handleDownloadCalendar = () => {
    setSelectedCourse("2026-27 Course Calendar");
    setIsEnquiryOpen(true);
  };

  return (
    <section className="py-14 md:py-18 bg-white relative overflow-hidden">
      <div className="mx-auto max-w-[1440px] px-4 md:px-8 lg:px-12">
        {/* ── Top Row: Next Available Batches & Download Calendar ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch mb-14">
          
          {/* Left: Next Available Batches Table (lg:col-span-8) */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between">
            <div>
              <p className="text-[#f97316] font-extrabold text-xs sm:text-sm tracking-wider uppercase mb-1">
                UPCOMING BATCHES
              </p>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0b1f3a] tracking-tight mb-5">
                Next Available Batches
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-2">Course Name</th>
                      <th className="py-3 px-2">Start Date</th>
                      <th className="py-3 px-2">Duration</th>
                      <th className="py-3 px-2">Timing</th>
                      <th className="py-3 px-2 text-center">Seats</th>
                      <th className="py-3 px-2 text-center">Status</th>
                      <th className="py-3 px-2 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                    {batches.map((b) => {
                      let statusBadge = (
                        <span className="bg-[#e6f7ed] text-[#16a34a] border border-[#bbf7d0] px-2.5 py-1 rounded-md text-[11px] font-extrabold whitespace-nowrap">
                          Admissions Open
                        </span>
                      );
                      if (b.status === "Few Seats") {
                        statusBadge = (
                          <span className="bg-[#fff7ed] text-[#ea580c] border border-[#ffedd5] px-2.5 py-1 rounded-md text-[11px] font-extrabold whitespace-nowrap">
                            Few Seats
                          </span>
                        );
                      } else if (b.status === "Upcoming") {
                        statusBadge = (
                          <span className="bg-[#eff6ff] text-[#2563eb] border border-[#dbeafe] px-2.5 py-1 rounded-md text-[11px] font-extrabold whitespace-nowrap">
                            Upcoming
                          </span>
                        );
                      }

                      return (
                        <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-2 font-bold text-[#0b1f3a] max-w-[150px] truncate" title={b.courseName}>
                            {b.courseName}
                          </td>
                          <td className="py-3.5 px-2 whitespace-nowrap text-slate-600">
                            {b.startDate}
                          </td>
                          <td className="py-3.5 px-2 whitespace-nowrap text-slate-600">
                            {b.duration}
                          </td>
                          <td className="py-3.5 px-2 whitespace-nowrap font-bold text-[#0b1f3a]">
                            {b.timing}
                          </td>
                          <td className="py-3.5 px-2 text-center font-bold text-slate-700">
                            {b.seats}
                          </td>
                          <td className="py-3.5 px-2 text-center">
                            {statusBadge}
                          </td>
                          <td className="py-3.5 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleOpenEnquiry(b.courseName)}
                              className="text-[#1e40af] hover:text-[#f97316] font-bold text-xs transition-colors cursor-pointer whitespace-nowrap"
                            >
                              Enquire Now
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-5 mt-2">
              <Link
                href="/course_calender"
                className="inline-block bg-[#0b1f3a] hover:bg-[#152e52] text-white font-black text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition-all shadow-sm"
              >
                VIEW FULL CALENDAR
              </Link>
            </div>
          </div>

          {/* Right: Download Course Calendar Card (lg:col-span-4) */}
          <div className="lg:col-span-4 bg-[#031b34] rounded-3xl p-6 sm:p-7 text-white shadow-[0_10px_35px_rgb(0,0,0,0.15)] flex flex-col justify-between relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-[#f97316] font-extrabold text-xs uppercase tracking-wider mb-1.5">
                DOWNLOAD
              </p>
              <h3 className="text-2xl font-black text-white leading-tight mb-2">
                Course Calendar<br />2026–27
              </h3>
              <p className="text-xs font-medium text-slate-300 leading-relaxed mb-4">
                Get complete schedule of all upcoming batches, course details &amp; duration.
              </p>
            </div>

            {/* Flyer / Brochure Graphic */}
            <div className="relative z-10 my-2 flex items-center justify-center">
              <div className="w-48 sm:w-52 transform group-hover:scale-105 transition-transform duration-500 shadow-2xl rounded-xl overflow-hidden border border-white/20">
                <img
                  src="/coursecalender/calenderbanner.png"
                  alt="Course Calendar Brochure"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>

            {/* Download Button */}
            <div className="relative z-10 pt-4">
              <button
                type="button"
                onClick={handleDownloadCalendar}
                className="w-full py-3.5 bg-[#f97316] hover:bg-[#ea580c] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span>DOWNLOAD NOW</span>
                <Download className="w-4 h-4" />
              </button>
            </div>

            {/* Background Glow */}
            <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
          </div>

        </div>

        {/* ── Bottom Row: How To Join N-Skill (5 Steps) ── */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-[0_4px_25px_rgb(0,0,0,0.03)]">
          <div className="mb-8">
            <p className="text-[#f97316] font-extrabold text-xs sm:text-sm tracking-wider uppercase mb-1">
              HOW TO JOIN N-SKILL
            </p>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0b1f3a] tracking-tight">
              Start Your Journey in 5 Simple Steps
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 lg:gap-4 relative items-start">
            {JOIN_STEPS.map((item, idx) => {
              const IconComponent = item.icon;
              const isLast = idx === JOIN_STEPS.length - 1;

              return (
                <div key={idx} className="flex flex-col items-center text-center relative group px-2">
                  {/* Circular Icon Container with Outer Ring */}
                  <div className="relative mb-4 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full border border-slate-200 bg-white shadow-sm flex items-center justify-center text-[#1e40af] group-hover:border-[#1e40af] group-hover:scale-105 transition-all duration-300">
                      <div className="w-16 h-16 rounded-full bg-blue-50/50 flex items-center justify-center">
                        <IconComponent className="w-8 h-8 text-[#1e40af] stroke-[1.75]" />
                      </div>
                    </div>
                  </div>

                  {/* Step Number & Title */}
                  <div className="text-sm font-extrabold text-[#0b1f3a] mb-1.5 flex items-center gap-1.5 justify-center">
                    <span className="text-[#0b1f3a] font-black">{item.step}</span>
                    <span className="font-bold">{item.title}</span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-[200px]">
                    {item.desc}
                  </p>

                  {/* Arrow Indicator between steps (Desktop) */}
                  {!isLast && (
                    <div className="hidden lg:flex absolute -right-3 top-8 items-center justify-center text-[#f97316] z-10">
                      <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                    </div>
                  )}
                </div>
              );
            })}
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
