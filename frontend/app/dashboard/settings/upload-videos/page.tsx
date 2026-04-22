"use client";

import { useState, useRef, ChangeEvent } from "react";

interface PreviewItem {
  name: string;
  type: "photo" | "video";
  url: string;
  size: string;
}

interface Message {
  type: "success" | "error";
  text: string;
}

export default function InfrastructureSettings() {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<PreviewItem[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [message, setMessage] = useState<Message | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files);
    setFiles(selected);
    const previewList: PreviewItem[] = selected.map((file) => ({
      name: file.name,
      type: file.type.startsWith("video/") ? "video" : "photo",
      url: URL.createObjectURL(file),
      size: formatSize(file.size),
    }));
    setPreviews(previewList);
    setMessage(null);
    setProgress(0);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files).filter(
      (f) => f.type.startsWith("image/") || f.type.startsWith("video/")
    );
    if (dropped.length === 0) return;
    setFiles(dropped);
    setPreviews(
      dropped.map((file) => ({
        name: file.name,
        type: file.type.startsWith("video/") ? "video" : "photo",
        url: URL.createObjectURL(file),
        size: formatSize(file.size),
      }))
    );
    setMessage(null);
    setProgress(0);
  };

  // ✅ ALL files upload in ONE request — parallel, not one by one
  const handleUpload = async () => {
    if (files.length === 0) {
      setMessage({ type: "error", text: "Please select at least one file." });
      return;
    }

    setUploading(true);
    setMessage(null);
    setProgress(0);

    try {
      const formData = new FormData();
      // Append ALL files at once
      files.forEach((file) => formData.append("media", file));

      // Simulate progress with XHR for real upload progress
      const uploadResult = await new Promise<{ success: boolean; count: number; error?: string }>(
        (resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const pct = Math.round((e.loaded / e.total) * 100);
              setProgress(pct);
            }
          };

          xhr.onload = () => {
            try {
              resolve(JSON.parse(xhr.responseText));
            } catch {
              reject(new Error("Invalid response"));
            }
          };

          xhr.onerror = () => reject(new Error("Network error"));

          xhr.open("POST", "http://localhost:5000/api/infrastructure/upload");
          xhr.send(formData);
        }
      );

      if (uploadResult.success) {
        setProgress(100);
        setMessage({
          type: "success",
          text: `✅ ${uploadResult.count} file(s) uploaded successfully!`,
        });
        setFiles([]);
        setPreviews([]);
        if (fileInputRef.current) fileInputRef.current.value = "";
        setTimeout(() => setProgress(0), 2000);
      } else {
        setMessage({ type: "error", text: uploadResult.error || "Upload failed." });
        setProgress(0);
      }
    } catch {
      setMessage({ type: "error", text: "Server error. Make sure backend is running." });
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const removePreview = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const photoCount = previews.filter((p) => p.type === "photo").length;
  const videoCount = previews.filter((p) => p.type === "video").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 md:p-10">
      <div className="max-w-5xl mx-auto">

        {/* ── Header ── */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <p className="text-amber-400 text-xs font-bold tracking-widest uppercase">Admin Panel</p>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Infrastructure Media
          </h1>
          <p className="text-slate-400 mt-2 text-base">
            Upload multiple photos & videos at once — all files upload simultaneously.
          </p>
        </div>

        {/* ── Stats Bar ── */}
        {previews.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2">
              <span className="text-lg">🖼️</span>
              <span className="text-white font-bold">{photoCount}</span>
              <span className="text-slate-400 text-sm">Photos</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2">
              <span className="text-lg">🎬</span>
              <span className="text-white font-bold">{videoCount}</span>
              <span className="text-slate-400 text-sm">Videos</span>
            </div>
            <div className="flex items-center gap-2 bg-amber-400/10 border border-amber-400/30 rounded-xl px-4 py-2">
              <span className="text-lg">📦</span>
              <span className="text-amber-400 font-bold">{previews.length}</span>
              <span className="text-amber-400/70 text-sm">Total selected</span>
            </div>
          </div>
        )}

        {/* ── Upload Card ── */}
        <div className="bg-slate-900 border border-slate-700/60 rounded-3xl p-6 md:p-8 shadow-2xl shadow-black/40">

          {/* Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-600 hover:border-amber-400
              hover:bg-amber-400/5 transition-all duration-300 rounded-2xl p-10 md:p-16
              text-center cursor-pointer group select-none"
          >
            <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
              📁
            </div>
            <p className="text-white text-xl font-bold mb-1 group-hover:text-amber-400 transition-colors">
              Click or drag & drop files here
            </p>
            <p className="text-slate-500 text-sm">
              JPG, PNG, GIF, WEBP, MP4, WEBM — max 100MB each — unlimited files
            </p>
            <div className="mt-4 inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 rounded-full px-4 py-1.5">
              <span className="text-amber-400 text-xs font-semibold">⚡ All files upload at the same time</span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* ── Preview Grid ── */}
          {previews.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <p className="text-slate-300 font-semibold text-sm uppercase tracking-wider">
                  Preview — {previews.length} file(s)
                </p>
                <button
                  onClick={() => { setFiles([]); setPreviews([]); setMessage(null); }}
                  className="text-xs text-red-400 hover:text-red-300 border border-red-400/30 hover:border-red-400/60 px-3 py-1 rounded-full transition-all"
                >
                  Clear all
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {previews.map((p, i) => (
                  <div
                    key={i}
                    className="relative group rounded-xl overflow-hidden bg-slate-800 border border-slate-700 hover:border-amber-400/50 transition-all"
                    style={{ aspectRatio: "1" }}
                  >
                    {p.type === "photo" ? (
                      <img
                        src={p.url}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full relative bg-slate-900 flex items-center justify-center">
                        <video src={p.url} className="w-full h-full object-cover" muted />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-10 h-10 rounded-full bg-black/70 flex items-center justify-center">
                            <span className="text-white text-sm ml-0.5">▶</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200" />

                    {/* File info */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                      <p className="text-white text-xs truncate">{p.name}</p>
                      <p className="text-slate-400 text-xs">{p.size}</p>
                    </div>

                    {/* Type badge */}
                    <span className="absolute top-2 left-2 text-xs bg-black/60 text-white px-1.5 py-0.5 rounded-md">
                      {p.type === "video" ? "🎬" : "🖼️"}
                    </span>

                    {/* Remove btn */}
                    <button
                      onClick={(e) => { e.stopPropagation(); removePreview(i); }}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-400 text-white rounded-full
                        flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100
                        transition-all duration-200 shadow-lg"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Progress Bar ── */}
          {uploading && (
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">
                  Uploading {files.length} file(s) simultaneously...
                </span>
                <span className="text-amber-400 font-bold">{progress}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* ── Message ── */}
          {message && !uploading && (
            <div className={`mt-6 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 ${
              message.type === "success"
                ? "bg-green-500/15 border border-green-500/30 text-green-300"
                : "bg-red-500/15 border border-red-500/30 text-red-300"
            }`}>
              {message.text}
            </div>
          )}

          {/* ── Upload Button ── */}
          <button
            onClick={handleUpload}
            disabled={uploading || files.length === 0}
            className="mt-6 w-full py-4 rounded-2xl font-black text-sm tracking-widest uppercase
              transition-all duration-300 relative overflow-hidden
              bg-amber-400 hover:bg-amber-300 text-slate-900
              disabled:opacity-30 disabled:cursor-not-allowed
              active:scale-[0.99]"
          >
            {uploading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-slate-900/40 border-t-slate-900 rounded-full animate-spin" />
                Uploading {files.length} file(s)...
              </span>
            ) : (
              `Upload ${files.length > 0 ? `${files.length} File${files.length > 1 ? "s" : ""}` : ""} Now`
            )}
          </button>

          {files.length > 0 && !uploading && (
            <p className="text-center text-slate-500 text-xs mt-3">
              All {files.length} files will be uploaded simultaneously in one request
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
