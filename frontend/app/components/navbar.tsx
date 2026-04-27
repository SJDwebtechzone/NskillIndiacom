// "use client";

// import { useState, useRef, useEffect } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import { usePathname } from "next/navigation";
// import {
//   Lock,
//   User,
//   Users,
//   GraduationCap,
//   Menu,
//   X,
//   Phone,
//   Mail,
//   Clock,
//   ChevronDown,
//   Briefcase
// } from "lucide-react";
// import { courses } from "@/data/courses";

// const Navbar = () => {
//   const pathname = usePathname();
//   const [isLoginMenuOpen, setIsLoginMenuOpen] = useState(false);
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const [isCoursesMenuOpen, setIsCoursesMenuOpen] = useState(false);
//   const coursesMenuRef = useRef<HTMLDivElement>(null);

//   // Group courses by category
// // const skillTrainingMenu = [
// //   {
// //     title: "HVAC & Refrigeration",
// //     items: [
// //       { name: "Basic Refrigeration & A/C Training", id: "ac-training" },
// //       {name:"Basic Electrical & HVAC Training",
// //       "Advanced: Diploma in HVAC Training",
// //       "International: Certified HVAC Engineer (CHE)",
// //     ],
// //   },
// //   {
// //     title: "Welding Courses",
// //     items: [
// //       "Basic Arc Welding",
// //       "Basic TIG Welding",
// //       "Basic MIG Welding",
// //       "Pipe Fitter",
// //       "Arc Welding - 3G",
// //       "TIG Welding - 3G",
// //       "MIG Welding - 3G",
// //       "Advanced: Diploma in Welding (Arc, TIG, MIG-3G)",
// //       "Advanced: Welding Supervisor",
// //     ],
// //   },
// //   {
// //     title: "Electrical Courses",
// //     items: [
// //       "Basic Electrician",
// //       "Basic Industrial Electrician",
// //       "Advanced: Diploma in Electrician (Domestic & Industries)",
// //     ],
// //   },
// //   {
// //     title: "Plumbing Courses",
// //     items: [
// //       "Basic Plumber Training",
// //       "Pipeline Supervisor",
// //       "Water Treatment Technician",
// //     ],
// //   },
// //     {
// //     title: "Home Appliance Courses",
// //     items: [
// //       "Basic Washing Machine Training",
// //       "Advanced: Home Appliance Training",
    
// //     ],
// //   },
// //   {
// //     title:"MEP Courses",
// //     items:[
// //       "International Certified Mechanical Electrical & Plumbing Engineer (MEP)",
// //       "Basic MEP Technician",
// //       "Basic BMS & Fire Fighting"
// //     ]
// //   },
// //   {
// //     title:"Quality Courses",
// //     items:[
// //       "Basic NDT Training - ASNT Level -II (4 methods)",
// //       "Advanced: NDT & Quality Management Training",
// //       "Advanced Quality Inspector Training",
// //       "International Diploma in Quality Management Training"

// //     ]
// //   },

// //   {
// //     title: "Safety Courses",
// //     items: [
// //       "Basic Fire & Safety Training",
// //       "Advanced Diploma in Fire & Industrial Safety",
// //       "International Certified Health, Safety & Environmental Officer (CHSEO)",
// //       "NEBOSH Training",
// //     ],
// //   },
// //   {
// //     title:"Oil & Gas Courses",
// //     items:[
// //       "International Certified Oil & Gas Piping Engineer (CPE)",
// //       "Diploma in Oil & Gas Engineer",
// //       "Diploma Oil & Gas Rigger Training",
// //       "Certified Oil & Gas Safety Engineer"
// //     ]
// //   }
// // ];
// const skillTrainingMenu = [
//   {
//     title: "HVAC & Refrigeration",
//     items: [
//       { name: "Basic Refrigeration & A/C Training", id: "ac-training" },
//       { name: "Basic Electrical & HVAC Training", id: "electrical-hvac-training" },
//       { name: "Advanced: Diploma in HVAC Training", id: "diploma-hvac" },
//       { name: "International: Certified HVAC Engineer (CHE)", id: "certified-hvac-engineer" },
//     ],
//   },
  
