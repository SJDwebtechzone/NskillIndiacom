"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Calendar, Newspaper } from "lucide-react";

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
 
    const [news, setNews] = useState<NewsItem[]>([]);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/settings/news`)
            .then((res) => res.json())
            .then((data) => {
                const fetchedNews = Array.isArray(data) ? data : [];
                setNews(fetchedNews);
            })
            .catch(() => setNews([]));
    }, []);

    if (news.length === 0) {
        return (
            <section className="py-20 bg-slate-50/50" ref={ref}>
                <div className="container mx-auto px-4 text-center opacity-60">
                    <Newspaper className="w-12 h-12 text-blue-400 mb-4 mx-auto" />
                    <p className="text-slate-600 font-medium">No latest news available right now.</p>
                </div>
            </section>
        );
    }

    return (
        <section className="py-24 bg-slate-50/50 overflow-hidden" ref={ref}>
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight uppercase">
                        <span className="text-blue-600">Latest</span> <span className="text-red-600">News</span>
                    </h2>
                    <div className="w-24 h-1.5 bg-blue-600 mx-auto rounded-full" />
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
                            animation: marquee-news-fixed ${news.length * 8}s linear infinite;
                        }
                        .animate-news-loop:hover {
                            animation-play-state: paused;
                        }
                    `}} />
                    
                    <div className="animate-news-loop gap-8 py-8">
                        {/* Render items twice for seamless loop */}
                        {[...news, ...news].map((item, i) => (
                            <div
                                key={`${item.id}-${i}`}
                                className="w-[320px] md:w-[400px] flex-shrink-0 bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 group cursor-pointer"
                            >
                                <div className="relative h-64 overflow-hidden bg-slate-100">
                                    <img
                                        src={item.image_url}
                                        alt={item.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <div className="absolute top-6 left-6 bg-blue-600 text-white text-[10px] font-black px-4 py-2 rounded-full flex items-center gap-2 shadow-lg uppercase tracking-widest">
                                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                        Update
                                    </div>
                                </div>
                                <div className="p-8">
                                    <div className="flex items-center gap-2 text-blue-600 mb-4">
                                        <Calendar className="w-4 h-4" />
                                        <span className="text-[11px] font-black uppercase tracking-widest">
                                            {new Date(item.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-black text-slate-800 mb-4 leading-tight group-hover:text-blue-600 transition-colors">
                                        {item.title}
                                    </h3>
                                    <p className="text-slate-500 text-sm leading-relaxed font-medium">
                                        {item.content}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default LatestNewsSection;
