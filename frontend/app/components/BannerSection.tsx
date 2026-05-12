"use client";

import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/settings`;

interface Banner {
    id: number;
    image_url: string;
    title: string;
    is_active: boolean;
}

export default function BannerSection() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [loading, setLoading] = useState(true);

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

    if (loading) {
        return (
            <div className="w-full h-[400px] md:h-[600px] bg-gray-100 animate-pulse flex items-center justify-center">
                <span className="text-gray-400 font-bold">Loading Banners...</span>
            </div>
        );
    }

    if (banners.length === 0) {
        return (
            <div className="w-full h-[200px] bg-blue-50 border-2 border-dashed border-blue-200 flex flex-col items-center justify-center p-6 text-center">
                <p className="text-blue-600 font-bold text-lg mb-2">Welcome to NSkill India</p>
                <p className="text-gray-500">Please add and activate banners from the Dashboard Settings to see them here.</p>
            </div>
        );
    }

    return (
        <div className="relative w-full overflow-hidden group bg-white border-b-[6px] border-[#2f55e4] shadow-sm">
            <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
                {banners.map((banner) => (
                    <div key={banner.id} className="min-w-full relative h-[400px] md:h-[600px]">
                        <img
                            src={banner.image_url}
                            alt={banner.title}
                            className="w-full h-full object-fill"
                            onError={(e) => {
                                console.error("Image failed to load:", banner.image_url);
                                (e.target as HTMLImageElement).src = "https://via.placeholder.com/1920x1080?text=Banner+Image+Not+Found";
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* Navigation Indicators */}
            {banners.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-10">
                    {banners.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setActiveIndex(i)}
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${activeIndex === i ? "bg-white scale-125 shadow-lg" : "bg-white/30 hover:bg-white/50"
                                }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
