"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import axios from "axios";
import { X } from "lucide-react";
import Image from "next/image";

export default function AdvertisementPopup() {
    const [ad, setAd] = useState<{ id: number; image: string } | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {

        // Only show on specific allowed pages
        const allowedPaths = [
            "/",
            "/corporate-training",
            "/consulting",
            "/course_calender",
            "/placements",
            "/infrastructure",
            "/contact"
        ];

        if (!pathname || !allowedPaths.includes(pathname)) {
            return;
        }

        const fetchActiveAd = async () => {
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/advertisements/active`);
                if (res.data && res.data.image) {
                    setAd(res.data);
                    // Slight delay for smooth entrance after page load
                    setTimeout(() => setIsVisible(true), 1000);
                }
            } catch (err: any) {
                if (err.response?.status !== 404) {
                    console.error("Error fetching active advertisement:", err);
                }
            }
        };

        fetchActiveAd();
    }, [pathname]);

    const closePopup = () => {
        setIsVisible(false);
    };

    const handleAdClick = () => {
        closePopup();
        router.push("/placements/register");
    };

    // Double check during render
        const allowedPaths = [
        "/",
        "/corporate-training",
        "/consulting",
        "/course_calender",
        "/placements",
        "/infrastructure",
        "/contact"
    ];
    if (!pathname || !allowedPaths.includes(pathname)) return null;

    if (!ad || !isVisible) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
            {/* Backdrop click to close */}
            <div className="absolute inset-0" onClick={closePopup} />

            {/* Modal Content */}
            <div 
                className="relative bg-transparent rounded-2xl overflow-hidden max-w-[90vw] md:max-w-2xl lg:max-w-3xl flex flex-col items-center justify-center animate-in zoom-in-95 fade-in duration-300"
                style={{ maxHeight: '85vh' }}
            >
                {/* Close Button */}
                <button
                    onClick={closePopup}
                    className="absolute top-3 right-3 z-10 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors"
                    aria-label="Close advertisement"
                >
                    <X size={24} />
                </button>

                {/* Advertisement Image */}
                <img
                    src={ad.image}
                    alt="Advertisement"
                    className="w-auto h-auto max-w-full max-h-[85vh] object-contain cursor-pointer shadow-2xl rounded-2xl hover:scale-[1.01] transition-transform duration-300"
                    onClick={handleAdClick}
                />
            </div>
        </div>
    );
}
