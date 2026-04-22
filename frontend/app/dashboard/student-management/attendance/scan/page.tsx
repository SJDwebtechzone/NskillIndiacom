"use client";

import { Suspense, useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import {
  CheckCircle, XCircle, Clock, QrCode,
  Loader2, LogIn, LogOut, AlertTriangle,
  Camera, RefreshCw, Shield, User, Bug
} from "lucide-react";

type ScanPhase =
  | "idle"
  | "scanning"
  | "validating"
  | "success_in"
  | "success_out"
  | "already_out"
  | "expired"
  | "error";

interface ResultData {
  action?: "time_in" | "time_out";
  early_exit?: boolean;
  time?: string;
  message?: string;
}

// ✅ Read from env — make sure .env.local has NEXT_PUBLIC_API_URL
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

const fmt12 = (iso?: string) => {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleTimeString("en-IN", {
      hour: "2-digit", minute: "2-digit", hour12: true,
    });
  } catch { return iso; }
};

/* ── Helper: get token from localStorage ────────── */
const getToken = (): string => {
  if (typeof window === "undefined") return "";
  return (
    localStorage.getItem("token")        ||
    localStorage.getItem("authToken")    ||
    localStorage.getItem("studentToken") ||
    ""
  );
};

function QRScanPage() {
  const { user }     = useAuth();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token") ?? "";

  const [phase, setPhase]               = useState<ScanPhase>("idle");
  const [result, setResult]             = useState<ResultData>({});
  const [manualToken, setManual]        = useState(tokenFromUrl);
  const [scannerReady, setScannerReady] = useState(false);
  const [camError, setCamError]         = useState(false);
  const [camErrorMsg, setCamErrorMsg]   = useState("");

  // ✅ Debug log state — shows step by step what's happening
  const [debugLog, setDebugLog]         = useState<string[]>([]);
  const [showDebug, setShowDebug]       = useState(false);

  const scannerRef = useRef<any>(null);
  const scannedRef = useRef(false);

  const addLog = (msg: string) => {
    console.log("[Scan]", msg);
    setDebugLog(prev => [...prev, `${new Date().toLocaleTimeString()} — ${msg}`]);
  };

  /* ── Process token ───────────────────────────── */
  const processToken = useCallback(async (token: string) => {
    if (scannedRef.current) return;
    scannedRef.current = true;
    setPhase("validating");
    setDebugLog([]); // reset logs

    const authToken = getToken();

    addLog(`Token to validate: ${token.substring(0, 20)}...`);
    addLog(`Auth token exists: ${!!authToken}`);
    addLog(`API URL: ${API}`);

    try {
      /* ── Step 1: Validate QR token ── */
      addLog("Step 1: Validating QR token...");
      const valRes  = await fetch(`${API}/api/attendance/qr/validate/${token}`);
      const valData = await valRes.json();
      addLog(`Step 1 result: ${JSON.stringify(valData)}`);

      if (!valRes.ok || !valData.success) {
        addLog(`❌ Validate failed: ${valData.message}`);
        setPhase(valData.message?.includes("expired") ? "expired" : "error");
        setResult({ message: valData.message });
        return;
      }

      addLog(`✅ Validate OK — batch: ${valData.batch}, session: ${valData.session_id}`);

      /* ── Step 2: Get admission ID ── */
      addLog("Step 2: Getting admission record...");

      if (!authToken) {
        addLog("❌ No auth token in localStorage — user not logged in properly");
        setPhase("error");
        setResult({ message: "You are not logged in. Please login and try again." });
        return;
      }

      const admRes  = await fetch(`${API}/api/attendance/my-admission`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const admData = await admRes.json();
      addLog(`Step 2 result (status ${admRes.status}): ${JSON.stringify(admData)}`);

      if (admRes.status === 401) {
        addLog("❌ 401 Unauthorized — JWT token is invalid or expired");
        setPhase("error");
        setResult({ message: "Session expired. Please logout and login again." });
        return;
      }

      if (!admData.success || !admData.admission_id) {
        addLog(`❌ Admission not found: ${admData.message}`);
        setPhase("error");
        setResult({ message: admData.message ?? "Admission record not found. Contact admin." });
        return;
      }

      addLog(`✅ Admission OK — id: ${admData.admission_id}, batch: ${admData.batch_allotted}`);

      /* ── Step 3: Mark attendance ── */
      const payload = {
        admission_id: admData.admission_id,
        batch:        valData.batch,
        session_id:   valData.session_id,
      };
      addLog(`Step 3: Marking attendance with: ${JSON.stringify(payload)}`);

      const markRes  = await fetch(`${API}/api/attendance/qr/mark`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:  `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });
      const markData = await markRes.json();
      addLog(`Step 3 result (status ${markRes.status}): ${JSON.stringify(markData)}`);

      if (!markRes.ok || !markData.success) {
        addLog(`❌ Mark failed: ${markData.message}`);
        if (markData.message?.includes("checked out")) {
          setPhase("already_out");
        } else {
          setPhase("error");
          setResult({ message: markData.message });
        }
        return;
      }

      addLog(`✅ Attendance marked! Action: ${markData.action}`);
      setResult({
        action:     markData.action,
        early_exit: markData.early_exit,
        time:       markData.time,
      });
      setPhase(markData.action === "time_in" ? "success_in" : "success_out");

    } catch (err: any) {
      addLog(`❌ Network error: ${err?.message}`);
      console.error("processToken error:", err);
      setPhase("error");
      setResult({ message: `Network error: ${err?.message ?? "Check your connection"}` });
    }
  }, []);

  /* ── Start scanner ───────────────────────────── */
  const startScanner = useCallback(async () => {
    setPhase("scanning");
    setCamError(false);
    setCamErrorMsg("");
    scannedRef.current = false;
    setScannerReady(false);

    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const { Html5Qrcode } = await import("html5-qrcode");

      const el = document.getElementById("qr-reader");
      if (!el) throw new Error("QR reader element not found — please try again");

      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            return {
              width:  Math.floor(minEdge * 0.7),
              height: Math.floor(minEdge * 0.7),
            };
          },
        },
        async (decodedText: string) => {
          await scanner.stop().catch(() => {});
          let token = decodedText;
          try {
            const url = new URL(decodedText);
            token = url.searchParams.get("token") ?? decodedText;
          } catch {
            // raw token
          }
          processToken(token);
        },
        () => {}
      );

      setScannerReady(true);

    } catch (err: any) {
      console.error("Scanner error:", err);

      if (err?.name === "NotAllowedError" || err?.message?.includes("Permission")) {
        setCamErrorMsg("Camera permission denied. Click the camera icon in the address bar and allow access.");
      } else if (err?.name === "NotFoundError") {
        setCamErrorMsg("No camera found on this device.");
      } else if (err?.name === "NotSupportedError") {
        setCamErrorMsg("Camera not supported. Try Chrome or Safari.");
      } else if (err?.message?.includes("not found")) {
        setCamErrorMsg("Scanner not ready. Please tap the button again.");
      } else {
        setCamErrorMsg(err?.message ?? "Could not start camera.");
      }

      setCamError(true);
      setPhase("idle");
    }
  }, [processToken]);

  /* ── Stop scanner on unmount ─────────────────── */
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, []);

  /* ── Auto-process URL token ──────────────────── */
  useEffect(() => {
    if (tokenFromUrl) processToken(tokenFromUrl);
  }, [tokenFromUrl, processToken]);

  /* ── Reset ───────────────────────────────────── */
  const reset = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {});
      scannerRef.current = null;
    }
    scannedRef.current = false;
    setScannerReady(false);
    setPhase("idle");
    setResult({});
    setManual("");
    setCamError(false);
    setCamErrorMsg("");
    setDebugLog([]);
  };

  /* ── Result screens ──────────────────────────── */
  if (phase === "success_in") return (
    <ResultScreen
      icon={<LogIn className="w-10 h-10 text-white" />}
      bg="bg-green-500"
      title="Checked In!"
      subtitle={`Time-in recorded at ${fmt12(result.time)}`}
      note="You're marked Present for today's session."
      onReset={reset}
      color="green"
    />
  );

  if (phase === "success_out") return (
    <ResultScreen
      icon={<LogOut className="w-10 h-10 text-white" />}
      bg={result.early_exit ? "bg-amber-500" : "bg-blue-600"}
      title={result.early_exit ? "Early Exit Noted" : "Checked Out!"}
      subtitle={`Time-out recorded at ${fmt12(result.time)}`}
      note={result.early_exit
        ? "Your trainer has been notified of your early departure."
        : "Your attendance has been fully recorded."}
      onReset={reset}
      color={result.early_exit ? "amber" : "blue"}
    />
  );

  if (phase === "already_out") return (
    <ResultScreen
      icon={<CheckCircle className="w-10 h-10 text-white" />}
      bg="bg-slate-500"
      title="Already Completed"
      subtitle="You've already checked in and out today."
      note="Your attendance for this session is complete."
      onReset={reset}
      color="gray"
    />
  );

  if (phase === "expired") return (
    <ResultScreen
      icon={<Clock className="w-10 h-10 text-white" />}
      bg="bg-amber-500"
      title="QR Code Expired"
      subtitle="This QR code is no longer valid."
      note="Ask your trainer to refresh the QR code and try again."
      onReset={reset}
      color="amber"
    />
  );

  if (phase === "error") return (
    <MobileShell>
      <div className="flex flex-col items-center justify-center h-full px-6 gap-5">
        <div className="w-24 h-24 rounded-full bg-red-500 flex items-center justify-center shadow-2xl">
          <XCircle className="w-10 h-10 text-white" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-slate-800">Something went wrong</h2>
          <p className="text-base font-semibold text-slate-600">{result.message ?? "Unable to mark attendance."}</p>
          <p className="text-sm text-slate-400">Please try again or contact your trainer.</p>
        </div>

        {/* ✅ Debug log panel — shows exactly what failed */}
        {debugLog.length > 0 && (
          <div className="w-full">
            <button
              onClick={() => setShowDebug(v => !v)}
              className="flex items-center gap-2 text-xs text-slate-400 font-bold mx-auto"
            >
              <Bug className="w-3.5 h-3.5" />
              {showDebug ? "Hide" : "Show"} debug info
            </button>
            {showDebug && (
              <div className="mt-2 bg-slate-900 rounded-xl p-3 space-y-1 max-h-48 overflow-y-auto">
                {debugLog.map((log, i) => (
                  <p key={i} className={`text-[10px] font-mono ${
                    log.includes("❌") ? "text-red-400" :
                    log.includes("✅") ? "text-green-400" :
                    "text-slate-400"
                  }`}>
                    {log}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        <button
          onClick={reset}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    </MobileShell>
  );

  if (phase === "validating") return (
    <MobileShell>
      <div className="flex flex-col items-center justify-center h-full gap-6 px-6">
        <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-600/30">
          <Loader2 className="w-9 h-9 text-white animate-spin" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-black text-slate-800">Marking Attendance</h2>
          <p className="text-sm text-slate-400 mt-1">Please wait a moment...</p>
        </div>
        <div className="relative w-32 h-32">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping opacity-20"
              style={{ animationDelay: `${i * 0.3}s` }}
            />
          ))}
          <div className="absolute inset-4 rounded-full bg-blue-50 flex items-center justify-center">
            <Shield className="w-6 h-6 text-blue-400" />
          </div>
        </div>
        {/* Live debug during validation */}
        {debugLog.length > 0 && (
          <div className="w-full bg-slate-100 rounded-xl p-3 max-h-32 overflow-y-auto">
            {debugLog.map((log, i) => (
              <p key={i} className="text-[10px] font-mono text-slate-500">{log}</p>
            ))}
          </div>
        )}
      </div>
    </MobileShell>
  );

  /* ── Main idle/scan screen ───────────────────── */
  return (
    <MobileShell>
      <div className="flex flex-col h-full">

        {/* Header */}
        <div className="bg-[#0b1f3a] px-6 pt-10 pb-6 text-white flex-shrink-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <span className="text-sm font-black">NS</span>
            </div>
            <div>
              <p className="text-xs text-blue-300 font-medium">NSkill India</p>
              <p className="text-sm font-black tracking-tight">Attendance Portal</p>
            </div>
          </div>

          {user ? (
            <div className="flex items-center gap-3 bg-white/10 rounded-2xl px-4 py-3 backdrop-blur-sm">
              <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center text-white font-black text-sm">
                {user.name?.charAt(0) ?? "S"}
              </div>
              <div>
                <p className="text-sm font-bold leading-tight">{user.name}</p>
                <p className="text-[11px] text-blue-300">{user.email}</p>
              </div>
              <User className="w-4 h-4 text-blue-300 ml-auto" />
            </div>
          ) : (
            // ✅ Show warning if user not logged in
            <div className="bg-red-500/20 border border-red-400/30 rounded-2xl px-4 py-3">
              <p className="text-xs text-red-300 font-bold">
                ⚠️ Not logged in — please login first before scanning
              </p>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto bg-slate-50 px-5 py-6 space-y-5">

          {/* Camera error */}
          {camError && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-red-700">Camera Error</p>
                <p className="text-xs text-red-500 mt-0.5">{camErrorMsg}</p>
              </div>
            </div>
          )}

          {/* Scanner viewport — always in DOM, shown/hidden via CSS */}
          <div style={{ display: phase === "scanning" ? "block" : "none" }}>
            <div className="space-y-3">
              <div className="relative rounded-3xl overflow-hidden bg-black shadow-xl" style={{ minHeight: 300 }}>
                <div id="qr-reader" className="w-full" />
                {scannerReady && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="relative w-52 h-52">
                      {[
                        "top-0 left-0 border-t-4 border-l-4 rounded-tl-xl",
                        "top-0 right-0 border-t-4 border-r-4 rounded-tr-xl",
                        "bottom-0 left-0 border-b-4 border-l-4 rounded-bl-xl",
                        "bottom-0 right-0 border-b-4 border-r-4 rounded-br-xl",
                      ].map((cls, i) => (
                        <div key={i} className={`absolute w-8 h-8 border-white ${cls}`} />
                      ))}
                      <div
                        className="absolute left-2 right-2 h-0.5 bg-green-400 shadow-lg"
                        style={{ animation: "scan-line 2s ease-in-out infinite" }}
                      />
                    </div>
                  </div>
                )}
                {!scannerReady && phase === "scanning" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                    <div className="flex flex-col items-center gap-3 text-white">
                      <Loader2 className="w-8 h-8 animate-spin" />
                      <p className="text-xs font-medium">Starting camera...</p>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-center text-sm text-slate-500 font-medium">
                Point your camera at the QR code on the board
              </p>
              <button
                onClick={reset}
                className="w-full py-3 rounded-2xl border-2 border-slate-200 text-sm font-bold text-slate-500 hover:bg-white transition-all"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Idle content */}
          {phase !== "scanning" && (
            <>
              {/* Scan button */}
              <button
                onClick={startScanner}
                className="w-full flex flex-col items-center gap-4 bg-[#0b1f3a] hover:bg-[#0f2a4a] text-white py-10 rounded-3xl shadow-xl transition-all active:scale-[0.98]"
              >
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-blue-500 flex items-center justify-center shadow-lg">
                    <Camera className="w-9 h-9" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full flex items-center justify-center">
                    <QrCode className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-lg font-black tracking-tight">Scan QR Code</p>
                  <p className="text-sm text-blue-300 mt-0.5">Tap to open camera</p>
                </div>
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs text-slate-400 font-medium">or enter token manually</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {/* Manual token */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Manual Token
                </label>
                <input
                  value={manualToken}
                  onChange={e => setManual(e.target.value)}
                  placeholder="Paste token from trainer..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <button
                  onClick={() => {
                    if (!manualToken.trim()) return;
                    scannedRef.current = false; // ✅ reset so it can process again
                    processToken(manualToken.trim());
                  }}
                  disabled={!manualToken.trim()}
                  className="w-full py-3 rounded-xl bg-blue-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-sm transition-all"
                >
                  Submit Token
                </button>
              </div>

              {/* ✅ Auth status check — helps debug */}
              <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Connection Status
                </p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${user ? "bg-green-500" : "bg-red-500"}`} />
                    <p className="text-xs text-slate-600">
                      {user ? `Logged in as: ${user.name}` : "Not logged in"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getToken() ? "bg-green-500" : "bg-red-500"}`} />
                    <p className="text-xs text-slate-600">
                      {getToken() ? "Auth token present ✅" : "Auth token missing ❌ — please re-login"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <p className="text-xs text-slate-600">API: {API}</p>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">How it works</p>
                {[
                  { n: "1", text: "Trainer displays a QR code at the start of class" },
                  { n: "2", text: "Scan once when you arrive → marks your Time-In" },
                  { n: "3", text: "Scan again when you leave → marks your Time-Out" },
                ].map(step => (
                  <div key={step.n} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[11px] font-black flex-shrink-0 mt-0.5">
                      {step.n}
                    </div>
                    <p className="text-sm text-slate-600 leading-snug">{step.text}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes scan-line {
          0%, 100% { top: 8px; opacity: 1; }
          50%       { top: calc(100% - 8px); opacity: 0.8; }
        }
      `}</style>
    </MobileShell>
  );
}

function MobileShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100 flex items-start justify-center py-0 sm:py-8">
      <div className="w-full max-w-sm min-h-screen sm:min-h-0 sm:h-[780px] bg-white sm:rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col">
        {children}
      </div>
    </div>
  );
}

