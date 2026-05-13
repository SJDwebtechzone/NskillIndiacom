"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, User, Mail, Phone, BookOpen, Send, 
  CheckCircle2, ChevronRight, Loader2, Rocket, 
  BadgeCheck, MessageSquare 
} from "lucide-react";

interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCourse?: string;
}

export default function EnquiryModal({ isOpen, onClose, defaultCourse }: EnquiryModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Details, 2: OTP, 3: Success
  const [courses, setCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    course: defaultCourse || ""
  });

  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchCourses();
      if (defaultCourse) setForm(f => ({ ...f, course: defaultCourse }));
    }
    return () => clearInterval(timerRef.current ?? undefined);
  }, [isOpen, defaultCourse]);

  const fetchCourses = async () => {
    setLoadingCourses(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/courses`);
      const data = await res.json();
      if (Array.isArray(data)) setCourses(data);
    } catch (err) {
      console.error("Failed to fetch courses:", err);
    } finally {
      setLoadingCourses(false);
    }
  };

  const startCountdown = (secs = 30) => {
    setCountdown(secs);
    clearInterval(timerRef.current ?? undefined);
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timerRef.current ?? undefined);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email is required";
    if (!form.phone.trim() || form.phone.replace(/\s+/g, "").length !== 10) e.phone = "Enter a valid 10-digit mobile number";
    if (!form.course) e.course = "Please select a course";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSendOtp = async () => {
    if (!validate()) return;
    setSendingOtp(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: form.phone,
          name: form.name,
          course_title: form.course,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to send OTP");

      setStep(2);
      startCountdown(30);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      setErrors({ phone: err.message });
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerify = async () => {
    const entered = otpDigits.join("");
    if (entered.length < 6) {
      setOtpError("Please enter all 6 digits");
      return;
    }
    setVerifying(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: form.phone, otp: entered }),
      });
      const data = await res.json();

      if (!res.ok || !data.verified) {
        setOtpError(data.error ?? "Incorrect OTP. Please try again.");
        setOtpDigits(["", "", "", "", "", ""]);
        setTimeout(() => otpRefs.current[0]?.focus(), 50);
        return;
      }

      // OTP verified -> Submit Enquiry
      await submitEnquiry();
      setStep(3);
    } catch {
      setOtpError("Verification failed. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  const submitEnquiry = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/enquiries/public`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_name: form.name,
          email_id: form.email,
          mobile_number: form.phone,
          course_interested: form.course
        }),
      });
    } catch (err) {
      console.error("Enquiry submission failed:", err);
    }
  };

  const handleOtpChange = (idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otpDigits];
    next[idx] = val;
    setOtpDigits(next);
    setOtpError("");
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[idx] && idx > 0)
      otpRefs.current[idx - 1]?.focus();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white rounded-[40px] w-full max-w-[500px] overflow-hidden shadow-2xl relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Gradient Bar */}
        <div className="h-2 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600" />

        <div className="p-8 sm:p-10">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                    <Rocket className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 leading-tight">Enquire Now</h2>
                    <p className="text-sm font-bold text-slate-400">Get details about your dream course</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <User className="w-3 h-3" /> Candidate Full Name <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text"
                      placeholder="Your full name"
                      className={`w-full px-5 py-4 rounded-2xl bg-slate-50 border transition-all outline-none text-[15px] font-bold ${errors.name ? "border-red-300 focus:border-red-400" : "border-slate-100 focus:border-blue-600 focus:bg-white"}`}
                      value={form.name}
                      onChange={e => { setForm({...form, name: e.target.value}); setErrors({...errors, name: ""}); }}
                    />
                    {errors.name && <p className="text-[10px] font-bold text-red-500 ml-2 uppercase tracking-wide">{errors.name}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Mail className="w-3 h-3" /> Email ID <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="email"
                      placeholder="you@example.com"
                      className={`w-full px-5 py-4 rounded-2xl bg-slate-50 border transition-all outline-none text-[15px] font-bold ${errors.email ? "border-red-300 focus:border-red-400" : "border-slate-100 focus:border-blue-600 focus:bg-white"}`}
                      value={form.email}
                      onChange={e => { setForm({...form, email: e.target.value}); setErrors({...errors, email: ""}); }}
                    />
                    {errors.email && <p className="text-[10px] font-bold text-red-500 ml-2 uppercase tracking-wide">{errors.email}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <BookOpen className="w-3 h-3" /> Select Course <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select 
                        className={`w-full px-5 py-4 rounded-2xl bg-slate-50 border transition-all outline-none text-[15px] font-bold appearance-none cursor-pointer ${errors.course ? "border-red-300 focus:border-red-400" : "border-slate-100 focus:border-blue-600 focus:bg-white"}`}
                        value={form.course}
                        onChange={e => { setForm({...form, course: e.target.value}); setErrors({...errors, course: ""}); }}
                      >
                        <option value="">Choose a program...</option>
                        {courses.map((c: any) => (
                          <option key={c.id} value={c.title}>{c.title}</option>
                        ))}
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <ChevronRight className="w-4 h-4 rotate-90" />
                      </div>
                    </div>
                    {errors.course && <p className="text-[10px] font-bold text-red-500 ml-2 uppercase tracking-wide">{errors.course}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Phone className="w-3 h-3" /> Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-3">
                      <div className="flex items-center gap-1.5 px-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-black text-slate-500">
                        🇮🇳 +91
                      </div>
                      <input 
                        type="tel"
                        maxLength={10}
                        placeholder="10-digit mobile"
                        className={`flex-1 px-5 py-4 rounded-2xl bg-slate-50 border transition-all outline-none text-[15px] font-bold ${errors.phone ? "border-red-300 focus:border-red-400" : "border-slate-100 focus:border-blue-600 focus:bg-white"}`}
                        value={form.phone}
                        onChange={e => { setForm({...form, phone: e.target.value.replace(/\D/g, "")}); setErrors({...errors, phone: ""}); }}
                      />
                    </div>
                    {errors.phone && <p className="text-[10px] font-bold text-red-500 ml-2 uppercase tracking-wide">{errors.phone}</p>}
                  </div>
                </div>

                <button 
                  disabled={sendingOtp}
                  onClick={handleSendOtp}
                  className="w-full mt-10 py-5 bg-[#0b1f3a] text-white rounded-[24px] font-black text-[17px] shadow-xl hover:bg-[#1a3a63] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {sendingOtp ? <Loader2 className="w-5 h-5 animate-spin" /> : <MessageSquare className="w-5 h-5" />}
                  {sendingOtp ? "Sending OTP..." : "Send Verification OTP"}
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="text-center mb-8">
                  <div className="w-20 h-20 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <Phone className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">Verify Your Number</h3>
                  <p className="text-sm font-bold text-slate-400">We've sent an OTP to +91 {form.phone}</p>
                </div>

                <div className="flex gap-2 justify-center mb-8">
                  {otpDigits.map((d, i) => (
                    <input
                      key={i}
                      ref={(el) => { otpRefs.current[i] = el; }}
                      type="text" inputMode="numeric" maxLength={1} value={d}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className={`w-12 h-16 text-center text-2xl font-black border-2 rounded-2xl focus:outline-none transition-all ${
                        otpError ? "border-red-300 bg-red-50 text-red-600" : d ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-100 bg-slate-50 text-slate-800 focus:border-blue-500 focus:bg-white"
                      }`}
                    />
                  ))}
                </div>

                {otpError && <p className="text-center text-xs font-bold text-red-500 mb-6 uppercase tracking-wide">{otpError}</p>}

                <div className="text-center mb-8">
                  {countdown > 0 ? (
                    <p className="text-xs font-bold text-slate-400">Resend in <span className="text-blue-600">{countdown}s</span></p>
                  ) : (
                    <button onClick={() => { setStep(1); handleSendOtp(); }} className="text-xs font-black text-blue-600 uppercase tracking-widest hover:underline">
                      Resend OTP Code
                    </button>
                  )}
                </div>

                <button 
                  disabled={verifying || otpDigits.join("").length < 6}
                  onClick={handleVerify}
                  className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black text-[17px] shadow-xl hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {verifying ? <Loader2 className="w-5 h-5 animate-spin" /> : <BadgeCheck className="w-5 h-5" />}
                  {verifying ? "Verifying..." : "Verify & Submit Enquiry"}
                </button>

                <button onClick={() => setStep(1)} className="w-full mt-4 py-2 text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors">
                  Go Back & Edit Number
                </button>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-emerald-100">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-3 leading-tight">Enquiry Sent! 🎉</h3>
                <p className="text-[16px] font-medium text-slate-500 mb-10 leading-relaxed px-4">
                  Thank you for your interest. Our academic counsellors will get back to you shortly with all the details!
                </p>
                <button
                  onClick={onClose}
                  className="w-full py-5 bg-[#0b1f3a] text-white rounded-[24px] font-black text-[17px] hover:bg-[#1a3a63] transition-all shadow-xl"
                >
                  Close
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
