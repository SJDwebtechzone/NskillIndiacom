"use client";

import { useState, useEffect } from "react";

interface MediaItem {
  id: number;
  file_type: "photo" | "video";
  file_url: string;
  file_name: string;
}

export default function InfrastructurePage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [filter, setFilter] = useState<"all" | "photo" | "video">("all");
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      const res = await fetch(`${API}/api/infrastructure/media`);
      const data = await res.json();
      if (data.success) setMedia(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const photos = media.filter((m) => m.file_type === "photo");
  const videos = media.filter((m) => m.file_type === "video");
  const showPhotos = filter === "all" || filter === "photo";
  const showVideos = filter === "all" || filter === "video";

  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* ── HERO HEADER ── */}
      <div className="relative bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800 text-white overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-blue-900/40 rounded-full blur-2xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-px bg-white/10" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-blue-200 animate-pulse" />
            <span className="text-blue-100 text-xs font-bold tracking-widest uppercase">Our Work</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-4 leading-tight">
            Infrastructure
            <span className="block text-blue-200">Gallery</span>
          </h1>
          <p className="text-blue-100 text-lg max-w-xl mx-auto opacity-90">
            Explore our projects through photos & videos
          </p>

          {/* Stats */}
          {!loading && (
            <div className="flex justify-center gap-6 mt-10">
              <div className="bg-white/10 border border-white/20 rounded-2xl px-6 py-3 text-center backdrop-blur-sm">
                <p className="text-2xl font-black">{photos.length}</p>
                <p className="text-blue-200 text-xs uppercase tracking-wider mt-0.5">Photos</p>
              </div>
              <div className="bg-white/10 border border-white/20 rounded-2xl px-6 py-3 text-center backdrop-blur-sm">
                <p className="text-2xl font-black">{videos.length}</p>
                <p className="text-blue-200 text-xs uppercase tracking-wider mt-0.5">Videos</p>
              </div>
              <div className="bg-white/10 border border-white/20 rounded-2xl px-6 py-3 text-center backdrop-blur-sm">
                <p className="text-2xl font-black">{media.length}</p>
                <p className="text-blue-200 text-xs uppercase tracking-wider mt-0.5">Total</p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 40L1440 40L1440 10C1200 35 900 5 720 20C540 35 240 5 0 10L0 40Z" fill="white"/>
          </svg>
        </div>
      </div>

      {/* ── FILTER TABS ── */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <p className="text-sm text-gray-500 font-medium hidden sm:block">
            {filter === "all" ? `${media.length} items` : filter === "photo" ? `${photos.length} photos` : `${videos.length} videos`}
          </p>
          <div className="flex gap-2 mx-auto sm:mx-0">
            {(["all", "photo", "video"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-5 py-2 rounded-full text-sm font-bold tracking-wide transition-all duration-200 ${
                  filter === tab
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                    : "bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                {tab === "all" ? "All" : tab === "photo" ? "📷 Photos" : "🎬 Videos"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 pb-24 space-y-16">

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full" />
            <p className="text-gray-400 text-sm">Loading gallery...</p>
          </div>
        ) : (
          <>

            {/* ════ PHOTOS SECTION ════ */}
            {showPhotos && (
              <section>
                {/* Section Header */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-1 h-8 bg-blue-600 rounded-full" />
                  <h2 className="text-xl font-black text-gray-800 tracking-tight">Photos</h2>
                  <span className="bg-blue-50 border border-blue-200 text-blue-600 text-xs font-bold px-3 py-1 rounded-full">
                    {photos.length}
                  </span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>

                {photos.length === 0 ? (
                  <div className="text-center text-gray-400 py-14 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50">
                    <p className="text-4xl mb-3">🖼️</p>
                    <p className="font-semibold text-gray-500">No photos uploaded yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {photos.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setSelected(item)}
                        className="group cursor-pointer rounded-2xl overflow-hidden bg-white
                          border border-gray-200 hover:border-blue-400
                          shadow-sm hover:shadow-xl hover:shadow-blue-100
                          transition-all duration-300 hover:-translate-y-1"
                      >
                        <div className="relative aspect-square overflow-hidden bg-gray-100">
                          <img
                            src={item.file_url}
                            alt={item.file_name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-blue-900/0 group-hover:bg-blue-900/20 transition-all duration-300 flex items-center justify-center">
                            <div className="w-10 h-10 rounded-full bg-white/0 group-hover:bg-white/90 flex items-center justify-center transition-all duration-300 scale-75 group-hover:scale-100">
                              <span className="text-blue-600 text-lg">🔍</span>
                            </div>
                          </div>
                        </div>
                        <div className="px-3 py-2.5 border-t border-gray-100">
                          <p className="text-xs text-gray-500 truncate font-medium">{item.file_name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* ════ VIDEOS SECTION ════ */}
            {showVideos && (
              <section>
                {/* Section Header */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-1 h-8 bg-blue-600 rounded-full" />
                  <h2 className="text-xl font-black text-gray-800 tracking-tight">Videos</h2>
                  <span className="bg-blue-50 border border-blue-200 text-blue-600 text-xs font-bold px-3 py-1 rounded-full">
                    {videos.length}
                  </span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>

                {videos.length === 0 ? (
                  <div className="text-center text-gray-400 py-14 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50">
                    <p className="text-4xl mb-3">🎬</p>
                    <p className="font-semibold text-gray-500">No videos uploaded yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {videos.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setSelected(item)}
                        className="group cursor-pointer rounded-2xl overflow-hidden bg-white
                          border border-gray-200 hover:border-blue-400
                          shadow-sm hover:shadow-xl hover:shadow-blue-100
                          transition-all duration-300 hover:-translate-y-1"
                      >
                        <div className="relative aspect-video overflow-hidden bg-gray-900">
                          <video
                            src={item.file_url}
                            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300"
                            muted
                            onMouseEnter={(e) => (e.currentTarget as HTMLVideoElement).play()}
                            onMouseLeave={(e) => {
                              const v = e.currentTarget as HTMLVideoElement;
                              v.pause();
                              v.currentTime = 0;
                            }}
                          />
                          {/* Play Button */}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-14 h-14 rounded-full bg-white/90 border-2 border-white
                              flex items-center justify-center shadow-lg
                              group-hover:scale-110 group-hover:bg-blue-600 group-hover:border-blue-600
                              transition-all duration-300">
                              <span className="text-blue-600 group-hover:text-white text-xl ml-1 transition-colors duration-300">▶</span>
                            </div>
                          </div>
                          {/* Badge */}
                          <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-lg">
                            VIDEO
                          </div>
                        </div>
                        <div className="px-3 py-2.5 border-t border-gray-100">
                          <p className="text-xs text-gray-500 truncate font-medium">{item.file_name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* No media at all */}
            {media.length === 0 && (
              <div className="text-center py-28">
                <p className="text-6xl mb-4">📂</p>
                <p className="text-xl font-bold text-gray-400">No media uploaded yet</p>
                <p className="text-gray-400 mt-2 text-sm">Upload photos and videos from the admin panel</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── MODAL ── */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative max-w-5xl w-full rounded-3xl overflow-hidden shadow-2xl bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-white hover:bg-red-500
                rounded-full flex items-center justify-center text-gray-700 hover:text-white
                font-bold shadow-lg transition-all duration-200 border border-gray-200"
            >
              ✕
            </button>

            {selected.file_type === "photo" ? (
              <img
                src={selected.file_url}
                alt={selected.file_name}
                className="w-full max-h-[80vh] object-contain bg-gray-50"
              />
            ) : (
              <video
                src={selected.file_url}
                controls
                autoPlay
                className="w-full max-h-[80vh] bg-black"
              />
            )}

            {/* Caption bar */}
            <div className="px-6 py-4 flex items-center justify-between bg-white border-t border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-sm">
                  {selected.file_type === "photo" ? "🖼️" : "🎬"}
                </div>
                <p className="text-gray-700 text-sm font-medium truncate max-w-xs">
                  {selected.file_name}
                </p>
              </div>
              <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                {selected.file_type}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
