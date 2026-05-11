"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function ProfileEditPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const YEARS = Array.from({length: 31}, (_, i) => (2026 - i).toString());

  const [formData, setFormData] = useState({
    full_name: "",
    gender: "",
    dob: "",
    location: "",
    country: "India",
    hometown: "",
    mobile: "",
    education: {
      degree: {
        course: "B.Tech / B.E.",
        specialization: "",
        college: "",
        grading: "% Marks of 100 Maximum",
        from_year: "",
        to_year: "",
        type: "Full Time"
      },
      class12: {
        board: "",
        medium: "",
        percentage: "",
        passing_year: ""
      },
      class10: {
        board: "",
        medium: "",
        percentage: "",
        passing_year: ""
      }
    },
    skills: [],
    languages: [],
    internships: [{
      company: "", from_month: "", from_year: "", to_month: "", to_year: "", project: "", description: "", skills: "", url: ""
    }],
    projects: [{
      name: "", from_month: "", from_year: "", to_month: "", to_year: "", description: "", skills: "", url: ""
    }],
    summary: "",
    certifications: [{
      name: "", id: "", url: "", from_month: "", from_year: "", to_month: "", to_year: "", expires: true
    }],
    exams: [{
      name: "", score: ""
    }],
    employment: {
      total_years: "0", total_months: "0", company: "", designation: "", from_month: "", from_year: "", to_month: "", to_year: "", current: false, description: ""
    },
    academic_achievements: []
  });

  const [expandedSection, setExpandedSection] = useState<string | null>("Education");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setFormData(prev => ({
          ...prev,
          full_name: parsed.full_name || "",
          mobile: parsed.phone_number || "",
          location: parsed.location || "",
          hometown: parsed.hometown || "",
          gender: parsed.gender || "",
          dob: parsed.date_of_birth || ""
        }));
      } catch (e) {
        console.error("Error parsing stored user:", e);
      }
    }

    const token = localStorage.getItem("token");
    if (token) {
      fetch(`${API}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          if (res.status === 404) {
             localStorage.removeItem("token");
             localStorage.removeItem("user");
             router.push("/placements/login");
             return null;
          }
          return res.json();
        })
        .then(data => {
          if (data && data.user) {
            setUser(data.user);
            setFormData(prev => ({
              ...prev,
              full_name: data.user.full_name || prev.full_name,
              gender: data.user.gender || prev.gender,
              dob: data.user.date_of_birth || prev.dob,
              location: data.user.location || prev.location,
              country: data.user.country || prev.country,
              hometown: data.user.hometown || prev.hometown,
              mobile: data.user.phone_number || prev.mobile,
              profile_summary: data.user.profile_summary || prev.profile_summary,
              photo_url: data.user.photo_url || prev.photo_url
            }));
            // Sync to localStorage
            localStorage.setItem("user", JSON.stringify(data.user));
          }
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [API, router]);

  const navLinks = [
    "Preferences", "Education", "Key skills", "Languages", 
    "Internships", "Projects", "Profile summary", "Accomplishments", 
    "Employment", "Resume"
  ];

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first");
      return;
    }

    try {
      const res = await fetch(`${API}/api/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok) {
        alert("Profile updated successfully!");
        router.refresh();
      } else {
        alert(data.message || "Error updating profile");
      }
    } catch (err) {
      console.error(err);
      alert("Server error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-4 md:p-8 font-[Segoe_UI,sans-serif]">
      <div className="max-w-[1200px] mx-auto flex flex-col gap-6 lg:gap-8">
        
        {/* ── TOP: Back Button & Header Profile Card ── */}
        <div className="flex flex-col gap-4">
          <button
            className="flex items-center gap-2 text-[#7c829c] hover:text-[#2f55e4] text-[15px] font-bold bg-transparent border-none cursor-pointer p-0 transition-colors w-max"
            onClick={() => router.push("/placements/profile")}
          >
            ← Back to jobs
          </button>

          <div className="bg-white border border-[#eff1f6] rounded-[32px] p-6 md:p-10 shadow-[0_4px_20px_rgba(47,85,228,0.04)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-[#d9e2f8] to-[#f6f7fb]"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start mt-10">
              <div className="relative w-32 h-32 shrink-0 group cursor-pointer">
                <div className="w-full h-full rounded-full border-4 border-white shadow-sm flex items-center justify-center bg-[#e8f0fb] overflow-hidden">
                  {user?.photo_url ? (
                    <img src={`${API}/${user.photo_url}`} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl font-black text-[#2f55e4]">
                      {formData.full_name ? formData.full_name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() : "RS"}
                    </span>
                  )}
                </div>
                <div className="absolute inset-0 border-4 border-transparent rounded-full flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200">
                  <span className="text-white text-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 drop-shadow-md">📷</span>
                </div>
              </div>

              <div className="flex-1 w-full">
                <h2 className="text-[24px] font-bold text-[#111827] mb-6">All about you</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[14px] font-bold text-[#4b5563]">Full name</label>
                    <input 
                      type="text"
                      className="h-12 px-4 border border-[#eff1f6] rounded-xl text-[15px] font-semibold text-[#111827] bg-[#f6f7fb] outline-none focus:bg-white focus:border-[#2f55e4] focus:ring-2 focus:ring-[#e8f0fb] transition-all"
                      placeholder="What’s your good name?"
                      value={formData.full_name}
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    />
                  </div>

                  {/* Gender */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[14px] font-bold text-[#4b5563]">Gender</label>
                    <div className="flex gap-4">
                      {["Male", "Female", "Transgender"].map((g) => (
                        <label key={g} className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="radio" 
                            name="gender" 
                            value={g} 
                            checked={formData.gender === g}
                            onChange={(e) => setFormData({...formData, gender: e.target.value})}
                            className="w-4 h-4 text-[#2f55e4] focus:ring-[#2f55e4]" 
                          />
                          <span className="text-[15px] font-medium text-[#111827]">{g}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* DOB */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[14px] font-bold text-[#4b5563]">Date of birth (DD/MM/YYYY)</label>
                    <input 
                      type="text"
                      className="h-12 px-4 border border-[#eff1f6] rounded-xl text-[15px] font-semibold text-[#111827] bg-[#f6f7fb] outline-none focus:bg-white focus:border-[#2f55e4] focus:ring-2 focus:ring-[#e8f0fb] transition-all"
                      placeholder="DD/MM/YYYY"
                      value={formData.dob}
                      onChange={(e) => setFormData({...formData, dob: e.target.value})}
                    />
                  </div>

                  {/* Current Location */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[14px] font-bold text-[#4b5563]">Current location</label>
                    <div className="flex items-center gap-2 mb-1">
                      <input type="checkbox" id="residing-india" checked={formData.country === "India"} onChange={() => {}} className="w-4 h-4" />
                      <label htmlFor="residing-india" className="text-[13px] font-medium text-[#7c829c]">Currently residing in India</label>
                    </div>
                    <input 
                      type="text"
                      className="h-12 px-4 border border-[#eff1f6] rounded-xl text-[15px] font-semibold text-[#111827] bg-[#f6f7fb] outline-none focus:bg-white focus:border-[#2f55e4] focus:ring-2 focus:ring-[#e8f0fb] transition-all"
                      placeholder="Enter your current location"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                    />
                  </div>

                  {/* Country */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[14px] font-bold text-[#4b5563]">Country</label>
                    <select 
                      className="h-12 px-4 border border-[#eff1f6] rounded-xl text-[15px] font-semibold text-[#111827] bg-[#f6f7fb] outline-none focus:bg-white focus:border-[#2f55e4] focus:ring-2 focus:ring-[#e8f0fb] transition-all appearance-none"
                      value={formData.country}
                      onChange={(e) => setFormData({...formData, country: e.target.value})}
                    >
                      <option value="India">India</option>
                      <option value="USA">USA</option>
                      <option value="UK">UK</option>
                    </select>
                  </div>

                  {/* Hometown */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[14px] font-bold text-[#4b5563]">Hometown</label>
                    <input 
                      type="text"
                      className="h-12 px-4 border border-[#eff1f6] rounded-xl text-[15px] font-semibold text-[#111827] bg-[#f6f7fb] outline-none focus:bg-white focus:border-[#2f55e4] focus:ring-2 focus:ring-[#e8f0fb] transition-all"
                      placeholder="Enter your current hometown"
                      value={formData.hometown}
                      onChange={(e) => setFormData({...formData, hometown: e.target.value})}
                    />
                  </div>

                  {/* Mobile Number */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[14px] font-bold text-[#4b5563]">Mobile number</label>
                    <div className="flex gap-2">
                      <div className="h-12 px-4 border border-[#eff1f6] rounded-xl text-[15px] font-semibold text-[#111827] bg-[#f6f7fb] flex items-center">+91</div>
                      <input 
                        type="text"
                        className="h-12 px-4 border border-[#eff1f6] rounded-xl text-[15px] font-semibold text-[#111827] bg-[#f6f7fb] outline-none focus:bg-white focus:border-[#2f55e4] focus:ring-2 focus:ring-[#e8f0fb] transition-all flex-1"
                        placeholder="Mobile number"
                        value={formData.mobile}
                        onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button 
                    onClick={handleSave}
                    className="bg-[#2f55e4] hover:bg-[#2242c2] text-white font-bold px-10 py-3 rounded-full transition-all shadow-md"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── BOTTOM: 2-Column Layout ── */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          
          {/* LEFT SIDEBAR - Quick Links */}
          <div className="hidden lg:block w-[280px] shrink-0">
            <div className="bg-white border border-[#eff1f6] rounded-3xl p-6 sticky top-8 shadow-[0_4px_20px_rgba(47,85,228,0.04)]">
              <h3 className="text-[18px] font-bold text-[#111827] mb-4">Quick links</h3>
              <ul className="flex flex-col gap-1.5">
                {navLinks.map((link) => (
                  <li key={link}>
                    <a 
                      href={`#${link.toLowerCase().replace(/ /g, '-')}`}
                      className="block px-4 py-2.5 rounded-xl text-[14px] font-semibold text-[#7c829c] hover:bg-[#f6f7fb] hover:text-[#2f55e4] transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* RIGHT CONTENT - Sections */}
          <div className="flex-1 flex flex-col gap-6 min-w-0">
            
          {/* 2. Preferences */}
          <SectionCard id="preferences" title="Your career preferences">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PreferenceItem label="Preferred job type" value="" />
              <PreferenceItem label="Availability to work" value="" />
              <PreferenceItem label="Preferred location" value="" />
            </div>
          </SectionCard>

          {/* 3. Education */}
          <SectionCard id="education" title="Education">
            <p className="text-[14px] font-medium text-[#7c829c] mb-6">Adding your educational details help recruiters know your value as a potential candidate</p>
            
            <div className="flex flex-col gap-4">
              
              {/* Higher Education */}
              <div className="border border-[#eff1f6] rounded-2xl overflow-hidden bg-white shadow-sm">
                <button 
                  onClick={() => setExpandedSection(expandedSection === "Higher Education" ? null : "Higher Education")}
                  className="w-full px-6 py-4 flex items-center justify-between bg-[#f6f7fb] hover:bg-[#eff1f6] transition-all border-none cursor-pointer"
                >
                  <h4 className="text-[17px] font-bold text-[#111827]">Higher Education</h4>
                  <span className={`text-[#2f55e4] transition-transform duration-300 ${expandedSection === "Higher Education" ? "rotate-180" : ""}`}>▼</span>
                </button>
                
                {expandedSection === "Higher Education" && (
                  <div className="p-6 flex flex-col gap-8 animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-[14px] font-bold text-[#4b5563]">Course name</label>
                        <input type="text" className="h-12 px-4 border border-[#eff1f6] rounded-xl text-[15px] font-semibold text-[#111827] bg-[#f6f7fb] outline-none focus:bg-white focus:border-[#2f55e4] transition-all" value={formData.education.degree.course} onChange={(e) => setFormData({...formData, education: {...formData.education, degree: {...formData.education.degree, course: e.target.value}}})} />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[14px] font-bold text-[#4b5563]">Specialization</label>
                        <input type="text" className="h-12 px-4 border border-[#eff1f6] rounded-xl text-[15px] font-semibold text-[#111827] bg-[#f6f7fb] outline-none focus:bg-white focus:border-[#2f55e4] transition-all" value={formData.education.degree.specialization} onChange={(e) => setFormData({...formData, education: {...formData.education, degree: {...formData.education.degree, specialization: e.target.value}}})} />
                      </div>
                      <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="text-[14px] font-bold text-[#4b5563]">College name</label>
                        <input type="text" className="h-12 px-4 border border-[#eff1f6] rounded-xl text-[15px] font-semibold text-[#111827] bg-[#f6f7fb] outline-none focus:bg-white focus:border-[#2f55e4] transition-all" value={formData.education.degree.college} onChange={(e) => setFormData({...formData, education: {...formData.education, degree: {...formData.education.degree, college: e.target.value}}})} />
                      </div>
                      <div className="flex flex-col gap-3 md:col-span-2">
                        <label className="text-[14px] font-bold text-[#4b5563]">Grading system</label>
                        <div className="flex flex-wrap gap-x-6 gap-y-3">
                          {["Scale 10 Grading System", "Scale 4 Grading System", "% Marks of 100 Maximum", "Course Requires a Pass"].map((g) => (
                            <label key={g} className="flex items-center gap-2 cursor-pointer">
                              <input type="radio" name="grading" checked={formData.education.degree.grading === g} onChange={() => setFormData({...formData, education: {...formData.education, degree: {...formData.education.degree, grading: g}}})} className="w-4 h-4 text-[#2f55e4]" />
                              <span className="text-[15px] font-medium text-[#111827]">{g}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col gap-3">
                        <label className="text-[14px] font-bold text-[#4b5563]">Course duration</label>
                        <div className="flex items-center gap-4">
                          <div className="relative flex-1">
                            <input type="text" className="w-full h-12 px-4 border border-[#eff1f6] rounded-xl bg-[#f6f7fb] outline-none focus:bg-white focus:border-[#2f55e4] transition-all" placeholder="From (YYYY)" value={formData.education.degree.from_year} onChange={(e) => setFormData({...formData, education: {...formData.education, degree: {...formData.education.degree, from_year: e.target.value}}})} />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#7c829c]">START</div>
                          </div>
                          <div className="relative flex-1">
                            <input type="text" className="w-full h-12 px-4 border border-[#eff1f6] rounded-xl bg-[#f6f7fb] outline-none focus:bg-white focus:border-[#2f55e4] transition-all" placeholder="To (YYYY)" value={formData.education.degree.to_year} onChange={(e) => setFormData({...formData, education: {...formData.education, degree: {...formData.education.degree, to_year: e.target.value}}})} />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#7c829c]">END</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-3">
                        <label className="text-[14px] font-bold text-[#4b5563]">Course type</label>
                        <div className="grid grid-cols-3 gap-2">
                          {["Full Time", "Part Time", "Correspondence"].map((t) => (
                            <button key={t} type="button" onClick={() => setFormData({...formData, education: {...formData.education, degree: {...formData.education.degree, type: t}}})} className={`h-10 rounded-lg text-[12px] font-bold transition-all border ${formData.education.degree.type === t ? "bg-[#2f55e4] border-[#2f55e4] text-white" : "bg-white border-[#eff1f6] text-[#4b5563]"}`}>{t}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <button onClick={handleSave} className="self-end bg-[#2f55e4] hover:bg-[#2242c2] text-white font-bold px-8 py-2.5 rounded-full transition-all text-[14px]">Save</button>
                  </div>
                )}
              </div>

              {/* Class XII */}
              <div className="border border-[#eff1f6] rounded-2xl overflow-hidden bg-white shadow-sm">
                <button 
                  onClick={() => setExpandedSection(expandedSection === "Class XII" ? null : "Class XII")}
                  className="w-full px-6 py-4 flex items-center justify-between bg-[#f6f7fb] hover:bg-[#eff1f6] transition-all border-none cursor-pointer"
                >
                  <h4 className="text-[17px] font-bold text-[#111827]">Class XII</h4>
                  <span className={`text-[#2f55e4] transition-transform duration-300 ${expandedSection === "Class XII" ? "rotate-180" : ""}`}>▼</span>
                </button>
                {expandedSection === "Class XII" && (
                  <div className="p-6 flex flex-col gap-8 animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-[14px] font-bold text-[#4b5563]">Examination board</label>
                        <select className="h-12 px-4 border border-[#eff1f6] rounded-xl bg-[#f6f7fb] outline-none" value={formData.education.class12.board} onChange={(e) => setFormData({...formData, education: {...formData.education, class12: {...formData.education.class12, board: e.target.value}}})}><option value="">Select Board Name</option><option value="CBSE">CBSE</option><option value="State Board">State Board</option></select>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[14px] font-bold text-[#4b5563]">Medium of study</label>
                        <select className="h-12 px-4 border border-[#eff1f6] rounded-xl bg-[#f6f7fb] outline-none" value={formData.education.class12.medium} onChange={(e) => setFormData({...formData, education: {...formData.education, class12: {...formData.education.class12, medium: e.target.value}}})}><option value="">Select Medium</option><option value="English">English</option><option value="Hindi">Hindi</option></select>
                      </div>
                      <div className="flex flex-col gap-2"><label className="text-[14px] font-bold text-[#4b5563]">Percentage</label><input type="text" className="h-12 px-4 border border-[#eff1f6] rounded-xl bg-[#f6f7fb] outline-none" placeholder="e.g. 95" value={formData.education.class12.percentage} onChange={(e) => setFormData({...formData, education: {...formData.education, class12: {...formData.education.class12, percentage: e.target.value}}})} /></div>
                      <div className="flex flex-col gap-2"><label className="text-[14px] font-bold text-[#4b5563]">Passing year</label><input type="text" className="h-12 px-4 border border-[#eff1f6] rounded-xl bg-[#f6f7fb] outline-none" placeholder="YYYY" value={formData.education.class12.passing_year} onChange={(e) => setFormData({...formData, education: {...formData.education, class12: {...formData.education.class12, passing_year: e.target.value}}})} /></div>
                    </div>
                    <button onClick={handleSave} className="self-end bg-[#2f55e4] hover:bg-[#2242c2] text-white font-bold px-8 py-2.5 rounded-full transition-all text-[14px]">Save</button>
                  </div>
                )}
              </div>

              {/* Class X */}
              <div className="border border-[#eff1f6] rounded-2xl overflow-hidden bg-white shadow-sm">
                <button 
                  onClick={() => setExpandedSection(expandedSection === "Class X" ? null : "Class X")}
                  className="w-full px-6 py-4 flex items-center justify-between bg-[#f6f7fb] hover:bg-[#eff1f6] transition-all border-none cursor-pointer"
                >
                  <h4 className="text-[17px] font-bold text-[#111827]">Class X</h4>
                  <span className={`text-[#2f55e4] transition-transform duration-300 ${expandedSection === "Class X" ? "rotate-180" : ""}`}>▼</span>
                </button>
                {expandedSection === "Class X" && (
                  <div className="p-6 flex flex-col gap-8 animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-[14px] font-bold text-[#4b5563]">Examination board</label>
                        <select className="h-12 px-4 border border-[#eff1f6] rounded-xl bg-[#f6f7fb] outline-none" value={formData.education.class10.board} onChange={(e) => setFormData({...formData, education: {...formData.education, class10: {...formData.education.class10, board: e.target.value}}})}><option value="">Select Board Name</option><option value="CBSE">CBSE</option><option value="State Board">State Board</option></select>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[14px] font-bold text-[#4b5563]">Medium of study</label>
                        <select className="h-12 px-4 border border-[#eff1f6] rounded-xl bg-[#f6f7fb] outline-none" value={formData.education.class10.medium} onChange={(e) => setFormData({...formData, education: {...formData.education, class10: {...formData.education.class10, medium: e.target.value}}})}><option value="">Select Medium</option><option value="English">English</option><option value="Hindi">Hindi</option></select>
                      </div>
                      <div className="flex flex-col gap-2"><label className="text-[14px] font-bold text-[#4b5563]">Percentage</label><input type="text" className="h-12 px-4 border border-[#eff1f6] rounded-xl bg-[#f6f7fb] outline-none" placeholder="e.g. 95" value={formData.education.class10.percentage} onChange={(e) => setFormData({...formData, education: {...formData.education, class10: {...formData.education.class10, percentage: e.target.value}}})} /></div>
                      <div className="flex flex-col gap-2"><label className="text-[14px] font-bold text-[#4b5563]">Passing year</label><input type="text" className="h-12 px-4 border border-[#eff1f6] rounded-xl bg-[#f6f7fb] outline-none" placeholder="YYYY" value={formData.education.class10.passing_year} onChange={(e) => setFormData({...formData, education: {...formData.education, class10: {...formData.education.class10, passing_year: e.target.value}}})} /></div>
                    </div>
                    <button onClick={handleSave} className="self-end bg-[#2f55e4] hover:bg-[#2242c2] text-white font-bold px-8 py-2.5 rounded-full transition-all text-[14px]">Save</button>
                  </div>
                )}
              </div>
            </div>
          </SectionCard>

          {/* 4. Key Skills */}
          <SectionCard id="key-skills" title="Key skills">
            <button onClick={() => setExpandedSection(expandedSection === "skills" ? null : "skills")} className="w-full flex items-center justify-between mb-4 border-none bg-transparent cursor-pointer text-left group">
              <p className="text-[14px] text-[#7c829c] group-hover:text-[#111827] transition-colors">Recruiters look for candidates with specific keyskills. Add them here to appear in searches.</p>
              <span className={`text-[#2f55e4] transition-transform duration-300 ${expandedSection === "skills" ? "rotate-180" : ""}`}>▼</span>
            </button>
            {expandedSection === "skills" && (
              <div className="flex flex-col gap-4 animate-fadeIn">
                <input type="text" className="h-12 px-4 border border-[#eff1f6] rounded-xl bg-[#f6f7fb] outline-none focus:bg-white focus:border-[#2f55e4] transition-all" placeholder="Enter your key skills" />
                <button onClick={handleSave} className="self-end bg-[#2f55e4] text-white font-bold px-8 py-2 rounded-full text-[14px] hover:bg-[#2242c2] transition-colors">Save</button>
              </div>
            )}
          </SectionCard>

          {/* 5. Languages */}
          <SectionCard id="languages" title="Languages known">
            <button onClick={() => setExpandedSection(expandedSection === "languages" ? null : "languages")} className="w-full flex items-center justify-between mb-4 border-none bg-transparent cursor-pointer text-left group">
              <p className="text-[14px] text-[#7c829c] group-hover:text-[#111827] transition-colors">Strengthen your resume by letting recruiters know you can communicate in multiple languages</p>
              <span className={`text-[#2f55e4] transition-transform duration-300 ${expandedSection === "languages" ? "rotate-180" : ""}`}>▼</span>
            </button>
            {expandedSection === "languages" && (
              <div className="flex flex-col gap-6 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2"><label className="text-[14px] font-bold text-[#4b5563]">Language</label><select className="h-12 px-4 border border-[#eff1f6] rounded-xl bg-[#f6f7fb] outline-none"><option>Select Language</option><option>English</option><option>Hindi</option></select></div>
                </div>
                <button onClick={handleSave} className="self-end bg-[#2f55e4] text-white font-bold px-8 py-2 rounded-full text-[14px] hover:bg-[#2242c2] transition-colors">Save</button>
              </div>
            )}
          </SectionCard>

          {/* 6. Internships */}
          <SectionCard id="internships" title="Internships">
            <button onClick={() => setExpandedSection(expandedSection === "internships" ? null : "internships")} className="w-full flex items-center justify-between mb-4 border-none bg-transparent cursor-pointer text-left group">
              <p className="text-[14px] text-[#7c829c] group-hover:text-[#111827] transition-colors">Show your professional learnings</p>
              <span className={`text-[#2f55e4] transition-transform duration-300 ${expandedSection === "internships" ? "rotate-180" : ""}`}>▼</span>
            </button>
            {expandedSection === "internships" && (
              <div className="flex flex-col gap-8 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2 md:col-span-2"><label className="text-[14px] font-bold text-[#4b5563]">Company name</label><input type="text" className="h-12 px-4 border border-[#eff1f6] rounded-xl bg-[#f6f7fb] outline-none" placeholder="Enter the name of the company" /></div>
                  <div className="flex flex-col gap-2 md:col-span-2"><label className="text-[14px] font-bold text-[#4b5563]">Internship duration</label>
                    <div className="grid grid-cols-2 md:grid-cols-5 items-center gap-2">
                      <select className="h-12 px-4 border border-[#eff1f6] rounded-xl bg-[#f6f7fb] outline-none"><option>Month</option>{MONTHS.map(m => <option key={m}>{m}</option>)}</select>
                      <select className="h-12 px-4 border border-[#eff1f6] rounded-xl bg-[#f6f7fb] outline-none"><option>Year</option>{YEARS.map(y => <option key={y}>{y}</option>)}</select>
                      <span className="text-center font-bold text-[#7c829c]">to</span>
                      <select className="h-12 px-4 border border-[#eff1f6] rounded-xl bg-[#f6f7fb] outline-none"><option>Month</option>{MONTHS.map(m => <option key={m}>{m}</option>)}</select>
                      <select className="h-12 px-4 border border-[#eff1f6] rounded-xl bg-[#f6f7fb] outline-none"><option>Year</option>{YEARS.map(y => <option key={y}>{y}</option>)}</select>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 md:col-span-2"><label className="text-[14px] font-bold text-[#4b5563]">Project name</label><input type="text" className="h-12 px-4 border border-[#eff1f6] rounded-xl bg-[#f6f7fb] outline-none" placeholder="Enter the name of the project" /></div>
                  <div className="flex flex-col gap-2 md:col-span-2"><label className="text-[14px] font-bold text-[#4b5563]">Describe what you did at internship</label><textarea className="p-4 border border-[#eff1f6] rounded-xl bg-[#f6f7fb] outline-none min-h-[120px]" placeholder="Enter responsibilities..."></textarea><div className="text-right text-[12px] text-[#7c829c]">0/1000</div></div>
                  <div className="flex flex-col gap-2 md:col-span-2"><label className="text-[14px] font-bold text-[#4b5563]">Key skills (optional)</label><input type="text" className="h-12 px-4 border border-[#eff1f6] rounded-xl bg-[#f6f7fb] outline-none" placeholder="Enter skills used" /></div>
                  <div className="flex flex-col gap-2 md:col-span-2"><label className="text-[14px] font-bold text-[#4b5563]">Project URL (optional)</label><input type="text" className="h-12 px-4 border border-[#eff1f6] rounded-xl bg-[#f6f7fb] outline-none" placeholder="Enter project link" /></div>
                </div>
                <button onClick={handleSave} className="self-end bg-[#2f55e4] text-white font-bold px-8 py-2 rounded-full text-[14px] hover:bg-[#2242c2] transition-colors">Save</button>
              </div>
            )}
          </SectionCard>

          {/* 7. Projects */}
          <SectionCard id="projects" title="Projects">
            <button onClick={() => setExpandedSection(expandedSection === "projects" ? null : "projects")} className="w-full flex items-center justify-between mb-4 border-none bg-transparent cursor-pointer text-left group">
              <p className="text-[14px] text-[#7c829c] group-hover:text-[#111827] transition-colors">Showcase your talent with the best projects you have worked on during college and work</p>
              <span className={`text-[#2f55e4] transition-transform duration-300 ${expandedSection === "projects" ? "rotate-180" : ""}`}>▼</span>
            </button>
            {expandedSection === "projects" && (
              <div className="flex flex-col gap-8 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2 md:col-span-2"><label className="text-[14px] font-bold text-[#4b5563]">Project name</label><input type="text" className="h-12 px-4 border border-[#eff1f6] rounded-xl bg-[#f6f7fb] outline-none" placeholder="Enter the name of the project" /></div>
                  <div className="flex flex-col gap-2 md:col-span-2"><label className="text-[14px] font-bold text-[#4b5563]">Project duration</label>
                    <div className="grid grid-cols-2 md:grid-cols-5 items-center gap-2">
                      <select className="h-12 px-4 border border-[#eff1f6] rounded-xl bg-[#f6f7fb] outline-none"><option>Month</option>{MONTHS.map(m => <option key={m}>{m}</option>)}</select>
                      <select className="h-12 px-4 border border-[#eff1f6] rounded-xl bg-[#f6f7fb] outline-none"><option>Year</option>{YEARS.map(y => <option key={y}>{y}</option>)}</select>
                      <span className="text-center font-bold text-[#7c829c]">to</span>
                      <select className="h-12 px-4 border border-[#eff1f6] rounded-xl bg-[#f6f7fb] outline-none"><option>Month</option>{MONTHS.map(m => <option key={m}>{m}</option>)}</select>
                      <select className="h-12 px-4 border border-[#eff1f6] rounded-xl bg-[#f6f7fb] outline-none"><option>Year</option>{YEARS.map(y => <option key={y}>{y}</option>)}</select>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 md:col-span-2"><label className="text-[14px] font-bold text-[#4b5563]">Describe what the project was about</label><textarea className="p-4 border border-[#eff1f6] rounded-xl bg-[#f6f7fb] outline-none min-h-[120px]" placeholder="Enter project description..."></textarea><div className="text-right text-[12px] text-[#7c829c]">0/1000</div></div>
                  <div className="flex flex-col gap-2 md:col-span-2"><label className="text-[14px] font-bold text-[#4b5563]">Key skills used in the project (optional)</label><input type="text" className="h-12 px-4 border border-[#eff1f6] rounded-xl bg-[#f6f7fb] outline-none" placeholder="Enter keyskills" /></div>
                  <div className="flex flex-col gap-2 md:col-span-2"><label className="text-[14px] font-bold text-[#4b5563]">Project URL (optional)</label><input type="text" className="h-12 px-4 border border-[#eff1f6] rounded-xl bg-[#f6f7fb] outline-none" placeholder="Enter project link" /></div>
                </div>
                <button onClick={handleSave} className="self-end bg-[#2f55e4] text-white font-bold px-8 py-2 rounded-full text-[14px] hover:bg-[#2242c2] transition-colors">Save</button>
              </div>
            )}
          </SectionCard>

          {/* 8. Profile Summary */}
          <SectionCard id="profile-summary" title="Profile summary">
            <button onClick={() => setExpandedSection(expandedSection === "summary" ? null : "summary")} className="w-full flex items-center justify-between mb-4 border-none bg-transparent cursor-pointer text-left group">
              <p className="text-[14px] text-[#7c829c] group-hover:text-[#111827] transition-colors">Highlights of your career and education, interests, and what kind of career you are looking for.</p>
              <span className={`text-[#2f55e4] transition-transform duration-300 ${expandedSection === "summary" ? "rotate-180" : ""}`}>▼</span>
            </button>
            {expandedSection === "summary" && (
              <div className="flex flex-col gap-4 animate-fadeIn">
                <textarea className="p-4 border border-[#eff1f6] rounded-xl bg-[#f6f7fb] outline-none min-h-[150px]" placeholder="Type here..."></textarea>
                <div className="flex items-center justify-between text-[12px] text-[#7c829c]"><span>Min 50 characters</span><span>0/1000</span></div>
                <button onClick={handleSave} className="self-end bg-[#2f55e4] text-white font-bold px-8 py-2 rounded-full text-[14px] hover:bg-[#2242c2] transition-colors">Save</button>
              </div>
            )}
          </SectionCard>

          {/* 9. Accomplishments */}
          <SectionCard id="accomplishments" title="Accomplishments">
            <button onClick={() => setExpandedSection(expandedSection === "accomplishments" ? null : "accomplishments")} className="w-full flex items-center justify-between border-none bg-transparent cursor-pointer text-left group">
              <div className="flex flex-col"><h5 className="text-[16px] font-bold text-[#111827]">Certification</h5><p className="text-[14px] text-[#7c829c]">Add details of your certification. You can add up to 10.</p></div>
              <span className={`text-[#2f55e4] transition-transform duration-300 ${expandedSection === "accomplishments" ? "rotate-180" : ""}`}>▼</span>
            </button>
            {expandedSection === "accomplishments" && (
              <div className="flex flex-col gap-8 mt-6 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2 md:col-span-2"><label className="text-[14px] font-bold text-[#4b5563]">Certification name</label><input type="text" className="h-12 px-4 border border-[#eff1f6] rounded-xl bg-[#f6f7fb] outline-none" placeholder="Enter certification name" /></div>
                  <div className="flex flex-col gap-2"><label className="text-[14px] font-bold text-[#4b5563]">Certification completion ID</label><input type="text" className="h-12 px-4 border border-[#eff1f6] rounded-xl bg-[#f6f7fb] outline-none" placeholder="Enter completion ID" /></div>
                  <div className="flex flex-col gap-2"><label className="text-[14px] font-bold text-[#4b5563]">Certification URL</label><input type="text" className="h-12 px-4 border border-[#eff1f6] rounded-xl bg-[#f6f7fb] outline-none" placeholder="Enter URL" /></div>
                  <div className="flex flex-col gap-2 md:col-span-2"><label className="text-[14px] font-bold text-[#4b5563]">Certification validity</label>
                    <div className="grid grid-cols-2 md:grid-cols-5 items-center gap-2">
                      <select className="h-12 px-4 border border-[#eff1f6] rounded-xl bg-[#f6f7fb] outline-none"><option>Month</option>{MONTHS.map(m => <option key={m}>{m}</option>)}</select>
                      <select className="h-12 px-4 border border-[#eff1f6] rounded-xl bg-[#f6f7fb] outline-none"><option>Year</option>{YEARS.map(y => <option key={y}>{y}</option>)}</select>
                      <span className="text-center font-bold text-[#7c829c]">to</span>
                      <select className="h-12 px-4 border border-[#eff1f6] rounded-xl bg-[#f6f7fb] outline-none"><option>Month</option>{MONTHS.map(m => <option key={m}>{m}</option>)}</select>
                      <select className="h-12 px-4 border border-[#eff1f6] rounded-xl bg-[#f6f7fb] outline-none"><option>Year</option>{YEARS.map(y => <option key={y}>{y}</option>)}</select>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer md:col-span-2"><input type="checkbox" className="w-4 h-4 text-[#2f55e4]" /><span className="text-[14px] font-medium text-[#4b5563]">This certification does not expire</span></label>
                </div>
                <button onClick={handleSave} className="self-end bg-[#2f55e4] text-white font-bold px-8 py-2 rounded-full text-[14px] hover:bg-[#2242c2] transition-colors">Save</button>
              </div>
            )}
          </SectionCard>

          {/* 10. Employment Details */}
          <SectionCard id="employment" title="Employment details">
            <button onClick={() => setExpandedSection(expandedSection === "employment" ? null : "employment")} className="w-full flex items-center justify-between border-none bg-transparent cursor-pointer text-left group">
              <p className="text-[14px] text-[#7c829c] group-hover:text-[#111827] transition-colors">Adding roles & companies you have worked with help employers understand your background.</p>
              <span className={`text-[#2f55e4] transition-transform duration-300 ${expandedSection === "employment" ? "rotate-180" : ""}`}>▼</span>
            </button>
            {expandedSection === "employment" && (
              <div className="flex flex-col gap-8 mt-6 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2 md:col-span-2"><label className="text-[14px] font-bold text-[#4b5563]">Total work experience</label><div className="flex gap-4"><select className="h-12 px-4 border border-[#eff1f6] rounded-xl bg-[#f6f7fb] flex-1 outline-none"><option>Years</option></select><select className="h-12 px-4 border border-[#eff1f6] rounded-xl bg-[#f6f7fb] flex-1 outline-none"><option>Months</option></select></div></div>
                  <div className="flex flex-col gap-2 md:col-span-2"><label className="text-[14px] font-bold text-[#4b5563]">Company name</label><input type="text" className="h-12 px-4 border border-[#eff1f6] rounded-xl bg-[#f6f7fb] outline-none" placeholder="Enter the name of the company" /></div>
                  <div className="flex flex-col gap-2 md:col-span-2"><label className="text-[14px] font-bold text-[#4b5563]">Designation</label><input type="text" className="h-12 px-4 border border-[#eff1f6] rounded-xl bg-[#f6f7fb] outline-none" placeholder="Enter designation" /></div>
                  <div className="flex flex-col gap-2 md:col-span-2"><label className="text-[14px] font-bold text-[#4b5563]">Working since</label>
                    <div className="grid grid-cols-2 md:grid-cols-5 items-center gap-2">
                      <select className="h-12 px-4 border border-[#eff1f6] rounded-xl bg-[#f6f7fb] outline-none"><option>Month</option>{MONTHS.map(m => <option key={m}>{m}</option>)}</select>
                      <select className="h-12 px-4 border border-[#eff1f6] rounded-xl bg-[#f6f7fb] outline-none"><option>Year</option>{YEARS.map(y => <option key={y}>{y}</option>)}</select>
                      <span className="text-center font-bold text-[#7c829c]">to</span>
                      <select className="h-12 px-4 border border-[#eff1f6] rounded-xl bg-[#f6f7fb] outline-none"><option>Month</option>{MONTHS.map(m => <option key={m}>{m}</option>)}</select>
                      <select className="h-12 px-4 border border-[#eff1f6] rounded-xl bg-[#f6f7fb] outline-none"><option>Year</option>{YEARS.map(y => <option key={y}>{y}</option>)}</select>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer md:col-span-2"><input type="checkbox" className="w-4 h-4 text-[#2f55e4]" /><span className="text-[14px] font-medium text-[#4b5563]">I currently work here</span></label>
                  <div className="flex flex-col gap-2 md:col-span-2"><label className="text-[14px] font-bold text-[#4b5563]">Describe what you did at work</label><textarea className="p-4 border border-[#eff1f6] rounded-xl bg-[#f6f7fb] outline-none min-h-[120px]" placeholder="Enter responsibilities..."></textarea><div className="text-right text-[12px] text-[#7c829c]">0/4000</div></div>
                </div>
                <button onClick={handleSave} className="self-end bg-[#2f55e4] text-white font-bold px-8 py-2 rounded-full text-[14px] hover:bg-[#2242c2] transition-colors">Save</button>
              </div>
            )}
          </SectionCard>

          {/* 11. Competitive Exams */}
          <SectionCard id="exams" title="Competitive exams">
            <button onClick={() => setExpandedSection(expandedSection === "exams" ? null : "exams")} className="w-full flex items-center justify-between border-none bg-transparent cursor-pointer text-left group">
              <p className="text-[14px] text-[#7c829c] group-hover:text-[#111827] transition-colors">Add details of competitive exams you have taken to enhance your profile.</p>
              <span className={`text-[#2f55e4] transition-transform duration-300 ${expandedSection === "exams" ? "rotate-180" : ""}`}>▼</span>
            </button>
            {expandedSection === "exams" && (
              <div className="flex flex-col gap-6 mt-6 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2"><label className="text-[14px] font-bold text-[#4b5563]">Competitive exam</label><select className="h-12 px-4 border border-[#eff1f6] rounded-xl bg-[#f6f7fb] outline-none"><option>Select Exam</option><option>TOEFL</option><option>GMAT</option><option>GRE</option><option>SAT</option><option>IELTS</option></select></div>
                  <div className="flex flex-col gap-2"><label className="text-[14px] font-bold text-[#4b5563]">Score</label><input type="text" className="h-12 px-4 border border-[#eff1f6] rounded-xl bg-[#f6f7fb] outline-none" placeholder="Score" /></div>
                </div>
                <button onClick={handleSave} className="self-end bg-[#2f55e4] text-white font-bold px-8 py-2 rounded-full text-[14px] hover:bg-[#2242c2] transition-colors">Save</button>
              </div>
            )}
          </SectionCard>

          {/* 12. Academic Achievements */}
          <SectionCard id="academic" title="Academic achievements">
            <button onClick={() => setExpandedSection(expandedSection === "academic" ? null : "academic")} className="w-full flex items-center justify-between border-none bg-transparent cursor-pointer text-left group">
              <p className="text-[14px] text-[#7c829c] group-hover:text-[#111827] transition-colors">Adding your achievements to help recruiters know your value as a potential candidate.</p>
              <span className={`text-[#2f55e4] transition-transform duration-300 ${expandedSection === "academic" ? "rotate-180" : ""}`}>▼</span>
            </button>
            {expandedSection === "academic" && (
              <div className="flex flex-col gap-6 mt-6 animate-fadeIn">
                <div className="flex flex-col gap-4">
                  <h6 className="text-[14px] font-bold text-[#111827]">Achievements</h6>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {["College topper", "Department topper", "Top 3 in class", "Top 10 in class", "Gold medalist", "Received scholarship", "All rounder", "Other"].map(a => (
                      <label key={a} className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="w-4 h-4 text-[#2f55e4]" /><span className="text-[13px] font-medium">{a}</span></label>
                    ))}
                  </div>
                </div>
                <button onClick={handleSave} className="self-end bg-[#2f55e4] text-white font-bold px-8 py-2 rounded-full text-[14px] hover:bg-[#2242c2] transition-colors">Save</button>
              </div>
            )}
          </SectionCard>

          {/* 13. Resume */}
          <SectionCard id="resume" title="Resume">
            <p className="text-[14px] text-[#7c829c] mb-6 leading-relaxed">Your resume is the first impression you make on potential employers. Craft it carefully.</p>
            <div className="border-2 border-dashed border-[#eff1f6] rounded-[24px] p-10 flex flex-col items-center justify-center gap-4 bg-[#f6f7fb] hover:bg-white hover:border-[#2f55e4] transition-all cursor-pointer group">
              <div className="w-14 h-14 rounded-full bg-[#e8f0fb] flex items-center justify-center text-[#2f55e4] text-[24px] group-hover:scale-110 transition-transform">⬆️</div>
              <div className="text-center">
                <p className="text-[16px] font-bold text-[#111827]">Upload resume</p>
                <p className="text-[12px] text-[#7c829c]">Supported formats: doc, docx, rtf, pdf, up to 2MB</p>
              </div>
            </div>
          </SectionCard>
          
        </div>
      </div>
    </div>
  </div>
  );
}

// ── Helpers ──

function SectionCard({ id, title, children, hasAdd }: { id: string, title: string, children: React.ReactNode, hasAdd?: boolean }) {
  return (
    <div id={id} className="bg-white border border-[#eff1f6] rounded-[32px] p-6 md:p-10 shadow-[0_4px_20px_rgba(47,85,228,0.04)] scroll-mt-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 border-b border-[#eff1f6] pb-4">
        <h2 className="text-[24px] font-bold text-[#111827] tracking-tight">{title}</h2>
        <div className="flex gap-3">
          {hasAdd && <button className="text-[#2f55e4] bg-[#f6f7fb] px-4 py-2 rounded-full font-bold text-[14px] hover:bg-[#e8f0fb] transition-colors">+ Add</button>}
          <button className="text-[#7c829c] bg-[#f6f7fb] px-4 py-2 rounded-full hover:text-[#111827] font-bold text-[14px] transition-colors">✎ Edit</button>
        </div>
      </div>
      {children}
    </div>
  );
}

function PreferenceItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="bg-[#f6f7fb] p-5 rounded-2xl border border-[#eff1f6]">
      <p className="text-[14px] font-bold text-[#7c829c] mb-1">{label}</p>
      <p className="text-[16px] font-bold text-[#111827]">{value}</p>
    </div>
  );
}

function TimelineItem({ title, subtitle, detail, extra, description }: { title: string, subtitle?: string, detail?: string, extra?: string, description?: string }) {
  return (
    <div className="relative pl-8 py-2 border-l-[3px] border-[#eff1f6] last:border-transparent pb-8 last:pb-2">
      <div className="absolute w-4 h-4 bg-[#2f55e4] rounded-full -left-[9.5px] top-[14px] border-4 border-white shadow-sm"></div>
      <h3 className="font-extrabold text-[#111827] text-[18px] mb-1.5">{title}</h3>
      {subtitle && <p className="text-[16px] font-bold text-[#4b5563] mb-1">{subtitle}</p>}
      {detail && <p className="text-[14px] font-bold text-[#7c829c] mb-3 bg-[#f6f7fb] inline-block px-3 py-1 rounded-lg border border-[#eff1f6]">{detail}</p>}
      {extra && <p className="text-[15px] font-medium italic text-[#4b5563] mt-2">{extra}</p>}
      {description && <p className="text-[15px] font-medium text-[#4b5563] mt-3 leading-[1.8]">{description}</p>}
    </div>
  );
}