//   {
//     title: "Electrical Courses",
//     items: [
//       { name: "Basic Electrician", id: "basic-electrician" },
//       { name: "Basic Industrial Electrician", id: "industrial-electrician" },
//       { name: "Advanced: Diploma in Electrician (Domestic & Industries)", id: "diploma-electrician" },
//     ],
//   },
//   {
//     title: "Plumbing Courses",
//     items: [
//       { name: "Basic Plumber Training", id: "plumber-training" },
//       { name: "Pipeline Supervisor", id: "pipeline-supervisor" },
//       { name: "Water Treatment Technician", id: "water-treatment-technician" },
//     ],
//   },
//   {
//     title: "Welding Courses",
//     items: [
//       { name: "Basic Arc Welding", id: "arc-welding" },
//       { name: "Basic TIG Welding", id: "tig-welding" },
//       { name: "Basic MIG Welding", id: "mig-welding" },
//       { name: "Pipe Fitter", id: "pipe-fitter" },
//       { name: "Arc Welding - 3G", id: "arc-welding-3g" },
//       { name: "TIG Welding - 3G", id: "tig-welding-3g" },
//       { name: "MIG Welding - 3G", id: "mig-welding-3g" },
//       { name: "Advanced: Diploma in Welding (Arc, TIG, MIG-3G)", id: "diploma-welding" },
//       { name: "Advanced: Welding Supervisor", id: "welding-supervisor" },
//     ],
//   },
//   {
//     title: "Home Appliance Courses",
//     items: [
//       { name: "Basic Washing Machine Training", id: "washing-machine-training" },
//       { name: "Advanced: Home Appliance Training", id: "home-appliance-training" },
//     ],
//   },
//   {
//     title: "MEP Courses",
//     items: [
//       { name: "International Certified Mechanical Electrical & Plumbing Engineer (MEP)", id: "certified-mep-engineer" },
//       { name: "Basic MEP Technician", id: "mep-technician" },
//       { name: "Basic BMS & Fire Fighting", id: "bms-fire-fighting" },
//     ],
//   },
//   {
//     title: "Quality Courses",
//     items: [
//       { name: "Basic NDT Training - ASNT Level -II (4 methods)", id: "ndt-level-2" },
//       { name: "Advanced: NDT & Quality Management Training", id: "ndt-quality-management" },
//       { name: "Advanced Quality Inspector Training", id: "quality-inspector" },
//       { name: "International Diploma in Quality Management Training", id: "diploma-quality-management" },
//     ],
//   },
//   {
//     title: "Safety Courses",
//     items: [
//       { name: "Basic Fire & Safety Training", id: "fire-safety-training" },
//       { name: "Advanced Diploma in Fire & Industrial Safety", id: "diploma-fire-safety" },
//       { name: "International Certified Health, Safety & Environmental Officer (CHSEO)", id: "chseo" },
//       { name: "NEBOSH Training", id: "nebosh-training" },
//     ],
//   },
//   {
//     title: "Oil & Gas Courses",
//     items: [
//       { name: "International Certified Oil & Gas Piping Engineer (CPE)", id: "oil-gas-piping-engineer" },
//       { name: "Diploma in Oil & Gas Engineer", id: "diploma-oil-gas" },
//       { name: "Diploma Oil & Gas Rigger Training", id: "oil-gas-rigger" },
//       { name: "Certified Oil & Gas Safety Engineer", id: "oil-gas-safety-engineer" },
//     ],
//   },
// ];
//   // Close menus on click outside
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         coursesMenuRef.current &&
//         !coursesMenuRef.current.contains(event.target as Node)
//       ) {
//         setIsCoursesMenuOpen(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   // Hide Navbar on login and dashboard pages
//   if (pathname?.startsWith("/login") || pathname?.startsWith("/dashboard")) {
//     return null;
//   }

//   const menuItems = [
//     { name: "Home", href: "/" },
//     { name: "Skill Training", href: "/courses", dropdown: true },
//     { name: "Corporate Training", href: "#corporate-training" },
//     { name: "Consulting Services", href: "#consulting" },
//     { name: "Course Calendar", href: "/calendar" },
//     { name: "Placements", href: "/placements/register" },
//     { name: "Infrastructure", href: "/infrastructure" },
//     { name: "Contact Us", href: "/contact" },
//   ];

