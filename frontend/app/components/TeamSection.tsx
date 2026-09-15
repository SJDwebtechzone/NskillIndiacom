"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Mail, Linkedin, Phone } from "lucide-react";

const team = [
  {
    name: "V.P. Sivasankar",
    role: "Director",
    image: "/images/team/sivasankar.jpeg",
    email: "sivasankar.vps@gmail.com",
    linkedin: "https://www.linkedin.com/in/sivasankar-v-p-593a7a44/",
    phone: "#",
    desc: "BE.Mech and M.Tech in Industrial Safety with >18 years of experience. Consultant, Auditor & Trainer for QMS, SMS, Welding, NDT & Energy Management.",
    tags: ["QMS", "Safety", "NDT"],
  },
  {
    name: "T.R. Sriram",
    role: "Director",
    image: "/images/team/sriram.jpg",
    email: "trsriram@nskillindia.com",
    linkedin: "https://www.linkedin.com/in/trsriramsmme/",
    phone: "#",
    desc: "Electrical & Electronics Engineer with 35 >years of experience. Consultant, Auditor & Trainer for Strategic Management, LEAN 5S, TPM, SCM, QMS, EMS, SMS & IATF Standards.",
    tags: ["Strategic Management", "LEAN", "TPM"],
  },
  {
    name: "S. Karthikeyan",
    role: "Director",
    image: "/images/team/karthikeyan.jpg",
    email: "karthik@career-tree.in",
    linkedin: "https://www.linkedin.com/in/karthikeyan-s-93b2544/",
    phone: "#",
    desc: "Grad in Bus Admin & Masters in Social Work (PM & IR) with >21 years of experience. HR Specialist & Certified Trainer in Competency Management and Balanced Score Card.",
    tags: ["HR", "Competency Management"],
  },
];

const iconBtn =
  "w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-[#0a2d5c] " +
  "hover:bg-[#0a2d5c] hover:text-[#f97316] hover:border-[#0a2d5c] hover:-translate-y-1 hover:shadow-md " +
  "transition-all duration-200";

const TeamSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className="py-20 bg-gradient-to-b from-slate-50 via-white to-blue-50/30 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 blur-[140px] rounded-full -mr-40 -mt-40 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-400/10 blur-[140px] rounded-full -ml-40 -mb-40 pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0b1f3a] tracking-tight uppercase mb-3">
            OUR TEAM
          </h2>
          <div className="w-16 h-1 bg-[#0b1f3a] mx-auto rounded-full mb-5" />

          <p className="text-slate-800 max-w-3xl mx-auto text-base md:text-lg font-medium leading-relaxed">
            NTSC has a competent team of people from various specialities like Lean, safety, Electrical (Domestic and Industry), HVAC, HR management, soft skills, etc. The team is headed by,
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {team.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: i * 0.15 }}
              className="group h-full"
            >
              <div className="relative flex flex-col bg-white rounded-3xl p-8 border border-slate-200 shadow-md hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#0a2d5c]/10 transition-all duration-300 h-full overflow-hidden group/card">

                {/* Hover accent bar */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0a2d5c] via-[#f97316] to-[#0a2d5c] opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />

                {/* Avatar */}
                <div className="flex justify-center mb-6 pt-2">
                  <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-[#0a2d5c]/20 shadow-md group-hover/card:ring-[#f97316] group-hover/card:scale-105 transition-all duration-300">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover object-top"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.style.display = "none";
                        const parent = target.parentElement!;
                        parent.classList.add(
                          "bg-blue-50", "flex", "items-center",
                          "justify-center", "text-[#0a2d5c]",
                          "text-2xl", "font-bold"
                        );
                        parent.innerText = member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2);
                      }}
                    />
                  </div>
                </div>

                {/* Name */}
                <h3 className="text-xl md:text-2xl font-bold text-center text-[#0a2d5c] mb-1 group-hover/card:text-[#f97316] transition-colors">
                  {member.name}
                </h3>

                {/* Role */}
                <p className="text-center text-xs font-bold uppercase tracking-widest text-[#f97316] mb-3">
                  {member.role}
                </p>

                {/* Tags */}
                {member.tags && (
                  <div className="flex flex-wrap justify-center gap-1.5 mb-4">
                    {member.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs font-semibold px-3 py-0.5 rounded-full bg-orange-50 text-[#ea580c] border border-orange-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Divider */}
                <div className="w-full h-px bg-slate-200 mb-4" />

                {/* Description */}
                <p className="text-slate-700 text-sm md:text-[15px] text-center leading-relaxed mb-6 flex-1 font-normal">
                  {member.desc}
                </p>

                {/* Action buttons */}
                <div className="flex justify-center gap-3 mt-auto pt-2">
                  {member.email && (
                    <a href={`mailto:${member.email}`} className={iconBtn} title="Email">
                      <Mail size={16} />
                    </a>
                  )}
                  {member.linkedin && member.linkedin !== "#" && (
                    <a href={member.linkedin} target="_blank" rel="noreferrer" className={iconBtn} title="LinkedIn">
                      <Linkedin size={16} />
                    </a>
                  )}
                  {member.phone && member.phone !== "#" && (
                    <a href={`tel:${member.phone}`} className={iconBtn} title="Phone">
                      <Phone size={16} />
                    </a>
                  )}
                </div>

              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default TeamSection;