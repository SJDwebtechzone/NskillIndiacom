// "use client";

// import React, { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//     Search, Filter, Eye, Trash2, Edit, 
//     FileText, User, Calendar, BookOpen, 
//     CheckCircle2, AlertCircle, RefreshCw, ShieldCheck,
//     GraduationCap, ClipboardList, X, Briefcase, CreditCard
// } from "lucide-react";
// import axios from "axios";
// import { useRouter } from "next/navigation";
// import { useAuth } from "@/app/context/AuthContext";

// const API_BASE = "http://localhost:5000/api";

// export default function NTSCEnquiryAdmissionPage() {
//     const router = useRouter();
//     const { can } = useAuth();
//     const [view, setView] = useState<"enquiry" | "admission">("enquiry");
//     const [data, setData] = useState<any[]>([]);
//     const [isLoading, setIsLoading] = useState(true);
//     const [search, setSearch] = useState("");
//     const [selectedItem, setSelectedItem] = useState<any>(null);

//     const getAuthHeaders = () => {
//         const token = localStorage.getItem("token");
//         return { Authorization: `Bearer ${token}` };
//     };

//     useEffect(() => {
//         fetchData();
//     }, [view]);

//     const fetchData = async () => {
//         setIsLoading(true);
//         try {
//             const endpoint = view === "enquiry" ? "/enquiries" : "/admissions";
//             const res = await axios.get(`${API_BASE}${endpoint}`, {
//                 headers: getAuthHeaders()
//             });
//             setData(res.data);
//         } catch (err) {
//             console.error(`Failed to fetch ${view}s`, err);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const handleDelete = async (item: any) => {
//         const type = view === "enquiry" ? "Enquiry" : "Admission";
//         const identifier = view === "enquiry" ? item.enquiry_id : (item.admission_number || item.enquiry_id); // Use admission_number for admissions if available
//         const name = view === "enquiry" ? item.student_name : item.full_name;

//         if (!confirm(`Are you sure you want to delete ${type} for "${name}" (${identifier})?\nThis action is permanent.`)) return;

//         try {
//             const endpoint = view === "enquiry" ? `/enquiries/${item.id}` : `/admissions/${item.id}`;
//             await axios.delete(`${API_BASE}${endpoint}`, {
//                 headers: getAuthHeaders()
//             });
//             setData(prev => prev.filter(i => i.id !== item.id));
//         } catch (err: any) {
//             alert(err.response?.data?.error || `Failed to delete ${type}.`);
//         }
//     };

//     const filteredData = data.filter(item => {
//         const q = search.toLowerCase();
//         const name = (view === "enquiry" ? item.student_name : item.full_name) || "";
//         const id = (view === "enquiry" ? item.enquiry_id : item.admission_number) || "";
//         return name.toLowerCase().includes(q) || id.toLowerCase().includes(q);
//     });

//     return (
//         <div className="space-y-8 pb-12">
//             {/* Header */}
//             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
//                 <div>
//                     <h2 className="text-3xl font-black text-slate-800 tracking-tight">Management Hub</h2>
//                     <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">Full control over Enquiries and Admissions</p>
//                 </div>
                
//                 <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl shadow-inner">
//                     <button 
//                         onClick={() => setView("enquiry")}
//                         className={`px-6 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${view === "enquiry" ? 'bg-[#0b1f3a] text-white shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}
//                     >
//                         Enquiries
//                     </button>
//                     <button 
//                         onClick={() => setView("admission")}
//                         className={`px-6 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${view === "admission" ? 'bg-[#0b1f3a] text-white shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}
//                     >
//                         Admissions
//                     </button>
//                 </div>
//             </div>

//             {/* Controls */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <div className="md:col-span-2 relative">
//                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
//                     <input 
//                         type="text" 
//                         placeholder={`Search by name or ${view === "enquiry" ? "Enquiry ID" : "Admission ID"}...`}
//                         value={search}
//                         onChange={(e) => setSearch(e.target.value)}
//                         className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-blue-500 font-bold text-slate-700 shadow-sm"
//                     />
//                 </div>
//                 <button 
//                     onClick={fetchData}
//                     className="flex items-center justify-center gap-2 px-6 py-4 bg-white border border-slate-200 rounded-2xl font-black uppercase text-[10px] tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
//                 >
//                     <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} /> Refresh Records
//                 </button>
//             </div>

