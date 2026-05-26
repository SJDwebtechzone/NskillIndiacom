"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Lock,
  User,
  Users,
  GraduationCap,
  Menu,
  X,
  Clock,
  ChevronDown,
  Briefcase,
  Snowflake,
  Zap,
  Wrench,
  Flame,
  Home,
  Settings,
  Award,
  Shield,
  Droplets,
  ChevronRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface CourseMenuItem {
  name: string;
  id: string;
  thumbnail_url?: string | null;
}
interface CategoryMenu {
  title: string;
  items: CourseMenuItem[];
}

// ─── Category order ───────────────────────────────────────────────────────────
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

const CATEGORY_ICONS: Record<string, React.ComponentType<any>> = {
  "HVAC & Refrigeration": Snowflake,
  "Electrical": Zap,
  "Plumbing": Wrench,
  "Welding": Flame,
  "Home Appliance": Home,
  "MEP": Settings,
  "Quality": Award,
  "Safety": Shield,
  "Oil & Gas": Droplets,
};



// ─── Course link ──────────────────────────────────────────────────────────────
function CourseLink({
  course,
  onClose,
}: {
  course: CourseMenuItem;
  onClose: () => void;
}) {
  return (
    <li>
      <Link
        href={`/courses/${course.id}`}
        className="flex items-center gap-2 p-1 px-3 rounded-md hover:bg-slate-50 text-[#0b1f3a] hover:text-blue-700 transition-all group/item"
        onClick={onClose}
      >
        <span className="text-sm font-medium uppercase tracking-tight block flex-1">
          {course.name}
        </span>
        <svg
          width="10" height="10" viewBox="0 0 10 10" fill="none"
          className="opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0 text-blue-500"
          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
        >
          <path d="M2 8L8 2M4 2h4v4" />
        </svg>
      </Link>
    </li>
  );
}

