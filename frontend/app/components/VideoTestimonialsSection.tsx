"use client";
import { useEffect, useState, useRef } from "react";

interface Video {
  id: number;
  full_name: string;
  course_name: string;
  video_url: string;
  description: string;
  photo_url: string;
}

export default function VideoTestimonialsSection() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<number | null>(null);
  const API = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await fetch(`${API}/api/reviews/video/approved`);
        const data = await res.json();
        setVideos(data.videos || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  const getPhotoUrl = (photoUrl: string) =>
    photoUrl ? `${API}/${photoUrl.replace(/\\/g, "/")}` : null;

const getVideoUrl = (videoUrl: string) =>
  `${API}${videoUrl.replace(/\\/g, "/")}`;

  if (loading || videos.length === 0) return null;

  return (
    <section className="w-full py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-2">
            🎬 Video Testimonials
          </p>
          <h2 className="text-3xl md:text-4xl font-black mb-4 uppercase tracking-tight">
            <span className="text-blue-600">Hear It From</span> <span className="text-red-600">Our Students</span>
          </h2>
          <p className="text-slate-500 mt-3 max-w-xl mx-auto text-sm">
            Real video stories from students who built their careers with us
          </p>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((v) => {
            const photoUrl = getPhotoUrl(v.photo_url);
            const videoUrl = getVideoUrl(v.video_url);
            const isPlaying = activeVideo === v.id;

            return (
              <div
                key={v.id}
                className="rounded-2xl overflow-hidden border border-slate-100 bg-white shadow-sm hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/10"
              >
                {/* Video Player */}
                <div className="relative bg-black aspect-video">
                  {isPlaying ? (
                    <video
                      src={videoUrl}
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                      onEnded={() => setActiveVideo(null)}
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center cursor-pointer group relative"
                      onClick={() => setActiveVideo(v.id)}
                    >
                      {/* Thumbnail — use photo as bg */}
                      {photoUrl && (
                        <img
                          src={photoUrl}
                          alt={v.full_name}
                          className="absolute inset-0 w-full h-full object-cover opacity-40"
                        />
                      )}
                      {/* Dark overlay */}
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-all" />
                      {/* Play button */}
                      <div className="relative z-10 w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/60 flex items-center justify-center group-hover:scale-110 group-hover:bg-white/30 transition-all">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                      </div>
                      {/* Duration hint */}
                      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                        ▶ Play
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Info */}
                <div className="p-4">
                  {v.description && (
                    <p className="text-slate-600 text-sm italic mb-3 line-clamp-2">
                      "{v.description}"
                    </p>
                  )}
                  <div className="flex items-center gap-3">
                    {photoUrl ? (
                      <img src={photoUrl} alt={v.full_name}
                        className="w-9 h-9 rounded-full object-cover border-2 border-blue-500/40" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-blue-700 flex items-center justify-center font-bold text-white text-sm">
                        {v.full_name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{v.full_name}</p>
                      <p className="text-xs text-blue-600 font-medium">{v.course_name}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