//             {/* Table Section */}
//             <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
//                 <div className="overflow-x-auto">
//                     {isLoading ? (
//                         <div className="py-24 flex flex-col items-center gap-4">
//                             <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
//                             <p className="font-bold text-slate-400 animate-pulse uppercase text-[10px] tracking-widest">Accessing records...</p>
//                         </div>
//                     ) : filteredData.length === 0 ? (
//                         <div className="py-32 text-center">
//                             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
//                                 <AlertCircle size={40} className="text-slate-300" />
//                             </div>
//                             <h4 className="text-xl font-black text-slate-800">No Records Found</h4>
//                             <p className="text-slate-400 text-sm mt-2 max-w-xs mx-auto font-medium">No {view}s match your current search criteria.</p>
//                         </div>
//                     ) : (
//                         <table className="w-full text-left">
//                             <thead>
//                                 <tr className="bg-slate-50/50">
//                                     <th className="py-6 px-8 font-black uppercase text-[10px] tracking-[0.2em] text-slate-400">Student Details</th>
//                                     <th className="py-6 px-8 font-black uppercase text-[10px] tracking-[0.2em] text-slate-400">ID / Date</th>
//                                     <th className="py-6 px-8 font-black uppercase text-[10px] tracking-[0.2em] text-slate-400">Course / Interest</th>
//                                     <th className="py-6 px-8 font-black uppercase text-[10px] tracking-[0.2em] text-slate-400 text-right">Actions</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {filteredData.map((item) => (
//                                     <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-all group">
//                                         <td className="py-6 px-8">
//                                             <div className="flex items-center gap-4">
//                                                 <div className="w-12 h-12 bg-[#0b1f3a] rounded-2xl flex items-center justify-center text-white font-black text-sm group-hover:scale-110 transition-transform">
//                                                     {((view === "enquiry" ? item.student_name : item.full_name) || "?")[0].toUpperCase()}
//                                                 </div>
//                                                 <div>
//                                                     <p className="font-black text-slate-800 text-lg">{(view === "enquiry" ? item.student_name : item.full_name) || "Untitled Record"}</p>
//                                                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.mobile_number || "No contact"}</p>
//                                                 </div>
//                                             </div>
//                                         </td>
//                                         <td 
//                                             className="py-6 px-8 cursor-pointer hover:bg-slate-50 transition-all rounded-r-3xl"
//                                             onClick={() => setSelectedItem(item)}
//                                             title="View Details"
//                                         >
//                                             <p className="font-mono font-black text-blue-600">#{(view === "enquiry" ? item.enquiry_id : (item.admission_number || item.enquiry_id)) || "N/A"}</p>
//                                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
//                                                 {new Date(item.created_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
//                                             </p>
//                                         </td>
//                                         <td className="py-6 px-8">
//                                             <p className="font-bold text-slate-700">{item.course_interested || item.course_name || "N/A"}</p>
//                                             <div className="flex items-center gap-2 mt-1">
//                                                 <span className={`w-1.5 h-1.5 rounded-full ${view === "enquiry" ? 'bg-amber-400' : 'bg-green-500'}`}></span>
//                                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{view === "enquiry" ? item.interest_level : 'Admitted'}</p>
//                                             </div>
//                                         </td>
//                                         <td className="py-6 px-8">
//                                             <div className="flex items-center justify-end gap-3">
//                                                 <button 
//                                                     onClick={() => setSelectedItem(item)}
//                                                     className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
//                                                     title="Quick View"
//                                                 >
//                                                     <Eye size={18} />
//                                                 </button>
//                                                 {can("NTSC Admin", "delete") && ( // Check for NTSC Admin or similar high-level delete permission
//                                                     <button 
//                                                         onClick={() => handleDelete(item)}
//                                                         className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
//                                                         title="Delete Record"
//                                                     >
//                                                         <Trash2 size={18} />
//                                                     </button>
//                                                 )}
//                                             </div>
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     )}
//                 </div>
//             </div>

//             {/* Quick View Modal */}
//             <AnimatePresence>
//                 {selectedItem && (
//                     <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-sm">
//                         <motion.div 
//                             initial={{ scale: 0.9, opacity: 0 }}
//                             animate={{ scale: 1, opacity: 1 }}
//                             exit={{ scale: 0.9, opacity: 0 }}
//                             className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl relative"
//                         >
//                             <button 
//                                 onClick={() => setSelectedItem(null)}
//                                 className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
//                             >
//                                 <X size={24} />
//                             </button>

