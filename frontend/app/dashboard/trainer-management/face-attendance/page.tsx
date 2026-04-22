"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "@/app/context/AuthContext";
import {
  Camera, CheckCircle, XCircle, Loader2,
  RefreshCw, AlertTriangle, Scan, LogIn,
  LogOut, Shield, User
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

type FacePhase =
  | "idle"
  | "loading_models"
  | "ready"
  | "detecting"
  | "matched"
  | "no_match"
  | "success_in"
  | "success_out"
  | "already_out"
  | "error";

const fmt12 = (iso?: string) => {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleTimeString("en-IN", {
      hour: "2-digit", minute: "2-digit", hour12: true,
    });
  } catch { return iso; }
};

export default function FaceAttendancePage() {
  const { user } = useAuth();

  const videoRef     = useRef<HTMLVideoElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const streamRef    = useRef<MediaStream | null>(null);
  const modelsLoaded = useRef(false);
  const processingRef = useRef(false);

  const [phase, setPhase]         = useState<FacePhase>("idle");
  const [message, setMessage]     = useState("");
  const [matchedName, setMatchedName] = useState("");
  const [actionTime, setActionTime]   = useState("");
  const [earlyExit, setEarlyExit]     = useState(false);
  const [sessionId, setSessionId]     = useState<number | null>(null);
  const [batch, setBatch]             = useState("");
  const [autoDetect, setAutoDetect]   = useState(false);
  const autoDetectRef = useRef(false);

  /* ── Load models ────────────────────────────── */
  const loadModels = useCallback(async () => {
    if (modelsLoaded.current) return;
    setPhase("loading_models");
    setMessage("Loading face recognition models...");

    try {
      const faceapi    = await import("face-api.js");
      // ✅ This is the correct working URL
const MODEL_URL = "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js/weights";

      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);

      modelsLoaded.current = true;
      setPhase("ready");
      setMessage("Ready. Click 'Detect Face' to mark attendance.");
    } catch (err: any) {
      setPhase("error");
      setMessage(`Failed to load models: ${err?.message}`);
    }
  }, []);

  /* ── Start camera ───────────────────────────── */
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      setPhase("error");
      setMessage("Camera access denied. Please allow camera access.");
    }
  }, []);

  /* ── Stop camera ────────────────────────────── */
  const stopCamera = () => {
    autoDetectRef.current = false;
    setAutoDetect(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  /* ── Init ───────────────────────────────────── */
  useEffect(() => {
    loadModels().then(() => startCamera());
    return () => stopCamera();
  }, [loadModels, startCamera]);

  /* ── Fetch all face embeddings from backend ─── */
  const fetchEmbeddings = useCallback(async () => {
    const res  = await fetch(`${API}/api/attendance/face/embeddings`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const data = await res.json();
    return data.embeddings ?? []; // [{ admission_id, full_name, batch_allotted, embedding: number[] }]
  }, []);

  /* ── Detect and match face ──────────────────── */
  const detectFace = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !modelsLoaded.current) return;
    if (processingRef.current) return;
    processingRef.current = true;

    setPhase("detecting");
    setMessage("Looking for your face...");

    try {
      const faceapi = await import("face-api.js");
      const video   = videoRef.current;
      const canvas  = canvasRef.current;

      canvas.width  = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d")!.drawImage(video, 0, 0);

      // Get face descriptor from camera
      const detection = await faceapi
        .detectSingleFace(canvas, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setPhase("ready");
        setMessage("No face detected. Please look directly at the camera.");
        processingRef.current = false;
        return;
      }

      setMessage("Face detected! Matching...");
      const liveDescriptor = detection.descriptor;

      // Fetch all stored embeddings
      const embeddings = await fetchEmbeddings();

      if (!embeddings.length) {
        setPhase("error");
        setMessage("No face embeddings found. Students must enrol first.");
        processingRef.current = false;
        return;
      }

      // Find best match using Euclidean distance
      let bestMatch = null;
      let bestDistance = Infinity;
      const THRESHOLD = 0.5; // lower = stricter match

      for (const record of embeddings) {
        const storedDescriptor = new Float32Array(record.embedding);
        const distance = faceapi.euclideanDistance(liveDescriptor, storedDescriptor);

        if (distance < bestDistance) {
          bestDistance = distance;
          bestMatch    = record;
        }
      }

      if (!bestMatch || bestDistance > THRESHOLD) {
        setPhase("no_match");
        setMessage(`Face not recognized (distance: ${bestDistance.toFixed(3)}). Please try again or use manual token.`);
        processingRef.current = false;
        return;
      }

      setMatchedName(bestMatch.full_name);
      setMessage(`Matched: ${bestMatch.full_name} (confidence: ${((1 - bestDistance) * 100).toFixed(0)}%)`);

      // Mark attendance
      const markRes  = await fetch(`${API}/api/attendance/photo/mark`, {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:  `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          admission_id: bestMatch.admission_id,
          batch:        bestMatch.batch_allotted,
          session_id:   sessionId,
          method:       "photo",
        }),
      });
      const markData = await markRes.json();

      if (markData.action === "time_in") {
        setActionTime(fmt12(markData.time));
        setPhase("success_in");
        stopCamera();
      } else if (markData.action === "time_out") {
        setActionTime(fmt12(markData.time));
        setEarlyExit(markData.early_exit ?? false);
        setPhase("success_out");
        stopCamera();
      } else if (markData.message?.includes("checked out")) {
        setPhase("already_out");
        stopCamera();
      } else {
        setPhase("error");
        setMessage(markData.message ?? "Failed to mark attendance.");
      }

    } catch (err: any) {
      console.error("Face detect error:", err);
      setPhase("error");
      setMessage(`Error: ${err?.message}`);
    } finally {
      processingRef.current = false;
    }
  }, [fetchEmbeddings, sessionId]);

  /* ── Auto-detect loop ───────────────────────── */
  useEffect(() => {
    autoDetectRef.current = autoDetect;
    if (!autoDetect) return;

    const interval = setInterval(() => {
      if (autoDetectRef.current && phase === "ready") {
        detectFace();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [autoDetect, phase, detectFace]);

  /* ── Reset ──────────────────────────────────── */
  const reset = async () => {
    setPhase("idle");
    setMessage("");
    setMatchedName("");
    setActionTime("");
    setEarlyExit(false);
    processingRef.current = false;
    await startCamera();
    setPhase("ready");
    setMessage("Ready. Click 'Detect Face' to mark attendance.");
  };

  /* ════════ RENDER ════════ */
  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-600/20">
            <Camera className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800">Photo Attendance</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Look at the camera to mark your attendance
            </p>
          </div>
          {user && (
            <div className="ml-auto flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full">
              <User className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-600">{user.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Session setup */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Session Info (Optional)</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Session ID</label>
            <input
              type="number"
              value={sessionId ?? ""}
              onChange={e => setSessionId(e.target.value ? Number(e.target.value) : null)}
              placeholder="e.g. 19"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Batch</label>
            <input
              value={batch}
              onChange={e => setBatch(e.target.value)}
              placeholder="e.g. 2"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Camera view */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

        <div className="relative bg-black" style={{ aspectRatio: "4/3" }}>
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Face guide */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-48 h-56">
              {["top-0 left-0 border-t-4 border-l-4", "top-0 right-0 border-t-4 border-r-4",
                "bottom-0 left-0 border-b-4 border-l-4", "bottom-0 right-0 border-b-4 border-r-4"
              ].map((cls, i) => (
                <div key={i} className={`absolute w-8 h-8 border-white/70 rounded-sm ${cls}`} />
              ))}
            </div>
          </div>

          {/* Phase overlays */}
          {phase === "detecting" && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="text-center text-white">
                <Loader2 className="w-10 h-10 animate-spin mx-auto mb-2" />
                <p className="text-sm font-bold">{message}</p>
              </div>
            </div>
          )}

          {phase === "loading_models" && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
              <div className="text-center text-white">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                <p className="text-sm">{message}</p>
              </div>
            </div>
          )}

          {/* Auto detect indicator */}
          {autoDetect && phase === "ready" && (
            <div className="absolute top-3 left-3 flex items-center gap-2 bg-green-500/80 text-white px-3 py-1 rounded-full text-xs font-bold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
              </span>
              Auto detecting...
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-5 space-y-3">

          {/* Status message */}
          {message && phase !== "detecting" && phase !== "loading_models" && (
            <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium ${
              phase === "matched"
                ? "bg-green-50 text-green-700 border border-green-200"
                : phase === "no_match" || phase === "error"
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : "bg-blue-50 text-blue-700 border border-blue-200"
            }`}>
              {phase === "matched"
                ? <CheckCircle className="w-4 h-4 flex-shrink-0" />
                : phase === "no_match" || phase === "error"
                  ? <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  : <Shield className="w-4 h-4 flex-shrink-0" />}
              {message}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {/* Detect button */}
            <button
              onClick={detectFace}
              disabled={phase !== "ready" && phase !== "no_match"}
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-sm transition-all"
            >
              {phase === "detecting"
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Scan className="w-4 h-4" />}
              Detect Face
            </button>

            {/* Auto detect toggle */}
            <button
              onClick={() => setAutoDetect(v => !v)}
              disabled={phase !== "ready" && phase !== "no_match" && !autoDetect}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-bold transition-all ${
                autoDetect
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
              }`}
            >
              <Camera className="w-4 h-4" />
              {autoDetect ? "Stop Auto" : "Auto Detect"}
            </button>
          </div>

          <button
            onClick={reset}
            disabled={phase === "detecting" || phase === "loading_models"}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </div>

      {/* Success screens */}
      {phase === "success_in" && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mx-auto shadow-lg shadow-green-500/30">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-black text-green-800">Checked In!</h3>
          <p className="text-base font-semibold text-green-700">{matchedName}</p>
          <p className="text-sm text-green-600">Time-in recorded at {actionTime}</p>
          <button onClick={reset} className="mt-2 flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl bg-white border border-green-200 text-green-700 font-bold text-sm">
            <RefreshCw className="w-4 h-4" /> Next Student
          </button>
        </div>
      )}

      {phase === "success_out" && (
        <div className={`border rounded-2xl p-6 text-center space-y-2 ${
          earlyExit ? "bg-amber-50 border-amber-200" : "bg-blue-50 border-blue-200"
        }`}>
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-lg ${
            earlyExit ? "bg-amber-500 shadow-amber-500/30" : "bg-blue-600 shadow-blue-600/30"
          }`}>
            <LogOut className="w-8 h-8 text-white" />
          </div>
          <h3 className={`text-xl font-black ${earlyExit ? "text-amber-800" : "text-blue-800"}`}>
            {earlyExit ? "Early Exit Noted" : "Checked Out!"}
          </h3>
          <p className={`text-base font-semibold ${earlyExit ? "text-amber-700" : "text-blue-700"}`}>
            {matchedName}
          </p>
          <p className={`text-sm ${earlyExit ? "text-amber-600" : "text-blue-600"}`}>
            Time-out recorded at {actionTime}
          </p>
          <button onClick={reset} className="mt-2 flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-sm">
            <RefreshCw className="w-4 h-4" /> Next Student
          </button>
        </div>
      )}

      {phase === "already_out" && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center">
          <CheckCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-black text-slate-700">Already Completed</h3>
          <p className="text-sm text-slate-500 mt-1">This student has already checked in and out today.</p>
          <button onClick={reset} className="mt-3 flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-sm">
            <RefreshCw className="w-4 h-4" /> Next Student
          </button>
        </div>
      )}
    </div>
  );
}
