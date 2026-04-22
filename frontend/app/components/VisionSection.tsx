"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { Eye, Target, Heart } from "lucide-react";

const tabs = [
  {
    id: "vision",
    icon: Eye,
    label: "Vision",
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
    pill: "1 core statement",
    items: [
      "Prepare youth and companies to scale skill development with outcome-focused implementation.",
    ],
  },
  {
    id: "values",
    icon: Heart,
    label: "Core Values",
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
  const isInView = useInView(ref, { once: true });
  const [activeTab, setActiveTab] = useState("vision");

  const active = tabs.find((t) => t.id === activeTab)!;

  return (
    <section ref={ref} className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 overflow-hidden rounded-2xl shadow-lg border">

          {/* ================= LEFT PANEL ================= */}
          <div className="relative bg-[#0b1f3a] min-h-[320px] overflow-hidden">

            {/* Ken Burns Image */}
      <motion.img
  src="/images/vision.jpg"
  className="absolute inset-0 w-full h-full object-cover brightness-75 contrast-125"
  initial={{ scale: 1.05 }}
  animate={{ scale: 1.1 }}
  transition={{
    duration: 12,
    repeat: Infinity,
    repeatType: "reverse",
    ease: "easeInOut",
  }}
/>

            {/* Floating Particles */}
            {[...Array(10)].map((_, i) => (
              <motion.span
                key={i}
                className="absolute w-2 h-2 bg-sky-400/40 rounded-full"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: -100, opacity: [0, 1, 0] }}
                transition={{ duration: 6 + i, repeat: Infinity, delay: i * 0.4 }}
                style={{ left: `${i * 10}%` }}
              />
            ))}

            {/* Scan Line */}
            <motion.div
              className="absolute left-0 w-full h-[2px] bg-cyan-400/40"
              animate={{ top: ["0%", "100%"] }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            />

            {/* Glow */}
            <motion.div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-blue-500/20 blur-3xl rounded-full"
              animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.2, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
            />

            {/* HUD Corners */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-sky-400 animate-pulse" />
              <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-sky-400 animate-pulse" />
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-sky-400 animate-pulse" />
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-sky-400 animate-pulse" />
            </div>

          </div>

          {/* ================= RIGHT PANEL ================= */}
          <div className="bg-white flex flex-col">

            {/* Tabs */}
            <div className="flex border-b">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider transition ${
                    activeTab === tab.id
                      ? "text-blue-700 border-b-2 border-blue-700"
                      : "text-gray-400"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6">

              {/* Heading + Icon */}
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  key={activeTab}
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-10 h-10 bg-blue-50 rounded flex items-center justify-center"
                >
                  <active.icon className="text-blue-700 w-5 h-5" />
                </motion.div>

                <h3 className="font-black text-xl">{active.label}</h3>
              </div>

              {/* Progress Bar */}
              <div className="h-1 bg-gray-200 rounded mb-6 overflow-hidden">
                <motion.div
                  key={activeTab}
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1 }}
                  className="h-full bg-blue-600 relative"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </motion.div>
              </div>

              {/* Content */}
              <AnimatePresence mode="wait">
                <motion.ul
                  key={activeTab}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  className="space-y-3"
                >
                  {active.items.map((item, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="group flex gap-3 p-4 bg-gray-50 rounded border-l-4 border-transparent hover:border-blue-600 hover:translate-x-1 transition"
                    >
                      <span className="group-hover:bg-blue-700 group-hover:text-white w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold transition">
                        {i + 1}
                      </span>
                      <p className="text-sm text-gray-600">{item}</p>
                    </motion.li>
                  ))}
                </motion.ul>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center p-4 border-t">
              <span className="text-xs bg-blue-50 px-3 py-1 rounded text-blue-700 font-bold">
                {active.pill}
              </span>

              <a className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-700">
                Learn More
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  →
                </motion.span>
              </a>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default VisionSection;