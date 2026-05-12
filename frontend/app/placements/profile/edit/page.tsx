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
    profile_summary: "",
    photo_url: "",
    resume_url: "",
    certifications: [{
      name: "", id: "", url: "", from_month: "", from_year: "", to_month: "", to_year: "", expires: true
    }],
    employments: [{
      total_years: "0", total_months: "0", company: "", designation: "", from_month: "", from_year: "", to_month: "", to_year: "", current: false, description: ""
    }],
    preferences: {
      job_type: "Full Time",
      availability: "Immediately",
      location: ""
    },
    academic_achievements: ""
  });

  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [skillInput, setSkillInput] = useState("");
  const [langInput, setLangInput] = useState("");

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim() as never)) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, skillInput.trim()] as any }));
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  const addLanguage = (lang?: string) => {
    const language = lang || langInput;
    if (language && !formData.languages.includes(language as never)) {
      setFormData(prev => ({ ...prev, languages: [...prev.languages, language] as any }));
      setLangInput("");
    }
  };

  const addInternship = () => setFormData(prev => ({ ...prev, internships: [...prev.internships, { company: "", from_month: "", from_year: "", to_month: "", to_year: "", project: "", description: "", skills: "", url: "" }] }));
  const updateInternship = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const newInternships = [...prev.internships];
      newInternships[index] = { ...newInternships[index], [field]: value };
      return { ...prev, internships: newInternships };
    });
  };

  const addProject = () => setFormData(prev => ({ ...prev, projects: [...prev.projects, { name: "", from_month: "", from_year: "", to_month: "", to_year: "", description: "", skills: "", url: "" }] }));
  const updateProject = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const newProjects = [...prev.projects];
      newProjects[index] = { ...newProjects[index], [field]: value };
      return { ...prev, projects: newProjects };
    });
  };

  const addCertification = () => setFormData(prev => ({ ...prev, certifications: [...prev.certifications, { name: "", id: "", url: "", from_month: "", from_year: "", to_month: "", to_year: "", expires: true }] }));
  const updateCertification = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const newCerts = [...prev.certifications];
      newCerts[index] = { ...newCerts[index], [field]: value };
      return { ...prev, certifications: newCerts };
    });
  };

  const addEmployment = () => setFormData(prev => ({ ...prev, employments: [...prev.employments, { total_years: "0", total_months: "0", company: "", designation: "", from_month: "", from_year: "", to_month: "", to_year: "", current: false, description: "" }] }));
  const updateEmployment = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const newEmps = [...prev.employments];
      newEmps[index] = { ...newEmps[index], [field]: value };
      return { ...prev, employments: newEmps };
    });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch(`${API}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => {
          if (data && data.user) {
            setUser(data.user);
            const user = data.user;
            setFormData(prev => {
              const dbEducation = typeof user.education_history === 'string' ? JSON.parse(user.education_history) : (user.education_history || {});
              return {
                ...prev,
                full_name: user.full_name || prev.full_name,
                gender: user.gender || prev.gender,
                dob: user.date_of_birth || prev.dob,
                location: user.location || prev.location,
                country: user.country || prev.country,
                hometown: user.hometown || prev.hometown,
                mobile: user.phone_number || prev.mobile,
                skills: typeof user.skills === 'string' ? JSON.parse(user.skills) : (user.skills || prev.skills),
                languages: typeof user.languages === 'string' ? JSON.parse(user.languages) : (user.languages || prev.languages),
                internships: typeof user.internships === 'string' ? JSON.parse(user.internships) : (user.internships || prev.internships),
                projects: typeof user.projects === 'string' ? JSON.parse(user.projects) : (user.projects || prev.projects),
                employments: typeof user.employment_history === 'string' ? JSON.parse(user.employment_history) : (user.employment_history || prev.employments),
                certifications: typeof user.certifications === 'string' ? JSON.parse(user.certifications) : (user.certifications || prev.certifications),
                profile_summary: user.profile_summary || prev.profile_summary,
                photo_url: user.photo_url || prev.photo_url,
                resume_url: user.resume_url || prev.resume_url,
                education: {
                  ...prev.education,
                  ...dbEducation,
                  degree: {
                    ...prev.education.degree,
                    ...(dbEducation.degree || {}),
                    course: user.course_name || dbEducation.degree?.course || prev.education.degree.course,
                    college: user.college_name || dbEducation.degree?.college || prev.education.degree.college
                  }
                },
                preferences: {
                  job_type: user.preferred_job_type || prev.preferences.job_type,
                  availability: user.availability || prev.preferences.availability,
                  location: user.preferred_location || prev.preferences.location
                }
              };
            });
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [API]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'assessment') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const token = localStorage.getItem("token");
    const fd = new FormData();
    fd.append(type === 'image' ? 'image' : 'file', file);
    try {
      const res = await fetch(`${API}/api/upload/${type}`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd });
      const data = await res.json();
      if (data.success) {
        setFormData(prev => ({ ...prev, [type === 'image' ? 'photo_url' : 'resume_url']: data.url || data.file_url }));
        alert("Uploaded successfully!");
      }
    } catch (err) { alert("Upload failed"); }
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/api/auth/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      if (res.ok) { alert("Profile saved!"); setEditingSection(null); }
    } catch (err) { alert("Error saving profile"); }
  };

  const getPhotoUrl = (url: string | undefined) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return `${API}${cleanUrl}`;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 font-bold">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 font-[Segoe_UI,sans-serif]">
      {/* ── Top Header Section ── */}
      <div className="bg-white border-b border-[#eff1f6] pt-10 pb-16">
        <div className="max-w-7xl mx-auto px-4 md:px-10">
          <button 
            onClick={() => router.push("/placements/profile")}
            className="flex items-center gap-2 text-[#7c829c] hover:text-[#2f55e4] font-bold text-[15px] mb-8 transition-colors group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to profile
          </button>
          <div className="flex flex-col lg:flex-row gap-10 items-start lg:items-center">
            <div className="relative group">
              <div className="w-40 h-40 rounded-[48px] bg-[#f6f7fb] border-4 border-white shadow-xl overflow-hidden relative">
                {formData.photo_url ? (
                  <img src={getPhotoUrl(formData.photo_url) || ""} className="w-full h-full object-cover" alt="Profile" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl text-[#7c829c]">👤</div>
                )}
                <button onClick={() => document.getElementById('photo-input')?.click()} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white font-bold text-sm">Change</button>
              </div>
              <input type="file" id="photo-input" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'image')} />
            </div>

            <div className="flex-1 space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-4">
                  <h1 className="text-[32px] md:text-[40px] font-black text-[#111827] tracking-tight">{formData.full_name || "Enter Your Name"}</h1>
                  <button onClick={() => setEditingSection(editingSection === 'basic' ? null : 'basic')} className="text-[#7c829c] hover:text-[#2f55e4] transition-colors p-2 hover:bg-[#f6f7fb] rounded-xl" title="Edit Basic Info">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                  <p className="text-[18px] font-bold text-[#4b5563] flex items-center gap-2">🎓 {formData.education.degree.course || "No degree"}</p>
                  <p className="text-[18px] font-bold text-[#7c829c] flex items-center gap-2">🏛️ {formData.education.degree.college || "No college"}</p>
                </div>
              </div>

              {editingSection === 'basic' ? (
                <div className="bg-[#f6f7fb] p-6 rounded-[32px] border border-[#eff1f6] animate-fadeIn grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1"><label className="text-[12px] font-bold text-[#7c829c] uppercase">Full Name</label><input type="text" className="h-10 px-4 border rounded-xl" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} /></div>
                  <div className="flex flex-col gap-1"><label className="text-[12px] font-bold text-[#7c829c] uppercase">Location</label><input type="text" className="h-10 px-4 border rounded-xl" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} /></div>
                  <div className="flex flex-col gap-1"><label className="text-[12px] font-bold text-[#7c829c] uppercase">Gender</label><select className="h-10 px-4 border rounded-xl" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}><option>Male</option><option>Female</option><option>Other</option></select></div>
                  <div className="flex flex-col gap-1"><label className="text-[12px] font-bold text-[#7c829c] uppercase">Birth Date</label><input type="text" className="h-10 px-4 border rounded-xl" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} /></div>
                  <div className="flex flex-col gap-1"><label className="text-[12px] font-bold text-[#7c829c] uppercase">Mobile</label><input type="text" className="h-10 px-4 border rounded-xl" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} /></div>
                  <div className="flex items-end gap-3 md:col-span-2 pt-2">
                    <button onClick={handleSave} className="bg-[#2f55e4] text-white font-bold px-6 py-2 rounded-xl text-sm">Save Changes</button>
                    <button onClick={() => setEditingSection(null)} className="text-[#7c829c] font-bold px-4 text-sm">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <div className="flex items-center gap-2 px-4 py-2 bg-[#f6f7fb] rounded-xl border border-[#eff1f6] text-[14px] font-bold text-[#4b5563]">📍 {formData.location || "Location"}</div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-[#f6f7fb] rounded-xl border border-[#eff1f6] text-[14px] font-bold text-[#4b5563]">👤 {formData.gender || "Gender"}</div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-[#f6f7fb] rounded-xl border border-[#eff1f6] text-[14px] font-bold text-[#4b5563]">🎂 {formData.dob || "Birth Date"}</div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-[#f6f7fb] rounded-xl border border-[#eff1f6] text-[14px] font-bold text-[#4b5563]">📞 {formData.mobile || "Phone"}</div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-[#f0fdf4] rounded-xl border border-[#dcfce7] text-[14px] font-bold text-green-600">✉️ {user?.email_id || "Email"} ✔️</div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <button onClick={() => setEditingSection(editingSection === 'all' ? null : 'all')} className="bg-[#2f55e4] hover:bg-[#2242c2] text-white font-bold px-8 py-4 rounded-3xl transition-all shadow-lg text-[16px] min-w-[200px]">
                ✎ {editingSection === 'all' ? 'View Profile' : 'View & Edit All'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-10 mt-[-40px]">
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="w-full lg:w-[280px] shrink-0">
            <div className="bg-white border border-[#eff1f6] rounded-[32px] p-6 shadow-xl sticky top-24">
              <h3 className="text-[12px] font-black text-[#7c829c] uppercase tracking-[2px] mb-6 px-2">Quick Links</h3>
              <ul className="space-y-1">
                {["Preferences", "Education", "Key skills", "Languages", "Internships", "Projects", "Profile summary", "Employment", "Resume"].map(l => (
                  <li key={l}><a href={`#${l.toLowerCase().replace(/ /g, '-')}`} className="flex items-center justify-between px-4 py-3 rounded-2xl text-[15px] font-bold text-[#4b5563] hover:bg-[#f6f7fb] hover:text-[#2f55e4] transition-all"> {l} <span>→</span></a></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-8 min-w-0">
            {/* Preferences */}
            <SectionCard id="preferences" title="Your career preferences" onEdit={() => setEditingSection('preferences')} isEditing={editingSection === 'preferences' || editingSection === 'all'}>
              {editingSection === 'preferences' || editingSection === 'all' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2"><label className="text-[14px] font-bold text-[#4b5563]">Preferred job type</label><select className="h-12 px-4 border border-[#eff1f6] rounded-xl font-semibold bg-[#f6f7fb]" value={formData.preferences.job_type} onChange={e => setFormData({...formData, preferences: {...formData.preferences, job_type: e.target.value}})}><option>Full Time</option><option>Part Time</option></select></div>
                  <div className="flex flex-col gap-2"><label className="text-[14px] font-bold text-[#4b5563]">Availability</label><select className="h-12 px-4 border border-[#eff1f6] rounded-xl font-semibold bg-[#f6f7fb]" value={formData.preferences.availability} onChange={e => setFormData({...formData, preferences: {...formData.preferences, availability: e.target.value}})}><option>Immediately</option><option>1 Month</option></select></div>
                  <div className="flex flex-col gap-2 md:col-span-2"><label className="text-[14px] font-bold text-[#4b5563]">Preferred Location</label><input type="text" className="h-12 px-4 border border-[#eff1f6] rounded-xl font-semibold bg-[#f6f7fb]" value={formData.preferences.location} onChange={e => setFormData({...formData, preferences: {...formData.preferences, location: e.target.value}})} /></div>
                  <div className="flex justify-end md:col-span-2"><button onClick={handleSave} className="bg-[#2f55e4] text-white font-bold px-8 py-2 rounded-full">Save</button></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <PreferenceItem label="Job Type" value={formData.preferences.job_type} />
                  <PreferenceItem label="Availability" value={formData.preferences.availability} />
                  <PreferenceItem label="Location" value={formData.preferences.location} />
                </div>
              )}
            </SectionCard>

            {/* Education */}
            <SectionCard id="education" title="Education" onEdit={() => setEditingSection('education')} isEditing={editingSection === 'education' || editingSection === 'all'}>
              {editingSection === 'education' || editingSection === 'all' ? (
                <div className="space-y-10">
                  {/* Higher Education */}
                  <div className="space-y-6">
                    <h3 className="text-[16px] font-black text-[#111827] border-l-4 border-[#2f55e4] pl-4">Higher Education</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2"><label className="text-[13px] font-bold text-[#7c829c]">Degree</label><input type="text" className="h-11 px-4 border border-[#eff1f6] rounded-xl font-semibold bg-[#f6f7fb]" value={formData.education.degree.course} onChange={e => setFormData({...formData, education: {...formData.education, degree: {...formData.education.degree, course: e.target.value}}})} /></div>
                      <div className="flex flex-col gap-2"><label className="text-[13px] font-bold text-[#7c829c]">College</label><input type="text" className="h-11 px-4 border border-[#eff1f6] rounded-xl font-semibold bg-[#f6f7fb]" value={formData.education.degree.college} onChange={e => setFormData({...formData, education: {...formData.education, degree: {...formData.education.degree, college: e.target.value}}})} /></div>
                      <div className="flex flex-col gap-2"><label className="text-[13px] font-bold text-[#7c829c]">Graduating Year</label><input type="text" className="h-11 px-4 border border-[#eff1f6] rounded-xl font-semibold bg-[#f6f7fb]" value={formData.education.degree.to_year} onChange={e => setFormData({...formData, education: {...formData.education, degree: {...formData.education.degree, to_year: e.target.value}}})} /></div>
                    </div>
                  </div>

                  {/* Class XII */}
                  <div className="space-y-6 pt-6 border-t border-[#f6f7fb]">
                    <h3 className="text-[16px] font-black text-[#111827] border-l-4 border-[#2f55e4] pl-4">Class XII</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-[13px] font-bold text-[#7c829c]">Board</label>
                        <select className="h-11 px-4 border border-[#eff1f6] rounded-xl font-semibold bg-[#f6f7fb]" value={formData.education.class12.board} onChange={e => setFormData({...formData, education: {...formData.education, class12: {...formData.education.class12, board: e.target.value}}})}>
                          <option value="">Select Board</option>
                          <option value="State Board">State Board</option>
                          <option value="Matric">Matric</option>
                          <option value="CBSE">CBSE</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-2"><label className="text-[13px] font-bold text-[#7c829c]">Percentage (%)</label><input type="text" className="h-11 px-4 border border-[#eff1f6] rounded-xl font-semibold bg-[#f6f7fb]" value={formData.education.class12.percentage} onChange={e => setFormData({...formData, education: {...formData.education, class12: {...formData.education.class12, percentage: e.target.value}}})} /></div>
                      <div className="flex flex-col gap-2"><label className="text-[13px] font-bold text-[#7c829c]">Passing Year</label><input type="text" className="h-11 px-4 border border-[#eff1f6] rounded-xl font-semibold bg-[#f6f7fb]" value={formData.education.class12.passing_year} onChange={e => setFormData({...formData, education: {...formData.education, class12: {...formData.education.class12, passing_year: e.target.value}}})} /></div>
                    </div>
                  </div>

                  {/* Class X */}
                  <div className="space-y-6 pt-6 border-t border-[#f6f7fb]">
                    <h3 className="text-[16px] font-black text-[#111827] border-l-4 border-[#2f55e4] pl-4">Class X</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-[13px] font-bold text-[#7c829c]">Board</label>
                        <select className="h-11 px-4 border border-[#eff1f6] rounded-xl font-semibold bg-[#f6f7fb]" value={formData.education.class10.board} onChange={e => setFormData({...formData, education: {...formData.education, class10: {...formData.education.class10, board: e.target.value}}})}>
                          <option value="">Select Board</option>
                          <option value="State Board">State Board</option>
                          <option value="Matric">Matric</option>
                          <option value="CBSE">CBSE</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-2"><label className="text-[13px] font-bold text-[#7c829c]">Percentage (%)</label><input type="text" className="h-11 px-4 border border-[#eff1f6] rounded-xl font-semibold bg-[#f6f7fb]" value={formData.education.class10.percentage} onChange={e => setFormData({...formData, education: {...formData.education, class10: {...formData.education.class10, percentage: e.target.value}}})} /></div>
                      <div className="flex flex-col gap-2"><label className="text-[13px] font-bold text-[#7c829c]">Passing Year</label><input type="text" className="h-11 px-4 border border-[#eff1f6] rounded-xl font-semibold bg-[#f6f7fb]" value={formData.education.class10.passing_year} onChange={e => setFormData({...formData, education: {...formData.education, class10: {...formData.education.class10, passing_year: e.target.value}}})} /></div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-6 border-t border-[#f6f7fb]"><button onClick={handleSave} className="bg-[#2f55e4] text-white font-bold px-10 py-3 rounded-full shadow-lg transition-all hover:bg-[#2242c2]">Save Education Details</button></div>
                </div>
              ) : (
                <div className="space-y-6">
                  <TimelineItem title={`${formData.education.degree.course} from ${formData.education.degree.college}`} detail={`Graduating in ${formData.education.degree.to_year}`} />
                  {formData.education.class12.passing_year && <TimelineItem title="Class XII" detail={`Scored ${formData.education.class12.percentage}% in ${formData.education.class12.passing_year}`} />}
                  {formData.education.class10.passing_year && <TimelineItem title="Class X" detail={`Scored ${formData.education.class10.percentage}% in ${formData.education.class10.passing_year}`} />}
                </div>
              )}
            </SectionCard>

            {/* Skills */}
            <SectionCard id="key-skills" title="Key Skills" onEdit={() => setEditingSection('skills')} isEditing={editingSection === 'skills' || editingSection === 'all'}>
               {editingSection === 'skills' || editingSection === 'all' ? (
                 <div className="space-y-6">
                    <div className="flex flex-wrap gap-2">{formData.skills.map(s => <span key={s} className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg font-bold">{s} <button onClick={() => removeSkill(s)}>×</button></span>)}</div>
                    <div className="flex gap-2"><input type="text" className="flex-1 h-12 px-4 border border-[#eff1f6] rounded-xl font-semibold bg-[#f6f7fb]" value={skillInput} onChange={e => setSkillInput(e.target.value)} /><button onClick={addSkill} className="bg-blue-600 text-white px-6 rounded-xl font-bold">Add</button></div>
                 </div>
               ) : (
                 <div className="flex flex-wrap gap-3">{formData.skills.map(s => <span key={s} className="bg-[#f6f7fb] text-[#111827] px-5 py-2.5 rounded-2xl font-bold border border-[#eff1f6]">{s}</span>)}</div>
               )}
            </SectionCard>

            {/* Profile Summary */}
            <SectionCard id="profile-summary" title="Profile Summary" onEdit={() => setEditingSection('summary')} isEditing={editingSection === 'summary' || editingSection === 'all'}>
               {editingSection === 'summary' || editingSection === 'all' ? (
                 <div className="space-y-4"><textarea className="w-full p-4 border border-[#eff1f6] rounded-xl font-semibold bg-[#f6f7fb] min-h-[120px]" value={formData.profile_summary} onChange={e => setFormData({...formData, profile_summary: e.target.value})} /><button onClick={handleSave} className="bg-blue-600 text-white px-8 py-2 rounded-full font-bold">Save</button></div>
               ) : (
                 <p className="text-[#4b5563] leading-relaxed font-medium">{formData.profile_summary || "No summary added."}</p>
               )}
            </SectionCard>

            {/* Internships */}
            <SectionCard id="internships" title="Internships" hasAdd={true} onAdd={addInternship} onEdit={() => setEditingSection('internships')} isEditing={editingSection === 'internships' || editingSection === 'all'}>
              {editingSection === 'internships' || editingSection === 'all' ? (
                <div className="space-y-6">
                  {formData.internships.map((it, i) => (
                    <div key={i} className="p-6 border border-[#eff1f6] rounded-[24px] bg-white shadow-sm relative">
                      <button onClick={() => setFormData(prev => ({...prev, internships: prev.internships.filter((_, idx) => idx !== i)}))} className="absolute top-4 right-4 text-red-500 font-bold">×</button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2"><label className="text-[13px] font-bold text-[#7c829c]">Company</label><input type="text" className="h-11 px-4 border rounded-xl font-semibold" value={it.company} onChange={e => updateInternship(i, 'company', e.target.value)} /></div>
                        <div className="flex flex-col gap-2"><label className="text-[13px] font-bold text-[#7c829c]">Project Name</label><input type="text" className="h-11 px-4 border rounded-xl font-semibold" value={it.project} onChange={e => updateInternship(i, 'project', e.target.value)} /></div>
                        <div className="flex flex-col gap-2 md:col-span-2"><label className="text-[13px] font-bold text-[#7c829c]">Description</label><textarea className="p-4 border rounded-xl font-semibold min-h-[100px]" value={it.description} onChange={e => updateInternship(i, 'description', e.target.value)} /></div>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-end"><button onClick={handleSave} className="bg-[#2f55e4] text-white font-bold px-10 py-3 rounded-full shadow-md">Save Internships</button></div>
                </div>
              ) : (
                <div className="space-y-6">
                  {formData.internships.length > 0 ? formData.internships.map((it, i) => (
                    <TimelineItem key={i} title={it.company} subtitle={it.project} description={it.description} />
                  )) : <p className="text-[#7c829c] italic">No internships listed.</p>}
                </div>
              )}
            </SectionCard>

            {/* Projects */}
            <SectionCard id="projects" title="Projects" hasAdd={true} onAdd={addProject} onEdit={() => setEditingSection('projects')} isEditing={editingSection === 'projects' || editingSection === 'all'}>
              {editingSection === 'projects' || editingSection === 'all' ? (
                <div className="space-y-6">
                  {formData.projects.map((p, i) => (
                    <div key={i} className="p-6 border border-[#eff1f6] rounded-[24px] bg-white shadow-sm relative">
                      <button onClick={() => setFormData(prev => ({...prev, projects: prev.projects.filter((_, idx) => idx !== i)}))} className="absolute top-4 right-4 text-red-500 font-bold hover:bg-red-50 p-2 rounded-full transition-colors">×</button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2"><label className="text-[13px] font-bold text-[#7c829c]">Project Title</label><input type="text" className="h-11 px-4 border rounded-xl font-semibold" value={p.name} onChange={e => updateProject(i, 'name', e.target.value)} /></div>
                        <div className="flex flex-col gap-2"><label className="text-[13px] font-bold text-[#7c829c]">URL</label><input type="text" className="h-11 px-4 border rounded-xl font-semibold" value={p.url} onChange={e => updateProject(i, 'url', e.target.value)} /></div>
                        <div className="flex flex-col gap-2 md:col-span-2"><label className="text-[13px] font-bold text-[#7c829c]">Description</label><textarea className="p-4 border rounded-xl font-semibold min-h-[100px]" value={p.description} onChange={e => updateProject(i, 'description', e.target.value)} /></div>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-end"><button onClick={handleSave} className="bg-[#2f55e4] text-white font-bold px-10 py-3 rounded-full transition-all shadow-md">Save Projects</button></div>
                </div>
              ) : (
                <div className="space-y-6">
                  {formData.projects.length > 0 ? formData.projects.map((p, i) => (
                    <TimelineItem key={i} title={p.name} detail={p.url ? "Link Available" : "Self Project"} description={p.description} />
                  )) : <p className="text-[#7c829c] italic">No projects showcased yet.</p>}
                </div>
              )}
            </SectionCard>

            {/* Accomplishments */}
            <SectionCard id="accomplishments" title="Accomplishments" hasAdd={true} onAdd={addCertification} onEdit={() => setEditingSection('certs')} isEditing={editingSection === 'certs' || editingSection === 'all'}>
               {editingSection === 'certs' || editingSection === 'all' ? (
                 <div className="space-y-6">
                    {formData.certifications.map((c, i) => (
                      <div key={i} className="p-6 border border-[#eff1f6] rounded-[24px] bg-white shadow-sm relative">
                        <button onClick={() => setFormData(prev => ({...prev, certifications: prev.certifications.filter((_, idx) => idx !== i)}))} className="absolute top-4 right-4 text-red-500 font-bold">×</button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-2 md:col-span-2"><label className="text-[13px] font-bold text-[#7c829c]">Certification Name</label><input type="text" className="h-11 px-4 border rounded-xl font-semibold" value={c.name} onChange={e => updateCertification(i, 'name', e.target.value)} /></div>
                          <div className="flex flex-col gap-2"><label className="text-[13px] font-bold text-[#7c829c]">ID</label><input type="text" className="h-11 px-4 border rounded-xl font-semibold" value={c.id} onChange={e => updateCertification(i, 'id', e.target.value)} /></div>
                          <div className="flex flex-col gap-2"><label className="text-[13px] font-bold text-[#7c829c]">URL</label><input type="text" className="h-11 px-4 border rounded-xl font-semibold" value={c.url} onChange={e => updateCertification(i, 'url', e.target.value)} /></div>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-end"><button onClick={handleSave} className="bg-[#2f55e4] text-white font-bold px-10 py-3 rounded-full shadow-md">Save Accomplishments</button></div>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formData.certifications.length > 0 ? formData.certifications.map((c, i) => (
                      <div key={i} className="p-4 bg-[#f6f7fb] rounded-2xl border border-[#eff1f6] flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 text-xl">🏆</div>
                        <div>
                          <p className="font-black text-[#111827]">{c.name}</p>
                          <p className="text-[12px] font-bold text-[#7c829c] uppercase tracking-wider">{c.id || "Verified Skill"}</p>
                        </div>
                      </div>
                    )) : <p className="text-[#7c829c] italic">No certifications added yet.</p>}
                 </div>
               )}
            </SectionCard>

            {/* Employment */}
            <SectionCard id="employment" title="Employment" hasAdd={true} onAdd={addEmployment} onEdit={() => setEditingSection('employment')} isEditing={editingSection === 'employment' || editingSection === 'all'}>
               {editingSection === 'employment' || editingSection === 'all' ? (
                 <div className="space-y-6">
                    {formData.employments.map((e, i) => (
                      <div key={i} className="p-6 border border-[#eff1f6] rounded-[24px] bg-white shadow-sm relative">
                        <button onClick={() => setFormData(prev => ({...prev, employments: prev.employments.filter((_, idx) => idx !== i)}))} className="absolute top-4 right-4 text-red-500 font-bold">×</button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-2"><label className="text-[13px] font-bold text-[#7c829c]">Company</label><input type="text" className="h-11 px-4 border rounded-xl font-semibold" value={e.company} onChange={v => updateEmployment(i, 'company', v.target.value)} /></div>
                          <div className="flex flex-col gap-2"><label className="text-[13px] font-bold text-[#7c829c]">Designation</label><input type="text" className="h-11 px-4 border rounded-xl font-semibold" value={e.designation} onChange={v => updateEmployment(i, 'designation', v.target.value)} /></div>
                          <div className="flex flex-col gap-2 md:col-span-2"><label className="text-[13px] font-bold text-[#7c829c]">Role Summary</label><textarea className="p-4 border rounded-xl font-semibold" value={e.description} onChange={v => updateEmployment(i, 'description', v.target.value)} /></div>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-end"><button onClick={handleSave} className="bg-[#2f55e4] text-white font-bold px-10 py-3 rounded-full shadow-md">Save Employment</button></div>
                 </div>
               ) : (
                 <div className="space-y-6">
                    {formData.employments.length > 0 ? formData.employments.map((e, i) => (
                      <TimelineItem key={i} title={e.company} subtitle={e.designation} description={e.description} detail={`${e.total_years || 0} Years`} />
                    )) : <p className="text-[#7c829c] italic">No work experience listed.</p>}
                 </div>
               )}
            </SectionCard>

            {/* Resume */}
            <SectionCard id="resume" title="Resume">
              <div className="space-y-6">
                <p className="text-[15px] font-bold text-[#7c829c] leading-relaxed max-w-2xl">
                  Your resume is the first impression you make on potential employers. Craft it carefully to secure your desired job or internship.
                </p>
                
                {formData.resume_url ? (
                  <div className="bg-[#f6f7fb] border border-[#eff1f6] rounded-[24px] p-6 flex items-center justify-between group hover:border-[#2f55e4] transition-all">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-white border border-[#eff1f6] flex items-center justify-center text-2xl shadow-sm">📄</div>
                      <div>
                        <p className="font-black text-[#111827] text-[16px] group-hover:text-[#2f55e4] transition-colors">
                          {formData.resume_url.split('/').pop() || "Ragul_S.pdf"}
                        </p>
                        <p className="text-[13px] font-bold text-[#7c829c] mt-0.5">Uploaded on {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => document.getElementById('resume-input')?.click()}
                      className="bg-white border border-[#eff1f6] hover:border-[#2f55e4] hover:text-[#2f55e4] text-[#4b5563] px-6 py-2.5 rounded-xl text-[14px] font-black transition-all shadow-sm"
                    >
                      Update resume
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-6 p-10 border-2 border-dashed border-[#eff1f6] rounded-[32px] bg-[#f6f7fb] hover:border-[#2f55e4]/50 transition-all cursor-pointer" onClick={() => document.getElementById('resume-input')?.click()}>
                    <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-3xl">📤</div>
                    <div className="text-center">
                      <p className="text-lg font-black text-[#111827]">Upload your resume</p>
                      <p className="text-[14px] font-bold text-[#7c829c] mt-1">Get noticed by top recruiters today</p>
                    </div>
                  </div>
                )}
                
                <p className="text-[12px] font-bold text-[#7c829c] text-center sm:text-left">
                  Supported formats: doc, docx, rtf, pdf, up to 2MB
                </p>
                <input type="file" id="resume-input" className="hidden" accept=".pdf,.doc,.docx,.rtf" onChange={e => handleFileUpload(e, 'assessment')} />
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionCard({ id, title, children, hasAdd, onAdd, onEdit, isEditing }: any) {
  return (
    <div id={id} className={`bg-white border ${isEditing ? 'border-blue-600 ring-4 ring-blue-50' : 'border-[#eff1f6]'} rounded-[32px] p-8 shadow-sm transition-all`}>
      <div className="flex items-center justify-between mb-8 border-b pb-4">
        <h2 className="text-2xl font-black text-[#111827] flex items-center gap-3">{title} {!isEditing && onEdit && <button onClick={onEdit} className="text-gray-400 hover:text-blue-600 transition-colors">✎</button>}</h2>
        {hasAdd && <button onClick={onAdd} className="text-blue-600 bg-blue-50 px-4 py-2 rounded-full font-bold">+ Add</button>}
      </div>
      {children}
    </div>
  );
}

function PreferenceItem({ label, value }: any) {
  return (
    <div className="bg-[#f6f7fb] p-5 rounded-2xl border border-[#eff1f6]">
      <p className="text-[14px] font-bold text-[#7c829c] mb-1">{label}</p>
      <p className="text-[16px] font-black text-[#111827]">{value || "Not set"}</p>
    </div>
  );
}

function TimelineItem({ title, subtitle, detail, description }: any) {
  return (
    <div className="relative pl-8 py-2 border-l-2 border-[#eff1f6] last:border-transparent pb-8 last:pb-0">
      <div className="absolute w-4 h-4 bg-blue-600 rounded-full -left-[9px] top-[14px] border-4 border-white shadow-sm"></div>
      <h3 className="font-black text-[#111827] text-lg mb-1">{title}</h3>
      {subtitle && <p className="font-bold text-[#4b5563] mb-1">{subtitle}</p>}
      {detail && <p className="text-sm font-bold text-[#7c829c] bg-[#f6f7fb] inline-block px-3 py-1 rounded-lg border border-[#eff1f6] mb-3">{detail}</p>}
      {description && <p className="text-[#4b5563] mt-2 leading-relaxed font-medium">{description}</p>}
    </div>
  );
}
