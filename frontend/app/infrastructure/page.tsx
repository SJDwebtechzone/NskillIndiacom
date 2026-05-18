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
  const [showScrollTop, setShowScrollTop] = useState(false);
  const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

  useEffect(() => { fetchMedia(); }, []);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

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
    <div className="min-h-screen bg-slate-50">

      {/* ── HERO BANNER ── */}
      <div className="relative bg-[#0b1f3a] text-white overflow-hidden">

        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-orange-500/10 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] rounded-full bg-[#0b1f3a]/30 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-px bg-white/5" />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: "60px 60px"
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-12 md:py-20 flex flex-col md:flex-row items-center justify-between gap-10">
          
          {/* Left Side: Title */}
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-400/30 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
              <span className="text-white text-xs font-bold tracking-widest uppercase">Our Facilities</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight uppercase leading-tight">
              Infrastructure
              <span className="block text-white">Gallery</span>
            </h1>
          </div>

          {/* Right Side: Text & Stats */}
          <div className="flex-1 w-full flex flex-col items-center md:items-end text-center md:text-left">
            <div className="w-full md:max-w-md">
              <p className="text-white text-base md:text-lg mb-8">
                Explore our state-of-the-art training facilities through photos &amp; videos
              </p>

              {/* Stats */}
              {!loading && (
                <div className="flex justify-center md:justify-start gap-4 w-full">
                  {[
                    { label: "Photos", value: photos.length,  icon: "📷", filter: "photo" },
                    { label: "Videos", value: videos.length,  icon: "🎬", filter: "video" },
                    { label: "Total",  value: media.length,   icon: "📁", filter: "all"  },
                  ].map((s) => (
                    <div 
                      key={s.label} 
                      onClick={() => setFilter(s.filter as "all" | "photo" | "video")}
                      className={`bg-white/5 hover:bg-white/10 border rounded-2xl px-6 py-4 md:px-8 md:py-5 text-center transition-all duration-300 group cursor-pointer ${
                        filter === s.filter ? "border-orange-500 bg-white/20" : "border-white/10 hover:border-orange-500/40"
                      }`}
                    >
                      <div className="text-2xl mb-1">{s.icon}</div>
                      <p className="text-2xl md:text-3xl font-black text-white group-hover:text-blue-300 transition-colors">{s.value}</p>
                      <p className="text-blue-300/70 text-[10px] md:text-xs uppercase tracking-widest mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
          <style>{`
            @keyframes wave-move {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .wave-animate {
              animation: wave-move 8s linear infinite;
              width: 200%;
              display: flex;
            }
          `}</style>
          <div className="wave-animate">
            <svg viewBox="0 0 1440 50" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "50%", flexShrink: 0 }}>
              <path d="M0 50L1440 50L1440 15C1200 45 900 5 720 25C540 45 240 5 0 15L0 50Z" fill="#f8fafc"/>
            </svg>
            <svg viewBox="0 0 1440 50" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "50%", flexShrink: 0 }}>
              <path d="M0 50L1440 50L1440 15C1200 45 900 5 720 25C540 45 240 5 0 15L0 50Z" fill="#f8fafc"/>
            </svg>
          </div>
        </div>
      </div>

      {/* ── FILTER TABS ── */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <p className="text-sm text-slate-500 font-medium hidden sm:block">
            {filter === "all" ? `${media.length} items` : filter === "photo" ? `${photos.length} photos` : `${videos.length} videos`}
          </p>
          <div className="flex gap-2 mx-auto sm:mx-0">
            {(["all", "photo", "video"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-5 py-2 rounded-full text-sm font-bold tracking-wide transition-all duration-200 ${
                  filter === tab
                    ? "bg-orange-500 text-white shadow-md"
                    : "bg-slate-100 text-slate-500 hover:bg-orange-50 hover:text-orange-600"
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
            <div className="animate-spin w-12 h-12 border-4 border-[#0b1f3a] border-t-transparent rounded-full" />
            <p className="text-slate-400 text-sm">Loading gallery...</p>
          </div>
        ) : (
          <>
            {/* ── PHOTOS ── */}
            {showPhotos && (
              <section>
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-1 h-8 bg-[#0b1f3a] rounded-full" />
                  <h2 className="text-xl font-black text-[#0b1f3a] tracking-tight uppercase">Photos</h2>
                  <span className="bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold px-3 py-1 rounded-full">
                    {photos.length}
                  </span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                {photos.length === 0 ? (
                  <div className="text-center text-slate-400 py-14 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50">
                    <p className="text-4xl mb-3">🖼️</p>
                    <p className="font-semibold text-slate-500">No photos uploaded yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {photos.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setSelected(item)}
                        className="group cursor-pointer rounded-2xl overflow-hidden border border-slate-200 hover:border-orange-500 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                      >
                        <div className="relative aspect-square overflow-hidden bg-slate-100">
                          <img
                            src={item.file_url}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-[#0b1f3a]/0 group-hover:bg-[#0b1f3a]/30 transition-all duration-300 flex items-center justify-center">
                            <div className="w-10 h-10 rounded-full bg-white/0 group-hover:bg-white/90 flex items-center justify-center transition-all duration-300 scale-75 group-hover:scale-100">
                              <span className="text-orange-500 text-lg">🔍</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* ── VIDEOS ── */}
            {showVideos && (
              <section>
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-1 h-8 bg-[#0b1f3a] rounded-full" />
                  <h2 className="text-xl font-black text-[#0b1f3a] tracking-tight uppercase">Videos</h2>
                  <span className="bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold px-3 py-1 rounded-full">
                    {videos.length}
                  </span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                {videos.length === 0 ? (
                  <div className="text-center text-slate-400 py-14 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50">
                    <p className="text-4xl mb-3">🎬</p>
                    <p className="font-semibold text-slate-500">No videos uploaded yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {videos.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setSelected(item)}
                        className="group cursor-pointer rounded-2xl overflow-hidden border border-slate-200 hover:border-orange-500 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                      >
                        <div className="relative aspect-video overflow-hidden bg-slate-900">
                          <video
                            src={item.file_url}
                            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300"
                            muted
                            onMouseEnter={(e) => (e.currentTarget as HTMLVideoElement).play()}
                            onMouseLeave={(e) => {
                              const v = e.currentTarget as HTMLVideoElement;
                              v.pause(); v.currentTime = 0;
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-14 h-14 rounded-full bg-white/90 border-2 border-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-orange-500 group-hover:border-orange-500 transition-all duration-300">
                              <span className="text-orange-500 group-hover:text-white text-xl ml-1 transition-colors duration-300">▶</span>
                            </div>
                          </div>
                          <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg">
                            VIDEO
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {media.length === 0 && (
              <div className="text-center py-28">
                <p className="text-6xl mb-4">📂</p>
                <p className="text-xl font-bold text-slate-400">No media uploaded yet</p>
                <p className="text-slate-400 mt-2 text-sm">Upload photos and videos from the admin panel</p>
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
            className="relative max-w-5xl w-full rounded-3xl overflow-hidden shadow-2xl bg-[#0b1f3a]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 hover:bg-red-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg transition-all duration-200 border border-white/20"
            >
              ✕
            </button>
{selected.file_type === "photo" ? (
               <img
                 src={selected.file_url}
                 alt=""
                 className="w-full max-h-[85vh] object-contain bg-[#0b1f3a]"
               />
             ) : (
               <video
                 src={selected.file_url}
                 controls
                 autoPlay
                 className="w-full max-h-[85vh] bg-black"
               />
             )}
           </div>
         </div>
       )}
     </div>
   );
 }
