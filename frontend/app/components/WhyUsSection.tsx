// "use client";

// import { motion, useInView } from "framer-motion";
// import { useRef } from "react";
// import { CheckCircle2 } from "lucide-react";

// const reasons = [
//     "India's first technical school offering career course with state-of-art training facility",
//     "Center and State Government approved certification",
//     "Govt approved employment registered certificate",
//     "100% practical & industrial oriented training",
//     "100% placement guidance & Assurance",
//     "Multinational experienced faculties",
//     "Effective communication in English & Hindi",
//     "Career guidance and motivation classes",
//     "Online interactions with industrial experts",
//     "Individual student practical training",
//     "International valid certification",
// ];

// const WhyUsSection = () => {
//     const ref = useRef(null);
//     const isInView = useInView(ref, { once: true, margin: "-100px" });

//     return (
//         <section className="py-24 bg-white relative overflow-hidden" ref={ref}>
//             {/* Decorative Background */}
//             <div className="absolute top-0 right-0 w-full h-full opacity-30 pointer-events-none">
//                 <div className="absolute top-1/2 -right-24 w-96 h-96 bg-blue-50 rounded-full blur-[120px]" />
//             </div>

//             <div className="container mx-auto px-6 max-w-7xl relative z-10">
//                 <div className="grid lg:grid-cols-2 gap-16 items-center">

//                     {/* Content Side */}
//                     <motion.div
//                         initial={{ opacity: 0, x: -60 }}
//                         animate={isInView ? { opacity: 1, x: 0 } : {}}
"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

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

const WhyUsSection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">

        <div className="relative border border-blue-200 rounded-2xl overflow-hidden bg-[#f8fafc]">

          <div className="grid lg:grid-cols-2 items-center">

            {/* ================= LEFT CONTENT ================= */}
            <div className="p-10 md:p-14">

              <h2 className="mb-6">Why Choose Us</h2>

              <div className="grid sm:grid-cols-2 gap-4">

                {reasons.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-blue-600 mt-1 shrink-0" />
                    <p className="text-slate-600">{item}</p>
                  </motion.div>
                ))}

              </div>
            </div>

            {/* ================= RIGHT IMAGE ================= */}
            <div className="relative h-full min-h-[420px] overflow-hidden">
              <img
                src="/images/about/why.jpeg"
                alt="Why Choose Us"
                className="absolute inset-0 w-full h-full object-cover object-center brightness-110"
              />
              {/* Dark Overlay - reduced for brightness */}
              <div className="absolute inset-0 bg-black/10" />
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default WhyUsSection;