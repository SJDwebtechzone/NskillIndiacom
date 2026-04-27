
"use client";

import { ReactNode, useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import {
  LayoutDashboard,
  CreditCard,
  Users,
  Settings,
  Phone,
  ChevronDown,
  ChevronRight,
  UserCheck,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  UserCircle,
  Home,
  ImagePlay,
  Layers,
  LogOut,
  Award,
  UserCog,
  KeyRound,
  ClipboardList,
  FileText,
  BookOpen,
  FileDigit,
  Receipt,
  CalendarCheck,
  MonitorPlay,
  PenTool,
  Video,
  CheckSquare,
  FileDown,
  Send,
  Upload,
  MessageSquare,
  Share2,
  DollarSign,
  Clock,
  LayoutDashboard as DashboardIcon,
  Play,
  CheckCircle,
  StopCircle,
  Printer,
  RefreshCw,
  Wallet,
  Eye,
  Image,
  // ── Course Management icons ──
  BookMarked,
  PlusCircle,
  CalendarDays,
  Inbox,
  QrCode,
    Camera,  // ✅ ADD THIS
  Scan, 
  Menu,  // ← ADD
  X,
  ClipboardCheck
} from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

// ── existing menu arrays (unchanged) ──────────────────────────────────────────
const userManagementItems = [
  { name: "NTSC Admin",      path: "/dashboard/ntsc-admin",   module: "NTSC Admin",      icon: ShieldCheck   },
  { name: "Associate",       path: "/dashboard/associate",    module: "Associate",       icon: UserCheck     },
  { name: "Students",        path: "/dashboard/students",     module: "Students",        icon: GraduationCap },
  { name: "Staff / Trainee", path: "/dashboard/staff",        module: "Staff / Trainee", icon: Briefcase     },
  { name: "Manage Users",    path: "/dashboard/manage-users", module: "Manage Users",    icon: UserCog       },
  { name: "Manage Roles",    path: "/dashboard/manage-roles", module: "Manage Roles",    icon: KeyRound      },
];

const websiteSettingsItems = [
  { name: "Home",            path: "/",                                      module: "Home",            icon: Home,      tab: null              },
  { name: "Homepage Banner", path: "/dashboard/settings?tab=banner",         module: "Homepage Banner", icon: ImagePlay, tab: "banner"          },
  { name: "Feature Popup",   path: "/dashboard/settings?tab=popup",          module: "Feature Popup",   icon: Layers,    tab: "popup"           },
  { name: "Latest News",     path: "/dashboard/settings?tab=news",           module: "Latest News",     icon: Settings,  tab: "news"            },
  { name: "Accreditions",    path: "/dashboard/settings?tab=accreditations", module: "Accreditions",    icon: Award,     tab: "accreditations"  },
  { name: "Contact Info",    path: "/dashboard/settings/contact-info",       module: "Contact Info",    icon: Phone,     tab: null              },
{ name: "Post jobs ",       path: "/dashboard/settings/placement",          module: "Placement",       icon: Phone,     tab: null              },
  { name: "Apllied jobs ",    path: "/dashboard/settings/apllied-jobs",       module: "Apllied Jobs",     icon: Phone,     tab: null              },
  { name: "Upload videos ",    path: "/dashboard/settings/upload-videos",       module: "Upload videos",     icon: Phone,     tab: null              },
{ name: "Student Placements", path: "/dashboard/settings/student-placements", module: "Student Placements", icon: Upload, tab: null },
{ name: "Testimonials",       path: "/dashboard/settings/testimonials",        module: "Testimonials",       icon: MessageSquare, tab: null },
{ name: "Reviews & Videos", path: "/dashboard/settings/reviews", module: "Reviews & Videos", icon: Share2, tab: null },
];

// ── NEW: Course Management items ───────────────────────────────────────────────
const courseManagementItems = [
  { name: "All Courses",   path: "/dashboard/course-management",             module: "Course Management", icon: BookOpen      },
  { name: "Add Course",    path: "/dashboard/course-management/add",         module: "Course Management", icon: PlusCircle    },
  { name: "Demo Bookings", path: "/dashboard/course-management/bookings",    module: "Course Management", icon: CalendarDays  },
  { name: "Brochure Leads",path: "/dashboard/course-management/leads",       module: "Course Management", icon: Inbox         },
];

const associateManagementItems = [
  { name: "Dashboard",             path: "/dashboard/associate-management/dashboard",       module: "Associate Dashboard",   icon: DashboardIcon  },
  { name: "Enquiry Form",          path: "/dashboard/associate-management/enquiry",         module: "Enquiry Form",          icon: ClipboardList  },
  { name: "Admission Form",        path: "/dashboard/associate-management/admission",       module: "Admission Form",        icon: UserCheck      },
  { name: "Referral Fee Tracking", path: "/dashboard/associate-management/referral-tracking", module: "Referral Fee Tracking", icon: DollarSign  },
  { name: "Referral Fee History",  path: "/dashboard/ntsc-management/referral-payment",    module: "Referral Fee History",  icon: Wallet         },
];

const studentManagementItems = [
  { name: "Dashboard",                 path: "/dashboard/student-management/dashboard",         module: "StudentDashboard",              icon: DashboardIcon },
  { name: "ID Generation",             path: "/dashboard/student-management/id-generation",      module: "ID Generation",                 icon: FileDigit     },
  { name: "Course and Fees Details",   path: "/dashboard/student-management/course-details",     module: "Course and Fees Details",       icon: BookOpen      },
  { name: "Fees Receipt",              path: "/dashboard/student-management/fees-receipt",        module: "Fees Receipt",                  icon: Receipt       },
  { 
  name: "Pre-Test",                  
  path: "/dashboard/student-management/pre-test",            
  module: "Admin Pre-Test",  // ← renamed
  icon: ClipboardList 
},
{ 
  name: "My Pre-Test",               
  path: "/dashboard/student-management/my-pretest",          
  module: "MyPreTest",       // ← student only
  icon: ClipboardList 
},{ name: "Daily Attendance",          path: "/dashboard/student-management/attendance",          module: "Daily Attendance",              icon: CalendarCheck },
  { name: "Face Enrolment",
  path: "/dashboard/student-management/face-enrol",
  module: "Daily Attendance",
  icon: Scan },
  { name: "Scan QR Attendance",
  path: "/dashboard/student-management/attendance/scan",
  module: "Daily Attendance",   // ← same module as Daily Attendance
  icon: QrCode },
  { name: "My Weekly Test", path: "/dashboard/student-management/weekly-test", module: "My Weekly Test", icon: MonitorPlay },
  { name: "My Assessment", path: "/dashboard/student-management/assessments",          module: "My Assessment",     icon: PenTool       },
  { name: "My Practical Video",           path: "/dashboard/student-management/practical-video",     module: "My Practical Video",               icon: Video         },
  { name: "My Post Test", path: "/dashboard/student-management/post-test", module: "My Post Test", icon: ClipboardCheck },
  // Trainer


// Student
{ name: "My Results", path: "/dashboard/student-management/results", module: "My Results", icon: CheckSquare },   
  { name: "Download Certificate", path: "/dashboard/student-management/certificates/download", module: "Download Certificate", icon: FileDown },
{ name: "Request Certificate",  path: "/dashboard/student-management/certificates/request",  module: "Request Certificate",  icon: Send },
  
  { name: "Placement Details Uploads", path: "/dashboard/student-management/placements",          module: "Placement Details Uploads",     icon: Upload        },
  { name: "Feedback & Testimonial",    path: "/dashboard/student-management/feedback",            module: "Feedback & Testimonial",        icon: MessageSquare },
  { name: "Google Review & Videos",    path: "/dashboard/student-management/reviews",             module: "Google Review & Videos",        icon: Share2        },
  { name: "Fee Details", module: "Fee Details", icon: DollarSign, isDropdown: true, children: [
      { name: "Pending Fee", path: "/dashboard/student-management/fees/pending", icon: Clock       },
      { name: "Paid Fee",    path: "/dashboard/student-management/fees/paid",    icon: CheckSquare },
  ]},
];

const traineeManagementItems = [
  { name: "Dashboard",                 path: "/dashboard/trainer-management/dashboard",         module: "TrainerDashboard",          icon: DashboardIcon },
  { name: "Class Status", module: "Class Status", icon: ClipboardList, isDropdown: true, children: [
      { name: "Ongoing",     path: "/dashboard/trainer-management/class-status/ongoing",     icon: Play        },
      { name: "Completed",   path: "/dashboard/trainer-management/class-status/completed",   icon: CheckCircle },
      { name: "Discontinue", path: "/dashboard/trainer-management/class-status/discontinue", icon: StopCircle  },
  ]},
  { name: "Attendance Status",         path: "/dashboard/trainer-management/attendance",         module: "Attendance Status",         icon: CalendarCheck },
  { name: "Photo Attendance",
  path: "/dashboard/trainer-management/face-attendance",
  module: "Attendance Status",
  icon: Camera },
  { name: "Trainer Management",        path: "/dashboard/trainer-management/dashboard",          module: "Trainer Management",        icon: Briefcase     },
  { 
  name: "Pre-Test",                  
  path: "/dashboard/trainer-management/pre-test",            
  module: "Trainer Pre-Test", // ← renamed
  icon: FileText      
},{ name: "Weekly Test", path: "/dashboard/trainer-management/weekly-test", module: "Weekly Test", icon: MonitorPlay },
{ name: "Post Test", path: "/dashboard/trainer-management/post-test", module: "Trainer Post-Test", icon: ClipboardCheck },
  { name: "Trainer Assessment", path: "/dashboard/trainer-management/assessments",          module: "Trainer Assessment", icon: PenTool       },
  { name: "Practical Video", path: "/dashboard/trainer-management/practical-video", module: "Trainer Practical Video", icon: Video },
  
  { name: "Marks & Results", path: "/dashboard/trainer-management/results", module: "Trainer Marks", icon: CheckSquare },];

const ntscManagementItems = [
  { name: "Dashboard",                               path: "/dashboard/ntsc-management/dashboard",          module: "NTSC Dashboard",                              icon: DashboardIcon },
  { name: "Download A4 Sheet",                       path: "/dashboard/ntsc-management/download-a4",        module: "Download A4 Sheet",                           icon: Printer       },
  { name: "Enquiry / Admission and Document",        path: "/dashboard/ntsc-management/enquiry-admission",  module: "Enquiry / Admission and Document",             icon: FileText      },
  { name: "Update Class Status",                     path: "/dashboard/ntsc-management/class-status",       module: "Update Class Status",                         icon: RefreshCw     },
  { name: "Monitor Student Changes and Approval",    path: "/dashboard/ntsc-management/monitor-approvals",  module: "Monitor Student Changes and Approval",        icon: Eye           },
];


// Close sidebar when route changes on mobile

const backgroundImagesItems = [
  { name: "Background Images", path: "/dashboard/background-images", module: "Background Images", icon: Image },
];

// ── Reusable sub-link component ────────────────────────────────────────────────
function SubLink({ path, name, icon: Icon, pathname }: { path: string; name: string; icon: any; pathname: string }) {
  return (
    <Link
      href={path}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-300 ${
        pathname === path
          ? "text-blue-400 font-bold bg-blue-400/10"
          : "text-gray-500 hover:text-white hover:bg-white/5"
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{name}</span>
    </Link>
  );
}

// ── Reusable section toggle button ─────────────────────────────────────────────
function SectionToggle({ label, icon: Icon, isOpen, onClick }: { label: string; icon: any; isOpen: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group ${
        isOpen ? "text-white bg-white/5" : "text-gray-400 hover:text-white hover:bg-white/5"
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 ${isOpen ? "text-blue-400" : "group-hover:text-blue-400"}`} />
        <span className="font-medium">{label}</span>
      </div>
      {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
    </button>
  );
}

function DashboardLayoutContent({ children }: DashboardLayoutProps) {
  const pathname     = usePathname();
  const searchParams = useSearchParams();
  const router       = useRouter();
  const tabParam     = searchParams.get("tab");

  const { user, permissions, logout, loading } = useAuth();

  // ── Dropdown open states ───────────────────────────────────────────────────
  const [isUserMenuOpen,           setIsUserMenuOpen]           = useState(pathname.includes("/ntsc-admin") || pathname.includes("/associate") || pathname.includes("/students") || pathname.includes("/staff") || pathname.includes("/manage-users") || pathname.includes("/manage-roles"));
  const [isSettingsMenuOpen,       setIsSettingsMenuOpen]       = useState(pathname.includes("/dashboard/settings"));
  const [isCourseMenuOpen,         setIsCourseMenuOpen]         = useState(pathname.includes("/course-management"));
  const [isAssociateMenuOpen,      setIsAssociateMenuOpen]      = useState(pathname.includes("/associate-management"));
  const [isStudentManagementOpen,  setIsStudentManagementOpen]  = useState(pathname.includes("/student-management"));
  const [isTraineeManagementOpen,  setIsTraineeManagementOpen]  = useState(pathname.includes("/trainer-management"));
  const [isNTSCManagementOpen,     setIsNTSCManagementOpen]     = useState(pathname.includes("/ntsc-management"));
  const [isCertificationOpen,      setIsCertificationOpen]      = useState(pathname.includes("/certificates"));
  const [isFeeDetailsOpen,         setIsFeeDetailsOpen]         = useState(pathname.includes("/fees/"));
  const [isClassStatusOpen,        setIsClassStatusOpen]        = useState(pathname.includes("/class-status"));
  const [isBackgroundImagesOpen,   setIsBackgroundImagesOpen]   = useState(pathname.includes("/background-images"));
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);
  useEffect(() => {
  setIsMobileSidebarOpen(false);
}, [pathname]);

  const hasPerm = (modName: string) =>
    user?.role === "Super Admin" || user?.role === "Admin" || permissions?.[modName]?.view;

  const showDashboard = permissions?.["Dashboard"]?.view || user?.role === "Super Admin" || user?.role === "Admin";
  const showPayments  = permissions?.["Payments"]?.view  || user?.role === "Super Admin" || user?.role === "Admin";

  const visibleUserItems      = userManagementItems.filter(i => hasPerm(i.module));
  const visibleSettingsItems  = websiteSettingsItems.filter(i => hasPerm(i.module));
  const visibleCourseItems    = courseManagementItems.filter(i => hasPerm(i.module));
  const visibleAssociateItems = associateManagementItems.filter(i => hasPerm(i.module));
  const visibleStudentItems   = studentManagementItems.filter(i => hasPerm(i.module));
  const visibleTraineeItems   = traineeManagementItems.filter(i => hasPerm(i.module));
  const visibleNTSCItems      = ntscManagementItems.filter(i => hasPerm(i.module));
  const visibleBgItems        = backgroundImagesItems.filter(i => hasPerm(i.module));

  const getInitials = (name: string) =>
    name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const isSettingActive = (name: string): boolean => {
    if (name === "Home")            return pathname === "/";
    if (name === "Homepage Banner") return pathname.includes("/dashboard/settings") && tabParam !== "popup" && tabParam !== "news" && tabParam !== "accreditations";
    if (name === "Feature Popup")   return pathname.includes("/dashboard/settings") && tabParam === "popup";
    if (name === "Latest News")     return pathname.includes("/dashboard/settings") && tabParam === "news";
    if (name === "Accreditions")    return pathname.includes("/dashboard/settings") && tabParam === "accreditations";
    if (name === "Contact Info")    return pathname.includes("/dashboard/settings/contact-info");
    return false;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f8fafc]">
        <p className="text-blue-600 font-semibold text-sm">Loading...</p>
      </div>
    );
  }

return (
  <div className="flex min-h-screen bg-[#f8fafc]">

    {/* ── Mobile Overlay ── */}
    {isMobileSidebarOpen && (
      <div
        className="fixed inset-0 bg-black/50 z-40 md:hidden"
        onClick={() => setIsMobileSidebarOpen(false)}
      />
    )}

    {/* ── Sidebar ── */}
    <aside className={`
      fixed md:static inset-y-0 left-0 z-50
      w-72 bg-[#0b1f3a] text-white flex flex-col
      shadow-2xl border-r border-white/5
      transition-transform duration-300 ease-in-out
      ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      md:translate-x-0
    `}>

      {/* Logo */}
      <div className="p-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="text-xl font-bold">NS</span>
          </div>
          <h2 className="text-xl font-black tracking-tight uppercase">NSkill India</h2>
        </div>
        {/* Close button on mobile */}
        <button
          onClick={() => setIsMobileSidebarOpen(false)}
          className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 px-6 pb-4 overflow-y-auto">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 px-2">Admin Panel</p>

        <ul className="space-y-1">
          {showDashboard && (
            <li>
              <Link href="/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${pathname === "/dashboard" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>
                <LayoutDashboard className={`w-5 h-5 ${pathname === "/dashboard" ? "text-white" : "group-hover:text-blue-400"}`} />
                <span className="font-medium">Dashboard</span>
              </Link>
            </li>
          )}
          {showPayments && (
            <li>
              <Link href="/dashboard/payments" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${pathname === "/dashboard/payments" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>
                <CreditCard className={`w-5 h-5 ${pathname === "/dashboard/payments" ? "text-white" : "group-hover:text-blue-400"}`} />
                <span className="font-medium">Payment</span>
              </Link>
            </li>
          )}
        </ul>

        <div className="h-px bg-white/10 my-5 mx-2" />

        {/* User Management */}
        {visibleUserItems.length > 0 && (
          <div className="space-y-1 mb-1">
            <SectionToggle label="User Management" icon={Users} isOpen={isUserMenuOpen} onClick={() => setIsUserMenuOpen(v => !v)} />
            {isUserMenuOpen && (
              <ul className="mt-1 ml-4 space-y-1 border-l border-white/10 pl-4 py-1">
                {visibleUserItems.map(item => (
                  <li key={item.name}><SubLink path={item.path} name={item.name} icon={item.icon} pathname={pathname} /></li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Website Settings */}
        {visibleSettingsItems.length > 0 && (
          <div className="space-y-1 mt-1">
            <button
              onClick={() => setIsSettingsMenuOpen(v => !v)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group ${isSettingsMenuOpen ? "text-white bg-white/5" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
            >
              <div className="flex items-center gap-3">
                <Settings className={`w-5 h-5 ${isSettingsMenuOpen ? "text-blue-400" : "group-hover:rotate-45 group-hover:text-blue-400 transition-transform duration-500"}`} />
                <span className="font-medium">Website Settings</span>
              </div>
              {isSettingsMenuOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {isSettingsMenuOpen && (
              <ul className="mt-1 ml-4 space-y-1 border-l border-white/10 pl-4 py-1">
                {visibleSettingsItems.map(item => (
                  <li key={item.name}>
                    <Link href={item.path} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-300 ${isSettingActive(item.name) ? "text-blue-400 font-bold bg-blue-400/10" : "text-gray-500 hover:text-white hover:bg-white/5"}`}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Course Management */}
        {visibleCourseItems.length > 0 && (
          <div className="space-y-1 mt-1">
            <SectionToggle label="Course Management" icon={BookMarked} isOpen={isCourseMenuOpen} onClick={() => setIsCourseMenuOpen(v => !v)} />
            {isCourseMenuOpen && (
              <ul className="mt-1 ml-4 space-y-1 border-l border-white/10 pl-4 py-1">
                {visibleCourseItems.map(item => (
                  <li key={item.name}><SubLink path={item.path} name={item.name} icon={item.icon} pathname={pathname} /></li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Associate Management */}
        {visibleAssociateItems.length > 0 && (
          <div className="space-y-1 mt-1">
            <SectionToggle label="Associate Management" icon={ClipboardList} isOpen={isAssociateMenuOpen} onClick={() => setIsAssociateMenuOpen(v => !v)} />
            {isAssociateMenuOpen && (
              <ul className="mt-1 ml-4 space-y-1 border-l border-white/10 pl-4 py-1">
                {visibleAssociateItems.map(item => (
                  <li key={item.name}><SubLink path={item.path} name={item.name} icon={item.icon} pathname={pathname} /></li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Student Management */}
        {visibleStudentItems.length > 0 && (
          <div className="space-y-1 mt-1">
            <SectionToggle label="Student Management" icon={GraduationCap} isOpen={isStudentManagementOpen} onClick={() => setIsStudentManagementOpen(v => !v)} />
            {isStudentManagementOpen && (
              <ul className="mt-1 ml-4 space-y-1 border-l border-white/10 pl-4 py-1">
                {visibleStudentItems.map(item => {
                  if (item.isDropdown) {
                    const isOpen = item.name === "Certification" ? isCertificationOpen : isFeeDetailsOpen;
                    const setIsOpen = item.name === "Certification" ? setIsCertificationOpen : setIsFeeDetailsOpen;
                    return (
                      <li key={item.name}>
                        <button onClick={() => setIsOpen(!isOpen)} className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm transition-all duration-300 ${isOpen ? "text-white bg-white/5" : "text-gray-500 hover:text-white hover:bg-white/5"}`}>
                          <div className="flex items-center gap-3"><item.icon className="w-4 h-4" /><span>{item.name}</span></div>
                          {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                        </button>
                        {isOpen && (
                          <ul className="mt-1 ml-4 space-y-1 border-l border-white/10 pl-4 py-1">
                            {item.children.map(sub => (
                              <li key={sub.name}>
                                <Link href={sub.path!} className={`flex items-center gap-3 px-4 py-2 rounded-lg text-xs transition-all duration-300 ${pathname === sub.path ? "text-blue-400 font-bold bg-blue-400/10" : "text-gray-500 hover:text-white hover:bg-white/5"}`}>
                                  <sub.icon className="w-3.5 h-3.5" /><span>{sub.name}</span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    );
                  }
                  return <li key={item.name}><SubLink path={item.path!} name={item.name} icon={item.icon} pathname={pathname} /></li>;
                })}
              </ul>
            )}
          </div>
        )}

        {/* Trainer Management */}
        {visibleTraineeItems.length > 0 && (
          <div className="space-y-1 mt-1">
            <SectionToggle label="Trainer Management" icon={Briefcase} isOpen={isTraineeManagementOpen} onClick={() => setIsTraineeManagementOpen(v => !v)} />
            {isTraineeManagementOpen && (
              <ul className="mt-1 ml-4 space-y-1 border-l border-white/10 pl-4 py-1">
                {visibleTraineeItems.map(item => {
                  if (item.isDropdown) {
                    return (
                      <li key={item.name}>
                        <button onClick={() => setIsClassStatusOpen(v => !v)} className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm transition-all duration-300 ${isClassStatusOpen ? "text-white bg-white/5" : "text-gray-500 hover:text-white hover:bg-white/5"}`}>
                          <div className="flex items-center gap-3"><item.icon className="w-4 h-4" /><span>{item.name}</span></div>
                          {isClassStatusOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                        </button>
                        {isClassStatusOpen && (
                          <ul className="mt-1 ml-4 space-y-1 border-l border-white/10 pl-4 py-1">
                            {item.children.map(sub => (
                              <li key={sub.name}>
                                <Link href={sub.path!} className={`flex items-center gap-3 px-4 py-2 rounded-lg text-xs transition-all duration-300 ${pathname === sub.path ? "text-blue-400 font-bold bg-blue-400/10" : "text-gray-500 hover:text-white hover:bg-white/5"}`}>
                                  <sub.icon className="w-3.5 h-3.5" /><span>{sub.name}</span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    );
                  }
                  return <li key={item.name}><SubLink path={item.path!} name={item.name} icon={item.icon} pathname={pathname} /></li>;
                })}
              </ul>
            )}
          </div>
        )}

        {/* NTSC Management */}
        {visibleNTSCItems.length > 0 && (
          <div className="space-y-1 mt-1">
            <SectionToggle label="NTSC Management" icon={ShieldCheck} isOpen={isNTSCManagementOpen} onClick={() => setIsNTSCManagementOpen(v => !v)} />
            {isNTSCManagementOpen && (
              <ul className="mt-1 ml-4 space-y-1 border-l border-white/10 pl-4 py-1">
                {visibleNTSCItems.map(item => (
                  <li key={item.name}><SubLink path={item.path!} name={item.name} icon={item.icon} pathname={pathname} /></li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Background Images */}
        {visibleBgItems.length > 0 && (
          <div className="space-y-1 mt-1">
            <SectionToggle label="Background Images" icon={Image} isOpen={isBackgroundImagesOpen} onClick={() => setIsBackgroundImagesOpen(v => !v)} />
            {isBackgroundImagesOpen && (
              <ul className="mt-1 ml-4 space-y-1 border-l border-white/10 pl-4 py-1">
                {visibleBgItems.map(item => (
                  <li key={item.name}><SubLink path={item.path!} name={item.name} icon={item.icon} pathname={pathname} /></li>
                ))}
              </ul>
            )}
          </div>
        )}
      </nav>

      {/* Logout */}
      <div className="p-6">
        <div className="h-px bg-white/10 mb-4" />
        <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-400/5 transition-all duration-300 group">
          <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>

    {/* Main Area */}
    <div className="flex-1 flex flex-col min-w-0">

      {/* Header */}
      <header className="bg-white border-b px-4 md:px-8 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          {/* ── Hamburger button (mobile only) ── */}
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="h-8 w-1.5 bg-blue-600 rounded-full hidden md:block" />
          <h1 className="text-lg md:text-2xl font-black text-slate-800 tracking-tight">
            {pathname === "/dashboard" ? "Overview" : pathname.split("/").pop()?.replace(/-/g, " ").toUpperCase()}
          </h1>
        </div>
        <div className="flex items-center gap-3 md:gap-6">
          <div className="flex items-center gap-2 md:gap-3 md:pl-6 md:border-l border-slate-100">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-slate-800 leading-none">{user?.name ?? "Admin"}</p>
              <p className="text-[10px] text-blue-600 font-bold mt-1 tracking-wide">{user?.email ?? user?.role ?? ""}</p>
              {user?.admission_number && (
                <p className="text-[11px] text-slate-600 font-black mt-1 uppercase tracking-wider">ADMISSION No : {user.admission_number}</p>
              )}
            </div>
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-inner cursor-pointer hover:bg-blue-700 transition-colors">
              {user?.name ? getInitials(user.name) : <UserCircle className="w-5 h-5" />}
            </div>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="p-4 md:p-10 flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  </div>
);
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-[#f8fafc]"><p className="text-blue-600 font-semibold text-sm">Loading...</p></div>}>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </Suspense>
  );
}
