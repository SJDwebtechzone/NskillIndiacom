"use client";

import { usePathname } from "next/navigation";
import { Briefcase, LayoutDashboard, Search, Filter, Plus } from "lucide-react";

export default function TraineeManagementDashboard() {
  const pathname = usePathname();
  const section = "TRAINEE MANAGEMENT";
  const pageTitle = "DASHBOARD";

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white/50 backdrop-blur-sm p-8 rounded-3xl border border-white shadow-xl shadow-indigo-500/5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-full">
              {section}
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            {pageTitle}
          </h1>
          <p className="text-slate-500 font-medium mt-3 text-lg">
            Comprehensive control panel for internal trainee lifecycle and progress tracking.
          </p>
        </div>
      </div>

      <div className="bg-white p-16 rounded-[40px] border border-slate-100 shadow-sm text-center relative overflow-hidden group">
        <div className="relative z-10">
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-500/20 rotate-3 group-hover:rotate-0 transition-transform duration-500">
            <Briefcase className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">Trainee Module Initialized</h2>
          <p className="text-slate-500 max-w-lg mx-auto text-lg leading-relaxed">
            The Trainee Management dashboard is being prepared for operation.
            All tracking components are configured and ready for data ingestion.
          </p>
        </div>
      </div>
    </div>
  );
}
