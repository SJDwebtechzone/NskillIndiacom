"use client";

import React from "react";
export default function BlogPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      {/* Hero Section */}
      <section className="bg-[#0b1f3a] pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 uppercase tracking-tight">
            Our <span className="text-[#fe2b54]">Blog</span>
          </h1>
          <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto font-medium">
            Stay updated with the latest industry trends, technical insights, and success stories from NSKILL India.
          </p>
        </div>
      </section>

      {/* Blog Content Placeholder */}
      <section className="flex-1 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {/* Sample Blog Card */}
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-[32px] overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-2 transition-all duration-300 group">
                <div className="h-56 bg-slate-200 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent group-hover:opacity-0 transition-opacity" />
                </div>
                <div className="p-8 space-y-4">
                  <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">May 12, 2026</p>
                  <h3 className="text-xl font-black text-[#0b1f3a] leading-tight group-hover:text-blue-600 transition-colors">
                    The Future of Industrial Automation in India
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed line-clamp-3">
                    Discover how new technologies are reshaping the industrial landscape and why upskilling is essential for the next generation of engineers.
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Coming Soon Message */}
          <div className="mt-20 p-10 rounded-[40px] bg-white border-2 border-dashed border-slate-200 text-center">
            <h2 className="text-2xl font-black text-[#0b1f3a] mb-2 uppercase">More Articles Coming Soon</h2>
            <p className="text-slate-500 font-medium">We are currently crafting more high-quality content for you.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
