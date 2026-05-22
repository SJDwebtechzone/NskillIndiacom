"use client";
import { motion } from "framer-motion";

export default function AnimatedCalendarBanner() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-white">
      
      {/* Soft Blueprint Grid Background */}
      <div 
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: `linear-gradient(#bfdbfe 1px, transparent 1px), linear-gradient(90deg, #bfdbfe 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Animated Intersecting Waves for Calendar */}
      
      {/* Wave 1 - Darker Blue */}
      <motion.div 
        animate={{ x: ["0%", "-50%"] }}
        transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
        className="absolute bottom-0 left-0 w-[200%] h-48 md:h-64 flex text-blue-300/80"
      >
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="w-1/2 h-full" fill="currentColor">
          <path d="M0,192 C 240,288 480,288 720,192 C 960,96 1200,96 1440,192 L1440,320 L0,320 Z" />
        </svg>
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="w-1/2 h-full" fill="currentColor">
          <path d="M0,192 C 240,288 480,288 720,192 C 960,96 1200,96 1440,192 L1440,320 L0,320 Z" />
        </svg>
      </motion.div>

      {/* Wave 2 - Sky Blue (Inverted Phase) */}
      <motion.div 
        animate={{ x: ["-50%", "0%"] }}
        transition={{ repeat: Infinity, ease: "linear", duration: 40 }}
        className="absolute bottom-0 left-0 w-[200%] h-40 md:h-56 flex text-blue-500/70"
      >
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="w-1/2 h-full" fill="currentColor">
          <path d="M0,192 C 240,96 480,96 720,192 C 960,288 1200,288 1440,192 L1440,320 L0,320 Z" />
        </svg>
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="w-1/2 h-full" fill="currentColor">
          <path d="M0,192 C 240,96 480,96 720,192 C 960,288 1200,288 1440,192 L1440,320 L0,320 Z" />
        </svg>
      </motion.div>

      {/* Wave 3 - Very Light Blue Accent */}
      <motion.div 
        animate={{ x: ["0%", "-50%"] }}
        transition={{ repeat: Infinity, ease: "linear", duration: 22 }}
        className="absolute bottom-0 left-0 w-[200%] h-24 md:h-32 flex text-blue-600"
      >
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="w-1/2 h-full" fill="currentColor">
          <path d="M0,224 C 240,288 480,288 720,224 C 960,160 1200,160 1440,224 L1440,320 L0,320 Z" />
        </svg>
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="w-1/2 h-full" fill="currentColor">
          <path d="M0,224 C 240,288 480,288 720,224 C 960,160 1200,160 1440,224 L1440,320 L0,320 Z" />
        </svg>
      </motion.div>

      {/* Decorative Line Wave */}
      <motion.div 
        animate={{ x: ["-50%", "0%"] }}
        transition={{ repeat: Infinity, ease: "linear", duration: 55 }}
        className="absolute bottom-0 left-0 w-[200%] h-48 md:h-64 flex text-blue-800/40"
      >
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="w-1/2 h-full" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M0,160 C 240,256 480,256 720,160 C 960,64 1200,64 1440,160" />
        </svg>
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="w-1/2 h-full" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M0,160 C 240,256 480,256 720,160 C 960,64 1200,64 1440,160" />
        </svg>
      </motion.div>

    </div>
  );
}
