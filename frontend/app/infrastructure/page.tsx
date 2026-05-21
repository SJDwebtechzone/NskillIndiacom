"use client";

import { useState, useEffect } from "react";
import { Camera, Clapperboard, Folder } from "lucide-react";

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
      {/* ── HERO BANNER ── */}
      <div 
        className="relative pt-16 pb-16 lg:pb-20 overflow-hidden bg-center bg-cover bg-no-repeat"
        style={{ backgroundImage: "url('/images/infra/infrastructure-bg.png')" }}
      >
        <div className="relative max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center justify-between gap-12 z-10">
          
          {/* Left Side: Title & Badge */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-[#e0e7ff] border border-[#c7d2fe] rounded-full px-4 py-1.5 mb-8 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2563eb]" />
              <span className="text-[#2563eb] text-xs font-black tracking-widest uppercase">Our Facilities</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-[4.5rem] font-black tracking-tight leading-none text-[#0b1f3a] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
              INFRASTRUCTURE
            </h1>
            <h2 className="text-[3.5rem] md:text-[5rem] lg:text-[6.5rem] font-black tracking-tighter leading-none text-[#2563eb] uppercase">
              Gallery
            </h2>
          </div>

          {/* Right Side: Text & Stats */}
          <div className="flex-1 w-full flex flex-col items-center lg:items-end text-center lg:text-left lg:pt-8">
            <div className="w-full max-w-lg lg:max-w-md">
              <p className="text-[#1e293b] text-base md:text-lg mb-10 font-medium leading-relaxed lg:text-left text-center">
                Explore our state-of-the-art training facilities through<br className="hidden lg:block"/> photos & videos
              </p>

              {/* Stats Cards */}
              {!loading && (
                <div className="flex justify-center lg:justify-start gap-5 w-full">
                  {[
                    { label: "Photos", value: photos.length, icon: <Camera size={32} fill="#3b82f6" stroke="#ffffff" strokeWidth={1} />, filter: "photo" },
                    { label: "Videos", value: videos.length, icon: <Clapperboard size={32} fill="#3b82f6" stroke="#ffffff" strokeWidth={1} />, filter: "video" },
                    { label: "Total",  value: media.length,  icon: <Folder size={32} fill="#3b82f6" stroke="#3b82f6" strokeWidth={0} />, filter: "all" },
                  ].map((s) => (
                    <div 
                      key={s.label} 
                      onClick={() => setFilter(s.filter as "all" | "photo" | "video")}
                      className={`bg-white rounded-3xl p-6 w-[110px] md:w-[130px] flex flex-col items-center justify-center text-center transition-all duration-300 cursor-pointer shadow-[0_10px_40px_rgb(37,99,235,0.08)] border border-white hover:-translate-y-2 hover:shadow-[0_20px_50px_rgb(37,99,235,0.15)] relative overflow-hidden group ${
                        filter === s.filter ? "ring-2 ring-[#3b82f6] border-[#3b82f6]/20" : ""
                      }`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-[#f8fafc] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative z-10 text-[#3b82f6] mb-3 group-hover:scale-110 transition-transform duration-300 drop-shadow-md">
                        {s.icon}
                      </div>
                      <p className="relative z-10 text-4xl md:text-[2.75rem] font-black text-[#2563eb] mb-1 leading-none">{s.value}</p>
                      <p className="relative z-10 text-[#3b82f6] text-[10px] md:text-xs font-bold uppercase tracking-[0.2em]">{s.label}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
                    ? "bg-blue-500 text-white shadow-md"
                    : "bg-slate-100 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
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
                  <span className="bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
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
                        className="group cursor-pointer rounded-2xl overflow-hidden border border-slate-200 hover:border-blue-500 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                      >
                        <div className="relative aspect-square overflow-hidden bg-slate-100">
                          <img
                            src={item.file_url}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-[#0b1f3a]/0 group-hover:bg-[#0b1f3a]/30 transition-all duration-300 flex items-center justify-center">
                            <div className="w-10 h-10 rounded-full bg-white/0 group-hover:bg-white/90 flex items-center justify-center transition-all duration-300 scale-75 group-hover:scale-100">
                              <span className="text-blue-500 text-lg">🔍</span>
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
                  <span className="bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
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
                        className="group cursor-pointer rounded-2xl overflow-hidden border border-slate-200 hover:border-blue-500 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
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
                            <div className="w-14 h-14 rounded-full bg-white/90 border-2 border-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-blue-500 group-hover:border-blue-500 transition-all duration-300">
                              <span className="text-blue-500 group-hover:text-white text-xl ml-1 transition-colors duration-300">▶</span>
                            </div>
                          </div>
                          <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg">
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
