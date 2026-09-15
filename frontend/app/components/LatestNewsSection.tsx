"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Calendar, Newspaper, X, ArrowRight, Sparkles } from "lucide-react";

interface NewsItem {
    id: number;
    title: string;
    content: string;
    image_url: string;
    created_at: string;
}

const LatestNewsSection = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const [news, setNews] = useState<NewsItem[]>([]);
    const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

    useEffect(() => {
        fetch(`${API}/api/settings/news`)
            .then((res) => res.json())
            .then((data) => {
                const fetchedNews = Array.isArray(data) ? data : [];
                setNews(fetchedNews);
            })
            .catch(() => setNews([]));
    }, [API]);

    // Close modal on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setSelectedNews(null);
        };
        if (selectedNews) {
            window.addEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [selectedNews]);

    const getImageUrl = (url: string) => {
        if (!url) return "/logo.png";
        if (url.startsWith("http://") || url.startsWith("https://")) return url;
        const cleaned = url.replace(/\\/g, "/");
        return `${API}${cleaned.startsWith("/") ? "" : "/"}${cleaned}`;
    };

    if (news.length === 0) {
        return (
            <section className="py-16 bg-slate-50/50" ref={ref}>
                <div className="container mx-auto px-4 text-center opacity-60">
                    <Newspaper className="w-12 h-12 text-[#0a2d5c] mb-4 mx-auto" />
                    <p className="text-slate-600 font-medium">No latest news available right now.</p>
                </div>
            </section>
        );
    }

    return (
        <section className="py-16 md:py-20 bg-slate-50/50 overflow-hidden" ref={ref}>
            <div className="container mx-auto px-4 md:px-8 max-w-[1440px]">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    className="text-center mb-10"
                >
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0b1f3a] tracking-tight uppercase mb-3">
                        LATEST NEWS
                    </h2>
                    <div className="w-16 h-1 bg-[#0b1f3a] mx-auto rounded-full" />
                </motion.div>

                <div className="relative group">
                    <style dangerouslySetInnerHTML={{
                        __html: `
                        @keyframes marquee-news-fixed {
                            0% { transform: translateX(0); }
                            100% { transform: translateX(calc(-100% / 2)); }
                        }
                        .animate-news-loop {
                            display: flex;
                            width: max-content;
                            animation: marquee-news-fixed ${Math.max(news.length * 10, 20)}s linear infinite;
                        }
                        .animate-news-loop:hover {
                            animation-play-state: paused;
                        }
                    `}} />
                    
                    <div className="animate-news-loop gap-6 py-4">
                        {/* Render items twice for seamless loop */}
                        {[...news, ...news].map((item, i) => (
                            <div
                                key={`${item.id}-${i}`}
                                onClick={() => setSelectedNews(item)}
                                className="w-[320px] md:w-[380px] flex-shrink-0 bg-white rounded-none border border-slate-200 shadow-sm hover:shadow-xl hover:border-[#0a2d5c] transition-all duration-300 group cursor-pointer flex flex-col justify-between"
                            >
                                <div>
                                    {/* Image Container - NO CROPPING */}
                                    <div className="relative w-full h-56 bg-slate-100 flex items-center justify-center p-3 border-b border-slate-100 overflow-hidden">
                                        <img
                                            src={getImageUrl(item.image_url)}
                                            alt={item.title}
                                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute top-3 left-3 bg-[#f97316] text-white text-[10px] font-black px-3 py-1 rounded-none flex items-center gap-1.5 shadow uppercase tracking-wider">
                                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                            Update
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6">
                                        <div className="flex items-center gap-2 text-[#f97316] mb-3">
                                            <Calendar className="w-4 h-4" />
                                            <span className="text-xs font-bold uppercase tracking-wider">
                                                {new Date(item.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </div>
                                        <h3 className="text-lg md:text-xl font-bold text-[#0a2d5c] mb-3 leading-snug group-hover:text-[#f97316] transition-colors">
                                            {item.title}
                                        </h3>
                                        <p className="text-slate-600 text-sm leading-relaxed font-normal text-justify line-clamp-3">
                                            {item.content}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedNews(item);
                                            }}
                                            className="text-[#f97316] hover:text-[#ea580c] font-bold text-xs uppercase tracking-wider mt-4 inline-flex items-center gap-1 cursor-pointer group-hover:translate-x-1 transition-transform"
                                        >
                                            <span>Read More</span>
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ================= DETAILED POPUP MODAL ================= */}
            <AnimatePresence>
                {selectedNews && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto"
                        onClick={() => setSelectedNews(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.25 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-2xl bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden max-h-[90vh] flex flex-col my-auto"
                        >
                            {/* Close "X" Button */}
                            <button
                                type="button"
                                onClick={() => setSelectedNews(null)}
                                className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-black/60 hover:bg-[#f97316] text-white flex items-center justify-center shadow-lg transition-colors cursor-pointer"
                                aria-label="Close"
                                title="Close"
                            >
                                <X className="w-5 h-5 stroke-[2.5]" />
                            </button>

                            {/* Large Image (No Cropping) */}
                            <div className="relative w-full h-64 sm:h-80 bg-slate-950 flex items-center justify-center p-4 shrink-0">
                                <img
                                    src={getImageUrl(selectedNews.image_url)}
                                    alt={selectedNews.title}
                                    className="w-full h-full object-contain"
                                />
                                <div className="absolute top-4 left-4 bg-[#f97316] text-white text-xs font-black px-3 py-1 rounded-full shadow flex items-center gap-1.5 uppercase tracking-wider">
                                    <Sparkles className="w-3 h-3 text-white" />
                                    Latest Update
                                </div>
                            </div>

                            {/* Modal Content Scrollable Area */}
                            <div className="p-6 sm:p-8 overflow-y-auto">
                                <div className="flex items-center gap-2 text-[#f97316] mb-3">
                                    <Calendar className="w-4 h-4" />
                                    <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">
                                        {new Date(selectedNews.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </div>

                                <h3 className="text-xl sm:text-2xl font-black text-[#0a2d5c] mb-4 leading-tight">
                                    {selectedNews.title}
                                </h3>

                                <div className="w-12 h-1 bg-[#f97316] rounded-full mb-5" />

                                <div className="text-slate-700 text-sm sm:text-base leading-relaxed font-normal whitespace-pre-line text-justify">
                                    {selectedNews.content}
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setSelectedNews(null)}
                                    className="px-5 py-2.5 bg-[#0a2d5c] hover:bg-[#031b34] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow cursor-pointer"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </section>
    );
};

export default LatestNewsSection;
