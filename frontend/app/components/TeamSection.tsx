"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Mail, Linkedin, Phone } from "lucide-react";
const team = [
    {
    name: "V.P. Sivasankar",
    role: "Director",
    image: "/images/team/sivasankar.jpg",
    email: "sivasankar.vps@gmail.com",
    linkedin: "https://www.linkedin.com/in/sivasankar-v-p-593a7a44/",
    phone: "#",
    desc: "Mechanical Engr, 15 years of experience, Consultant & Trainer for QMS, EMS, Safety, NDT & Energy Management",
    tags: ["QMS", "Safety", "NDT"],  // ← add
  },
  {
    name: "T.R. Sriram",
    role: "Director",
    image: "/images/team/sriram.jpg",
    email: "trsriram@nskillindia.com",
    linkedin: "https://www.linkedin.com/in/trsriramsmme/",
    phone: "#",
    desc: "Electronics Engr, 32 years of experience, Consultant & Trainer for Strategic Management, LEAN, TPM, SCM, QMS, EMS, SMS",
    tags: ["Strategic Management", "LEAN", "TPM"],  // ← add
  },
  {
    name: "S. Karthikeyan",
    role: "Director",
    image: "/images/team/karthikeyan.jpg",
    email: "karthik@career-tree.in",
    linkedin: "https://www.linkedin.com/in/karthikeyan-s-93b2544/",
    phone: "#",
    desc: "Graduate in BusinessAdmn& PG in Social Work (PM&IR), 18 years of experience, HR Specialist & Certified Trainer in Competency Management and Balanced Score Card",
    tags: ["HR", "Competency Management"],  // ← add
  },
];

// const TeamSection = () => {
//     const ref = useRef(null);
//     const isInView = useInView(ref, { once: true, margin: "-100px" });

//     return (
//         <section className="py-24 bg-slate-50 relative overflow-hidden" ref={ref}>
//             {/* Background Micro-details */}
//             <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/30 rounded-full blur-[120px] -mr-48 -mt-48" />
//             <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100/30 rounded-full blur-[120px] -ml-48 -mb-48" />

//             <div className="container mx-auto px-6 relative z-10">
//                 <motion.div
//                     initial={{ opacity: 0, y: 40 }}
//                     animate={isInView ? { opacity: 1, y: 0 } : {}}
//                     transition={{ duration: 0.8 }}
//                     className="text-center mb-20"
//                 >
//                     <h2 className="text-3xl md:text-4xl font-black text-[#0b1f3a] mb-6 tracking-tight uppercase">Our Team</h2>
//                     <div className="w-24 h-1.5 bg-blue-600 mx-auto rounded-full mb-8" />
//                     <p className="text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
//                         NTSC has a competent team of people from various specialities like Lean, Safety, Electrical, HVAC, HR management, soft skills, and more.
//                     </p>
//                 </motion.div>

//                 <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
//                     {team.map((member, i) => (
//                         <motion.div
//                             key={member.name}
//                             initial={{ opacity: 0, y: 60 }}
//                             animate={isInView ? { opacity: 1, y: 0 } : {}}
//                             transition={{ duration: 0.8, delay: i * 0.2 }}
//                             className="group text-center flex flex-col items-center"
//                         >
//                             {/* Profile Image with Ring Effect */}
//                             <div className="relative mb-6 pt-4">
//                                 <div className="absolute inset-0 bg-blue-600/10 rounded-full scale-110 blur-md group-hover:scale-125 transition-transform duration-700" />
//                                 <div className="relative w-56 h-56 md:w-64 md:h-64 mx-auto rounded-full overflow-hidden border-8 border-white shadow-xl group-hover:shadow-2xl transition-all duration-500 bg-white">
//                                     <img
//                                         src={member.image}
//                                         alt={member.name}
//                                         className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700"
//                                     />
//                                 </div>
//                             </div>

//                             {/* Social Connect Icons (NOW MOVED ABOVE THE NAME) */}
//                             <div className="flex justify-center gap-4 mb-6">
//                                 <a
//                                     href={`mailto:${member.email}`}
//                                     className="w-11 h-11 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-[#0b1f3a] hover:text-white shadow-sm hover:shadow-lg hover:shadow-blue-900/20 transition-all duration-300 hover:-translate-y-1"
//                                     title="Send Email"
//                                 >
//                                     <Mail className="w-4.5 h-4.5" />
//                                 </a>
//                                 <a
//                                     href={member.linkedin}
//                                     target="_blank"
//                                     className="w-11 h-11 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-[#0b1f3a] hover:text-white shadow-sm hover:shadow-lg hover:shadow-blue-900/20 transition-all duration-300 hover:-translate-y-1"
//                                     title="LinkedIn"
//                                 >
//                                     <Linkedin className="w-4.5 h-4.5" />
//                                 </a>
//                                 <a
//                                     href={member.phone}
//                                     className="w-11 h-11 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-[#0b1f3a] hover:text-white shadow-sm hover:shadow-lg hover:shadow-blue-900/20 transition-all duration-300 hover:-translate-y-1"
//                                     title="Call"
//                                 >
//                                     <Phone className="w-4.5 h-4.5" />
//                                 </a>
//                             </div>

//                             {/* Identity */}
//                             <h3 className="text-2xl font-black text-[#0b1f3a] mb-1 tracking-tight">{member.name}</h3>
//                             <p className="text-blue-600 font-bold uppercase text-xs tracking-widest mb-4 group-hover:tracking-[0.2em] transition-all duration-500">{member.role}</p>

//                             <div className="h-px w-12 bg-slate-200 mb-4" />

//                             <p className="text-slate-500 text-sm leading-relaxed px-4 group-hover:text-slate-700 transition-colors">
//                                 {member.desc}
//                             </p>
//                         </motion.div>
//                     ))}
//                 </div>
//             </div>
//         </section>
//     );
// };

