
"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Clock, GraduationCap, CheckCircle2, ShieldCheck, ChevronRight,
  Download, BookOpen, Award, Users, Star, FileText,
  X, Menu, BadgeCheck, Briefcase, TrendingUp, CalendarDays,
  MapPin, Phone, Mail, User,
  Medal, Rocket, HelpCircle, Plus, Minus,
} from "lucide-react";
import Link from "next/link";
import { useState, useRef, useCallback, useEffect } from "react";

import { Pause, Play, Volume2, VolumeX, Maximize2, LayoutGrid, ChevronDown } from "lucide-react";

// ─── helpers ──────────────────────────────────────────────────────────────────
function toSlug(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
function resolveVideoUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${process.env.NEXT_PUBLIC_API_URL}${url}`;
}
// ─── Custom Video Player ───────────────────────────────────────────────────────
// function VideoPlayer({
//   src,
//   poster,
//   label,
// }: {
//   src: string;
//   poster?: string;
//   label: string;
// }) {
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const [playing, setPlaying] = useState(false);
//   const [muted, setMuted] = useState(false);
//   const [progress, setProgress] = useState(0);
//   const [hovered, setHovered] = useState(false);
//   const [isFullscreen, setIsFullscreen] = useState(false);

//   useEffect(() => {
//     const v = videoRef.current;
//     if (!v) return;
//     v.pause();
//     v.src = src;
//     v.load();
//     setPlaying(false);
//     setProgress(0);
//   }, [src]);

//   // useEffect(() => {
//   //   const onChange = () => setIsFullscreen(!!document.fullscreenElement);
//   //   document.addEventListener("fullscreenchange", onChange);
//   //   return () => document.removeEventListener("fullscreenchange", onChange);
//   // }, []);
//   useEffect(() => {
//   const onChange = () => {
//     const full = !!document.fullscreenElement;
//     setIsFullscreen(full);
//     // ensure native controls off when not fullscreen
//     if (!full && videoRef.current) {
//       videoRef.current.controls = false;
//     }
//   };
//   document.addEventListener("fullscreenchange", onChange);
//   return () => document.removeEventListener("fullscreenchange", onChange);
// }, []);

//   const togglePlay = useCallback(() => {
//     const v = videoRef.current;
//     if (!v) return;
//     if (v.paused) {
//       v.play();
//       setPlaying(true);
//     } else {
//       v.pause();
//       setPlaying(false);
//     }
//   }, []);

//   const toggleMute = useCallback((e: React.MouseEvent) => {
//     e.stopPropagation();
//     const v = videoRef.current;
//     if (!v) return;
//     v.muted = !v.muted;
//     setMuted(v.muted);
//   }, []);

//   const handleTimeUpdate = () => {
//     const v = videoRef.current;
//     if (!v || !v.duration) return;
//     setProgress((v.currentTime / v.duration) * 100);
//   };

//   const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
//     e.stopPropagation();
//     const v = videoRef.current;
//     if (!v) return;
//     const rect = e.currentTarget.getBoundingClientRect();
//     v.currentTime = ((e.clientX - rect.left) / rect.width) * v.duration;
//   };

//  // Replace handleFullscreen with this
// const handleFullscreen = (e: React.MouseEvent) => {
//   e.stopPropagation();
//   const v = videoRef.current;
//   if (!v) return;

//   // Add native controls temporarily during fullscreen
//   v.controls = true;
//   v.requestFullscreen?.().then(() => {
//     // Remove native controls when exiting fullscreen
//     const onExit = () => {
//       v.controls = false;
//       document.removeEventListener("fullscreenchange", onExit);
//     };
//     document.addEventListener("fullscreenchange", onExit);
//   }).catch(() => {
//     v.controls = false;
//   });
// };

//   return (
//    <div
//   className="relative rounded-2xl bg-slate-950 cursor-pointer overflow-hidden isolate"
//   onMouseEnter={() => setHovered(true)}
//   onMouseLeave={() => setHovered(false)}
//   onClick={togglePlay}
//   style={{ contain: "layout" }}
// >
//     <video
//   ref={videoRef}
//   poster={poster}
//   className="w-full aspect-video object-cover"
//   preload="metadata"
//   onTimeUpdate={handleTimeUpdate}
//   onEnded={() => setPlaying(false)}
//   playsInline
//   style={{ display: "block" }}
// />
//       <AnimatePresence>
//         {!playing && !isFullscreen && (
//           <motion.div
//             initial={{ opacity: 0, scale: 0.8 }}
//             animate={{ opacity: 1, scale: 1 }}
//             exit={{ opacity: 0, scale: 0.8 }}
//             transition={{ duration: 0.15 }}
//             className="absolute inset-0 flex items-center justify-center bg-black/30"
//           >
//             <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
//               <Play className="w-6 h-6 text-white fill-white ml-0.5" />
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//       {!isFullscreen && (
//         <motion.div
//           animate={{ opacity: hovered || !playing ? 1 : 0 }}
//           transition={{ duration: 0.2 }}
//           className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-3 pt-6 pb-2"
//           onClick={(e) => e.stopPropagation()}
//         >
//           <div
//             className="w-full h-1 bg-white/20 rounded-full mb-2 cursor-pointer"
//             onClick={handleSeek}
//           >
//             <div
//               className="h-full bg-blue-400 rounded-full"
//               style={{ width: `${progress}%` }}
//             />
//           </div>
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-2">
//               <button
//                 onClick={togglePlay}
//                 className="text-white hover:text-blue-300 transition p-1"
//               >
//                 {playing ? (
//                   <Pause className="w-3.5 h-3.5 fill-white" />
//                 ) : (
//                   <Play className="w-3.5 h-3.5 fill-white" />
//                 )}
//               </button>
//               <button
//                 onClick={toggleMute}
//                 className="text-white hover:text-blue-300 transition p-1"
//               >
//                 {muted ? (
//                   <VolumeX className="w-3.5 h-3.5" />
//                 ) : (
//                   <Volume2 className="w-3.5 h-3.5" />
//                 )}
//               </button>
//               <span className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">
//                 {label}
//               </span>
//             </div>
//             <button
//               onClick={handleFullscreen}
//               className="text-white/60 hover:text-white transition p-1"
//             >
//               <Maximize2 className="w-3.5 h-3.5" />
//             </button>
//           </div>
//         </motion.div>
//       )}
//     </div>
//   );
// }
function VideoPlayer({ src, label }: { src: string; label: string }) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 bg-gray-800">
      <div className="relative bg-black aspect-video">
        {isPlaying ? (
          <video
            src={src}
            controls
            autoPlay
            className="w-full h-full object-contain"
            onEnded={() => setIsPlaying(false)}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center cursor-pointer group relative"
            onClick={() => setIsPlaying(true)}
          >
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-all" />
            {/* Play button */}
            <div className="relative z-10 w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/60 flex items-center justify-center group-hover:scale-110 group-hover:bg-white/30 transition-all">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
            {/* Play hint */}
            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
              ▶ Play
            </div>
          </div>
        )}
      </div>
      {/* Label bar */}
      <div className="px-4 py-2.5 flex items-center gap-2 border-t border-white/10">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
        <span className="text-[11px] text-white/60 font-semibold uppercase tracking-wider truncate">
          {label}
        </span>
      </div>
    </div>
  );
}
// ─── Book Demo Modal ───────────────────────────────────────────────────────────
function BookDemoModal({
  course,
  onClose,
}: {
  course: any;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: "",
    address: "",
    email: "",
    phone: "",
    date: "",
    time: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.phone || !form.date || !form.time)
      return;
    setLoading(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, course_id: course.id }),
      });
    } catch {}
    setLoading(false);
    setSubmitted(true);
  };

  const timeSlots = [
    "09:00 AM","10:00 AM","11:00 AM","12:00 PM",
    "02:00 PM","03:00 PM","04:00 PM","05:00 PM",
  ];
  const today = new Date().toISOString().split("T")[0];
  const fields = [
    { label: "Full Name",     key: "name",    type: "text",  placeholder: "Your full name",      required: true,  icon: User    },
    { label: "Address",       key: "address", type: "text",  placeholder: "City / Area",         required: false, icon: MapPin  },
    { label: "Email Address", key: "email",   type: "email", placeholder: "you@example.com",     required: true,  icon: Mail    },
    { label: "Phone Number",  key: "phone",   type: "tel",   placeholder: "+91 XXXXX XXXXX",     required: true,  icon: Phone   },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        transition={{ type: "spring", stiffness: 350, damping: 32 }}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col"
      >
        <div className="h-1 w-full bg-gradient-to-r from-violet-500 via-blue-500 to-indigo-500 shrink-0" />
        <div className="flex justify-center pt-3 pb-1 sm:hidden shrink-0">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>
        <div className="overflow-y-auto flex-1 p-6 sm:p-8">
          {!submitted ? (
            <>
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-200">
                    <CalendarDays className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Book Your Free Demo</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Reserve a slot with our expert counsellor</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition shrink-0"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
              <div className="bg-violet-50 border border-violet-100 rounded-2xl px-4 py-3 mb-5 flex items-center gap-3">
                <BookOpen className="w-4 h-4 text-violet-500 shrink-0" />
                <span className="text-sm font-semibold text-violet-700 truncate">{course.title}</span>
              </div>
              <div className="space-y-3 mb-4">
                {fields.map(({ label, key, type, placeholder, required, icon: Icon }) => (
                  <div key={key}>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <Icon className="w-3 h-3" /> {label}{" "}
                      {required && <span className="text-red-400">*</span>}
                    </label>
                    <input
                      type={type}
                      placeholder={placeholder}
                      value={(form as any)[key]}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent focus:bg-white transition-all"
                    />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <CalendarDays className="w-3 h-3" /> Date{" "}
                    <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    min={today}
                    value={form.date}
                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                    className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Time{" "}
                    <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={form.time}
                    onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                    className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent focus:bg-white transition-all appearance-none"
                  >
                    <option value="">Select slot</option>
                    {timeSlots.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                onClick={handleSubmit}
                disabled={!form.name || !form.email || !form.phone || !form.date || !form.time || loading}
                className="w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-violet-200 disabled:shadow-none"
              >
                {loading ? (
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                ) : (
                  <CalendarDays className="w-4 h-4" />
                )}
                {loading ? "Booking…" : "Confirm My Demo Slot"}
              </button>
              <p className="text-center text-[11px] text-slate-300 mt-3">Free session · No commitment required</p>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-violet-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-violet-200">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Demo Booked! 🎉</h3>
              <p className="text-slate-500 text-sm mb-1">
                Your slot on{" "}
                <span className="font-semibold text-slate-700">{form.date}</span> at{" "}
                <span className="font-semibold text-slate-700">{form.time}</span> is confirmed.
              </p>
              <p className="text-slate-400 text-xs mb-6">
                We'll reach you at{" "}
                <span className="font-semibold text-slate-600">{form.email}</span> or{" "}
                <span className="font-semibold text-slate-600">{form.phone}</span>.
              </p>
              <button
                onClick={onClose}
                className="bg-slate-900 text-white px-8 py-3 rounded-xl font-semibold hover:bg-slate-700 transition"
              >
                Close
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Brochure Modal — 3-step OTP flow ─────────────────────────────────────────
function BrochureModal({
  course,
  onClose,
}: {
  course: any;
  onClose: () => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

 useEffect(() => () => clearInterval(timerRef.current ?? undefined), []);

  const startCountdown = (secs = 30) => {
    setCountdown(secs);
   clearInterval(timerRef.current ?? undefined);
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(timerRef.current ?? undefined); return 0; }
        return c - 1;
      });
    }, 1000);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email is required";
    if (!form.phone.trim() || form.phone.replace(/\s+/g, "").length !== 10)
      e.phone = "Enter a valid 10-digit mobile number";
    setErrors(e);
    return Object.keys(e).length === 0;
  };
const handleSendOtp = async () => {
  if (!validate()) return;
  setSendingOtp(true);
  try {
    // Save lead to DB
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        course_id:     course.id,
        course_title:  course.title,
        brochure_url:  course.brochure_url,
      }),
    });

    // Send real OTP via WhatsApp
    const otpRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/otp/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone:        form.phone,
        name:         form.name,
        course_title: course.title,
      }),
    });

    const otpData = await otpRes.json();
    if (!otpRes.ok) throw new Error(otpData.error ?? "Failed to send OTP");

    setStep(2);
    startCountdown(30);
    setTimeout(() => otpRefs.current[0]?.focus(), 100);
  } catch (err: any) {
    setErrors({ phone: err.message ?? "Failed to send OTP" });
  } finally {
    setSendingOtp(false);
  }
};
  // const handleSendOtp = async () => {
  //   if (!validate()) return;
  //   setSendingOtp(true);
  //   try {
  //     await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/leads`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ ...form, course_id: course.id }),
  //     });
  //   } catch {}
  //   await new Promise((r) => setTimeout(r, 1200));
  //   const code = String(Math.floor(100000 + Math.random() * 900000));
  //   setGeneratedOtp(code);
  //   console.info(`[DEV] OTP for +91${form.phone}: ${code}`);
  //   setSendingOtp(false);
  //   setStep(2);
  //   startCountdown(30);
  //   setTimeout(() => otpRefs.current[0]?.focus(), 100);
  // };

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

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (paste.length === 6) { setOtpDigits(paste.split("")); otpRefs.current[5]?.focus(); }
    e.preventDefault();
  };

  const triggerDownload = () => {
    if (course.brochure_url) {
      const a = document.createElement("a");
      a.href = course.brochure_url;
      a.download = `${course.title.replace(/\s+/g, "_")}_Brochure.pdf`;
      a.target = "_blank";
      a.click();
    }
  };

