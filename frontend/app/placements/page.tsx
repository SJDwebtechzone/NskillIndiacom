"use client";

import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Briefcase, Building2, TrendingUp, Users } from "lucide-react";

export default function PlacementsPage() {
  const router = useRouter();

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* ── Page Header / Banner ── */}
      <div className="relative min-h-[420px] md:h-[400px] flex items-center overflow-hidden py-12 md:py-0">
        <img
          src="/images/placements/b49fc76a-fb0f-4d62-ab8d-67b6814fd77a.png"
          alt="Placements"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-white/70 md:from-white/90 md:via-white/50 md:to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-1 bg-[#2563eb]" />
        
        <div className="relative z-10 px-6 md:px-12 max-w-7xl mx-auto w-full flex justify-start">
          <div className="max-w-xl text-left">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-[#e0e7ff] border border-[#c7d2fe] rounded-full px-4 py-1.5 mb-3 shadow-sm"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#2563eb]" />
              <span className="text-[#2563eb] text-xs font-black tracking-widest uppercase">Careers & Placements</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-black text-3xl sm:text-4xl md:text-6xl font-black mb-3 md:mb-4 uppercase tracking-tight"
            >
              Shape Your Future
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-slate-600 text-base md:text-xl font-bold mb-6 md:mb-8"
            >
              Connect with top companies and accelerate your career growth with our placement assistance.
            </motion.p>
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              onClick={() => router.push("/placements/register")}
              className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-6 py-3 sm:px-8 sm:py-3.5 rounded-full font-bold text-base sm:text-lg transition-all shadow-lg hover:shadow-xl active:scale-95"
            >
              Register for Placements
            </motion.button>
          </div>
        </div>
      </div>

      {/* ── Content Section ── */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-[#0f172a] mb-4">Why Choose Our Placement Cell?</h2>
          <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">We bridge the gap between skilled candidates and industry requirements through practical technical training, dedicated placement support, and strong corporate tie-ups.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: <Briefcase size={32} />, title: "Assured Interviews", desc: "Get direct interview opportunities through our industry-connected placement support and corporate partnerships." },
            { icon: <Building2 size={32} />, title: "Top Recruiters", desc: "Training aligned with the requirements of leading companies, industries, and technical service sectors." },
            { icon: <TrendingUp size={32} />, title: "Practical Skill Training", desc: "Hands-on technical training with real-time workshop practice to make students industry-ready." },
            { icon: <Users size={32} />, title: "Career Guidance", desc: "Expert guidance and mentorship to help students choose the right technical career path and certification program." }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-shadow hover:border-blue-200 group"
            >
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-[#0f172a] mb-3">{feature.title}</h3>
              <p className="text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 bg-blue-600 rounded-3xl p-10 md:p-16 flex flex-col md:flex-row items-center justify-between shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="relative z-10 max-w-xl">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Ready to start your journey?</h2>
            <p className="text-white text-lg font-medium mb-8 md:mb-0">Create your profile today and get access to exclusive job opportunities tailored just for you.</p>
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row md:flex-col lg:flex-row items-center gap-4 lg:gap-6 w-full md:w-auto mt-8 md:mt-0">
            {/* QR Code */}
            <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl border border-white/20 backdrop-blur-sm w-full md:w-auto">
              <div className="bg-white p-2 rounded-xl shadow-md shrink-0">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent("https://nskillindia.com/placements/recommended-jobs")}`} 
                  alt="QR Code" 
                  className="w-12 h-12 sm:w-14 sm:h-14"
                />
              </div>
              <div className="text-left">
                <p className="text-[13px] font-black text-white uppercase tracking-wider mb-1">Recommended Jobs</p>
                <p className="text-[12px] text-blue-100 leading-normal max-w-[160px] sm:max-w-[180px]">Scan this QR to view jobs curated for you</p>
              </div>
            </div>

            <button 
              onClick={() => router.push("/placements/register")}
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-colors shadow-xl w-full md:w-auto shrink-0"
            >
              Create Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
