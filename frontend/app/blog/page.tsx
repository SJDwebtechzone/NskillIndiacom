"use client";

import React from "react";
import { PenTool } from "lucide-react";
export default function BlogPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      {/* Hero Section */}
      <div className="relative h-[280px] md:h-[400px] flex items-center overflow-hidden">
        <img
          src="/images/blogs/blog.png"
          alt="Our Blogs"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/50 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-1 bg-[#2563eb]" />
        
        <div className="relative z-10 px-6 md:px-12 max-w-7xl mx-auto w-full flex justify-start">
          <div className="max-w-xl text-left">
            <div className="inline-flex items-center gap-2 bg-[#e0e7ff] border border-[#c7d2fe] rounded-full px-4 py-1.5 mb-3 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2563eb]" />
              <span className="text-[#2563eb] text-xs font-black tracking-widest uppercase">Articles & News</span>
            </div>
            <h1 className="text-black text-5xl md:text-6xl font-black mb-4 uppercase tracking-tight">
              Our Blogs
            </h1>
            <p className="text-slate-600 text-lg md:text-xl font-bold">
              Stay updated with the latest industry trends, technical insights, and success stories from NSKILL India.
            </p>
          </div>
        </div>
      </div>

      {/* Blog Content Placeholder */}
      <section className="flex-1 py-24 px-6 flex items-center justify-center">
        <div className="max-w-3xl w-full text-center p-12 rounded-[40px] bg-white border border-slate-100 shadow-xl shadow-slate-200/50">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <PenTool className="w-10 h-10" />
          </div>
          <h2 className="text-4xl font-black text-[#0f172a] mb-4 uppercase tracking-tight">Coming Soon</h2>
          <p className="text-slate-500 text-lg font-medium leading-relaxed">
            We are currently crafting high-quality content and insights for you. Stay tuned for our upcoming articles!
          </p>
        </div>
      </section>
    </main>
  );
}