const handleVerify = async () => {
  const entered = otpDigits.join("");
  if (entered.length < 6) { setOtpError("Please enter all 6 digits"); return; }
  setVerifying(true);
  try {
    // Step 1 — verify OTP
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

    // Step 2 — OTP verified → trigger browser download
    triggerDownload();

    // Step 3 — tell backend to send brochure to WhatsApp + admin alert
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/leads/verified`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name:         form.name,
        email:        form.email,
        phone:        form.phone,
        course_id:    course.id,
        course_title: course.title,
        brochure_url: course.brochure_url,
      }),
    }).catch(err => console.error("leads/verified failed:", err));
    // ↑ non-blocking — don't await, user sees step 3 immediately

    // Step 4 — move to success screen
    setStep(3);
  } catch {
    setOtpError("Verification failed. Please try again.");
  } finally {
    setVerifying(false);
  }
};
const handleResend = async () => {
  if (countdown > 0) return;
  setSendingOtp(true);
  try {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/otp/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone:        form.phone,
        name:         form.name,
        course_title: course.title,
      }),
    });
    setOtpDigits(["", "", "", "", "", ""]);
    setOtpError("");
    startCountdown(30);
    setTimeout(() => otpRefs.current[0]?.focus(), 50);
  } catch {
    setOtpError("Failed to resend OTP.");
  } finally {
    setSendingOtp(false);
  }
};


  const StepDots = () => (
    <div className="flex items-center gap-2 justify-center mb-6">
      {([1, 2, 3] as const).map((s) => (
        <div
          key={s}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            s === step ? "w-8 bg-blue-600" : s < step ? "w-4 bg-blue-300" : "w-4 bg-slate-200"
          }`}
        />
      ))}
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        transition={{ type: "spring", stiffness: 350, damping: 32 }}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden max-h-[96vh] flex flex-col"
      >
        <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 shrink-0" />
        <div className="flex justify-center pt-3 pb-1 sm:hidden shrink-0">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>
        <div className="overflow-y-auto flex-1 p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200">
                      <Rocket className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900">Start Your Career Journey</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Free brochure · phone verified</p>
                    </div>
                  </div>
                  <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition shrink-0">
                    <X className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
                <StepDots />
                <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 mb-5 flex items-center gap-3">
                  <BookOpen className="w-4 h-4 text-blue-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-0.5">Selected Course</p>
                    <p className="text-sm font-semibold text-blue-800 truncate">{course.title}</p>
                  </div>
                  <BadgeCheck className="w-4 h-4 text-blue-400 shrink-0" />
                </div>
                <div className="space-y-3 mb-5">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <User className="w-3 h-3" /> Full Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text" placeholder="Your full name" value={form.name}
                      onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); setErrors((er) => ({ ...er, name: "" })); }}
                      className={`w-full border rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all ${errors.name ? "border-red-300 bg-red-50" : "border-slate-200"}`}
                    />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Mail className="w-3 h-3" /> Email Address <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email" placeholder="you@example.com" value={form.email}
                      onChange={(e) => { setForm((f) => ({ ...f, email: e.target.value })); setErrors((er) => ({ ...er, email: "" })); }}
                      className={`w-full border rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all ${errors.email ? "border-red-300 bg-red-50" : "border-slate-200"}`}
                    />
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Phone className="w-3 h-3" /> Mobile Number <span className="text-red-400">*</span>
                    </label>
                    <div className="flex gap-2">
                      <div className="flex items-center gap-1.5 border border-slate-200 bg-slate-50 rounded-xl px-3 py-3 text-sm text-slate-600 font-semibold shrink-0">
                        🇮🇳 +91
                      </div>
                      <input
                        type="tel" placeholder="98765 43210" maxLength={10} value={form.phone}
                        onChange={(e) => { setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })); setErrors((er) => ({ ...er, phone: "" })); }}
                        className={`flex-1 border rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all ${errors.phone ? "border-red-300 bg-red-50" : "border-slate-200"}`}
                      />
                    </div>
                    {errors.phone ? (
                      <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                    ) : (
                      <p className="text-[11px] text-slate-400 mt-1.5">A 6-digit OTP will be sent to verify your number.</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleSendOtp} disabled={sendingOtp}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-blue-200 disabled:shadow-none"
                >
                  {sendingOtp ? (
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                  ) : <Phone className="w-4 h-4" />}
                  {sendingOtp ? "Sending OTP…" : "Send OTP & Continue"}
                </button>
                <p className="text-center text-[11px] text-slate-300 mt-3">We'll never spam you. Privacy guaranteed.</p>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }}>
                <div className="flex items-start justify-between mb-2">
                  <button onClick={() => { setStep(1); setOtpDigits(["","","","","",""]); setOtpError(""); }} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition">
                    <ChevronRight className="w-3.5 h-3.5 rotate-180" /> Back
                  </button>
                  <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition">
                    <X className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
                <StepDots />
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
                    <Phone className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-1">Verify Your Number</h3>
                  <p className="text-sm text-slate-500 mb-0.5">We sent a 6-digit OTP to</p>
                  <p className="text-base font-black text-slate-800">+91 {form.phone}</p>
                </div>
                <div className="flex gap-2 justify-center mb-3" onPaste={handleOtpPaste}>
                  {otpDigits.map((d, i) => (
                    <input
                      key={i}
                      ref={(el) => { otpRefs.current[i] = el; }}
                      type="text" inputMode="numeric" maxLength={1} value={d}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className={`w-11 h-14 text-center text-2xl font-black border-2 rounded-2xl focus:outline-none transition-all ${
                        otpError ? "border-red-300 bg-red-50 text-red-600" : d ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 bg-slate-50 text-slate-800 focus:border-blue-400 focus:bg-white"
                      }`}
                    />
                  ))}
                </div>
                {otpError && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-500 text-center mb-3">
                    {otpError}
                  </motion.p>
                )}
                <div className="text-center mb-5">
                  {countdown > 0 ? (
                    <p className="text-xs text-slate-400">Resend in <span className="font-bold text-slate-700">{countdown}s</span></p>
                  ) : (
                    <button onClick={handleResend} disabled={sendingOtp} className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition disabled:opacity-50">
                      {sendingOtp ? "Sending…" : "Resend OTP"}
                    </button>
                  )}
                </div>
                <button
                  onClick={handleVerify}
                  disabled={verifying || otpDigits.join("").length < 6}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-blue-200 disabled:shadow-none"
                >
                  {verifying ? (
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                  ) : <CheckCircle2 className="w-4 h-4" />}
                  {verifying ? "Verifying…" : "Verify & Download Brochure"}
                </button>
                <p className="text-center text-[11px] text-slate-300 mt-3">OTP valid for 10 minutes · Use 000000 to test locally</p>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center py-2">
                <StepDots />
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-200">
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">You're All Set! 🎉</h3>
                <p className="text-slate-500 text-sm mb-4">Your brochure is downloading now.</p>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-left mb-5 space-y-2.5">
                  {[
                    { label: "Name",   value: form.name },
                    { label: "Email",  value: form.email },
                    { label: "Phone",  value: `+91 ${form.phone}` },
                    { label: "Course", value: course.title },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex gap-3">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 w-12 shrink-0 pt-0.5">{label}</span>
                      <span className="text-sm font-semibold text-slate-700 flex-1 break-all">{value}</span>
                    </div>
                  ))}
                </div>
                <p className="text-slate-400 text-xs mb-5">Our admissions team will reach out on <span className="font-semibold text-slate-600">+91 {form.phone}</span> shortly.</p>
                <div className="flex gap-3">
                  <button onClick={triggerDownload} className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-3 rounded-xl transition text-sm">
                    <Download className="w-4 h-4" /> Re-download
                  </button>
                  <button onClick={onClose} className="flex-1 bg-slate-900 text-white px-4 py-3 rounded-xl font-semibold hover:bg-slate-700 transition text-sm">Close</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Mobile Sidebar Sheet ──────────────────────────────────────────────────────
