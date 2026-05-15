"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { Eye, Target, Heart } from "lucide-react";

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
  const isInView = useInView(ref, { once: true });
  const [activeTab, setActiveTab] = useState("vision");

  const active = tabs.find((t) => t.id === activeTab)!;

  return (
    <section ref={ref} className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 overflow-hidden rounded-2xl shadow-lg border">

          {/* ================= LEFT PANEL ================= */}
          <div className="relative bg-[#0b1f3a] min-h-[320px] overflow-hidden">

            {/* Tab Image with crossfade */}
            <AnimatePresence mode="wait">
              <motion.img
                key={active.id}
                src={active.image}
                alt={active.label}
                className="absolute inset-0 w-full h-full object-cover brightness-75 contrast-125"
                initial={{ opacity: 0, scale: 1.08 }}
                animate={{ opacity: 1, scale: 1.12 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />
            </AnimatePresence>

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

            {/* Glow */}
            <motion.div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-blue-500/20 blur-3xl rounded-full"
              animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.2, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
            />

            {/* Shimmer overlay */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent"
              animate={{ opacity: [0, 0.4, 0], x: ["-100%", "100%"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
            />

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

                <h3 className="font-black text-xl">
                  {active.label.includes(' ') ? (
                    <>
                      <span className="text-blue-600">{active.label.split(' ')[0]}</span>{' '}
                      <span className="text-red-600">{active.label.split(' ').slice(1).join(' ')}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-blue-600">{active.label.slice(0, Math.ceil(active.label.length / 2))}</span>
                      <span className="text-red-600">{active.label.slice(Math.ceil(active.label.length / 2))}</span>
                    </>
                  )}
                </h3>
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
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default VisionSection;