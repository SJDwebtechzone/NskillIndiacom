"use client";

import { useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";

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

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    setTried(true);
    if (!form.email || !form.password) return;
    try {
      const res = await fetch("http://localhost:5000/api/placement/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error); return; }
      localStorage.setItem("user", JSON.stringify(data.user));
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
      const res = await fetch("http://localhost:5000/api/placement/forgot-password", {
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
      const res = await fetch("http://localhost:5000/api/placement/verify-otp", {
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
      const res = await fetch("http://localhost:5000/api/placement/reset-password", {
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
      : val
      ? "border-indigo-500"
      : "border-[#e0e0f0]";

  return (
    /* Wrapper */
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f0c29] via-[#1a1a3e] to-[#0f3460] p-4 sm:p-8 overflow-hidden">

      {/* Blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-80 h-80 rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.25)_0%,transparent_70%)]" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.2)_0%,transparent_70%)]" />

      {/* Card */}
      <div className="relative z-10 flex flex-col md:flex-row w-full max-w-[820px] rounded-3xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.4)]">

        {/* ── LEFT PANEL ── */}
        <div className="md:w-[44%] bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 p-8 md:p-10 flex flex-col gap-6 justify-between">

          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-white" />
            <span className="text-white text-lg font-semibold tracking-widest">Placement</span>
          </div>

          {/* Title + sub */}
          <div>
            <h2 className="text-white text-2xl font-semibold leading-snug mb-2">
              Find your next<br />dream job today.
            </h2>
            <p className="text-white/70 text-sm leading-relaxed">
              Join over 5 crore professionals building their careers on Naukri.
            </p>
          </div>

          {/* Feature list */}
          <div className="flex flex-col gap-3">
            {[
              "One click apply using your profile",
              "Get AI-matched job recommendations",
              "Showcase your profile to top companies",
              "Track all application statuses",
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-[22px] h-[22px] rounded-full bg-white/20 flex items-center justify-center">
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-white/90 text-sm">{f}</span>
              </div>
            ))}
          </div>

          {/* Register btn */}
          <button
            className="w-fit px-5 py-2.5 bg-white text-indigo-600 text-sm font-semibold rounded-xl cursor-pointer border-none"
            onClick={() => router.push("/placements/register")}
          >
            Register for free →
          </button>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="md:w-[56%] bg-white flex items-center justify-center p-8 md:p-10">
          <div className="w-full flex flex-col gap-4">

            {/* ── LOGIN FORM ── */}
            {step === "login" && (
              <>
                <div>
                  <h2 className="text-[#1e1e2e] text-2xl font-semibold mb-1">Welcome back</h2>
                  <p className="text-gray-400 text-sm">Login to access your account</p>
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-500 tracking-wide">Email ID / Username</label>
                  <input
                    name="email"
                    type="text"
                    placeholder="Enter your email or username"
                    value={form.email}
                    onChange={handleChange}
                    className={`w-full px-3 py-2.5 rounded-xl border-[1.5px] text-sm text-[#1e1e2e] bg-[#fafafe] outline-none transition-colors ${inputBorder(form.email, tried && !form.email)}`}
                  />
                  {tried && !form.email && <p className="text-[11px] text-red-400 mt-0.5">Email cannot be empty</p>}
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-500 tracking-wide">Password</label>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPass ? "text" : "password"}
                      placeholder="Enter your password"
                      value={form.password}
                      onChange={handleChange}
                      className={`w-full px-3 py-2.5 pr-11 rounded-xl border-[1.5px] text-sm text-[#1e1e2e] bg-[#fafafe] outline-none transition-colors ${inputBorder(form.password, tried && !form.password)}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-none border-none cursor-pointer flex items-center p-0"
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
                    </button>
                  </div>
                  {tried && !form.password && <p className="text-[11px] text-red-400 mt-0.5">Password cannot be empty</p>}
                </div>

                {/* Forgot */}
                <div className="flex justify-end -mt-1">
                  <span
                    className="text-xs text-indigo-500 font-medium cursor-pointer"
                    onClick={() => { setStep("forgot"); setFpError(""); }}
                  >
                    Forgot password?
                  </span>
                </div>

                <button
                  onClick={handleLogin}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-[15px] font-semibold border-none cursor-pointer"
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
                    className="bg-none border-none text-indigo-500 text-sm font-medium cursor-pointer p-0 mb-2 block"
                  >
                    ← Back to login
                  </button>
                  <h2 className="text-[#1e1e2e] text-2xl font-semibold mb-1">Forgot password?</h2>
                  <p className="text-gray-400 text-sm">Enter your registered email to receive an OTP</p>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-500 tracking-wide">Registered Email</label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={fpEmail}
                    onChange={(e) => setFpEmail(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl border-[1.5px] text-sm text-[#1e1e2e] bg-[#fafafe] outline-none transition-colors ${inputBorder(fpEmail, !!fpError)}`}
                  />
                  {fpError && <p className="text-[11px] text-red-400 mt-0.5">{fpError}</p>}
                </div>

                <button
                  onClick={handleSendOtp}
                  disabled={fpLoading}
                  className={`w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-[15px] font-semibold border-none cursor-pointer transition-opacity ${fpLoading ? "opacity-70" : ""}`}
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
                    className="bg-none border-none text-indigo-500 text-sm font-medium cursor-pointer p-0 mb-2 block"
                  >
                    ← Back
                  </button>
                  <h2 className="text-[#1e1e2e] text-2xl font-semibold mb-1">Enter OTP</h2>
                  <p className="text-gray-400 text-sm">
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
                      className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-[22px] font-bold text-[#1e1e2e] rounded-xl border-[1.5px] outline-none transition-all ${
                        digit ? "border-indigo-500 bg-indigo-50" : "border-[#e0e0f0] bg-[#fafafe]"
                      }`}
                      style={{ height: "52px" }}
                    />
                  ))}
                </div>

                {fpError && <p className="text-[11px] text-red-400">{fpError}</p>}

                <button
                  onClick={handleVerifyOtp}
                  disabled={fpLoading}
                  className={`w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-[15px] font-semibold border-none cursor-pointer transition-opacity ${fpLoading ? "opacity-70" : ""}`}
                >
                  {fpLoading ? "Verifying..." : "Verify OTP"}
                </button>

                <p className="text-xs text-gray-400 text-center">
                  Didn&apos;t receive?{" "}
                  {resendTimer > 0 ? (
                    <span className="text-gray-300 font-medium">Resend in {resendTimer}s</span>
                  ) : (
                    <span className="text-indigo-500 font-semibold cursor-pointer" onClick={handleSendOtp}>
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
                  <h2 className="text-[#1e1e2e] text-2xl font-semibold mb-1">Set new password</h2>
                  <p className="text-gray-400 text-sm">Choose a strong password for your account</p>
                </div>

                {/* New Password */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-500 tracking-wide">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPass ? "text" : "password"}
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={`w-full px-3 py-2.5 pr-11 rounded-xl border-[1.5px] text-sm text-[#1e1e2e] bg-[#fafafe] outline-none transition-colors ${inputBorder(newPassword)}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-none border-none cursor-pointer flex items-center p-0"
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
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-500 tracking-wide">Confirm Password</label>
                  <input
                    type="password"
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl border-[1.5px] text-sm text-[#1e1e2e] bg-[#fafafe] outline-none transition-colors ${
                      confirmPassword
                        ? confirmPassword === newPassword
                          ? "border-green-400"
                          : "border-red-400"
                        : "border-[#e0e0f0]"
                    }`}
                  />
                  {confirmPassword && confirmPassword !== newPassword && (
                    <p className="text-[11px] text-red-400 mt-0.5">Passwords do not match</p>
                  )}
                  {confirmPassword && confirmPassword === newPassword && (
                    <p className="text-[11px] text-green-500 mt-0.5">✓ Passwords match</p>
                  )}
                </div>

                {fpError && <p className="text-[11px] text-red-400">{fpError}</p>}

                <button
                  onClick={handleResetPassword}
                  disabled={fpLoading}
                  className={`w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-[15px] font-semibold border-none cursor-pointer transition-opacity ${fpLoading ? "opacity-70" : ""}`}
                >
                  {fpLoading ? "Resetting..." : "Reset Password"}
                </button>
              </>
            )}

            {/* ── DONE ── */}
            {step === "done" && (
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 text-white text-3xl font-bold flex items-center justify-center mb-2">
                  ✓
                </div>
                <h2 className="text-[#1e1e2e] text-2xl font-semibold">Password reset!</h2>
                <p className="text-gray-400 text-sm">
                  Your password has been successfully changed. You can now login.
                </p>
                <button
                  className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-[15px] font-semibold border-none cursor-pointer"
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
