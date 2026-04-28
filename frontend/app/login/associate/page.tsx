"use client";

import React, { useState } from "react";
import { User, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";

const AssociateLogin = () => {
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

            localStorage.setItem("token",       res.data.token);
            localStorage.setItem("user",        JSON.stringify(res.data.user));
            localStorage.setItem("permissions", JSON.stringify(res.data.permissions));
            
            router.push("/dashboard/associate-management/dashboard");
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || "Invalid credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0b1f3a] flex items-center justify-center px-4">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md animate-in fade-in zoom-in duration-500">

                <div className="flex justify-center mb-6">
                    <img src="/logo.png" alt="Logo" className="h-20 w-auto object-contain" />
                </div>

                <h2 className="text-2xl font-bold text-[#0b1f3a] text-center mb-8 uppercase tracking-tight">
                    Associate Login
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Username */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Username
                        </label>
                        <div className="relative">
                            <User
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                size={20}
                            />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0b1f3a] focus:border-transparent transition-all font-bold text-black"
                                placeholder="Enter username"
                                required
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <Lock
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                size={20}
                            />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0b1f3a] focus:border-transparent transition-all font-bold text-black"
                                placeholder="Enter password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors p-1"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-500 text-xs font-bold text-center bg-red-50 p-2 rounded-lg border border-red-100">
                            {error}
                        </div>
                    )}

                    {/* Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#0b1f3a] text-white py-3 rounded-lg font-semibold hover:bg-[#1a3a5f] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 active:scale-[0.98]"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {loading ? "Signing In..." : "Sign In"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AssociateLogin;