//   return (
//     <header className="w-full relative shadow-sm">
//       {/* Top Bar */}
//       <div className="bg-[#0b1f3a] text-white py-2 px-4 md:px-12 flex flex-row justify-between items-center text-[10px] sm:text-xs md:text-sm font-medium">
//         <div className="flex items-center space-x-4">
//           <span className="flex items-center gap-1.5">
//             <Clock size={14} className="text-blue-400" />
//             Business Hours : 9.30 am to 7.00 pm
//           </span>
//         </div>

//         <div className="flex items-center space-x-6">
//           <div
//             className="relative group py-1"
//             onMouseEnter={() => setIsLoginMenuOpen(true)}
//             onMouseLeave={() => setIsLoginMenuOpen(false)}
//           >
//             <button className="flex items-center gap-2 text-white hover:text-blue-300 transition-colors uppercase tracking-wider text-[10px] md:text-xs">
//               <Lock size={14} />
//               Login Access
//             </button>

//             {/* Dropdown */}
//             <div
//               className={`absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-2xl z-50 border border-gray-100 overflow-hidden transition-all duration-300 ${isLoginMenuOpen
//                 ? "opacity-100 translate-y-0 visible"
//                 : "opacity-0 -translate-y-2 invisible"
//                 }`}
//             >
//               <div className="p-2">
//                 <Link
//                   href="/login/admin"
//                   className="flex items-center space-x-3 px-4 py-3 hover:bg-blue-50 rounded-md text-gray-700 hover:text-blue-700 transition"
//                   onClick={() => setIsLoginMenuOpen(false)}
//                 >
//                   <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
//                     <User size={16} />
//                   </div>
//                   <span className="font-semibold text-sm">Admin</span>
//                 </Link>

//                 <Link
//                   href="/login/associate"
//                   className="flex items-center space-x-3 px-4 py-3 hover:bg-blue-50 rounded-md text-gray-700 hover:text-blue-700 transition"
//                   onClick={() => setIsLoginMenuOpen(false)}
//                 >
//                   <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
//                     <Users size={16} />
//                   </div>
//                   <span className="font-semibold text-sm">Associate</span>
//                 </Link>

//                 <Link
//                   href="/login/student"
//                   className="flex items-center space-x-3 px-4 py-3 hover:bg-blue-50 rounded-md text-gray-700 hover:text-blue-700 transition"
//                   onClick={() => setIsLoginMenuOpen(false)}
//                 >
//                   <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
//                     <GraduationCap size={16} />
//                   </div>
//                   <span className="font-semibold text-sm">Student</span>
//                 </Link>

//                 <Link
//                   href="/login/trainee"
//                   className="flex items-center space-x-3 px-4 py-3 hover:bg-blue-50 rounded-md text-gray-700 hover:text-blue-700 transition"
//                   onClick={() => setIsLoginMenuOpen(false)}
//                 >
//                   <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
//                     <Briefcase size={16} />
//                   </div>
//                   <span className="font-semibold text-sm">Trainee</span>
//                 </Link>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Main Navbar */}
//       <nav className="bg-white px-4 md:px-6 py-3 sticky top-0 z-40 border-b">
//         <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 relative">
//           <Link href="/" className="flex items-center shrink-0">
//             <Image
//               src="/logo.png"
//               alt="NSKILL Logo"
//               width={180}
//               height={50}
//               className="object-contain h-8 md:h-11 w-auto"
//               priority
//             />
//           </Link>

//           <ul className="hidden lg:flex items-center justify-end flex-1 md:space-x-0.5 xl:space-x-1">
//             {menuItems.map((item) => (
//               <li key={item.name} className={`shrink-0 ${item.dropdown ? "" : "relative group"}`}>
//                 {item.dropdown ? (
//                   <div className="static" ref={coursesMenuRef}>
//                     <button
//                       onClick={() => setIsCoursesMenuOpen(!isCoursesMenuOpen)}
//                      className={`flex items-center gap-1 px-2 xl:px-3 py-2 font-semibold transition text-sm uppercase tracking-wide whitespace-nowrap 
// ${isCoursesMenuOpen ? "text-blue-600" : "text-[#0b1f3a] hover:text-blue-600"}`}
//                     >
//                       {item.name}
//                       <ChevronDown size={14} className={`transition-transform duration-300 ${isCoursesMenuOpen ? "rotate-180" : ""}`} />
//                     </button>

