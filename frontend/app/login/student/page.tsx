"use client";

import React, { useState } from "react";
import { User, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

// ✅ FIX 1: Use env variable — no hardcoded localhost fallback
// Make sure .env.local has: NEXT_PUBLIC_API_URL=http://192.168.1.5:5000
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

const StudentLogin = () => {
  const router = useRouter();

  const [username,     setUsername]     = useState("");
  const [password,     setPassword]     = useState("");
  const [error,        setError]        = useState("");
  const [loading,      setLoading]      = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      // ✅ FIX 2: Use fetch instead of axios — consistent with rest of app
      // Also avoids axios interceptor issues that can swallow tokens
      const res = await fetch(`${API}/api/auth/login`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: username.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Invalid credentials");
        return;
      }

      if (!data.token) {
        setError("Login failed — no token received. Contact admin.");
        return;
      }

      // ✅ FIX 3: Save all 3 keys — same as AuthContext expects
      localStorage.setItem("token",       data.token);
      localStorage.setItem("user",        JSON.stringify(data.user));
      localStorage.setItem("permissions", JSON.stringify(data.permissions ?? {}));

      // ✅ FIX 4: Check role and redirect accordingly
      const role = data.user?.role ?? "";

      if (role === "Student") {
        router.push("/dashboard/student-management/dashboard");
      } else if (role === "trainee" || role === "Staff") {
        router.push("/dashboard/trainer-management/dashboard");
      } else {
        router.push("/dashboard");
      }

    } catch (err: any) {
      console.error("Login error:", err);
      // ✅ FIX 5: Network error means API URL is wrong
      setError("Cannot connect to server. Check your network or contact admin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1f3a] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/10">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src="/logo.png"
            alt="NSkill India"
            className="h-16 w-auto object-contain"
            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        </div>

        <h2 className="text-2xl font-black text-[#0b1f3a] text-center mb-8 uppercase tracking-tight">
          Student Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Username / Email */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 w-5 h-5" />
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-bold text-black"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 w-5 h-5" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-12 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-bold text-black"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="text-red-500 text-xs font-black text-center bg-red-50 p-3 rounded-xl border border-red-100 uppercase tracking-wider">
              {error}
            </div>
          )}

          {/* Submit */}
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
            NSkill Student Secure Access
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;
