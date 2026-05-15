"use client";
import { useEffect, useState, useRef } from "react";

interface Testimonial {
  id: number;
  full_name: string;
  course_name: string;
  rating: number;
  testimonial: string;
  photo_url: string;
}

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const API = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await fetch(`${API}/api/placement-feedback/testimonials/approved`);
        const data = await res.json();
        setTestimonials(data.testimonials || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  useEffect(() => {
    if (!isAutoPlaying || testimonials.length === 0) return;
    autoPlayRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => { if (autoPlayRef.current) clearInterval(autoPlayRef.current); };
  }, [isAutoPlaying, testimonials.length]);

  useEffect(() => {
    if (!carouselRef.current || testimonials.length === 0) return;
    const cardWidth = carouselRef.current.scrollWidth / testimonials.length;
    carouselRef.current.scrollTo({
      left: cardWidth * activeIndex - carouselRef.current.clientWidth / 2 + cardWidth / 2,
      behavior: "smooth",
    });
  }, [activeIndex, testimonials.length]);

  const goTo = (index: number) => {
    setActiveIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 8000);
  };

  const goPrev = () => goTo((activeIndex - 1 + testimonials.length) % testimonials.length);
  const goNext = () => goTo((activeIndex + 1) % testimonials.length);

  const getPhotoUrl = (photoUrl: string) =>
    photoUrl ? `${API}/${photoUrl.replace(/\\/g, "/")}` : null;

  if (loading || testimonials.length === 0) return null;

  return (
    <section className="w-full bg-gradient-to-b from-white to-blue-50 py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-2">
            Success Stories
          </p>
          <h2 className="text-3xl md:text-4xl font-black mb-6 tracking-tight uppercase">
            <span className="text-blue-600">What Our</span> <span className="text-red-600">Students Say</span>
          </h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto text-sm">
            Real experiences from students who transformed their careers with us
          </p>
        </div>

        {/* Carousel */}
        <div className="relative">

          {/* Left Arrow */}
          <button
            onClick={goPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-blue-50 hover:border-blue-300 transition-all text-gray-700"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* Right Arrow */}
          <button
            onClick={goNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-blue-50 hover:border-blue-300 transition-all text-gray-700"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {/* Cards */}
          <div
            ref={carouselRef}
            className="flex gap-5 overflow-x-hidden px-8 pb-4"
            style={{ scrollBehavior: "smooth" }}
          >
            {testimonials.map((t, index) => {
              const isActive = index === activeIndex;
              const photoUrl = getPhotoUrl(t.photo_url);

              return (
                <div
                  key={t.id}
                  onClick={() => goTo(index)}
                  className={`flex-shrink-0 w-[300px] md:w-[340px] cursor-pointer rounded-2xl p-6 border transition-all duration-500 ${
                    isActive
                      ? "bg-[#163d6c] border-blue-500 shadow-xl shadow-blue-900/40 scale-105"
                      : "bg-[#ffffff] border-white/10 shadow-sm scale-95 opacity-60 hover:opacity-80"
                  }`}
                >
                  {/* Stars */}
                  <div className="flex gap-0.5 mb-4">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s} className="text-base">
                        {s <= t.rating ? "⭐" : <span className="text-white/30">☆</span>}
                      </span>
                    ))}
                  </div>

                  {/* Quote */}
                  <p className={`text-sm leading-relaxed mb-6 italic line-clamp-4 ${
                    isActive ? "text-blue-100" : "text-slate-500"
                  }`}>
                    &quot;{t.testimonial}&quot;
                  </p>

                  {/* Student */}
                  <div className={`flex items-center gap-3 pt-4 border-t ${
                    isActive ? "border-blue-700" : "border-white/10"
                  }`}>
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt={t.full_name}
                        className="w-11 h-11 rounded-full object-cover border-2 border-blue-500/40 shadow"
                      />
                    ) : (
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm border-2 shadow ${
                        isActive ? "bg-blue-600 border-blue-400 text-white" : "bg-white/10 border-white/20 text-white"
                      }`}>
                        {t.full_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className={`font-semibold text-sm ${isActive ? "text-white" : "text-white/60"}`}>
                        {t.full_name}
                      </p>
                      <p className={`text-xs font-medium ${isActive ? "text-blue-300" : "text-blue-400/50"}`}>
                        {t.course_name}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goTo(index)}
              className={`rounded-full transition-all duration-300 ${
                index === activeIndex
                  ? "w-8 h-2.5 bg-blue-600"
                  : "w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 mt-3">
          {activeIndex + 1} / {testimonials.length}
        </p>
      </div>
    </section>
  );
}
