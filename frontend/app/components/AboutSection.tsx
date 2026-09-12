"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { GraduationCap, Briefcase, BarChart3, ShieldCheck, ArrowRight } from "lucide-react";

const services = [
  {
    id: "skill-training",
    title: "Skill Training",
    image: "/images/about/skill_training.jpeg",
    icon: <GraduationCap className="w-5 h-5 text-white" />,
    bg: "from-indigo-500 to-[#0b1f3a]",
    gridColor: "#a5b4fc",
    href: "/courses",
    desc: "Skill development has been considered one of the critical aspects for job creation in India. India has unique demographic advantage with more than 60% of the population is in young age group. But to get dividend from such large work force, employability must be improved. As per current statistics only 10% of the fresh graduates are employable and rest of the 90% lack skills required for eligible to be hired by corporate. Here at NTSC, we provide the required skill training for you to achieve the required professional skillset for any domain.",
  },
  {
    id: "corporate-training",
    title: "Corporate Training",
    image: "/images/about/corporate.jpeg",
    icon: <Briefcase className="w-5 h-5 text-white" />,
    bg: "from-sky-500 to-[#0b1f3a]",
    gridColor: "#7dd3fc",
    href: "/corporate-training",
    desc: "Continuous employee training is essential. It enables your employees to advance their knowledge. Spending on your employees is very important to your company. You can improve on the basic skills gained in corporate training. This improves your business performance. When employees improve on what they learned, they can improve in their output. Your employees reflect on your business. How skilled they are is shown in your business output. Employees can bring more to the table if they know more. Invest in your employees' knowledge. In turn, they will do the same for their work. Moreover, you and your company will be the ones reaping the fruits." },
  {
    id: "consulting",
    title: "Consulting Services",
    image: "/images/about/consulting.jpeg",
    icon: <BarChart3 className="w-5 h-5 text-white" />,
    bg: "from-blue-700 to-[#0b1f3a]",
    gridColor: "#93c5fd",
    href: "/consulting",
    desc: "Consultants provide a significant amount of value for an organization. They can help to develop strategies for growth or manage projects. Since consultants are not committed to a single firm, they bring experience from a variety of companies and industries, which allows them to offer creative solutions and enables 'out of the box' thinking. They can provide an objective viewpoint, which allows for more diverse ideas than could be provided solely by employees within the organization. A consultant may have a higher level of business expertise than the average employee and can provide unique solutions for businesses. Companies may want to consider the advantages of the level of expertise that can be brought by a consultant, as well as how they could benefit from having an established strategic plan.", },
];

const AboutSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" className="py-24 bg-white overflow-hidden" ref={ref}>
      <div className="container mx-auto px-4 md:px-6 max-w-7xl space-y-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h2 className="mb-4 text-[#0b1f3a] font-black text-3xl sm:text-4xl">About Us</h2>
          <div className="w-16 h-1 bg-black mx-auto rounded-full" />
        </motion.div>

        {/* ── Card 1: NIILE Solutions — image LEFT, text RIGHT ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col md:flex-row items-stretch border border-slate-200 shadow-sm rounded-2xl bg-white overflow-hidden"
        >
          {/* Image panel */}
          <div
            className="relative w-full md:shrink-0 md:w-[480px]"
            style={{ minHeight: "260px" }}
          >
            {/* Desktop — clipped arrow shape */}
            <div
              className="absolute inset-0 hidden md:block"
              style={{
                clipPath: "polygon(0% 0%, 88% 0%, 100% 50%, 88% 100%, 0% 100%)",
              }}
            >
              <img
                src="/images/about/Nille_Solutions.jpeg"
                alt="NIILE Solutions"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-[#0b1f3a]/20" />
            </div>
            {/* Mobile — no clip */}
            <div className="absolute inset-0 md:hidden">
              <img
                src="/images/about/Nille_Solutions.jpeg"
                alt="NIILE Solutions"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-[#0b1f3a]/20" />
            </div>
          </div>

          {/* Text */}
          <div className="flex flex-col justify-center px-6 md:px-12 py-10 gap-5 flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-[#0b1f3a] rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100 w-fit">
              <ShieldCheck className="w-3 h-3 text-[#0b1f3a]" /> Established 2012
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-[#0a2d5c] rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100 w-fit">
              <ShieldCheck className="w-3 h-3 text-[#0a2d5c]" /> Established 2012
            </div>
            <div>
              <h3 className="mb-2 text-2xl font-bold text-[#0b1f3a]">NIILE Solution</h3>
              <h3 className="mb-2 text-2xl font-black text-[#0a2d5c]">NIILE Solution</h3>
              <div className="w-12 h-1 bg-black rounded-full" />
            </div>
            <p className="text-slate-600 leading-relaxed text-justify">
              NIILE Solution is established in 2012 in Kundrathur, Chennai to offer{" "}
              <strong className="text-[#0b1f3a] font-bold">Technical Skill Training, Placement, and Industrial Consulting</strong>{" "}
              <strong className="text-[#0a2d5c] font-black">Technical Skill Training, Placement, and Industrial Consulting</strong>{" "}
              services. NIILE serves world-renowned organizations from Hydrocarbon, Power, Steel, Cement and Heavy Infrastructure industries involved in Construction, Commissioning, Operation and Maintenance activities.
            </p>
            <p className="text-slate-500 leading-relaxed text-justify">
              As a strategic expansion aligning with the Skill India Mission, NIILE Solutions started{" "}
              <strong className="text-[#0b1f3a] font-bold">NIILE TECHNICAL SKILL AND CONSULTING PVT. LTD (NTSC)</strong>{" "}
              <strong className="text-[#0a2d5c] font-black">NIILE TECHNICAL SKILL AND CONSULTING PVT. LTD (NTSC)</strong>{" "}
              near Kundrathur, Chennai during 2018 — to train unemployed youth, school and college finishers and dropouts in various skill-based trades for domestic and overseas employment.
            </p>
          </div>
        </motion.div>

        {/* ── Card 2: NTSC Training — text LEFT, image RIGHT ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="flex flex-col md:flex-row items-stretch border border-slate-200 shadow-sm rounded-2xl bg-white overflow-hidden"
        >
          {/* Text — second on mobile, first on desktop */}
          <div className="flex flex-col justify-center px-6 md:px-12 py-10 gap-5 flex-1 order-2 md:order-1">
            <div>
              <h3 className="mb-2 text-2xl font-bold text-[#0b1f3a]">NTSC Training</h3>
              <h3 className="mb-2 text-2xl font-black text-[#0a2d5c]">NTSC Training</h3>
              <div className="w-12 h-1 bg-black rounded-full" />
            </div>
            <p className="text-slate-600 leading-relaxed text-justify">
              NTSC training focuses on various skills like{" "}
              <strong className="text-[#0b1f3a] font-bold">MEP, HVAC, A/C, Welding, Fabrication, Machine Operation, Electrical Wiring, Installation, Marine Mechanic, Home Appliance</strong>,
              <strong className="text-[#0a2d5c] font-black">MEP, HVAC, A/C, Welding, Fabrication, Machine Operation, Electrical Wiring, Installation, Marine Mechanic, Home Appliance</strong>,
              and Civil construction skills such as Carpentry, Masonry, Plumbing, Bar-Bending, and a host of other trades. NTSC also offers customized courses for corporates on Behavioural, Leadership and Technical skills.
            </p>
            <p className="text-slate-500 leading-relaxed text-justify">
              NTSC's facility complies with NSDC requirements and is accredited by various State and Central Government bodies like{" "}
              <strong className="text-[#0b1f3a] font-bold">NSDC, KVIC, BSS, MSME, NIESBUD, OGSC, TNDS, CTDS</strong>{" "}
              <strong className="text-[#0a2d5c] font-black">NSDC, KVIC, BSS, MSME, NIESBUD, OGSC, TNDS, CTDS</strong>{" "}
              etc. The certifications help students avail opportunities for job and entrepreneurship.
            </p>
          </div>

          {/* Image panel — first on mobile, second on desktop */}
          <div
            className="relative w-full md:shrink-0 md:w-[480px] order-1 md:order-2"
            style={{ minHeight: "260px" }}
          >
            {/* Desktop — clipped arrow shape (reversed) */}
            <div
              className="absolute inset-0 hidden md:block"
              style={{
                clipPath: "polygon(12% 0%, 100% 0%, 100% 100%, 12% 100%, 0% 50%)",
              }}
            >
              <img
               src="/images/about/NTSC.JPG"
                alt="NTSC Training"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-blue-900/20" />
            </div>
            {/* Mobile — no clip */}
            <div className="absolute inset-0 md:hidden">
              <img
                src="/images/about/NTSC.JPG"
                alt="NTSC Training"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-blue-900/20" />
            </div>
          </div>
        </motion.div>

        {/* ── Services Card Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <motion.div
              key={s.id}
              id={s.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="group service-card flex flex-col bg-white rounded-2xl overflow-hidden relative shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200"
            >
              <Link href={s.href} className="flex flex-col flex-1">
                {/* Top Image Banner */}
                <div
                  className={`relative h-48 bg-gradient-to-br ${s.bg} flex items-center justify-center overflow-hidden z-10`}
                >
                  {s.image && (
                    <img
                      src={s.image}
                      alt={s.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  <div className="absolute inset-0 bg-blue-950/20 group-hover:bg-transparent transition-colors" />
                </div>

                {/* Body with Cropped/Clamped Text */}
                <div className="flex flex-col flex-1 p-6 gap-2.5 relative z-10">
                  <h3 className="tracking-tight text-xl font-bold text-[#0b1f3a] group-hover:text-blue-600 transition-colors">
                    {s.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed text-justify line-clamp-4">
                    {s.desc}
                  </p>
                </div>
              </Link>

              {/* Footer with Read More button/link */}
              <div className="border-t border-slate-100 px-6 py-4 flex justify-end items-center relative z-10 mt-auto bg-slate-50/50">
                <Link
                  href={s.href}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#f97316] uppercase tracking-wider hover:text-[#ea580c] transition-colors group-hover:translate-x-0.5 transform duration-200"
                >
                  <span>Read More</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default AboutSection;
