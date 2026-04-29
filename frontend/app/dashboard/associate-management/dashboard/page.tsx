"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
    Users, ClipboardList, TrendingUp, ArrowUpRight, 
    UserPlus, CheckCircle2, Clock, Calendar, 
    Briefcase, Award, ShieldCheck, Eye, X, BookOpen, User, RefreshCw, AlertCircle, FileText, GraduationCap
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import axios from "axios";
import Link from "next/link";

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}/api`;

export default function AssociateDashboard() {
    const [stats, setStats] = useState({
        totalEnquiries: 0,
        totalAdmissions: 0,
        pendingFees: 0,
        totalPoints: 0,
        recentEnquiries: [] as any[],
        recentAdmissions: [] as any[],
        recentPoints: [] as any[]
    });
    const [isLoading, setIsLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [viewType, setViewType] = useState<"enquiry" | "admission" | null>(null);

    const getAuthHeaders = () => {
        const token = localStorage.getItem("token");
        return { Authorization: `Bearer ${token}` };
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setIsLoading(true);
        const newStats = { ...stats };
        try {
            try {
                const enqRes = await axios.get(`${API_BASE}/enquiries`, { headers: getAuthHeaders() });
                newStats.recentEnquiries = enqRes.data.slice(0, 10);
                newStats.totalEnquiries = enqRes.data.length;
            } catch (err: any) {
                console.error("Enquiries fetch failed:", err);
                const msg = err.response?.data?.error || err.message;
                alert(`Dashboard - Enquiries Error: ${msg}`);
            }

            try {
                const admRes = await axios.get(`${API_BASE}/admissions`, { headers: getAuthHeaders() });
                newStats.recentAdmissions = admRes.data.slice(0, 10);
                newStats.totalAdmissions = admRes.data.length;
                newStats.pendingFees = admRes.data.filter((a: any) => parseFloat(a.balance_amount || 0) > 0).length;
            } catch (err: any) {
                console.error("Admissions fetch failed:", err);
                const msg = err.response?.data?.error || err.message;
                alert(`Dashboard - Admissions Error: ${msg}`);
            }

            try {
                const pointsRes = await axios.get(`${API_BASE}/admissions/referral-points/my`, { headers: getAuthHeaders() });
                newStats.recentPoints = pointsRes.data;
                const totalPoints = pointsRes.data.reduce((acc: number, curr: any) => acc + (parseFloat(curr.points_earned) || 0), 0);
                newStats.totalPoints = totalPoints;
            } catch (err: any) {
                console.error("Points fetch failed:", err);
            }

            setStats(newStats);
        } catch (err) {
            console.error("Critical Dashboard Stats Fetch Error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8 pb-12">
            {/* Welcome Header */}
            <div className="relative p-10 bg-[#0b1f3a] rounded-[3rem] text-white overflow-hidden shadow-2xl">
                <div className="relative z-10">
                    <h2 className="text-4xl font-black tracking-tight mb-2">Associate Dashboard</h2>
                    <p className="text-blue-300 font-bold uppercase text-[10px] tracking-[0.2em]">Manage your enquiries, admissions, and referral earnings</p>
                    
                    <div className="mt-8 flex flex-wrap gap-4">
                        <Link href="/dashboard/associate-management/enquiry" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2">
                           <UserPlus size={16} /> New Enquiry
                        </Link>
                        <Link href="/dashboard/associate-management/admission" className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2">
                           <ClipboardList size={16} /> New Admission
                        </Link>
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-400/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardStat 
                    label="My Enquiries" 
                    value={stats.totalEnquiries.toString()} 
                    icon={Users} 
                    color="text-blue-600" 
                    bg="bg-blue-50" 
                />
                <DashboardStat 
                    label="Admissions" 
                    value={stats.totalAdmissions.toString()} 
                    icon={CheckCircle2} 
                    color="text-green-600" 
                    bg="bg-green-50" 
                />
                <DashboardStat 
                    label="Pending Payments" 
                    value={stats.pendingFees.toString()} 
                    icon={Clock} 
                    color="text-amber-600" 
                    bg="bg-amber-50" 
                />
                <DashboardStat 
                    label="Referral Earned" 
                    value={`₹ ${stats.totalPoints.toLocaleString()}`} 
                    icon={TrendingUp} 
                    color="text-purple-600" 
                    bg="bg-purple-50" 
                />
            </div>

            {/* Action Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                    <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                        <Award className="text-blue-600" /> Career Counsellor Program
                    </h3>
                    <p className="text-slate-500 font-medium mb-6 leading-relaxed">
                        As an authorized associate, you earn **10% commission** on every student who completes their course fee payment. Enquiries you add today can become successful admissions tomorrow.
                    </p>
                    <div className="space-y-3">
                        <BenefitItem text="Automated Referral Tracking" />
                        <BenefitItem text="Real-time Admission Status" />
                        <BenefitItem text="Dedicated Support Access" />
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col justify-between">
                    <div>
                        <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
                             <TrendingUp className="text-green-600" /> Performance Overview
                        </h3>
                        <p className="text-slate-500 font-medium text-sm">
                            Your conversion rate and payment clearance status determine your payout cycle. Ensure students complete their documentation for faster processing.
                        </p>
                    </div>
                    <div className="mt-8 pt-8 border-t border-slate-50">
                        <Link href="/dashboard/associate-management/referral-tracking" className="w-full py-4 bg-slate-50 hover:bg-slate-100 rounded-2xl flex items-center justify-center gap-3 font-bold text-slate-600 transition-all group">
                            View Referral Points <ArrowUpRight className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Recent Data Tables */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-4">
                {/* Recent Enquiries */}
                <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                    <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                        <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                            <Users className="text-blue-600" /> Recent Enquiries
                        </h3>
                        <Link href="/dashboard/associate-management/enquiry" className="text-xs font-bold text-blue-600 hover:underline">View All</Link>
                    </div>
                    <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50/50 sticky top-0 z-10 backdrop-blur-md">
                                <tr>
                                    <th className="py-4 px-8 font-black uppercase text-[10px] tracking-widest text-slate-400">Student Enrollment</th>
                                    <th className="py-4 px-4 font-black uppercase text-[10px] tracking-widest text-slate-400">Course</th>
                                    <th className="py-4 px-8 font-black uppercase text-[10px] tracking-widest text-slate-400 text-right">Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentEnquiries.length === 0 ? (
                                    <tr><td colSpan={3} className="py-10 text-center text-slate-300 font-bold">No enquiries found</td></tr>
                                ) : stats.recentEnquiries.map((enq, i) => (
                                    <tr key={enq.id} className="border-b border-slate-50 hover:bg-blue-50/20 transition-all group">
                                        <td className="py-4 px-8">
                                            <div className="font-bold text-slate-800">{enq.student_name}</div>
                                            <div className="text-[10px] font-mono text-blue-600 font-black">ID: {enq.enquiry_id}</div>
                                        </td>
                                        <td className="py-4 px-4 text-xs font-bold text-slate-500">{enq.course_interested || "General"}</td>
                                        <td className="py-4 px-8 text-right">
                                            <button 
                                                onClick={() => { setSelectedItem(enq); setViewType("enquiry"); }}
                                                className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm group-hover:scale-110"
                                            >
                                                <Eye size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Admissions */}
                <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                    <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                        <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                            <CheckCircle2 className="text-green-600" /> Recent Admissions
                        </h3>
                        <Link href="/dashboard/associate-management/admission" className="text-xs font-bold text-green-600 hover:underline">View All</Link>
                    </div>
                    <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50/50 sticky top-0 z-10 backdrop-blur-md">
                                <tr>
                                    <th className="py-4 px-8 font-black uppercase text-[10px] tracking-widest text-slate-400">Student Profile</th>
                                    <th className="py-4 px-4 font-black uppercase text-[10px] tracking-widest text-slate-400">Financials</th>
                                    <th className="py-4 px-8 font-black uppercase text-[10px] tracking-widest text-slate-400 text-right">Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentAdmissions.length === 0 ? (
                                    <tr><td colSpan={3} className="py-10 text-center text-slate-300 font-bold">No admissions found</td></tr>
                                ) : stats.recentAdmissions.map((adm, i) => (
                                    <tr key={adm.id} className="border-b border-slate-50 hover:bg-green-50/20 transition-all group">
                                        <td className="py-4 px-8">
                                            <div className="font-bold text-slate-800">{adm.full_name}</div>
                                            <div className="text-[10px] font-mono text-green-600 font-black">ID: {adm.enquiry_id}</div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="text-xs font-black text-slate-700 font-mono">₹ {(parseFloat(adm.total_fees) || 0).toLocaleString()}</div>
                                            <div className={`text-[9px] font-black uppercase tracking-tighter ${(parseFloat(adm.balance_amount) || 0) === 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                Bal: ₹ {(parseFloat(adm.balance_amount) || 0).toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="py-4 px-8 text-right">
                                            <button 
                                                onClick={() => { setSelectedItem(adm); setViewType("admission"); }}
                                                className="p-2.5 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm group-hover:scale-110"
                                            >
                                                <Eye size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Quick View Modal */}
            <AnimatePresence>
                {selectedItem && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-sm">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl relative"
                        >
                            <button 
                                onClick={() => { setSelectedItem(null); setViewType(null); }}
                                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
                            >
                                <X size={24} />
                            </button>

                            <div className="p-10 max-h-[85vh] overflow-y-auto custom-dashboard-modal-scroll">
                                <div className="flex items-center gap-6 mb-10 pb-6 border-b border-slate-100">
                                    <div className="w-20 h-20 bg-[#0b1f3a] rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-blue-900/20">
                                        {(viewType === "enquiry" ? selectedItem.student_name : selectedItem.full_name)[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-black text-slate-800 tracking-tight">
                                            {viewType === "enquiry" ? selectedItem.student_name : selectedItem.full_name}
                                        </h3>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.15em] ${viewType === 'enquiry' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                                                {viewType === "enquiry" ? "Enquiry Record" : "Admission Record"}
                                            </span>
                                            <span className="text-slate-300">|</span>
                                            <span className="text-slate-400 font-bold text-xs tracking-widest uppercase font-mono">ID: #{selectedItem.enquiry_id}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-12">
                                    {/* Personal & Identification */}
                                    <section>
                                        <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-6 group">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> 1. Personal Information
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                            <DetailBox label="Full Name" value={viewType === "enquiry" ? selectedItem.student_name : selectedItem.full_name} icon={User} />
                                            <DetailBox label="Gender" value={selectedItem.gender} icon={User} />
                                            <DetailBox label="Date of Birth" value={selectedItem.dob ? new Date(selectedItem.dob).toLocaleDateString() : "N/A"} icon={Calendar} />
                                            <DetailBox label="Age" value={selectedItem.age} icon={Calendar} />
                                            {viewType === "admission" && (
                                                <>
                                                    <DetailBox label="Aadhaar Number" value={selectedItem.aadhaar_number} icon={FileText} />
                                                    <DetailBox label="Passport No." value={selectedItem.passport_number || "None"} icon={BookOpen} />
                                                </>
                                            )}
                                        </div>
                                    </section>

                                    {/* Contact & Location */}
                                    <section>
                                        <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-6 group">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> 2. Contact Details
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                            <DetailBox label="Mobile Number" value={selectedItem.mobile_number} icon={User} />
                                            <DetailBox label="WhatsApp No." value={selectedItem.whatsapp_number} icon={User} />
                                            <DetailBox label="Email Address" value={selectedItem.email_id} icon={AlertCircle} />
                                            <div className="md:col-span-2 lg:col-span-3">
                                                 <DetailBox label="Residential Address" value={`${selectedItem.residential_address || selectedItem.perm_address || ""}, ${selectedItem.city || selectedItem.perm_city || ""}, ${selectedItem.state || selectedItem.perm_state || ""} - ${selectedItem.pin_code || selectedItem.perm_pin || ""}`} icon={FileText} />
                                            </div>
                                        </div>
                                    </section>

                                    {/* Guardian & Background */}
                                    <section>
                                        <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-6 group">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> 3. Guardian & Background
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                            <DetailBox label="Guardian Name" value={selectedItem.parent_name || selectedItem.father_name} icon={User} />
                                            <DetailBox label="Guardian Mobile" value={selectedItem.parent_mobile || selectedItem.parent_contact} icon={User} />
                                            <DetailBox label="Occupation" value={selectedItem.occupation || selectedItem.parent_occupation} icon={Briefcase} />
                                            <DetailBox label="Highest Qual." value={selectedItem.highest_qualification} icon={GraduationCap} />
                                            <DetailBox label="Institution" value={selectedItem.institution_name} icon={GraduationCap} />
                                            <DetailBox label="Year of Passing" value={selectedItem.year_of_passing} icon={Calendar} />
                                        </div>
                                    </section>

                                    {/* Training & Fees */}
                                    <section className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-inner">
                                        <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-6 group">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> 4. Course & Financials
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                            <DetailBox label="Selected Course" value={selectedItem.course_interested || selectedItem.course_name} icon={BookOpen} />
                                            <DetailBox label="Training Mode" value={selectedItem.mode_of_training || selectedItem.training_mode} icon={RefreshCw} />
                                            <DetailBox label="Counsellor" value={selectedItem.counsellor_name} icon={CheckCircle2} />
                                            
                                            {viewType === "admission" && (
                                                <>
                                                    <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                                                        <DetailBox label="Total Course Fee" value={`₹ ${parseFloat(selectedItem.total_fees || 0).toLocaleString()}`} icon={RefreshCw} />
                                                    </div>
                                                    <div className="p-4 bg-green-50 rounded-2xl shadow-sm border border-green-100">
                                                        <DetailBox label="Fees Paid" value={`₹ ${parseFloat(selectedItem.paid_fees || 0).toLocaleString()}`} icon={CheckCircle2} />
                                                    </div>
                                                    <div className="p-4 bg-red-50 rounded-2xl shadow-sm border border-red-100">
                                                        <DetailBox label="Balance Amount" value={`₹ ${parseFloat(selectedItem.balance_amount || 0).toLocaleString()}`} icon={AlertCircle} />
                                                    </div>
                                                </>
                                            )}
                                            {viewType === "enquiry" && (
                                                <DetailBox label="Interest Level" value={selectedItem.interest_level} icon={AlertCircle} />
                                            )}
                                        </div>
                                    </section>

                                    {selectedItem.remarks && (
                                        <section>
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-3 ml-1">Internal Remarks</h4>
                                            <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 text-sm font-medium text-amber-900 italic">
                                                "{selectedItem.remarks}"
                                            </div>
                                        </section>
                                    )}
                                </div>

                                <div className="mt-12 flex justify-center">
                                    <button 
                                        onClick={() => { setSelectedItem(null); setViewType(null); }}
                                        className="w-full py-4 bg-[#0b1f3a] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 transition-all shadow-lg"
                                    >
                                        Close Quick View
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

const DetailBox = ({ label, value, icon: Icon }: any) => (
    <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-slate-400">
            <Icon size={14} />
            <p className="text-[10px] font-black uppercase tracking-widest">{label}</p>
        </div>
        <p className="text-xs font-bold text-slate-700">{value || "---"}</p>
    </div>
);

const DashboardStat = ({ label, value, icon: Icon, color, bg }: any) => (
    <div className="bg-white p-6 rounded-[2rem] shadow-lg border border-slate-100 hover:shadow-xl transition-all group">
        <div className={`w-12 h-12 ${bg} ${color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
            <Icon size={24} />
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <h4 className="text-3xl font-black text-slate-800">{value}</h4>
    </div>
);

const BenefitItem = ({ text }: { text: string }) => (
    <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
        {text}
    </div>
);
