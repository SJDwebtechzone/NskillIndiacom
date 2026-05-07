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
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/settings/news`)
            .then((res) => res.json())
            .then((data) => setNews(Array.isArray(data) ? data : []))
            .catch(() => setNews([]));
    }, []);

    // Removed interval-based manual scrolling in favor of CSS marquee

    if (news.length === 0) {
        return (
            <section className="py-20 bg-muted/50" ref={ref}>
                <div className="container mx-auto px-4 text-center opacity-60">
                    <Newspaper className="w-12 h-12 text-blue-400 mb-4 mx-auto" />
                    <p className="text-slate-600 font-medium">No latest news available right now.</p>
                </div>
            </section>
        );
    }

    return (
        <section className="py-20 bg-muted/50" ref={ref}>
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl md:text-4xl font-black text-[#0b1f3a] mb-6 tracking-tight uppercase">
                        Latest News
                    </h2>
                    <div className="w-24 h-1.5 bg-blue-600 mx-auto rounded-full" />
                </motion.div>

                <div className="overflow-hidden w-full relative">
                    <style dangerouslySetInnerHTML={{
                        __html: `
                        @keyframes marquee-news {
                            0% { transform: translateX(0%); }
                            100% { transform: translateX(-50%); }
                        }
                        .animate-marquee-news {
                            animation: marquee-news 40s linear infinite;
                            width: max-content;
                            display: flex;
                        }
                        .animate-marquee-news:hover {
                            animation-play-state: paused;
                        }
                    `}} />
                  <div className="animate-marquee-news py-4 px-3" style={{ gap: "24px" }}>
                        {[...news, ...news].map((item, i) => (
                            <div
                                key={`${item.id}-${i}`}
                                className="w-[300px] md:w-[350px] flex-shrink-0 bg-card rounded-xl overflow-hidden shadow-lg group hover:shadow-2xl transition-all duration-500"
                            >
                                <div className="relative h-48 overflow-hidden bg-slate-50 flex items-center justify-center">
                                    <img
                                        src={item.image_url}
                                        alt={item.title}
                                        className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute top-3 left-3 bg-secondary text-secondary-foreground text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                                        <Calendar className="w-3 h-3" /> New
                                    </div>
                                </div>
                                <div className="p-5">
                                    <h3 className="font-heading text-xl font-bold text-primary mb-2 group-hover:text-secondary transition-colors">
                                        {item.title}
                                    </h3>
                                    <p className="text-muted-foreground text-sm">
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
