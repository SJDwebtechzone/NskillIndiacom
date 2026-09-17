"use client";

import { useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Check, Eye, EyeOff, Sparkles, ArrowRight } from "lucide-react";

type Step = "login" | "forgot" | "otp" | "reset" | "done";

export default function PlacementLogin() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [tried, setTried] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  const [step, setStep] = useState<Step>("login");
  const [fpEmail, setFpEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fpLoading, setFpLoading] = useState(false);
  const [fpError, setFpError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
  const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    setTried(true);
    if (!form.email || !form.password) return;
    try {
      const res = await fetch(`${API}/api/placement/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error); return; }
      localStorage.setItem("user", JSON.stringify(data.user));
      if (data.token) localStorage.setItem("token", data.token);
      window.location.href = "/placements/profile";
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  const handleSendOtp = async () => {
    setFpError("");
    if (!fpEmail) { setFpError("Please enter your email"); return; }
    setFpLoading(true);
    try {
      const res = await fetch(`${API}/api/placement/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fpEmail }),
      });
      const data = await res.json();
      if (!res.ok) { setFpError(data.error); return; }
      setStep("otp");
      setResendTimer(60);
      const t = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) { clearInterval(t); return 0; }
          return prev - 1;
        });
      }, 1000);
    } catch {
      setFpError("Server error. Try again.");
    } finally {
      setFpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setFpError("");
    const otpValue = otp.join("");
    if (otpValue.length < 6) { setFpError("Enter the 6-digit OTP"); return; }
    setFpLoading(true);
    try {
      const res = await fetch(`${API}/api/placement/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fpEmail, otp: otpValue }),
      });
      const data = await res.json();
      if (!res.ok) { setFpError(data.error); return; }
      setStep("reset");
    } catch {
      setFpError("Server error. Try again.");
    } finally {
      setFpLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setFpError("");
    if (!newPassword) { setFpError("Enter new password"); return; }
    if (newPassword.length < 6) { setFpError("Password must be at least 6 characters"); return; }
    if (newPassword !== confirmPassword) { setFpError("Passwords do not match"); return; }
    setFpLoading(true);
    try {
      const res = await fetch(`${API}/api/placement/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fpEmail, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setFpError(data.error); return; }
      setStep("done");
    } catch {
      setFpError("Server error. Try again.");
    } finally {
      setFpLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const updated = [...otp];
    updated[index] = value.slice(-1);
    setOtp(updated);
    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`);
      next?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prev = document.getElementById(`otp-${index - 1}`);
      prev?.focus();
    }
  };

  // ── Shared input border color helper ──
  const inputBorder = (val: string, error?: boolean) =>
    error
      ? "border-red-400"
      ? "border-red-400 bg-red-50/20"
      : val
      ? "border-blue-600"
      : "border-slate-200";
      ? "border-[#0a2d5c] bg-white"
      : "border-slate-200 bg-slate-50/80 focus:border-[#0a2d5c]";

  return (
    /* Wrapper */
    <div className="relative min-h-screen flex items-center justify-center bg-gray-50 p-4 sm:p-8 overflow-hidden">
    <div className="relative min-h-screen flex items-center justify-center bg-[#f3f5f9] p-4 sm:p-8 overflow-hidden font-[Segoe_UI,sans-serif]">
      {/* Background Blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-80 h-80 rounded-full bg-[radial-gradient(circle,rgba(10,45,92,0.12)_0%,transparent_70%)]" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-[radial-gradient(circle,rgba(255,140,42,0.1)_0%,transparent_70%)]" />

      {/* Blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-80 h-80 rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.15)_0%,transparent_70%)]" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.1)_0%,transparent_70%)]" />

      {/* Card */}
      <div className="relative z-10 flex flex-col md:flex-row w-full max-w-[820px] rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
      <div className="relative z-10 flex flex-col md:flex-row w-full max-w-[820px] rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 bg-white">

        {/* ── LEFT PANEL ── */}
        <div className="md:w-[44%] bg-blue-600 p-8 md:p-10 flex flex-col gap-6 justify-between">
        <div className="md:w-[44%] bg-gradient-to-br from-[#061f4d] via-[#0a2d5c] to-[#082d57] p-8 md:p-10 flex flex-col gap-6 justify-between text-white relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-[#ff8c2a]/15 rounded-full blur-2xl pointer-events-none" />

          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-white" />
            <span className="text-white text-lg font-semibold tracking-widest">Placement</span>
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#ff8c2a] shadow-[0_0_10px_rgba(255,140,42,0.8)]" />
            <span className="text-white text-lg font-black tracking-widest uppercase">N-Skill Placement</span>
          </div>

          {/* Title + sub */}
          {/* Title */}
          <div>
            <h2 className="text-white text-2xl font-semibold leading-snug mb-2">
              Find your next<br />dream job today.
            <h2 className="text-white text-2xl font-black leading-snug mb-2">
              Find your next<br />
              <span className="text-[#ff8c2a]">dream job</span> today.
            </h2>
            <p className="text-white/70 text-sm leading-relaxed">
              Join over 5 crore professionals building their careers on Naukri.
            <p className="text-blue-100/80 text-xs leading-relaxed font-medium">
              Join thousands of skilled professionals getting placed at top companies across India.
            </p>
          </div>

          {/* Feature list */}
          <div className="flex flex-col gap-3">
            {[
              "One click apply using your profile",
              "Get AI-matched job recommendations",
              "Showcase your profile to top companies",
              "Track all application statuses",
              "Direct interview notifications",
              "Verified corporate hiring partners",
              "Free placement tracking & support",
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-[22px] h-[22px] rounded-full bg-white/20 flex items-center justify-center">
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
              <div key={i} className="flex items-center gap-2.5">
                <div className="flex-shrink-0 w-[20px] h-[20px] rounded-full bg-[#ff8c2a]/20 border border-[#ff8c2a]/30 flex items-center justify-center text-[#ff8c2a]">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span className="text-white/90 text-sm">{f}</span>
                <span className="text-blue-50/90 text-[12.5px] font-medium">{f}</span>
              </div>
            ))}
          </div>

          {/* Register btn */}
          <button
            className="w-fit px-5 py-2.5 bg-white text-blue-600 text-sm font-semibold rounded-xl cursor-pointer border-none"
            className="w-fit px-5 py-2.5 bg-[#ff8c2a] hover:bg-[#ef7f15] text-white text-xs font-black uppercase tracking-wide rounded-xl cursor-pointer border-none shadow-md transition-all active:scale-95 flex items-center gap-1.5"
            onClick={() => router.push("/placements/register")}
          >
            Register for free →
            Register for free <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="md:w-[56%] bg-white flex items-center justify-center p-8 md:p-10">
          <div className="w-full flex flex-col gap-4">

            {/* ── LOGIN FORM ── */}
            {step === "login" && (
              <>
                <div>
                  <h2 className="text-[#0b1f3a] text-2xl font-semibold mb-1">Welcome back</h2>
                  <p className="text-gray-400 text-sm">Login to access your account</p>
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-[#ff8c2a] mb-1">
                    <Sparkles className="w-3.5 h-3.5" /> Welcome Back
                  </div>
                  <h2 className="text-[#0a2d5c] text-2xl font-black mb-1 tracking-tight">Login to Account</h2>
                  <p className="text-slate-500 text-xs font-medium">Enter your credentials to continue</p>
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-500 tracking-wide">Email ID / Username</label>
                  <label className="text-xs font-bold text-[#0a2d5c] tracking-wide">Email Address *</label>
                  <input
                    name="email"
                    type="text"
                    placeholder="Enter your email or username"
                    placeholder="Enter your email address"
                    value={form.email}
                    onChange={handleChange}
                    className={`w-full px-3 py-2.5 rounded-xl border-[1.5px] text-sm text-[#0b1f3a] bg-slate-50 outline-none transition-colors ${inputBorder(form.email, tried && !form.email)}`}
                    className={`w-full px-3.5 py-2.5 rounded-xl border-[1.5px] text-sm text-[#0a2d5c] outline-none transition-colors ${inputBorder(form.email, tried && !form.email)}`}
                  />
                  {tried && !form.email && <p className="text-[11px] text-red-400 mt-0.5">Email cannot be empty</p>}
                  {tried && !form.email && <p className="text-[11px] text-red-500 font-medium mt-0.5">Email cannot be empty</p>}
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-500 tracking-wide">Password</label>
                  <label className="text-xs font-bold text-[#0a2d5c] tracking-wide">Password *</label>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPass ? "text" : "password"}
                      placeholder="Enter your password"
                      value={form.password}
                      onChange={handleChange}
                      className={`w-full px-3 py-2.5 pr-11 rounded-xl border-[1.5px] text-sm text-[#0b1f3a] bg-slate-50 outline-none transition-colors ${inputBorder(form.password, tried && !form.password)}`}
                      className={`w-full px-3.5 py-2.5 pr-11 rounded-xl border-[1.5px] text-sm text-[#0a2d5c] outline-none transition-colors ${inputBorder(form.password, tried && !form.password)}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-none border-none cursor-pointer flex items-center p-0"
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0a2d5c] cursor-pointer p-1"
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
                  {tried && !form.password && <p className="text-[11px] text-red-400 mt-0.5">Password cannot be empty</p>}
                  {tried && !form.password && <p className="text-[11px] text-red-500 font-medium mt-0.5">Password cannot be empty</p>}
                </div>

                {/* Forgot */}
                <div className="flex justify-end -mt-1">
                  <span
                    className="text-xs text-blue-600 font-medium cursor-pointer"
                    className="text-xs text-[#0a2d5c] hover:text-[#ff8c2a] font-bold cursor-pointer transition-colors"
                    onClick={() => { setStep("forgot"); setFpError(""); }}
                  >
                    Forgot password?
                  </span>
                </div>

                <button
                  onClick={handleLogin}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 transition-colors text-white text-[15px] font-semibold border-none cursor-pointer"
                  className="w-full py-3.5 rounded-xl bg-[#ff8c2a] hover:bg-[#ef7f15] transition-colors text-white text-[15px] font-black uppercase tracking-wide border-none cursor-pointer shadow-lg shadow-orange-900/15 active:scale-95"
                >
                  Login
                </button>
              </>
            )}

            {/* ── FORGOT: ENTER EMAIL ── */}
            {step === "forgot" && (
              <>
                <div>
                  <button
                    onClick={() => setStep("login")}
                    className="bg-none border-none text-blue-600 text-sm font-medium cursor-pointer p-0 mb-2 block"
                    className="bg-none border-none text-[#0a2d5c] hover:text-[#ff8c2a] text-xs font-bold cursor-pointer p-0 mb-2 block"
                  >
                    ← Back to login
                  </button>
                  <h2 className="text-[#0b1f3a] text-2xl font-semibold mb-1">Forgot password?</h2>
                  <p className="text-gray-400 text-sm">Enter your registered email to receive an OTP</p>
                  <h2 className="text-[#0a2d5c] text-2xl font-black mb-1">Forgot password?</h2>
                  <p className="text-slate-500 text-xs">Enter your registered email to receive an OTP</p>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-500 tracking-wide">Registered Email</label>
                  <label className="text-xs font-bold text-[#0a2d5c] tracking-wide">Registered Email *</label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    placeholder="Enter your registered email"
                    value={fpEmail}
                    onChange={(e) => setFpEmail(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl border-[1.5px] text-sm text-[#0b1f3a] bg-slate-50 outline-none transition-colors ${inputBorder(fpEmail, !!fpError)}`}
                    className={`w-full px-3.5 py-2.5 rounded-xl border-[1.5px] text-sm text-[#0a2d5c] outline-none transition-colors ${inputBorder(fpEmail, !!fpError)}`}
                  />
                  {fpError && <p className="text-[11px] text-red-400 mt-0.5">{fpError}</p>}
                  {fpError && <p className="text-[11px] text-red-500 font-medium mt-0.5">{fpError}</p>}
                </div>

                <button
                  onClick={handleSendOtp}
                  disabled={fpLoading}
                  className={`w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[15px] font-semibold border-none cursor-pointer transition-opacity ${fpLoading ? "opacity-70" : ""}`}
                  className={`w-full py-3.5 rounded-xl bg-[#ff8c2a] hover:bg-[#ef7f15] text-white text-[15px] font-black uppercase tracking-wide border-none cursor-pointer transition-all shadow-md active:scale-95 ${fpLoading ? "opacity-70" : ""}`}
                >
                  {fpLoading ? "Sending OTP..." : "Send OTP"}
                </button>
              </>
            )}

            {/* ── OTP ── */}
            {step === "otp" && (
              <>
                <div>
                  <button
                    onClick={() => setStep("forgot")}
                    className="bg-none border-none text-blue-600 text-sm font-medium cursor-pointer p-0 mb-2 block"
                    className="bg-none border-none text-[#0a2d5c] hover:text-[#ff8c2a] text-xs font-bold cursor-pointer p-0 mb-2 block"
                  >
                    ← Back
                  </button>
                  <h2 className="text-[#0b1f3a] text-2xl font-semibold mb-1">Enter OTP</h2>
                  <p className="text-gray-400 text-sm">
                  <h2 className="text-[#0a2d5c] text-2xl font-black mb-1">Enter OTP</h2>
                  <p className="text-slate-500 text-xs">
                    We sent a 6-digit OTP to <strong>{fpEmail}</strong>
                  </p>
                </div>

                {/* OTP Boxes */}
                <div className="flex gap-2 sm:gap-3 justify-center">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-[22px] font-bold text-[#0b1f3a] rounded-xl border-[1.5px] outline-none transition-all ${
                        digit ? "border-blue-600 bg-blue-50" : "border-slate-200 bg-slate-50"
                      className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-[22px] font-black text-[#0a2d5c] rounded-xl border-[1.5px] outline-none transition-all ${
                        digit ? "border-[#0a2d5c] bg-[#0a2d5c]/5" : "border-slate-200 bg-slate-50"
                      }`}
                      style={{ height: "52px" }}
                    />
                  ))}
                </div>

                {fpError && <p className="text-[11px] text-red-400">{fpError}</p>}
                {fpError && <p className="text-[11px] text-red-500 font-medium text-center">{fpError}</p>}

                <button
                  onClick={handleVerifyOtp}
                  disabled={fpLoading}
                  className={`w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[15px] font-semibold border-none cursor-pointer transition-opacity ${fpLoading ? "opacity-70" : ""}`}
                  className={`w-full py-3.5 rounded-xl bg-[#ff8c2a] hover:bg-[#ef7f15] text-white text-[15px] font-black uppercase tracking-wide border-none cursor-pointer transition-all shadow-md active:scale-95 ${fpLoading ? "opacity-70" : ""}`}
                >
                  {fpLoading ? "Verifying..." : "Verify OTP"}
                </button>

                <p className="text-xs text-gray-400 text-center">
                <p className="text-xs text-slate-500 text-center">
                  Didn&apos;t receive?{" "}
                  {resendTimer > 0 ? (
                    <span className="text-gray-300 font-medium">Resend in {resendTimer}s</span>
                    <span className="text-slate-400 font-medium">Resend in {resendTimer}s</span>
                  ) : (
                    <span className="text-blue-600 font-semibold cursor-pointer" onClick={handleSendOtp}>
                    <span className="text-[#ff8c2a] font-bold cursor-pointer hover:underline" onClick={handleSendOtp}>
                      Resend OTP
                    </span>
                  )}
                </p>
              </>
            )}

            {/* ── RESET PASSWORD ── */}
            {step === "reset" && (
              <>
                <div>
                  <h2 className="text-[#0b1f3a] text-2xl font-semibold mb-1">Set new password</h2>
                  <p className="text-gray-400 text-sm">Choose a strong password for your account</p>
                  <h2 className="text-[#0a2d5c] text-2xl font-black mb-1">Set new password</h2>
                  <p className="text-slate-500 text-xs">Choose a strong password for your account</p>
                </div>

                {/* New Password */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-500 tracking-wide">New Password</label>
                  <label className="text-xs font-bold text-[#0a2d5c] tracking-wide">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPass ? "text" : "password"}
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={`w-full px-3 py-2.5 pr-11 rounded-xl border-[1.5px] text-sm text-[#0b1f3a] bg-slate-50 outline-none transition-colors ${inputBorder(newPassword)}`}
                      className={`w-full px-3.5 py-2.5 pr-11 rounded-xl border-[1.5px] text-sm text-[#0a2d5c] outline-none transition-colors ${inputBorder(newPassword)}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-none border-none cursor-pointer flex items-center p-0"
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0a2d5c] cursor-pointer p-1"
                    >
                      {showNewPass ? (
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
                      {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-500 tracking-wide">Confirm Password</label>
                  <label className="text-xs font-bold text-[#0a2d5c] tracking-wide">Confirm Password</label>
                  <input
                    type="password"
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl border-[1.5px] text-sm text-[#0b1f3a] bg-slate-50 outline-none transition-colors ${
                    className={`w-full px-3.5 py-2.5 rounded-xl border-[1.5px] text-sm text-[#0a2d5c] outline-none transition-colors ${
                      confirmPassword
                        ? confirmPassword === newPassword
                          ? "border-green-400"
                          : "border-red-400"
                        : "border-slate-200"
                          ? "border-green-500 bg-green-50/20"
                          : "border-red-400 bg-red-50/20"
                        : "border-slate-200 bg-slate-50/80"
                    }`}
                  />
                  {confirmPassword && confirmPassword !== newPassword && (
                    <p className="text-[11px] text-red-400 mt-0.5">Passwords do not match</p>
                    <p className="text-[11px] text-red-500 font-medium mt-0.5">Passwords do not match</p>
                  )}
                  {confirmPassword && confirmPassword === newPassword && (
                    <p className="text-[11px] text-green-500 mt-0.5">✓ Passwords match</p>
                    <p className="text-[11px] text-green-600 font-medium mt-0.5">✓ Passwords match</p>
                  )}
                </div>

                {fpError && <p className="text-[11px] text-red-400">{fpError}</p>}
                {fpError && <p className="text-[11px] text-red-500 font-medium">{fpError}</p>}

                <button
                  onClick={handleResetPassword}
                  disabled={fpLoading}
                  className={`w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[15px] font-semibold border-none cursor-pointer transition-opacity ${fpLoading ? "opacity-70" : ""}`}
                  className={`w-full py-3.5 rounded-xl bg-[#ff8c2a] hover:bg-[#ef7f15] text-white text-[15px] font-black uppercase tracking-wide border-none cursor-pointer transition-all shadow-md active:scale-95 ${fpLoading ? "opacity-70" : ""}`}
                >
                  {fpLoading ? "Resetting..." : "Reset Password"}
                </button>
              </>
            )}

            {/* ── DONE ── */}
            {step === "done" && (
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 text-white text-3xl font-bold flex items-center justify-center mb-2">
                <div className="w-16 h-16 rounded-full bg-emerald-500 text-white text-3xl font-bold flex items-center justify-center mb-2 shadow-lg shadow-emerald-500/30">
                  ✓
                </div>
                <h2 className="text-[#0b1f3a] text-2xl font-semibold">Password reset!</h2>
                <p className="text-gray-400 text-sm">
                <h2 className="text-[#0a2d5c] text-2xl font-black">Password reset!</h2>
                <p className="text-slate-500 text-xs">
                  Your password has been successfully changed. You can now login.
                </p>
                <button
                  className="mt-4 w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 transition-colors text-white text-[15px] font-semibold border-none cursor-pointer"
                  className="mt-4 w-full py-3.5 rounded-xl bg-[#ff8c2a] hover:bg-[#ef7f15] transition-colors text-white text-[15px] font-black uppercase tracking-wide border-none cursor-pointer shadow-md"
                  onClick={() => {
                    setStep("login");
                    setFpEmail("");
                    setOtp(["", "", "", "", "", ""]);
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                >
                  Back to Login
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