// export default TeamSection;
// "use client";

// import { useRef } from "react";
// import { motion, useInView } from "framer-motion";
// import { Mail, Linkedin, Phone } from "lucide-react";

// import { useRef } from "react";
// import { useInView } from "framer-motion";
// import { motion } from "framer-motion";
// import { Mail, Linkedin, Phone } from "lucide-react";

// const team = [
//   {
//     name: "Aisha Khan",
//     role: "Chief Executive Officer",
//     desc: "Visionary leader with 15+ years steering product strategy and cross-functional teams toward meaningful outcomes.",
//     tags: ["Strategy", "Leadership"],
//     email: "aisha@company.com",
//     linkedin: "#",
//     phone: "tel:+10000000000",
//     image: "https://i.pravatar.cc/150?img=47",
//   },
//   {
//     name: "Ravi Verma",
//     role: "Head of Engineering",
//     desc: "Full-stack architect who believes in clean code, fast systems, and delightful developer experiences.",
//     tags: ["React", "Node.js", "AWS"],
//     email: "ravi@company.com",
//     linkedin: "#",
//     phone: "tel:+10000000001",
//     image: "https://i.pravatar.cc/150?img=12",
//   },
//   {
//     name: "Sara Müller",
//     role: "Lead Designer",
//     desc: "Translates complex ideas into intuitive, beautiful interfaces. Obsessed with the 1px details others overlook.",
//     tags: ["UX", "Figma", "Motion"],
//     email: "sara@company.com",
//     linkedin: "#",
//     phone: "tel:+10000000002",
//     image: "https://i.pravatar.cc/150?img=32",
//   },
// ];

// import { useRef } from "react";
// import { useInView } from "framer-motion";
// import { motion } from "framer-motion";
// import { Mail, Linkedin, Phone } from "lucide-react";

// const team = [
//   {
//     name: "T.R. Sriram",
//     role: "Director",
//     image: "/images/team/sriram.jpg",
//     email: "",
//     linkedin: "https://linkedin.com",
//     phone: "#",
//     desc: "Electronics Engr, 32 years of experience, Consultant & Trainer for Strategic Management, LEAN, TPM, SCM, QMS, EMS, SMS",
//     tags: ["Strategic Management", "LEAN", "TPM"],
//   },
//   // Add more team members here following the same structure
// ];

const iconBtn =
  "w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400 " +
  "hover:bg-[#7c3aed] hover:text-white hover:border-[#7c3aed] hover:-translate-y-1 hover:shadow-md " +
  "transition-all duration-200";

const TeamSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className="pt-12 pb-28 bg-gradient-to-b from-blue-50 via-white to-blue-50 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 blur-[140px] rounded-full -mr-40 -mt-40 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-sky-400/10 blur-[140px] rounded-full -ml-40 -mb-40 pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-3 mb-5">
            <span className="w-8 h-px bg-slate-300" />
            <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-slate-400">
              Meet the people
            </span>
            <span className="w-8 h-px bg-slate-300" />
          </div>

          <h2
            className="text-4xl md:text-5xl font-black mb-5 leading-tight uppercase tracking-tighter"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            <span className="text-blue-600">Our</span> <span className="text-red-600">Team</span>
          </h2>

          <p className="text-slate-500 max-w-xl mx-auto text-base font-light leading-relaxed">
           NTSC has a competent team of people from various specialities like Lean, safety, Electrical (Domestic and Industry), HVAC, HR management, soft skills, etc. The team is headed by,
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-10 max-w-7xl mx-auto">
          {team.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 60 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: i * 0.15 }}
              className="group"
            >
              <div className="relative flex flex-col bg-white rounded-[40px] p-10 border border-blue-50 shadow-sm hover:-translate-y-4 hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-500 h-full overflow-hidden group/card">

                {/* Hover accent bar */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-red-600 to-blue-600 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 rounded-t-[40px]" />

                {/* Avatar */}
                <div className="flex justify-center mb-8">
                  <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-blue-600 shadow-lg group-hover/card:ring-red-600 group-hover/card:scale-110 transition-all duration-500">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to initials if image fails
                        const target = e.currentTarget;
                        target.style.display = "none";
                        const parent = target.parentElement!;
                        parent.classList.add(
                          "bg-blue-100", "flex", "items-center",
                          "justify-center", "text-blue-700",
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
                <h3
                  className="text-xl font-bold text-center text-[#0b1f3a] mb-1"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  {member.name}
                </h3>

                {/* Role */}
                <p className="text-center text-[11px] font-semibold uppercase tracking-widest text-violet-600 mb-3">
                  {member.role}
                </p>

                {/* Tags */}
                {member.tags && (
                  <div className="flex flex-wrap justify-center gap-1.5 mb-4">
                    {member.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Divider */}
                <div className="w-full h-px bg-slate-100 mb-4" />

                {/* Description */}
                <p className="text-sm text-slate-500 text-center leading-relaxed mb-6 flex-1 font-light line-clamp-4">
                  {member.desc}
                </p>

                {/* Action buttons */}
                <div className="flex justify-center gap-3 mt-auto">
                  {member.email && (
                    <a href={`mailto:${member.email}`} className={iconBtn} title="Email">
                      <Mail size={15} />
                    </a>
                  )}
                  {member.linkedin && member.linkedin !== "#" && (
                    <a href={member.linkedin} target="_blank" rel="noreferrer" className={iconBtn} title="LinkedIn">
                      <Linkedin size={15} />
                    </a>
                  )}
                  {member.phone && member.phone !== "#" && (
                    <a href={`tel:${member.phone}`} className={iconBtn} title="Phone">
                      <Phone size={15} />
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