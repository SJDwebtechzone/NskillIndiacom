"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Wallet, TrendingUp, Users, ArrowUpRight,
    Calendar, User, Clock, CheckCircle2,
    AlertCircle, RefreshCw, Award, Search,
    Download, Filter, CreditCard, IndianRupee,
    BadgeCheck, Hourglass
} from "lucide-react";
import axios from "axios";

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}/api`;

export default function AdminReferralPaymentPage() {
    const [points, setPoints] = useState<any[]>([]);
    const [filtered, setFiltered] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "settled" | "pending">("all");
    const [stats, setStats] = useState({
        totalEarned: 0,
        pendingSettlement: 0,
        settledAmount: 0,
        totalReferrals: 0,
        uniqueAssociates: 0,
    });

    const getAuthHeaders = () => {
        const token = localStorage.getItem("token");
        return { Authorization: `Bearer ${token}` };
    };

    useEffect(() => {
        fetchAllPoints();
    }, []);

    useEffect(() => {
        let data = points;
        if (search.trim()) {
            const q = search.toLowerCase();
            data = data.filter(p =>
                p.student_name?.toLowerCase().includes(q) ||
                p.associate_name?.toLowerCase().includes(q) ||
                p.associate_email?.toLowerCase().includes(q)
            );
        }
        if (statusFilter === "settled") data = data.filter(p => p.is_settled);
        if (statusFilter === "pending") data = data.filter(p => !p.is_settled);
        setFiltered(data);
    }, [search, statusFilter, points]);

    const fetchAllPoints = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/admissions/referral-points/all`, {
                headers: getAuthHeaders()
            });
            const data = res.data;
            setPoints(data);
            setFiltered(data);

            const total = data.reduce((acc: number, curr: any) => acc + parseFloat(curr.points_earned || 0), 0);
            const pending = data.filter((p: any) => !p.is_settled).reduce((acc: number, curr: any) => acc + parseFloat(curr.points_earned || 0), 0);
            const settled = data.filter((p: any) => p.is_settled).reduce((acc: number, curr: any) => acc + parseFloat(curr.points_earned || 0), 0);
            const uniqueAssocIds = new Set(data.map((p: any) => p.associate_id));

            setStats({
                totalEarned: total,
                pendingSettlement: pending,
                settledAmount: settled,
                totalReferrals: data.length,
                uniqueAssociates: uniqueAssocIds.size,
            });
        } catch (err) {
            console.error("Failed to fetch all referral points", err);
        } finally {
            setIsLoading(false);
        }
    };

    const markSettled = async (id: number) => {
        try {
            await axios.patch(`${API_BASE}/admissions/referral-points/${id}/settle`, {}, {
                headers: getAuthHeaders()
            });
            setPoints(prev => prev.map(p => p.id === id ? { ...p, is_settled: true } : p));
        } catch (err: any) {
            alert(err.response?.data?.error || "Failed to mark as settled.");
        }
    };

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="relative p-10 bg-[#0b1f3a] rounded-[3rem] text-white overflow-hidden shadow-2xl">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                            <Wallet size={22} className="text-blue-300" />
                        </div>
                        <span className="text-blue-300 font-black uppercase text-[10px] tracking-[0.25em]">Super Admin</span>
                    </div>
                    <h2 className="text-4xl font-black tracking-tight mb-2">Referral Fee History</h2>
                    <p className="text-blue-300/70 font-medium text-sm">All associates' referral commissions &amp; payment tracking</p>
                </div>
                <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-400/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard label="Total Commission" value={`₹ ${stats.totalEarned.toLocaleString()}`} icon={IndianRupee} color="bg-blue-600" />
                <StatCard label="Pending Payment" value={`₹ ${stats.pendingSettlement.toLocaleString()}`} icon={Hourglass} color="bg-amber-500" />
                <StatCard label="Settled" value={`₹ ${stats.settledAmount.toLocaleString()}`} icon={BadgeCheck} color="bg-green-600" />
                <StatCard label="Total Referrals" value={stats.totalReferrals.toString()} icon={TrendingUp} color="bg-purple-600" />
                <StatCard label="Associates" value={stats.uniqueAssociates.toString()} icon={Users} color="bg-slate-700" />
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
                {/* Table Header */}
                <div className="p-6 border-b border-slate-100 flex flex-wrap gap-4 items-center justify-between">
                    <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                        <TrendingUp className="text-blue-600" /> All Referral Points
                    </h3>
                    <div className="flex flex-wrap gap-3 items-center">
                        {/* Status filter */}
                        <div className="flex rounded-xl overflow-hidden border border-slate-200">
                            {(["all", "pending", "settled"] as const).map(s => (
                                <button key={s} onClick={() => setStatusFilter(s)}
                                    className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === s ? 'bg-[#0b1f3a] text-white' : 'bg-white text-slate-400 hover:bg-slate-50'}`}>
                                    {s}
                                </button>
                            ))}
                        </div>
                        {/* Search */}
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search associate / student..."
                                className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-blue-400 font-medium text-slate-700 w-56"
                            />
                        </div>
                        {/* Refresh */}
                        <button onClick={fetchAllPoints} className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
                            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} /> Refresh
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="py-20 flex flex-col items-center gap-4">
                            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                            <p className="font-bold text-slate-400 animate-pulse">Loading referral data...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="py-24 text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertCircle size={40} className="text-slate-300" />
                            </div>
                            <h4 className="text-lg font-black text-slate-400">No Records Found</h4>
                            <p className="text-slate-400 text-sm mt-2 max-w-xs mx-auto">
                                {search ? "No records match your search." : "No referral points have been generated yet."}
                            </p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="py-4 px-6 font-black uppercase text-[10px] tracking-widest text-slate-400">#</th>
                                    <th className="py-4 px-6 font-black uppercase text-[10px] tracking-widest text-slate-400">Associate</th>
                                    <th className="py-4 px-6 font-black uppercase text-[10px] tracking-widest text-slate-400">Student</th>
                                    <th className="py-4 px-6 font-black uppercase text-[10px] tracking-widest text-slate-400">Date</th>
                                    <th className="py-4 px-6 font-black uppercase text-[10px] tracking-widest text-slate-400">Course Fee</th>
                                    <th className="py-4 px-6 font-black uppercase text-[10px] tracking-widest text-slate-400">Commission (10%)</th>
                                    <th className="py-4 px-6 font-black uppercase text-[10px] tracking-widest text-slate-400 text-center">Status</th>
                                    <th className="py-4 px-6 font-black uppercase text-[10px] tracking-widest text-slate-400 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((item, idx) => (
                                    <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-all group">
                                        <td className="py-4 px-6 text-xs font-bold text-slate-400">{idx + 1}</td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 font-black text-xs flex items-center justify-center flex-shrink-0">
                                                    {(item.associate_name || "?").split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-800 text-sm">{item.associate_name || "—"}</p>
                                                    <p className="text-[10px] text-slate-400 font-medium">{item.associate_email || "—"}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex-shrink-0">
                                                    {item.photo_url ? (
                                                        <img 
                                                            src={`${process.env.NEXT_PUBLIC_API_URL?.endsWith('/') ? process.env.NEXT_PUBLIC_API_URL : process.env.NEXT_PUBLIC_API_URL + '/'}${item.photo_url}`} 
                                                            alt="" 
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.student_name)}&background=0b1f3a&color=fff`;
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-[8px] font-black text-slate-300">NONE</div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 text-sm">{item.student_name}</p>
                                                    <p className="text-[10px] text-slate-400 font-mono">Adm #: {item.admission_number || item.enquiry_id || item.admission_id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-sm font-medium text-slate-500">
                                            {new Date(item.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                        </td>
                                        <td className="py-4 px-6 font-bold text-slate-700">
                                            ₹ {parseFloat(item.course_fee).toLocaleString()}
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex flex-col">
                                                <span className={`font-black text-lg ${parseFloat(item.points_earned) === 0 ? 'text-slate-400' : 'text-blue-600'}`}>
                                                    ₹ {parseFloat(item.points_earned).toLocaleString()}
                                                </span>
                                                {parseFloat(item.points_earned) === 0 && (
                                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mt-1 italic">Waiting for Stud. Payment</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${item.is_settled ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-amber-100 text-amber-700 border border-amber-200'}`}>
                                                {item.is_settled ? "✓ Paid & Settled" : (parseFloat(item.points_earned) === 0 ? "⏳ Pending Balance" : "⏳ Pending Payment")}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            {!item.is_settled ? (
                                                <button
                                                    onClick={() => {
                                                        if (parseFloat(item.points_earned) === 0) {
                                                            alert("Commission cannot be paid until the student clears their course balance.");
                                                            return;
                                                        }
                                                        if (confirm(`Confirm Payment of ₹ ${parseFloat(item.points_earned).toLocaleString()} to ${item.associate_name}?`)) {
                                                            markSettled(item.id);
                                                        }
                                                    }}
                                                    className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${parseFloat(item.points_earned) === 0 ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
                                                >
                                                    Pay Now
                                                </button>
                                            ) : (
                                                <span className="text-[10px] text-slate-300 font-bold uppercase">Done</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {!isLoading && filtered.length > 0 && (
                    <div className="px-6 py-4 border-t border-slate-50 flex justify-between items-center">
                        <p className="text-xs font-bold text-slate-400">
                            Showing {filtered.length} of {points.length} records
                        </p>
                        <p className="text-xs font-black text-slate-600">
                            Total shown: ₹ {filtered.reduce((acc, p) => acc + parseFloat(p.points_earned || 0), 0).toLocaleString()}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

const StatCard = ({ label, value, icon: Icon, color }: any) => (
    <motion.div
        whileHover={{ y: -4 }}
        className="bg-white p-5 rounded-[1.8rem] shadow-lg border border-slate-100 flex items-center gap-4"
    >
        <div className={`p-3 rounded-2xl ${color} text-white shadow-lg flex-shrink-0`}>
            <Icon size={20} />
        </div>
        <div className="min-w-0">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5 truncate">{label}</p>
            <h4 className="text-xl font-black text-slate-800 truncate">{value}</h4>
        </div>
    </motion.div>
);
