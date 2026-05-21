"use client";

import { useState, useEffect } from "react";
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
                className="object-contain h-[70px] w-auto"
                style={{ width: 'auto', height: '70px' }}
              />
            </Link>

            <div className="space-y-5 text-[15px] text-slate-700 leading-relaxed font-semibold">
              <p className="max-w-[280px]">{contactInfo.address}</p>
              <div className="space-y-4">
                {contactInfo.phones.map((phone: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3">
                    <Phone size={18} className="text-orange-500 shrink-0" strokeWidth={2.5} />
                    <span>{phone.value}</span>
                  </div>
                ))}
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-orange-500 shrink-0" strokeWidth={2.5} />
                  <span>{contactInfo.email}</span>
                </div>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex gap-4 pt-2">
              <a
                href={socialLinks?.facebook_url || "https://www.facebook.com/share/1DzjthRWd6/"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-[#1877F2] rounded-xl flex items-center justify-center text-white hover:-translate-y-1 shadow-md shadow-[#1877F2]/30 transition-all duration-300"
              >
                <Facebook size={20} fill="currentColor" strokeWidth={0} />
              </a>
              <a
                href={socialLinks?.instagram_url || "https://www.instagram.com/niile_technical_skill_25/"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] rounded-xl flex items-center justify-center text-white hover:-translate-y-1 shadow-md shadow-[#ee2a7b]/30 transition-all duration-300"
              >
                <Instagram size={20} strokeWidth={2} />
              </a>
              <a
                href={socialLinks?.linkedin_url || "https://www.linkedin.com/in/niile-technical-skill-and-consulting-a26245198/"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-[#0077B5] rounded-xl flex items-center justify-center text-white hover:-translate-y-1 shadow-md shadow-[#0077B5]/30 transition-all duration-300"
              >
                <Linkedin size={20} fill="currentColor" strokeWidth={0} />
              </a>
              <a
                href={socialLinks?.twitter_url || "https://x.com/NiileSkill"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-[#ff8a00] rounded-xl flex items-center justify-center text-white hover:-translate-y-1 shadow-md shadow-[#ff8a00]/30 transition-all duration-300"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* ── Column 2: Skill Training ── */}
          <div className="lg:pl-6">
            <h3 className="text-[#0b1f3a] font-extrabold text-xl mb-8 relative inline-block">
              Skill Training
              <span className="absolute -bottom-2 left-0 w-8 h-1 bg-blue-600 rounded-full"></span>
            </h3>
            <ul className="space-y-4">
              {SKILL_CATEGORIES.map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/courses?category=${toSlug(cat)}`}
                    className="text-[15px] text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-3 font-bold group"
                  >
                    <span className="text-[20px] leading-none text-slate-400 group-hover:text-blue-600 transition-colors">•</span>
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Column 3: Quick Links ── */}
          <div>
            <h3 className="text-[#0b1f3a] font-extrabold text-xl mb-8 relative inline-block">
              Quick Links
              <span className="absolute -bottom-2 left-0 w-8 h-1 bg-blue-600 rounded-full"></span>
            </h3>
            <ul className="space-y-4">
              {[
                { name: "Home", href: "/" },
                { name: "All Courses", href: "/courses" },
                { name: "Course Calendar", href: "/course_calender" },
                { name: "Placements", href: "/placements/profile" },
                { name: "Recommended Jobs", href: "/placements/recommended-jobs" },
                { name: "Infrastructure", href: "/infrastructure" },
                { name: "Contact Us", href: "/contact" },
                { name: "Blogs", href: "/blog" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-[15px] text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-3 font-bold"
                  >
                    <span className="text-slate-400 text-[20px] leading-none">•</span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Column 4: Newsletter ── */}
          <div className="space-y-6">
            <div>
              <h3 className="text-[#0b1f3a] font-extrabold text-xl mb-8 relative inline-block">
                Newsletter
                <span className="absolute -bottom-2 left-0 w-8 h-1 bg-blue-600 rounded-full"></span>
              </h3>
              <p className="text-[15px] text-slate-600 mb-6 leading-relaxed font-bold">
                Stay updated with our latest courses and industrial training insights.
              </p>
              <div className="space-y-4 relative z-10">
                <input
                  type="email"
                  placeholder="Your Email"
                  className="w-full h-12 bg-white border-none rounded-lg px-5 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
                />
                <button className="w-full h-12 bg-[#2563eb] hover:bg-blue-700 text-white rounded-lg font-bold text-sm uppercase tracking-wide transition-all shadow-md active:scale-[0.98]">
                  JOIN NOW
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Bottom Wave ── */}
      <div className="w-full pointer-events-none overflow-hidden leading-none -mt-8 md:-mt-16">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-[60px] md:h-[110px] block" preserveAspectRatio="none">
          <path fill="#e0e7ff" fillOpacity="0.8" d="M0,160L60,176C120,192,240,224,360,208C480,192,600,128,720,101.3C840,75,960,85,1080,101.3C1200,117,1320,139,1380,149.3L1440,160L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
          <path fill="#3b82f6" fillOpacity="0.5" d="M0,96L60,122.7C120,149,240,203,360,202.7C480,203,600,149,720,133.3C840,117,960,139,1080,149.3C1200,160,1320,160,1380,160L1440,160L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
          <path fill="#2563eb" fillOpacity="1" d="M0,288L60,277.3C120,267,240,245,360,224C480,203,600,181,720,186.7C840,192,960,224,1080,229.3C1200,235,1320,213,1380,202.7L1440,192L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
        </svg>
      </div>
      
      {/* ── Bottom bar ── */}
      <div className="bg-[#2563eb] pt-1 pb-4 text-center text-[14px] text-white/90 font-medium">
        Copyright © {currentYear} All rights reserved | by{" "}
        <a
          href="https://devspectra.in"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white hover:text-orange-300 transition-colors font-bold tracking-wide"
        >
          DevSpectra
        </a>
      </div>
    </footer>
  );
};

export default Footer;

