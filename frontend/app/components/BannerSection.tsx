"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import {
  GraduationCap,
  BookOpen,
  Building2,
  Award,
  Users,
  MessageCircle,
  Phone,
  ArrowRight,
} from "lucide-react";
import EnquiryModal from "./EnquiryModal";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/settings`;

interface Banner {
  id: number;
  image_url: string;
  title: string;
  is_active: boolean;
}

function PracticalTrainingIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

function IndustryOrientedIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" strokeWidth="2.5" />
    </svg>
  );
}

function ExpertTrainersIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function PlacementAssistanceIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export default function BannerSection() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [banners]);

  const fetchBanners = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/banners`);
      const activeBanners = res.data.filter((b: Banner) => b.is_active);
      setBanners(activeBanners);
    } catch (err) {
      console.error("Failed to fetch banners:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTalkToCounsellor = () => {
    window.open(
      "https://wa.me/919884209774?text=Hi%20NSkill%2C%20I%20am%20interested%20in%20technical%20training%20courses.%20Please%20guide%20me.",
      "_blank"
    );
  };

  return (
    <div className="relative w-full overflow-hidden bg-[#031525] select-none">
      {/* Hero Main Banner Area */}
      <div className="relative w-full min-h-[340px] sm:min-h-[380px] md:min-h-[420px] lg:min-h-[450px] flex items-center">
        
        {/* Dynamic Background Image Slider with Smooth Crossfade */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {banners.length > 0 ? (
            banners.map((banner, idx) => (
              <div
                key={banner.id || idx}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  activeIndex === idx ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"
                }`}
              >
                <img
                  src={banner.image_url}
                  alt={banner.title || "Banner"}
                  className="w-full h-full object-cover object-right md:object-center"
                  onError={(e) => {
                    const img = e.currentTarget;
                    img.onerror = null;
                    img.src = "/Skills/skillsbanner.png";
                  }}
                />
              </div>
            ))
          ) : (
            <img
              src="/Skills/skillsbanner.png"
              alt="Build Your Skill"
              className="w-full h-full object-cover object-right md:object-center"
            />
          )}

          {/* Smooth Dark Navy Gradient overlay on left side for crisp text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#031525] via-[#031525]/90 sm:via-[#031525]/85 to-transparent w-full lg:w-[68%]" />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Hero Left Content */}
        <div className="relative z-10 mx-auto max-w-[1440px] w-full px-4 sm:px-8 md:px-12 lg:px-16 py-8 sm:py-10 md:py-12">
          <div className="max-w-[620px] text-left">
            
            {/* Main Headline */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-black text-white leading-tight tracking-tight uppercase">
              BUILD YOUR SKILL.{" "}
              <span className="block text-[#f97316]">BUILD YOUR FUTURE.</span>
            </h1>

            {/* Subtitle */}
            <p className="mt-2.5 sm:mt-3.5 text-xs sm:text-sm md:text-[15px] font-medium text-slate-200 leading-relaxed max-w-lg">
              Industry-oriented technical training with practical exposure, expert faculty & placement assistance.
            </p>

            {/* 4 Feature Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 my-5 sm:my-6 text-white">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-white/10 text-[#f97316] shrink-0 border border-white/10">
                  <PracticalTrainingIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-[11px] sm:text-xs font-bold leading-tight">
                  100% Practical<br className="hidden sm:inline" /> Training
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-white/10 text-[#f97316] shrink-0 border border-white/10">
                  <IndustryOrientedIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-[11px] sm:text-xs font-bold leading-tight">
                  Industry<br className="hidden sm:inline" /> Oriented
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-white/10 text-[#f97316] shrink-0 border border-white/10">
                  <ExpertTrainersIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-[11px] sm:text-xs font-bold leading-tight">
                  Expert<br className="hidden sm:inline" /> Trainers
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-white/10 text-[#f97316] shrink-0 border border-white/10">
                  <PlacementAssistanceIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-[11px] sm:text-xs font-bold leading-tight">
                  Placement<br className="hidden sm:inline" /> Assistance
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href="/courses"
                className="bg-[#f97316] hover:bg-[#ea580c] text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-600/30 transition-all active:scale-95 cursor-pointer inline-flex items-center gap-2"
              >
                <span>EXPLORE COURSES</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <button
                type="button"
                onClick={handleTalkToCounsellor}
                className="border border-white/40 hover:border-white text-white hover:bg-white/10 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all active:scale-95 cursor-pointer bg-white/5 backdrop-blur-sm"
              >
                <MessageCircle className="w-4 h-4 text-white" />
                <span>TALK TO COUNSELLOR</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Floating Quick Action Badges */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-20 hidden md:flex flex-col gap-2.5 items-end pointer-events-auto">
          <a
            href="https://wa.me/919884209774?text=Hi%20NSkill%2C%20I%20want%20to%20know%20more%20about%20your%20courses"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#22c55e] hover:bg-[#16a34a] text-white text-[11px] font-bold py-2 px-3.5 rounded-l-xl shadow-lg flex items-center gap-2 transition-all hover:pr-4.5"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
          </svg>
          <span>WhatsApp</span>
        </a>

        <a
          href="tel:+919884209774"
          className="bg-[#f97316] hover:bg-[#ea580c] text-white text-[11px] font-bold py-2 px-3.5 rounded-l-xl shadow-lg flex items-center gap-2 transition-all hover:pr-4.5"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Call Now</span>
        </a>

        <button
          type="button"
          onClick={() => setIsEnquiryOpen(true)}
          className="bg-[#ea580c] hover:bg-[#c2410c] text-white text-[11px] font-bold py-2 px-3.5 rounded-l-xl shadow-lg flex items-center gap-2 transition-all hover:pr-4.5 cursor-pointer"
        >
          <GraduationCap className="w-4 h-4" />
          <span>Enquire Now</span>
        </button>
      </div>

      {/* Carousel Slider Dot Indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                activeIndex === i ? "w-6 bg-[#f97316]" : "w-2 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}
    </div>

    {/* Bottom White Stats Bar */}
    <div className="relative z-20 w-full bg-white border-t border-slate-100 shadow-[0_10px_35px_rgb(0,0,0,0.06)]">
      <div className="mx-auto max-w-[1500px] px-4 sm:px-8 lg:px-12 py-6 sm:py-7">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 md:gap-8 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          
          <div className="flex items-center gap-4 px-2 sm:px-4 pt-3 sm:pt-0">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-blue-50/90 text-[#0b1f3a] border border-blue-100 flex items-center justify-center shrink-0 shadow-sm">
              <GraduationCap className="w-7 h-7 text-[#0b1f3a]" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[#0b1f3a] tracking-tight leading-none mb-1">5000+</div>
              <div className="text-xs sm:text-sm font-bold text-slate-600">Students Trained</div>
            </div>
          </div>

          <div className="flex items-center gap-4 px-2 sm:px-4 pt-3 sm:pt-0">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-blue-50/90 text-[#0b1f3a] border border-blue-100 flex items-center justify-center shrink-0 shadow-sm">
              <BookOpen className="w-7 h-7 text-[#0b1f3a]" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[#0b1f3a] tracking-tight leading-none mb-1">50+</div>
              <div className="text-xs sm:text-sm font-bold text-slate-600">Courses</div>
            </div>
          </div>

          <div className="flex items-center gap-4 px-2 sm:px-4 pt-3 sm:pt-0">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-blue-50/90 text-[#0b1f3a] border border-blue-100 flex items-center justify-center shrink-0 shadow-sm">
              <Building2 className="w-7 h-7 text-[#0b1f3a]" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[#0b1f3a] tracking-tight leading-none mb-1">100+</div>
              <div className="text-xs sm:text-sm font-bold text-slate-600">Industry Partners</div>
            </div>
          </div>

          <div className="flex items-center gap-4 px-2 sm:px-4 pt-3 sm:pt-0">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-blue-50/90 text-[#0b1f3a] border border-blue-100 flex items-center justify-center shrink-0 shadow-sm">
              <Award className="w-7 h-7 text-[#0b1f3a]" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[#0b1f3a] tracking-tight leading-none mb-1">15+</div>
              <div className="text-xs sm:text-sm font-bold text-slate-600">Years of Excellence</div>
            </div>
          </div>

          <div className="flex items-center gap-4 px-2 sm:px-4 pt-3 sm:pt-0 col-span-2 sm:col-span-1">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-blue-50/90 text-[#0b1f3a] border border-blue-100 flex items-center justify-center shrink-0 shadow-sm">
              <Users className="w-7 h-7 text-[#0b1f3a]" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[#0b1f3a] tracking-tight leading-none mb-1">95%</div>
              <div className="text-xs sm:text-sm font-bold text-slate-600">Placement Assistance</div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <EnquiryModal
      isOpen={isEnquiryOpen}
      onClose={() => setIsEnquiryOpen(false)}
      defaultCourse="General Enquiry"
    />
  </div>
);
}