"use client";

import { useState, useEffect, useRef } from "react";
import { Camera, Clapperboard, Folder, Search, Play, Pause, Flame, Zap, Snowflake, Wrench, Refrigerator, ShieldCheck, Hand, Factory, LockKeyhole, UserRound, RefreshCw, CalendarDays, ChevronDown, Building2, GraduationCap, UsersRound, Award } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MediaItem {
  id: number;
  file_type: "photo" | "video";
  file_url: string;
  file_name: string;
}

const facilities = [
  {
    title: "Welding Workshop",
    image: "/infrastructure/welding.png",
    icon: Flame,
    points: ["ARC, MIG, TIG Welding", "6G Pipe Welding", "Welding Inspection", "Fabrication & Cutting"],
  },
  {
    title: "Electrical Workshop",
    image: "/infrastructure/electric.png",
    icon: Zap,
    points: ["Industrial Electrical", "Panel Wiring", "Motor Control", "Troubleshooting"],
  },
  {
    title: "HVAC & Refrigeration Lab",
    image: "/infrastructure/HAVC.png",
    icon: Snowflake,
    points: ["AC Training Units", "Refrigeration System", "Compressor Lab", "Troubleshooting"],
  },
  {
    title: "Plumbing & MEP Lab",
    image: "/infrastructure/pluming.png",
    icon: Wrench,
    points: ["Pipe Fitting & Installation", "Pumps & Valves", "Sanitary Systems", "MEP Practical"],
  },
  {
    title: "Home Appliance Lab",
    image: "/infrastructure/homeaplication.png",
    icon: Refrigerator,
    points: ["Washing Machine", "Refrigerator", "Microwave & Others", "Fault Diagnosis"],
  },
  {
    title: "Quality & Inspection Lab",
    image: "/infrastructure/Quality.png",
    icon: ShieldCheck,
    points: ["Measuring Instruments", "Welding Inspection", "Quality Control", "Blueprint Reading"],
  },
];

const equipment = [
  { title: "MIG Welding Machine", image: "/infrastructure/Mechines/mig.png" },
  { title: "TIG Welding Machine", image: "/infrastructure/Mechines/tig.png" },
  { title: "PLC Training Kit", image: "/infrastructure/Mechines/plc.png" },
  { title: "VFD Drive Trainer", image: "/infrastructure/Mechines/vfd.png" },
  { title: "Air Conditioning Trainer", image: "/infrastructure/Mechines/air.png" },
  { title: "Compressor Unit", image: "/infrastructure/Mechines/compresser.png" },
  { title: "Electrical Control Panel", image: "/infrastructure/Mechines/electric.png" },
];

const infrastructureHighlights = [
  { title: "100% Practical Training", description: "More workshop hours for hands-on experience", icon: Hand },
  { title: "Industry Standard Labs", description: "Real-world equipment for effective learning", icon: Factory },
  { title: "Safe & Secure Environment", description: "Safety protocols followed in every training session", icon: LockKeyhole },
  { title: "Expert Trainers", description: "Learn from experienced professionals with industry exposure", icon: UserRound },
  { title: "Continuous Upgradation", description: "Infrastructure and equipment upgraded as per industry requirements", icon: RefreshCw },
];

const studentVoices = [
  { name: "Karthik R.", course: "6G Welding - Placed at Larsen & Toubro", quote: "Excellent infrastructure and practical training facilities. Helped me gain confidence and a job." },
  { name: "Suresh M.", course: "Industrial Electrician - Placed at Daikin", quote: "The electrical lab is very good. We got hands-on practice in all electrical equipment." },
  { name: "Imran A.", course: "HVAC Technician - Placed at Blue Star", quote: "Best HVAC lab with all modern equipment. Trainers are very supportive." },
];

const bannerStats = [
  { value: "10+", label: "Training Facilities", icon: Building2 },
  { value: "100+", label: "Practical Equipment", icon: Wrench },
  { value: "5000+", label: "Students Trained", icon: GraduationCap },
  { value: "100+", label: "Industry Partners", icon: UsersRound },
  { value: "85%+", label: "Placement Assistance", icon: Award },
];

export default function InfrastructurePage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [filter, setFilter] = useState<"all" | "photo" | "video">("all");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [galleryExpanded, setGalleryExpanded] = useState(false);
  const [isTourPlaying, setIsTourPlaying] = useState(false);
  const tourVideoRef = useRef<HTMLVideoElement>(null);
  const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

  useEffect(() => { fetchMedia(); }, []);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const toggleTourVideo = async () => {
    const video = tourVideoRef.current;
    if (!video) return;

    if (video.paused) {
      try {
        await video.play();
      } catch {
        setIsTourPlaying(false);
      }
    } else {
      video.pause();
    }
  };

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
  const previewItems = (photos.length > 0 ? photos : media).slice(0, 8);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── HERO BANNER ── */}
      <section className="relative min-h-[315px] overflow-hidden bg-[#061f4d]">
        <img
          src="/infrastructure/infrastructurebanner.png"
          alt="N-Skill practical technical training workshop"
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#061f4d]/95 via-[#061f4d]/75 to-[#061f4d]/10" />
        <div className="relative z-10 mx-auto flex min-h-[315px] max-w-[1420px] items-center px-6 py-10 md:px-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-[650px] text-white"
          >
            <h1 className="text-[40px] font-black leading-[1.12] tracking-tight md:text-[46px]">
              <span className="text-white">World-Class<br />Infrastructure for</span><br />
              <span className="text-orange-500">Practical Technical Training</span>
            </h1>
            <p className="mt-4 max-w-[540px] text-sm font-medium leading-relaxed text-white/90 md:text-base">
              Experience hands-on learning in modern workshops, advanced laboratories and well-equipped training facilities designed to build job-ready skills.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a href="#facilities" className="whitespace-nowrap rounded-md bg-orange-500 px-5 py-3 text-xs font-black uppercase text-white transition hover:bg-orange-600">
                Explore Our Facilities
              </a>
              <a href="#campus-visit" className="inline-flex whitespace-nowrap items-center gap-2 rounded-md border border-white/80 px-5 py-3 text-xs font-black uppercase text-white transition hover:bg-white hover:text-[#061f4d]">
                <CalendarDays size={16} /> Book a Campus Visit
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── BANNER STATS OVERLAY ── */}
      <section className="relative z-20 -mt-5 px-4 md:px-6">
        <div className="mx-auto grid max-w-[1280px] grid-cols-2 overflow-hidden rounded-lg border border-slate-200 bg-white py-4 shadow-[0_5px_18px_rgba(15,23,42,0.14)] md:grid-cols-5 md:py-5">
          {bannerStats.map(({ value, label, icon: Icon }, index) => (
            <div key={label} className={`flex items-center justify-center gap-3 px-4 py-2 text-left ${index > 0 ? "md:border-l md:border-slate-200" : ""} ${index > 1 ? "border-t border-slate-200 md:border-t-0" : ""}`}>
              <Icon className="h-9 w-9 shrink-0 text-[#0b356b]" strokeWidth={1.7} />
              <div>
                <p className="text-xl font-black leading-none text-[#0b356b] md:text-2xl">{value}</p>
                <p className="mt-1 text-[10px] font-semibold leading-tight text-slate-600 md:text-[11px]">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURED FACILITIES ── */}
      <section id="facilities" className="bg-white py-8 md:py-10 border-b border-slate-100">
        <div className="max-w-[1280px] mx-auto px-4 md:px-6">
          <div className="text-center mb-6">
            <h2 className="text-xl md:text-2xl font-black text-[#0b1f3a] uppercase tracking-tight">
              Our Training Facilities
            </h2>
            <div className="w-9 h-1 bg-[#f59e0b] mx-auto mt-2 mb-2" />
            <p className="text-sm text-slate-600 font-medium">Dedicated labs and workshops for every skill</p>
          </div>

          <div className="flex gap-5 overflow-x-auto pb-3 snap-x snap-mandatory md:grid md:grid-cols-3 lg:grid-cols-6 md:overflow-visible md:pb-0">
            {facilities.map(({ title, image, icon: Icon, points }) => (
              <article
                key={title}
                className="min-w-[285px] md:min-w-0 snap-start bg-white border border-slate-200 rounded-lg overflow-hidden shadow-[0_2px_8px_rgba(15,23,42,0.08)] hover:-translate-y-1 hover:shadow-lg transition-transform duration-200"
              >
                <div className="relative h-[170px] overflow-visible bg-slate-100">
                  <img src={image} alt={title} className="w-full h-full object-cover" loading="eager" />
                  <div className="absolute left-3 -bottom-6 w-14 h-14 rounded-md bg-[#0759a6] border-2 border-white shadow-md flex items-center justify-center text-white">
                    <Icon size={27} strokeWidth={2.2} />
                  </div>
                </div>
                <div className="px-4 pt-8 pb-4">
                  <h3 className="text-[15px] font-black text-[#0b356b] leading-tight min-h-[36px]">{title}</h3>
                  <ul className="mt-3 space-y-1.5 text-[12px] leading-tight text-slate-600 min-h-[78px]">
                    {points.map((point) => <li key={point}>• {point}</li>)}
                  </ul>
                  <button
                    type="button"
                    onClick={() => setFilter("photo")}
                    className="mt-4 border border-[#31579b] text-[#163d78] px-4 py-2 text-[11px] font-black uppercase tracking-wide rounded-sm hover:bg-[#163d78] hover:text-white transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── INDUSTRY EQUIPMENT ── */}
      <section className="bg-white py-8 md:py-10 border-b border-slate-100">
        <div className="max-w-[1420px] mx-auto px-4 md:px-6">
          <div className="text-center mb-6">
            <h2 className="text-xl md:text-2xl font-black text-[#0b1f3a] uppercase tracking-tight">
              Industry-Relevant Equipment
            </h2>
            <div className="w-9 h-1 bg-[#f59e0b] mx-auto mt-2 mb-2" />
            <p className="text-sm text-slate-600 font-medium">Train with the latest tools and machines used in industries</p>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory md:grid md:grid-cols-4 lg:grid-cols-7 md:overflow-visible md:pb-0">
            {equipment.map(({ title, image }) => (
              <article
                key={title}
                className="min-w-[190px] md:min-w-0 snap-start overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.08)] hover:-translate-y-1 hover:shadow-lg transition-transform duration-200"
              >
                <div className="h-[150px] bg-slate-100 overflow-hidden">
                  <img src={image} alt={title} className="w-full h-full object-contain" loading="eager" />
                </div>
                <h3 className="min-h-[42px] flex items-center justify-center px-2 py-2 text-center text-[12px] font-black leading-tight text-[#0b356b]">
                  {title}
                </h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY OUR INFRASTRUCTURE ── */}
      <section className="bg-white py-8 md:py-10 border-b border-slate-200">
        <div className="max-w-[1700px] mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-6">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,0.06)]">
            <h2 className="px-1 pt-1 text-lg md:text-xl font-black uppercase text-[#0b1f3a]">
              Why N-Skill Infrastructure Is Unique?
            </h2>
            <div className="mt-3 grid grid-cols-2 md:grid-cols-5 divide-x divide-slate-200 rounded-md border border-slate-200 overflow-hidden">
              {infrastructureHighlights.map(({ title, description, icon: Icon }) => (
                <div key={title} className="px-3 py-5 text-center border-b border-slate-200 last:border-b-0 md:border-b-0">
                  <Icon className="mx-auto h-9 w-9 text-[#0785c1]" strokeWidth={1.8} />
                  <h3 className="mt-3 min-h-[40px] text-[13px] font-black leading-tight text-[#0b1f3a]">{title}</h3>
                  <p className="mt-3 text-[11px] leading-relaxed text-slate-600">{description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,0.06)]">
            <h2 className="text-xl md:text-2xl font-black uppercase text-[#0b1f3a]">Virtual Tour of N-Skill</h2>
            <div className="relative mt-3 overflow-hidden rounded-md bg-[#061f4d]">
              <video
                ref={tourVideoRef}
                className="block aspect-video w-full object-cover"
                src="/infrastructure/virtual.mp4"
                controls
                preload="metadata"
                playsInline
                onPlay={() => setIsTourPlaying(true)}
                onPause={() => setIsTourPlaying(false)}
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-center bg-[#06265c] px-4 py-3 text-center text-sm font-black uppercase text-white">
                Watch Campus Tour Video
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  type="button"
                  aria-label={isTourPlaying ? "Pause campus tour video" : "Play campus tour video"}
                  onClick={toggleTourVideo}
                  className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-white bg-slate-900/65 text-white shadow-xl transition hover:scale-105 hover:bg-[#0b356b]"
                >
                  {isTourPlaying ? <Pause size={27} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STUDENT VOICES AND CAMPUS VISIT ── */}
      <section className="bg-white py-8 md:py-10 border-b border-slate-200">
        <div className="max-w-[1420px] mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_1fr] gap-6">
            <div>
              <h2 className="mb-4 text-xl md:text-2xl font-black uppercase text-[#0b1f3a]">What Our Students Say</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {studentVoices.map((student) => (
                  <article key={student.name} className="rounded-lg border border-slate-200 bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,0.06)]">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-12 w-12 shrink-0 rounded-full bg-slate-200 flex items-center justify-center text-lg font-black text-[#0b356b]">
                        {student.name.charAt(0)}
                      </div>
                      <div className="flex text-orange-500 text-lg leading-none" aria-label="5 star rating">★★★★★</div>
                    </div>
                    <p className="min-h-[96px] text-[12px] leading-relaxed text-slate-700">&quot;{student.quote}&quot;</p>
                    <div className="mt-4 border-t border-slate-200 pt-3">
                      <h3 className="text-sm font-black text-[#0b1f3a]">{student.name}</h3>
                      <p className="mt-1 text-[10px] leading-relaxed text-slate-500">{student.course}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <form
              id="campus-visit"
              className="rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-[0_2px_8px_rgba(15,23,42,0.06)]"
              onSubmit={(event) => {
                event.preventDefault();
                event.currentTarget.reset();
                window.alert("Your campus visit request has been submitted.");
              }}
            >
              <h2 className="text-xl md:text-2xl font-black uppercase text-[#0b1f3a]">Book a Campus Visit</h2>
              <p className="mt-1 mb-4 text-sm text-slate-600">Visit our training center and explore our facilities in person.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input required name="name" placeholder="Name*" className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#2563eb]" />
                <input required name="mobile" placeholder="Mobile Number*" inputMode="tel" className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#2563eb]" />
                <input required type="email" name="email" placeholder="Email*" className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#2563eb]" />
                <label className="relative">
                  <select required name="course" defaultValue="" className="h-11 w-full appearance-none rounded-md border border-slate-200 bg-white px-3 pr-9 text-sm text-slate-500 outline-none focus:border-[#2563eb]">
                    <option value="" disabled>Course Interested In*</option>
                    <option>HVAC Technician</option>
                    <option>Electrical Technician</option>
                    <option>Welding</option>
                    <option>Plumbing & MEP</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-3 h-5 w-5 text-slate-500" />
                </label>
                <label className="relative">
                  <input required type="date" name="date" className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-500 outline-none focus:border-[#2563eb]" />
                  <CalendarDays className="pointer-events-none absolute right-3 top-3 h-5 w-5 text-[#0b356b]" />
                </label>
                <label className="relative">
                  <select required name="visitors" defaultValue="" className="h-11 w-full appearance-none rounded-md border border-slate-200 bg-white px-3 pr-9 text-sm text-slate-500 outline-none focus:border-[#2563eb]">
                    <option value="" disabled>Number of Visitors</option>
                    <option>1 Visitor</option>
                    <option>2 Visitors</option>
                    <option>3+ Visitors</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-3 h-5 w-5 text-slate-500" />
                </label>
              </div>
              <button type="submit" className="mt-4 h-11 w-full rounded-md bg-orange-500 text-sm font-black uppercase text-white transition hover:bg-orange-600">Submit Request</button>
            </form>
          </div>
          <div className="mt-5 text-center">
            <a href="/#testimonials" className="inline-flex items-center rounded-sm border border-[#31579b] px-6 py-2 text-xs font-black uppercase tracking-wide text-[#163d78] transition hover:bg-[#163d78] hover:text-white">View All Testimonials</a>
          </div>
        </div>
      </section>

      {/* ── PHOTO GALLERY PREVIEW ── */}
      <section className="bg-white py-8 md:py-10 border-b border-slate-200">
        <div className="max-w-[1700px] mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <h2 className="text-2xl md:text-3xl font-black uppercase text-[#0b1f3a]">Photo Gallery</h2>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "All", value: "all" as const },
                { label: "Photos", value: "photo" as const },
                { label: "Videos", value: "video" as const },
              ].map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => { setFilter(tab.value); setGalleryExpanded(true); }}
                  className={`px-6 py-2.5 rounded-md text-sm font-bold transition-colors ${filter === tab.value && galleryExpanded ? "bg-[#0b356b] text-white" : "bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-[#0b356b]"}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          {previewItems.length > 0 && (
            <div className="flex gap-5 overflow-x-auto pb-2 snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {previewItems.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setSelected(item)}
                  className="flex-none h-[175px] overflow-hidden rounded-md border border-slate-200 bg-slate-100 hover:border-[#2563eb] transition-colors snap-start"
                >
                  {item.file_type === "photo" ? (
                    <img src={item.file_url} alt={item.file_name} className="h-full w-auto max-w-none object-contain p-1" />
                  ) : (
                    <video src={item.file_url} muted className="h-full w-auto max-w-none object-contain p-1" />
                  )}
                </button>
              ))}
            </div>
          )}
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => setGalleryExpanded((expanded) => !expanded)}
              className="border border-[#31579b] text-[#163d78] px-8 py-3 text-sm font-black uppercase tracking-wide rounded-sm hover:bg-[#163d78] hover:text-white transition-colors"
            >
              {galleryExpanded ? "Hide Gallery" : "View All Photos"}
            </button>
          </div>
        </div>
      </section>

      {galleryExpanded && (
        <>
          {/* ── FILTER TABS ── */}
          <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
              <p className="text-[11px] text-slate-500 font-black uppercase tracking-[0.16em] hidden sm:block">
                {filter === "all" ? `${media.length} items` : filter === "photo" ? `${photos.length} photos` : `${videos.length} videos`}
              </p>
              <div className="flex gap-2 mx-auto sm:mx-0" role="tablist" aria-label="Media filters">
                {(["all", "photo", "video"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilter(tab)}
                    className={`flex items-center gap-2 px-5 py-2 rounded-md text-[11px] font-black uppercase tracking-[0.12em] transition-all duration-300 ${
                      filter === tab
                        ? "bg-[#2563eb] text-white shadow-lg shadow-blue-500/30 scale-105"
                        : "bg-white text-slate-500 hover:bg-blue-50 hover:text-[#2563eb] border border-slate-200"
                    }`}
                  >
                    {tab === "all" && "All Media"}
                    {tab === "photo" && <><Camera className="w-4 h-4" /> Photos</>}
                    {tab === "video" && <><Clapperboard className="w-4 h-4" /> Videos</>}
                  </button>
                ))}
              </div>
            </div>
          </div>

      {/* ── CONTENT ── */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
        className="max-w-7xl mx-auto px-4 md:px-6 py-12 pb-24 space-y-16"
      >

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
                    <Camera className="w-10 h-10 mb-3 text-slate-400 mx-auto" />
                    <p className="font-semibold text-slate-500">No photos uploaded yet</p>
                  </div>
                ) : (
                  <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    <AnimatePresence>
                      {photos.map((item) => (
                        <motion.div
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.2 }}
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
                              <div className="w-12 h-12 rounded-full bg-white/0 group-hover:bg-white/90 flex items-center justify-center transition-all duration-300 scale-75 group-hover:scale-100">
                                <Search className="text-[#2563eb] w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" strokeWidth={3} />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
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
                    <Clapperboard className="w-10 h-10 mb-3 text-slate-400 mx-auto" />
                    <p className="font-semibold text-slate-500">No videos uploaded yet</p>
                  </div>
                ) : (
                  <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    <AnimatePresence>
                      {videos.map((item) => (
                        <motion.div
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.2 }}
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
                              <div className="w-14 h-14 rounded-full bg-white/90 border-2 border-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-[#2563eb] group-hover:border-[#2563eb] transition-all duration-300">
                                <Play className="text-[#2563eb] group-hover:text-white w-5 h-5 ml-1 transition-colors duration-300" fill="currentColor" />
                              </div>
                            </div>
                            <div className="absolute top-3 left-3 bg-[#2563eb]/90 backdrop-blur-sm text-white text-[10px] tracking-widest font-black px-3 py-1 rounded-full uppercase">
                              Video
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                )}
              </section>
            )}

            {media.length === 0 && (
              <div className="text-center py-28">
                <Folder className="w-16 h-16 mb-4 text-slate-300 mx-auto" />
                <p className="text-xl font-bold text-[#0b1f3a]">No media uploaded yet</p>
                <p className="text-slate-400 mt-2 text-sm">Upload photos and videos from the admin panel</p>
              </div>
            )}
          </>
        )}
      </motion.div>
        </>
      )}

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
