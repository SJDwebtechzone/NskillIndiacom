"use client";

import { useAuth } from "@/app/context/AuthContext";
import {
  Briefcase, ClipboardList, MonitorPlay, CheckSquare,
  Video, BarChart2, Activity, Camera, Play, CheckCircle, ChevronRight
} from "lucide-react";
import Link from "next/link";

function StatCard({ label, value, icon: Icon, bg, color }: {
  label: string; value: string; icon: any; bg: string; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 hover:shadow-md transition-all group">
      <div className={`w-12 h-12 ${bg} ${color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        <Icon size={22} />
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <h4 className="text-2xl font-black text-slate-800">{value}</h4>
    </div>
  );
}

function QuickLink({ href, icon: Icon, label, desc }: { href: string; icon: any; label: string; desc: string }) {
  return (
    <Link href={href} className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-blue-50 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group">
      <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all flex-shrink-0">
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-black text-slate-800 text-sm">{label}</p>
        <p className="text-xs text-slate-400 font-medium truncate">{desc}</p>
      </div>
      <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-600 transition-colors flex-shrink-0" />
    </Link>
  );
}

export default function TraineeManagementDashboard() {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] ?? "Trainer";
  const isAdmin = user?.role === "Super Admin" || user?.role === "Admin";

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Banner */}
      <div className="relative p-10 bg-gradient-to-br from-[#1e3a8a] via-[#1d4ed8] to-[#2563eb] rounded-3xl text-white overflow-hidden shadow-2xl">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-4">
            <Briefcase size={14} className="text-blue-200" />
            <span className="text-blue-100 text-[10px] font-black tracking-widest uppercase">
              {isAdmin ? "Admin View" : "Trainer Portal"}
            </span>
          </div>
          <h2 className="text-4xl font-black tracking-tight mb-2">
            {isAdmin ? "Trainer Management" : `Welcome, ${firstName}!`}
          </h2>
          <p className="text-blue-200 font-bold uppercase text-[10px] tracking-[0.2em]">
            Manage classes, attendance, tests & training content
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/dashboard/trainer-management/attendance" className="px-6 py-3 bg-white text-blue-700 hover:bg-blue-50 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2">
              <Activity size={15} /> Attendance Status
            </Link>
            <Link href="/dashboard/trainer-management/class-status/ongoing" className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2">
              <Play size={15} /> Ongoing Classes
            </Link>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-400/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-300/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl pointer-events-none" />
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <StatCard label="Ongoing Classes"   value="Active"  icon={Play}         bg="bg-blue-50"  color="text-blue-600" />
        <StatCard label="Completed Classes" value="Done"    icon={CheckCircle}  bg="bg-blue-100" color="text-blue-700" />
        <StatCard label="Assessments"       value="Manage"  icon={ClipboardList} bg="bg-blue-200" color="text-blue-800" />
        <StatCard label="Practical Videos"  value="Upload"  icon={Video}        bg="bg-blue-50"  color="text-blue-600" />
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-lg font-black text-slate-800 mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickLink href="/dashboard/trainer-management/attendance"           icon={Activity}     label="Attendance Status"    desc="View student attendance logs" />
          <QuickLink href="/dashboard/trainer-management/face-attendance"      icon={Camera}       label="Photo Attendance"     desc="Capture photo-based attendance" />
          <QuickLink href="/dashboard/trainer-management/pre-test"             icon={ClipboardList} label="Pre-Test"             desc="Manage pre-test questions" />
          <QuickLink href="/dashboard/trainer-management/weekly-test"          icon={MonitorPlay}  label="Weekly Test"          desc="Set & review weekly tests" />
          <QuickLink href="/dashboard/trainer-management/post-test"            icon={CheckSquare}  label="Post Test"            desc="Manage post-test content" />
          <QuickLink href="/dashboard/trainer-management/assessments"          icon={BarChart2}    label="Trainer Assessment"   desc="Assessment questions & marking" />
          <QuickLink href="/dashboard/trainer-management/practical-video"      icon={Video}        label="Practical Video"      desc="Upload practical video content" />
          <QuickLink href="/dashboard/trainer-management/results"              icon={CheckCircle}  label="Marks & Results"      desc="Student marks and final results" />
          <QuickLink href="/dashboard/trainer-management/class-status/ongoing" icon={Play}         label="Class Status"         desc="Ongoing, completed & discontinued" />
        </div>
      </div>
    </div>
  );
}
