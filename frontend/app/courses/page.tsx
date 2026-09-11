"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Calendar,
  MapPin,
  Award,
  ArrowRight,
  GraduationCap,
  Loader2,
  AlertCircle,
  Search,
  MessageCircle,
  Wrench,
  BookOpen,
  Users,
  Briefcase,
  LayoutGrid,
  List,
  ChevronDown,
  X,
  Star,
  ChevronLeft,
  ChevronRight,
  Phone,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import EnquiryModal from "../components/EnquiryModal";

// ─── Custom Icons for Hero Features ───────────────────────────────────────────
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

// ─── Why Choose N-Skill Custom Outline Icons ──────────────────────────────────
function WhyExpertFacultyIcon({ className = "w-8 h-8 text-[#0b1f3a]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="11" r="4.5" />
      <path d="M5 26v-2.5a6.5 6.5 0 0 1 13 0V26" />
      <path d="M18 6h9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-9" />
      <line x1="21" y1="10" x2="26" y2="10" />
      <line x1="21" y1="14" x2="24" y2="14" />
      <line x1="25" y1="20" x2="25" y2="25" />
    </svg>
  );
}

function WhyPracticalTrainingIcon({ className = "w-8 h-8 text-[#0b1f3a]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="10" cy="10" r="3.5" />
      <path d="M4 25v-2a5 5 0 0 1 10 0v2" />
      <circle cx="21" cy="12" r="3" />
      <path d="M16 25v-1.5a4.5 4.5 0 0 1 8 0V25" />
      <path d="M19 19l3-3m0 0l2 2m-2-2l-1-1" strokeWidth="2" />
    </svg>
  );
}

function WhyCertificationIcon({ className = "w-8 h-8 text-[#0b1f3a]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 3l10 4v8c0 7-10 13-10 13S6 22 6 15V7l10-4z" />
      <circle cx="16" cy="14" r="4" />
      <path d="M13.5 14l2 2 3.5-3.5" strokeWidth="2" />
    </svg>
  );
}

function WhyPlacementSupportIcon({ className = "w-8 h-8 text-[#0b1f3a]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="4" y="8" width="12" height="18" rx="1.5" />
      <line x1="8" y1="12" x2="8" y2="14" strokeWidth="2" />
      <line x1="12" y1="12" x2="12" y2="14" strokeWidth="2" />
      <line x1="8" y1="18" x2="8" y2="20" strokeWidth="2" />
      <line x1="12" y1="18" x2="12" y2="20" strokeWidth="2" />
      <path d="M23 18a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
      <path d="M23 15v3m0 8v3m-6-7h3m8 0h3" strokeWidth="1.8" />
    </svg>
  );
}

function WhatsAppIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

// ─── Testimonials Data ────────────────────────────────────────────────────────
const STUDENT_TESTIMONIALS = [
  {
    id: 1,
    name: "Karthik R.",
    course: "HVAC Engineer",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    quote: "“N-Skill gave me the right skills and confidence. The practical training was excellent.”",
    rating: 5,
  },
  {
    id: 2,
    name: "Suresh M.",
    course: "6G Welding",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    quote: "“Best training institute for welding. Good facilities and experienced trainers.”",
    rating: 5,
  },
  {
    id: 3,
    name: "Imran A.",
    course: "Industrial Electrician",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    quote: "“The course content and practical sessions were very helpful for my career.”",
    rating: 5,
  },
  {
    id: 4,
    name: "Rajesh K.",
    course: "Fire & Safety",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
    quote: "“State-of-the-art training labs and 100% placement support helped me get hired right away.”",
    rating: 5,
  },
  {
    id: 5,
    name: "Anitha P.",
    course: "CCTV & Security Systems",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    quote: "“The hands-on practice gave me real industry confidence. Highly recommended!”",
    rating: 5,
  },
  {
    id: 6,
    name: "Vignesh S.",
    course: "CNC Programming",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    quote: "“Experienced trainers who explain every concept with practical workshop demonstrations.”",
    rating: 5,
  },
];
// ─── 9 Category SVG Line Icons ────────────────────────────────────────────────

function WeldingIcon({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M15 20a9 9 0 0 1 18 0v11a4 4 0 0 1-4 4H19a4 4 0 0 1-4-4V20z" />
      <rect x="20" y="18" width="8" height="6" rx="1" fill="currentColor" fillOpacity="0.12" />
      <path d="M20 18h8v6h-8z" />
      <path d="M24 11V7" />
      <path d="M14 36c2.5 3.5 6 5 10 5s7.5-1.5 10-5" />
      <path d="M37 13l3-3m0 0l-1 4m1-4l-4 1" stroke="#f97316" strokeWidth="2.2" />
      <path d="M41 21l4-1m-4 1l2 3" stroke="#f97316" strokeWidth="2.2" />
      <path d="M10 15l-3-2m3 2l-1 3" stroke="#f97316" strokeWidth="2.2" />
    </svg>
  );
}

function HvacIcon({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="7" y="11" width="34" height="17" rx="3" />
      <line x1="11" y1="21" x2="37" y2="21" />
      <circle cx="36" cy="16" r="1.5" fill="currentColor" />
      <circle cx="31" cy="16" r="1" fill="currentColor" />
      <path d="M13 34c2.5 2.5 5 3.5 8 1.5s5.5 1.5 8 1.5" />
      <path d="M17 40c2 1.8 4 2.5 7 1s4 1 7 1" />
      <path d="M22 28v3" />
      <path d="M16 28v2" />
      <path d="M28 28v2" />
    </svg>
  );
}

