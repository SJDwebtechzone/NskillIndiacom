




"use client";

import { useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Eye, EyeOff, Sparkles, ArrowRight } from "lucide-react";

type FormType = {
  name: string;
  email: string;
  password: string;
  phone: string;
  status: string;
};

export default function PlacementRegister() {
  const router = useRouter();
  const [form, setForm] = useState<FormType>({
    name: "",
    email: "",
    password: "",
    phone: "",
    status: "",
  });
  const [loading, setLoading] = useState(false);
  const [tried, setTried] = useState(false);
  const [showPass, setShowPass] = useState(false);
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
  const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setTried(true);
    if (!form.name || !form.email || !form.password || !form.phone || !form.status) return;

    try {
      setLoading(true);
      const res = await fetch(`${API}/api/placement/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Something went wrong");
        setLoading(false);
        return;
      }
      alert("Registered Successfully!");
      // Save user and token to localStorage so profile page can pick it up
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
      if (data.token) localStorage.setItem("token", data.token);
      setForm({ name: "", email: "", password: "", phone: "", status: "" });
      router.push("/placements/profile");
    } catch (err) {
      console.error(err);
      alert("Server Error");
    } finally {
      setLoading(false);
    }
  };

  const fieldBorderClass = (val: string) => {
    if (!tried) return "border-slate-200";
    return !val ? "border-[#e24b4a]" : "border-blue-600";
    if (!tried) return "border-slate-200 focus:border-[#0a2d5c]";
    return !val ? "border-red-400 bg-red-50/20" : "border-[#0a2d5c] bg-white";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 md:p-8 relative overflow-hidden">
      {/* Blobs */}
      <div className="absolute w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.15)_0%,transparent_70%)] -top-24 -left-24 pointer-events-none" />
      <div className="absolute w-[350px] h-[350px] rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.1)_0%,transparent_70%)] -bottom-20 -right-20 pointer-events-none" />
    <div className="min-h-screen flex items-center justify-center bg-[#f3f5f9] p-4 md:p-8 relative overflow-hidden font-[Segoe_UI,sans-serif]">
      {/* Background Glow Blobs */}
      <div className="absolute w-[450px] h-[450px] rounded-full bg-[radial-gradient(circle,rgba(10,45,92,0.12)_0%,transparent_70%)] -top-24 -left-24 pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(255,140,42,0.1)_0%,transparent_70%)] -bottom-20 -right-20 pointer-events-none" />

      {/* Card */}
      <div className="flex flex-col md:flex-row w-full max-w-[820px] rounded-3xl overflow-hidden shadow-2xl border border-slate-200 relative z-10">
      {/* Main Container Card */}
      <div className="flex flex-col md:flex-row w-full max-w-[860px] rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 bg-white relative z-10">

        {/* LEFT PANEL */}
        <div className="w-full md:w-[42%] bg-blue-600 p-8 md:p-10 flex flex-col gap-6 justify-between">
          {/* Logo */}
        {/* ── LEFT PANEL (Navy Blue & Orange) ── */}
        <div className="w-full md:w-[42%] bg-gradient-to-br from-[#061f4d] via-[#0a2d5c] to-[#082d57] p-8 md:p-10 flex flex-col gap-6 justify-between relative overflow-hidden text-white">
          {/* Subtle Orange Glow Accent */}
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-[#ff8c2a]/15 rounded-full blur-2xl pointer-events-none" />

          {/* Logo Badge */}
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-white inline-block shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
            <span className="text-white text-xl font-black tracking-widest uppercase">Placement</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff8c2a] inline-block shadow-[0_0_10px_rgba(255,140,42,0.8)]" />
            <span className="text-white text-lg font-black tracking-widest uppercase">
              N-Skill Placement
            </span>
          </div>

          <div>
            <h2 className="text-[26px] font-black text-white leading-tight mb-3 tracking-tight">
              Start your own career<br />journey today.
              Start your own <br />
              <span className="text-[#ff8c2a]">career journey</span> today.
            </h2>
            <p className="text-[14px] text-white/80 leading-relaxed font-medium">
              Build your profile once and apply to thousands of jobs with a single click.
            <p className="text-[13px] text-blue-100/80 leading-relaxed font-medium">
              Build your technical profile once and get recommended directly to top hiring companies.
            </p>
          </div>

          {/* Feature List */}
          <div className="flex flex-col gap-3">
            {[
              "Instant job alerts for your skills",
              "Easy one-click apply",
              "Career growth tracking",
              "Top company visibility",
              "Instant job alerts for your technical skills",
              "Direct interview calls from verified employers",
              "Continuous placement cell assistance",
              "100% Free career & resume support",
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="w-[22px] h-[22px] rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                <div className="w-[20px] h-[20px] rounded-full bg-[#ff8c2a]/20 border border-[#ff8c2a]/30 flex items-center justify-center shrink-0 text-[#ff8c2a]">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span className="text-[13px] text-white/90">{f}</span>
                <span className="text-[12.5px] text-blue-50/90 font-medium">{f}</span>
              </div>
            ))}
          </div>

          <p className="text-[13px] text-white/70">
            Already have an account?{" "}
            <span
              className="text-white font-semibold cursor-pointer hover:underline"
              onClick={() => router.push("/placements/login")}
            >
              Login →
            </span>
          </p>
          <div>
            <p className="text-[13px] text-blue-100/70">
              Already have an account?{" "}
              <span
                className="text-[#ff8c2a] font-bold cursor-pointer hover:underline inline-flex items-center gap-1 ml-1"
                onClick={() => router.push("/placements/login")}
              >
                Login <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </p>
          </div>

          {/* QR Code Section */}
          <div className="mt-4 pt-6 border-t border-white/10">
            <div className="flex items-center gap-4 mb-3">
              <div className="bg-white p-2 rounded-2xl shadow-xl">
          <div className="pt-5 border-t border-white/10">
            <div className="flex items-center gap-3.5">
              <div className="bg-white p-1.5 rounded-xl shadow-lg shrink-0">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent("https://nskillindia.com/placements/recommended-jobs")}`} 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=70x70&data=${encodeURIComponent("https://nskillindia.com/placements/recommended-jobs")}`} 
                  alt="QR Code" 
                  className="w-16 h-16"
                  className="w-14 h-14"
                />
              </div>
              <div>
                <p className="text-[11px] font-black text-white uppercase tracking-wider mb-1">Recommended Jobs</p>
                <p className="text-[10px] text-white/60 leading-tight">Scan this QR to view<br />jobs curated for you</p>
                <p className="text-[11px] font-black text-white uppercase tracking-wider mb-0.5">Recommended Jobs</p>
                <p className="text-[10px] text-blue-100/70 leading-tight mb-1">Scan to view job openings</p>
                <Link 
                  href="/placements/recommended-jobs"
                  className="text-[11px] text-[#ff8c2a] hover:text-[#ef7f15] font-bold flex items-center gap-1 underline underline-offset-2"
                >
                  Explore Jobs →
                </Link>
              </div>
            </div>
            <Link 
              href="/placements/recommended-jobs"
              className="text-[11px] text-white/50 hover:text-white transition-colors font-bold flex items-center gap-1 mt-1 underline underline-offset-4 decoration-white/20"
            >
              Link →
            </Link>
          </div>
        </div>

        {/* RIGHT PANEL */}
        {/* ── RIGHT PANEL (Form) ── */}
        <div className="w-full md:w-[58%] bg-white flex items-center justify-center p-6 md:p-8 overflow-y-auto">
          <div className="w-full flex flex-col gap-3.5">
          <div className="w-full flex flex-col gap-4">
            <div>
              <h2 className="text-[22px] font-semibold text-[#1e1e2e] mb-1">Create your profile</h2>
              <p className="text-[13px] text-gray-400">It only takes a minute</p>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-[#ff8c2a] mb-1">
                <Sparkles className="w-3.5 h-3.5" /> Quick Registration
              </div>
              <h2 className="text-[24px] font-black text-[#0a2d5c] tracking-tight">Create your profile</h2>
              <p className="text-[13px] text-slate-500 font-medium">It only takes a minute to get job-ready</p>
            </div>

            {/* Full Name */}
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-semibold text-[#555] tracking-[0.3px]">Full Name</label>
              <label className="text-[12px] font-bold text-[#0a2d5c] tracking-[0.2px]">Full Name *</label>
              <input
                name="name"
                value={form.name}
                placeholder="Enter your full name"
                onChange={handleChange}
                className={`w-full px-3 py-2.5 rounded-xl border-[1.5px] text-[14px] text-[#0b1f3a] outline-none bg-slate-50 ${fieldBorderClass(form.name)}`}
                className={`w-full px-3.5 py-2.5 rounded-xl border-[1.5px] text-[14px] text-[#0a2d5c] outline-none bg-slate-50/80 transition-all ${fieldBorderClass(form.name)}`}
              />
              {tried && !form.name && <p className="text-[11px] text-[#e24b4a] mt-0.5">Name cannot be empty</p>}
              {tried && !form.name && <p className="text-[11px] text-red-500 font-medium mt-0.5">Name cannot be empty</p>}
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-semibold text-[#555] tracking-[0.3px]">Email ID</label>
              <label className="text-[12px] font-bold text-[#0a2d5c] tracking-[0.2px]">Email Address *</label>
              <input
                name="email"
                type="email"
                value={form.email}
                placeholder="Enter your email"
                placeholder="Enter your email address"
                onChange={handleChange}
                className={`w-full px-3 py-2.5 rounded-xl border-[1.5px] text-[14px] text-[#0b1f3a] outline-none bg-slate-50 ${fieldBorderClass(form.email)}`}
                className={`w-full px-3.5 py-2.5 rounded-xl border-[1.5px] text-[14px] text-[#0a2d5c] outline-none bg-slate-50/80 transition-all ${fieldBorderClass(form.email)}`}
              />
              {tried && !form.email && <p className="text-[11px] text-[#e24b4a] mt-0.5">Email cannot be empty</p>}
              {tried && !form.email && <p className="text-[11px] text-red-500 font-medium mt-0.5">Email cannot be empty</p>}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-semibold text-[#555] tracking-[0.3px]">Password</label>
              <label className="text-[12px] font-bold text-[#0a2d5c] tracking-[0.2px]">Password *</label>
              <div className="relative">
                <input
                  name="password"
                  value={form.password}
                  type={showPass ? "text" : "password"}
                  placeholder="Create a password"
                  placeholder="Create a secure password"
                  onChange={handleChange}
                  className={`w-full px-3 py-2.5 pr-11 rounded-xl border-[1.5px] text-[14px] text-[#0b1f3a] outline-none bg-slate-50 ${fieldBorderClass(form.password)}`}
                  className={`w-full px-3.5 py-2.5 pr-11 rounded-xl border-[1.5px] text-[14px] text-[#0a2d5c] outline-none bg-slate-50/80 transition-all ${fieldBorderClass(form.password)}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer p-0 flex items-center"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0a2d5c] cursor-pointer p-1 transition-colors"
                >
                  {showPass ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {tried && !form.password && <p className="text-[11px] text-[#e24b4a] mt-0.5">Password cannot be empty</p>}
              {tried && !form.password && <p className="text-[11px] text-red-500 font-medium mt-0.5">Password cannot be empty</p>}
            </div>

            {/* Phone */}
            {/* Mobile Phone */}
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-semibold text-[#555] tracking-[0.3px]">Mobile Number</label>
              <label className="text-[12px] font-bold text-[#0a2d5c] tracking-[0.2px]">Mobile Number *</label>
              <input
                name="phone"
                value={form.phone}
                placeholder="Enter your mobile number"
                placeholder="Enter 10-digit mobile number"
                onChange={handleChange}
                className={`w-full px-3 py-2.5 rounded-xl border-[1.5px] text-[14px] text-[#0b1f3a] outline-none bg-slate-50 ${fieldBorderClass(form.phone)}`}
                className={`w-full px-3.5 py-2.5 rounded-xl border-[1.5px] text-[14px] text-[#0a2d5c] outline-none bg-slate-50/80 transition-all ${fieldBorderClass(form.phone)}`}
              />
              {tried && !form.phone && <p className="text-[11px] text-[#e24b4a] mt-0.5">Mobile cannot be empty</p>}
              {tried && !form.phone && <p className="text-[11px] text-red-500 font-medium mt-0.5">Mobile number cannot be empty</p>}
            </div>

            {/* Work Status */}
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-semibold text-[#555] tracking-[0.3px]">Work Status</label>
              <div className="flex gap-2.5">
              <label className="text-[12px] font-bold text-[#0a2d5c] tracking-[0.2px]">Work Status *</label>
              <div className="flex gap-3">
                {["experienced", "fresher"].map((val) => (
                  <label
                    key={val}
                    className={`flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border-[1.5px] cursor-pointer transition-all duration-200 ${
                    className={`flex-1 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border-[1.5px] cursor-pointer transition-all ${
                      form.status === val
                        ? "border-blue-600 bg-blue-50"
                        : "border-slate-200 bg-slate-50"
                        ? "border-[#0a2d5c] bg-[#0a2d5c]/5 text-[#0a2d5c] shadow-xs"
                        : "border-slate-200 bg-slate-50/80 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={val}
                      checked={form.status === val}
                      onChange={handleChange}
                      className="hidden"
                    />
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        form.status === val ? "border-blue-600" : "border-gray-300"
                        form.status === val ? "border-[#0a2d5c]" : "border-slate-300"
                      }`}
                    >
                      {form.status === val && (
                        <div className="w-[7px] h-[7px] rounded-full bg-blue-600" />
                        <div className="w-[8px] h-[8px] rounded-full bg-[#ff8c2a]" />
                      )}
                    </div>
                    <span
                      className={`text-[13px] font-medium capitalize ${
                        form.status === val ? "text-blue-700" : "text-[#555]"
                      }`}
                    >
                      {val}
                    <span className="text-[13px] font-bold capitalize">
                      {val === "experienced" ? "I am Experienced" : "I am a Fresher"}
                    </span>
                  </label>
                ))}
              </div>
              {tried && !form.status && <p className="text-[11px] text-[#e24b4a] mt-0.5">Please select work status</p>}
              {tried && !form.status && <p className="text-[11px] text-red-500 font-medium mt-0.5">Please select your work status</p>}
            </div>

            {/* Register Button */}
            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 transition-colors text-white text-[15px] font-bold border-none cursor-pointer mt-1 disabled:opacity-70"
              className="w-full py-3.5 rounded-xl bg-[#ff8c2a] hover:bg-[#ef7f15] text-white text-[15px] font-black uppercase tracking-wide shadow-lg shadow-orange-900/15 transition-all active:scale-95 disabled:opacity-70 cursor-pointer mt-1"
            >
              {loading ? "Registering..." : "Create Account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