//                     {/* Mega Menu Dropdown */}
//                     <div className={`absolute left-1/2 -translate-x-1/2 mt-4 w-[95vw] max-w-5xl bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.18)] z-50 border border-slate-100 overflow-hidden transition-all duration-300 origin-top ${isCoursesMenuOpen ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible"}`}>
//                       <div className="p-4 px-6 bg-gradient-to-br from-white to-slate-50/50">
//                         <div className="grid grid-cols-3 gap-6 max-h-[400px] overflow-y-auto pr-2">
//                     {skillTrainingMenu.map((section, index) => (
//   <div key={index} className="space-y-2">

//     <div className="flex items-center gap-2 border-b border-slate-100 pb-1.5">
//       <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
//       <h4 className="text-base font-bold text-slate-800 tracking-wide uppercase">
//       {/*  */}
//         {section.title}
//       </h4>
//     </div>

//     <ul className="grid grid-cols-1 gap-0.5">
// {section.items.map((item, i) => (
//   <li key={i}>
//     <Link
//       href={`/courses/${item.id}`}   // ✅ dynamic routing
//       className="block p-1 px-3 rounded-md hover:bg-slate-50 text-[#0b1f3a] hover:text-blue-700 transition-all"
//       onClick={() => setIsCoursesMenuOpen(false)}
//     >
//       <span className="text-base font-medium uppercase tracking-tight block">
//         {item.name}
//       </span>
//     </Link>
//   </li>
// ))}
//     </ul>

//   </div>
// ))}
//                         </div>

//                         {/* All Courses Link */}
//                         <div className="mt-4 pt-3 border-t border-slate-100 flex justify-center">
//                           <Link
//                             href="/courses"
//                             className="group flex items-center gap-2 px-6 py-2 bg-[#0b1f3a] text-white rounded-full font-black text-[9px] uppercase tracking-[0.15em] hover:bg-blue-600 transition-all shadow-lg active:scale-95"
//                             onClick={() => setIsCoursesMenuOpen(false)}
//                           >
//                             Explore Full Catalog
//                             <div className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform">
//                               <ChevronDown size={10} className="-rotate-90" />
//                             </div>
//                           </Link>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 ) : (
//                   <Link
//                     href={item.href}
//                     className="px-2 xl:px-3 py-2 font-semibold text-[#0b1f3a] hover:text-blue-600 transition text-sm uppercase tracking-wide whitespace-nowrap"
//                   >
//                     {item.name}
//                   </Link>
//                 )}
//               </li>
//             ))}
//           </ul>

//           {/* Mobile Toggle */}
//           <div className="lg:hidden">
//             <button
//               onClick={() => setIsMenuOpen(!isMenuOpen)}
//               className="p-2 text-[#0b1f3a] hover:bg-gray-100 rounded-lg transition"
//             >
//               {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
//             </button>
//           </div>
//         </div>
//       </nav>

//       {/* Mobile Menu Backdrop */}
//       {isMenuOpen && (
//         <div
//           className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
//           onClick={() => setIsMenuOpen(false)}
//         />
//       )}

//       {/* Mobile Menu Panel */}
//       <div className={`fixed top-0 right-0 h-full w-72 bg-white shadow-2xl z-50 p-6 flex flex-col lg:hidden transform transition-transform duration-300 ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
//         <div className="flex justify-between items-center mb-10">
//           <Link href="/" onClick={() => setIsMenuOpen(false)}>
//             <Image
//               src="/logo.png"
//               alt="NSKILL Logo"
//               width={200}
//               height={60}
//               className="object-contain"
//             />
//           </Link>
//           <button
//             onClick={() => setIsMenuOpen(false)}
//             className="p-2 hover:bg-gray-100 rounded-full"
//           >
//             <X size={24} />
//           </button>
//         </div>

