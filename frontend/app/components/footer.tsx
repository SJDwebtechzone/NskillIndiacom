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
    <footer className="bg-[#0b1f3a] text-white pt-16 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-12 mb-16">

          {/* ── Column 1: Company & Social ── */}
          <div className="space-y-8">
            <Link href="/" className="inline-block">
              <Image
                src="/footer-logo.png"
                alt="Niile Logo"
                width={266}
                height={48}
                className="object-contain h-[48px] w-auto"
                style={{ width: 'auto', height: '48px' }}
              />
            </Link>

            <div className="space-y-4 text-[14px] text-white/90 leading-relaxed">
              <p className="text-gray-100">{contactInfo.address}</p>
              <div className="space-y-3">
                {contactInfo.phones.map((phone: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[#fe2b54]">
                      <Phone size={14} />
                    </div>
                    <span className="text-white font-medium">{phone.value}</span>
                  </div>
                ))}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[#fe2b54]">
                    <Mail size={14} />
                  </div>
                  <span className="text-white font-medium">{contactInfo.email}</span>
                </div>
              </div>
            </div>

            {/* Social Icons integrated here */}
            <div className="flex gap-3 pt-4">
              {[
                { key: "facebook", Icon: Facebook, url: socialLinks?.facebook_url || "https://www.facebook.com/share/1DzjthRWd6/" },
                { key: "instagram", Icon: Instagram, url: socialLinks?.instagram_url || "https://www.instagram.com/niile_technical_skill_25/" },
                { key: "linkedin", Icon: Linkedin, url: socialLinks?.linkedin_url || "https://www.linkedin.com/in/niile-technical-skill-and-consulting-a26245198/" },
              ].map(({ key, Icon, url }) => (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-[#fe2b54] transition-all duration-300"
                >
                  <Icon size={18} />
                </a>
              ))}
              <a
                href={socialLinks?.twitter_url || "https://x.com/NiileSkill"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-[#fe2b54] transition-all duration-300"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* ── Column 2: Skill Training ── */}
          <div>
            <h3 className="text-white font-bold text-[18px] mb-8 relative inline-block">
              Skill Training
              <span className="absolute -bottom-2 left-0 w-8 h-1 bg-[#fe2b54] rounded-full"></span>
            </h3>
            <ul className="space-y-4">
              {SKILL_CATEGORIES.map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/courses?category=${toSlug(cat)}`}
                    className="text-[14px] text-white hover:text-[#fe2b54] transition-colors flex items-center gap-2 group font-medium"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white/30 group-hover:bg-[#fe2b54] transition-colors"></span>
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Column 3: Quick Links ── */}
          <div>
            <h3 className="text-white font-bold text-[18px] mb-8 relative inline-block">
              Quick Links
              <span className="absolute -bottom-2 left-0 w-8 h-1 bg-[#fe2b54] rounded-full"></span>
            </h3>
            <ul className="space-y-4">
              {[
                { name: "Home", href: "/" },
                { name: "All Courses", href: "/courses" },
                { name: "Course Calendar", href: "/course_calender" },
                { name: "Placements", href: "/placements/profile" },
                { name: "Recommended jobs", href: "/placements/recommended-jobs" },
                { name: "Infrastructure", href: "/infrastructure" },
                { name: "Contact Us", href: "/contact" },
                { name: "Blogs", href: "/blog" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-[14px] text-white hover:text-[#fe2b54] transition-colors flex items-center gap-2 group font-medium"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white/30 group-hover:bg-[#fe2b54] transition-colors"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Column 4: Newsletter ── */}
          <div className="space-y-8">
            <div>
              <h3 className="text-white font-bold text-[18px] mb-8 relative inline-block">
                Newsletter
                <span className="absolute -bottom-2 left-0 w-8 h-1 bg-[#fe2b54] rounded-full"></span>
              </h3>
              <p className="text-[14px] text-white mb-6 leading-relaxed font-medium">
                Stay updated with our latest courses and industrial training insights.
              </p>
              <div className="space-y-3">
                <div className="relative group">
                  <input
                    type="email"
                    placeholder="Your Email"
                    className="w-full h-14 bg-white/10 border border-white/20 rounded-xl px-5 text-white text-[14px] focus:outline-none focus:border-[#fe2b54]/50 transition-all placeholder:text-white/40"
                  />
                </div>
                <button className="w-full h-12 bg-[#fe2b54] hover:bg-[#e0244a] text-white rounded-xl font-black text-[12px] uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center shadow-xl shadow-[#fe2b54]/10">
                  Join Now
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* ── Bottom bar ── */}
        <div className="py-8 border-t border-white/10 text-center text-[14px] text-white font-medium">
          Copyright © {currentYear} All rights reserved | by{" "}
          <a
            href="https://devspectra.in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-[#fe2b54] transition-colors"
          >
            DevSpectra
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
