"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/app/context/AuthContext";
import {
  QrCode, Camera, ClipboardList, Play, Square,
  RefreshCw, Users, CheckCircle, XCircle, Clock,
  AlertTriangle, Loader2, Wifi, WifiOff,
  UserCheck, LogOut, Search, Download,
  Copy, Check, MessageCircle, Link
} from "lucide-react";
import QRCode from "qrcode";

/* ── Types ─────────────────────────────────────────── */
type Method = "qr" | "photo" | "manual";

interface Session {
  id: number;
  batch: string;
  course_name: string;
  method: Method;
  start_time: string;
  is_active: boolean;
}

interface StudentAttendance {
  id: number;
  admission_number: string;
  full_name: string;
  photo_url: string | null;
  course_name: string;
  batch_allotted: string;
  attendance: {
    status: "Present" | "Absent" | "Late" | null;
    method: string;
    time_in: string | null;
    time_out: string | null;
    early_exit: boolean;
    punch_in: string | null;
    punch_out: string | null;
    remarks: string;
  };
}

interface EarlyExitAlert {
  admission_id: number;
  full_name: string;
  time: string;
}

/* ── Helpers ────────────────────────────────────────── */
const API     = process.env.NEXT_PUBLIC_API_URL ?? "";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "";

const fmt12 = (ts: string | null) => {
  if (!ts) return "—";
  try {
    const d = ts.includes("T") ? new Date(ts) : new Date(`1970-01-01T${ts}`);
    return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  } catch {
    return ts;
  }
};

const today = () => new Date().toISOString().split("T")[0];