// ─── Main Navbar ──────────────────────────────────────────────────────────────
const Navbar = () => {
  const pathname = usePathname();
  const [isLoginMenuOpen, setIsLoginMenuOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCoursesMenuOpen, setIsCoursesMenuOpen] = useState(false);
  const [skillTrainingMenu, setSkillTrainingMenu] = useState<CategoryMenu[]>([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const coursesMenuRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsCoursesMenuOpen(true);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setIsCoursesMenuOpen(false);
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);


  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

  // ── Fetch courses ─────────────────────────────────────────────────────────
  useEffect(() => {
    fetch(`${API_URL}/api/courses`)
      .then(r => {
        if (!r.ok) throw new Error("Failed to fetch courses");
        return r.json();
      })
      .then((courses: any[]) => {
        if (!Array.isArray(courses)) return;

        const grouped = courses.reduce(
          (acc: Record<string, CourseMenuItem[]>, course: any) => {
            const cat = course.category ?? "Other";
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push({
              name: course.title,
              id: course.slug,
              thumbnail_url: course.thumbnail_url ?? null,
            });
            return acc;
          },
          {}
        );

        const sorted: CategoryMenu[] = CATEGORY_ORDER
          .filter(cat => grouped[cat])
          .map(cat => ({ title: cat, items: grouped[cat] }));

        Object.keys(grouped).forEach(cat => {
          if (!CATEGORY_ORDER.includes(cat)) {
            sorted.push({ title: cat, items: grouped[cat] });
          }
        });

        setSkillTrainingMenu(sorted);
      })
      .catch(err => console.error("Navbar courses fetch failed:", err))
      .finally(() => setMenuLoading(false));
  }, []);

  // ── Close on outside click ────────────────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        coursesMenuRef.current &&
        !coursesMenuRef.current.contains(event.target as Node)
      ) {
        setIsCoursesMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const closeMegaMenu = () => {
    setIsCoursesMenuOpen(false);
  };

  // ── Close on scroll (Disabled to keep mega menu visible during scrolling) ──
  // useEffect(() => {
  //   const handleScroll = () => {
  //     setIsCoursesMenuOpen(false);
  //   };
  //   if (isCoursesMenuOpen) {
  //     window.addEventListener("scroll", handleScroll, { passive: true });
  //   }
  //   return () => window.removeEventListener("scroll", handleScroll);
  // }, [isCoursesMenuOpen]);

  if (pathname?.startsWith("/login") || pathname?.startsWith("/dashboard")) {
    return null;
  }

  const menuItems = [
    { name: "Home", href: "/" },
    { name: "Skill Training", href: "/courses", dropdown: true },
    // AFTER — disabled until pages are built
    { name: "Corporate Training", href: "/corporate-training" },
    { name: "Consulting Services", href: "/consulting" },
    { name: "Course Calendar", href: "/course_calender" },
    { name: "Placements", href: "/placements" },
    { name: "Infrastructure", href: "/infrastructure" },
    { name: "Contact Us", href: "/contact" },
  ];

  return (
    <header className="w-full relative shadow-sm">

      {/* ══════════════════════════════════════════
          TOP BAR — Logo + Info + Login
      ══════════════════════════════════════════ */}
      <div className="bg-white border-b border-slate-100 py-3 px-6 xl:px-12">
        <div className="w-full flex items-center justify-between gap-4">

          {/* LEFT — Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/logo.png"
              alt="NSKILL Logo"
              width={260}
              height={64}
              className="object-contain h-[56px] md:h-[68px] w-auto"
              style={{ width: 'auto' }}
              priority
            />
          </Link>

          {/* CENTER — Business Hours + Phones + Email */}
          <div className="hidden md:flex items-center gap-6 flex-1 justify-center">

            {/* Business Hours */}
            <div className="flex items-center gap-2 text-[#0f172a] font-bold text-lg whitespace-nowrap">
              <Clock size={20} className="text-[#2563eb] shrink-0" strokeWidth={2.5} />
              <span>Business Hours : 9.30 am to 7.00 pm</span>
            </div>

            <span className="text-slate-300 font-normal text-lg">|</span>

            {/* Phones */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-[#0f172a] font-medium text-lg whitespace-nowrap">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .9h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.76a16 16 0 006.15 6.15l1.22-1.22a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                </svg>
                <a href="tel:09884209774" className="hover:text-[#2563eb] transition-colors">+91 98842 09774</a>
              </div>
              <div className="flex items-center gap-2 text-[#0f172a] font-medium text-lg whitespace-nowrap">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .9h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.76a16 16 0 006.15 6.15l1.22-1.22a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                </svg>
                <a href="tel:08056063023" className="hover:text-[#2563eb] transition-colors">+91 80560 63023</a>
              </div>
            </div>

            <span className="text-slate-300 font-normal text-lg">|</span>

            {/* Email */}
            <div className="flex items-center gap-2 text-[#0f172a] font-medium text-lg whitespace-nowrap">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <a href="mailto:nskilltraining@gmail.com" className="hover:text-[#2563eb] transition-colors">nskilltraining@gmail.com</a>
            </div>

          </div>

          {/* Login Button */}
          <div className="flex items-center">
            <div
              className="relative"
              onMouseEnter={() => setIsLoginMenuOpen(true)}
              onMouseLeave={() => setIsLoginMenuOpen(false)}
            >
              <button className="flex items-center gap-2 bg-[#2563eb] text-white font-bold text-[15px] px-5 py-3 rounded-[10px] whitespace-nowrap shrink-0 transition-transform hover:-translate-y-0.5 shadow-[0_8px_20px_rgba(37,99,235,0.2)]">
                <Lock size={16} strokeWidth={2.5} />
                LOGIN ACCESS
              </button>

              <div
                className={`absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-2xl z-50 border border-gray-100 overflow-hidden transition-all duration-300 ${isLoginMenuOpen
                    ? "opacity-100 translate-y-0 visible"
                    : "opacity-0 -translate-y-2 invisible"
                  }`}
              >
                <div className="p-2">
                  {[
                    { href: "/login/admin", icon: <User size={16} />, bg: "bg-blue-100", text: "text-blue-600", label: "Admin" },
                    { href: "/login/associate", icon: <Users size={16} />, bg: "bg-green-100", text: "text-green-600", label: "Associate" },
                    { href: "/login/student", icon: <GraduationCap size={16} />, bg: "bg-purple-100", text: "text-purple-600", label: "Student" },
                    { href: "/login/trainer", icon: <Briefcase size={16} />, bg: "bg-orange-100", text: "text-orange-600", label: "Trainer" },
                  ].map(({ href, icon, bg, text, label }) => (
                    <Link
                      key={label}
                      href={href}
                      className="flex items-center space-x-3 px-4 py-3 hover:bg-blue-50 rounded-md text-gray-700 hover:text-blue-700 transition"
                      onClick={() => setIsLoginMenuOpen(false)}
                    >
                      <div className={`w-8 h-8 rounded-full ${bg} flex items-center justify-center ${text}`}>
                        {icon}
                      </div>
                      <span className="font-semibold text-sm">{label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ══════════════════════════════════════════
          MAIN NAV BAR — Navigation links only
      ══════════════════════════════════════════ */}
      <nav className="bg-white px-6 xl:px-12 py-2.5 sticky top-0 z-40 border-b shadow-sm">
        <div className="w-full flex items-center justify-between gap-4 relative">

          {/* Desktop Menu */}
          <ul className="hidden lg:flex items-center justify-between w-full">
            {menuItems.map((item) => (
              <li key={item.name} className={`shrink-0 ${item.dropdown ? "" : "relative group"}`}>
                {item.dropdown ? (
                  <div
                    className="static"
                    ref={coursesMenuRef}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    <button
                      onClick={() => {
                        setIsCoursesMenuOpen(!isCoursesMenuOpen);
                      }}
                      className={`flex items-center gap-1 px-1.5 py-2 font-bold transition text-[15px] uppercase tracking-normal whitespace-nowrap ${
                        isCoursesMenuOpen ? "text-[#2563eb]" : "text-[#0f172a] hover:text-[#2563eb]"
                      }`}
                    >
                      {item.name}
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-300 ${isCoursesMenuOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {/* ── Mega Menu ── */}
                    <div
                      className={`absolute top-full left-1/2 -translate-x-1/2 -mt-4 pt-8 w-[98vw] max-w-7xl z-50 transition-all duration-500 origin-top ${isCoursesMenuOpen
                          ? "opacity-100 scale-100 visible"
                          : "opacity-0 scale-95 invisible"
                        }`}
                    >
                      {/* ── Course list ── */}
                      <div
                        className="bg-white rounded-[40px] shadow-[0_20px_80px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden max-h-[80vh] overflow-y-auto overscroll-contain [&::-webkit-scrollbar]:hidden"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                      >
                        <div className="p-5 px-7 bg-gradient-to-br from-white to-slate-50/50">

                          {menuLoading ? (
                            <div className="flex items-center justify-center py-12 text-slate-400">
                              <svg className="animate-spin w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                              </svg>
                              Loading courses...
                            </div>
                          ) : skillTrainingMenu.length === 0 ? (
                            <div className="text-center py-12 text-slate-400 text-sm">
                              No courses available
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6 py-6">
                              {skillTrainingMenu.map((section, index) => {
                                const IconComponent = CATEGORY_ICONS[section.title] ?? Settings;
                                const hasMore = section.items.length > 5;
                                const isExpanded = !!expandedCategories[section.title];
                                const visibleItems = isExpanded ? section.items : section.items.slice(0, 5);
                                return (
                                  <div
                                    key={index}
                                    className="bg-white border border-slate-100/80 rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:border-blue-100 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full"
                                  >
                                    <div>
                                      {/* Header */}
                                      <div className="flex items-center gap-3.5 mb-5 pb-3 border-b border-slate-100/80">
                                        <div className="w-11 h-11 rounded-xl bg-blue-50/80 flex items-center justify-center text-blue-600 shrink-0 border border-blue-100/50">
                                          <IconComponent size={20} strokeWidth={2.5} />
                                        </div>
                                        <h4 className="text-xs font-black tracking-wide uppercase text-blue-600 leading-snug cursor-default">
                                          {section.title}
                                        </h4>
                                      </div>
                                      
                                      {/* Course list */}
                                      <ul className="space-y-2.5">
                                        {visibleItems.map((course, i) => (
                                          <li key={i} className="flex items-start gap-1.5">
                                            <span className="text-slate-400 mt-1 select-none shrink-0 text-[10px]">•</span>
                                            <Link
                                              href={`/courses/${course.id}`}
                                              className="text-[11px] font-bold uppercase tracking-tight text-slate-600 hover:text-blue-600 transition-colors leading-relaxed block"
                                              onClick={closeMegaMenu}
                                            >
                                              {course.name}
                                            </Link>
                                          </li>
                                        ))}
                                      </ul>
                                      {hasMore && (
                                        <button
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setExpandedCategories(prev => ({
                                              ...prev,
                                              [section.title]: !prev[section.title]
                                            }));
                                          }}
                                          className="text-[10px] font-black text-blue-600 hover:text-blue-700 mt-3 flex items-center gap-1 transition-colors uppercase cursor-pointer"
                                        >
                                          {isExpanded ? "Show Less" : `+ ${section.items.length - 5} More`}
                                        </button>
                                      )}
                                    </div>

                                    {/* View More Button */}
                                    <Link
                                      href={`/courses?category=${section.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                                      className="w-full flex items-center justify-between px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all mt-6 shadow-[0_4px_12px_rgba(37,99,235,0.12)] hover:shadow-[0_6px_16px_rgba(37,99,235,0.22)] hover:-translate-y-0.5"
                                      onClick={closeMegaMenu}
                                    >
                                      <span>View More Details</span>
                                      <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm shrink-0">
                                        <ChevronRight size={12} strokeWidth={3} />
                                      </div>
                                    </Link>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* All Courses Link */}
                          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-center">
                            <Link
                              href="/courses"
                              className="group flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-full font-black text-[9px] uppercase tracking-[0.15em] hover:bg-blue-700 transition-all shadow-lg active:scale-95"
                              onClick={closeMegaMenu}
                            >
                              Explore Full Catalog
                              <div className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform">
                                <ChevronDown size={10} className="-rotate-90" />
                              </div>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className={`px-1.5 py-2 font-bold transition text-[15px] uppercase tracking-normal whitespace-nowrap relative ${
                      pathname === item.href ? "text-[#2563eb]" : "text-[#0f172a] hover:text-[#2563eb]"
                    }`}
                  >
                    {item.name}
                    {pathname === item.href && (
                      <span className="absolute left-0 -bottom-[10px] w-full h-[3px] bg-[#2563eb] rounded-[10px]" />
                    )}
                  </Link>
                )}
              </li>
            ))}
          </ul>

          {/* Mobile Toggle */}
          <div className="lg:hidden ml-auto">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-[#0b1f3a] hover:bg-gray-100 rounded-lg transition"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>


      {/* ── Mobile Backdrop ── */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* ── Mobile Menu Panel ── */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-white shadow-2xl z-50 flex flex-col lg:hidden transform transition-transform duration-300 ${isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="flex justify-between items-center p-6 mb-4">
          <Link href="/" onClick={() => setIsMenuOpen(false)} className="flex items-center">
            <Image
              src="/logo.png"
              alt="NSKILL Logo"
              width={180}
              height={40}
              className="object-contain h-[40px] w-auto"
              style={{ width: 'auto' }}
            />
          </Link>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={24} />
          </button>
        </div>

        <ul className="space-y-1 overflow-y-auto px-6 flex-1">
          {menuItems.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-3 text-lg font-bold text-[#0f172a] hover:bg-blue-50 hover:text-[#2563eb] rounded-xl transition"
              >
                {item.name}
              </Link>
            </li>
          ))}

          {!menuLoading && skillTrainingMenu.length > 0 && (
            <li>
              <div className="mt-4 space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">
                  All Courses
                </p>
                {skillTrainingMenu.map((section, si) => (
                  <div key={si}>
                    <p className="text-[11px] font-black uppercase tracking-wider text-blue-600 px-4 mb-1">
                      {section.title}
                    </p>
                    {section.items.map((course, ci) => (
                      <Link
                        key={ci}
                        href={`/courses/${course.id}`}
                        onClick={() => setIsMenuOpen(false)}
                        className="block px-4 py-2 text-sm font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition"
                      >
                        {course.name}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            </li>
          )}
        </ul>

        <div className="p-6 border-t">
          <p className="text-xs text-center text-gray-500 font-medium uppercase tracking-widest">
            Business Hours : 9.30 to 7.00
          </p>
        </div>
      </div>

    </header>
  );
};

export default Navbar;
