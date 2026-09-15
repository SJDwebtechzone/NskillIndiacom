"use client";

import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";
import { usePathname } from "next/navigation";

const ScrollToTop = () => {
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Do not show on restricted pages
  const isRestricted = pathname ? (
    pathname.toLowerCase().startsWith("/login") ||
    pathname.toLowerCase().startsWith("/dashboard") ||
    pathname.toLowerCase().startsWith("/admin")
  ) : false;

  if (isRestricted || !show) return null;

  return (
    <button
      onClick={scrollToTop}
      className="w-10 h-10 sm:w-12 sm:h-12 md:w-13 md:h-13 bg-[#0a2d5c] hover:bg-[#f97316] text-white rounded-xl sm:rounded-2xl shadow-lg shadow-[#0a2d5c]/25 border border-white/20 flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 group relative cursor-pointer"
      aria-label="Scroll to top"
      title="Scroll to Top"
    >
      <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:-translate-y-0.5" />
      
      {/* Desktop Tooltip */}
      <span className="hidden sm:block absolute left-14 md:left-16 bg-[#0a2d5c] text-white text-xs font-semibold px-2.5 py-1 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
        Scroll to Top
      </span>
    </button>
  );
};

export default ScrollToTop;