/* ── Main Component ─────────────────────────────────── */
export default function TrainerAttendancePage() {
  const { user } = useAuth();

  /* session state */
  const [step, setStep]           = useState<"setup" | "active">("setup");
  const [session, setSession]     = useState<Session | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrToken, setQrToken]     = useState<string | null>(null); // ✅ store token for sharing
  const [starting, setStarting]   = useState(false);
  const [ending, setEnding]       = useState(false);

  /* setup form */
  const [batch, setBatch]   = useState("");
  const [course, setCourse] = useState("");
  const [method, setMethod] = useState<Method>("qr");

  /* students */
  const [students, setStudents]         = useState<StudentAttendance[]>([]);
  const [loadingList, setLoadingList]   = useState(false);
  const [search, setSearch]             = useState("");
  const [lastRefresh, setLastRefresh]   = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh]   = useState(true);

  /* alerts */
  const [alerts, setAlerts] = useState<EarlyExitAlert[]>([]);

  /* copy state */
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedLink, setCopiedLink]   = useState(false);

  const qrIntervalRef   = useRef<NodeJS.Timeout | null>(null);
  const listIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /* ── Fetch student list ─────────────────────────── */
  const fetchStudents = useCallback(async (s: Session) => {
    if (!s) return;
    setLoadingList(true);
    try {
      const params = new URLSearchParams({
        batch:         s.batch,
        date:          today(),
        batchAllotted: s.batch,
        course:        s.course_name,
      });
      const res  = await fetch(`${API}/api/attendance/students?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      if (data.success) {
        setStudents(data.data);
        setLastRefresh(new Date());
        const exits = data.data
          .filter((st: StudentAttendance) => st.attendance.early_exit)
          .map((st: StudentAttendance) => ({
            admission_id: st.id,
            full_name:    st.full_name,
            time:         st.attendance.time_out ?? "",
          }));
        setAlerts(exits);
      }
    } catch (e) {
      console.error("fetchStudents error:", e);
    } finally {
      setLoadingList(false);
    }
  }, []);

  /* ── Generate QR canvas ─────────────────────────── */
  const generateQr = useCallback(async (token: string) => {
    const baseUrl = APP_URL || (typeof window !== "undefined" ? window.location.origin : "");
    const url     = `${baseUrl}/dashboard/student-management/attendance/scan?token=${token}`;
    try {
      const dataUrl = await QRCode.toDataURL(url, {
        width:                300,
        margin:               2,
        errorCorrectionLevel: "H",
        color:                { dark: "#0b1f3a", light: "#ffffff" },
      });
      setQrDataUrl(dataUrl);
      setQrToken(token); // ✅ save token for sharing
    } catch (e) {
      console.error("QR generate error:", e);
    }
  }, []);

  /* ── Refresh QR token every 4.5 min ────────────── */
  const refreshQrToken = useCallback(async (sessionId: number) => {
    try {
      const res  = await fetch(`${API}/api/attendance/session/refresh-qr`, {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:  `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ session_id: sessionId }),
      });
      const data = await res.json();
      if (data.qr_token) {
        await generateQr(data.qr_token);
      }
    } catch (e) {
      console.error("refreshQrToken error:", e);
    }
  }, [generateQr]);

  /* ── Copy token ─────────────────────────────────── */
  const copyToken = async () => {
    if (!qrToken) return;
    await navigator.clipboard.writeText(qrToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  /* ── Copy full scan link ────────────────────────── */
  const copyFullLink = async () => {
    if (!qrToken) return;
    const baseUrl = APP_URL || (typeof window !== "undefined" ? window.location.origin : "");
    const scanUrl = `${baseUrl}/dashboard/student-management/attendance/scan?token=${qrToken}`;
    await navigator.clipboard.writeText(scanUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  /* ── Share via WhatsApp ─────────────────────────── */
  const shareViaWhatsApp = () => {
    if (!qrToken) return;
    const baseUrl = APP_URL || (typeof window !== "undefined" ? window.location.origin : "");
    const scanUrl = `${baseUrl}/dashboard/student-management/attendance/scan?token=${qrToken}`;
    const msg = `🎓 *NSkill India Attendance*\n\nClick to mark your attendance:\n${scanUrl}\n\nOr paste this token manually:\n\`${qrToken}\`\n\n_Valid for 5 minutes_`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  /* ── Start session ──────────────────────────────── */
  const startSession = async () => {
    if (!batch.trim() || !course.trim()) return;
    setStarting(true);
    try {
      const res  = await fetch(`${API}/api/attendance/session/start`, {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:  `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ batch, course_name: course, method }),
      });
      const data = await res.json();
      if (data.success) {
        setSession(data.session);
        setStep("active");
        if (data.qr_token) {
          await generateQr(data.qr_token);
        }
        fetchStudents(data.session);
      } else {
        console.error("Start session failed:", data.message);
      }
    } catch (e) {
      console.error("startSession error:", e);
    } finally {
      setStarting(false);
    }
  };

  /* ── End session ────────────────────────────────── */
  const endSession = async () => {
    if (!session) return;
    setEnding(true);
    try {
      await fetch(`${API}/api/attendance/session/end`, {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:  `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ session_id: session.id }),
      });
      clearInterval(qrIntervalRef.current!);
      clearInterval(listIntervalRef.current!);
      setStep("setup");
      setSession(null);
      setQrDataUrl(null);
      setQrToken(null);
      setStudents([]);
      setAlerts([]);
      setSearch("");
    } catch (e) {
      console.error("endSession error:", e);
    } finally {
      setEnding(false);
    }
  };

  /* ── Auto-refresh list every 5s ─────────────────── */
  useEffect(() => {
    if (step !== "active" || !session || !autoRefresh) return;
    listIntervalRef.current = setInterval(() => fetchStudents(session), 5000);
    return () => clearInterval(listIntervalRef.current!);
  }, [step, session, autoRefresh, fetchStudents]);

  /* ── Refresh QR every 4.5 min ───────────────────── */
  useEffect(() => {
    if (step !== "active" || !session || method !== "qr") return;
    qrIntervalRef.current = setInterval(() => refreshQrToken(session.id), 4.5 * 60 * 1000);
    return () => clearInterval(qrIntervalRef.current!);
  }, [step, session, method, refreshQrToken]);

  /* ── Cleanup ────────────────────────────────────── */
  useEffect(() => {
    return () => {
      clearInterval(qrIntervalRef.current!);
      clearInterval(listIntervalRef.current!);
    };
  }, []);

  /* ── Derived stats ──────────────────────────────── */
  const total   = students.length;
  const present = students.filter(s => s.attendance.status === "Present").length;
  const absent  = students.filter(s => !s.attendance.status || s.attendance.status === "Absent").length;
  const late    = students.filter(s => s.attendance.status === "Late").length;
  const earlyEx = students.filter(s => s.attendance.early_exit).length;

  const filtered = students.filter(s =>
    s.full_name.toLowerCase().includes(search.toLowerCase()) ||
    s.admission_number.toLowerCase().includes(search.toLowerCase())
  );

  /* ── Export CSV ─────────────────────────────────── */
  const exportCsv = () => {
    const rows = [
      ["Admission No", "Name", "Status", "Time In", "Time Out", "Method", "Early Exit"],
      ...students.map(s => [
        s.admission_number,
        s.full_name,
        s.attendance.status ?? "Absent",
        fmt12(s.attendance.time_in),
        fmt12(s.attendance.time_out),
        s.attendance.method || "—",
        s.attendance.early_exit ? "Yes" : "No",
      ]),
    ];
    const csv  = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `attendance_${session?.batch ?? "batch"}_${today()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ════════════════════════════════════════════════
     RENDER — SETUP
  ════════════════════════════════════════════════ */
  if (step === "setup") {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <div className="w-full max-w-lg">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/30 mb-4">
              <ClipboardList className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-black text-slate-800">Start Attendance Session</h1>
            <p className="text-sm text-slate-500 mt-1">Configure your session before taking attendance</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 space-y-6">

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Batch</label>
              <input
                value={batch}
                onChange={e => setBatch(e.target.value)}
                placeholder="e.g. Morning Batch A"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Course</label>
              <input
                value={course}
                onChange={e => setCourse(e.target.value)}
                placeholder="e.g. Full Stack Web Development"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Attendance Method</label>
              <div className="grid grid-cols-3 gap-3">
                {(["qr", "photo", "manual"] as Method[]).map(m => {
                  const icons  = { qr: QrCode, photo: Camera, manual: ClipboardList };
                  const labels = { qr: "QR Code", photo: "Photo", manual: "Manual" };
                  const descs  = { qr: "Student scans", photo: "Face match", manual: "Mark list" };
                  const Icon   = icons[m];
                  return (
                    <button
                      key={m}
                      onClick={() => setMethod(m)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                        method === m
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs font-bold">{labels[m]}</span>
                      <span className="text-[10px] text-center leading-tight opacity-70">{descs[m]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {!APP_URL && method === "qr" && (
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 font-medium">
                  Set <strong>NEXT_PUBLIC_APP_URL</strong> in .env.local to your LAN IP
                  (e.g. http://192.168.1.5:3000) so phone QR scans work.
                </p>
              </div>
            )}

            <button
              onClick={startSession}
              disabled={!batch.trim() || !course.trim() || starting}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-sm transition-all duration-200 shadow-lg shadow-blue-600/20"
            >
              {starting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
              {starting ? "Starting Session..." : "Start Attendance Session"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════════════
     RENDER — ACTIVE SESSION
  ════════════════════════════════════════════════ */
  return (
    <div className="space-y-6">

      {/* ── Session Header ─────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
            </span>
            <span className="text-xs font-bold text-green-600 uppercase tracking-widest">Live Session</span>
          </div>
          <div className="h-4 w-px bg-slate-200" />
          <div>
            <p className="text-sm font-black text-slate-800">{session?.batch}</p>
            <p className="text-xs text-slate-500">{session?.course_name}</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100">
            {method === "qr"     && <QrCode        className="w-4 h-4 text-blue-600"   />}
            {method === "photo"  && <Camera        className="w-4 h-4 text-purple-600" />}
            {method === "manual" && <ClipboardList className="w-4 h-4 text-amber-600"  />}
            <span className="text-xs font-bold text-slate-600 capitalize">{method}</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span>Started {session?.start_time?.slice(0, 5) ?? "—"}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoRefresh(v => !v)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              autoRefresh
                ? "bg-green-50 text-green-600 border border-green-200"
                : "bg-slate-100 text-slate-500 border border-slate-200"
            }`}
          >
            {autoRefresh ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            {autoRefresh ? "Live" : "Paused"}
          </button>

          <button
            onClick={() => session && fetchStudents(session)}
            disabled={loadingList}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-bold transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingList ? "animate-spin" : ""}`} />
            Refresh
          </button>

          <button
            onClick={exportCsv}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-bold transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>

          <button
            onClick={endSession}
            disabled={ending}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-all shadow-sm"
          >
            {ending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Square className="w-3.5 h-3.5" />}
            End Session
          </button>
        </div>
      </div>

      {/* ── Early Exit Alerts ──────────────────────── */}
      {alerts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-bold text-amber-700">Early Exit Alerts ({alerts.length})</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {alerts.map(a => (
              <div key={a.admission_id} className="flex items-center gap-2 bg-white border border-amber-200 rounded-lg px-3 py-1.5 text-xs">
                <LogOut className="w-3 h-3 text-amber-500" />
                <span className="font-bold text-slate-700">{a.full_name}</span>
                <span className="text-slate-400">left at {fmt12(a.time)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Main Grid ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT — QR Panel */}
        {method === "qr" && (
          <div className="lg:col-span-1 space-y-4">

            {/* ── QR Code Card ── */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col items-center text-center space-y-4">

              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Scan to Mark</span>
              </div>

              {qrDataUrl ? (
                <div className="relative">
                  <img
                    src={qrDataUrl}
                    alt="Attendance QR Code"
                    className="w-52 h-52 rounded-xl border-4 border-[#0b1f3a]"
                  />
                  <div className="absolute -top-2 -right-2 bg-green-500 rounded-full w-6 h-6 flex items-center justify-center shadow-md">
                    <CheckCircle className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
              ) : (
                <div className="w-52 h-52 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-slate-300 animate-spin" />
                </div>
              )}

              <p className="text-xs text-slate-400 leading-relaxed">
                QR refreshes every <strong className="text-slate-600">5 minutes</strong>.<br />
                Students scan once to check in, again to check out.
              </p>

              <button
                onClick={() => session && refreshQrToken(session.id)}
                className="flex items-center gap-2 text-xs text-blue-600 font-bold hover:underline"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh QR Now
              </button>

              {/* ── Token Sharing Section ── */}
              {qrToken && (
                <div className="w-full space-y-3 pt-3 border-t border-slate-100">

                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-left">
                    Share with Students
                  </p>

                  {/* Token display + copy */}
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
                    <code className="flex-1 text-[11px] font-mono text-slate-600 truncate text-left">
                      {qrToken}
                    </code>
                    <button
                      onClick={copyToken}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all flex-shrink-0 ${
                        copiedToken
                          ? "bg-green-100 text-green-600"
                          : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      {copiedToken
                        ? <><Check className="w-3 h-3" /> Copied!</>
                        : <><Copy className="w-3 h-3" /> Copy</>}
                    </button>
                  </div>

                  {/* WhatsApp + Copy Link */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={shareViaWhatsApp}
                      className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white text-xs font-bold transition-all shadow-sm"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      WhatsApp
                    </button>

                    <button
                      onClick={copyFullLink}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                        copiedLink
                          ? "bg-green-100 text-green-600 border-green-200"
                          : "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                      }`}
                    >
                      {copiedLink
                        ? <><Check className="w-3.5 h-3.5" /> Copied!</>
                        : <><Link className="w-3.5 h-3.5" /> Copy Link</>}
                    </button>
                  </div>

                  <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                    Send via WhatsApp or share the link.<br />
                    Students paste token in Manual Token field.
                  </p>
                </div>
              )}
            </div>

            {/* ── Stats Card ── */}
            <div className="bg-[#0b1f3a] rounded-2xl p-5 text-white">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-300 mb-4">Live Stats</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Total",     value: total,   color: "text-white"     },
                  { label: "Present",   value: present, color: "text-green-400" },
                  { label: "Absent",    value: absent,  color: "text-red-400"   },
                  { label: "Early Out", value: earlyEx, color: "text-amber-400" },
                ].map(s => (
                  <div key={s.label} className="bg-white/5 rounded-xl p-3 text-center">
                    <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                    <p className="text-[10px] text-blue-200 mt-0.5 uppercase tracking-wider">{s.label}</p>
                  </div>
                ))}
              </div>
              {total > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between text-[10px] text-blue-200 mb-1.5 uppercase tracking-wider">
                    <span>Attendance Rate</span>
                    <span className="font-bold text-green-400">{((present / total) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-400 rounded-full transition-all duration-700"
                      style={{ width: `${total > 0 ? (present / total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {lastRefresh && (
              <p className="text-center text-[11px] text-slate-400">
                Last updated:{" "}
                {lastRefresh.toLocaleTimeString("en-IN", {
                  hour: "2-digit", minute: "2-digit", second: "2-digit",
                })}
                {autoRefresh && <span className="text-green-500 ml-1">• auto-refreshing</span>}
              </p>
            )}
          </div>
        )}

        {/* RIGHT — Student List */}
        <div className={method === "qr" ? "lg:col-span-2" : "lg:col-span-3"}>

          {method !== "qr" && (
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[
                { label: "Total",     value: total,   icon: Users,         color: "bg-blue-50  text-blue-600  border-blue-100"  },
                { label: "Present",   value: present, icon: UserCheck,     color: "bg-green-50 text-green-600 border-green-100" },
                { label: "Absent",    value: absent,  icon: XCircle,       color: "bg-red-50   text-red-600   border-red-100"   },
                { label: "Early Out", value: earlyEx, icon: AlertTriangle, color: "bg-amber-50 text-amber-600 border-amber-100" },
              ].map(s => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className={`rounded-2xl border p-4 flex items-center gap-3 ${s.color}`}>
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <div>
                      <p className="text-2xl font-black">{s.value}</p>
                      <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">{s.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or admission number..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Student</th>
                    <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Time In</th>
                    <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Time Out</th>
                    <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Method</th>
                    <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Flag</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-16 text-slate-300">
                        <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
                        <p className="text-sm font-medium">
                          {loadingList ? "Loading students..." : "No students found"}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filtered.map(s => {
                      const att       = s.attendance;
                      const status    = att.status ?? "Absent";
                      const isPresent = status === "Present";
                      const isLate    = status === "Late";
                      return (
                        <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 font-black text-xs flex-shrink-0">
                                {s.full_name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-slate-800 text-[13px] leading-tight">{s.full_name}</p>
                                <p className="text-[11px] text-slate-400">{s.admission_number}</p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              isPresent ? "bg-green-100 text-green-700" :
                              isLate    ? "bg-amber-100 text-amber-700" :
                                          "bg-red-50 text-red-500"
                            }`}>
                              {isPresent ? <CheckCircle className="w-3 h-3" /> :
                               isLate    ? <Clock        className="w-3 h-3" /> :
                                           <XCircle      className="w-3 h-3" />}
                              {status}
                            </span>
                          </td>

                          <td className="px-4 py-3 text-[13px] font-medium">
                            {att.time_in ? (
                              <span className="flex items-center gap-1 text-green-600">
                                <CheckCircle className="w-3 h-3" />
                                {fmt12(att.time_in)}
                              </span>
                            ) : "—"}
                          </td>

                          <td className="px-4 py-3 text-[13px] font-medium">
                            {att.time_out ? (
                              <span className={`flex items-center gap-1 ${att.early_exit ? "text-amber-600" : "text-slate-600"}`}>
                                <LogOut className="w-3 h-3" />
                                {fmt12(att.time_out)}
                              </span>
                            ) : "—"}
                          </td>

                          <td className="px-4 py-3">
                            <span className={`text-[11px] font-bold uppercase tracking-wider ${
                              att.method === "qr"    ? "text-blue-500"   :
                              att.method === "photo" ? "text-purple-500" :
                                                       "text-slate-400"
                            }`}>
                              {att.method || "—"}
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            {att.early_exit ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                                <AlertTriangle className="w-3 h-3" /> Early Exit
                              </span>
                            ) : (
                              <span className="text-slate-200 text-[11px]">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {filtered.length > 0 && (
              <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <p className="text-[11px] text-slate-400">
                  Showing {filtered.length} of {total} students
                </p>
                {autoRefresh && (
                  <p className="text-[11px] text-green-500 font-medium flex items-center gap-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                    </span>
                    Refreshing every 5s
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
