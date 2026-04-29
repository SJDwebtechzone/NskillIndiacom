"use client";

import React, { useState } from "react";
import { Briefcase, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";

const TraineeLogin = () => {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!username || !password) {
            setError("Please fill in all fields");
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/login`, {
                email: username,
                password
            });

            // ✅ Save token + user + permissions
            localStorage.setItem("token",       res.data.token);
            localStorage.setItem("user",        JSON.stringify(res.data.user));
            localStorage.setItem("permissions", JSON.stringify(res.data.permissions));

            router.push("/dashboard/trainer-management/dashboard");
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || "Invalid credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0b1f3a] flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md animate-in fade-in zoom-in duration-500 border border-white/10">

                <div className="flex justify-center mb-6">
                    <img src="/logo.png" alt="Logo" className="h-16 w-auto object-contain" />
                </div>

                <h2 className="text-2xl font-black text-[#0b1f3a] text-center mb-8 uppercase tracking-tight">
                    Trainer Login
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Username */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                            Username / Email
                        </label>
                        <div className="relative">
                            <Briefcase
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600"
                                size={20}
                            />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-bold text-black"
                                placeholder="name@nskill.com"
                                required
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                            Secure Password
                        </label>
                        <div className="relative">
                            <Lock
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600"
                                size={20}
                            />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-12 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-bold text-black"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-500 text-xs font-black text-center bg-red-50 p-3 rounded-xl border border-red-100 uppercase tracking-wider">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#0b1f3a] text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-blue-900 transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-blue-900/20"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {loading ? "Verifying..." : "Sign In"}
                    </button>

                </form>

                <div className="mt-10 text-center">
                    <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black">
                        NSkill Trainee Secure Access
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TraineeLogin;
