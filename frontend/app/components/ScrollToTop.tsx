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

    // Do not show on restricted pages to match FloatingContact and Chatbot
    const isRestricted = pathname ? (
        pathname.toLowerCase().startsWith("/login") ||
        pathname.toLowerCase().startsWith("/dashboard") ||
        pathname.toLowerCase().startsWith("/admin")
    ) : false;

    if (isRestricted || !show) return null;

    return (
        <button
            onClick={scrollToTop}
            className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:bg-red-600 hover:scale-110 group relative"
            aria-label="Scroll to top"
        >
            <ChevronUp size={28} />
            {/* Tooltip similar to WhatsApp */}
            <span className="absolute left-16 bg-white text-gray-800 text-sm font-semibold px-3 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
                Scroll to Top
            </span>
        </button>
    );
};

export default ScrollToTop;
