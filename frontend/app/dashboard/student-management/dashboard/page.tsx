"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useEffect, useState } from "react";
import {
  GraduationCap, TrendingUp, TrendingDown, CheckCircle2,
  ClipboardList, BookOpen, Award, Clock, BarChart2, Activity, FileText
} from "lucide-react";
import Link from "next/link";

interface AttendanceSummary {
  presentPercent: string;
  absentPercent: string;
  total: number;
}

function StatCard({ label, value, icon: Icon, bg, color, sub }: {
  label: string; value: string; icon: any; bg: string; color: string; sub?: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 hover:shadow-md transition-all group">
      <div className={`w-12 h-12 ${bg} ${color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        <Icon size={22} />
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <h4 className="text-3xl font-black text-slate-800">{value}</h4>
      {sub && <p className="text-xs text-slate-400 font-semibold mt-1">{sub}</p>}
    </div>
  );
}

function QuickLink({ href, icon: Icon, label, desc }: { href: string; icon: any; label: string; desc: string }) {
  return (
    <Link href={href} className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-blue-50 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group">
      <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all flex-shrink-0">
        <Icon size={20} />
      </div>
      <div>
        <p className="font-black text-slate-800 text-sm">{label}</p>
        <p className="text-xs text-slate-400 font-medium">{desc}</p>
      </div>
    </Link>
  );
}

export default function StudentManagementDashboard() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<AttendanceSummary | null>(null);
  const [loadingAttendance, setLoadingAttendance] = useState(true);

  useEffect(() => {
    if (user?.role === "Student") {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/attendance/student-report`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
        .then((res) => res.json())
        .then((json) => {
          if (json.success) setAttendance(json.data.summary);
        })
        .catch((err) => console.error("Failed to fetch attendance:", err))
        .finally(() => setLoadingAttendance(false));
    } else {
      setLoadingAttendance(false);
    }
  }, [user]);

  const isAdmin = user?.role === "Super Admin" || user?.role === "Admin";
  const isStudent = user?.role === "Student";
  const firstName = user?.name?.split(" ")[0] ?? "User";

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Banner */}
      <div className="relative p-10 bg-gradient-to-br from-[#1e3a8a] via-[#1d4ed8] to-[#2563eb] rounded-3xl text-white overflow-hidden shadow-2xl">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-4">
            <GraduationCap size={14} className="text-blue-200" />
            <span className="text-blue-100 text-[10px] font-black tracking-widest uppercase">
              {isAdmin ? "Admin View" : "Student Portal"}
            </span>
          </div>
          <h2 className="text-4xl font-black tracking-tight mb-2">
            {isAdmin ? "Student Management" : `Welcome, ${firstName}!`}
          </h2>
          <p className="text-blue-200 font-bold uppercase text-[10px] tracking-[0.2em]">
            {isAdmin
              ? "Manage enrollments, attendance, tests & certificates"
              : "Track your learning journey — attendance, tests & certifications"}
          </p>
          {isStudent && (
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/dashboard/student-management/attendance" style={{ color: "#1d4ed8", backgroundColor: "#ffffff" }} className="px-6 py-3 hover:bg-blue-50 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2">
                <ClipboardList size={15} /> My Attendance
              </Link>
              <Link href="/dashboard/student-management/results" style={{ color: "#ffffff" }} className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2">
                <Award size={15} /> My Results
              </Link>
            </div>
          )}
        </div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-400/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-300/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl pointer-events-none" />
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {isStudent ? (
          <>
            <StatCard
              label="My Attendance"
              value={loadingAttendance ? "…" : attendance ? `${attendance.presentPercent}%` : "N/A"}
              sub={attendance ? `${attendance.total} total classes` : undefined}
              icon={TrendingUp}
              bg="bg-blue-50" color="text-blue-600"
            />
            <StatCard
              label="Absent Rate"
              value={loadingAttendance ? "…" : attendance ? `${attendance.absentPercent}%` : "N/A"}
              sub="Last recorded"
              icon={TrendingDown}
              bg="bg-red-50" color="text-red-500"
            />
            <StatCard
              label="Course Progress"
              value="Active"
              sub="Check results page"
              icon={BookOpen}
              bg="bg-blue-100" color="text-blue-700"
            />
            <StatCard
              label="Certificates"
              value="View"
              sub="Download or request"
              icon={Award}
              bg="bg-blue-200" color="text-blue-800"
            />
          </>
        ) : (
          <>
            <StatCard label="Total Students"     value="—" icon={GraduationCap} bg="bg-blue-50"  color="text-blue-600" />
            <StatCard label="Active Courses"     value="—" icon={BookOpen}      bg="bg-blue-100" color="text-blue-700" />
            <StatCard label="Pending Fees"       value="—" icon={Clock}         bg="bg-red-50"   color="text-red-500" />
            <StatCard label="Certificates Issued" value="—" icon={Award}        bg="bg-blue-200" color="text-blue-800" />
          </>
        )}
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-lg font-black text-slate-800 mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickLink href="/dashboard/student-management/attendance"    icon={Activity}     label="Daily Attendance"       desc="View & track class attendance" />

          <QuickLink href="/dashboard/student-management/weekly-test"   icon={BarChart2}    label="My Weekly Test"         desc="Weekly assessment results" />
          <QuickLink href="/dashboard/student-management/student/pretest" icon={FileText}     label="My Pre Test"            desc="Course pre-tests & scores" />
          <QuickLink href="/dashboard/student-management/assessments"   icon={CheckCircle2} label="My Assessment"          desc="Course assessments & scores" />
          <QuickLink href="/dashboard/student-management/results"       icon={Award}        label="My Results"             desc="Final marks and outcomes" />
          <QuickLink href="/dashboard/student-management/certificates/download" icon={GraduationCap} label="Download Certificate" desc="Get your course certificate" />
        </div>
      </div>
    </div>
  );
}
