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
  const coursesMenuRef = useRef<HTMLDivElement>(null);

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
    { name: "Placements", href: "/placements/register" },
    { name: "Infrastructure", href: "/infrastructure" },
    { name: "Contact Us", href: "/contact" },
  ];

  return (
    <header className="w-full relative shadow-sm">

      {/* ── Top Bar ── */}

      {/* ── Top Bar ── */}
      {/* ── Top Bar ── */}
      <div className="bg-[#0b1f3a] text-white py-3 px-4 md:px-6 text-sm sm:text-base font-medium">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-y-2">
          {/* Left side — hours + contact */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            {/* Business hours — always visible */}
            <span className="flex items-center gap-2 whitespace-nowrap">
              <Clock size={14} strokeWidth={3} className="text-orange-400 shrink-0" />
              Business Hours : 9.30 am to 7.00 pm
            </span>

            <span className="text-white/20 hidden sm:inline">|</span>

            {/* Phone numbers — hidden on xs, show on sm+ */}
            <span className="hidden sm:flex items-center gap-2 whitespace-nowrap">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="#fb923c" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .9h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.76a16 16 0 006.15 6.15l1.22-1.22a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
              </svg>
              <a href="tel:09884209774" className="hover:text-orange-500 transition-colors">
                +91 98842 09774
              </a>
              <span className="text-white/20">|</span>
              <a href="tel:08056063023" className="hover:text-orange-500 transition-colors">
                +91 80560 63023
              </a>
            </span>

            <span className="text-white/20 hidden md:inline">|</span>

            {/* Email — hidden on xs+sm, show on md+ */}
            <span className="hidden md:flex items-center gap-2 whitespace-nowrap">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="#fb923c" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <a href="mailto:nskilltraining@gmail.com" className="hover:text-orange-500 transition-colors">
                nskilltraining@gmail.com
              </a>
            </span>
          </div>

          {/* Right side — Login Access */}
          <div className="flex items-center">
            <div
              className="relative py-1"
              onMouseEnter={() => setIsLoginMenuOpen(true)}
              onMouseLeave={() => setIsLoginMenuOpen(false)}
            >
              <button className="flex items-center gap-1.5 text-white hover:text-orange-500 transition-colors uppercase tracking-widest text-xs md:text-sm whitespace-nowrap font-bold">
                <Lock size={15} strokeWidth={3} className="text-orange-400" />
                Login Access
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
      {/* ── Main Navbar ── */}
      <nav className="bg-white px-4 md:px-6 py-3 sticky top-0 z-40 border-b">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 relative">

          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/logo.png"
              alt="NSKILL Logo"
              width={210}
              height={48}
              className="object-contain h-[40px] md:h-[48px] w-auto md:-ml-6 scale-110 md:scale-125"
              style={{ width: 'auto' }}
              priority
            />
          </Link>

          {/* Desktop Menu */}
          <ul className="hidden lg:flex items-center justify-end flex-1 md:space-x-0.5 xl:space-x-1">
            {menuItems.map((item) => (
              <li key={item.name} className={`shrink-0 ${item.dropdown ? "" : "relative group"}`}>
                {item.dropdown ? (
                  <div className="static" ref={coursesMenuRef}>
                    <button
                      onClick={() => {
                        setIsCoursesMenuOpen(!isCoursesMenuOpen);
                      }}
                      className={`flex items-center gap-1 px-2 xl:px-3 py-2 font-semibold transition text-sm uppercase tracking-wide whitespace-nowrap ${isCoursesMenuOpen
                          ? "text-red-600"
                          : "text-blue-600 hover:text-red-600"
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
                      className={`absolute left-1/2 -translate-x-1/2 mt-4 w-[98vw] max-w-7xl bg-white rounded-[40px] shadow-[0_20px_80px_rgba(0,0,0,0.15)] z-50 border border-slate-100 overflow-hidden transition-all duration-500 origin-top ${isCoursesMenuOpen
                          ? "opacity-100 scale-100 visible"
                          : "opacity-0 scale-95 invisible"
                        }`}
                    >
                      {/* ── Course list ── */}
                      <div>
                        <div className="p-4 px-6 bg-gradient-to-br from-white to-slate-50/50">

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
                            <div className="grid grid-cols-4 gap-x-8 gap-y-12 py-6">
                              {skillTrainingMenu.map((section, index) => (
                                <div key={index} className="space-y-2">
                                  <div className="flex items-center gap-2 border-b border-slate-100 pb-1.5">
                                    <div className="w-1 h-4 bg-blue-600 rounded-full" />
                                    <h4 className="text-base font-black tracking-wide uppercase text-blue-600 hover:text-red-600 transition-colors cursor-default">
                                      {section.title}
                                    </h4>
                                  </div>
                                  <ul className="grid grid-cols-1 gap-0.5">
                                    {section.items.map((course, i) => (
                                      <CourseLink
                                        key={i}
                                        course={course}
                                        onClose={closeMegaMenu}
                                      />
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* All Courses Link */}
                          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-center">
                            <Link
                              href="/courses"
                              className="group flex items-center gap-2 px-6 py-2 bg-orange-500 text-white rounded-full font-black text-[9px] uppercase tracking-[0.15em] hover:bg-orange-600 transition-all shadow-lg active:scale-95"
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
                    className="px-2 xl:px-3 py-2 font-semibold text-blue-600 hover:text-red-600 transition text-sm uppercase tracking-wide whitespace-nowrap"
                  >
                    {item.name}
                  </Link>
                )}
              </li>
            ))}
          </ul>

          {/* Mobile Toggle */}
          <div className="lg:hidden">
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
                className="block px-4 py-3 text-lg font-bold text-blue-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition"
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