//                             <div className="p-10 max-h-[85vh] overflow-y-auto custom-scrollbar">
//                                 <div className="flex items-center gap-6 mb-10 pb-6 border-b border-slate-100">
//                                     <div className="w-20 h-20 bg-[#0b1f3a] rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-blue-900/20">
//                                         {((view === "enquiry" ? selectedItem.student_name : selectedItem.full_name) || "?")[0].toUpperCase()}
//                                     </div>
//                                     <div>
//                                         <h3 className="text-3xl font-black text-slate-800 tracking-tight">
//                                             {(view === "enquiry" ? selectedItem.student_name : selectedItem.full_name) || "Untitled Record"}
//                                         </h3>
//                                         <div className="flex items-center gap-3 mt-1">
//                                             <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-[0.15em]">
//                                                 {view === "enquiry" ? "Enquiry Record" : "Admission Record"}
//                                             </span>
//                                             <span className="text-slate-300">|</span>
//                                             <span className="text-slate-400 font-bold text-xs tracking-widest uppercase">ID: #{(view === "enquiry" ? selectedItem.enquiry_id : (selectedItem.admission_number || selectedItem.enquiry_id)) || "N/A"}</span>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 <div className="space-y-12">
//                                     {/* Personal & Identification */}
//                                     <section>
//                                         <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-6 group">
//                                             <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> Personal Information
//                                         </h4>
//                                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//                                             <DetailBox label="Full Name" value={view === "enquiry" ? selectedItem.student_name : selectedItem.full_name} icon={User} />
//                                             <DetailBox label="Gender" value={selectedItem.gender} icon={User} />
//                                             <DetailBox label="Date of Birth" value={selectedItem.dob ? new Date(selectedItem.dob).toLocaleDateString() : "N/A"} icon={Calendar} />
//                                             <DetailBox label="Age" value={selectedItem.age} icon={Calendar} />
//                                             {view === "admission" && (
//                                                 <>
//                                                     <DetailBox label="Aadhaar Number" value={selectedItem.aadhaar_number} icon={FileText} />
//                                                     <DetailBox label="Passport No." value={selectedItem.passport_number || "None"} icon={BookOpen} />
//                                                 </>
//                                             )}
//                                         </div>
//                                     </section>

//                                     {/* Contact & Location */}
//                                     <section>
//                                         <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-6 group">
//                                             <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> Contact Details
//                                         </h4>
//                                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//                                             <DetailBox label="Mobile Number" value={selectedItem.mobile_number} icon={User} />
//                                             <DetailBox label="WhatsApp No." value={selectedItem.whatsapp_number} icon={User} />
//                                             <DetailBox label="Email Address" value={selectedItem.email_id} icon={AlertCircle} />
//                                             <div className="md:col-span-2 lg:col-span-3">
//                                                  <DetailBox label="Residential Address" value={`${selectedItem.residential_address || selectedItem.perm_address || ""}, ${selectedItem.city || selectedItem.perm_city || ""}, ${selectedItem.state || selectedItem.perm_state || ""} - ${selectedItem.pin_code || selectedItem.perm_pin || ""}`} icon={FileText} />
//                                             </div>
//                                         </div>
//                                     </section>

//                                     {/* Guardian & Background */}
//                                     <section>
//                                         <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-6 group">
//                                             <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> Guardian & Background
//                                         </h4>
//                                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//                                             <DetailBox label="Guardian Name" value={selectedItem.parent_name || selectedItem.father_name} icon={User} />
//                                             <DetailBox label="Guardian Mobile" value={selectedItem.parent_mobile || selectedItem.parent_contact} icon={User} />
//                                             <DetailBox label="Occupation" value={selectedItem.occupation || selectedItem.parent_occupation} icon={Briefcase} />
//                                             <DetailBox label="Highest Qual." value={selectedItem.highest_qualification} icon={GraduationCap} />
//                                             <DetailBox label="Institution" value={selectedItem.institution_name} icon={GraduationCap} />
//                                             <DetailBox label="Year of Passing" value={selectedItem.year_of_passing} icon={Calendar} />
//                                         </div>
//                                     </section>