function ElectricalIcon({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M27 6L13 26h13l-5 16 18-22H27l4-14z" />
    </svg>
  );
}

function PlumbingIcon({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 21h12a6 6 0 0 1 6 6v4h-6v-4a2 2 0 0 0-2-2H12v-4z" />
      <rect x="6" y="19" width="6" height="8" rx="1" />
      <path d="M16 15v-4h4v4" />
      <path d="M13 11h10" />
      <path d="M24 31h6v2h-6z" />
      <path d="M27 37c0 2-1.5 4-3 4s-3-2-3-4c0-2 3-5 3-5s3 3 3 5z" fill="currentColor" fillOpacity="0.15" />
    </svg>
  );
}

function MepIcon({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M8 40V12a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v28" />
      <line x1="13" y1="16" x2="16" y2="16" />
      <line x1="19" y1="16" x2="22" y2="16" />
      <line x1="13" y1="22" x2="16" y2="22" />
      <line x1="19" y1="22" x2="22" y2="22" />
      <line x1="13" y1="28" x2="16" y2="28" />
      <line x1="19" y1="28" x2="22" y2="28" />
      <line x1="6" y1="40" x2="42" y2="40" />
      <circle cx="34" cy="27" r="4.5" />
      <path d="M34 20v2m0 10v2m-7-7h2m10 0h2m-6.5-4.5l1.4 1.4m7.1 7.1l1.4 1.4m-9.9 0l1.4-1.4m7.1-7.1l1.4-1.4" />
    </svg>
  );
}

function QualityIcon({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M24 6l14 5v12c0 10-6.5 16-14 19-7.5-3-14-9-14-19V11l14-5z" />
      <path d="M18 24l4 4 8-8" strokeWidth="2.5" />
    </svg>
  );
}

function SafetyIcon({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M13 27a11 11 0 0 1 22 0H13z" />
      <path d="M9 27h30a2 2 0 0 1 2 2v2H7v-2a2 2 0 0 1 2-2z" />
      <path d="M22 16v11h4V16" />
      <circle cx="24" cy="38" r="3" />
      <path d="M24 33v2m0 6v2m-5-5h2m6 0h2" />
    </svg>
  );
}

function HomeApplianceIcon({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="11" y="7" width="26" height="34" rx="4" />
      <line x1="11" y1="15" x2="37" y2="15" />
      <circle cx="16" cy="11" r="1.5" fill="currentColor" />
      <circle cx="21" cy="11" r="1" fill="currentColor" />
      <rect x="29" y="10" width="4" height="2" rx="0.5" />
      <circle cx="24" cy="27" r="7" />
      <circle cx="24" cy="27" r="4.5" strokeDasharray="3 3" />
    </svg>
  );
}

function OilGasIcon({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M24 6l-9 32h18L24 6z" />
      <line x1="18" y1="17" x2="30" y2="17" />
      <line x1="16" y1="26" x2="32" y2="26" />
      <line x1="18" y1="17" x2="32" y2="26" />
      <line x1="30" y1="17" x2="16" y2="26" />
      <line x1="14" y1="38" x2="6" y2="42" />
      <line x1="34" y1="38" x2="42" y2="42" />
      <line x1="6" y1="42" x2="42" y2="42" />
      <circle cx="38" cy="19" r="2" fill="currentColor" />
      <path d="M38 15c0 1.5-1.5 3-2 3s-2-1.5-2-3c0-1.5 2-4 2-4s2 2.5 2 4z" fill="#f97316" stroke="#f97316" />
    </svg>
  );
}

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

const CATEGORIES_DATA = [
  { name: "Welding", Icon: WeldingIcon },
  { name: "HVAC & Refrigeration", Icon: HvacIcon },
  { name: "Electrical", Icon: ElectricalIcon },
  { name: "Plumbing", Icon: PlumbingIcon },
  { name: "MEP", Icon: MepIcon },
  { name: "Quality", Icon: QualityIcon },
  { name: "Safety", Icon: SafetyIcon },
  { name: "Home Appliance", Icon: HomeApplianceIcon },
  { name: "Oil & Gas", Icon: OilGasIcon },
];

