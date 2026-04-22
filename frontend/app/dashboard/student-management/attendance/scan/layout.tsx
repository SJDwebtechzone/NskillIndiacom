// app/dashboard/student-management/attendance/scan/layout.tsx
// Overrides the parent DashboardLayout — removes sidebar for clean mobile scan UI

export default function ScanLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100">
      {children}
    </div>
  );
}