//                                     {/* Training & Fees */}
//                                     <section className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
//                                         <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-6 group">
//                                             <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> Course & Financials
//                                         </h4>
//                                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//                                             <DetailBox label="Selected Course" value={selectedItem.course_interested || selectedItem.course_name} icon={BookOpen} />
//                                             <DetailBox label="Training Mode" value={selectedItem.mode_of_training || selectedItem.training_mode} icon={RefreshCw} />
//                                             <DetailBox label="Counsellor" value={selectedItem.counsellor_name} icon={CheckCircle2} />
                                            
//                                             {view === "admission" && (
//                                                 <>
//                                                     <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
//                                                         <DetailBox label="Total Course Fee" value={`₹ ${parseFloat(selectedItem.total_fees || 0).toLocaleString()}`} icon={RefreshCw} />
//                                                     </div>
//                                                     <div className="p-4 bg-green-50 rounded-2xl shadow-sm border border-green-100">
//                                                         <DetailBox label="Fees Paid" value={`₹ ${parseFloat(selectedItem.paid_fees || 0).toLocaleString()}`} icon={CheckCircle2} />
//                                                     </div>
//                                                     <div className="p-4 bg-red-50 rounded-2xl shadow-sm border border-red-100">
//                                                         <DetailBox label="Balance Amount" value={`₹ ${parseFloat(selectedItem.balance_amount || 0).toLocaleString()}`} icon={AlertCircle} />
//                                                     </div>
//                                                     <div className="md:col-span-3 grid grid-cols-2 gap-4">
//                                                         <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
//                                                             <DetailBox label="Instalment 1" value={`₹ ${parseFloat(selectedItem.instalment_1 || 0).toLocaleString()}`} icon={CreditCard || RefreshCw} />
//                                                         </div>
//                                                         <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
//                                                             <DetailBox label="Instalment 2" value={`₹ ${parseFloat(selectedItem.instalment_2 || 0).toLocaleString()}`} icon={CreditCard || RefreshCw} />
//                                                         </div>
//                                                     </div>
//                                                 </>
//                                             )}
//                                             {view === "enquiry" && (
//                                                 <DetailBox label="Interest Level" value={selectedItem.interest_level} icon={AlertCircle} />
//                                             )}
//                                         </div>
//                                     </section>

//                                     {/* Office Internal Section — ONLY for Admissions */}
//                                     {view === "admission" && (
//                                         <section className="p-8 bg-blue-50/50 rounded-[2rem] border border-blue-100/50">
//                                             <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-700 mb-6 group">
//                                                 <span className="w-1.5 h-1.5 rounded-full bg-blue-700"></span> Office Internal Details
//                                             </h4>
//                                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//                                                 <DetailBox label="Admission Number" value={selectedItem.admission_number} icon={ShieldCheck} />
//                                                 <DetailBox label="Batch Allotted" value={selectedItem.batch_allotted} icon={Calendar} />
//                                                 <DetailBox label="Verified By" value={selectedItem.verified_by} icon={User} />
//                                                 <div className="md:col-span-2 lg:col-span-3">
//                                                     <DetailBox label="Authorized Signatory" value={selectedItem.authorized_signature_by} icon={FileText} />
//                                                 </div>
//                                             </div>
//                                         </section>
//                                     )}

//                                     {selectedItem.remarks && (
//                                         <section>
//                                             <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-3 ml-1">Internal Remarks</h4>
//                                             <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 text-sm font-medium text-amber-900 italic">
//                                                 "{selectedItem.remarks}"
//                                             </div>
//                                         </section>
//                                     )}
//                                 </div>

//                                 <div className="flex gap-4 mt-12 pt-8 border-t border-slate-100">
//                                     <button 
//                                         onClick={() => setSelectedItem(null)}
//                                         className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all"
//                                     >
//                                         Close Details
//                                     </button>
//                                     <button 
//                                         onClick={() => {
//                                             const path = view === "enquiry" 
//                                                 ? "/dashboard/associate-management/enquiry" 
//                                                 : "/dashboard/associate-management/admission";
//                                             router.push(path);
//                                             setSelectedItem(null);
//                                         }}
//                                         className="flex-1 py-4 bg-[#0b1f3a] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 transition-all shadow-lg"
//                                     >
//                                         Go to Management
//                                     </button>
//                                 </div>
//                             </div>
//                         </motion.div>
//                     </div>
//                 )}
//             </AnimatePresence>
//         </div>
//     );
// }

