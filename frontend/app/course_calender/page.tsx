"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Search,
  MapPin,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  User,
  Mail,
  Phone,
  BookOpen,
  Send,
  CheckCircle2,
  Loader2,
  Rocket,
  BadgeCheck,
  MessageSquare,
  CalendarDays,
  Users,
  GraduationCap,
  Building2,
  UserCheck,
  MessageCircle,
  Star,
  Download,
  Flame,
  Zap,
  Wind,
  Wrench,
  ShieldCheck,
  PhoneCall,
  FileText,
} from "lucide-react";
import EnquiryModal from "../components/EnquiryModal";
import AnimatedCalendarBanner from "../components/AnimatedCalendarBanner";


function formatEventDate(dateString: string) {
  if (!dateString) return "";
  const d = new Date(dateString);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${d.getDate().toString().padStart(2, "0")} ${months[d.getMonth()]} ${d.getFullYear()}`;
}
const CATEGORIES_DATA = [
  { name: "Welding" },
  { name: "HVAC & Refrigeration" },
  { name: "Electrical" },
  { name: "Plumbing" },
  { name: "MEP" },
  { name: "Quality" },
  { name: "Safety" },
  { name: "Home Appliance" },
  { name: "Oil & Gas" },
];

const TESTIMONIALS_DATA = [
  {
    name: "Karthik R.",
    role: "HVAC Engineer",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    quote: "N-Skill gave me the right skills and confidence. The practical training was excellent.",
    rating: 5,
  },
  {
    name: "Suresh M.",
    role: "6G Welding",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    quote: "Best training institute for welding. Good facilities and experienced trainers.",
    rating: 5,
  },
  {
    name: "Mohammed Imran",
    role: "Industrial Electrician",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    quote: "The course content and practical sessions were very helpful for my career.",
    rating: 5,
  },
  {
    name: "Vignesh K.",
    role: "MEP Technician",
    image: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
    quote: "Top notch practical sessions and direct placement support. Highly recommended!",
    rating: 5,
  },
];

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

function getCourseImage(category: string, index: number): string {
  const pool = CATEGORY_IMAGES[category] ?? FALLBACK_IMAGES;
  return pool[index % pool.length];
}

const COURSE_METADATA_MAP: Record<string, { fee: string; badge: string; time: string; level: string; mode: string }> = {
  "welding": { fee: "₹25,000 + GST", badge: "ADMISSIONS OPEN", time: "10:00 AM - 04:00 PM", level: "Certificate", mode: "Practical Lab" },
  "6g welding": { fee: "₹55,000 + GST", badge: "ADMISSIONS OPEN", time: "10:00 AM - 04:00 PM", level: "Advanced", mode: "Practical Lab" },
  "hvac": { fee: "₹15,000 + GST", badge: "ADMISSIONS OPEN", time: "10:00 AM - 02:00 PM", level: "Diploma", mode: "Classroom / Lab" },
  "electrician": { fee: "₹14,000 + GST", badge: "ADMISSIONS OPEN", time: "10:00 AM - 02:00 PM", level: "Certificate", mode: "Practical Lab" },
  "quality": { fee: "₹16,000 + GST", badge: "FEW SEATS", time: "10:00 AM - 02:00 PM", level: "Diploma", mode: "Classroom / Lab" },
  "plumbing": { fee: "₹8,000 + GST", badge: "UPCOMING BATCH", time: "10:00 AM - 02:00 PM", level: "Certificate", mode: "Practical Lab" },
  "home appliance": { fee: "₹10,000 + GST", badge: "ADMISSIONS OPEN", time: "10:00 AM - 02:00 PM", level: "Certificate", mode: "Practical Lab" },
  "mep": { fee: "₹16,000 + GST", badge: "ADMISSIONS OPEN", time: "10:00 AM - 02:00 PM", level: "Advanced", mode: "Classroom / Lab" },
  "safety": { fee: "₹12,000 + GST", badge: "ADMISSIONS OPEN", time: "10:00 AM - 02:00 PM", level: "Certificate", mode: "Classroom" },
  "oil & gas": { fee: "₹55,000 + GST", badge: "FEW SEATS", time: "10:00 AM - 04:00 PM", level: "Advanced", mode: "Classroom / Lab" },
};

function getCourseMeta(course: any) {
  const title = (course?.title || "").toLowerCase();
  const cat = (course?.category || "").toLowerCase();

  for (const [key, val] of Object.entries(COURSE_METADATA_MAP)) {
    if (title.includes(key) || cat.includes(key)) {
      return val;
    }
  }
  return {
    fee: "₹15,000 + GST",
    badge: "ADMISSIONS OPEN",
    time: "10:00 AM - 02:00 PM",
    level: "Certificate",
    mode: "Classroom / Lab",
  };
}

type EventType = "batch1" | "batch2" | "both";
type Week      = "First" | "Second" | "Third" | "Fourth";

// ─── Custom Icons for Hero Features ───────────────────────────────────────────
// â”€â”€â”€ Custom Icons for Hero Features â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function PracticalTrainingIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

function IndustryCurriculumIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" strokeWidth="2.5" />
    </svg>
  );
}

function ExperiencedTrainersIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function PlacementAssistanceIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

interface CourseEvent {
  id:          number;
  title:       string;
  description: string;
  course_name: string;
  start_date:  string;
  end_date:    string;
  event_type:  EventType;
}

interface ColorPalette {
  bgColor:     string;
  borderColor: string;
  dotColor:    string;
  solidColor:  string;
}

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}/api/course_events`;

const MONTHS_FY: { month: string; year: number }[] = [
  { month: "April",     year: 2026 },
  { month: "May",       year: 2026 },
  { month: "June",      year: 2026 },
  { month: "July",      year: 2026 },
  { month: "August",    year: 2026 },
  { month: "September", year: 2026 },
  { month: "October",   year: 2026 },
  { month: "November",  year: 2026 },
  { month: "December",  year: 2026 },
  { month: "January",   year: 2027 },
  { month: "February",  year: 2027 },
  { month: "March",     year: 2027 },
];

const WEEK_ORDER: Week[] = ["First", "Second", "Third", "Fourth"];
const WEEK_LABEL: Record<Week, string> = {
  First: "1st Week", Second: "2nd Week", Third: "3rd Week", Fourth: "4th Week",
};
const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const COLOR_PALETTES: ColorPalette[] = [
  { bgColor: "rgba(59,130,246,0.1)",  borderColor: "rgba(59,130,246,0.25)",  dotColor: "#3b82f6", solidColor: "#1d4ed8" },
  { bgColor: "rgba(16,185,129,0.1)",  borderColor: "rgba(16,185,129,0.25)",  dotColor: "#10b981", solidColor: "#059669" },
  { bgColor: "rgba(245,158,11,0.1)",  borderColor: "rgba(245,158,11,0.25)",  dotColor: "#f59e0b", solidColor: "#d97706" },
  { bgColor: "rgba(139,92,246,0.1)",  borderColor: "rgba(139,92,246,0.25)",  dotColor: "#8b5cf6", solidColor: "#7c3aed" },
  { bgColor: "rgba(239,68,68,0.1)",   borderColor: "rgba(239,68,68,0.25)",   dotColor: "#ef4444", solidColor: "#dc2626" },
  { bgColor: "rgba(236,72,153,0.1)",  borderColor: "rgba(236,72,153,0.25)",  dotColor: "#ec4899", solidColor: "#db2777" },
  { bgColor: "rgba(20,184,166,0.1)",  borderColor: "rgba(20,184,166,0.25)",  dotColor: "#14b8a6", solidColor: "#0d9488" },
  { bgColor: "rgba(249,115,22,0.1)",  borderColor: "rgba(249,115,22,0.25)",  dotColor: "#f97316", solidColor: "#ea580c" },
];

function getCourseColor(courseName: string, allCourseNames: string[]): ColorPalette {
  const idx = allCourseNames.indexOf(courseName);
  return COLOR_PALETTES[(idx < 0 ? 0 : idx) % COLOR_PALETTES.length];
}

function getDaysInMonth(month: string, year: number): number {
  return new Date(year, new Date(`${month} 1, ${year}`).getMonth() + 1, 0).getDate();
}

function getFirstDayOfMonth(month: string, year: number): number {
  return new Date(year, new Date(`${month} 1, ${year}`).getMonth(), 1).getDay();
}

function isToday(day: number, month: string, year: number): boolean {
  const t = new Date();
  return t.getDate() === day &&
    t.getMonth() === new Date(`${month} 1, ${year}`).getMonth() &&
    t.getFullYear() === year;
}

function dateToWeek(dateStr: string): Week {
  const day = parseInt(dateStr.split("-")[2], 10);
  if (day <= 7)  return "First";
  if (day <= 14) return "Second";
  if (day <= 21) return "Third";
  return "Fourth";
}

function dateToMonthYear(dateStr: string): { month: string; year: number } {
  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const parts = dateStr.split("-");
  return { year: parseInt(parts[0], 10), month: monthNames[parseInt(parts[1], 10) - 1] };
}

function buildDateMap(events: CourseEvent[], totalDays: number): Record<number, CourseEvent[]> {
  const map: Record<number, CourseEvent[]> = {};
  events.forEach((ev) => {
    const wi = WEEK_ORDER.indexOf(dateToWeek(ev.start_date));
    if (wi < 0) return;
    const start = wi * 7 + 1;
    const end   = wi === 3 ? totalDays : Math.min(start + 6, totalDays);
    for (let d = start; d <= end; d++) {
      if (!map[d]) map[d] = [];
      map[d].push(ev);
    }
  });
  return map;
}

async function fetchEvents(): Promise<CourseEvent[]> {
  const res = await fetch(API_BASE, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch events");
  return res.json();
}

export default function StudentCalendar() {
  const [events,       setEvents]       = useState<CourseEvent[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedDuration, setSelectedDuration] = useState("All Durations");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [selectedMode, setSelectedMode] = useState("All Training Modes");
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/courses`)
      .then(r => r.json())
      .then(data => { if(Array.isArray(data)) setCourses(data); })
      .catch(console.error);
  }, []);

  const handleOpenEnquiry = (courseName: string) => {
    setDemoForm(prev => ({ ...prev, course_id: courseName }));
    setShowEnquiryModal(true);
  };

  const [monthIdx,     setMonthIdx]     = useState(0);
  const [selectedDay,  setSelectedDay]  = useState<number | null>(null);
  const [filterCourse, setFilterCourse] = useState<string>("all");
  const [filterBatch,  setFilterBatch]  = useState<"all" | "batch1" | "batch2">("all");
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [submittedDemo, setSubmittedDemo] = useState(false);
  const [demoForm, setDemoForm] = useState({
    name: "", address: "", email: "", phone: "", date: "", time: "", course_id: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadEvents = useCallback(async () => {
    setLoading(true); setError("");
    try { setEvents(await fetchEvents()); }
    catch (e: any) { setError(e.message ?? "Failed to load"); }
    finally { setLoading(false); }
  }, []);

  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = `/courses?search=${encodeURIComponent(searchInput)}`;
  };

  const handleDemoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(demoForm),
      });
      if (!res.ok) throw new Error("Failed to book demo");
      setSubmittedDemo(true);
      setDemoForm({ name: "", address: "", email: "", phone: "", date: "", time: "", course_id: "" });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => { loadEvents(); }, [loadEvents]);
  useEffect(() => { setSelectedDay(null); }, [monthIdx, filterCourse, filterBatch]);

  // Handle modal close
  const closeDemoModal = () => {
    setShowDemoModal(false);
    setSubmittedDemo(false);
  };

  const { month, year } = MONTHS_FY[monthIdx];

  const monthEvents = events.filter((e) => {
    const { month: em, year: ey } = dateToMonthYear(e.start_date);
    return em === month && ey === year;
  });

  const filteredEvents = monthEvents.filter((e) => {
    const courseMatch = filterCourse === "all" || e.course_name === filterCourse;
    const batchMatch  = filterBatch === "all" || e.event_type === filterBatch || e.event_type === "both";
    return courseMatch && batchMatch;
  });

  // Dynamic filtered courses for Next Available Batches
  const filteredCourses = courses.filter((c) => {
    if (searchInput.trim()) {
      const q = searchInput.toLowerCase().trim();
      const titleMatch = (c.title || "").toLowerCase().includes(q);
      const catMatch = (c.category || "").toLowerCase().includes(q);
      const contentMatch = (c.content || "").toLowerCase().includes(q);
      if (!titleMatch && !catMatch && !contentMatch) return false;
    }
    if (selectedCategory !== "all" && selectedCategory !== "All Categories") {
      if ((c.category || "").toLowerCase() !== selectedCategory.toLowerCase()) return false;
    }
    if (selectedDuration !== "all" && selectedDuration !== "All Durations") {
      if (!c.duration || !c.duration.toLowerCase().includes(selectedDuration.toLowerCase())) return false;
    }
    const meta = getCourseMeta(c);
    if (selectedMode !== "all" && selectedMode !== "All Training Modes") {
      if (!meta.mode.toLowerCase().includes(selectedMode.toLowerCase())) return false;
    }
    return true;
  });

  // Ref and controls for horizontal single-row scrolling of batches
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  const totalDays        = getDaysInMonth(month, year);
  const startDay         = getFirstDayOfMonth(month, year);
  const dateMap          = buildDateMap(filteredEvents, totalDays);
  const allCourses       = [...new Set(events.map((e) => e.course_name))].sort();
  const monthCourseNames = [...new Set(monthEvents.map((e) => e.course_name))];
  const batch1Count      = monthEvents.filter((e) => e.event_type === "batch1" || e.event_type === "both").length;
  const batch2Count      = monthEvents.filter((e) => e.event_type === "batch2" || e.event_type === "both").length;

  const [calendarViewMode, setCalendarViewMode] = useState<"calendar" | "list">("calendar");
  const [showAllBatches, setShowAllBatches] = useState(false);

  // Dynamic batch schedule calculation
  interface BatchRowItem {
    id: string;
    courseName: string;
    title: string;
    startDate: string;
    dayNumber: number;
    duration: string;
    timing: string;
    location: string;
    seats: number;
    status: "Open" | "Few Seats" | "Upcoming" | "Batch Full";
    batchType: string;
  }

  const currentMonthBatches = useMemo<BatchRowItem[]>(() => {
    // 1. If we have events from database for this month:
    const dbBatches: BatchRowItem[] = monthEvents.map((ev, index) => {
      const day = parseInt(ev.start_date.split("-")[2], 10) || ((index * 6) % totalDays) + 1;
      const dStr = formatEventDate(ev.start_date) || `${day.toString().padStart(2, "0")} ${month.slice(0, 3)} ${year}`;
      let status: "Open" | "Few Seats" | "Upcoming" | "Batch Full" = "Open";
      if (ev.event_type === "batch2") status = "Few Seats";
      else if (index % 4 === 3) status = "Upcoming";
      else if (index % 5 === 4) status = "Few Seats";

      return {
        id: `ev-${ev.id}`,
        courseName: ev.course_name || ev.title,
        title: ev.title,
        startDate: dStr,
        dayNumber: day,
        duration: "30 Days",
        timing: "10AM - 02PM",
        location: "Chennai",
        seats: 12 + (index % 6),
        status,
        batchType: ev.event_type === "batch2" ? "Batch 2" : "Batch 1",
      };
    });

    if (dbBatches.length > 0) return dbBatches;

    // 2. Dynamic batches from courses if no events loaded for the month
    const fallbackList: {
      name: string;
      category: string;
      duration: string;
      day: number;
      timing: string;
      seats: number;
      status: "Open" | "Few Seats" | "Upcoming" | "Batch Full";
      batch: string;
    }[] = [
      { name: "HVAC Engineer", category: "HVAC & Refrigeration", duration: "30 Days", day: 1, timing: "10AM - 02PM", seats: 15, status: "Open", batch: "Batch 1" },
      { name: "Industrial Electrician", category: "Electrical", duration: "30 Days", day: 7, timing: "10AM - 02PM", seats: 12, status: "Open", batch: "Batch 1" },
      { name: "6G Welding Training", category: "Welding", duration: "45 Days", day: 14, timing: "10AM - 04PM", seats: 10, status: "Open", batch: "Batch 1" },
      { name: "Quality Inspector", category: "Quality", duration: "30 Days", day: 21, timing: "10AM - 02PM", seats: 15, status: "Few Seats", batch: "Batch 2" },
      { name: "MEP Technician", category: "MEP", duration: "30 Days", day: 28, timing: "10AM - 02PM", seats: 12, status: "Upcoming", batch: "Upcoming" },
    ];

    if (courses.length > 0) {
      return courses.slice(0, 8).map((c, idx) => {
        const days = [1, 7, 14, 18, 21, 25, 28, 30];
        const day = days[idx % days.length];
        const dayStr = `${day.toString().padStart(2, "0")} ${month.slice(0, 3)} ${year}`;
        let status: "Open" | "Few Seats" | "Upcoming" | "Batch Full" = "Open";
        if (idx === 3 || idx === 6) status = "Few Seats";
        else if (idx === 4 || idx === 7) status = "Upcoming";

        return {
          id: `c-${c.id || idx}`,
          courseName: c.title,
          title: c.title,
          startDate: dayStr,
          dayNumber: day,
          duration: c.duration || "30 Days",
          timing: idx % 3 === 2 ? "10AM - 04PM" : "10AM - 02PM",
          location: "Chennai",
          seats: 10 + ((idx * 3) % 8),
          status,
          batchType: status === "Few Seats" ? "Batch 2" : status === "Upcoming" ? "Upcoming" : "Batch 1",
        };
      });
    }

    return fallbackList.map((f, idx) => ({
      id: `fb-${idx}`,
      courseName: f.name,
      title: f.name,
      startDate: `${f.day.toString().padStart(2, "0")} ${month.slice(0, 3)} ${year}`,
      dayNumber: f.day,
      duration: f.duration,
      timing: f.timing,
      location: "Chennai",
      seats: f.seats,
      status: f.status,
      batchType: f.batch,
    }));
  }, [monthEvents, courses, month, year, totalDays]);

  // Map day numbers (1..totalDays) to batches scheduled on that day
  const dayBatchesMap = useMemo(() => {
    const map: Record<number, typeof currentMonthBatches> = {};
    currentMonthBatches.forEach((b) => {
      if (!map[b.dayNumber]) map[b.dayNumber] = [];
      map[b.dayNumber].push(b);
    });
    return map;
  }, [currentMonthBatches]);

  const prevMonthIdx = (monthIdx - 1 + MONTHS_FY.length) % MONTHS_FY.length;
  const prevMonthName = MONTHS_FY[prevMonthIdx].month;
  const prevMonthYear = MONTHS_FY[prevMonthIdx].year;
  const prevMonthTotalDays = getDaysInMonth(prevMonthName, prevMonthYear);
  const totalCells = startDay + totalDays;
  const trailingCount = (7 - (totalCells % 7)) % 7;

  const displayedBatches = useMemo(() => {
    let list = currentMonthBatches;
    if (selectedDay !== null) {
      const filtered = list.filter((b) => b.dayNumber === selectedDay);
      if (filtered.length > 0) list = filtered;
    }
    if (!showAllBatches && list.length > 6) {
      return list.slice(0, 6);
    }
    return list;
  }, [currentMonthBatches, selectedDay, showAllBatches]);

  const [downloadPhone, setDownloadPhone] = useState("");
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  const handleCalendarDownload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!downloadPhone.trim()) return;
    setDownloadSuccess(true);
    alert(`Thank you! The 2026-27 Course Calendar has been sent to +91 ${downloadPhone}`);
    setDownloadPhone("");
  };

  const handlePrevTestimonial = () => {
    setTestimonialIdx((prev) => (prev === 0 ? TESTIMONIALS_DATA.length - 1 : prev - 1));
  };

  const handleNextTestimonial = () => {
    setTestimonialIdx((prev) => (prev + 1) % TESTIMONIALS_DATA.length);
  };

  const visibleTestimonials = useMemo(() => {
    const list = [];
    for (let i = 0; i < 3; i++) {
      list.push(TESTIMONIALS_DATA[(testimonialIdx + i) % TESTIMONIALS_DATA.length]);
    }
    return list;
  }, [testimonialIdx]);

  return (
    <div className="min-h-screen bg-slate-50">
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.25s ease; }
        .cal-cell {
          border-bottom: 1px solid #e2e8f0;
          border-right: 1px solid #e2e8f0;
          min-height: 50px;
          padding: 6px;
          transition: background 0.15s;
        }
        @media (min-width: 640px) {
          .cal-cell {
            min-height: 110px;
            padding: 10px;
          }
        }
        .cal-cell:hover { background: #f8fafc !important; }
      `}</style>

      {/* ── Hero Banner ── */}
      <section className="relative overflow-hidden bg-[#031525] pb-8 md:pb-10 lg:pb-12">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/coursecalender/calenderbanner.png"
            alt="Course Calendar Banner"
            className="h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#031525] via-[#031525]/90 to-transparent lg:w-[65%]" />
        </div>

        <div className="relative z-10 mx-auto max-w-[1500px] px-3 py-5 md:px-6 md:py-7 lg:px-10 lg:py-8">
          <div className="grid min-h-[360px] items-center gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="max-w-[620px] text-left">
              {/* Orange "Upcoming" label */}
              <p className="text-[#f97316] text-xs sm:text-sm md:text-base font-bold mb-1">Upcoming</p>

              {/* Main heading */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[38px] xl:text-[42px] font-black text-white leading-tight tracking-tight mb-1 lg:whitespace-nowrap">
                Technical Training Courses
              </h1>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[38px] xl:text-[42px] font-black text-white leading-tight tracking-tight mb-3">
                &amp; Batch Calendar <span className="text-[#f97316]">2026–27</span>
              </h1>

              {/* Description */}
              <p className="text-slate-200 text-xs sm:text-sm md:text-base font-normal mb-5 leading-relaxed max-w-lg">
                Choose your course, check upcoming batches and start your journey towards a successful career.
              </p>

              {/* 4 Feature Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 text-white">
                <div className="flex items-center gap-2">
                  <PracticalTrainingIcon className="w-6 h-6 text-white/80 shrink-0" />
                  <span className="text-[11px] sm:text-xs font-semibold leading-snug">Practical<br />Training</span>
                </div>
                <div className="flex items-center gap-2">
                  <IndustryCurriculumIcon className="w-6 h-6 text-white/80 shrink-0" />
                  <span className="text-[11px] sm:text-xs font-semibold leading-snug">Industry<br />Oriented</span>
                </div>
                <div className="flex items-center gap-2">
                  <ExperiencedTrainersIcon className="w-6 h-6 text-white/80 shrink-0" />
                  <span className="text-[11px] sm:text-xs font-semibold leading-snug">Expert<br />Trainers</span>
                </div>
                <div className="flex items-center gap-2">
                  <PlacementAssistanceIcon className="w-6 h-6 text-white/80 shrink-0" />
                  <span className="text-[11px] sm:text-xs font-semibold leading-snug">Placement<br />Assistance</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
                <button
                  onClick={() => {
                    const el = document.getElementById("calendar-section");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center bg-[#f97316] hover:bg-[#ea580c] text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-600/30 transition-all active:scale-95 cursor-pointer"
                >
                  VIEW UPCOMING BATCHES
                </button>
                <button
                  onClick={() => setShowEnquiryModal(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center bg-white hover:bg-slate-50 text-[#0b1f3a] px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-md"
                >
                  <MessageCircle className="w-4 h-4 text-green-500 mr-2" />
                  TALK TO COUNSELLOR
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Stats Bar */}
      <div className="mx-auto max-w-[1200px] px-4 relative z-20 -mt-8 md:-mt-10 mb-8 md:mb-10">
        <div className="bg-white rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.08)] py-6 px-4 md:px-10 grid grid-cols-2 lg:grid-cols-4 gap-6 border border-slate-100">
          <div className="flex items-center gap-3 sm:gap-4 justify-center">
            <GraduationCap className="w-9 h-9 sm:w-10 sm:h-10 text-[#0b1f3a] shrink-0" strokeWidth={1.5} />
            <div>
              <h3 className="text-xl md:text-2xl font-black text-[#0b1f3a]">5000+</h3>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Students Trained</p>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 justify-center lg:border-l lg:border-slate-200">
            <BookOpen className="w-9 h-9 sm:w-10 sm:h-10 text-[#0b1f3a] shrink-0" strokeWidth={1.5} />
            <div>
              <h3 className="text-xl md:text-2xl font-black text-[#0b1f3a]">50+</h3>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Skill Programs</p>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 justify-center lg:border-l lg:border-slate-200">
            <Building2 className="w-9 h-9 sm:w-10 sm:h-10 text-[#0b1f3a] shrink-0" strokeWidth={1.5} />
            <div>
              <h3 className="text-xl md:text-2xl font-black text-[#0b1f3a]">100+</h3>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Industry Connections</p>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 justify-center lg:border-l lg:border-slate-200">
            <UserCheck className="w-9 h-9 sm:w-10 sm:h-10 text-[#0b1f3a] shrink-0" strokeWidth={1.5} />
            <div>
              <p className="text-base font-black text-[#0b1f3a] leading-tight">Experienced</p>
              <p className="text-base font-black text-[#0b1f3a] leading-tight">Trainers</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Next Available Batches & Search ───────────────────────────────────── */}
      <div id="next-batches-section" className="mx-auto max-w-[1400px] px-4 md:px-8 lg:px-12 relative z-10 mb-16">
        <div className="flex flex-col xl:flex-row gap-6 items-start">
          
          {/* Left: Next Available Batches */}
          <div className="flex-1 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-5 md:p-7 border border-slate-100 min-w-0 w-full overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 mb-6 gap-3">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-[#0b1f3a] flex items-center gap-2 tracking-tight">
                  🔥 Next Available Batches
                </h2>
                <p className="text-slate-500 text-sm md:text-[15px] font-semibold mt-1">
                  Admissions are currently open for the following programs.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg w-fit whitespace-nowrap">
                  {filteredCourses.length} {filteredCourses.length === 1 ? "Program" : "Programs"} Available
                </span>
                {filteredCourses.length > 0 && (
                  <div className="flex items-center gap-1.5 ml-1">
                    <button
                      type="button"
                      onClick={handleScrollLeft}
                      className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center transition-all shadow-sm hover:border-[#0b1f3a] cursor-pointer"
                      aria-label="Scroll left"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleScrollRight}
                      className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center transition-all shadow-sm hover:border-[#0b1f3a] cursor-pointer"
                      aria-label="Scroll right"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 1-Row Horizontal Scrolling Courses Container */}
            {filteredCourses.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-slate-500 font-semibold text-sm">No courses found matching your criteria.</p>
                <button
                  onClick={() => {
                    setSearchInput("");
                    setSelectedCategory("All Categories");
                    setSelectedDuration("All Durations");
                    setSelectedLocation("All Locations");
                    setSelectedMode("All Training Modes");
                  }}
                  className="mt-3 px-4 py-2 bg-[#0b1f3a] text-white text-xs font-bold rounded-lg hover:bg-blue-900 transition-colors cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div
                ref={scrollContainerRef}
                className="flex gap-4 overflow-x-auto scrollbar-hide py-1 pb-3 snap-x snap-mandatory scroll-smooth"
              >
                {filteredCourses.map((course, idx) => {
                  const meta = getCourseMeta(course);
                  const imgSrc = course.thumbnail_url || course.image_url || getCourseImage(course.category || "Welding", idx);
                  let badgeBg = "bg-[#15803d]";
                  if (meta.badge === "FEW SEATS") badgeBg = "bg-[#ea580c]";
                  if (meta.badge === "UPCOMING BATCH") badgeBg = "bg-[#2563eb]";

                  return (
                    <div
                      key={course.id || course.slug || idx}
                      className="w-[260px] sm:w-[280px] shrink-0 snap-start bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col group hover:shadow-[0_8px_25px_rgb(0,0,0,0.08)] hover:border-slate-300 transition-all duration-300"
                    >
                      {/* Image & Badge */}
                      <div className="relative h-36 overflow-hidden bg-slate-100">
                        <img
                          src={imgSrc}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div
                          className={`absolute top-2.5 left-2.5 px-2.5 py-1 ${badgeBg} text-white font-extrabold text-[9px] uppercase tracking-wider rounded-sm shadow-md`}
                        >
                          {meta.badge}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 flex flex-col flex-1 justify-between">
                        <div>
                          <h3 className="font-bold text-[#0b1f3a] text-sm leading-tight mb-2.5 group-hover:text-[#f97316] transition-colors line-clamp-2 min-h-[36px]">
                            {course.title}
                          </h3>
                          <div className="space-y-1.5 mb-3 text-xs font-medium text-slate-600">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 text-[#0b1f3a] shrink-0" />
                              <span>{course.duration || "30 Days"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 text-[#0b1f3a] shrink-0" />
                              <span>{meta.time}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3.5 h-3.5 text-[#0b1f3a] shrink-0" />
                              <span>Chennai</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          {/* Price / Fee */}
                          <div className="text-sm font-black text-[#ea580c] mb-3">
                            {meta.fee}
                          </div>

                          {/* Action Buttons */}
                          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                            <Link
                              href={`/courses/${course.slug || course.id || ""}`}
                              className="bg-white border border-[#0b1f3a] hover:bg-[#0b1f3a] hover:text-white text-[#0b1f3a] text-center text-[10px] uppercase tracking-wide font-black py-2 rounded-lg transition-colors flex items-center justify-center"
                            >
                              VIEW DETAILS
                            </Link>
                            <button
                              onClick={() => handleOpenEnquiry(course.title)}
                              className="bg-[#f97316] hover:bg-[#ea580c] text-white text-center text-[10px] uppercase tracking-wide font-black py-2 rounded-lg transition-colors shadow-sm cursor-pointer"
                            >
                              ENQUIRE NOW
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Find Your Course Sidebar */}
          <div className="w-full xl:w-[320px] shrink-0 bg-[#f4f7fb] rounded-2xl border border-slate-200 p-6 md:p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col">
            <h3 className="text-lg font-black text-[#0b1f3a] mb-5 flex items-center gap-2 tracking-tight">
              <Search className="w-5 h-5 text-[#0b1f3a]" />
              Find Your Course
            </h3>
            
            <div className="space-y-3 flex-1">
              <input 
                type="text" 
                placeholder="Search course, trade or keyword..." 
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none focus:border-[#0b1f3a] transition-colors placeholder:text-slate-400 shadow-sm"
              />
              
              <div className="relative">
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full appearance-none px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none focus:border-[#0b1f3a] cursor-pointer shadow-sm">
                  <option value="All Categories">All Categories</option>
                  {CATEGORIES_DATA.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              
              <div className="relative">
                <select value={selectedDuration} onChange={(e) => setSelectedDuration(e.target.value)} className="w-full appearance-none px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none focus:border-[#0b1f3a] cursor-pointer shadow-sm">
                  <option value="All Durations">All Durations</option>
                  <option value="15 Days">15 Days</option>
                  <option value="30 Days">30 Days</option>
                  <option value="45 Days">45 Days</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <div className="relative">
                <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)} className="w-full appearance-none px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none focus:border-[#0b1f3a] cursor-pointer shadow-sm">
                  <option value="All Locations">All Locations</option>
                  <option value="Chennai">Chennai</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <div className="relative">
                <select value={selectedMode} onChange={(e) => setSelectedMode(e.target.value)} className="w-full appearance-none px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none focus:border-[#0b1f3a] cursor-pointer shadow-sm">
                  <option value="All Training Modes">All Training Modes</option>
                  <option value="Classroom">Classroom</option>
                  <option value="Practical Lab">Practical Lab</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <button 
              onClick={() => {
                const el = document.getElementById("next-batches-section");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }} 
              className="w-full mt-5 bg-[#0b1f3a] hover:bg-[#152e52] text-white font-black text-xs py-3.5 rounded-xl uppercase tracking-wider shadow-md transition-colors cursor-pointer"
            >
              SEARCH COURSES
            </button>
          </div>
        </div>
      </div>



      <div id="calendar-section" className="mx-auto max-w-[1440px] px-4 md:px-8 lg:px-12 py-8 mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ── Left: Course Calendar Card ── */}
          <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-[0_10px_35px_rgb(0,0,0,0.04)] flex flex-col justify-between">
            {/* Header: Title & View switch */}
            <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-6 h-6 text-[#0b1f3a]" />
                <h2 className="text-xl sm:text-2xl font-black text-[#0b1f3a] tracking-tight">
                  Course Calendar
                </h2>
              </div>
              
              {/* Toggle Pills */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setCalendarViewMode("calendar")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    calendarViewMode === "calendar"
                      ? "bg-[#0b1f3a] text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Calendar View
                </button>
                <button
                  type="button"
                  onClick={() => setCalendarViewMode("list")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    calendarViewMode === "list"
                      ? "bg-[#0b1f3a] text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  List View
                </button>
              </div>
            </div>

            {/* Calendar View Content */}
            {calendarViewMode === "calendar" ? (
              <div>
                {/* Month Navigator Header */}
                <div className="flex items-center justify-center gap-6 mb-6">
                  <button
                    type="button"
                    onClick={() => setMonthIdx((i) => Math.max(0, i - 1))}
                    disabled={monthIdx === 0}
                    className="p-1.5 rounded-full hover:bg-slate-100 text-slate-700 disabled:opacity-30 transition-colors cursor-pointer"
                    aria-label="Previous Month"
                  >
                    <ChevronLeft className="w-5 h-5 text-slate-700" />
                  </button>
                  <span className="text-lg sm:text-xl font-black text-[#0b1f3a] tracking-tight min-w-[150px] text-center">
                    {month} {year}
                  </span>
                  <button
                    type="button"
                    onClick={() => setMonthIdx((i) => Math.min(MONTHS_FY.length - 1, i + 1))}
                    disabled={monthIdx === MONTHS_FY.length - 1}
                    className="p-1.5 rounded-full hover:bg-slate-100 text-slate-700 disabled:opacity-30 transition-colors cursor-pointer"
                    aria-label="Next Month"
                  >
                    <ChevronRight className="w-5 h-5 text-slate-700" />
                  </button>
                </div>

                {/* Days of Week Header */}
                <div className="grid grid-cols-7 mb-3 text-center">
                  {WEEK_DAYS.map((d) => (
                    <div key={d} className="text-xs sm:text-sm font-extrabold text-[#0b1f3a]/80 py-1">
                      {d}
                    </div>
                  ))}
                </div>

                {/* Calendar Days Matrix */}
                <div className="grid grid-cols-7 gap-1 sm:gap-1.5 border-b border-slate-100 pb-6">
                  {/* Previous month trailing days */}
                  {Array.from({ length: startDay }).map((_, i) => {
                    const prevDay = prevMonthTotalDays - startDay + 1 + i;
                    return (
                      <div
                        key={`prev-${i}`}
                        className="h-14 sm:h-16 flex items-center justify-center text-slate-300 font-semibold text-sm sm:text-base select-none"
                      >
                        {prevDay}
                      </div>
                    );
                  })}

                  {/* Active Month Days */}
                  {Array.from({ length: totalDays }).map((_, i) => {
                    const day = i + 1;
                    const batchesOnDay = dayBatchesMap[day] || [];
                    const hasBatches = batchesOnDay.length > 0;
                    const isSelected = selectedDay === day;

                    return (
                      <button
                        key={`curr-${day}`}
                        type="button"
                        onClick={() => setSelectedDay(isSelected ? null : day)}
                        className={`h-14 sm:h-16 rounded-xl flex flex-col items-center justify-center transition-all relative select-none ${
                          isSelected
                            ? "bg-blue-50 border-2 border-[#1e40af] shadow-xs"
                            : hasBatches
                            ? "hover:bg-blue-50/70 border border-blue-100/70 cursor-pointer"
                            : "hover:bg-slate-50 cursor-default"
                        }`}
                      >
                        <span
                          className={`text-sm sm:text-base ${
                            hasBatches
                              ? "font-black text-[#1e40af]"
                              : isSelected
                              ? "font-black text-[#1e40af]"
                              : "font-semibold text-slate-700"
                          }`}
                        >
                          {day}
                        </span>

                        {hasBatches && (
                          <span className="text-[10px] sm:text-[11px] font-black text-[#1e40af] leading-none mt-0.5 tracking-tight">
                            {batchesOnDay.length} {batchesOnDay.length === 1 ? "Course" : "Courses"}
                          </span>
                        )}
                      </button>
                    );
                  })}

                  {/* Next month leading days */}
                  {Array.from({ length: trailingCount }).map((_, i) => (
                    <div
                      key={`next-${i}`}
                      className="h-14 sm:h-16 flex items-center justify-center text-slate-300 font-semibold text-sm sm:text-base select-none"
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>

                {/* Calendar Bottom Legend */}
                <div className="pt-5 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-bold text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
                    <span>Batch 1</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#f97316]" />
                    <span>Batch 2</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" />
                    <span>Upcoming</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
                    <span>Few Seats</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
                    <span>Batch Full</span>
                  </div>
                </div>
              </div>
            ) : (
              /* List View Mode on Left */
              <div className="space-y-3 py-2">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-slate-600">All Scheduled Batches in {month} {year}</span>
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
                    {currentMonthBatches.length} Sessions
                  </span>
                </div>
                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {currentMonthBatches.map((b) => (
                    <div
                      key={b.id}
                      onClick={() => setSelectedDay(selectedDay === b.dayNumber ? null : b.dayNumber)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        selectedDay === b.dayNumber
                          ? "bg-blue-50 border-blue-400 shadow-sm"
                          : "bg-slate-50/70 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <div>
                        <h4 className="font-bold text-[#0b1f3a] text-sm">{b.courseName}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{b.startDate} · {b.timing} · {b.location}</p>
                      </div>
                      <span className="text-xs font-black text-blue-700 bg-white border border-blue-200 px-2.5 py-1 rounded-lg">
                        Day {b.dayNumber}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Upcoming Batches (List View) ── */}
          <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-[0_10px_35px_rgb(0,0,0,0.04)] flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-6 h-6 text-[#0b1f3a]" />
                  <h2 className="text-xl sm:text-2xl font-black text-[#0b1f3a] tracking-tight">
                    Upcoming Batches (List View)
                  </h2>
                </div>
                {selectedDay !== null && (
                  <button
                    onClick={() => setSelectedDay(null)}
                    className="text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    Showing Day {selectedDay} (Clear)
                  </button>
                )}
              </div>

              {/* Table Container */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider">
                      <th className="py-3 px-2">Course Name</th>
                      <th className="py-3 px-2">Start Date</th>
                      <th className="py-3 px-2">Duration</th>
                      <th className="py-3 px-2">Timing</th>
                      <th className="py-3 px-2">Location</th>
                      <th className="py-3 px-2 text-center">Seats</th>
                      <th className="py-3 px-2 text-center">Status</th>
                      <th className="py-3 px-2 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                    {displayedBatches.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-10 text-slate-400 font-medium">
                          No batches found for the selected criteria.
                        </td>
                      </tr>
                    ) : (
                      displayedBatches.map((b) => {
                        let statusBadge = (
                          <span className="bg-[#e6f7ed] text-[#16a34a] border border-[#bbf7d0] px-2.5 py-1 rounded-md text-[11px] font-extrabold whitespace-nowrap">
                            Open
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
                        } else if (b.status === "Batch Full") {
                          statusBadge = (
                            <span className="bg-[#fef2f2] text-[#dc2626] border border-[#fee2e2] px-2.5 py-1 rounded-md text-[11px] font-extrabold whitespace-nowrap">
                              Batch Full
                            </span>
                          );
                        }

                        return (
                          <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3.5 px-2 font-bold text-[#0b1f3a] max-w-[140px] truncate" title={b.courseName}>
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
                            <td className="py-3.5 px-2 text-slate-600">
                              {b.location}
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
                                className="border border-[#0b1f3a] hover:bg-[#0b1f3a] hover:text-white text-[#0b1f3a] font-bold text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                              >
                                Enquire
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom: VIEW ALL UPCOMING BATCHES button */}
            <div className="pt-6 border-t border-slate-100 mt-2">
              <button
                type="button"
                onClick={() => setShowAllBatches(!showAllBatches)}
                className="w-full max-w-sm mx-auto block py-2.5 px-6 border-2 border-[#1e40af] text-[#1e40af] hover:bg-[#1e40af] hover:text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all text-center cursor-pointer shadow-xs"
              >
                {showAllBatches ? "SHOW FEWER BATCHES" : "VIEW ALL UPCOMING BATCHES"}
              </button>
            </div>
          </div>

        </div>

        {/* ─── Bottom Section Row 1: Categories, How to Join, Download ─────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch mt-10 mb-8">
          
          {/* Card 1: Popular Course Categories */}
          <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-black text-[#0b1f3a] tracking-tight mb-5">
                Popular Course Categories
              </h3>
              
              <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                <Link href="/courses?category=Welding" className="flex items-center gap-2 group cursor-pointer">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1e40af] flex items-center justify-center group-hover:bg-[#1e40af] group-hover:text-white transition-colors shrink-0">
                    <Flame className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 group-hover:text-[#1e40af] transition-colors leading-tight">
                    Welding Courses
                  </span>
                </Link>

                <Link href="/courses?category=Electrical" className="flex items-center gap-2 group cursor-pointer">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1e40af] flex items-center justify-center group-hover:bg-[#1e40af] group-hover:text-white transition-colors shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 group-hover:text-[#1e40af] transition-colors leading-tight">
                    Electrical Courses
                  </span>
                </Link>

                <Link href="/courses?category=Electrical" className="flex items-center gap-2 group cursor-pointer">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1e40af] flex items-center justify-center group-hover:bg-[#1e40af] group-hover:text-white transition-colors shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 group-hover:text-[#1e40af] transition-colors leading-tight">
                    Electrical Courses
                  </span>
                </Link>

                <Link href="/courses?category=HVAC" className="flex items-center gap-2 group cursor-pointer">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1e40af] flex items-center justify-center group-hover:bg-[#1e40af] group-hover:text-white transition-colors shrink-0">
                    <Wind className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 group-hover:text-[#1e40af] transition-colors leading-tight">
                    HVAC Courses
                  </span>
                </Link>

                <Link href="/courses?category=Plumbing" className="flex items-center gap-2 group cursor-pointer">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1e40af] flex items-center justify-center group-hover:bg-[#1e40af] group-hover:text-white transition-colors shrink-0">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 group-hover:text-[#1e40af] transition-colors leading-tight">
                    Plumbing Courses
                  </span>
                </Link>

                <Link href="/courses?category=Safety" className="flex items-center gap-2 group cursor-pointer">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1e40af] flex items-center justify-center group-hover:bg-[#1e40af] group-hover:text-white transition-colors shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 group-hover:text-[#1e40af] transition-colors leading-tight">
                    Safety Courses
                  </span>
                </Link>
              </div>
            </div>

            <div className="mt-6 pt-2">
              <Link
                href="/courses"
                className="w-full block text-center py-2.5 bg-[#0b1f3a] hover:bg-[#152e52] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-colors shadow-sm"
              >
                VIEW ALL COURSES
              </Link>
            </div>
          </div>

          {/* Card 2: How to Join N-Skill */}
          <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between">
            <h3 className="text-lg font-black text-[#0b1f3a] tracking-tight text-center mb-6">
              How to Join N-Skill
            </h3>

            <div className="grid grid-cols-5 gap-2 items-start relative my-auto">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center relative group">
                <div className="w-12 h-12 rounded-full border-2 border-slate-200 bg-white shadow-sm flex items-center justify-center text-slate-700 mb-2 group-hover:border-[#0b1f3a] transition-all">
                  <FileText className="w-5 h-5 text-[#0b1f3a]" />
                </div>
                <span className="text-[11px] font-black text-[#0b1f3a] uppercase tracking-wider mb-0.5">01</span>
                <h4 className="text-xs font-black text-[#0b1f3a] leading-tight mb-1">Select Course</h4>
                <p className="text-[10px] font-semibold text-slate-500 leading-tight">Choose your preferred program</p>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center relative group">
                <div className="w-12 h-12 rounded-full border-2 border-slate-200 bg-white shadow-sm flex items-center justify-center text-slate-700 mb-2 group-hover:border-[#0b1f3a] transition-all">
                  <Calendar className="w-5 h-5 text-[#0b1f3a]" />
                </div>
                <span className="text-[11px] font-black text-[#0b1f3a] uppercase tracking-wider mb-0.5">02</span>
                <h4 className="text-xs font-black text-[#0b1f3a] leading-tight mb-1">Check Batch</h4>
                <p className="text-[10px] font-semibold text-slate-500 leading-tight">Select the upcoming batch</p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center relative group">
                <div className="w-12 h-12 rounded-full border-2 border-slate-200 bg-white shadow-sm flex items-center justify-center text-slate-700 mb-2 group-hover:border-[#0b1f3a] transition-all">
                  <PhoneCall className="w-5 h-5 text-[#0b1f3a]" />
                </div>
                <span className="text-[11px] font-black text-[#0b1f3a] uppercase tracking-wider mb-0.5">03</span>
                <h4 className="text-xs font-black text-[#0b1f3a] leading-tight mb-1">Counselling</h4>
                <p className="text-[10px] font-semibold text-slate-500 leading-tight">Talk to our course counsellor</p>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col items-center text-center relative group">
                <div className="w-12 h-12 rounded-full border-2 border-slate-200 bg-white shadow-sm flex items-center justify-center text-slate-700 mb-2 group-hover:border-[#0b1f3a] transition-all">
                  <UserCheck className="w-5 h-5 text-[#0b1f3a]" />
                </div>
                <span className="text-[11px] font-black text-[#0b1f3a] uppercase tracking-wider mb-0.5">04</span>
                <h4 className="text-xs font-black text-[#0b1f3a] leading-tight mb-1">Registration</h4>
                <p className="text-[10px] font-semibold text-slate-500 leading-tight">Complete your admission process</p>
              </div>

              {/* Step 5 */}
              <div className="flex flex-col items-center text-center relative group">
                <div className="w-12 h-12 rounded-full border-2 border-[#f97316] bg-orange-50 shadow-sm flex items-center justify-center text-[#f97316] mb-2 group-hover:scale-105 transition-all">
                  <GraduationCap className="w-5 h-5 text-[#f97316]" />
                </div>
                <span className="text-[11px] font-black text-[#f97316] uppercase tracking-wider mb-0.5">05</span>
                <h4 className="text-xs font-black text-[#0b1f3a] leading-tight mb-1">Start Training</h4>
                <p className="text-[10px] font-semibold text-slate-500 leading-tight">Begin your learning journey</p>
              </div>
            </div>
          </div>

          {/* Card 3: Download 2026-27 Course Calendar */}
          <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-black text-[#0b1f3a] tracking-tight leading-tight mb-2">
                Download 2026–27<br />Course Calendar?
              </h3>
              <p className="text-xs font-medium text-slate-500 leading-relaxed mb-4">
                Get the complete schedule of all upcoming batches, course details, duration and more.
              </p>
            </div>

            <form onSubmit={handleCalendarDownload} className="space-y-3">
              <input
                type="tel"
                placeholder="Enter your mobile number"
                value={downloadPhone}
                onChange={(e) => setDownloadPhone(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 placeholder-slate-400 outline-none focus:border-[#0b1f3a] shadow-xs"
              />
              <button
                type="submit"
                className="w-full py-3 bg-[#f97316] hover:bg-[#ea580c] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>DOWNLOAD NOW</span>
                <Download className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* ─── Bottom Section Row 2: Reviews + Need Help ─────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left: What Our Students Say */}
          <div className="lg:col-span-8 xl:col-span-9 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-black text-[#0b1f3a] tracking-tight">
                What Our Students Say
              </h3>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrevTestimonial}
                  className="w-8 h-8 rounded-full border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
                  aria-label="Previous testimonials"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextTestimonial}
                  className="w-8 h-8 rounded-full border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
                  aria-label="Next testimonials"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {visibleTestimonials.map((t, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-50/70 border border-slate-100 flex flex-col justify-between hover:bg-slate-50 hover:shadow-sm transition-all"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={t.image}
                        alt={t.name}
                        className="w-11 h-11 rounded-full object-cover border border-slate-200 shadow-xs"
                      />
                      <div>
                        <h4 className="font-bold text-sm text-[#0b1f3a] leading-tight">{t.name}</h4>
                        <p className="text-xs font-semibold text-slate-500">{t.role}</p>
                      </div>
                    </div>
                    <p className="text-xs font-medium text-slate-600 leading-relaxed italic mb-4">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-[#f59e0b]">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#f59e0b]" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Need Help Choosing The Right Course */}
          <div className="lg:col-span-4 xl:col-span-3 bg-[#031b34] rounded-3xl p-6 sm:p-7 text-white shadow-[0_10px_35px_rgb(0,0,0,0.15)] flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-black text-white leading-tight mb-2">
                Need Help Choosing<br />The Right Course?
              </h3>
              <p className="text-xs font-medium text-slate-300 leading-relaxed mb-6">
                Our experts are here to guide you.
              </p>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setShowEnquiryModal(true)}
                className="w-full py-3 bg-[#f97316] hover:bg-[#ea580c] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <PhoneCall className="w-4 h-4" />
                <span>TALK TO COUNSELLOR</span>
              </button>
              
              <a
                href="https://wa.me/919940000000?text=Hi%20N-Skill,%20I%20need%20help%20choosing%20the%20right%20course."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-transparent hover:bg-white/10 text-white border border-white/30 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>CHAT ON WHATSAPP</span>
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}


