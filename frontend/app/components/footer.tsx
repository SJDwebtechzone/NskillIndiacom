"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  Phone,
} from "lucide-react";
import { contactInfo } from "@/data/contactInfo";

interface ContactLocation {
  facebook_url: string;
  twitter_url: string;
  instagram_url: string;
  linkedin_url: string;
}

const SKILL_CATEGORIES = [
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

function toSlug(str: string) {
  return str.toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const Footer = () => {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();
  const [socialLinks, setSocialLinks] = useState<ContactLocation | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/settings/locations`)
      .then(r => r.json())
      .then(data => {
        const primary = data.find((loc: any) => loc.is_primary) || data[0];
        if (primary) setSocialLinks(primary);
      })
      .catch(() => { });
  }, []);

  if (pathname?.startsWith("/login") || pathname?.startsWith("/dashboard")) {
    return null;
  }

  return (
    <footer className="bg-[#f0f6ff] text-[#0b1f3a] pt-16 relative overflow-hidden font-sans">
      {/* Background Dots */}
      <div className="absolute top-0 right-0 w-80 h-80 opacity-40 bg-[radial-gradient(#cbd5e1_2px,transparent_2px)] [background-size:24px_24px] rounded-full blur-[1px] pointer-events-none"></div>
      <div className="absolute bottom-10 left-0 w-80 h-80 opacity-40 bg-[radial-gradient(#cbd5e1_2px,transparent_2px)] [background-size:24px_24px] rounded-full blur-[1px] pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-12 mb-16">

          {/* ── Column 1: Company & Social ── */}
          <div className="space-y-8">
            <Link href="/" className="inline-block">
              <Image
                src="/logo.png"
                alt="Niile Logo"
                width={266}
                height={60}
                className="object-contain h-[80px] w-auto"
                style={{ width: 'auto', height: '80px' }}
              />
            </Link>

            <div className="space-y-6 text-base md:text-lg text-slate-700 leading-relaxed font-bold">
              <p className="max-w-[320px]">{contactInfo.address}</p>
              <div className="space-y-4">
                {contactInfo.phones.map((phone: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3.5">
                    <Phone size={20} className="text-orange-500 shrink-0" strokeWidth={2.5} />
                    <span>{phone.value}</span>
                  </div>
                ))}
                <div className="flex items-center gap-3.5">
                  <Mail size={20} className="text-orange-500 shrink-0" strokeWidth={2.5} />
                  <span className="break-all">{contactInfo.email}</span>
                </div>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex gap-4 pt-2">
              <a
                href={socialLinks?.facebook_url || "https://www.facebook.com/share/1DzjthRWd6/"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 bg-[#1877F2] rounded-xl flex items-center justify-center text-white hover:-translate-y-1 shadow-md shadow-[#1877F2]/30 transition-all duration-300"
              >
                <Facebook size={22} fill="currentColor" strokeWidth={0} />
              </a>
              <a
                href={socialLinks?.instagram_url || "https://www.instagram.com/niile_technical_skill_25/"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] rounded-xl flex items-center justify-center text-white hover:-translate-y-1 shadow-md shadow-[#ee2a7b]/30 transition-all duration-300"
              >
                <Instagram size={22} strokeWidth={2} />
              </a>
              <a
                href={socialLinks?.linkedin_url || "https://www.linkedin.com/in/niile-technical-skill-and-consulting-a26245198/"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 bg-[#0077B5] rounded-xl flex items-center justify-center text-white hover:-translate-y-1 shadow-md shadow-[#0077B5]/30 transition-all duration-300"
              >
                <Linkedin size={22} fill="currentColor" strokeWidth={0} />
              </a>
              <a
                href={socialLinks?.twitter_url || "https://x.com/NiileSkill"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 bg-[#ff8a00] rounded-xl flex items-center justify-center text-white hover:-translate-y-1 shadow-md shadow-[#ff8a00]/30 transition-all duration-300"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5.5 h-5.5">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* ── Column 2: Skill Training ── */}
          <div className="lg:pl-6">
            <div className="text-[#2563eb] font-extrabold text-2xl mb-8 relative inline-block" style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.01em', textTransform: 'none' }}>
              Skill Training
              <span className="absolute -bottom-2 left-0 w-10 h-1 bg-blue-600 rounded-full"></span>
            </div>
            <ul className="space-y-4">
              {SKILL_CATEGORIES.map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/courses?category=${toSlug(cat)}`}
                    className="text-base md:text-lg text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-3.5 font-bold group"
                  >
                    <span className="text-[24px] leading-none text-slate-400 group-hover:text-blue-600 transition-colors">•</span>
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Column 3: Quick Links ── */}
          <div>
            <div className="text-[#2563eb] font-extrabold text-2xl mb-8 relative inline-block" style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.01em', textTransform: 'none' }}>
              Quick Links
              <span className="absolute -bottom-2 left-0 w-10 h-1 bg-blue-600 rounded-full"></span>
            </div>
            <ul className="space-y-4">
              {[
                { name: "Home", href: "/" },
                { name: "All Courses", href: "/courses" },
                { name: "Course Calendar", href: "/course_calender" },
                { name: "Placements", href: "/placements" },
                { name: "Recommended Jobs", href: "/placements/recommended-jobs" },
                { name: "Infrastructure", href: "/infrastructure" },
                { name: "Contact Us", href: "/contact" },
                { name: "Blogs", href: "/blog" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-base md:text-lg text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-3.5 font-bold group"
                  >
                    <span className="text-slate-400 text-[24px] leading-none group-hover:text-blue-600 transition-colors">•</span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Column 4: Newsletter ── */}
          <div className="space-y-6">
            <div>
              <div className="text-[#2563eb] font-extrabold text-2xl mb-8 relative inline-block" style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.01em', textTransform: 'none' }}>
                Newsletter
                <span className="absolute -bottom-2 left-0 w-10 h-1 bg-blue-600 rounded-full"></span>
              </div>
              <p className="text-base md:text-lg text-slate-600 mb-6 leading-relaxed font-bold">
                Stay updated with our latest courses and industrial training insights.
              </p>
              <div className="relative z-10 w-full max-w-sm">
                <div className="relative flex items-center">
                  <input
                    type="email"
                    placeholder="Your Email"
                    className="w-full h-14 bg-white border border-slate-200/80 rounded-xl pl-5 pr-32 text-slate-800 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all font-semibold"
                  />
                  <button className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-[#2563eb] hover:bg-blue-700 text-white rounded-lg font-black text-sm uppercase tracking-wider transition-all shadow-md active:scale-[0.98] flex items-center justify-center">
                    JOIN NOW
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Bottom Wave ── */}
      <div className="relative w-full h-[80px] md:h-[140px] pointer-events-none overflow-hidden leading-none -mt-10 md:-mt-20">
        {/* Wave Layer 1 */}
        <motion.svg
          className="absolute inset-0 w-[200%] h-full"
          viewBox="0 0 2400 320"
          fill="none"
          preserveAspectRatio="none"
          animate={{
            x: [0, "-50%"],
            y: [0, -15, 0]
          }}
          transition={{
            x: { repeat: Infinity, ease: "linear", duration: 28 },
            y: { repeat: Infinity, ease: "easeInOut", duration: 8 }
          }}
        >
          <path
            fill="#60a5fa"
            fillOpacity="0.45"
            d="M0,80 C300,180 900,20 1200,80 C1500,180 2100,20 2400,80 L2400,320 L0,320 Z"
          />
        </motion.svg>

        {/* Wave Layer 2 */}
        <motion.svg
          className="absolute inset-0 w-[200%] h-full"
          viewBox="0 0 2000 320"
          fill="none"
          preserveAspectRatio="none"
          animate={{
            x: ["-50%", 0],
            y: [-12, 10, -12]
          }}
          transition={{
            x: { repeat: Infinity, ease: "linear", duration: 20 },
            y: { repeat: Infinity, ease: "easeInOut", duration: 6 }
          }}
        >
          <path
            fill="#3b82f6"
            fillOpacity="0.55"
            d="M0,110 C250,210 750,40 1000,110 C1250,210 1750,40 2000,110 L2000,320 L0,320 Z"
          />
        </motion.svg>

        {/* Wave Layer 3 */}
        <motion.svg
          className="absolute inset-0 w-[200%] h-full"
          viewBox="0 0 1600 320"
          fill="none"
          preserveAspectRatio="none"
          animate={{
            x: [0, "-50%"],
            y: [0, -10, 0]
          }}
          transition={{
            x: { repeat: Infinity, ease: "linear", duration: 14 },
            y: { repeat: Infinity, ease: "easeInOut", duration: 5 }
          }}
        >
          <path
            fill="#2563eb"
            fillOpacity="0.65"
            d="M0,140 C200,230 600,70 800,140 C1000,230 1400,70 1600,140 L1600,320 L0,320 Z"
          />
        </motion.svg>

        {/* Wave Layer 4 (Solid connection wave) */}
        <motion.svg
          className="absolute inset-0 w-[200%] h-full"
          viewBox="0 0 1600 320"
          fill="none"
          preserveAspectRatio="none"
          animate={{
            x: ["-50%", 0],
            y: [-8, 8, -8]
          }}
          transition={{
            x: { repeat: Infinity, ease: "linear", duration: 22 },
            y: { repeat: Infinity, ease: "easeInOut", duration: 7 }
          }}
        >
          <path
            fill="#1d4ed8"
            fillOpacity="1"
            d="M0,160 C200,245 600,85 800,160 C1000,245 1400,85 1600,160 L1600,320 L0,320 Z"
          />
        </motion.svg>
      </div>
      
      {/* ── Bottom bar ── */}
      <div className="bg-[#1d4ed8] pt-1 pb-4 text-center text-sm sm:text-base text-white font-bold">
        Copyright © {currentYear} All rights reserved | by{" "}
        <a
          href="https://devspectra.in"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-100 hover:text-orange-300 transition-colors font-bold tracking-wide"
        >
          DevSpectra
        </a>
      </div>
    </footer>
  );
};

export default Footer;

