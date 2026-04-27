// "use client";
// import { useEffect, useState } from "react";

// interface Testimonial {
//   id: number;
//   full_name: string;
//   course_name: string;
//   rating: number;
//   testimonial: string;
//   photo_url: string;
// }

// export default function TestimonialsSection() {
//   const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
//   const [loading, setLoading] = useState(true);
//   const API = process.env.NEXT_PUBLIC_API_URL;

//   useEffect(() => {
//     const fetchTestimonials = async () => {
//       try {
//         const res = await fetch(`${API}/api/placement-feedback/testimonials/approved`);
//         const data = await res.json();
//         setTestimonials(data.testimonials || []);
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchTestimonials();
//   }, []);

//   if (loading || testimonials.length === 0) return null;

//   return (
//     <section className="w-full bg-gray-50 py-16">
//       <div className="max-w-6xl mx-auto px-6">
//         {/* Section Header */}
//         <div className="text-center mb-12">
//           <p className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-2">
//             Success Stories
//           </p>
//           <h2 className="text-3xl font-bold text-gray-900">What Our Students Say</h2>
//           <p className="text-gray-500 mt-3 max-w-xl mx-auto">
//             Real experiences from students who transformed their careers with us
//           </p>
//         </div>

//         {/* Testimonials Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {testimonials.map((t) => (
//             <div
//               key={t.id}
//               className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
//             >
//               {/* Stars */}
//               <div className="flex gap-0.5 mb-4">
//                 {[1, 2, 3, 4, 5].map((s) => (
//                   <span key={s} className="text-lg">
//                     {s <= t.rating ? "⭐" : "☆"}
//                   </span>
//                 ))}
//               </div>

//               {/* Testimonial text */}
//               <p className="text-gray-600 text-sm leading-relaxed mb-6 italic">
//                 "{t.testimonial}"
//               </p>

//               {/* Student info */}
//               <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
//                 {t.photo_url ? (
//                   <img
//                     src={`${API}/${t.photo_url.replace(/\\/g, '/')}`}
//                     alt={t.full_name}
//                     className="w-10 h-10 rounded-full object-cover border-2 border-blue-100"
//                   />
//                 ) : (
//                   <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
//                     {t.full_name.charAt(0).toUpperCase()}
//                   </div>
//                 )}
//                 <div>
//                   <p className="font-semibold text-gray-800 text-sm">{t.full_name}</p>
//                   <p className="text-xs text-blue-600 font-medium">{t.course_name}</p>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }
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

  // Auto play
  useEffect(() => {
    if (!isAutoPlaying || testimonials.length === 0) return;
    autoPlayRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => { if (autoPlayRef.current) clearInterval(autoPlayRef.current); };
  }, [isAutoPlaying, testimonials.length]);

  // Scroll carousel when activeIndex changes
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

        {/* Section Header */}
        <div className="text-center mb-12">
          <p className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-2">
            Success Stories
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            What Our Students Say
          </h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto text-sm">
            Real experiences from students who transformed their careers with us
          </p>
        </div>

        {/* Carousel Track */}
        <div className="relative">

          {/* Left Arrow */}
          <button
            onClick={goPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 w-10 h-10 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center hover:bg-blue-50 hover:border-blue-300 transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* Right Arrow */}
          <button
            onClick={goNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 w-10 h-10 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center hover:bg-blue-50 hover:border-blue-300 transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {/* Cards Track */}
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
                      ? "bg-blue-600 border-blue-600 shadow-xl shadow-blue-200 scale-105"
                      : "bg-white border-gray-100 shadow-sm hover:shadow-md scale-95 opacity-75"
                  }`}
                >
                  {/* Stars */}
                  <div className="flex gap-0.5 mb-4">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s} className="text-base">
                        {s <= t.rating ? "⭐" : "☆"}
                      </span>
                    ))}
                  </div>

                  {/* Quote */}
                  <p className={`text-sm leading-relaxed mb-6 italic line-clamp-4 ${
                    isActive ? "text-blue-100" : "text-gray-600"
                  }`}>
                    "{t.testimonial}"
                  </p>

                  {/* Student */}
                  <div className={`flex items-center gap-3 pt-4 border-t ${
                    isActive ? "border-blue-500" : "border-gray-100"
                  }`}>
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt={t.full_name}
                        className="w-11 h-11 rounded-full object-cover border-2 border-white shadow"
                      />
                    ) : (
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm border-2 border-white shadow ${
                        isActive ? "bg-white text-blue-600" : "bg-blue-600 text-white"
                      }`}>
                        {t.full_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className={`font-semibold text-sm ${isActive ? "text-white" : "text-gray-800"}`}>
                        {t.full_name}
                      </p>
                      <p className={`text-xs font-medium ${isActive ? "text-blue-200" : "text-blue-600"}`}>
                        {t.course_name}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dot Indicators */}
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

        {/* Counter */}
        <p className="text-center text-xs text-gray-400 mt-3">
          {activeIndex + 1} / {testimonials.length}
        </p>
      </div>
    </section>
  );
}
