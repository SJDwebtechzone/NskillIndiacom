"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { Eye, Target, Heart, CheckCircle2 } from "lucide-react";

const tabs = [
  {
    id: "vision",
    icon: Eye,
    label: "Vision",
    image: "/images/about/Vision.jpeg",
    pill: "4 commitments",
    items: [
      "Align industry demand and workforce productivity with trainees' aspirations for sustainable livelihoods.",
      "Build capacity for skill development in critical un-organised sectors.",
      "Ensure high-quality options for long-term skilling.",
      "Support weaker sections through outreach programmes.",
    ],
  },
  {
    id: "mission",
    icon: Target,
    label: "Mission",
    image: "/images/about/Mission.jpeg",
    pill: "1 core statement",
    items: [
      "Prepare youth and companies to scale skill development with outcome-focused implementation.",
    ],
  },
  {
    id: "values",
    icon: Heart,
    label: "Core Values",
    image: "/images/about/Core-Value.JPG",
    pill: "4 principles",
    items: [
      "Continuous quality improvement.",
      "Data-driven innovation.",
      "Customer-first approach.",
      "Strong teamwork & partnerships.",
    ],
  },
];

const VisionSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeTab, setActiveTab] = useState("vision");

  const active = tabs.find((t) => t.id === activeTab)!;

  return (
    <section ref={ref} className="py-14 md:py-18 bg-white relative overflow-hidden">
      <div className="mx-auto max-w-[1440px] px-4 md:px-8 lg:px-12 relative z-10">

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0b1f3a] tracking-tight uppercase mb-3">
            VISION, MISSION &amp; VALUES
          </h2>
          <div className="w-16 h-1 bg-[#0b1f3a] mx-auto rounded-full" />
        </motion.div>

        {/* Card Container */}
        <div className="grid lg:grid-cols-12 overflow-hidden rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-200/90 bg-white">

          {/* ================= LEFT PANEL (Image side - clear & bright) ================= */}
          <div className="lg:col-span-5 relative bg-slate-900 min-h-[360px] lg:min-h-full overflow-hidden flex items-end p-8">

            {/* Tab Image with crossfade */}
            <AnimatePresence mode="wait">
              <motion.img
                key={active.id}
                src={active.image}
                alt={active.label}
                className="absolute inset-0 w-full h-full object-cover brightness-100"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1.0 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            </AnimatePresence>

            {/* Light bottom gradient only to make caption readable */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

            {/* Left panel caption */}
            <div className="relative z-10 text-white">
              <span className="inline-block px-3 py-1 rounded-full bg-[#f97316] text-white text-xs font-bold uppercase tracking-wider mb-2 shadow">
                {active.label}
              </span>
              <h3 className="text-2xl font-bold text-white mb-1 drop-shadow-sm">
                {active.label === "Vision" && "Our Future Vision"}
                {active.label === "Mission" && "Our Driving Mission"}
                {active.label === "Core Values" && "Our Foundation"}
              </h3>
              <p className="text-slate-100 text-xs md:text-sm font-medium drop-shadow-sm">
                {active.pill} shaping the future of technical skills.
              </p>
            </div>
          </div>

          {/* ================= RIGHT PANEL (7 cols) ================= */}
          <div className="lg:col-span-7 bg-white flex flex-col justify-between">

            {/* Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50/70">
              {tabs.map((tab) => {
                const TabIcon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-4 px-3 flex items-center justify-center gap-2 text-xs md:text-sm font-bold uppercase tracking-wider transition-all duration-200 relative ${
                      isActive
                        ? "text-[#0b1f3a] bg-white shadow-sm font-extrabold"
                        : "text-slate-500 hover:text-[#0b1f3a] hover:bg-slate-100/60"
                    }`}
                  >
                    <TabIcon className={`w-4 h-4 ${isActive ? "text-[#f97316]" : "text-slate-400"}`} />
                    <span>{tab.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeTabIndicator"
                        className="absolute bottom-0 left-0 right-0 h-1 bg-[#f97316]"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tab Body */}
            <div className="p-6 md:p-8 flex-1">

              {/* Heading + Icon */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#f97316] shadow-sm">
                  <active.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-[#0b1f3a]">
                    {active.label}
                  </h3>
                  <span className="text-xs font-semibold text-[#f97316] uppercase tracking-wider">
                    NTSC Strategy
                  </span>
                </div>
              </div>

              {/* Accent Line */}
              <div className="h-1 bg-slate-100 rounded-full mb-6 overflow-hidden">
                <motion.div
                  key={activeTab}
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.6 }}
                  className="h-full bg-gradient-to-r from-[#0b1f3a] to-[#f97316]"
                />
              </div>

              {/* Items List */}
              <AnimatePresence mode="wait">
                <motion.ul
                  key={activeTab}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-3.5"
                >
                  {active.items.map((item, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="group flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 border-l-4 border-l-transparent hover:border-l-[#f97316] hover:bg-orange-50/20 hover:shadow-md hover:translate-x-1 transition-all duration-300"
                    >
                      <span className="w-7 h-7 shrink-0 rounded-full bg-[#0b1f3a] text-white flex items-center justify-center text-xs font-bold group-hover:bg-[#f97316] transition-colors shadow-sm">
                        {i + 1}
                      </span>
                      <p className="text-slate-800 text-sm md:text-[15px] font-medium leading-relaxed group-hover:text-slate-900 transition-colors pt-0.5">
                        {item}
                      </p>
                    </motion.li>
                  ))}
                </motion.ul>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center px-6 md:px-8 py-4 border-t border-slate-100 bg-slate-50/50">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-full bg-orange-50 text-[#ea580c] border border-orange-200 shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#f97316]" />
                {active.pill}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                NTSC Skill Mission
              </span>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default VisionSection;