function ResultScreen({
  icon, bg, title, subtitle, note, onReset, color,
}: {
  icon:     React.ReactNode;
  bg:       string;
  title:    string;
  subtitle: string;
  note:     string;
  onReset:  () => void;
  color:    "green" | "blue" | "amber" | "red" | "gray";
}) {
  const rings: Record<string, string> = {
    green: "bg-green-100",
    blue:  "bg-blue-100",
    amber: "bg-amber-100",
    red:   "bg-red-100",
    gray:  "bg-slate-100",
  };
  return (
    <MobileShell>
      <div className="flex flex-col items-center justify-center h-full px-6 gap-6">
        <div className="relative flex items-center justify-center">
          {[0, 1].map(i => (
            <div
              key={i}
              className={`absolute rounded-full ${rings[color]} animate-ping`}
              style={{
                width:          `${(i + 2) * 52}px`,
                height:         `${(i + 2) * 52}px`,
                animationDelay: `${i * 0.2}s`,
                opacity:        0.4 - i * 0.15,
              }}
            />
          ))}
          <div className={`relative w-24 h-24 rounded-full ${bg} flex items-center justify-center shadow-2xl`}>
            {icon}
          </div>
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-slate-800">{title}</h2>
          <p className="text-base font-semibold text-slate-600">{subtitle}</p>
          <p className="text-sm text-slate-400 leading-relaxed">{note}</p>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Scan Again
        </button>
      </div>
    </MobileShell>
  );
}

export default function QRScanPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    }>
      <QRScanPage />
    </Suspense>
  );
}
