"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "@/app/context/AuthContext";
import {
  Camera, CheckCircle, XCircle, Loader2,
  User, RefreshCw, AlertTriangle, Scan,
  Shield, Info
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

type EnrolPhase = "idle" | "loading_models" | "ready" | "capturing" | "processing" | "success" | "error";

export default function FaceEnrolPage() {
  const { user } = useAuth();

  const videoRef    = useRef<HTMLVideoElement>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const streamRef   = useRef<MediaStream | null>(null);
  const modelsLoaded = useRef(false);

  const [phase, setPhase]       = useState<EnrolPhase>("idle");
  const [message, setMessage]   = useState("");
  const [captures, setCaptures] = useState<Float32Array[]>([]);
  const [preview, setPreview]   = useState<string | null>(null);
  const [hasExisting, setHasExisting] = useState(false);

  /* ── Load face-api models ───────────────────── */
  const loadModels = useCallback(async () => {
    setPhase("loading_models");
    setMessage("Loading face detection models...");

    try {
      const faceapi = await import("face-api.js");

      // Models must be in /public/models/
     // ✅ This is the correct working URL
const MODEL_URL = "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js/weights";

      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);

      modelsLoaded.current = true;
      setPhase("ready");
      setMessage("Models loaded. Camera is ready.");
    } catch (err: any) {
      console.error("Model load error:", err);
      setPhase("error");
      setMessage(`Failed to load models: ${err?.message}. Make sure /public/models/ folder exists.`);
    }
  }, []);

  /* ── Start webcam ───────────────────────────── */
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
    } catch (err: any) {
      setPhase("error");
      setMessage("Camera access denied. Please allow camera access and try again.");
    }
  }, []);

  /* ── Stop camera ────────────────────────────── */
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  /* ── Check existing enrolment ───────────────── */
  const checkExisting = useCallback(async () => {
    try {
      const res  = await fetch(`${API}/api/attendance/face/check`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await res.json();
      setHasExisting(data.has_embedding ?? false);
    } catch {}
  }, []);

  /* ── Initialize ─────────────────────────────── */
  useEffect(() => {
    checkExisting();
    loadModels().then(() => startCamera());
    return () => stopCamera();
  }, [loadModels, startCamera, checkExisting]);

  /* ── Capture face ───────────────────────────── */
  const captureFace = async () => {
    if (!videoRef.current || !canvasRef.current || !modelsLoaded.current) return;
    setPhase("capturing");
    setMessage("Detecting face...");

    try {
      const faceapi = await import("face-api.js");
      const video   = videoRef.current;
      const canvas  = canvasRef.current;

      canvas.width  = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(video, 0, 0);

      // Save preview
      setPreview(canvas.toDataURL("image/jpeg", 0.8));

      setMessage("Analyzing face features...");
      setPhase("processing");

      // Detect face + get 128-dim descriptor
      const detection = await faceapi
        .detectSingleFace(canvas, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setPhase("ready");
        setMessage("No face detected. Please look directly at the camera and try again.");
        setPreview(null);
        return;
      }

      const descriptor = detection.descriptor;
      setCaptures(prev => [...prev, descriptor]);
      setMessage(`Face captured! (${captures.length + 1}/3 captures done)`);
      setPhase("ready");

    } catch (err: any) {
      console.error("Capture error:", err);
      setPhase("ready");
      setMessage(`Capture failed: ${err?.message}`);
      setPreview(null);
    }
  };

  /* ── Save face embedding ────────────────────── */
  const saveEmbedding = async () => {
    if (captures.length === 0) {
      setMessage("Please capture at least 1 face photo first.");
      return;
    }

    setPhase("processing");
    setMessage("Saving face data...");

    try {
      // Average all captures for better accuracy
      const avgEmbedding = new Float32Array(128);
      captures.forEach(c => {
        c.forEach((val, i) => { avgEmbedding[i] += val / captures.length; });
      });

      const res  = await fetch(`${API}/api/attendance/face/enrol`, {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:  `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          embedding: Array.from(avgEmbedding),
        }),
      });
      const data = await res.json();

      if (data.success) {
        setPhase("success");
        setMessage("Face enrolled successfully! You can now use photo attendance.");
        setHasExisting(true);
        stopCamera();
      } else {
        setPhase("error");
        setMessage(data.message ?? "Failed to save face data.");
      }
    } catch (err: any) {
      setPhase("error");
      setMessage(`Save failed: ${err?.message}`);
    }
  };

  /* ── Reset ──────────────────────────────────── */
  const reset = async () => {
    setCaptures([]);
    setPreview(null);
    setMessage("");
    setPhase("ready");
    await startCamera();
  };

  /* ════════ RENDER ════════ */
  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-600/20">
            <Scan className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800">Face Enrolment</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Register your face for photo-based attendance
            </p>
          </div>
          {hasExisting && (
            <div className="ml-auto flex items-center gap-2 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-xs font-bold text-green-700">Already enrolled</span>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-2xl p-4">
        <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700">
          <p className="font-bold mb-1">How to enrol:</p>
          <p>1. Look directly at the camera in good lighting</p>
          <p>2. Click "Capture Face" 3 times from slightly different angles</p>
          <p>3. Click "Save Face Data" — done!</p>
        </div>
      </div>

      {/* Camera + Canvas */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

        {/* Video */}
        <div className="relative bg-black" style={{ aspectRatio: "4/3" }}>
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
          />

          {/* Face guide overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-48 h-56">
              {["top-0 left-0 border-t-4 border-l-4", "top-0 right-0 border-t-4 border-r-4",
                "bottom-0 left-0 border-b-4 border-l-4", "bottom-0 right-0 border-b-4 border-r-4"
              ].map((cls, i) => (
                <div key={i} className={`absolute w-8 h-8 border-white/70 rounded-sm ${cls}`} />
              ))}
              <div className="absolute inset-0 rounded-full border-2 border-white/20 border-dashed" />
            </div>
          </div>

          {/* Status overlay */}
          {(phase === "loading_models" || phase === "processing") && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <div className="text-center text-white">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                <p className="text-sm font-medium">{message}</p>
              </div>
            </div>
          )}

          {/* Capture count badge */}
          {captures.length > 0 && (
            <div className="absolute top-3 right-3 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold">
              {captures.length}/3 captured
            </div>
          )}
        </div>

        {/* Hidden canvas for processing */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Preview strip */}
        {preview && (
          <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
            <img src={preview} alt="preview" className="w-12 h-12 rounded-lg object-cover border-2 border-purple-200" />
            <p className="text-xs text-slate-500">Last capture preview</p>
          </div>
        )}

        {/* Controls */}
        <div className="p-5 space-y-3">

          {/* Message */}
          {message && (
            <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium ${
              message.includes("success") || message.includes("captured") || message.includes("loaded")
                ? "bg-green-50 text-green-700 border border-green-200"
                : message.includes("failed") || message.includes("denied") || message.includes("No face")
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : "bg-blue-50 text-blue-700 border border-blue-200"
            }`}>
              {message.includes("success") || message.includes("captured")
                ? <CheckCircle className="w-4 h-4 flex-shrink-0" />
                : message.includes("failed") || message.includes("denied")
                  ? <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  : <Info className="w-4 h-4 flex-shrink-0" />}
              {message}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {/* Capture button */}
            <button
              onClick={captureFace}
              disabled={phase !== "ready"}
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-sm transition-all"
            >
              <Camera className="w-4 h-4" />
              Capture Face ({captures.length}/3)
            </button>

            {/* Save button */}
            <button
              onClick={saveEmbedding}
              disabled={captures.length === 0 || phase === "processing"}
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#0b1f3a] hover:bg-[#0f2a4a] disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-sm transition-all"
            >
              {phase === "processing"
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Shield className="w-4 h-4" />}
              Save Face Data
            </button>
          </div>

          {/* Reset */}
          {captures.length > 0 && phase !== "processing" && (
            <button
              onClick={reset}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Reset & Start Over
            </button>
          )}
        </div>
      </div>

      {/* Success state */}
      {phase === "success" && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <h3 className="text-lg font-black text-green-800">Face Enrolled!</h3>
          <p className="text-sm text-green-600 mt-1">
            Your face has been registered. You can now mark attendance using the Photo method.
          </p>
        </div>
      )}
    </div>
  );
}
