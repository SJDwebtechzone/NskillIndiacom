"use client";

import { usePathname } from "next/navigation";
import { GraduationCap, LayoutDashboard, Search, Filter, Plus, TrendingUp, TrendingDown } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { useEffect, useState } from "react";

interface AttendanceSummary {
  presentPercent: string;
  absentPercent: string;
  total: number;
}

export default function StudentManagementDashboard() {
  const { user } = useAuth();
  const pathname = usePathname();
  const section = pathname.split("/").slice(-2)[0].replace(/-/g, " ").toUpperCase();
  const pageTitle = pathname.split("/").pop()?.replace(/-/g, " ").toUpperCase() || "DASHBOARD";
  
  const [attendance, setAttendance] = useState<AttendanceSummary | null>(null);

  useEffect(() => {
    if (user?.role === 'Student') {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/attendance/student-report`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      .then(res => res.json())
      .then(json => {
        if (json.success) setAttendance(json.data.summary);
      })
      .catch(err => console.error("Failed to fetch attendance:", err));
    }
  }, [user]);

  const isAdmin = user?.role === 'Super Admin' || user?.role === 'Admin';

  const stats = isAdmin ? [
    { label: "Total Students", value: "1,284", trend: "+12%", color: "blue" },
    { label: "Active Courses", value: "42", trend: "0%", color: "emerald" },
    { label: "Pending Fees", value: "₹2.4L", trend: "-5%", color: "amber" },
    { label: "Certificates Issued", value: "856", trend: "+18%", color: "purple" }
  ] : [
    { label: "My Attendance", value: attendance ? `${attendance.presentPercent}%` : "0%", trend: attendance ? `Total: ${attendance.total}` : "—", color: "blue", icon: <TrendingUp className="w-4 h-4" /> },
    { label: "Absent Rate", value: attendance ? `${attendance.absentPercent}%` : "0%", trend: "Last 30 days", color: "amber", icon: <TrendingDown className="w-4 h-4" /> },
    { label: "Course Progress", value: "65%", trend: "+5%", color: "emerald" },
    { label: "Pending Tasks", value: "3", trend: "Due soon", color: "purple" }
  ];

  return null;
}
