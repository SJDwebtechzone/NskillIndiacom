"use client";

import React from "react";
import {
  GraduationCap,
  Wrench,
  Building2,
  Award,
  Briefcase,
  Wallet,
} from "lucide-react";

/*
const reasons = [
  "India's first technical school offering career course with state-of-art training facility",
  "Center and State Government approved certification",
  "Govt approved employment registered certificate",
  "100% practical & industrial oriented training",
  "100% placement guidance & Assurance",
  "Multinational experienced faculties",
  "Effective communication in English & Hindi",
  "Career guidance and motivation classes",
  "Online interactions with industrial experts",
  "Individual student practical training",
  "International valid certification",
];
*/

const WHY_CHOOSE_ITEMS = [
  {
    title: "Expert Faculty",
    desc: "Learn from experienced industry professionals.",
    icon: GraduationCap,
  },
  {
    title: "Practical Training",
    desc: "Hands-on practical in modern workshops.",
    icon: Wrench,
  },
  {
    title: "Industry-Oriented",
    desc: "Curriculum designed as per industry standards.",
    icon: Building2,
  },
  {
    title: "Certification",
    desc: "Get recognized course completion certificates.",
    icon: Award,
  },
  {
    title: "Placement Support",
    desc: "100% placement assistance for eligible candidates.",
    icon: Briefcase,
  },
  {
    title: "Affordable Fees",
    desc: "Quality training at affordable fees.",
    icon: Wallet,
  },
];

const WhyUsSection = () => {
  return (
    <section className="py-14 md:py-18 bg-white relative overflow-hidden">
      <div className="mx-auto max-w-[1440px] px-4 md:px-8 lg:px-12">
        <p className="text-[#f97316] font-extrabold text-xs sm:text-sm tracking-wider uppercase mb-1">
          WHY CHOOSE N-SKILL
        </p>
        <h2 className="text-2xl sm:text-3xl font-black text-[#0b1f3a] tracking-tight mb-8">
          We Provide The Best Training Experience
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {WHY_CHOOSE_ITEMS.map((item, idx) => {
            const IconComp = item.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-md hover:border-[#0b1f3a] transition-all flex flex-col justify-between group"
              >
                <div className="w-11 h-11 rounded-xl bg-blue-50/80 border border-blue-100 flex items-center justify-center text-[#1e40af] mb-4 group-hover:bg-[#1e40af] group-hover:text-white transition-all shrink-0">
                  <IconComp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#0b1f3a] mb-1.5 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyUsSection;