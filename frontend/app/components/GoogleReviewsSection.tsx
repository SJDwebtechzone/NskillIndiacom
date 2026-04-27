"use client";
import { useEffect, useState, useRef } from "react";

interface Review {
  id: number;
  full_name: string;
  course_name: string;
  rating: number;
  review_text: string;
  photo_url: string;
  google_review_url: string;
}

export default function GoogleReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const API = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`${API}/api/reviews/google/approved`);
        const data = await res.json();
        setReviews(data.reviews || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  useEffect(() => {
    if (!isAutoPlaying || reviews.length === 0) return;
    autoPlayRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % reviews.length);
    }, 4000);
    return () => { if (autoPlayRef.current) clearInterval(autoPlayRef.current); };
  }, [isAutoPlaying, reviews.length]);

  useEffect(() => {
    if (!carouselRef.current || reviews.length === 0) return;
    const cardWidth = carouselRef.current.scrollWidth / reviews.length;
    carouselRef.current.scrollTo({
      left: cardWidth * activeIndex - carouselRef.current.clientWidth / 2 + cardWidth / 2,
      behavior: "smooth",
    });
  }, [activeIndex, reviews.length]);

  const goTo = (index: number) => {
    setActiveIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 8000);
  };

const getPhotoUrl = (photoUrl: string) => {
  if (!photoUrl) return null;
  // Replace backslashes with forward slashes
  const cleaned = photoUrl.replace(/\\/g, "/");
  // Add leading slash if missing
  const withSlash = cleaned.startsWith("/") ? cleaned : `/${cleaned}`;
  return `${API}${withSlash}`;
};

  if (loading || reviews.length === 0) return null;

  return (
    <section className="w-full py-16 overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <p className="font-semibold text-sm uppercase tracking-widest text-gray-500">Google Reviews</p>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Student Reviews</h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto text-sm">
            Verified reviews from our students on Google
          </p>
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="h-px w-16 bg-gray-200" />
            <div className="flex gap-0.5">{[1,2,3,4,5].map(s => <span key={s} className="text-yellow-400 text-lg">★</span>)}</div>
            <div className="h-px w-16 bg-gray-200" />
          </div>
        </div>

        {/* Carousel */}
        <div className="relative">
          <button
            onClick={() => goTo((activeIndex - 1 + reviews.length) % reviews.length)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 w-10 h-10 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center hover:bg-gray-50"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            onClick={() => goTo((activeIndex + 1) % reviews.length)}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 w-10 h-10 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center hover:bg-gray-50"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          <div ref={carouselRef} className="flex gap-5 overflow-x-hidden px-8 pb-4">
            {reviews.map((r, index) => {
              const isActive = index === activeIndex;
              const photoUrl = getPhotoUrl(r.photo_url);
              return (
                <div
                  key={r.id}
                  onClick={() => goTo(index)}
                  className="flex-shrink-0 w-[300px] md:w-[340px] cursor-pointer rounded-2xl p-6 border transition-all duration-500"
                  style={{
                    background: isActive ? "#fff" : "#fafafa",
                    border: isActive ? "1.5px solid #e5e7eb" : "1.5px solid #f3f4f6",
                    boxShadow: isActive ? "0 10px 30px rgba(0,0,0,0.1)" : "0 2px 8px rgba(0,0,0,0.04)",
                    transform: isActive ? "scale(1.05)" : "scale(0.95)",
                    opacity: isActive ? 1 : 0.7,
                  }}
                >
                  {/* Google icon */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(s => (
                        <span key={s} className={`text-base ${s <= r.rating ? "text-yellow-400" : "text-gray-200"}`}>★</span>
                      ))}
                    </div>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed mb-5 italic line-clamp-4">
                    "{r.review_text}"
                  </p>
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                    {photoUrl ? (
                      <img src={photoUrl} alt={r.full_name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-100" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 text-sm">
                        {r.full_name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{r.full_name}</p>
                      <p className="text-xs text-gray-400">{r.course_name}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {reviews.map((_, i) => (
            <button key={i} onClick={() => goTo(i)}
              className="rounded-full transition-all duration-300"
              style={{ width: i === activeIndex ? "28px" : "8px", height: "8px", background: i === activeIndex ? "#4285F4" : "#d1d5db" }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