function normalizeCategory(cat: string = "") {
  return cat.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function getCourseImage(category: string, index: number): string {
  const pool = CATEGORY_IMAGES[category] ?? FALLBACK_IMAGES;
  return pool[index % pool.length];
}

function getDescription(content: string): string {
  if (!content) return "";
  return content
    .split("\n")
    .filter((l) => l.trim().startsWith("-"))
    .map((l) => l.replace(/^-\s*/, "").trim())
    .slice(0, 3)
    .join(" · ");
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

// ─── Popular Course Card (Top 6 Cards) ────────────────────────────────────────
function PopularCourseCard({
  course,
  index,
  onEnquire,
}: {
  course: any;
  index: number;
  onEnquire: (courseTitle: string) => void;
}) {
  const meta = getCourseMeta(course);
  const imgSrc = course.thumbnail_url || getCourseImage(course.category || "Welding", index);

  let badgeBg = "bg-[#15803d]";
  if (meta.badge === "FEW SEATS") badgeBg = "bg-[#ea580c]";
  if (meta.badge === "UPCOMING BATCH") badgeBg = "bg-[#2563eb]";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300 group">
      {/* Top Image with Status Badge */}
      <div className="relative h-36 sm:h-40 overflow-hidden bg-slate-100">
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
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between">
        <div>
          <h3 className="text-sm font-bold text-[#0b1f3a] line-clamp-2 min-h-[38px] leading-tight mb-2.5">
            {course.title}
          </h3>

          {/* Metadata items */}
          <div className="space-y-1 text-xs text-slate-600 font-medium mb-3">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#0b1f3a] shrink-0" />
              <span>{course.duration || "30 Days"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#0b1f3a] shrink-0" />
              <span>{meta.time}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#0b1f3a] shrink-0" />
              <span>Chennai</span>
            </div>
          </div>
        </div>

        <div>
          {/* Price */}
          <div className="text-sm font-extrabold text-[#ea580c] mb-2.5">
            {meta.fee}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-100">
            <Link
              href={`/courses/${course.slug || course.id}`}
              className="border border-[#0b1f3a] text-[#0b1f3a] hover:bg-[#0b1f3a] hover:text-white text-[10px] sm:text-[11px] font-bold py-2 rounded-lg text-center transition-colors uppercase tracking-tight flex items-center justify-center"
            >
              VIEW DETAILS
            </Link>
            <button
              onClick={() => onEnquire(course.title)}
              className="bg-[#f97316] hover:bg-[#ea580c] text-white text-[10px] sm:text-[11px] font-bold py-2 rounded-lg text-center transition-colors uppercase tracking-tight cursor-pointer"
            >
              ENQUIRE NOW
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── All Courses Grid Card (Horizontal Split) ─────────────────────────────────
function AllCoursesGridCard({
  course,
  index,
}: {
  course: any;
  index: number;
}) {
  const meta = getCourseMeta(course);
  const imgSrc = course.thumbnail_url || getCourseImage(course.category || "Welding", index);

  return (
    <Link
      href={`/courses/${course.slug || course.id}`}
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-[#0b1f3a] transition-all duration-300 flex p-3 gap-3.5 group"
    >
      {/* Left Image */}
      <div className="w-24 sm:w-28 md:w-32 h-24 sm:h-28 md:h-32 shrink-0 rounded-xl overflow-hidden bg-slate-100 relative">
        <img
          src={imgSrc}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </div>

      {/* Right Details */}
      <div className="flex flex-col justify-between flex-1 min-w-0 py-0.5">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-[#0b1f3a] line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors mb-1.5">
            {course.title}
          </h3>
          <div className="space-y-1 text-xs text-slate-600 font-medium">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#0b1f3a] shrink-0" />
              <span>{course.duration || "30 Days"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#0b1f3a] shrink-0" />
              <span>Chennai</span>
            </div>
          </div>
        </div>

        <div>
          <div className="text-xs sm:text-sm font-bold text-[#ea580c] mb-1.5">
            {meta.fee}
          </div>
          <div>
            <span
              className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-md ${
                meta.badge === "UPCOMING BATCH"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {meta.badge === "UPCOMING BATCH" ? "Upcoming Batch" : "Admissions Open"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── All Courses List Card ───────────────────────────────────────────────────
function AllCoursesListCard({
  course,
  index,
  onEnquire,
}: {
  course: any;
  index: number;
  onEnquire: (courseTitle: string) => void;
}) {
  const meta = getCourseMeta(course);
  const imgSrc = course.thumbnail_url || getCourseImage(course.category || "Welding", index);
  const desc = getDescription(course.content ?? "");

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 p-4 flex flex-col sm:flex-row gap-5 items-center group">
      <div className="w-full sm:w-44 h-36 rounded-xl overflow-hidden bg-slate-100 shrink-0 relative">
        <img
          src={imgSrc}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-2 left-2 px-2 py-0.5 bg-blue-600 text-white font-bold text-[9px] uppercase rounded">
          {course.category}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {course.eligibility || "Open to All"}
          </span>
          <span className="text-slate-300">•</span>
          <span
            className={`text-[11px] font-bold px-2 py-0.5 rounded ${
              meta.badge === "UPCOMING BATCH"
                ? "bg-blue-50 text-blue-700"
                : "bg-green-50 text-green-700"
            }`}
          >
            {meta.badge}
          </span>
        </div>
        <h3 className="text-base sm:text-lg font-bold text-[#0b1f3a] mb-1.5 group-hover:text-blue-600 transition-colors">
          {course.title}
        </h3>
        <p className="text-xs text-slate-500 line-clamp-2 mb-3">
          {desc || (course.content ?? "").substring(0, 140).replace(/[#\-]/g, "").trim()}
        </p>
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-700 font-semibold">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-[#0b1f3a]" /> {course.duration || "30 Days"}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#0b1f3a]" /> {meta.time}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#0b1f3a]" /> Chennai
          </span>
        </div>
      </div>

      <div className="w-full sm:w-44 sm:border-l sm:border-slate-100 sm:pl-5 flex flex-col justify-center items-start sm:items-end gap-2 shrink-0">
        <div className="text-base font-extrabold text-[#ea580c]">{meta.fee}</div>
        <Link
          href={`/courses/${course.slug || course.id}`}
          className="w-full text-center px-4 py-2 border border-[#0b1f3a] text-[#0b1f3a] hover:bg-[#0b1f3a] hover:text-white rounded-xl text-xs font-bold transition-colors"
        >
          VIEW DETAILS
        </Link>
        <button
          onClick={() => onEnquire(course.title)}
          className="w-full text-center px-4 py-2 bg-[#f97316] hover:bg-[#ea580c] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
        >
          ENQUIRE NOW
        </button>
      </div>
    </div>
  );
}

// ─── Why Choose N-Skill & Upcoming Batches Component ──────────────────────────
function WhyChooseAndBatchesSection({
  onOpenEnquiry,
}: {
  onOpenEnquiry: (courseTitle?: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-8 mt-12">
      {/* Left: Why Choose N-Skill */}
      <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
        <h2 className="text-base sm:text-lg font-black text-[#0b1f3a] uppercase tracking-wider mb-4 sm:mb-5">
          WHY CHOOSE N-SKILL?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-3">
          <div className="flex items-start gap-3">
            <div className="shrink-0 text-[#0b1f3a]">
              <WhyExpertFacultyIcon className="w-8 h-8 sm:w-9 sm:h-9" />
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-[#0b1f3a] leading-tight">Expert Faculty</h3>
              <p className="text-[11px] sm:text-xs text-slate-500 leading-snug mt-0.5">Learn from experienced industry professionals.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="shrink-0 text-[#0b1f3a]">
              <WhyPracticalTrainingIcon className="w-8 h-8 sm:w-9 sm:h-9" />
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-[#0b1f3a] leading-tight">Practical Training</h3>
              <p className="text-[11px] sm:text-xs text-slate-500 leading-snug mt-0.5">Hands-on practicals in modern workshops.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="shrink-0 text-[#0b1f3a]">
              <WhyCertificationIcon className="w-8 h-8 sm:w-9 sm:h-9" />
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-[#0b1f3a] leading-tight">Certification</h3>
              <p className="text-[11px] sm:text-xs text-slate-500 leading-snug mt-0.5">Get certified course completion certificates.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="shrink-0 text-[#0b1f3a]">
              <WhyPlacementSupportIcon className="w-8 h-8 sm:w-9 sm:h-9" />
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-[#0b1f3a] leading-tight">Placement Support</h3>
              <p className="text-[11px] sm:text-xs text-slate-500 leading-snug mt-0.5">100% placement assistance for eligible candidates.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Upcoming Batches */}
      <div className="lg:col-span-4 bg-gradient-to-br from-[#061a33] via-[#081f3d] to-[#031122] rounded-2xl p-5 sm:p-6 text-white shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[190px]">
        <div className="w-[62%] sm:w-[60%] relative z-10">
          <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider mb-3">
            UPCOMING BATCHES
          </h3>
          <div className="space-y-1.5 text-[11px] sm:text-xs text-slate-200 font-medium">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              <span>01 Sep 2026 - HVAC Engineer</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              <span>07 Sep 2026 - Industrial Electrician</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              <span>14 Sep 2026 - 6G Welding Training</span>
            </div>
          </div>
          <button
            onClick={() => onOpenEnquiry("Upcoming Batches")}
            className="mt-3.5 bg-[#f97316] hover:bg-[#ea580c] text-white text-[11px] sm:text-xs font-bold px-4 py-2 rounded-lg uppercase tracking-tight shadow-md transition-colors cursor-pointer inline-block"
          >
            VIEW ALL BATCHES
          </button>
        </div>
        <img
          src="/Skills/batch.png"
          alt="Upcoming Batches"
          className="absolute -right-2 sm:right-0 bottom-0 h-full max-h-[180px] sm:max-h-[195px] object-contain pointer-events-none drop-shadow-md z-0"
        />
      </div>
    </div>
  );
}
// ─── Student Testimonials & Counsellor Component ───────────────────────────────
function TestimonialsAndCounsellorSection({
  onOpenEnquiry,
}: {
  onOpenEnquiry: (courseTitle?: string) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prev = () => {
    setCurrentIndex((p) => (p === 0 ? Math.max(0, STUDENT_TESTIMONIALS.length - 3) : p - 1));
  };
  const next = () => {
    setCurrentIndex((p) => (p >= STUDENT_TESTIMONIALS.length - 3 ? 0 : p + 1));
  };

  const visibleItems = STUDENT_TESTIMONIALS.slice(currentIndex, currentIndex + 3);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-14">
      {/* Left: What Our Students Say */}
      <div className="lg:col-span-8 flex flex-col justify-between">
        <h2 className="text-base sm:text-lg font-black text-[#0b1f3a] uppercase tracking-wider mb-3">
          WHAT OUR STUDENTS SAY
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={prev}
            aria-label="Previous testimonials"
            className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-[#0b1f3a] flex items-center justify-center shrink-0 shadow-sm cursor-pointer transition-all hover:scale-105"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
            {visibleItems.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <img
                      src={item.avatar}
                      alt={item.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-100 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs sm:text-sm text-[#0b1f3a] truncate">{item.name}</h4>
                      <p className="text-[11px] font-medium text-slate-500 truncate">{item.course}</p>
                    </div>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-600 italic leading-relaxed min-h-[46px] my-2">
                    {item.quote}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[#f97316] pt-1">
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#f97316] text-[#f97316]" />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={next}
            aria-label="Next testimonials"
            className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-[#0b1f3a] flex items-center justify-center shrink-0 shadow-sm cursor-pointer transition-all hover:scale-105"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Right: Not Sure Which Course Is Right for You? */}
      <div className="lg:col-span-4 bg-[#f4f7fb] border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[190px]">
        <div className="w-[62%] sm:w-[60%] relative z-10">
          <h3 className="text-sm sm:text-base font-bold text-[#0b1f3a] leading-tight mb-1.5">
            Not Sure Which Course Is Right for You?
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-600 leading-snug mb-3">
            Talk to our career counsellor and choose the best course for your career.
          </p>
          <div className="space-y-1.5">
            <button
              onClick={() => onOpenEnquiry("Course Counselling")}
              className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white text-[11px] sm:text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-2 uppercase tracking-tight shadow-sm transition-colors cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 shrink-0" />
              <span>TALK TO COUNSELLOR</span>
            </button>
            <a
              href="https://wa.me/919940022222?text=Hi%20N-Skill,%20I%20would%20like%20course%20guidance"
              target="_blank"
              rel="noreferrer"
              className="w-full bg-white border border-[#0b1f3a]/25 hover:border-[#0b1f3a] text-[#0b1f3a] text-[11px] sm:text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-2 uppercase tracking-tight transition-colors"
            >
              <WhatsAppIcon className="w-3.5 h-3.5 text-green-600 shrink-0" />
              <span>CHAT ON WHATSAPP</span>
            </a>
          </div>
        </div>
        <img
          src="/Skills/whichcourse.png"
          alt="Career Counsellor"
          className="absolute -right-2 sm:right-0 bottom-0 h-full max-h-[195px] sm:max-h-[210px] object-contain pointer-events-none drop-shadow-md z-0"
        />
      </div>
    </div>
  );
}

// ─── Main Content Component ───────────────────────────────────────────────────
function CoursesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  
  // Filter sidebar states
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDuration, setSelectedDuration] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedMode, setSelectedMode] = useState<string>("all");
  const [selectedAudience, setSelectedAudience] = useState<string>("all");

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [visibleLimit, setVisibleLimit] = useState(8);

  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [selectedCourseForEnquiry, setSelectedCourseForEnquiry] = useState("");

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/courses`)
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load courses (${r.status})`);
        return r.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) throw new Error("Unexpected response");
        setCourses(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Sync categoryParam with selectedCategory if present in URL
  useEffect(() => {
    if (categoryParam) {
      const match = CATEGORIES_DATA.find(
        (c) =>
          c.name.toLowerCase().replace(/[^a-z0-9]/g, "") ===
          categoryParam.toLowerCase().replace(/[^a-z0-9]/g, "")
      );
      if (match) setSelectedCategory(match.name);
    } else {
      setSelectedCategory("all");
    }
  }, [categoryParam]);

  // Calculate exact dynamic counts for all 9 categories from actual fetched courses
  const categoryCounts: Record<string, number> = {};
  CATEGORIES_DATA.forEach((catItem) => {
    categoryCounts[catItem.name] = 0;
  });

  courses.forEach((c) => {
    const cCatNorm = normalizeCategory(c.category || "");
    CATEGORIES_DATA.forEach((catItem) => {
      const itemCatNorm = normalizeCategory(catItem.name);
      if (
        cCatNorm === itemCatNorm ||
        cCatNorm.includes(itemCatNorm) ||
        itemCatNorm.includes(cCatNorm)
      ) {
        categoryCounts[catItem.name] = (categoryCounts[catItem.name] || 0) + 1;
      }
    });
  });

  // Top 6 Popular Courses
  const popularCourses = courses.slice(0, 6);

  // Dynamic filtered courses for "ALL COURSES" section
  const filteredAllCourses = courses.filter((c) => {
    if (appliedSearch.trim()) {
      const q = appliedSearch.toLowerCase().trim();
      const titleMatch = (c.title || "").toLowerCase().includes(q);
      const catMatch = (c.category || "").toLowerCase().includes(q);
      const contentMatch = (c.content || "").toLowerCase().includes(q);
      if (!titleMatch && !catMatch && !contentMatch) return false;
    }
    if (selectedCategory !== "all") {
      if ((c.category || "").toLowerCase() !== selectedCategory.toLowerCase()) return false;
    }
    if (selectedDuration !== "all") {
      if (!c.duration || !c.duration.toLowerCase().includes(selectedDuration.toLowerCase())) return false;
    }
    const meta = getCourseMeta(c);
    if (selectedLevel !== "all") {
      if (meta.level.toLowerCase() !== selectedLevel.toLowerCase()) return false;
    }
    if (selectedMode !== "all") {
      if (!meta.mode.toLowerCase().includes(selectedMode.toLowerCase())) return false;
    }
    if (selectedAudience !== "all") {
      if (!c.eligibility || !c.eligibility.toLowerCase().includes(selectedAudience.toLowerCase())) return false;
    }
    return true;
  });

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAppliedSearch(searchInput);
    const section = document.getElementById("all-courses-section");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleCategoryClick = (catName: string) => {
    if (selectedCategory === catName) {
      setSelectedCategory("all");
      router.push("/courses");
    } else {
      setSelectedCategory(catName);
      const slug = catName.toLowerCase().replace(/\s+/g, "-").replace(/&/g, "and");
      router.push(`/courses?category=${slug}`);
    }
    const section = document.getElementById("all-courses-section");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleClearFilters = () => {
    setSelectedCategory("all");
    setSelectedDuration("all");
    setSelectedLevel("all");
    setSelectedMode("all");
    setSelectedAudience("all");
    setAppliedSearch("");
    setSearchInput("");
    router.push("/courses");
  };

  const handleOpenEnquiry = (courseTitle: string = "") => {
    setSelectedCourseForEnquiry(courseTitle);
    setIsEnquiryOpen(true);
  };

  const handleExploreCourses = () => {
    const el = document.getElementById("categories-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleTalkToCounsellor = () => {
    window.open(
      "https://wa.me/919884209774?text=Hi%20NSkill%2C%20I%20am%20interested%20in%20technical%20training%20courses.%20Please%20guide%20me.",
      "_blank"
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24">
      {/* ─── Hero Section ───────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#031525]">
        {/* Welder Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/Skills/skillsbanner.png"
            alt="Technical Training Banner"
            className="h-full w-full object-cover object-right md:object-center"
          />
          {/* Smooth dark navy gradient overlay blending seamlessly */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#031525] via-[#031525]/90 to-transparent lg:w-[65%]" />
        </div>

        <div className="relative z-10 mx-auto max-w-[1500px] px-3 py-5 md:px-6 md:py-7 lg:px-10 lg:py-8">
          <div className="grid min-h-[360px] items-center gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="max-w-[620px] text-left">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[38px] xl:text-[42px] font-black text-white leading-tight tracking-tight">
                Industry-Oriented
              </h1>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[38px] xl:text-[42px] font-black text-[#f97316] leading-tight tracking-tight mt-0.5 mb-3 lg:whitespace-nowrap">
                Technical Training Courses
              </h1>
              <p className="text-slate-200 text-xs sm:text-sm md:text-base font-normal mb-5 leading-relaxed max-w-lg">
                Learn practical skills from industry experts and build a successful career with N-Skill.
              </p>

              {/* 4 Feature Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 text-white">
                <div className="flex items-center gap-2">
                  <PracticalTrainingIcon className="w-6 h-6 text-white/90 shrink-0" />
                  <span className="text-[11px] sm:text-xs font-semibold leading-snug">
                    100%<br />Practical Training
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <IndustryCurriculumIcon className="w-6 h-6 text-white/90 shrink-0" />
                  <span className="text-[11px] sm:text-xs font-semibold leading-snug">
                    Industry<br />Curriculum
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ExperiencedTrainersIcon className="w-6 h-6 text-white/90 shrink-0" />
                  <span className="text-[11px] sm:text-xs font-semibold leading-snug">
                    Experienced<br />Trainers
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <PlacementAssistanceIcon className="w-6 h-6 text-white/90 shrink-0" />
                  <span className="text-[11px] sm:text-xs font-semibold leading-snug">
                    Placement<br />Assistance
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  onClick={handleExploreCourses}
                  className="bg-[#f97316] hover:bg-[#ea580c] text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-600/30 transition-all active:scale-95 cursor-pointer"
                >
                  EXPLORE COURSES
                </button>
                <button
                  onClick={handleTalkToCounsellor}
                  className="border border-white/50 hover:border-white text-white hover:bg-white/10 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-white" />
                  <span>TALK TO COUNSELLOR</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Floating Elevated Search Bar ───────────────────────────────────── */}
      <div className="mx-auto max-w-[1500px] px-3 sm:px-6 md:px-10 relative z-30 -mt-6 mb-8">
        <form
          onSubmit={handleSearchSubmit}
          className="bg-white rounded-2xl shadow-[0_12px_35px_rgba(0,0,0,0.08)] p-2.5 md:p-3 flex items-center gap-3 border border-slate-100"
        >
          <div className="bg-[#0b1f3a] p-3 rounded-xl text-white shrink-0 hidden sm:flex items-center justify-center">
            <Search className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-2 flex-1 px-2">
            <Search className="w-5 h-5 text-slate-400 sm:hidden shrink-0" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search for a course, skill or career..."
              className="w-full text-slate-800 placeholder:text-slate-400 font-medium text-sm md:text-base outline-none bg-transparent"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  setAppliedSearch("");
                }}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="bg-[#f97316] hover:bg-[#ea580c] text-white px-6 md:px-8 py-3.5 rounded-xl font-bold text-xs md:text-sm tracking-wide uppercase transition-colors shrink-0 cursor-pointer"
          >
            SEARCH COURSES
          </button>
        </form>
      </div>

      {/* ─── Browse Courses by Category ─────────────────────────────────────── */}
      <div id="categories-section" className="mx-auto max-w-[1700px] px-4 sm:px-8 md:px-12 lg:px-16">
        {/* Category Header Row */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-base sm:text-lg font-black text-[#0b1f3a] uppercase tracking-wider">
            BROWSE COURSES BY CATEGORY
          </h2>
          <Link
            href="/courses"
            className="text-[#0b1f3a] hover:text-[#f97316] text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors group"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-4 h-4 text-[#f97316] group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Horizontal Row of 9 Category Cards */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-9 gap-3 md:gap-3.5 mb-12">
          {CATEGORIES_DATA.map((item) => {
            const count = categoryCounts[item.name] || 0;
            const isSelected =
              categoryParam?.toLowerCase().replace(/[^a-z0-9]/g, "") ===
              item.name.toLowerCase().replace(/[^a-z0-9]/g, "");

            return (
              <div
                key={item.name}
                onClick={() => handleCategoryClick(item.name)}
                className={`group cursor-pointer bg-white rounded-2xl border transition-all duration-300 p-3.5 flex flex-col items-center justify-between text-center min-h-[145px] hover:shadow-lg hover:-translate-y-1 ${
                  isSelected
                    ? "border-[#f97316] ring-2 ring-[#f97316]/20 shadow-md bg-orange-50/20"
                    : "border-slate-200 hover:border-[#0b1f3a] shadow-sm"
                }`}
              >
                {/* Icon */}
                <div className="pt-1 text-[#0b1f3a] group-hover:text-[#f97316] transition-colors flex items-center justify-center">
                  <item.Icon className="w-10 h-10" />
                </div>

                {/* Title & Count */}
                <div className="mt-2 w-full">
                  <h3 className="text-xs sm:text-sm font-bold text-[#0b1f3a] leading-tight group-hover:text-[#f97316] transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-[11px] sm:text-xs font-bold text-[#f97316] mt-1">
                    {count} {count === 1 ? "Course" : "Courses"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ─── Popular Courses Section ────────────────────────────────────────── */}
        {!loading && !error && popularCourses.length > 0 && (
          <div className="mb-14">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-base sm:text-lg font-black text-[#0b1f3a] uppercase tracking-wider">
                POPULAR COURSES
              </h2>
              <button
                onClick={() => {
                  const el = document.getElementById("all-courses-section");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="text-[#0b1f3a] hover:text-[#f97316] text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors group cursor-pointer"
              >
                <span>View All Courses</span>
                <ArrowRight className="w-4 h-4 text-[#f97316] group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
              {popularCourses.map((course, idx) => (
                <PopularCourseCard
                  key={course.id ?? course.slug ?? idx}
                  course={course}
                  index={idx}
                  onEnquire={handleOpenEnquiry}
                />
              ))}
            </div>
          </div>
        )}

        {/* ─── All Courses Section with Left Filter Sidebar ───────────────────── */}
        <div id="all-courses-section" className="scroll-mt-6 mb-16">
          <div className="flex flex-col lg:flex-row gap-6 items-start">

            {/* Left Filter Sidebar */}
            <div className="w-full lg:w-72 shrink-0 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <h3 className="text-sm font-black text-[#0b1f3a] uppercase tracking-wider">
                  FILTER COURSES
                </h3>
                <button
                  onClick={handleClearFilters}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-4">
                {/* Category Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-[#0b1f3a] mb-1.5">
                    Category
                  </label>
                  <div className="relative">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-700 outline-none focus:border-[#0b1f3a] focus:bg-white transition-colors cursor-pointer pr-8"
                    >
                      <option value="all">All Categories</option>
                      {CATEGORIES_DATA.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name} ({categoryCounts[c.name] || 0})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-[#0b1f3a] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Duration Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-[#0b1f3a] mb-1.5">
                    Duration
                  </label>
                  <div className="relative">
                    <select
                      value={selectedDuration}
                      onChange={(e) => setSelectedDuration(e.target.value)}
                      className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-700 outline-none focus:border-[#0b1f3a] focus:bg-white transition-colors cursor-pointer pr-8"
                    >
                      <option value="all">All Durations</option>
                      <option value="15 Days">15 Days</option>
                      <option value="30 Days">30 Days</option>
                      <option value="45 Days">45 Days</option>
                      <option value="2 Months">2 Months</option>
                      <option value="4 Months">4 Months</option>
                      <option value="6 Months">6 Months</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-[#0b1f3a] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Level Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-[#0b1f3a] mb-1.5">
                    Level
                  </label>
                  <div className="relative">
                    <select
                      value={selectedLevel}
                      onChange={(e) => setSelectedLevel(e.target.value)}
                      className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-700 outline-none focus:border-[#0b1f3a] focus:bg-white transition-colors cursor-pointer pr-8"
                    >
                      <option value="all">All Levels</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Certificate">Certificate</option>
                      <option value="Diploma">Diploma</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-[#0b1f3a] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Mode Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-[#0b1f3a] mb-1.5">
                    Mode
                  </label>
                  <div className="relative">
                    <select
                      value={selectedMode}
                      onChange={(e) => setSelectedMode(e.target.value)}
                      className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-700 outline-none focus:border-[#0b1f3a] focus:bg-white transition-colors cursor-pointer pr-8"
                    >
                      <option value="all">All Modes</option>
                      <option value="Classroom">Offline / Classroom</option>
                      <option value="Practical Lab">Practical Lab</option>
                      <option value="Online">Online / Hybrid</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-[#0b1f3a] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Target Audience Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-[#0b1f3a] mb-1.5">
                    Target Audience
                  </label>
                  <div className="relative">
                    <select
                      value={selectedAudience}
                      onChange={(e) => setSelectedAudience(e.target.value)}
                      className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-700 outline-none focus:border-[#0b1f3a] focus:bg-white transition-colors cursor-pointer pr-8"
                    >
                      <option value="all">All Audience</option>
                      <option value="8th / 10th">8th / 10th Pass</option>
                      <option value="ITI / Diploma">ITI / Diploma</option>
                      <option value="Degree">Engineering / Degree</option>
                      <option value="Working">Working Professionals</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-[#0b1f3a] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <button
                  onClick={() => {
                    const el = document.getElementById("all-courses-section");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="w-full bg-[#0b1f3a] hover:bg-[#152e52] text-white font-black text-xs py-3.5 rounded-xl uppercase tracking-wider shadow-md transition-colors mt-2 cursor-pointer"
                >
                  APPLY FILTER
                </button>
              </div>
            </div>
            {/* Right Course Content Area */}
            <div className="flex-1 min-w-0 w-full">
              {/* Header with View Mode Switchers */}
              <div className="flex justify-between items-center pb-4 border-b border-slate-200 mb-6">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-[#0b1f3a] uppercase tracking-wider">
                    ALL COURSES
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Showing {Math.min(visibleLimit, filteredAllCourses.length)} of {filteredAllCourses.length} courses
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      viewMode === "grid"
                        ? "bg-[#0b1f3a] text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                    <span className="hidden sm:inline">Grid View</span>
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      viewMode === "list"
                        ? "bg-[#0b1f3a] text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <List className="w-4 h-4" />
                    <span className="hidden sm:inline">List View</span>
                  </button>
                </div>
              </div>

              {/* Active Filter Pills */}
              {(selectedCategory !== "all" || selectedDuration !== "all" || selectedLevel !== "all" || selectedMode !== "all" || selectedAudience !== "all" || appliedSearch) && (
                <div className="flex flex-wrap items-center gap-2 mb-6 bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <span className="text-[11px] font-bold uppercase text-slate-500">Filters:</span>
                  {selectedCategory !== "all" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white border border-slate-200 rounded-full text-xs font-bold text-black">
                      {selectedCategory}
                      <button onClick={() => setSelectedCategory("all")} className="hover:text-red-500 cursor-pointer"><X className="w-3 h-3" /></button>
                    </span>
                  )}
                  {selectedDuration !== "all" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white border border-slate-200 rounded-full text-xs font-bold text-black">
                      {selectedDuration}
                      <button onClick={() => setSelectedDuration("all")} className="hover:text-red-500 cursor-pointer"><X className="w-3 h-3" /></button>
                    </span>
                  )}
                  {appliedSearch && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white border border-slate-200 rounded-full text-xs font-bold text-black">
                      "{appliedSearch}"
                      <button onClick={() => { setAppliedSearch(""); setSearchInput(""); }} className="hover:text-red-500 cursor-pointer"><X className="w-3 h-3" /></button>
                    </span>
                  )}
                  <button onClick={handleClearFilters} className="text-xs font-bold text-blue-600 hover:underline ml-auto cursor-pointer">
                    Clear All
                  </button>
                </div>
              )}

              {/* Loading state */}
              {loading && (
                <div className="flex items-center justify-center py-20 text-slate-400">
                  <Loader2 className="w-7 h-7 animate-spin mr-3 text-blue-600" />
                  <span className="text-sm font-medium">Loading courses...</span>
                </div>
              )}

              {/* Error state */}
              {error && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-6 py-4 mb-8">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span className="text-sm font-semibold">{error}</span>
                </div>
              )}

              {!loading && filteredAllCourses.length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
                  <GraduationCap className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p className="text-base font-bold text-black mb-1">No matching courses found</p>
                  <p className="text-xs text-slate-500 mb-4">Try clearing or relaxing your filters to see more results.</p>
                  <button
                    onClick={handleClearFilters}
                    className="px-5 py-2 bg-black text-white rounded-xl text-xs font-bold hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                </div>
              )}

              {!loading && filteredAllCourses.length > 0 && viewMode === "grid" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
                  {filteredAllCourses.slice(0, visibleLimit).map((course, idx) => (
                    <AllCoursesGridCard
                      key={course.id ?? course.slug ?? idx}
                      course={course}
                      index={idx}
                    />
                  ))}
                </div>
              )}

              {!loading && filteredAllCourses.length > 0 && viewMode === "list" && (
                <div className="space-y-3.5">
                  {filteredAllCourses.slice(0, visibleLimit).map((course, idx) => (
                    <AllCoursesListCard
                      key={course.id ?? course.slug ?? idx}
                      course={course}
                      index={idx}
                      onEnquire={handleOpenEnquiry}
                    />
                  ))}
                </div>
              )}

              {/* View More Courses Button */}
              {!loading && filteredAllCourses.length > visibleLimit && (
                <div className="mt-8 text-center">
                  <button
                    onClick={() => setVisibleLimit((prev) => prev + 6)}
                    className="border border-[#0b1f3a] hover:bg-[#0b1f3a] text-[#0b1f3a] hover:text-white font-bold text-xs sm:text-sm px-8 py-3 rounded-xl uppercase tracking-wider transition-all shadow-sm cursor-pointer"
                  >
                    VIEW MORE COURSES
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── Bottom Sections: Why Choose N-Skill, Upcoming Batches, Testimonials, Career Counsellor ─ */}
        <WhyChooseAndBatchesSection onOpenEnquiry={handleOpenEnquiry} />
        <TestimonialsAndCounsellorSection onOpenEnquiry={handleOpenEnquiry} />
      </div>

      {/* Enquiry Modal */}
      <EnquiryModal
        isOpen={isEnquiryOpen}
        onClose={() => setIsEnquiryOpen(false)}
        defaultCourse={selectedCourseForEnquiry}
      />
    </div>
  );
}

// ─── Default Export wrapped in Suspense ───────────────────────────────────────
export default function CoursesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8fafc] pt-32 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-3" />
          <span className="text-slate-400 font-medium">Loading courses...</span>
        </div>
      }
    >
      <CoursesPageContent />
    </Suspense>
  );
}
