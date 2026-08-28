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
  MapPin,
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
    <footer className="bg-[#061f4d] text-white pt-8 md:pt-10 relative overflow-hidden font-sans">
      {/* Background Dots */}
      <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.025),transparent_45%)] pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-x-8 gap-y-8 mb-8">

          {/* ── Column 1: Company & Social ── */}
          <div className="space-y-5">
            <Link href="/" className="inline-block">
              <Image
                src="/logo.png"
                alt="Niile Logo"
                width={266}
                height={60}
                className="object-contain h-[58px] w-auto"
                style={{ width: 'auto', height: '58px' }}
              />
            </Link>

            <p className="max-w-[285px] text-sm leading-relaxed text-white/80">N-Skill Technical Skill &amp; Consulting is committed to providing industry-oriented training with practical knowledge and placement support.</p>

            {/* Social Icons */}
            <div className="flex gap-3 pt-1">
              <a
                href={socialLinks?.facebook_url || "https://www.facebook.com/share/1DzjthRWd6/"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-orange-500 transition-all duration-300"
              >
                <Facebook size={22} fill="currentColor" strokeWidth={0} />
              </a>
              <a
                href={socialLinks?.instagram_url || "https://www.instagram.com/niile_technical_skill_25/"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-orange-500 transition-all duration-300"
              >
                <Instagram size={22} strokeWidth={2} />
              </a>
              <a
                href={socialLinks?.linkedin_url || "https://www.linkedin.com/in/niile-technical-skill-and-consulting-a26245198/"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-orange-500 transition-all duration-300"
              >
                <Linkedin size={22} fill="currentColor" strokeWidth={0} />
              </a>
              <a
                href={socialLinks?.twitter_url || "https://x.com/NiileSkill"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-orange-500 transition-all duration-300"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5.5 h-5.5">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* ── Column 2: Skill Training ── */}
          <div className="border-l border-white/15 pl-6">
            <div className="text-white font-extrabold text-base mb-4 uppercase" style={{ fontFamily: 'var(--font-heading)' }}>
              Quick Links
            </div>
            <ul className="space-y-1.5">
              {[{ name: "Home", href: "https://nskillindia.in/" }, { name: "All Courses", href: "https://nskillindia.in/courses" }, { name: "Course Calendar", href: "https://nskillindia.in/course_calender" }, { name: "Placements", href: "https://nskillindia.in/placements" }, { name: "Recommended Jobs", href: "https://nskillindia.in/placements/recommended-jobs" }, { name: "Infrastructure", href: "https://nskillindia.in/infrastructure" }, { name: "Contact Us", href: "https://nskillindia.in/contact" }, { name: "Blogs", href: "https://nskillindia.in/blog" }].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/75 hover:text-orange-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Column 3: Quick Links ── */}
          <div className="border-l border-white/15 pl-6">
            <div className="text-white font-extrabold text-base mb-4 uppercase" style={{ fontFamily: 'var(--font-heading)' }}>
              Popular Courses
            </div>
            <ul className="space-y-1.5">
              {["HVAC Engineer", "Industrial Electrician", "6G Welding Training", "Quality Inspector", "Plumbing Technician", "MEP Technician"].map((course) => (
                <li key={course}>
                  <Link
                    href="/courses"
                    className="text-sm text-white/75 hover:text-orange-400 transition-colors"
                  >
                    {course}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Column 4: Contact & Location ── */}
          <div className="border-l border-white/15 pl-6 grid grid-cols-1 gap-5">
            <div>
              <div className="text-white font-extrabold text-base mb-4 uppercase" style={{ fontFamily: 'var(--font-heading)' }}>Contact Us</div>
              <div className="space-y-2 text-sm text-white/80">
                {contactInfo.phones.map((phone: any) => (
                  <a key={phone.value} href={phone.link} className="flex items-center gap-3 hover:text-orange-400 transition-colors"><Phone size={17} />{phone.value}</a>
                ))}
                <a href={`mailto:${contactInfo.email}`} className="flex items-center gap-3 hover:text-orange-400 transition-colors"><Mail size={17} />{contactInfo.email}</a>
                <div className="flex items-start gap-3 leading-relaxed"><MapPin size={19} className="shrink-0" />{contactInfo.address}</div>
              </div>
            </div>
          </div>

          {/* ── Column 5: Location ── */}
          <div className="border-l border-white/15 pl-6">
            <div className="text-white font-extrabold text-base mb-4 uppercase" style={{ fontFamily: 'var(--font-heading)' }}>Our Location</div>
            <div className="h-28 overflow-hidden rounded-md bg-white">
              <iframe src={contactInfo.mapEmbedUrl} title="N-Skill location map" className="h-full w-full border-0" loading="lazy" />
            </div>
            <a href={contactInfo.mapEmbedUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm font-semibold text-white hover:text-orange-400 transition-colors">View on Google Maps <span aria-hidden="true">→</span></a>
          </div>

        </div>
      </div>

      {/* ── Bottom Wave ── */}
      <div className="hidden">
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
      <div className="mx-6 border-t border-white/15 py-4 text-sm text-white/75">
        <div className="max-w-7xl mx-auto flex justify-center text-center">
          <span>© {currentYear} Devspectra. All Rights Reserved.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