// const DetailBox = ({ label, value, icon: Icon }: any) => (
//     <div className="space-y-1.5">
//         <div className="flex items-center gap-2 text-slate-400">
//             <Icon size={14} />
//             <p className="text-[10px] font-black uppercase tracking-widest">{label}</p>
//         </div>
//         <p className="text-sm font-bold text-slate-700">{value || "Information not provided"}</p>
//     </div>
// );
"use client";

import { useEffect, useState } from "react";
import {
  FileText, UserCheck, Search, Loader2, Eye,
  X, ChevronRight, Check, Calendar, Phone,
  Mail, BookOpen, MapPin, User, Filter,
  Download, RefreshCw, AlertCircle,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

// ─── helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (d: string) =>
  d ? new Date(d).toLocaleDateString("en-IN") : "—";
const fmtAmt  = (n: any) =>
  n ? `₹${Number(n).toLocaleString("en-IN")}` : "₹0";

function Badge({ label, color }: { label: string; color: string }) {
  const map: Record<string, string> = {
    blue:   "bg-blue-100 text-blue-700",
    green:  "bg-emerald-100 text-emerald-700",
    amber:  "bg-amber-100 text-amber-700",
    red:    "bg-red-100 text-red-700",
    purple: "bg-purple-100 text-purple-700",
    slate:  "bg-slate-100 text-slate-600",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-black uppercase tracking-wider ${map[color] ?? map.slate}`}>
      {label}
    </span>
  );
}

// ─── Enquiry Detail Modal ──────────────────────────────────────────────────────
function EnquiryModal({ enq, onClose }: { enq: any; onClose: () => void }) {
  const rows = [
    ["Enquiry ID",      enq.enquiry_id],
    ["Date",            fmtDate(enq.enquiry_date)],
    ["Mode",            enq.mode_of_enquiry],
    ["Mobile",          enq.mobile_number],
    ["WhatsApp",        enq.whatsapp_number],
    ["Email",           enq.email_id],
    ["Course",          enq.course_interested],
    ["Level",           enq.level_of_course],
    ["Training Mode",   enq.training_mode],
    ["Qualification",   enq.highest_qualification],
    ["Referred By",     enq.referred_by],
    ["Counsellor",      enq.counsellor_name],
    ["Interest Level",  enq.interest_level],
    ["Follow Up Date",  fmtDate(enq.follow_up_date)],
    ["Remarks",         enq.remarks],
    ["City",            enq.perm_city || enq.curr_city],
    ["State",           enq.perm_state || enq.curr_state],
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-black text-slate-800 text-lg">{enq.student_name}</h3>
            <p className="text-xs text-blue-600 font-bold">{enq.enquiry_id}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-6">
          <div className="grid grid-cols-2 gap-3">
            {rows.map(([label, value]) => value && (
              <div key={label} className="bg-slate-50 rounded-xl px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-0.5">{label}</p>
                <p className="text-sm font-semibold text-slate-700">{value}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 shrink-0 flex justify-end">
          <button onClick={onClose} className="px-6 py-2.5 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-700 transition">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Admission Detail Modal ────────────────────────────────────────────────────
function AdmissionModal({ adm, onClose }: { adm: any; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<"details" | "fees" | "docs">("details");

  const backendBase = API ?? "http://localhost:5000";

  const docs = [
    { label: "Aadhaar",       url: adm.has_aadhaar_file       },
    { label: "Education",     url: adm.has_edu_certs_file      },
    { label: "Passport",      url: adm.has_passport_file       },
    { label: "Resume",        url: adm.has_resume_file         },
    { label: "Address Proof", url: adm.has_address_proof_file  },
    { label: "Photos",        url: adm.has_photos_file         },
  ].filter(d => d.url);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {adm.photo_url && (
              <img
                src={`${backendBase}/${adm.photo_url?.replace(/\\/g, "/")}`}
                alt={adm.full_name}
                className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            )}
            <div>
              <h3 className="font-black text-slate-800 text-lg">{adm.full_name}</h3>
              <p className="text-xs text-blue-600 font-bold">{adm.admission_number || adm.enquiry_id}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-6 shrink-0">
          {(["details", "fees", "docs"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-bold capitalize border-b-2 transition -mb-px ${
                activeTab === tab
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              {tab === "docs" ? "Documents" : tab === "fees" ? "Fees" : "Details"}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6">

          {/* Details tab */}
          {activeTab === "details" && (
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Course",         adm.course_name || adm.course_interested],
                ["Level",          adm.course_level],
                ["Batch",          adm.batch_allotted || "Not assigned"],
                ["Status",         adm.status],
                ["Mode",           adm.mode_of_training],
                ["Admission Date", fmtDate(adm.admission_date)],
                ["Mobile",         adm.mobile_number],
                ["WhatsApp",       adm.whatsapp_number],
                ["Email",          adm.email_id],
                ["City",           adm.city],
                ["State",          adm.state],
                ["Counsellor",     adm.counsellor_name],
                ["Referral Source",adm.referral_source],
                ["Verified By",    adm.verified_by || "—"],
              ].map(([label, value]) => (
                <div key={label} className="bg-slate-50 rounded-xl px-4 py-3">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-0.5">{label}</p>
                  <p className="text-sm font-semibold text-slate-700">{value || "—"}</p>
                </div>
              ))}
            </div>
          )}

          {/* Fees tab */}
          {activeTab === "fees" && (
            <div className="space-y-3">
              {[
                { label: "Course Fees",    value: fmtAmt(adm.course_fees),    color: "slate"  },
                { label: "Total Fees",     value: fmtAmt(adm.total_fees),     color: "slate"  },
                { label: "Paid Fees",      value: fmtAmt(adm.paid_fees),      color: "green"  },
                { label: "Balance Due",    value: fmtAmt(adm.balance_amount), color: Number(adm.balance_amount) > 0 ? "red" : "green" },
                { label: "Instalment 1",   value: fmtAmt(adm.instalment_1),   color: "slate"  },
                { label: "Instalment 2",   value: fmtAmt(adm.instalment_2),   color: "slate"  },
                { label: "Payment Mode",   value: adm.payment_mode,           color: "slate"  },
                { label: "Payment Date",   value: fmtDate(adm.payment_date),  color: "slate"  },
                { label: "Reference No",   value: adm.payment_ref_no || "—",  color: "slate"  },
              ].map(({ label, value, color }) => (
                <div key={label} className={`flex items-center justify-between px-4 py-3 rounded-xl ${
                  color === "red"   ? "bg-red-50 border border-red-100"     :
                  color === "green" ? "bg-emerald-50 border border-emerald-100" :
                  "bg-slate-50"
                }`}>
                  <p className="text-sm font-bold text-slate-600">{label}</p>
                  <p className={`text-sm font-black ${
                    color === "red"   ? "text-red-600"     :
                    color === "green" ? "text-emerald-600" :
                    "text-slate-800"
                  }`}>{value}</p>
                </div>
              ))}

              {Number(adm.balance_amount) > 0 && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mt-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <p className="text-sm text-red-700 font-semibold">
                    Pending balance: {fmtAmt(adm.balance_amount)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Documents tab */}
          {activeTab === "docs" && (
            <div className="space-y-3">
              {docs.length === 0 ? (
                <div className="text-center py-10">
                  <FileText className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-400 font-semibold text-sm">No documents uploaded</p>
                </div>
              ) : (
                docs.map(({ label, url }) => {
                  const fullUrl = `${backendBase}/${url?.replace(/\\/g, "/")}`;
                  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url ?? "");
                  return (
                    <div key={label} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                          <FileText className="w-4 h-4 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-700">{label}</p>
                          <p className="text-[11px] text-slate-400 truncate max-w-[200px]">{url?.split("/").pop()}</p>
                        </div>
                      </div>
                      <a
                        href={fullUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition"
                      >
                        <Eye className="w-3 h-3" /> View
                      </a>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 shrink-0 flex justify-end">
          <button onClick={onClose} className="px-6 py-2.5 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-700 transition">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function EnquiryAdmissionPage() {
  const [tab,          setTab]          = useState<"enquiries" | "admissions">("enquiries");
  const [enquiries,    setEnquiries]    = useState<any[]>([]);
  const [admissions,   setAdmissions]   = useState<any[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [selectedEnq,  setSelectedEnq]  = useState<any | null>(null);
  const [selectedAdm,  setSelectedAdm]  = useState<any | null>(null);

  const token = typeof window !== "undefined"
    ? localStorage.getItem("token") ?? ""
    : "";

  const headers = { Authorization: `Bearer ${token}` };

  // ── Fetch data ──────────────────────────────────────────────────────────────
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [enqRes, admRes] = await Promise.all([
        fetch(`${API}/api/enquiries`,  { headers }),
        fetch(`${API}/api/admissions`, { headers }),
      ]);
      const enqData = await enqRes.json();
      const admData = await admRes.json();
      setEnquiries(Array.isArray(enqData) ? enqData : []);
      setAdmissions(Array.isArray(admData) ? admData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // ── Filter ──────────────────────────────────────────────────────────────────
  const filteredEnq = enquiries.filter(e =>
    !search ||
    e.student_name?.toLowerCase().includes(search.toLowerCase()) ||
    e.enquiry_id?.toLowerCase().includes(search.toLowerCase()) ||
    e.mobile_number?.includes(search) ||
    e.course_interested?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredAdm = admissions.filter(a =>
    !search ||
    a.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    a.admission_number?.toLowerCase().includes(search.toLowerCase()) ||
    a.mobile_number?.includes(search) ||
    a.course_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">

      {/* Modals */}
      {selectedEnq && <EnquiryModal  enq={selectedEnq} onClose={() => setSelectedEnq(null)} />}
      {selectedAdm && <AdmissionModal adm={selectedAdm} onClose={() => setSelectedAdm(null)} />}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800">Enquiry / Admission & Documents</h2>
            <p className="text-xs text-slate-400 font-semibold">
              {enquiries.length} enquiries · {admissions.length} admissions
            </p>
          </div>
        </div>
        <button
          onClick={fetchAll}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => { setTab("enquiries"); setSearch(""); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition ${
            tab === "enquiries"
              ? "bg-blue-600 text-white shadow-md shadow-blue-200"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          <FileText className="w-4 h-4" />
          Enquiries
          <span className={`text-xs px-2 py-0.5 rounded-lg font-black ${
            tab === "enquiries" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
          }`}>
            {enquiries.length}
          </span>
        </button>
        <button
          onClick={() => { setTab("admissions"); setSearch(""); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition ${
            tab === "admissions"
              ? "bg-blue-600 text-white shadow-md shadow-blue-200"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Admissions
          <span className={`text-xs px-2 py-0.5 rounded-lg font-black ${
            tab === "admissions" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
          }`}>
            {admissions.length}
          </span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder={tab === "enquiries"
            ? "Search by name, enquiry ID, mobile, course..."
            : "Search by name, admission no, mobile, course..."
          }
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>

      {/* ── Enquiries Table ── */}
      {tab === "enquiries" && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
              <span className="font-semibold text-sm">Loading enquiries...</span>
            </div>
          ) : filteredEnq.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 font-semibold">No enquiries found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="text-left px-4 py-3.5 text-xs font-black uppercase tracking-wider text-slate-400">#</th>
                    <th className="text-left px-4 py-3.5 text-xs font-black uppercase tracking-wider text-slate-400">Enquiry ID</th>
                    <th className="text-left px-4 py-3.5 text-xs font-black uppercase tracking-wider text-slate-400">Student</th>
                    <th className="text-left px-4 py-3.5 text-xs font-black uppercase tracking-wider text-slate-400">Course</th>
                    <th className="text-left px-4 py-3.5 text-xs font-black uppercase tracking-wider text-slate-400">Mobile</th>
                    <th className="text-left px-4 py-3.5 text-xs font-black uppercase tracking-wider text-slate-400">Interest</th>
                    <th className="text-left px-4 py-3.5 text-xs font-black uppercase tracking-wider text-slate-400">Date</th>
                    <th className="text-left px-4 py-3.5 text-xs font-black uppercase tracking-wider text-slate-400">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEnq.map((e, i) => (
                    <tr key={e.id} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/40"}>
                      <td className="px-4 py-3.5 text-slate-400 text-xs font-semibold">{i + 1}</td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">
                          {e.enquiry_id}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-slate-800">{e.student_name}</p>
                        <p className="text-[11px] text-slate-400">{e.email_id || "—"}</p>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 font-medium">
                        {e.course_interested || "—"}
                        {e.level_of_course && (
                          <span className="ml-1 text-[10px] text-slate-400">({e.level_of_course})</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 text-xs">{e.mobile_number}</td>
                      <td className="px-4 py-3.5">
                        {e.interest_level ? (
                          <Badge
                            label={e.interest_level}
                            color={
                              e.interest_level?.toLowerCase() === "high"   ? "green" :
                              e.interest_level?.toLowerCase() === "medium" ? "amber" :
                              "slate"
                            }
                          />
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3.5 text-slate-400 text-xs">{fmtDate(e.enquiry_date || e.created_at)}</td>
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => setSelectedEnq(e)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition"
                        >
                          <Eye className="w-3 h-3" /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!loading && filteredEnq.length > 0 && (
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
              <p className="text-xs font-semibold text-slate-400">
                Showing {filteredEnq.length} of {enquiries.length} enquiries
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Admissions Table ── */}
      {tab === "admissions" && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
              <span className="font-semibold text-sm">Loading admissions...</span>
            </div>
          ) : filteredAdm.length === 0 ? (
            <div className="text-center py-16">
              <UserCheck className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 font-semibold">No admissions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="text-left px-4 py-3.5 text-xs font-black uppercase tracking-wider text-slate-400">#</th>
                    <th className="text-left px-4 py-3.5 text-xs font-black uppercase tracking-wider text-slate-400">Student</th>
                    <th className="text-left px-4 py-3.5 text-xs font-black uppercase tracking-wider text-slate-400">Course</th>
                    <th className="text-left px-4 py-3.5 text-xs font-black uppercase tracking-wider text-slate-400">Batch</th>
                    <th className="text-left px-4 py-3.5 text-xs font-black uppercase tracking-wider text-slate-400">Fees</th>
                    <th className="text-left px-4 py-3.5 text-xs font-black uppercase tracking-wider text-slate-400">Balance</th>
                    <th className="text-left px-4 py-3.5 text-xs font-black uppercase tracking-wider text-slate-400">Status</th>
                    <th className="text-left px-4 py-3.5 text-xs font-black uppercase tracking-wider text-slate-400">Docs</th>
                    <th className="text-left px-4 py-3.5 text-xs font-black uppercase tracking-wider text-slate-400">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAdm.map((a, i) => {
                    const docCount = [
                      a.has_aadhaar_file, a.has_edu_certs_file, a.has_passport_file,
                      a.has_resume_file, a.has_address_proof_file, a.has_photos_file,
                    ].filter(Boolean).length;

                    return (
                      <tr key={a.id} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/40"}>
                        <td className="px-4 py-3.5 text-slate-400 text-xs font-semibold">{i + 1}</td>
                        <td className="px-4 py-3.5">
                          <p className="font-bold text-slate-800">{a.full_name}</p>
                          <p className="text-[11px] text-slate-400">{a.admission_number || a.enquiry_id}</p>
                        </td>
                        <td className="px-4 py-3.5 text-slate-600 font-medium">
                          {a.course_name}
                          {a.course_level && (
                            <span className="ml-1 text-[10px] text-slate-400">({a.course_level})</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          {a.batch_allotted ? (
                            <Badge label={`Batch ${a.batch_allotted}`} color="blue" />
                          ) : (
                            <span className="text-xs text-slate-400">Not assigned</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-slate-700 font-semibold text-xs">
                          {fmtAmt(a.total_fees)}
                        </td>
                        <td className="px-4 py-3.5">
                          {Number(a.balance_amount) > 0 ? (
                            <span className="text-xs font-black text-red-600">{fmtAmt(a.balance_amount)}</span>
                          ) : (
                            <span className="text-xs font-black text-emerald-600">Cleared</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge
                            label={a.status}
                            color={
                              a.status === "Completed"   ? "purple" :
                              a.status === "Ongoing"     ? "green"  :
                              a.status === "Discontinue" ? "red"    :
                              "blue"
                            }
                          />
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`text-xs font-black px-2 py-0.5 rounded-lg ${
                            docCount === 6 ? "bg-emerald-100 text-emerald-700" :
                            docCount > 0   ? "bg-amber-100 text-amber-700"    :
                            "bg-slate-100 text-slate-500"
                          }`}>
                            {docCount}/6
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <button
                            onClick={() => setSelectedAdm(a)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition"
                          >
                            <Eye className="w-3 h-3" /> View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {!loading && filteredAdm.length > 0 && (
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
              <p className="text-xs font-semibold text-slate-400">
                Showing {filteredAdm.length} of {admissions.length} admissions
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
