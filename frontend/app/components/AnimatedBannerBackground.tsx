"use client";
import { motion } from "framer-motion";

export default function AnimatedBannerBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-gradient-to-br from-[#f8fafc] via-[#eff6ff] to-[#f0fdf4]">
      {/* Dot Patterns */}
      <div className="absolute top-8 left-8 md:top-12 md:left-12 opacity-30">
        <svg width="40" height="40" viewBox="0 0 40 40">
           <pattern id="dots" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
             <circle cx="2" cy="2" r="1.5" fill="#93c5fd" />
           </pattern>
           <rect width="40" height="40" fill="url(#dots)" />
        </svg>
      </div>
      <div className="absolute bottom-16 right-1/3 opacity-30">
        <svg width="60" height="40" viewBox="0 0 60 40">
           <rect width="60" height="40" fill="url(#dots)" />
        </svg>
      </div>
      <div className="absolute top-10 right-10 md:top-16 md:right-16 opacity-30">
        <svg width="40" height="60" viewBox="0 0 40 60">
           <rect width="40" height="60" fill="url(#dots)" />
        </svg>
      </div>

      {/* Right Side Rising Wave overlay to match original image structure */}
      <div className="absolute right-0 top-0 bottom-0 w-[40%] md:w-[30%] opacity-[0.15] pointer-events-none">
        <svg viewBox="0 0 400 800" preserveAspectRatio="none" className="w-full h-full text-blue-600" fill="currentColor">
          <path d="M400,0 L400,800 L0,800 C150,550,300,400,100,200 C50,100,200,50,400,0 Z" />
        </svg>
      </div>

      {/* Animated Waves */}
      {/* Base Light Wave */}
      <motion.div 
        animate={{ x: ["0%", "-50%"] }}
        transition={{ repeat: Infinity, ease: "linear", duration: 35 }}
        className="absolute bottom-0 left-0 w-[200%] h-48 md:h-64 flex text-blue-300/80"
      >
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="w-1/2 h-full" fill="currentColor">
          <path d="M0,160 C320,300,420,0,720,160 C1020,320,1120,20,1440,160 L1440,320 L0,320 Z" />
        </svg>
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="w-1/2 h-full" fill="currentColor">
          <path d="M0,160 C320,300,420,0,720,160 C1020,320,1120,20,1440,160 L1440,320 L0,320 Z" />
        </svg>
      </motion.div>

      {/* Mid Wave */}
      <motion.div 
        animate={{ x: ["-50%", "0%"] }}
        transition={{ repeat: Infinity, ease: "linear", duration: 45 }}
        className="absolute bottom-0 left-0 w-[200%] h-40 md:h-56 flex text-blue-500/70"
      >
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="w-1/2 h-full" fill="currentColor">
          <path d="M0,220 C320,100,420,300,720,220 C1020,140,1120,340,1440,220 L1440,320 L0,320 Z" />
        </svg>
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="w-1/2 h-full" fill="currentColor">
          <path d="M0,220 C320,100,420,300,720,220 C1020,140,1120,340,1440,220 L1440,320 L0,320 Z" />
        </svg>
      </motion.div>

      {/* Top Bold Wave */}
      <motion.div 
        animate={{ x: ["0%", "-50%"] }}
        transition={{ repeat: Infinity, ease: "linear", duration: 25 }}
        className="absolute bottom-0 left-0 w-[200%] h-32 md:h-48 flex text-blue-600"
      >
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="w-1/2 h-full" fill="currentColor">
          <path d="M0,192 C320,64,420,320,720,192 C1020,64,1120,320,1440,192 L1440,320 L0,320 Z" />
        </svg>
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="w-1/2 h-full" fill="currentColor">
          <path d="M0,192 C320,64,420,320,720,192 C1020,64,1120,320,1440,192 L1440,320 L0,320 Z" />
        </svg>
      </motion.div>

      {/* Decorative Line Waves (The thin overlapping lines) */}
      <motion.div 
        animate={{ x: ["-50%", "0%"] }}
        transition={{ repeat: Infinity, ease: "linear", duration: 55 }}
        className="absolute bottom-0 left-0 w-[200%] h-56 md:h-72 flex text-blue-800/40"
      >
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="w-1/2 h-full" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M0,120 C320,260,420,0,720,120 C1020,240,1120,20,1440,120" />
          <path d="M0,135 C320,275,420,15,720,135 C1020,255,1120,35,1440,135" />
          <path d="M0,150 C320,290,420,30,720,150 C1020,270,1120,50,1440,150" />
          <path d="M0,165 C320,305,420,45,720,165 C1020,285,1120,65,1440,165" />
        </svg>
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="w-1/2 h-full" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M0,120 C320,260,420,0,720,120 C1020,240,1120,20,1440,120" />
          <path d="M0,135 C320,275,420,15,720,135 C1020,255,1120,35,1440,135" />
          <path d="M0,150 C320,290,420,30,720,150 C1020,270,1120,50,1440,150" />
          <path d="M0,165 C320,305,420,45,720,165 C1020,285,1120,65,1440,165" />
        </svg>
      </motion.div>
    </div>
  );
}