//         <ul className="space-y-1 overflow-y-auto">
//           {menuItems.map((item) => (
//             <li key={item.name}>
//               <Link
//                 href={item.href}
//                 onClick={() => setIsMenuOpen(false)}
//                 className="block px-4 py-3 text-lg font-bold text-[#0b1f3a] hover:bg-blue-50 hover:text-blue-600 rounded-xl transition"
//               >
//                 {item.name}
//               </Link>
//             </li>
//           ))}
//         </ul>

//         <div className="mt-auto pt-6 border-t">
//           <p className="text-xs text-center text-gray-500 font-medium uppercase tracking-widest">
//             Business Hours : 9.30 to 7.00
//           </p>
//         </div>
//       </div>
//     </header>
//   );
// };

// export default Navbar;
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Lock,
  User,
  Users,
  GraduationCap,
  Menu,
  X,
  Phone,
  Mail,
  Clock,
  ChevronDown,
  Briefcase,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface CourseMenuItem {
  name: string;
  id: string;
}
interface CategoryMenu {
  title: string;
  items: CourseMenuItem[];
}

// ─── Category order (controls display order in mega menu) ─────────────────────
const CATEGORY_ORDER = [
  "HVAC & Refrigeration",
  "Electrical",
  "Plumbing",
  "Welding",
  "Home Appliance",
  "MEP",
  "Quality",
  "Safety",
  "Oil & Gas",
];

