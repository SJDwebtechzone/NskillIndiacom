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
  const pathname    = usePathname();
  const currentYear = new Date().getFullYear();
  const [socialLinks, setSocialLinks] = useState<ContactLocation | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/settings/locations`)
      .then(r => r.json())
      .then(data => {
        const primary = data.find((loc: any) => loc.is_primary) || data[0];
        if (primary) setSocialLinks(primary);
      })
      .catch(() => {});
  }, []);

  if (pathname?.startsWith("/login") || pathname?.startsWith("/dashboard")) {
    return null;
  }

  return (
    <footer className="bg-[#0b1f3a] text-white font-sans">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10 mb-16">

          {/* ── Company Info ── */}
          <div className="space-y-6">
            <Link href="/" className="inline-block">
              <Image
                src="/footer-logo.png"
                alt="Niile Logo"
                width={200}
                height={60}
                className="object-contain h-12 md:h-14 w-auto"
              />
            </Link>

            <div className="space-y-4 text-[13px] leading-relaxed">
              <p>{contactInfo.address}</p>
              <div className="space-y-2">
                {contactInfo.phones.map((phone: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Phone size={14} className="text-[#fe2b54]" />
                    <span>{phone.value}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-[#fe2b54]" />
                  <span>{contactInfo.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Skill Training ── */}
          <div>
            <h3 className="text-white font-bold text-[17px] mb-8">
              Skill Training
            </h3>
            <ul className="space-y-0">
              {SKILL_CATEGORIES.map((cat) => (
                <li key={cat} className="border-b border-dotted border-gray-600/50">
                  <Link
                    href={`/courses?category=${toSlug(cat)}`}
                    className="block py-3 text-[14px] hover:text-white transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Quick Links ── */}
          <div>
            <h3 className="text-white font-bold text-[17px] mb-8">
              Quick Links
            </h3>
            <ul className="space-y-0">
              {[
                { name: "Home",            href: "/"                    },
                { name: "All Courses",     href: "/courses"             },
                { name: "Course Calendar", href: "/course_calender"     },
                { name: "Placements",      href: "/placements/register" },
                { name: "Infrastructure",  href: "/infrastructure"      },
                { name: "Contact Us",      href: "/contact"             },
              ].map((link) => (
                <li key={link.name} className="border-b border-dotted border-gray-600/50">
                  <Link
                    href={link.href}
                    className="block py-3 text-[14px] hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* ── Middle section ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 py-10 border-t border-gray-600/50">

          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-[15px]">Connect With Us</h3>
            <div className="flex gap-2">
              {[
                { key: "facebook",  Icon: Facebook,  url: socialLinks?.facebook_url  || "https://www.facebook.com/share/1DzjthRWd6/" },
                { key: "instagram", Icon: Instagram, url: socialLinks?.instagram_url || "https://www.instagram.com/niile_technical_skill_25/" },
                { key: "linkedin",  Icon: Linkedin,  url: socialLinks?.linkedin_url  || "https://www.linkedin.com/in/niile-technical-skill-and-consulting-a26245198/" },
              ].map(({ key, Icon, url }) => (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 border border-gray-600/50 flex items-center justify-center text-gray-400 hover:bg-[#fe2b54] hover:text-white hover:border-[#fe2b54] transition-all"
                >
                  <Icon size={16} />
                </a>
              ))}

              {/* X (Twitter) */}
              <a
                href={socialLinks?.twitter_url || "https://x.com/NiileSkill"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 border border-gray-600/50 flex items-center justify-center text-gray-400 hover:bg-[#fe2b54] hover:text-white hover:border-[#fe2b54] transition-all"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Subscribe */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-[15px]">Subscribe Us</h3>
            <div className="flex h-12 shadow-inner">
              <input
                type="email"
                placeholder="Your Email"
                className="flex-1 bg-white px-6 text-gray-800 text-sm focus:outline-none"
              />
              <button className="bg-[#fe2b54] hover:bg-[#e0244a] text-white px-8 font-bold text-sm transition-colors">
                Subscribe
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="bg-[#081728] py-8 text-center border-t border-gray-600/20">
        <div className="max-w-7xl mx-auto px-6 text-[14px] text-gray-500 font-medium">
          Copyright © {currentYear} All rights reserved | by{" "}
          <a
            href="https://devspectra.in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors"
          >
            DevSpectra
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
