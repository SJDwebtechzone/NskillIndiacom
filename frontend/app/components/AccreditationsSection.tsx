"use client";
import { motion } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import axios from "axios";

interface Accreditation {
    id: number;
    title: string;
    image_url: string;
}

const AccreditationsSection = () => {
    const ref = useRef(null);
    const [accreditations, setAccreditations] = useState<Accreditation[]>([]);

    useEffect(() => {
        const fetchAccreditations = async () => {
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/settings/accreditations`);
                setAccreditations(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchAccreditations();
    }, []);

    if (accreditations.length === 0) return null;

    return (
        <section className="py-20 bg-background" ref={ref}>
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl md:text-4xl font-black text-[#0b1f3a] mb-6 tracking-tight uppercase">Accreditations</h2>
                    <div className="w-24 h-1.5 bg-blue-600 mx-auto rounded-full" />
                </motion.div>
            </div>

            {/* Auto-scrolling marquee */}
            <div className="overflow-hidden w-full relative">
                <style dangerouslySetInnerHTML={{
                    __html: `
                    @keyframes marquee {
                        0% { transform: translateX(0%); }
                        100% { transform: translateX(-50%); }
                    }
                    .animate-marquee-custom {
                        animation: marquee 20s linear infinite;
                        width: max-content;
                        display: flex;
                    }
                    .animate-marquee-custom:hover {
                        animation-play-state: paused;
                    }
                `}} />
             <div className="animate-marquee-custom py-4 px-3" style={{ gap: "24px" }}>
                    {[...accreditations, ...accreditations].map((accreditation, i) => (
                        <div
                            key={i}
                            className="flex-shrink-0 w-40 h-24 bg-card rounded-lg shadow-md flex items-center justify-center p-3 hover:shadow-xl hover:scale-110 transition-all duration-300 cursor-pointer border border-slate-100"
                        >
                            <img src={accreditation.image_url} alt={accreditation.title} className="max-w-full max-h-full object-contain" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default AccreditationsSection;