const Navbar = () => {
  const pathname = usePathname();
  const [isLoginMenuOpen,   setIsLoginMenuOpen]   = useState(false);
  const [isMenuOpen,        setIsMenuOpen]        = useState(false);
  const [isCoursesMenuOpen, setIsCoursesMenuOpen] = useState(false);
  const [skillTrainingMenu, setSkillTrainingMenu] = useState<CategoryMenu[]>([]);
  const [menuLoading,       setMenuLoading]       = useState(true);
  const coursesMenuRef = useRef<HTMLDivElement>(null);

  // ── Fetch all courses from API and group by category ──────────────────────
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/courses`)
      .then(r => {
        if (!r.ok) throw new Error("Failed to fetch courses");
        return r.json();
      })
      .then((courses: any[]) => {
        if (!Array.isArray(courses)) return;

        // Group courses by category
        const grouped = courses.reduce((acc: Record<string, CourseMenuItem[]>, course: any) => {
          const cat = course.category ?? "Other";
          if (!acc[cat]) acc[cat] = [];
          acc[cat].push({
            name: course.title,
            id:   course.slug,  // ← real slug from DB
          });
          return acc;
        }, {});

        // Sort by CATEGORY_ORDER, unknown categories go to end
        const sorted: CategoryMenu[] = CATEGORY_ORDER
          .filter(cat => grouped[cat])
          .map(cat => ({ title: cat, items: grouped[cat] }));

        // Append any categories not in CATEGORY_ORDER
        Object.keys(grouped).forEach(cat => {
          if (!CATEGORY_ORDER.includes(cat)) {
            sorted.push({ title: cat, items: grouped[cat] });
          }
        });

        setSkillTrainingMenu(sorted);
      })
      .catch(err => console.error("Navbar courses fetch failed:", err))
      .finally(() => setMenuLoading(false));
  }, []);

  // ── Close mega menu on outside click ─────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        coursesMenuRef.current &&
        !coursesMenuRef.current.contains(event.target as Node)
      ) {
        setIsCoursesMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Hide Navbar on login and dashboard pages ──────────────────────────────
  if (pathname?.startsWith("/login") || pathname?.startsWith("/dashboard")) {
    return null;
  }

  const menuItems = [
    { name: "Home",               href: "/"                    },
    { name: "Skill Training",     href: "/courses", dropdown: true },
    { name: "Corporate Training", href: "#corporate-training"  },
    { name: "Consulting Services",href: "#consulting"          },
    { name: "Course Calendar",    href: "/calendar"            },
    { name: "Placements",         href: "/placements/register" },
    { name: "Infrastructure",     href: "/infrastructure"      },
    { name: "Contact Us",         href: "/contact"             },
  ];

  return (
    <header className="w-full relative shadow-sm">

      {/* ── Top Bar ── */}
      <div className="bg-[#0b1f3a] text-white py-2 px-4 md:px-12 flex flex-row justify-between items-center text-[10px] sm:text-xs md:text-sm font-medium">
        <div className="flex items-center space-x-4">
          <span className="flex items-center gap-1.5">
            <Clock size={14} className="text-blue-400" />
            Business Hours : 9.30 am to 7.00 pm
          </span>
        </div>

        <div className="flex items-center space-x-6">
          <div
            className="relative group py-1"
            onMouseEnter={() => setIsLoginMenuOpen(true)}
            onMouseLeave={() => setIsLoginMenuOpen(false)}
          >
            <button className="flex items-center gap-2 text-white hover:text-blue-300 transition-colors uppercase tracking-wider text-[10px] md:text-xs">
              <Lock size={14} />
              Login Access
            </button>

            {/* Login Dropdown */}
            <div
              className={`absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-2xl z-50 border border-gray-100 overflow-hidden transition-all duration-300 ${
                isLoginMenuOpen
                  ? "opacity-100 translate-y-0 visible"
                  : "opacity-0 -translate-y-2 invisible"
              }`}
            >
              <div className="p-2">
                <Link
                  href="/login/admin"
                  className="flex items-center space-x-3 px-4 py-3 hover:bg-blue-50 rounded-md text-gray-700 hover:text-blue-700 transition"
                  onClick={() => setIsLoginMenuOpen(false)}
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <User size={16} />
                  </div>
                  <span className="font-semibold text-sm">Admin</span>
                </Link>

                <Link
                  href="/login/associate"
                  className="flex items-center space-x-3 px-4 py-3 hover:bg-blue-50 rounded-md text-gray-700 hover:text-blue-700 transition"
                  onClick={() => setIsLoginMenuOpen(false)}
                >
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <Users size={16} />
                  </div>
                  <span className="font-semibold text-sm">Associate</span>
                </Link>

                <Link
                  href="/login/student"
                  className="flex items-center space-x-3 px-4 py-3 hover:bg-blue-50 rounded-md text-gray-700 hover:text-blue-700 transition"
                  onClick={() => setIsLoginMenuOpen(false)}
                >
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                    <GraduationCap size={16} />
                  </div>
                  <span className="font-semibold text-sm">Student</span>
                </Link>

                <Link
                  href="/login/trainee"
                  className="flex items-center space-x-3 px-4 py-3 hover:bg-blue-50 rounded-md text-gray-700 hover:text-blue-700 transition"
                  onClick={() => setIsLoginMenuOpen(false)}
                >
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                    <Briefcase size={16} />
                  </div>
                  <span className="font-semibold text-sm">Trainee</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Navbar ── */}
      <nav className="bg-white px-4 md:px-6 py-3 sticky top-0 z-40 border-b">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 relative">

          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/logo.png"
              alt="NSKILL Logo"
              width={180}
              height={50}
              className="object-contain h-8 md:h-11 w-auto"
              priority
            />
          </Link>

          {/* Desktop Menu */}
          <ul className="hidden lg:flex items-center justify-end flex-1 md:space-x-0.5 xl:space-x-1">
            {menuItems.map((item) => (
              <li key={item.name} className={`shrink-0 ${item.dropdown ? "" : "relative group"}`}>
                {item.dropdown ? (
                  <div className="static" ref={coursesMenuRef}>
                    <button
                      onClick={() => setIsCoursesMenuOpen(!isCoursesMenuOpen)}
                      className={`flex items-center gap-1 px-2 xl:px-3 py-2 font-semibold transition text-sm uppercase tracking-wide whitespace-nowrap ${
                        isCoursesMenuOpen
                          ? "text-blue-600"
                          : "text-[#0b1f3a] hover:text-blue-600"
                      }`}
                    >
                      {item.name}
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-300 ${isCoursesMenuOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {/* ── Mega Menu ── */}
                    <div
                      className={`absolute left-1/2 -translate-x-1/2 mt-4 w-[95vw] max-w-5xl bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.18)] z-50 border border-slate-100 overflow-hidden transition-all duration-300 origin-top ${
                        isCoursesMenuOpen
                          ? "opacity-100 scale-100 visible"
                          : "opacity-0 scale-95 invisible"
                      }`}
                    >
                      <div className="p-4 px-6 bg-gradient-to-br from-white to-slate-50/50">

                        {/* Loading state */}
                        {menuLoading ? (
                          <div className="flex items-center justify-center py-12 text-slate-400">
                            <svg className="animate-spin w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                            </svg>
                            Loading courses...
                          </div>
                        ) : skillTrainingMenu.length === 0 ? (
                          <div className="text-center py-12 text-slate-400 text-sm">
                            No courses available
                          </div>
                        ) : (
                          <div className="grid grid-cols-3 gap-6 max-h-[400px] overflow-y-auto pr-2">
                            {skillTrainingMenu.map((section, index) => (
                              <div key={index} className="space-y-2">
                                <div className="flex items-center gap-2 border-b border-slate-100 pb-1.5">
                                  <div className="w-1 h-4 bg-blue-600 rounded-full" />
                                  <h4 className="text-base font-bold text-slate-800 tracking-wide uppercase">
                                    {section.title}
                                  </h4>
                                </div>
                                <ul className="grid grid-cols-1 gap-0.5">
                                  {section.items.map((course, i) => (
                                    <li key={i}>
                                      <Link
                                        href={`/courses/${course.id}`}
                                        className="block p-1 px-3 rounded-md hover:bg-slate-50 text-[#0b1f3a] hover:text-blue-700 transition-all"
                                        onClick={() => setIsCoursesMenuOpen(false)}
                                      >
                                        <span className="text-sm font-medium uppercase tracking-tight block">
                                          {course.name}
                                        </span>
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* All Courses Link */}
                        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-center">
                          <Link
                            href="/courses"
                            className="group flex items-center gap-2 px-6 py-2 bg-[#0b1f3a] text-white rounded-full font-black text-[9px] uppercase tracking-[0.15em] hover:bg-blue-600 transition-all shadow-lg active:scale-95"
                            onClick={() => setIsCoursesMenuOpen(false)}
                          >
                            Explore Full Catalog
                            <div className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform">
                              <ChevronDown size={10} className="-rotate-90" />
                            </div>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className="px-2 xl:px-3 py-2 font-semibold text-[#0b1f3a] hover:text-blue-600 transition text-sm uppercase tracking-wide whitespace-nowrap"
                  >
                    {item.name}
                  </Link>
                )}
              </li>
            ))}
          </ul>

          {/* Mobile Toggle */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-[#0b1f3a] hover:bg-gray-100 rounded-lg transition"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile Backdrop ── */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* ── Mobile Menu Panel ── */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-white shadow-2xl z-50 flex flex-col lg:hidden transform transition-transform duration-300 ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-6 mb-4">
          <Link href="/" onClick={() => setIsMenuOpen(false)}>
            <Image
              src="/logo.png"
              alt="NSKILL Logo"
              width={200}
              height={60}
              className="object-contain"
            />
          </Link>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={24} />
          </button>
        </div>

        <ul className="space-y-1 overflow-y-auto px-6 flex-1">
          {menuItems.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-3 text-lg font-bold text-[#0b1f3a] hover:bg-blue-50 hover:text-blue-600 rounded-xl transition"
              >
                {item.name}
              </Link>
            </li>
          ))}

          {/* Mobile course list grouped by category */}
          {!menuLoading && skillTrainingMenu.length > 0 && (
            <li>
              <div className="mt-4 space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">
                  All Courses
                </p>
                {skillTrainingMenu.map((section, si) => (
                  <div key={si}>
                    <p className="text-[11px] font-black uppercase tracking-wider text-blue-600 px-4 mb-1">
                      {section.title}
                    </p>
                    {section.items.map((course, ci) => (
                      <Link
                        key={ci}
                        href={`/courses/${course.id}`}
                        onClick={() => setIsMenuOpen(false)}
                        className="block px-4 py-2 text-sm font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition"
                      >
                        {course.name}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            </li>
          )}
        </ul>

        <div className="p-6 border-t">
          <p className="text-xs text-center text-gray-500 font-medium uppercase tracking-widest">
            Business Hours : 9.30 to 7.00
          </p>
        </div>
      </div>

    </header>
  );
};

export default Navbar;

