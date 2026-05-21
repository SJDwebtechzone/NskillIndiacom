"use client";

import Link from "next/link";
import { 
    ClipboardList, FileText, BookOpen, ArrowRight, 
    LayoutDashboard, DollarSign, Users, Award 
} from "lucide-react";
import { motion } from "framer-motion";

const sections = [
  {
    title: "Overview Dashboard",
    description: "View your performance stats, enquiry counts, and recent referral activities at a glance.",
    href: "/dashboard/associate-management/dashboard",
    icon: LayoutDashboard,
    bg: "bg-orange-50",
    iconColor: "text-orange-500",
    border: "border-orange-100",
    badge: "Home",
  },
  {
    title: "Student Enquiry",
    description: "Record new student leads, capture personal details, and track initial course interest.",
    href: "/dashboard/associate-management/enquiry",
    icon: Users,
    bg: "bg-purple-50",
    iconColor: "text-purple-600",
    border: "border-purple-100",
    badge: "Process 1",
  },
  {
    title: "Admission Form",
    description: "Convert enquiries into admissions once students clear their documentation and initial fees.",
    href: "/dashboard/associate-management/admission",
    icon: FileText,
    bg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    border: "border-emerald-100",
    badge: "Process 2",
  },
  {
    title: "Referral Tracking",
    description: "Track your 10% referral points and commission status in real-time as payments clear.",
    href: "/dashboard/associate-management/referral-tracking",
    icon: DollarSign,
    bg: "bg-amber-50",
    iconColor: "text-amber-600",
    border: "border-amber-100",
    badge: "Earnings",
  },
];

export default function AssociateManagementLanding() {
  return (
    <div className="space-y-10 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
            <h1 className="text-4xl font-black text-slate-800 tracking-tight flex items-center gap-4">
            <div className="w-14 h-14 bg-slate-900 rounded-[1.25rem] flex items-center justify-center shadow-2xl shadow-orange-700/20">
                <Award className="w-7 h-7 text-orange-400" />
            </div>
            Associate Portal
            </h1>
            <p className="text-slate-500 font-bold ml-1 uppercase text-xs tracking-[0.2em]">
            Authorized Partner & Referral Management Console
            </p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs font-black text-slate-700 uppercase tracking-widest">System Online</span>
        </div>
      </div>

      {/* Grid of Section Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {sections.map((section, idx) => {
          const Icon = section.icon;
          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={section.href}
            >
              <Link
                href={section.href}
                className={`group relative bg-white border-2 ${section.border} rounded-[2.5rem] p-10 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:-translate-y-2 transition-all duration-500 overflow-hidden flex flex-col h-full`}
              >
                {/* Background Decoration */}
                <div className={`absolute top-0 right-0 w-48 h-48 -mr-16 -mt-16 ${section.bg} rounded-full opacity-40 group-hover:scale-150 transition-transform duration-700 blur-2xl`} />

                <div className="flex justify-between items-start mb-8 relative z-10">
                  <div className={`w-16 h-16 ${section.bg} rounded-3xl flex items-center justify-center group-hover:rotate-6 transition-transform duration-500`}>
                    <Icon className={`w-8 h-8 ${section.iconColor}`} />
                  </div>
                  {section.badge && (
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${section.border} ${section.iconColor} bg-white shadow-sm`}>
                      {section.badge}
                   </span>
                  )}
                </div>

                <div className="flex-grow relative z-10">
                  <h2 className="text-2xl font-black text-slate-800 mb-3 group-hover:text-orange-700 transition-colors">
                    {section.title}
                  </h2>
                  <p className="text-slate-500 font-medium leading-relaxed text-sm">
                    {section.description}
                  </p>
                </div>

                <div className={`mt-8 flex items-center gap-3 text-xs font-black uppercase tracking-widest ${section.iconColor} relative z-10 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-2`}>
                  Access Module <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Informational Banner */}
      <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl mt-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10 text-center md:text-left">
            <div className="w-20 h-20 bg-white/10 rounded-[2rem] flex items-center justify-center backdrop-blur-md border border-white/20">
                <BookOpen className="w-10 h-10 text-orange-300" />
            </div>
            <div className="flex-1">
                <h3 className="text-2xl font-black tracking-tight mb-2">Automated Referral Engine</h3>
                <p className="text-orange-200 font-medium leading-relaxed max-w-2xl">
                    Every admission you process enters our dynamic tracking system. Once the student clears their total balance (₹0), our engine automatically credits **10% of the course fee** to your account.
                </p>
            </div>
            <Link
                href="/dashboard/associate-management/referral-tracking"
                className="bg-white text-[#0b1f3a] font-black px-10 py-5 rounded-[2rem] text-xs uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
            >
                View Earnings
            </Link>
        </div>
      </div>
    </div>
  );
}
