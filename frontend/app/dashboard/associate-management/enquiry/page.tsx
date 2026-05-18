 "use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    User, GraduationCap, Users, Send, ChevronRight, ChevronLeft, CheckCircle2,
    Database, Award, Sparkles, BookOpen, FileText, Search, List, PlusCircle,
    X, Eye, Edit, Trash2, Download, Calendar, UserCheck
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import axios from "axios";

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}/api`;

// ── Course options ─────────────────────────────────────────────────────────────
const COURSE_OPTIONS = [
    "", "AC", "HVAC", "Electrical", "Electrician", "Plumbing",
    "Welding", "MEP", "Safety", "Quality", "Oil & Gas", "Home Appliance",
];

const steps = [
    { id: "A", title: "Personal Details",    icon: User          },
    { id: "B", title: "Education & Career",  icon: GraduationCap },
    { id: "C", title: "Family & Referral",   icon: Users         },
    { id: "D", title: "Counselling Details", icon: BookOpen      },
];

const emptyForm = {
    student_name: "", gender: "Male", age: "", dob: "", mobile_number: "", whatsapp_number: "", email_id: "",
    perm_address: "", perm_city: "", perm_state: "", perm_pin: "",
    curr_address: "", curr_city: "", curr_state: "", curr_pin: "",
    highest_qualification: "", year_of_passing: "", institution_name: "",
    career_objective: "Job", preferred_country: "", expected_salary: "", willing_to_work_all_india: "Yes",
    work_experience: "Fresher", company_name: "", position: "", salary: "", location: "", skills_trade: "",
    father_name: "", mother_name: "", parent_contact: "", parent_occupation: "",
    referred_by: "", counsellor_name: "", counsellor_code: "", will_attend_test: "Yes",
    course_interested: "", level_of_course: "Basic", training_mode: "Offline", batch_timing: "",
    // ── NEW: Enquiry Date ──
    enquiry_date: new Date().toISOString().split("T")[0],
    counselling_date: "", counselling_done_by: "", interest_level: "High",
    follow_up_date: "", remarks: ""
};

export default function StudentEnquiryForm() {
    const router = useRouter();
    const [viewMode,          setViewMode]          = useState<"form"|"list">("form");
    const [enquiries,         setEnquiries]         = useState<any[]>([]);
    const [isLoadingList,     setIsLoadingList]     = useState(false);
    const [selectedEnquiry,   setSelectedEnquiry]   = useState<any>(null);
    const [currentStep,       setCurrentStep]       = useState(0);
    const [isSubmitting,      setIsSubmitting]      = useState(false);
    const [isSuccess,         setIsSuccess]         = useState(false);
    const [enquiryId,         setEnquiryId]         = useState("");
    const [errors,            setErrors]            = useState<Record<string,string>>({});
    const { can, user }     = useAuth();
    const [isEditing,         setIsEditing]         = useState(false);
    const [editId,            setEditId]            = useState<number|null>(null);
    const [formData,          setFormData]          = useState<any>(emptyForm);

    const getAuthHeaders = () => {
        const token = localStorage.getItem("token");
        return { Authorization: `Bearer ${token}` };
    };

    useEffect(() => {
        if (viewMode === "list") fetchEnquiries();
    }, [viewMode]);

    const fetchEnquiries = async () => {
        setIsLoadingList(true);
        try {
            const res = await axios.get(`${API_BASE}/enquiries`, { headers: getAuthHeaders() });
            setEnquiries(res.data);
        } catch (err) { console.error(err); }
        finally { setIsLoadingList(false); }
    };

    // ── Excel Export ────────────────────────────────────────────────────────────
    const exportToExcel = (data: any[]) => {
        const headers = [
            "Enquiry ID","Student Name","Gender","Age","DOB",
            "Mobile","WhatsApp","Email",
            "City","State","Pin","Address",
            "Qualification","Year of Passing","Institution",
            "Career Objective","Course Interested","Interest Level",
            "Training Mode","Batch Timing",
            "Father Name","Mother Name","Parent Contact",
            "Referred By","Counsellor Name","Counsellor Code",
            "Enquiry Date","Counselling Date","Follow Up Date",
            "Remarks","Associate Name"
        ];
        const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString("en-IN") : "";
        const rows = data.map(e => [
            e.enquiry_id||"", e.student_name||"", e.gender||"", e.age||"",
            fmtDate(e.dob), e.mobile_number||"", e.whatsapp_number||"", e.email_id||"",
            e.perm_city||"", e.perm_state||"", e.perm_pin||"", e.perm_address||"",
            e.highest_qualification||"", e.year_of_passing||"", e.institution_name||"",
            e.career_objective||"", e.course_interested||"", e.interest_level||"",
            e.training_mode||"", e.batch_timing||"",
            e.father_name||"", e.mother_name||"", e.parent_contact||"",
            e.referred_by||"", e.counsellor_name||"", e.counsellor_code||"",
            fmtDate(e.enquiry_date), fmtDate(e.counselling_date), fmtDate(e.follow_up_date),
            e.remarks||"", e.associate_name||"Admin"
        ]);
        const csv = [
            headers.join(","),
            ...rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(","))
        ].join("\n");
        const blob = new Blob(["\uFEFF"+csv], { type:"text/csv;charset=utf-8;" });
        const url  = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `enquiries_${new Date().toISOString().split("T")[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    };

    const handleEdit = (enq: any) => {
        if (user?.role === "Associate") { alert("Editing is restricted for Associates."); return; }
        setFormData({
            ...emptyForm, ...enq,
            enquiry_date:     enq.enquiry_date     ? enq.enquiry_date.split("T")[0]     : new Date().toISOString().split("T")[0],
            dob:              enq.dob              ? enq.dob.split("T")[0]              : "",
            counselling_date: enq.counselling_date ? enq.counselling_date.split("T")[0] : "",
            follow_up_date:   enq.follow_up_date   ? enq.follow_up_date.split("T")[0]   : "",
        });
        setEditId(enq.id);
        setIsEditing(true);
        setViewMode("form");
        setCurrentStep(0);
    };

    const handleDelete = async (enq: any) => {
        if (!confirm(`Delete enquiry for "${enq.student_name}" (${enq.enquiry_id})?`)) return;
        try {
            await axios.delete(`${API_BASE}/enquiries/${enq.id}`, { headers: getAuthHeaders() });
            setEnquiries(prev => prev.filter(e => e.id !== enq.id));
        } catch (err: any) { alert(err.response?.data?.error || "Failed to delete."); }
    };

    const validateStep = (idx: number) => {
        const stepId = steps[idx].id;
        const newErrors: Record<string,string> = {};
        const phone = /^\d{10}$/;
        if (stepId === "A") {
            if (!formData.student_name)                           newErrors.student_name    = "Required";
            if (!formData.mobile_number)                          newErrors.mobile_number   = "Required";
            else if (!phone.test(formData.mobile_number))         newErrors.mobile_number   = "10 digits required";
            if (!formData.whatsapp_number)                        newErrors.whatsapp_number = "Required";
            else if (!phone.test(formData.whatsapp_number))       newErrors.whatsapp_number = "10 digits required";
            if (!formData.email_id)                               newErrors.email_id        = "Required";
            if (!formData.age)                                    newErrors.age             = "Required";
            if (!formData.dob)                                    newErrors.dob             = "Required";
            if (!formData.perm_address)                           newErrors.perm_address    = "Required";
            if (!formData.perm_city)                              newErrors.perm_city       = "Required";
        }
        if (stepId === "B") {
            if (!formData.highest_qualification) newErrors.highest_qualification = "Required";
            if (!formData.year_of_passing)       newErrors.year_of_passing       = "Required";
            if (!formData.institution_name)      newErrors.institution_name      = "Required";
        }
        if (stepId === "C") {
            if (!formData.father_name)   newErrors.father_name   = "Required";
            if (!formData.parent_contact)newErrors.parent_contact= "Required";
            else if (!phone.test(formData.parent_contact)) newErrors.parent_contact = "10 digits required";
        }
        if (stepId === "D") {
            if (!formData.course_interested) newErrors.course_interested = "Course selection is mandatory";
            if (!formData.interest_level)    newErrors.interest_level    = "Required";
            if (!formData.enquiry_date)      newErrors.enquiry_date      = "Enquiry date is required";
            if (!formData.counselling_date && !formData.follow_up_date) newErrors.follow_up_date = "Either Follow-up or Counselling date required";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateAllSteps = () => {
        for (let i = 0; i < steps.length; i++) {
            if (!validateStep(i)) { setCurrentStep(i); return false; }
        }
        return true;
    };

    const nextStep = () => {
        if (!validateStep(currentStep)) return;
        if (currentStep < steps.length - 1) { setCurrentStep(p => p+1); window.scrollTo({ top:0, behavior:"smooth" }); }
    };
    const prevStep = () => {
        if (currentStep > 0) { setCurrentStep(p => p-1); window.scrollTo({ top:0, behavior:"smooth" }); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (currentStep < steps.length - 1) { nextStep(); return; }
        if (!validateAllSteps()) return;
        setIsSubmitting(true);
        try {
            if (isEditing && editId) {
                await axios.patch(`${API_BASE}/enquiries/${editId}`, formData, { headers: getAuthHeaders() });
            } else {
                const res = await axios.post(`${API_BASE}/enquiries`, formData, { headers: getAuthHeaders() });
                setEnquiryId(res.data.enquiry_id);
            }
            setIsSuccess(true);
        } catch (error: any) {
            alert(error.response?.data?.error || "Error submitting enquiry.");
        } finally { setIsSubmitting(false); }
    };

    const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }) : "—";

    // ── Step content ─────────────────────────────────────────────────────────────
    const renderStepContent = () => {
        switch (steps[currentStep].id) {
            case "A": return (
                <div className="space-y-4">
                    <InputField label="Student Full Name" name="student_name" value={formData.student_name} onChange={handleChange} error={errors.student_name} compulsory />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SelectField label="Gender" name="gender" options={["Male","Female","Other"]} value={formData.gender} onChange={handleChange} />
                        <InputField label="Age" name="age" type="number" value={formData.age} onChange={handleChange} error={errors.age} compulsory />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleChange} error={errors.dob} compulsory />
                        <InputField label="Mobile Number" name="mobile_number" value={formData.mobile_number} onChange={handleChange} error={errors.mobile_number} compulsory />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="WhatsApp Number" name="whatsapp_number" value={formData.whatsapp_number} onChange={handleChange} error={errors.whatsapp_number} compulsory />
                        <InputField label="Email ID" name="email_id" type="email" value={formData.email_id} onChange={handleChange} error={errors.email_id} compulsory />
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Permanent Address</h4>
                        <TextAreaField label="Address" name="perm_address" value={formData.perm_address} onChange={handleChange} error={errors.perm_address} compulsory />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                            <InputField label="City"  name="perm_city"  value={formData.perm_city}  onChange={handleChange} error={errors.perm_city} compulsory />
                            <InputField label="State" name="perm_state" value={formData.perm_state} onChange={handleChange} />
                            <InputField label="PIN"   name="perm_pin"   value={formData.perm_pin}   onChange={handleChange} />
                        </div>
                    </div>
                </div>
            );
            case "B": return (
                <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Education</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Highest Qualification" name="highest_qualification" value={formData.highest_qualification} onChange={handleChange} error={errors.highest_qualification} compulsory />
                            <InputField label="Year of Passing" name="year_of_passing" type="number" value={formData.year_of_passing} onChange={handleChange} error={errors.year_of_passing} compulsory />
                        </div>
                        <InputField label="Institution Name" name="institution_name" value={formData.institution_name} onChange={handleChange} error={errors.institution_name} compulsory />
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Career Goals</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SelectField label="Career Objective" name="career_objective" options={["Job","Business","Higher Studies"]} value={formData.career_objective} onChange={handleChange} />
                            <InputField label="Preferred Country" name="preferred_country" value={formData.preferred_country} onChange={handleChange} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                            <SelectField label="Work Experience" name="work_experience" options={["Fresher","Less than 1 Year","1-2 Years","3-5 Years","5+ Years"]} value={formData.work_experience} onChange={handleChange} />
                            <InputField label="Skills / Trade" name="skills_trade" value={formData.skills_trade} onChange={handleChange} />
                        </div>
                    </div>
                </div>
            );
            case "C": return (
                <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Family Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Father's Name" name="father_name" value={formData.father_name} onChange={handleChange} error={errors.father_name} compulsory />
                            <InputField label="Mother's Name" name="mother_name" value={formData.mother_name} onChange={handleChange} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                            <InputField label="Parent Contact" name="parent_contact" value={formData.parent_contact} onChange={handleChange} error={errors.parent_contact} compulsory />
                            <InputField label="Parent Occupation" name="parent_occupation" value={formData.parent_occupation} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Referral</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Referred By"      name="referred_by"     value={formData.referred_by}     onChange={handleChange} />
                            <InputField label="Counsellor Name"  name="counsellor_name" value={formData.counsellor_name} onChange={handleChange} />
                        </div>
                        <InputField label="Counsellor Code" name="counsellor_code" value={formData.counsellor_code} onChange={handleChange} />
                    </div>
                </div>
            );
            case "D": return (
                <div className="space-y-4">
                    {/* ── Course Interested → DROPDOWN ── */}
                    <SelectField label="Course Interested *" name="course_interested" options={COURSE_OPTIONS}
                        value={formData.course_interested} onChange={handleChange} error={errors.course_interested} compulsory />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SelectField label="Course Level"    name="level_of_course" options={["Basic","Diploma","Advanced","International"]} value={formData.level_of_course} onChange={handleChange} />
                        {/* ── Online / Offline ── */}
                        <SelectField label="Mode of Training" name="training_mode" options={["Online","Offline"]} value={formData.training_mode} onChange={handleChange} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SelectField label="Interest Level *" name="interest_level" options={["High","Medium","Low"]} value={formData.interest_level} onChange={handleChange} error={errors.interest_level} compulsory />
                        <SelectField label="Will Attend Test?" name="will_attend_test" options={["Yes","No"]} value={formData.will_attend_test} onChange={handleChange} />
                    </div>

                    {/* ── Enquiry Date ── NEW ── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="Enquiry Date *" name="enquiry_date" type="date" value={formData.enquiry_date} onChange={handleChange} error={errors.enquiry_date} compulsory />
                        <InputField label="Counselling Date" name="counselling_date" type="date" value={formData.counselling_date} onChange={handleChange} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="Follow-up Date" name="follow_up_date" type="date" value={formData.follow_up_date} onChange={handleChange} error={errors.follow_up_date} />
                        <InputField label="Batch Timing"   name="batch_timing"   value={formData.batch_timing}   onChange={handleChange} />
                    </div>

                    <TextAreaField label="Remarks / Notes" name="remarks" value={formData.remarks} onChange={handleChange} />
                </div>
            );
            default: return null;
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Toggle */}
            <div className="flex justify-between items-center mb-8 px-4">
                <div className="flex bg-slate-100 p-1 rounded-2xl">
                    <button
                        onClick={() => { setViewMode("form"); setIsEditing(false); setEditId(null); setFormData(emptyForm); setCurrentStep(0); }}
                        className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${viewMode==="form"?"bg-[#0b1f3a] text-white":"text-slate-500 hover:text-slate-800"}`}>
                        <PlusCircle size={18}/> New Enquiry
                    </button>
                    <button
                        onClick={() => setViewMode("list")}
                        className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${viewMode==="list"?"bg-[#0b1f3a] text-white":"text-slate-500 hover:text-slate-800"}`}>
                        <List size={18}/> View List
                    </button>
                </div>
            </div>

            {/* ── Form View ── */}
            {viewMode === "form" ? (
                <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
                    <div className="bg-[#0b1f3a] px-8 pt-10 pb-6 text-white relative overflow-hidden">
                        <div className="flex justify-between items-center relative z-10 mb-8">
                            <div>
                                <h2 className="text-3xl font-black tracking-tight">{isEditing ? "Edit Enquiry" : "Student Enquiry"}</h2>
                                <p className="text-blue-300 font-bold mt-1 uppercase text-xs tracking-[0.1em]">
                                    {isEditing ? "Update: " + (formData.student_name||"") : steps[currentStep].title}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                                <span className="text-xl font-black">{currentStep+1}</span>
                            </div>
                        </div>
                        <div className="relative z-10 flex gap-1 overflow-x-auto pb-2">
                            {steps.map((s, idx) => (
                                <button key={s.id} type="button"
                                    onClick={() => {
                                        if (user?.role==="Super Admin"||user?.role==="Admin") { setCurrentStep(idx); }
                                        else if (idx > currentStep) { if (validateStep(currentStep)) setCurrentStep(idx); }
                                        else { setCurrentStep(idx); }
                                    }}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap min-w-fit ${currentStep===idx?"bg-blue-600 text-white shadow-lg":"text-blue-200/40 hover:text-white hover:bg-white/5"}`}>
                                    <span className="text-[11px] font-black uppercase tracking-widest">{idx+1}. {s.title}</span>
                                </button>
                            ))}
                        </div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl z-0"/>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 md:p-12">
                        {renderStepContent()}
                        <div className="mt-12 flex justify-between items-center pt-8 border-t border-slate-100">
                            <button type="button" onClick={prevStep} disabled={currentStep===0}
                                className="flex items-center gap-2 px-6 py-3 font-bold uppercase text-[10px] text-slate-400 disabled:opacity-0 transition-all">
                                <ChevronLeft size={16}/> Back
                            </button>
                            {currentStep < steps.length - 1 ? (
                                <button type="button" onClick={nextStep}
                                    className="flex items-center gap-2 px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-[#0b1f3a] text-white hover:bg-blue-900 transition-all">
                                    Next Step <ChevronRight size={16}/>
                                </button>
                            ) : (
                                <button type="submit" disabled={isSubmitting}
                                    className="flex items-center gap-2 px-10 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-blue-600 text-white hover:bg-blue-700 transition-all">
                                    {isSubmitting ? "Submitting..." : isEditing ? "Update Record" : "Finish & Send"} <Send size={16}/>
                                </button>
                            )}
                        </div>
                    </form>
                </div>

            ) : (
                /* ── List View ── */
                <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
                    <div className="p-8">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                            <h3 className="text-xl font-black flex items-center gap-2 text-slate-800">
                                <Database size={24}/> My Enquiries
                                <span className="text-sm font-bold text-slate-400">({enquiries.length})</span>
                            </h3>
                            <button onClick={() => exportToExcel(enquiries)} disabled={enquiries.length===0}
                                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition shadow-lg shadow-emerald-200">
                                <Download size={16}/> Export Excel
                            </button>
                        </div>

                        {isLoadingList ? (
                            <div className="flex flex-col items-center py-12 gap-4">
                                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/>
                                <p className="font-bold text-slate-400">Loading...</p>
                            </div>
                        ) : enquiries.length === 0 ? (
                            <div className="text-center py-12">
                                <Database size={48} className="text-slate-200 mx-auto mb-3"/>
                                <p className="font-bold text-slate-300">No enquiries yet.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="border-b-2 border-slate-100">
                                        <tr>
                                            {[
                                                "Enquiry ID","Student Name","Associate",
                                                "Course","Interest",
                                                "Enquiry Date",    // ← NEW
                                                "Follow Up Date",  // ← NEW
                                                "Actions"
                                            ].map(h => (
                                                <th key={h} className="py-4 px-3 font-black uppercase text-[10px] tracking-widest text-slate-400 whitespace-nowrap">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {enquiries.map(enq => (
                                            <tr key={enq.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                                <td className="py-4 px-3 font-mono font-black text-blue-600 text-sm">{enq.enquiry_id}</td>
                                                <td className="py-4 px-3 font-bold text-slate-800">{enq.student_name}</td>
                                                <td className="py-4 px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">{enq.associate_name||"Admin"}</td>
                                                <td className="py-4 px-3 text-sm font-medium text-slate-600">{enq.course_interested||"—"}</td>
                                                <td className="py-4 px-3">
                                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                                                        enq.interest_level==="High"   ? "bg-emerald-100 text-emerald-700" :
                                                        enq.interest_level==="Medium" ? "bg-amber-100 text-amber-700"    :
                                                        "bg-slate-100 text-slate-500"
                                                    }`}>
                                                        {enq.interest_level||"—"}
                                                    </span>
                                                </td>
                                                {/* ── Enquiry Date ← NEW ── */}
                                                <td className="py-4 px-3 text-xs font-bold text-slate-500 whitespace-nowrap">
                                                    <span className="flex items-center gap-1.5">
                                                        <Calendar size={12} className="text-blue-400"/>
                                                        {enq.enquiry_date ? fmtDate(enq.enquiry_date) : fmtDate(enq.created_at)}
                                                    </span>
                                                </td>
                                                {/* ── Follow Up Date ← NEW ── */}
                                                <td className="py-4 px-3 text-xs font-bold whitespace-nowrap">
                                                    {enq.follow_up_date ? (
                                                        <span className={`flex items-center gap-1.5 ${
                                                            new Date(enq.follow_up_date) < new Date()
                                                                ? "text-red-500"
                                                                : "text-emerald-600"
                                                        }`}>
                                                            <Calendar size={12}/>
                                                            {fmtDate(enq.follow_up_date)}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-300">—</span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-3">
                                                    <div className="flex gap-2">
                                                        <button onClick={() => setSelectedEnquiry(enq)}
                                                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all" title="View">
                                                            <Eye size={16}/>
                                                        </button>
                                                        <button onClick={() => router.push(`/dashboard/associate-management/admission?enquiry_id=${enq.enquiry_id}`)}
                                                            className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all" title="Create Admission">
                                                            <UserCheck size={16}/>
                                                        </button>
                                                        {can("Associate Management","edit") && user?.role !== "Associate" && (
                                                            <button onClick={() => handleEdit(enq)}
                                                                className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-600 hover:text-white transition-all" title="Edit">
                                                                <Edit size={16}/>
                                                            </button>
                                                        )}
                                                        {can("Associate Management","delete") && user?.role !== "Associate" && (
                                                            <button onClick={() => handleDelete(enq)}
                                                                className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all" title="Delete">
                                                                <Trash2 size={16}/>
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Footer summary */}
                                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-400">
                                    <span>{enquiries.length} total enquiries</span>
                                    <div className="flex gap-4">
                                        <span className="text-emerald-600">High: <b>{enquiries.filter(e=>e.interest_level==="High").length}</b></span>
                                        <span className="text-amber-600">Medium: <b>{enquiries.filter(e=>e.interest_level==="Medium").length}</b></span>
                                        <span className="text-slate-500">Low: <b>{enquiries.filter(e=>e.interest_level==="Low").length}</b></span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── View Modal ── */}
            <AnimatePresence>
                {selectedEnquiry && (
                    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                        className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-6">
                        <motion.div initial={{ scale:0.9, opacity:0 }} animate={{ scale:1, opacity:1 }}
                            className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[85vh] overflow-y-auto relative shadow-2xl">
                            <button onClick={() => setSelectedEnquiry(null)}
                                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                <X size={24}/>
                            </button>
                            <div className="p-10">
                                <div className="flex items-center gap-6 mb-8 pb-6 border-b border-slate-100">
                                    <div className="w-16 h-16 bg-[#0b1f3a] rounded-3xl flex items-center justify-center text-white text-2xl font-black">
                                        {selectedEnquiry.student_name[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-wider">Enquiry</span>
                                            <span className="text-blue-600 font-mono font-black text-xs">#{selectedEnquiry.enquiry_id}</span>
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
                                                selectedEnquiry.interest_level==="High"?"bg-emerald-100 text-emerald-700":
                                                selectedEnquiry.interest_level==="Medium"?"bg-amber-100 text-amber-700":
                                                "bg-slate-100 text-slate-500"
                                            }`}>{selectedEnquiry.interest_level}</span>
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-800">{selectedEnquiry.student_name}</h3>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <DetailSection title="Personal Info">
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                                            <DetailItem label="Gender"  value={selectedEnquiry.gender} />
                                            <DetailItem label="Age"     value={selectedEnquiry.age} />
                                            <DetailItem label="DOB"     value={selectedEnquiry.dob ? fmtDate(selectedEnquiry.dob) : "—"} />
                                            <DetailItem label="Mobile"  value={selectedEnquiry.mobile_number} />
                                            <DetailItem label="Email"   value={selectedEnquiry.email_id} />
                                            <DetailItem label="City"    value={selectedEnquiry.perm_city} />
                                        </div>
                                    </DetailSection>

                                    <DetailSection title="Course & Counselling">
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                                            <DetailItem label="Course Interested" value={selectedEnquiry.course_interested} />
                                            <DetailItem label="Level"             value={selectedEnquiry.level_of_course} />
                                            <DetailItem label="Training Mode"     value={selectedEnquiry.training_mode} />
                                            <DetailItem label="Counsellor"        value={selectedEnquiry.counsellor_name||"—"} />
                                            {/* ── Enquiry Date in modal ── */}
                                            <DetailItem label="Enquiry Date"      value={selectedEnquiry.enquiry_date ? fmtDate(selectedEnquiry.enquiry_date) : fmtDate(selectedEnquiry.created_at)} />
                                            {/* ── Follow Up Date in modal ── */}
                                            <DetailItem label="Follow Up Date"    value={selectedEnquiry.follow_up_date ? fmtDate(selectedEnquiry.follow_up_date) : "Not set"} />
                                            <DetailItem label="Counselling Date"  value={selectedEnquiry.counselling_date ? fmtDate(selectedEnquiry.counselling_date) : "—"} />
                                        </div>
                                        {selectedEnquiry.remarks && (
                                            <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Remarks</p>
                                                <p className="text-sm text-slate-600 font-medium">{selectedEnquiry.remarks}</p>
                                            </div>
                                        )}
                                    </DetailSection>

                                    <DetailSection title="Family & Referral">
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                                            <DetailItem label="Father's Name"   value={selectedEnquiry.father_name} />
                                            <DetailItem label="Parent Contact"  value={selectedEnquiry.parent_contact} />
                                            <DetailItem label="Referred By"     value={selectedEnquiry.referred_by||"—"} />
                                        </div>
                                    </DetailSection>
                                </div>

                                <div className="mt-8 pt-6 border-t border-slate-100 flex gap-4">
                                    <button onClick={() => setSelectedEnquiry(null)}
                                        className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all">Close</button>
                                    {user?.role !== "Associate" && (
                                        <button onClick={() => { handleEdit(selectedEnquiry); setSelectedEnquiry(null); }}
                                            className="flex-1 py-4 bg-[#0b1f3a] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-900 transition-all">Edit Record</button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Success Modal ── */}
            <AnimatePresence>
                {isSuccess && (
                    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                        className="fixed inset-0 z-50 bg-[#0b1f3a]/90 flex items-center justify-center p-6">
                        <motion.div initial={{ scale:0.9 }} animate={{ scale:1 }}
                            className="bg-white rounded-[3rem] p-12 max-w-sm w-full text-center shadow-2xl">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6"><CheckCircle2 size={40}/></div>
                            <h3 className="text-2xl font-black text-slate-800">{isEditing ? "Enquiry Updated!" : "Enquiry Submitted!"}</h3>
                            {!isEditing && (
                                <>
                                    <p className="text-slate-400 font-bold mt-2 uppercase text-[10px]">Your Enquiry ID is</p>
                                    <p className="text-3xl font-black text-blue-600 mt-2 font-mono">{enquiryId}</p>
                                </>
                            )}
                            <button onClick={() => { setIsSuccess(false); window.location.reload(); }}
                                className="mt-8 w-full py-4 bg-[#0b1f3a] text-white rounded-2xl font-black uppercase text-[10px]">Back to Dashboard</button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ── Helper components ──────────────────────────────────────────────────────────
const DetailSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div>
        <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block"/> {title}
        </h4>
        {children}
    </div>
);

const DetailItem = ({ label, value }: any) => (
    <div className="flex flex-col gap-1 border-b border-slate-50 pb-3">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
        <span className="text-sm font-bold text-slate-700">{value||"—"}</span>
    </div>
);

const InputField = ({ label, name, value, onChange, type="text", error="", compulsory=false }: any) => (
    <div className="flex flex-col gap-1.5 w-full">
        <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest ml-1">
            {label} {compulsory && <span className="text-red-500">*</span>}
        </label>
        <input type={type} name={name} value={value||""} onChange={onChange}
            className={`w-full px-5 py-3.5 bg-slate-50 border ${error?"border-red-500":"border-slate-200 focus:border-blue-500"} rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 font-bold text-slate-900 transition-all`}
        />
        {error && <span className="text-red-500 text-[9px] font-black uppercase mt-1">{error}</span>}
    </div>
);

const SelectField = ({ label, name, value, options, onChange, error="", compulsory=false }: any) => (
    <div className="flex flex-col gap-1.5 w-full">
        <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest ml-1">
            {label} {compulsory && <span className="text-red-500">*</span>}
        </label>
        <select name={name} value={value||""} onChange={onChange}
            className={`w-full px-5 py-3.5 bg-slate-50 border ${error?"border-red-500":"border-slate-200 focus:border-blue-500"} rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 font-bold text-slate-900 transition-all`}>
            {options.map((o: string) => <option key={o} value={o}>{o||"Select..."}</option>)}
        </select>
        {error && <span className="text-red-500 text-[9px] font-black uppercase mt-1">{error}</span>}
    </div>
);

const TextAreaField = ({ label, name, value, onChange, error="", compulsory=false }: any) => (
    <div className="flex flex-col gap-1.5 w-full">
        <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest ml-1">
            {label} {compulsory && <span className="text-red-500">*</span>}
        </label>
        <textarea name={name} value={value||""} onChange={onChange} rows={3}
            className={`w-full p-5 bg-slate-50 border ${error?"border-red-500":"border-slate-200 focus:border-blue-500"} rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 font-bold text-slate-900 transition-all`}
        />
        {error && <span className="text-red-500 text-[9px] font-black uppercase mt-1">{error}</span>}
    </div>
);