function MobileCourseSheet({
  currentId,
  currentCategory,
  allCourses,
  onClose,
}: {
  currentId: string;
  currentCategory: string;
  allCourses: { id: string; title: string; category: string }[];
  onClose: () => void;
}) {
  const grouped = allCourses.reduce(
    (acc: Record<string, { name: string; id: string }[]>, c) => {
      if (!acc[c.category]) acc[c.category] = [];
      acc[c.category].push({ name: c.title, id: c.id });
      return acc;
    },
    {}
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 350, damping: 35 }}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white w-full rounded-t-3xl max-h-[80vh] overflow-hidden flex flex-col"
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>
        <div className="flex items-center justify-between px-5 pb-3 border-b border-slate-100">
          <h3 className="font-black text-slate-900">All Courses</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-4 space-y-4">
          {Object.entries(grouped).map(([cat, items]) => (
            <div key={cat}>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">{cat}</p>
              <div className="space-y-1">
                {(items as any[]).map((item) => (
                  <Link
                    key={item.id}
                    href={`/courses/${item.id}`}
                    onClick={onClose}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition ${
                      item.id === currentId ? "bg-blue-600 text-white font-semibold" : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {item.id === currentId && <span className="w-1.5 h-1.5 rounded-full bg-white/70" />}
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Course Icon ───────────────────────────────────────────────────────────────
function CourseIcon({ index, active }: { index: number; active?: boolean }) {
  const s = active ? "white" : "currentColor";
  const p = { fill: "none" as const, stroke: s, strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const icons = [
    <svg key={0} viewBox="0 0 16 16" width="14" height="14" fill="none"><path {...p} d="M8 2C5.8 2 4 3.8 4 6c0 1.5.8 2.8 2 3.5V11h4V9.5c1.2-.7 2-2 2-3.5 0-2.2-1.8-4-4-4z" /><path {...p} d="M6 12h4M7 14h2" /></svg>,
    <svg key={1} viewBox="0 0 16 16" width="14" height="14" fill="none"><rect {...p} x="2" y="2" width="12" height="12" rx="2" /><path {...p} d="M5 8h6M9 5l3 3-3 3" /></svg>,
    <svg key={2} viewBox="0 0 16 16" width="14" height="14" fill="none"><rect {...p} x="2" y="1" width="12" height="14" rx="2" /><path {...p} d="M5 5h6M5 8h4M5 11h3" /></svg>,
    <svg key={3} viewBox="0 0 16 16" width="14" height="14" fill="none"><circle {...p} cx="8" cy="6" r="3" /><path {...p} d="M2 14c0-2.2 2.7-4 6-4s6 1.8 6 4" /></svg>,
    <svg key={4} viewBox="0 0 16 16" width="14" height="14" fill="none"><path {...p} d="M8 1l1.8 3.6 4 .6-2.9 2.8.7 4L8 10.1 4.4 12l.7-4L2.2 5.2l4-.6z" /></svg>,
    <svg key={5} viewBox="0 0 16 16" width="14" height="14" fill="none"><path {...p} d="M10.5 2a3.5 3.5 0 00-3.3 4.6L2 12l2 2 5.4-5.2A3.5 3.5 0 1010.5 2z" /></svg>,
  ];
  return icons[index % icons.length];
}

// ─── Desktop Sidebar ───────────────────────────────────────────────────────────
function CourseSidebar({
  currentId,
  currentCategory,
  allCourses,
}: {
  currentId: string;
  currentCategory: string;
  allCourses: { id: string; title: string; category: string }[];
}) {
  const [showAll, setShowAll] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const grouped = allCourses.reduce(
    (acc: Record<string, { name: string; id: string }[]>, c) => {
      if (!acc[c.category]) acc[c.category] = [];
      acc[c.category].push({ name: c.title, id: c.id });
      return acc;
    },
    {}
  );

  const sameCategoryCourses = grouped[currentCategory] ?? [];
  const otherCategories = Object.entries(grouped).filter(([cat]) => cat !== currentCategory);

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  const CourseLink = ({ id, name, active = false, idx = 0 }: { id: string; name: string; active?: boolean; idx?: number }) => (
    <Link
      href={`/courses/${id}`}
      className={`group flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-150 ${
        active ? "bg-blue-600 shadow-md shadow-blue-200/60" : "hover:bg-slate-50"
      }`}
    >
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${active ? "bg-white/20" : "bg-slate-100 group-hover:bg-slate-200"}`}>
        <span className={active ? "text-white" : "text-slate-500"}>
          <CourseIcon index={idx} active={active} />
        </span>
      </div>
      {active && <span className="w-1.5 h-1.5 rounded-full bg-white/60 shrink-0" />}
      <span className={`text-[13px] leading-snug line-clamp-2 flex-1 transition-colors ${active ? "text-white font-semibold" : "text-slate-600 font-medium group-hover:text-slate-900"}`}>
        {name}
      </span>
    </Link>
  );

  return (
    <div className="sticky top-28 bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
      <div className="px-5 pt-5 pb-3.5 border-b border-slate-100 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 truncate">
            {showAll ? "All Courses" : currentCategory}
          </p>
          {!showAll && (
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">{sameCategoryCourses.length} courses</p>
          )}
        </div>
        <button
          onClick={() => setShowAll((v) => !v)}
          className={`shrink-0 flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-xl border transition-all duration-200 ${
            showAll ? "bg-blue-600 text-white border-blue-600" : "bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100 hover:border-blue-200"
          }`}
        >
          {showAll ? <><X className="w-3 h-3" /> Close</> : <><LayoutGrid className="w-3 h-3" /> All</>}
        </button>
      </div>

      <div className="max-h-[65vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
        <div className="p-2.5">
          {!showAll && (
            <div className="space-y-0.5">
              {sameCategoryCourses.map((item, idx) => (
                <CourseLink key={item.id} id={item.id} name={item.name} active={item.id === currentId} idx={idx} />
              ))}
            </div>
          )}
          {showAll && (
            <AnimatePresence initial={false}>
              <motion.div key="all-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5 px-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex-1 truncate">{currentCategory}</p>
                    <span className="text-[10px] text-slate-400">{sameCategoryCourses.length}</span>
                  </div>
                  <div className="space-y-0.5">
                    {sameCategoryCourses.map((item, idx) => (
                      <CourseLink key={item.id} id={item.id} name={item.name} active={item.id === currentId} idx={idx} />
                    ))}
                  </div>
                </div>
                <div className="border-t border-slate-100 mx-2" />
                {otherCategories.map(([cat, items]) => {
                  const isExpanded = expandedCategories.has(cat);
                  return (
                    <div key={cat}>
                      <button onClick={() => toggleCategory(cat)} className="w-full flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-slate-50 transition group">
                        <span className="w-2 h-2 rounded-full bg-slate-300 group-hover:bg-slate-400 transition-colors shrink-0" />
                        <p className="text-[10px] font-black text-slate-400 group-hover:text-slate-600 uppercase tracking-widest flex-1 text-left transition-colors truncate">{cat}</p>
                        <span className="text-[10px] text-slate-300 mr-1">{(items as any[]).length}</span>
                        <ChevronDown className={`w-3 h-3 text-slate-300 group-hover:text-slate-500 shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                      </button>
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div key="items" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                            <div className="space-y-0.5 mt-1 mb-1">
                              {(items as any[]).map((item, idx) => (
                                <CourseLink key={item.id} id={item.id} name={item.name} idx={idx} />
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
        {!showAll && (
          <div className="px-2.5 pb-3">
            <Link
              href={`/courses?category=${toSlug(currentCategory)}`}
              className="flex items-center justify-center gap-1.5 w-full py-2.5 text-xs font-semibold text-blue-600 hover:text-blue-700 border border-blue-100 hover:border-blue-200 rounded-2xl bg-blue-50 hover:bg-blue-100 transition-all"
            >
              View all in category <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Stats Bar ─────────────────────────────────────────────────────────────────
function StatsBar({ course }: { course: any }) {
  const stats = [
    { value: "500+",          label: "Students Enrolled", icon: Users     },
    { value: "4.8★",          label: "Average Rating",    icon: Star      },
    { value: course.duration, label: "Course Duration",   icon: Clock     },
    { value: "100%",          label: "Job Assistance",    icon: Briefcase },
  ];
  return (
    <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-slate-100">
        {stats.map(({ value, label, icon: Icon }) => (
          <div key={label} className="flex flex-col items-center justify-center py-5 px-4 text-center gap-1">
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center mb-1">
              <Icon className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-xl font-black text-slate-900">{value}</span>
            <span className="text-xs text-slate-400 font-medium">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Category image pools ─────────────────────────────────────────────────────
const CATEGORY_IMAGES: Record<string, { url: string; caption: string }[]> = {
  "HVAC & Refrigeration": [
    { url: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1200&q=80", caption: "Hands-on AC system training" },
    { url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=80", caption: "Industrial refrigeration units" },
    { url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80", caption: "HVAC installation in progress" },
    { url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1200&q=80", caption: "Technical lab sessions" },
  ],
  "Electrical": [
    { url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1200&q=80", caption: "Electrical wiring fundamentals" },
    { url: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1200&q=80", caption: "Power distribution systems" },
    { url: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1200&q=80", caption: "Circuit board diagnostics" },
  ],
  "Plumbing": [
    { url: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=1200&q=80", caption: "Pipe fitting techniques" },
    { url: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=1200&q=80", caption: "Plumbing systems installation" },
    { url: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1200&q=80", caption: "Water supply infrastructure" },
  ],
};

const FALLBACK_SLIDES = [
  { url: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1200&q=80", caption: "Hands-on practical training" },
  { url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1200&q=80", caption: "Expert-led lab sessions" },
  { url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80", caption: "Industry-standard equipment" },
];

// ─── Image Carousel ────────────────────────────────────────────────────────────
function ImageCarousel({ category, courseTitle, gallery, thumbnailUrl }: {
  category:      string;
  courseTitle:   string;
  gallery?:      string[];
  thumbnailUrl?: string;
}) {
  const categorySlides = CATEGORY_IMAGES[category] ?? FALLBACK_SLIDES;

  // If admin uploaded gallery images — use those as slides
  // Otherwise fall back to category Unsplash images
  const slides = gallery && gallery.length > 0
    ? gallery.map((url, i) => ({
        url,
        caption: i === 0 ? courseTitle : `${courseTitle} — Photo ${i + 1}`,
      }))
    : thumbnailUrl
    ? [{ url: thumbnailUrl, caption: courseTitle }, ...categorySlides]
    : categorySlides;
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isHovered) return;
    timerRef.current = setTimeout(() => setCurrent((c) => (c + 1) % slides.length), 3500);
    return () => clearTimeout(timerRef.current?? undefined);
  }, [current, isHovered, slides.length]);

  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);
  const next = () => setCurrent((c) => (c + 1) % slides.length);

  return (
    <div
      className="relative w-full rounded-3xl overflow-hidden shadow-sm border border-slate-100 bg-slate-900"
      style={{ aspectRatio: "16/7" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.55, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <img src={slides[current].url} alt={slides[current].caption} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        </motion.div>
      </AnimatePresence>
      <div className="absolute bottom-0 left-0 right-0 px-6 py-5 z-10">
        <motion.div key={`cap-${current}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-300 mb-1">{category}</p>
          <p className="text-white font-semibold text-sm">{slides[current].caption}</p>
        </motion.div>
      </div>
      <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L6 8l4 5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
      <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3l4 5-4 5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
      <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5">
        {slides.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)} className={`transition-all duration-300 rounded-full ${i === current ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/40 hover:bg-white/70"}`} />
        ))}
      </div>
      {!isHovered && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10 z-20">
          <motion.div key={`progress-${current}`} className="h-full bg-blue-400" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 3.5, ease: "linear" }} />
        </div>
      )}
    </div>
  );
}

// ─── Video Section — Option A (main player + thumbnail strip) ─────────────────
// function VideoSection({ videos }: { videos: any[] }) {
//   const [activeIdx, setActiveIdx] = useState(0);

//   if (!videos || videos.length === 0) return null;

//   const active = videos[activeIdx];

//   return (
//     <div className="relative">
//       <div className="absolute -inset-4 bg-blue-600/20 rounded-3xl blur-2xl pointer-events-none" />

//      <div className="relative bg-slate-950 rounded-2xl border border-white/10 p-3 pt-4 space-y-3">

//         {videos.length > 1 && (
//           <div className="flex items-center gap-2 px-1">
//             <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
//             <span className="text-[11px] text-white/40 font-semibold uppercase tracking-wider">
//               Now playing —
//             </span>
//             <span className="text-[11px] text-white/80 font-semibold truncate">
//               {active.type ?? active.title ?? `Video ${activeIdx + 1}`}
//             </span>
//           </div>
//         )}

//         {/* ✅ FIX 1 — resolveVideoUrl added here */}
//         <div className="rounded-xl overflow-hidden">
//           <VideoPlayer
//             key={activeIdx}
//             src={resolveVideoUrl(active.url)}
//             label={active.type ?? active.title ?? "Video"}
//           />
//         </div>

//         {videos.length > 1 && (
//           <div
//             className="flex gap-2 overflow-x-auto pb-1"
//             style={{ scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}
//           >
//             {videos.map((v: any, i: number) => (
//               <button
//                 key={v.id ?? i}
//                 onClick={() => setActiveIdx(i)}
//                 className={`relative flex-shrink-0 w-28 rounded-lg overflow-hidden border-2 transition-all duration-150 ${
//                   i === activeIdx
//                     ? "border-blue-500"
//                     : "border-white/10 hover:border-white/30 opacity-60 hover:opacity-100"
//                 }`}
//               >
//                 {/* ✅ FIX 2 — resolveVideoUrl added here */}
//                 <video
//                   src={resolveVideoUrl(v.url)}
//                   className="w-full aspect-video object-cover bg-slate-800"
//                   preload="metadata"
//                   muted
//                   playsInline
//                   onLoadedMetadata={(e) => {
//                     e.currentTarget.currentTime = 1;
//                   }}
//                 />

//                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-1.5">
//                   <p className="text-[9px] font-black uppercase tracking-wider text-blue-300 leading-none mb-0.5">
//                     {v.type ?? "Video"}
//                   </p>
//                   <p className="text-[10px] font-semibold text-white leading-tight line-clamp-1">
//                     {v.title ?? `Video ${i + 1}`}
//                   </p>
//                 </div>

//                 {i === activeIdx && (
//                   <div className="absolute top-1.5 right-1.5 w-3 h-3 rounded-full bg-blue-500 flex items-center justify-center">
//                     <div className="w-1 h-1 rounded-full bg-white" />
//                   </div>
//                 )}

//                 {i !== activeIdx && (
//                   <div className="absolute inset-0 flex items-center justify-center">
//                     <div className="w-6 h-6 rounded-full bg-white/20 border border-white/30 flex items-center justify-center">
//                       <svg width="8" height="8" viewBox="0 0 8 8" fill="white">
//                         <path d="M2 1l5 3-5 3z" />
//                       </svg>
//                     </div>
//                   </div>
//                 )}
//               </button>
//             ))}
//           </div>
//         )}

//       </div>
//     </div>
//   );
// }
function VideoSection({ videos }: { videos: any[] }) {
  const [activeIdx, setActiveIdx] = useState(0);
  if (!videos || videos.length === 0) return null;
  const active = videos[activeIdx];

  return (
    <div className="space-y-4">
      {/* Main active video */}
      <VideoPlayer
        key={activeIdx}
        src={resolveVideoUrl(active.url)}
        label={active.type ?? active.title ?? "Video"}
      />

      {/* Thumbnail strip — only if multiple videos */}
      {videos.length > 1 && (
     <div className="grid grid-cols-3 gap-1.5 mt-2 w-full overflow-hidden">
          {videos.map((v: any, i: number) => (
            <button
              key={v.id ?? i}
              onClick={() => setActiveIdx(i)}
              className={`rounded-xl overflow-hidden border-2 transition-all duration-150 ${
                i === activeIdx
                  ? "border-blue-500 opacity-100"
                  : "border-white/10 hover:border-white/30 opacity-60 hover:opacity-100"
              }`}
            >
            <div className="relative bg-black aspect-video max-h-44">
                <video
                  src={resolveVideoUrl(v.url)}
                  className="w-full h-full object-cover bg-slate-800"
                  preload="metadata"
                  muted
                  playsInline
                  onLoadedMetadata={(e) => { e.currentTarget.currentTime = 1; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-1.5">
                  <p className="text-[9px] font-black uppercase tracking-wider text-blue-300 leading-none mb-0.5">
                    {v.type ?? "Video"}
                  </p>
                  <p className="text-[10px] font-semibold text-white leading-tight line-clamp-1">
                    {v.title ?? `Video ${i + 1}`}
                  </p>
                </div>
                {i !== activeIdx && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-white/20 border border-white/30 flex items-center justify-center">
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="white">
                        <path d="M2 1l5 3-5 3z" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
// ─── Course Info Card ──────────────────────────────────────────────────────────
function CourseInfoCard({ course }: { course: any }) {
  const certifications = [
    { label: course.certification ?? "NSDC Approved", sub: "National Skill Development Corporation" },
    { label: "Government of India",                   sub: "Ministry of Skill Development & Entrepreneurship" },
    { label: "Industry Recognised",                   sub: "Accepted by 1000+ employers nationwide" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Duration */}
      <div className="px-6 sm:px-8 pt-6 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <h2 className="text-base font-black text-slate-900 uppercase tracking-wide">Course Duration</h2>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[140px] bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4 text-center">
            <p className="text-2xl font-black text-amber-600">{course.duration}</p>
            <p className="text-xs text-amber-500 font-semibold mt-0.5">Total Programme Length</p>
          </div>
          <div className="flex-1 min-w-[140px] space-y-2">
            {[{ label: "Theory", value: "40%" }, { label: "Practical", value: "60%" }].map(({ label, value }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-600">{label}</span>
                  <span className="font-black text-slate-800">{value}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${label === "Practical" ? "bg-amber-400" : "bg-blue-400"}`} style={{ width: value }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Certification */}
      <div className="px-6 sm:px-8 py-5 border-b border-slate-100">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
            <Medal className="w-4 h-4 text-emerald-500" />
          </div>
          <h2 className="text-base font-black text-slate-900 uppercase tracking-wide">Certification</h2>
        </div>
        <div className="space-y-2.5">
          {certifications.map(({ label, sub }) => (
            <div key={label} className="flex items-start gap-3 bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3">
              <BadgeCheck className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-bold text-emerald-800">{label}</p>
                <p className="text-[11px] text-emerald-600 mt-0.5">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Career Opportunities */}
      <div className="px-6 sm:px-8 py-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
            <Rocket className="w-4 h-4 text-blue-500" />
          </div>
          <h2 className="text-base font-black text-slate-900 uppercase tracking-wide">Career Opportunities</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {(course.careerOpportunities?.length
            ? course.careerOpportunities
            : ["Field Service Technician","Maintenance Engineer","Technical Supervisor","Self-Employment / Business","Government Sector Jobs","Export Opportunities Abroad"]
          ).map((role: string, i: number) => (
            <div key={i} className="flex items-center gap-2.5 bg-slate-50 border border-slate-100 rounded-2xl px-3.5 py-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
              <span className="text-sm font-medium text-slate-700">{role}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl px-4 py-3 flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-white shrink-0" />
          <div>
            <p className="text-white text-sm font-bold">High Demand Sector</p>
            <p className="text-blue-100 text-xs">Growing 18% year-on-year across India</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
interface FAQItem {
  q: string;
  a: string;
  table?: {
    skill: string;
    fresher: string;
    experienced: string;
    overseas: string;
  }[];
}

const DEFAULT_FAQS_EN: FAQItem[] = [
  {
    q: "Where is your training institute located? Do you provide accommodation and food?",
    a: "Our training centre is located in Kovur, Chennai, Tamil Nadu, equipped with modern facilities and world-class industrial equipment. NTSC provides accommodation for all students during the training period, along with lunch.",
  },
  {
    q: "What courses are available at your institute?",
    a: "We offer HVAC & Refrigeration, Welding, Electrical, Plumbing, Home Appliance, MEP, Quality, Safety, and Oil & Gas courses.",
  },
  {
    q: "Who can join these courses?",
    a: "8th / 10th / 12th Pass, Degree / Diploma / ITI students, Engineering students, job seekers, and working technicians who want to upgrade their skills.",
  },
  {
    q: "Does the training include both theory and practical sessions, and what practical facilities are available?",
    a: "Yes, both theory and practical sessions are covered. However, our courses primarily focus on hands-on practical training using world class industrial equipment, enabling students to gain real-world experience",
  },
{
  q: "Do you provide placement assistance, and what are the job opportunities and starting salary for freshers & experienced?",
  a: "Yes. We provide placement assurance for jobs in India and overseas industries after successful completion of the course. NTSC gives several opportunities to students to attend interviews for their placement.",
  table: [
    { skill: "HVAC Technician",                                              fresher: "₹15,000 – ₹25,000", experienced: "₹30,000 – ₹50,000", overseas: "₹60,000 – ₹80,000"  },
    { skill: "Electrician",                                                  fresher: "₹15,000 – ₹25,000", experienced: "₹30,000 – ₹50,000", overseas: "₹60,000 – ₹80,000"  },
    { skill: "Plumbing Technician",                                          fresher: "₹15,000 – ₹25,000", experienced: "₹30,000 – ₹50,000", overseas: "₹60,000 – ₹80,000"  },
    { skill: "Welding (MIG/TIG)",                                            fresher: "₹15,000 – ₹25,000", experienced: "₹30,000 – ₹50,000", overseas: "₹60,000 – ₹80,000"  },
    { skill: "MEP Technician",                                               fresher: "₹15,000 – ₹25,000", experienced: "₹30,000 – ₹50,000", overseas: "₹60,000 – ₹80,000"  },
    { skill: "Fire & Safety Officer",                                        fresher: "₹15,000 – ₹25,000", experienced: "₹30,000 – ₹50,000", overseas: "₹60,000 – ₹80,000"  },
    { skill: "Home Appliance Technician",                                    fresher: "₹15,000 – ₹25,000", experienced: "₹30,000 – ₹50,000", overseas: "₹60,000 – ₹80,000"  },
    { skill: "Certified HVAC Engineer (CHE)",                                fresher: "₹25,000",           experienced: "₹40,000 – ₹60,000", overseas: "₹80,000 – ₹1,00,000" },
    { skill: "International Diploma in Quality Management Training",                  fresher: "₹25,000",           experienced: "₹40,000 – ₹60,000", overseas: "₹80,000 – ₹1,00,000" },
    { skill: "International Certified Health, Safety & Environmental Officer (CHSEO)",                                  fresher: "₹25,000",           experienced: "₹40,000 – ₹60,000", overseas: "₹80,000 – ₹1,00,000" },
    { skill: "International Certified Mechanical Electrical & Plumbing Engineer (MEP)",                                   fresher: "₹25,000",           experienced: "₹40,000 – ₹60,000", overseas: "₹80,000 – ₹1,00,000" },
 ],
},
  {
    q: "Will I receive a recognized certificate after course completion, valid for jobs in India and abroad?",
    a: "Yes, students receive recognized certificates from Government of India or NSDC-accredited organizations, which help them secure jobs or start their own businesses.",
  },
  {
    q: "What is the course duration, class timing and mode of training?",
    a: "Basic courses: 15–30 days\nDiploma (Advanced): 2–4 months\nInternational programmes: 2–6 months\n\nClass timings: 10:00 AM – 5:00 PM\nMode: Safety and NDT courses are available online. All other courses are conducted offline.",
  },
  {
    q: "What is the fee structure and are EMI options available?",
    a: "Course fees and EMI options depend on the programme and duration. Contact our admissions team or visit our centre for details.",
  },
  {
    q: "Who will be the trainer, what is their industry experience, and will they provide additional classes if I miss any session?",
    a: "Our trainers have several years of industrial experience and are well-versed in delivering theory, practical training, and live projects. They are responsible for continuous student assessment. Additional classes will be provided on a need basis if any sessions are missed.",
  },
  {
    q: "Can I attend a demo class before admission?",
    a: "Yes. Students can visit our training centre and attend a free counseling session or demo class before joining",
  },
  {
    q: "How can I register for a course?",
    a: "Visit our training centre  OR call/WhatsApp: +91 98842 09774 OR fill the registration form on our website OR attend a career counselling session.",
  },
  {
    q: "For any clarifications / queries",
    a: "Please contact this no: +91 9884209774",
  },
];

const DEFAULT_FAQS_TA: FAQItem[] = [
  {
    q: "உங்கள் பயிற்சி மையம் எங்கு உள்ளது? தங்கும் வசதி மற்றும் உணவு வழங்கப்படுமா?",
    a: "எங்கள் பயிற்சி மையம் தமிழ்நாடு, சென்னை, கோவூர் பகுதியில் அமைந்துள்ளது. இது நவீன வசதிகள் மற்றும் தொழில்துறை தரமான உபகரணங்களுடன் நடைமுறை பயிற்சிக்கு உகந்ததாக உள்ளது.NTSC நிறுவனம் பயிற்சி காலத்தில் அனைத்து மாணவர்களுக்கும் தங்கும் வசதியையும் மதிய உணவையும் வழங்குகிறது.",
  },
  {
    q: "உங்கள் நிறுவனத்தில் எந்த கோர்ஸ்கள் வழங்கப்படுகின்றன?",
    a: "HVAC & Refrigeration, Welding, Electrical, Plumbing, Home Appliance, MEP, Quality, Safety மற்றும் Oil & Gas கோர்ஸ்கள் வழங்கப்படுகின்றன.",
  },
  {
    q: "யார் இந்த கோர்ஸ்களில் சேரலாம்?",
    a: "8ம் / 10ம் / 12ம் வகுப்பு தேர்ச்சி, Degree / Diploma / ITI மாணவர்கள், Engineering மாணவர்கள், வேலை தேடுபவர்கள் மற்றும் திறனை மேம்படுத்த விரும்பும் தொழில்நுட்ப நிபுணர்கள் சேரலாம்.",
  },
  {
    q: "இந்த பயிற்சியில் Theory மற்றும் Practical இரண்டும் உள்ளதா? என்ன வகையான Practical வசதிகள் உள்ளன?",
    a: "ஆம், Theory மற்றும் Practical இரண்டும் உள்ளன. ஆனால் எங்கள் பயிற்சியின் முக்கிய கவனம் முழுமையாக Hands-on Practical Training மீது உள்ளது. உலகத் தரம் வாய்ந்த தொழில்துறை உபகரணங்கள் மூலம் மாணவர்கள் நேரடி அனுபவம் பெறுவர்.",
  },
{
  q: "Placement உதவி வழங்கப்படுமா? வேலை வாய்ப்புகள் மற்றும் சம்பளம் எப்படி இருக்கும்?",
  a: "ஆம். கோர்ஸ் வெற்றிகரமாக முடித்த பிறகு இந்தியா மற்றும் வெளிநாடுகளில் வேலை வாய்ப்புகளுக்கு Placement Assistance வழங்கப்படுகிறது.குறிப்பு:  NTSC மாணவர்களுக்கு பல Interview வாய்ப்புகள் வழங்குகிறது.",
  table: [
    { skill: "HVAC Technician",                                          fresher: "₹15,000 – ₹25,000", experienced: "₹30,000 – ₹50,000", overseas: "₹60,000 – ₹80,000"  },
    { skill: "Electrician",                                              fresher: "₹15,000 – ₹25,000", experienced: "₹30,000 – ₹50,000", overseas: "₹60,000 – ₹80,000"  },
    { skill: "Plumbing Technician",                                      fresher: "₹15,000 – ₹25,000", experienced: "₹30,000 – ₹50,000", overseas: "₹60,000 – ₹80,000"  },
    { skill: "Welding (MIG/TIG)",                                        fresher: "₹15,000 – ₹25,000", experienced: "₹30,000 – ₹50,000", overseas: "₹60,000 – ₹80,000"  },
    { skill: "MEP Technician",                                           fresher: "₹15,000 – ₹25,000", experienced: "₹30,000 – ₹50,000", overseas: "₹60,000 – ₹80,000"  },
    { skill: "Fire & Safety Officer",                                    fresher: "₹15,000 – ₹25,000", experienced: "₹30,000 – ₹50,000", overseas: "₹60,000 – ₹80,000"  },
    { skill: "Home Appliance Technician",                                fresher: "₹15,000 – ₹25,000", experienced: "₹30,000 – ₹50,000", overseas: "₹60,000 – ₹80,000"  },
    { skill: "Certified HVAC Engineer (CHE)",                            fresher: "₹25,000",           experienced: "₹40,000 – ₹60,000", overseas: "₹80,000 – ₹1,00,000" },
    { skill: "International Diploma in Quality Management Training",                               fresher: "₹25,000",           experienced: "₹40,000 – ₹60,000", overseas: "₹80,000 – ₹1,00,000" },
    { skill: "International Certified Health, Safety & Environmental Officer (CHSEO)",                                  fresher: "₹25,000",           experienced: "₹40,000 – ₹60,000", overseas: "₹80,000 – ₹1,00,000" },
    { skill: "International Certified Mechanical Electrical & Plumbing Engineer (MEP)",                                   fresher: "₹25,000",           experienced: "₹40,000 – ₹60,000", overseas: "₹80,000 – ₹1,00,000" },
  ],
},
  {
    q: "கோர்ஸ் முடித்த பிறகு அங்கீகரிக்கப்பட்ட சான்றிதழ் கிடைக்குமா?",
    a: "ஆம், மாணவர்கள் இந்திய அரசு அல்லது NSDC அங்கீகாரம் பெற்ற சான்றிதழ்களை பெறுவார்கள். இது இந்தியா மற்றும் வெளிநாடுகளில் வேலை பெற உதவும் அல்லது தனியாக தொழில் தொடங்கவும் உதவும்.",
  },
  {
    q: "கோர்ஸ் காலம், நேரம் மற்றும் பயிற்சி முறை என்ன?",
    a: "கால அளவு:Basic கோர்ஸ்கள்: 15–30 நாட்கள்\nDiploma (Advanced): 2–4 மாதங்கள்\nInternational Programs: 2–6 மாதங்கள்\n\nClass Timing: காலை 10:00 – மாலை 5:00\nSafety மற்றும் NDT கோர்ஸ்கள் மட்டும் Online. மற்றவை Offline.",
  },
  {
    q: "கட்டண அமைப்பு மற்றும் EMI வசதி உள்ளதா?",
    a: "கட்டணம் மற்றும் EMI வசதி கோர்ஸ் மற்றும் கால அளவை பொறுத்தது. மேலும் விவரங்களுக்கு எங்கள் Admission Team-ஐ தொடர்பு கொள்ளவும் அல்லது மையத்தை பார்வையிடவும்.",
  },
  {
    q: "பயிற்றுவிப்பாளர்கள் யார்? அவர்கள் அனுபவம் என்ன? கூடுதல் வகுப்புகள் கிடைக்குமா?",
    a: "எங்கள் Trainers பல வருட தொழில்துறை அனுபவம் கொண்டவர்கள். அவர்கள் Theory, Practical மற்றும் Live Projects அனைத்தையும் கற்பிப்பதில் திறமையானவர்கள்.மாணவர்களின் முன்னேற்றத்தை தொடர்ந்து கண்காணிப்பார்கள். தவறவிட்ட வகுப்புகளுக்கு தேவைக்கேற்ப கூடுதல் வகுப்புகள் வழங்கப்படும்.",
  },
  {
    q: "Admission முன் Demo Class attend செய்ய முடியுமா?",
    a: "ஆம். மாணவர்கள் எங்கள் பயிற்சி மையத்தை வருகை தந்து இலவச Counselling அல்லது Demo Class-ல் கலந்து கொள்ளலாம். இந்த பக்கத்தில் உள்ள 'Book a Free Demo' பட்டனை பயன்படுத்தவும்.",
  },
  {
    q: "கோர்ஸில் எப்படி பதிவு செய்வது?",
    a: "•	பயிற்சி மையத்திற்கு நேரில் வருகை  அல்லது Call / WhatsApp: +91 98842 09774 அல்லது Website-ல் Registration Form பூர்த்தி செய்யவும் அல்லதுCareer Counselling Session-ல் கலந்து கொள்ளுதல் ",
  },
    {
    q: "மேலதிக தகவல்களுக்கு",
    a: "📞 தொடர்புக்கு: +91 9884209774",
  },
];
function FAQSection({ faqs }: { faqs?: FAQItem[] }) {
  const [lang, setLang]       = useState<"en" | "ta">("en");
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const courseSpecific = faqs && faqs.length > 0 ? faqs : [];
  const defaultFaqs   = lang === "en" ? DEFAULT_FAQS_EN : DEFAULT_FAQS_TA;
  const items         = [...courseSpecific, ...defaultFaqs];

  // reset open item when language switches
  const handleLangSwitch = (l: "en" | "ta") => {
    setLang(l);
    setOpenIdx(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 sm:px-8 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center">
            <HelpCircle className="w-4 h-4 text-purple-500" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            {lang === "en" ? "Frequently Asked Questions" : "அடிக்கடி கேட்கப்படும் கேள்விகள்"}
          </h2>
        </div>

        {/* Language toggle */}
        <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-1 shrink-0">
          <button
            onClick={() => handleLangSwitch("en")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
              lang === "en"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            English
          </button>
          <button
            onClick={() => handleLangSwitch("ta")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
              lang === "ta"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            தமிழ்
          </button>
        </div>
      </div>

      {/* Course-specific label */}
      {courseSpecific.length > 0 && (
        <div className="px-6 sm:px-8 pt-4 pb-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <p className="text-[11px] font-black uppercase tracking-wider text-blue-500">
              {lang === "en" ? "Course-specific questions" : "கோர்ஸ் சார்ந்த கேள்விகள்"}
            </p>
          </div>
        </div>
      )}

      {/* FAQ list */}
      <div className="px-4 sm:px-6 py-4 space-y-2">
        {items.map((item, i) => {
          const isOpen           = openIdx === i;
          const isCourseSpecific = i < courseSpecific.length;
          const isFirstDefault   = courseSpecific.length > 0 && i === courseSpecific.length;

          return (
            <div key={`${lang}-${i}`}>

              {/* Divider between course-specific and general */}
              {isFirstDefault && (
                <div className="flex items-center gap-2 mb-3 mt-1 px-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                    {lang === "en" ? "General questions" : "பொதுவான கேள்விகள்"}
                  </p>
                </div>
              )}

              <div
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? "border-purple-200 bg-purple-50/50"
                    : isCourseSpecific
                    ? "border-blue-100 bg-blue-50/30 hover:border-blue-200"
                    : "border-slate-100 bg-slate-50 hover:border-slate-200"
                }`}
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span
                    className={`text-sm font-bold transition-colors leading-snug ${
                      isOpen ? "text-purple-800" : "text-slate-700"
                    }`}
                  >
                    {item.q}
                  </span>
                  <span
                    className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                      isOpen
                        ? "bg-purple-500 text-white"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {isOpen ? (
                      <Minus className="w-3 h-3" />
                    ) : (
                      <Plus className="w-3 h-3" />
                    )}
                  </span>
                </button>
            <AnimatePresence initial={false}>
  {isOpen && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="overflow-hidden"
    >
      <div className="px-5 pb-4 space-y-3">

        {/* Answer text */}
        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
          {item.a}
        </p>

        {/* Salary table — only renders if this FAQ has table data */}
        {item.table && item.table.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-slate-100 mt-2">
            <table className="w-full text-xs min-w-[480px]">
              <thead>
                <tr className="bg-slate-800 text-white">
                  <th className="text-left px-3 py-2.5 font-bold rounded-tl-xl">
                    {lang === "en" ? "Skill" : "திறன்"}
                  </th>
                  <th className="text-left px-3 py-2.5 font-bold">
                    {lang === "en" ? "Fresher (India)" : "புதியவர் (இந்தியா)"}
                  </th>
                  <th className="text-left px-3 py-2.5 font-bold">
                    {lang === "en" ? "Experienced (India)" : "அனுபவம் (இந்தியா)"}
                  </th>
                  <th className="text-left px-3 py-2.5 font-bold rounded-tr-xl">
                    {lang === "en" ? "Overseas (Gulf)" : "வெளிநாடு (Gulf)"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {item.table.map((row, ri) => (
                  <tr
                    key={ri}
                    className={ri % 2 === 0 ? "bg-white" : "bg-slate-50"}
                  >
                    <td className="px-3 py-2.5 font-semibold text-slate-700 border-b border-slate-100">
                      {row.skill}
                    </td>
                    <td className="px-3 py-2.5 text-emerald-700 font-semibold border-b border-slate-100">
                      {row.fresher}
                    </td>
                    <td className="px-3 py-2.5 text-blue-700 font-semibold border-b border-slate-100">
                      {row.experienced}
                    </td>
                    <td className="px-3 py-2.5 text-violet-700 font-semibold border-b border-slate-100">
                      {row.overseas}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </motion.div>
  )}
</AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-6 sm:px-8 py-5 border-t border-slate-100 bg-slate-50/50">
        <p className="text-sm text-slate-500 text-center">
          {lang === "en" ? "Still have questions?" : "இன்னும் கேள்விகள் உள்ளதா?"}{" "}
          <Link
            href="/contact"
            className="font-bold text-purple-600 hover:text-purple-700 transition"
          >
            {lang === "en" ? "Talk to our counsellors →" : "எங்கள் ஆலோசகரை தொடர்பு கொள்ளுங்கள் →"}
          </Link>
        </p>
      </div>
    </motion.div>
  );
}

// ─── Main Client Component ─────────────────────────────────────────────────────
export default function CourseDetailClient({
  course,
  allCourses,
  currentSlug,
}: {
  course: any;
  allCourses: { id: string; title: string; category: string }[];
  currentSlug: string;
}) {
  const [showBrochure,    setShowBrochure]    = useState(false);
  const [showBookDemo,    setShowBookDemo]    = useState(false);
  const [showMobileSheet, setShowMobileSheet] = useState(false);

  const syllabusItems = (course.content[0] ?? "")
    .split("\n")
    .filter((line: string) => line.trim().startsWith("-"))
    .map((item: string) => item.replace(/^-\s*/, "").trim())
    .filter(Boolean);

 const videos = course.videos ?? [];
const [particles, setParticles] = useState<any[]>([]);
// ── Glowing particles ──
useEffect(() => {
  setParticles(
    [...Array(25)].map((_, i) => ({
      id:       i,
      width:    Math.random() * 4 + 2,
      height:   Math.random() * 4 + 2,
      top:      Math.random() * 100,
      left:     Math.random() * 100,
      opacity:  Math.random() * 0.6 + 0.2,
      blur:     Math.random() * 10 + 4,
      delay:    Math.random() * 3,
      duration: Math.random() * 3 + 2,
    }))
  );
}, []);

  return (
    <>
      <AnimatePresence>
        {showBrochure    && <BrochureModal    course={course} onClose={() => setShowBrochure(false)}    />}
        {showBookDemo    && <BookDemoModal    course={course} onClose={() => setShowBookDemo(false)}    />}
        {showMobileSheet && (
          <MobileCourseSheet
            currentId={currentSlug}
            currentCategory={course.category}
            allCourses={allCourses}
            onClose={() => setShowMobileSheet(false)}
          />
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-[#f8f9fc]">

        {/* ── HERO ── */}
<section className="relative pt-24 md:pt-28 pb-24 md:pb-32 overflow-hidden bg-slate-900">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-blue-700/25 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-600/20 rounded-full blur-[90px]" />
            <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
          </div>
          

{/* ── Glowing Particles ── */}
<div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
  {particles.map((p) => (
    <div
      key={p.id}
      className="absolute rounded-full animate-pulse"
      style={{
        width:    `${p.width}px`,
        height:   `${p.height}px`,
        top:      `${p.top}%`,
        left:     `${p.left}%`,
        background: `rgba(96, 165, 250, ${p.opacity})`,
        boxShadow:  `0 0 ${p.blur}px rgba(96, 165, 250, 0.8)`,
        animationDelay:    `${p.delay}s`,
        animationDuration: `${p.duration}s`,
      }}
    />
  ))}
</div>

          <div className="container mx-auto px-4 sm:px-6 relative z-10">
   <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_400px] gap-8 lg:gap-10 items-center">

              {/* Left: Text */}
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
                <div className="flex items-center gap-1.5 mb-5 text-blue-400 text-xs font-semibold uppercase tracking-widest flex-wrap">
                  <Link href="/" className="hover:text-white transition">Home</Link>
                  <ChevronRight className="w-3 h-3" />
                  <Link href={`/courses?category=${toSlug(course.category)}`} className="hover:text-white transition truncate max-w-[140px]">{course.category}</Link>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-white/40 truncate max-w-[180px]">{course.title}</span>
                </div>

                <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
                  <BookOpen className="w-3 h-3" />
                  {course.category}
                </div>

           <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight mb-6 tracking-tight break-words">
  {course.title}
</h1>

                <div className="flex flex-wrap gap-2 text-sm text-white/80 mb-8">
                  {[
                    { icon: Clock,         label: course.duration },
                    { icon: GraduationCap, label: course.eligibility ?? "Open to All" },
                    { icon: ShieldCheck,   label: "Govt. Certified" },
                    { icon: Award,         label: course.certification ?? "NSDC Approved" },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-2 bg-white/8 backdrop-blur border border-white/10 px-3 py-1.5 rounded-xl text-xs">
                      <Icon className="w-3.5 h-3.5 text-blue-400" />
                      {label}
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link href="/contact" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-blue-900/40 text-sm">
                    Enquire Now
                  </Link>
                  <button onClick={() => setShowBookDemo(true)} className="flex items-center gap-2 bg-white text-slate-900 hover:bg-blue-50 font-bold px-5 py-3 rounded-xl transition-all duration-200 shadow-lg text-sm border border-white/20">
                    <CalendarDays className="w-4 h-4 text-blue-600" />
                    Book a Free Demo
                  </button>
                  <button onClick={() => setShowMobileSheet(true)} className="lg:hidden flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-3 rounded-xl border border-white/15 transition-all duration-200 text-sm">
                    <Menu className="w-4 h-4" /> Browse Courses
                  </button>
                </div>
              </motion.div>

              {/* Right: Video — desktop only */}
              {videos.length > 0 && (
           // AFTER — constrained size
<motion.div
  initial={{ opacity: 0, x: 30 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.55, delay: 0.15 }}
className="hidden lg:block w-full max-w-[400px] shrink-0 overflow-hidden"
>
  <VideoSection videos={videos} />
</motion.div>
              )}
            </div>

            {/* Mobile Video */}
            {videos.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.25 }}
                className="block lg:hidden mt-8"
              >
                <VideoSection videos={videos} />
              </motion.div>
            )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-b from-transparent to-[#f8f9fc]" />
        </section>

        {/* ── STATS BAR ── */}
        <div className="container mx-auto px-4 sm:px-6 -mt-1 mb-6">
          <StatsBar course={course} />
        </div>

        {/* ── IMAGE CAROUSEL ── */}
        <div className="container mx-auto px-4 sm:px-6 mb-8">
         <ImageCarousel
  category={course.category}
  courseTitle={course.title}
  gallery={course.gallery}
  thumbnailUrl={course.thumbnail_url}
/>
        </div>

        {/* ── MAIN CONTENT ── */}
        <section className="py-6 pb-20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

              {/* Left Sidebar */}
              <aside className="lg:col-span-3 hidden lg:block">
                <CourseSidebar currentId={currentSlug} currentCategory={course.category} allCourses={allCourses} />
              </aside>

              {/* Center */}
              <main className="lg:col-span-6 space-y-6">

                {/* About */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-3">About This Course</h2>
                  <p className="text-slate-500 leading-relaxed text-sm sm:text-base">
                    This government-certified programme in{" "}
                    <span className="font-semibold text-slate-700">{course.title}</span>{" "}
                    is designed to equip students with industry-relevant skills. Gain hands-on training, expert mentorship, and a nationally recognised credential that opens doors across sectors.
                  </p>
                  {course.delivery_method && (
                    <p className="text-slate-400 text-xs mt-2">
                      Delivery: <span className="font-semibold text-slate-600">{course.delivery_method}</span>
                    </p>
                  )}
                  <div className="mt-5 flex flex-wrap gap-2">
                    {[
                      { icon: BadgeCheck, text: "Govt. of India Certified" },
                      { icon: TrendingUp, text: "High Placement Rate"     },
                      { icon: Users,      text: "Expert Instructors"       },
                    ].map(({ icon: Icon, text }) => (
                      <div key={text} className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-600">
                        <Icon className="w-3.5 h-3.5 text-blue-500" />
                        {text}
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Duration, Certification & Career */}
                <CourseInfoCard course={course} />

                {/* Syllabus */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900">Course Syllabus</h2>
                    <span className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full shrink-0">
                      {syllabusItems.length} Topics
                    </span>
                  </div>
                  <div className="px-6 sm:px-8 py-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {syllabusItems.length > 0 ? syllabusItems.map((item: string, i: number) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} className="flex items-start gap-3 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3">
                        <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                        <span className="text-sm text-slate-700 leading-snug">{item}</span>
                      </motion.div>
                    )) : (
                      <p className="text-slate-400 text-sm col-span-2">Syllabus details coming soon.</p>
                    )}
                  </div>
                </motion.div>

                {/* Brochure CTA */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white">
                  <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full" />
                  <div className="absolute bottom-0 left-20 w-32 h-32 bg-white/5 rounded-full" />
                  <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg sm:text-xl font-black mb-1">Start Your Career Journey</h3>
                      <p className="text-blue-100 text-sm">Get the full brochure — detailed syllabus, fee structure & career outcomes</p>
                    </div>
                    <button
                      onClick={() => setShowBrochure(true)}
                      className="shrink-0 flex items-center gap-2 bg-white text-blue-700 font-bold px-5 py-3 rounded-xl hover:bg-blue-50 transition shadow-lg text-sm"
                    >
                      <Rocket className="w-4 h-4" /> Download Brochure
                    </button>
                  </div>
                </motion.div>

                {/* FAQ */}
                <FAQSection faqs={course.faqs} />
              </main>

              {/* Right Sidebar */}
              <aside className="lg:col-span-3">
                <div className="sticky top-28 space-y-5">
                  <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-5 space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Quick Actions</h3>
                    <button
                      onClick={() => setShowBookDemo(true)}
                      className="w-full flex items-center gap-3 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-semibold px-4 py-3 rounded-xl transition text-sm shadow-md shadow-violet-200"
                    >
                      <CalendarDays className="w-4 h-4" /> Book a Free Demo
                    </button>
                    <Link
                      href="/contact"
                      className="w-full flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold px-4 py-3 rounded-xl transition text-sm shadow-md shadow-blue-200"
                    >
                      <Users className="w-4 h-4" /> Talk to Counsellor
                    </Link>
                  </div>

                  <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-5 space-y-3">
                    {[
                      { icon: ShieldCheck, text: "Government Certified",  sub: "Ministry of Skill Development" },
                      { icon: Award,       text: "Industry Recognised",   sub: "Accepted by top employers"     },
                      { icon: Star,        text: "4.8 / 5 Rating",        sub: "Based on 500+ reviews"         },
                      { icon: Users,       text: "500+ Placements",       sub: "Across India"                  },
                    ].map(({ icon: Icon, text, sub }) => (
                      <div key={text} className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-700">{text}</p>
                          <p className="text-[11px] text-slate-400">{sub}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </aside>

            </div>
          </div>
        </section>
      </div>
    </>
  );
}
