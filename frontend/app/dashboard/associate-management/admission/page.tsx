"use client";
import ValidatedFileInput from '@/components/ValidatedFileInput';

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    User, GraduationCap, Target, Briefcase,
    Users, Send, ChevronRight, ChevronLeft, CheckCircle2,
    Database, Award, Sparkles, BookOpen,
    Smartphone, FileText, CreditCard, ShieldCheck,
    Search, List, PlusCircle, Upload, AlertTriangle, Eye, X, Edit, Trash2,
    Download, Calendar
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import axios from "axios";

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}/api`;

// ── Course options ─────────────────────────────────────────────────────────────
const COURSE_OPTIONS = [
    "", "AC", "HVAC", "Electrical", "Electrician", "Plumbing",
    "Welding", "MEP", "Safety", "Quality", "Oil & Gas", "Home Appliance",
];

const steps = [
    { id: "SEARCH", title: "Find Enquiry",     icon: Search       },
    { id: "A",      title: "Basic Info",        icon: User         },
    { id: "BC",     title: "Contact & Parent",  icon: Users        },
    { id: "DE",     title: "Education & Exp",   icon: GraduationCap},
    { id: "FG",     title: "Course & Goals",    icon: BookOpen     },
    { id: "IJ",     title: "Counselling & Fees",icon: CreditCard   },
    { id: "KLM",    title: "Checklist & Decl.", icon: ShieldCheck  },
    { id: "N",      title: "Office Use",        icon: FileText     },
];

const DeclarationAccordion = ({ label, name, checked, onChange, error="", compulsory=false, children }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className={`border border-slate-200 rounded-2xl bg-slate-50 transition-all ${isOpen ? 'shadow-md border-blue-300' : 'hover:border-blue-200'}`}>
            <div className="flex items-center justify-between p-4 cursor-pointer select-none" onClick={() => setIsOpen(!isOpen)}>
                <div className="flex items-center gap-3">
                    {name && (
                        <input 
                            type="checkbox" 
                            name={name} 
                            checked={checked||false} 
                            onChange={onChange} 
                            onClick={(e) => e.stopPropagation()} 
                            className="w-5 h-5 rounded-lg text-blue-500 border-slate-400 cursor-pointer"
                        />
                    )}
                    <span className="text-[11px] uppercase tracking-widest font-black text-slate-700 leading-tight">
                        {label} {compulsory && <span className="text-red-500">*</span>}
                    </span>
                </div>
                <div className="text-slate-400 hover:text-slate-600 p-1">
                    <ChevronRight size={18} className={`transform transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
                </div>
            </div>
            {isOpen && (
                <div className="px-12 pb-4 pt-1 border-t border-slate-100 text-xs text-slate-600 leading-relaxed space-y-2 max-h-60 overflow-y-auto font-medium">
                    {children}
                </div>
            )}
            {error && <div className="px-12 pb-3 text-[9px] text-red-500 font-black uppercase tracking-wider">{error}</div>}
        </div>
    );
};

const mapQualification = (val: string) => {
    if (!val) return "";
    const lower = val.toLowerCase().trim();
    if (lower.includes("dropout") || lower.includes("school")) return "School Dropout";
    if (lower.includes("10th") || lower.includes("12th") || lower.includes("sslc") || lower.includes("hsc") || lower.includes("matric")) return "10th / 12th";
    if (lower.includes("iti") || lower.includes("diploma") || lower.includes("polytechnic")) return "ITI / Diploma";
    if (lower.includes("degree") || lower.includes("engineering") || lower.includes("bsc") || lower.includes("be") || lower.includes("btech") || lower.includes("bcom") || lower.includes("ba") || lower.includes("bca") || lower.includes("msc") || lower.includes("me") || lower.includes("mba") || lower.includes("post graduate") || lower.includes("graduate")) return "Degree / Engineering";
    
    const standardOptions = ["School Dropout", "10th / 12th", "ITI / Diploma", "Degree / Engineering"];
    const found = standardOptions.find(o => o.toLowerCase() === lower);
    if (found) return found;
    
    return "";
};

// ── Searchable Counsellor Combobox ────────────────────────────────────────────
const CounsellorSearchField = ({
    label, counsellors, value, onSelect, error, compulsory = false,
}: {
    label?: string;
    counsellors: { name: string; code: string; type: string }[];
    value: { name: string; code: string; type: string };
    onSelect: (c: { name: string; code: string; type: string } | null) => void;
    error?: string;
    compulsory?: boolean;
}) => {
    const [query,    setQuery]    = useState("");
    const [open,     setOpen]     = useState(false);
    const ref = React.useRef<HTMLDivElement>(null);

    // Close on outside click
    React.useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const filtered = query.trim()
        ? counsellors.filter(c =>
            c.name.toLowerCase().includes(query.toLowerCase()) ||
            c.code.toLowerCase().includes(query.toLowerCase())
          )
        : counsellors;

    const staffList  = filtered.filter(c => c.type === "Staff");
    const assocList  = filtered.filter(c => c.type === "Associate");

    const displayVal = value.name ? `${value.name}  (${value.code})` : "";

    const handleSelect = (c: { name: string; code: string; type: string }) => {
        onSelect(c);
        setQuery("");
        setOpen(false);
    };

    const handleClear = () => {
        onSelect(null);
        setQuery("");
        setOpen(false);
    };

    return (
        <div className="flex flex-col gap-1" ref={ref}>
            {label && (
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {label} {compulsory && <span className="text-red-500">*</span>}
                </label>
            )}
            <div className="relative">
                {/* Input */}
                <input
                    type="text"
                    autoComplete="off"
                    placeholder={displayVal || "Search by name or code…"}
                    value={open ? query : displayVal}
                    onFocus={() => { setOpen(true); setQuery(""); }}
                    onChange={e => { setQuery(e.target.value); setOpen(true); }}
                    className={`w-full px-3 pr-8 py-2.5 rounded-xl border text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition ${
                        error ? "border-red-400 bg-red-50" : value.name ? "border-blue-300 bg-blue-50" : "border-slate-200"
                    }`}
                />
                {/* Clear / chevron */}
                {value.name ? (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition"
                    ><X size={14}/></button>
                ) : (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <Search size={14}/>
                    </span>
                )}

                {/* Dropdown */}
                {open && (
                    <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-2xl shadow-xl max-h-64 overflow-y-auto">
                        {filtered.length === 0 ? (
                            <p className="px-4 py-3 text-xs text-slate-400 font-semibold">No counsellors found</p>
                        ) : (
                            <>
                                {staffList.length > 0 && (
                                    <div>
                                        <p className="px-3 pt-2 pb-1 text-[10px] font-black uppercase tracking-widest text-purple-500">── Staff ──</p>
                                        {staffList.map(c => (
                                            <button
                                                key={c.code}
                                                type="button"
                                                onClick={() => handleSelect(c)}
                                                className="w-full flex items-center justify-between px-4 py-2 hover:bg-purple-50 transition text-left"
                                            >
                                                <span className="text-sm font-semibold text-slate-800">{c.name}</span>
                                                <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-lg ml-2 shrink-0">{c.code}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {assocList.length > 0 && (
                                    <div className={staffList.length > 0 ? "border-t border-slate-100" : ""}>
                                        <p className="px-3 pt-2 pb-1 text-[10px] font-black uppercase tracking-widest text-green-600">── Associate ──</p>
                                        {assocList.map(c => (
                                            <button
                                                key={c.code}
                                                type="button"
                                                onClick={() => handleSelect(c)}
                                                className="w-full flex items-center justify-between px-4 py-2 hover:bg-green-50 transition text-left"
                                            >
                                                <span className="text-sm font-semibold text-slate-800">{c.name}</span>
                                                <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-lg ml-2 shrink-0">{c.code}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Selected badge */}
            {value.name && !open && (
                <p className="text-xs text-slate-400 font-semibold mt-0.5">
                    Code: <span className="text-blue-600 font-bold">{value.code}</span>
                    <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold ${value.type === "Staff" ? "bg-purple-100 text-purple-700" : "bg-green-100 text-green-700"}`}>
                        {value.type}
                    </span>
                </p>
            )}
            {error && <p className="text-xs text-red-500 font-semibold mt-0.5">{error}</p>}
        </div>
    );
};


export default function StudentAdmissionForm() {
    const [viewMode,          setViewMode]          = useState<"form"|"list">("form");
    const [admissions,        setAdmissions]        = useState<any[]>([]);
    const [isLoadingList,     setIsLoadingList]     = useState(false);
    const [selectedAdmission, setSelectedAdmission] = useState<any>(null);
    const [currentStep,       setCurrentStep]       = useState(0);
    const [isSubmitting,      setIsSubmitting]      = useState(false);
    const [isSuccess,         setIsSuccess]         = useState(false);
    const [searchId,          setSearchId]          = useState("");
    const [isSearching,       setIsSearching]       = useState(false);
    const [errors,            setErrors]            = useState<Record<string,string>>({});
    const { can, user }     = useAuth();
    const [isEditing,         setIsEditing]         = useState(false);
    const [editId,            setEditId]            = useState<number|null>(null);

    const emptyForm = {
        enquiry_id: "", full_name: "", gender: "Male", dob: "", age: "",
        aadhaar_number: "", passport_number: "", passport_validity: "", photo_file: null,
        mobile_number: "", alt_mobile_number: "", whatsapp_number: "", email_id: "",
        residential_address: "", city: "", district: "", state: "", pin_code: "",
        parent_name: "", relationship: "", parent_mobile: "", occupation: "", annual_income: "",
        highest_qualification: "", qualification_course_name: "", year_of_passing: "", institution_name: "",
        board_university: "", medium_of_study: "",
        technical_background: "", total_experience: "", industry_experience: "", skills_known: "",
        course_interested: "", course_level: "Basic", mode_of_training: "Offline",
        batch_preference: "", training_location: "",
        career_goal: "Job in India", preferred_country: "", expected_salary: "", willing_to_relocate: "Yes",
        counsellor_name: "", counsellor_code: "", referral_source: "Career Counsellor",
        counselling_date: "",
        // ── NEW: Enquiry Date ──
        enquiry_date: new Date().toISOString().split("T")[0],
        course_name: "", other_or_miscellaneous: "", course_fees: "0", discount_fee: "0", discount_remark: "", total_fees: "0", paid_fees: "0",
        payment_mode: "Cash", payment_ref_no: "", payment_date: "",
        // ── UPDATED: Installments with separate refs ──
        instalment_1: "0", instalment_1_ref: "",
        instalment_2: "0", instalment_2_ref: "",
        instalment_3: "0", instalment_3_ref: "",
        instalment_4: "0", instalment_4_ref: "",
        instalment_1_mode: "Cash", instalment_1_date: "", instalment_1_ref_only: "",
        instalment_2_mode: "Cash", instalment_2_date: "", instalment_2_ref_only: "",
        instalment_3_mode: "Cash", instalment_3_date: "", instalment_3_ref_only: "",
        instalment_4_mode: "Cash", instalment_4_date: "", instalment_4_ref_only: "",
        balance_amount: "0",
        has_aadhaar_file: null, has_edu_certs_file: null, has_passport_file: null,
        has_resume_file: null, has_address_proof_file: null, has_guardian_id_file: null,
        student_declaration: false, parent_declaration: true, placement_ack: false,
        placement_assistance_required: "",placement_no_reason: "",
        overseas_disclaimer: true, discipline_ack: false, photo_consent: false,
        refund_policy_ack: false, data_privacy_ack: false, final_undertaking: false,
        training_attendance_ack: false, certificate_policy_ack: false,
        document_verification_ack: false, conduct_workshop_ack: false,
        conduct_hostel_ack: false, security_deposit_ack: false,
        general_conditions_ack: false,
        // ── UPDATED: Emergency with relationship ──
        emergency_contact_name: "", emergency_contact_relationship: "", emergency_contact_number: "", emergency_authorized: false,
        // ── NEW: Date of Admission ──
        admission_date: new Date().toISOString().split("T")[0],
        admission_number: "", batch_allotted: "", verified_by: "", authorized_signature_by: ""
    };

    const [formData, setFormData] = useState<any>(emptyForm);
    const [courses, setCourses] = useState<any[]>([]);
    const [counsellors, setCounsellors] = useState<{name:string;code:string;type:string}[]>([]);

    const getAuthHeaders = () => {
        const token = localStorage.getItem("token");
        return { Authorization: `Bearer ${token}` };
    };

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await axios.get(`${API_BASE}/courses`);
                setCourses(res.data || []);
            } catch (err) {
                console.error("Error fetching courses:", err);
            }
        };
        const fetchCounsellors = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(`${API_BASE}/admissions/counsellors`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setCounsellors(res.data || []);
            } catch (err) {
                console.error("Error fetching counsellors:", err);
            }
        };
        fetchCourses();
        fetchCounsellors();
    }, []);

    useEffect(() => {
        if (viewMode === "list") fetchAdmissions();
    }, [viewMode]);

    // ── Re-resolve counsellor when list loads after form is already populated ──
    // Fixes timing: old code "001" → new format "A00001" / "S00001"
    useEffect(() => {
        if (counsellors.length === 0) return;
        if (!formData.counsellor_name) return;

        // Already resolved to new format — skip
        const code = formData.counsellor_code || "";
        const alreadyResolved = /^[AS]\d{5}$/.test(code);
        if (alreadyResolved) return;

        // Try to match by name (most reliable)
        const matched = counsellors.find((c: any) => c.name === formData.counsellor_name)
                     || counsellors.find((c: any) => c.name.toLowerCase() === formData.counsellor_name.toLowerCase());

        if (matched) {
            setFormData((p: any) => ({
                ...p,
                counsellor_name: matched.name,
                counsellor_code: matched.code,
                counsellor_type: matched.type,
            }));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [counsellors]);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const enqId = urlParams.get("enquiry_id");
        if (enqId && viewMode === "form") {
            setSearchId(enqId);
            handleSearch(enqId);
            // Clean up the URL so it doesn't re-trigger on reload
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    useEffect(() => {
        if (user?.role === "Super Admin") return;
        const total   = parseFloat(formData.total_fees)    || 0;
        const inst1   = parseFloat(formData.instalment_1)  || 0;
        const inst2   = parseFloat(formData.instalment_2)  || 0;
        const inst3   = parseFloat(formData.instalment_3)  || 0;
        const inst4   = parseFloat(formData.instalment_4)  || 0;
        const totalPaid = inst1 + inst2 + inst3 + inst4;
        const bal       = total - totalPaid;
        setFormData((prev: any) => {
            if (prev.paid_fees === totalPaid.toString() && prev.balance_amount === bal.toString()) return prev;
            return { ...prev, paid_fees: totalPaid.toString(), balance_amount: bal.toString() };
        });
    }, [formData.total_fees, formData.instalment_1, formData.instalment_2, formData.instalment_3, formData.instalment_4, user]);

    const fetchAdmissions = async () => {
        setIsLoadingList(true);
        try {
            const res = await axios.get(`${API_BASE}/admissions`, { headers: getAuthHeaders() });
            setAdmissions(res.data);
        } catch (err) { console.error(err); }
        finally { setIsLoadingList(false); }
    };

    // ── Excel Export ────────────────────────────────────────────────────────────
    const exportToExcel = (data: any[]) => {
        const headers = [
            "Admission ID","Student Name","Gender","DOB","Age",
            "Mobile","WhatsApp","Email","City","State","Pin Code","Address",
            "Parent Name","Relationship","Parent Mobile","Occupation",
            "Qualification","Year of Passing","Institution",
            "Course Interested","Course Name","Course Level","Mode of Training",
            "Batch Allotted","Career Goal",
            "Counsellor Name","Counsellor Code","Referral Source",
            "Enquiry Date","Admission Date","Counselling Date",
            "Course Fees","Total Fees","Paid Fees",
            "Installment 1","Installment 1 Ref",
            "Installment 2","Installment 2 Ref",
            "Installment 3","Installment 3 Ref",
            "Installment 4","Installment 4 Ref",
            "Balance Amount","Payment Mode","Payment Ref No","Payment Date",
            "Associate Name","Status","Verified Status",
            "Aadhaar Number","Passport Number",
            "Emergency Contact","Emergency Relationship","Emergency Mobile",
        ];
        const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString("en-IN") : "";
        const rows = data.map(adm => [
            adm.admission_number || adm.enquiry_id || "",
            adm.full_name || "",
            adm.gender || "",
            fmtDate(adm.dob),
            adm.age || "",
            adm.mobile_number || "",
            adm.whatsapp_number || "",
            adm.email_id || "",
            adm.city || "",
            adm.state || "",
            adm.pin_code || "",
            adm.residential_address || "",
            adm.parent_name || "",
            adm.relationship || "",
            adm.parent_mobile || "",
            adm.occupation || "",
            adm.highest_qualification || "",
            adm.year_of_passing || "",
            adm.institution_name || "",
            adm.course_interested || "",
            adm.course_name || "",
            adm.course_level || "",
            adm.mode_of_training || "",
            adm.batch_allotted || "",
            adm.career_goal || "",
            adm.counsellor_name || "",
            adm.counsellor_code || "",
            adm.referral_source || "",
            fmtDate(adm.enquiry_date),
            fmtDate(adm.admission_date || adm.created_at),
            fmtDate(adm.counselling_date),
            adm.course_fees || 0,
            adm.total_fees || 0,
            adm.paid_fees || 0,
            adm.instalment_1 || 0,
            adm.instalment_1_ref || "",
            adm.instalment_2 || 0,
            adm.instalment_2_ref || "",
            adm.instalment_3 || 0,
            adm.instalment_3_ref || "",
            adm.instalment_4 || 0,
            adm.instalment_4_ref || "",
            adm.balance_amount || 0,
            adm.payment_mode || "",
            adm.payment_ref_no || "",
            fmtDate(adm.payment_date),
            adm.associate_name || "Admin",
            adm.status || "",
            adm.verified_status || "",
            adm.aadhaar_number || "",
            adm.passport_number || "",
            adm.emergency_contact_name || "",
            adm.emergency_contact_relationship || "",
            adm.emergency_contact_number || "",
        ]);

        const csv = [
            headers.join(","),
            ...rows.map(row => row.map(c => `"${String(c).replace(/"/g,'""')}"`).join(","))
        ].join("\n");

        const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
        const url  = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `admissions_${new Date().toISOString().split("T")[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleSearch = async (idToSearchOverride?: string) => {
        const targetId = typeof idToSearchOverride === "string" ? idToSearchOverride : searchId;
        if (!targetId) return;
        setIsSearching(true);
        try {
            const res  = await axios.get(`${API_BASE}/enquiries/${targetId}`, { headers: getAuthHeaders() });
            const data = res.data;

            // ── Resolve counsellor from the live dropdown list ────────────────────
            // Priority 1: exact name + code match
            // Priority 2: name-only match (handles old/different code formats)
            // Priority 3: keep whatever is in the enquiry record
            const enqCounsellorName = data.counsellor_name || "";
            const enqCounsellorCode = data.counsellor_code || "";

            const matchedByBoth = counsellors.find(
                (c: any) => c.name === enqCounsellorName && c.code === enqCounsellorCode
            );
            const matchedByName = !matchedByBoth && enqCounsellorName
                ? counsellors.find((c: any) => c.name === enqCounsellorName)
                : null;

            const resolvedCounsellor = matchedByBoth || matchedByName;
            const resolvedName  = resolvedCounsellor?.name  || enqCounsellorName;
            const resolvedCode  = resolvedCounsellor?.code  || enqCounsellorCode;
            const resolvedType  = resolvedCounsellor?.type
                || (resolvedCode.startsWith("S") ? "Staff" : resolvedCode.startsWith("A") ? "Associate" : "");

            setFormData((prev: any) => ({
                ...prev,
                enquiry_id:             data.enquiry_id,
                admission_number:       data.enquiry_id,
                full_name:              data.student_name        || "",
                gender:                 data.gender              || "Male",
                dob:                    data.dob                 ? data.dob.split("T")[0]              : "",
                age:                    data.age?.toString()     || "",
                mobile_number:          data.mobile_number       || "",
                whatsapp_number:        data.whatsapp_number     || "",
                email_id:               data.email_id            || "",
                residential_address:    data.perm_address        || "",
                city:                   data.perm_city           || "",
                district:               data.district            || "",
                state:                  data.perm_state          || "",
                pin_code:               data.perm_pin            || "",
                parent_name:            data.father_name || data.mother_name || "",
                relationship:           data.father_name ? "Father" : (data.mother_name ? "Mother" : ""),
                parent_mobile:          data.parent_contact      || "",
                occupation:             data.parent_occupation   || "",
                annual_income:          data.annual_income       || "",
                highest_qualification:  mapQualification(data.highest_qualification || ""),
                qualification_course_name: data.qualification_course_name || "",
                year_of_passing:        data.year_of_passing     || "",
                institution_name:       data.institution_name    || "",
                course_interested:      data.course_interested   || "",
                course_level:           data.level_of_course     || "Basic",
                mode_of_training:       data.training_mode === "Classroom" ? "Offline" : (data.training_mode || "Offline"),
                counsellor_name:        resolvedName,
                counsellor_code:        resolvedCode,
                counsellor_type:        resolvedType,
                referral_source:        data.referred_by         || "Career Counsellor",
                counselling_date:       data.counselling_date    ? data.counselling_date.split("T")[0]  : "",
                enquiry_date:           data.enquiry_date        ? data.enquiry_date.split("T")[0]      : new Date().toISOString().split("T")[0],
            }));
            setCurrentStep(1);
            setErrors({});
        } catch { alert("Enquiry ID not found or access denied."); }
        finally { setIsSearching(false); }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === "checkbox") {
            setFormData((prev: any) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
        } else if (type === "file") {
            setFormData((prev: any) => ({ ...prev, [name]: (e.target as HTMLInputElement).files?.[0] }));
        } else {
            setFormData((prev: any) => {
                const updated = { ...prev, [name]: value };
                if (name === "course_fees" || name === "discount_fee" || name === "paid_fees") {
                    const c = parseFloat(updated.course_fees) || 0;
                    const d = parseFloat(updated.discount_fee) || 0;
                    const p = parseFloat(updated.paid_fees) || 0;
                    updated.total_fees = (c - d).toString();
                    updated.balance_amount = ((c - d) - p).toString();
                }
                return updated;
            });
        }
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    };

    const handleEdit = (adm: any) => {
        if (user?.role === "Associate") { alert("Associates cannot edit admissions."); return; }
        
        const parseRefField = (refField: string, defaultMode: string, defaultDate: string) => {
            if (!refField) return { mode: defaultMode, date: defaultDate, ref: "" };
            const parts = refField.split(" | ");
            if (parts.length === 3) {
                return { mode: parts[0], date: parts[1], ref: parts[2] };
            }
            const colonParts = refField.split(":");
            if (colonParts.length >= 2) {
                const mode = colonParts[0].trim();
                if (["Cash", "UPI", "Card", "Bank Transfer", "Cheque", "DD"].includes(mode)) {
                    return { mode, date: defaultDate, ref: colonParts.slice(1).join(":").trim() || "" };
                }
            }
            if (["Cash", "UPI", "Card", "Bank Transfer", "Cheque", "DD"].includes(refField.trim())) {
                return { mode: refField.trim(), date: defaultDate, ref: "" };
            }
            return { mode: defaultMode, date: defaultDate, ref: refField };
        };

        const inst1Parsed = parseRefField(adm.instalment_1_ref || "", adm.payment_mode || "Cash", adm.payment_date || "");
        const inst2Parsed = parseRefField(adm.instalment_2_ref || "", adm.payment_mode || "Cash", adm.payment_date || "");
        const inst3Parsed = parseRefField(adm.instalment_3_ref || "", adm.payment_mode || "Cash", adm.payment_date || "");
        const inst4Parsed = parseRefField(adm.instalment_4_ref || "", adm.payment_mode || "Cash", adm.payment_date || "");

        // ── Resolve counsellor for dropdown pre-selection ────────────────────────
        // Priority 1: exact name + code match (new format S00001/A00001)
        // Priority 2: name-only match (handles old/different code formats in DB)
        const admCounsellorName = adm.counsellor_name || "";
        const admCounsellorCode = adm.counsellor_code || "";

        const admMatchedByBoth = counsellors.find(
            (c: any) => c.name === admCounsellorName && c.code === admCounsellorCode
        );
        const admMatchedByName = !admMatchedByBoth && admCounsellorName
            ? counsellors.find((c: any) => c.name === admCounsellorName)
            : null;

        const admResolved     = admMatchedByBoth || admMatchedByName;
        const admResolvedName = admResolved?.name || admCounsellorName;
        const admResolvedCode = admResolved?.code || admCounsellorCode;
        const admResolvedType = admResolved?.type
            || adm.counsellor_type
            || (admResolvedCode.startsWith("S") ? "Staff" : admResolvedCode.startsWith("A") ? "Associate" : "");

        setFormData({
            ...emptyForm, ...adm,
            training_attendance_ack: !!adm.discipline_ack,
            certificate_policy_ack: !!adm.discipline_ack,
            document_verification_ack: !!adm.discipline_ack,
            conduct_workshop_ack: !!adm.discipline_ack,
            conduct_hostel_ack: !!adm.discipline_ack,
            security_deposit_ack: !!adm.discipline_ack,
            general_conditions_ack: !!adm.final_undertaking,
            highest_qualification: mapQualification(adm.highest_qualification || ""),
            dob:              adm.dob              ? adm.dob.split("T")[0]              : "",
            passport_validity:adm.passport_validity? adm.passport_validity.split("T")[0]: "",
            counselling_date: adm.counselling_date ? adm.counselling_date.split("T")[0] : "",
            payment_date:     adm.payment_date     ? adm.payment_date.split("T")[0]     : "",
            enquiry_date:     adm.enquiry_date     ? adm.enquiry_date.split("T")[0]     : "",
            admission_date:   adm.admission_date   ? adm.admission_date.split("T")[0]   : "",
            counsellor_name:  admResolvedName,
            counsellor_code:  admResolvedCode,
            counsellor_type:  admResolvedType,

            instalment_1_mode: inst1Parsed.mode,
            instalment_1_date: inst1Parsed.date ? inst1Parsed.date.split("T")[0] : "",
            instalment_1_ref_only: inst1Parsed.ref === "—" ? "" : inst1Parsed.ref,
            
            instalment_2_mode: inst2Parsed.mode,
            instalment_2_date: inst2Parsed.date ? inst2Parsed.date.split("T")[0] : "",
            instalment_2_ref_only: inst2Parsed.ref === "—" ? "" : inst2Parsed.ref,
            
            instalment_3_mode: inst3Parsed.mode,
            instalment_3_date: inst3Parsed.date ? inst3Parsed.date.split("T")[0] : "",
            instalment_3_ref_only: inst3Parsed.ref === "—" ? "" : inst3Parsed.ref,
            
            instalment_4_mode: inst4Parsed.mode,
            instalment_4_date: inst4Parsed.date ? inst4Parsed.date.split("T")[0] : "",
            instalment_4_ref_only: inst4Parsed.ref === "—" ? "" : inst4Parsed.ref,
        });
        setEditId(adm.id);
        setIsEditing(true);
        setSearchId(adm.enquiry_id || "");
        setViewMode("form");
        setCurrentStep(0);
    };

    const handleDelete = async (adm: any) => {
        if (!window.confirm("Move this record to Restore? This record can be restored within 30 days. After 30 days it will be permanently deleted automatically.")) return;
        try {
            await axios.delete(`${API_BASE}/admissions/${adm.id}`, { headers: getAuthHeaders() });
            setAdmissions(prev => prev.filter(a => a.id !== adm.id));
        } catch (err: any) { alert(err.response?.data?.error || "Failed to delete."); }
    };

    const validateStep = (idx: number) => {
        const stepId    = steps[idx].id;
        const newErrors: Record<string,string> = {};
        const phone     = /^\d{10}$/;
        if (stepId === "SEARCH") { if (!formData.enquiry_id) newErrors.enquiry_id = "Required"; }
        if (stepId === "A") {
            if (!formData.full_name)     newErrors.full_name     = "Full Name is compulsory";
            if (!formData.dob)           newErrors.dob           = "Required";
            if (!formData.age)           newErrors.age           = "Required";
            if (!formData.aadhaar_number)newErrors.aadhaar_number= "Aadhaar is compulsory";
            if (!formData.photo_file && !formData.photo_url) newErrors.photo_file = "Photo is compulsory";
        }
        if (stepId === "BC") {
            if (!formData.mobile_number)                      newErrors.mobile_number    = "Required";
            else if (!phone.test(formData.mobile_number))     newErrors.mobile_number    = "Must be 10 digits";
            if (!formData.whatsapp_number)                    newErrors.whatsapp_number  = "Required";
            else if (!phone.test(formData.whatsapp_number))   newErrors.whatsapp_number  = "Must be 10 digits";
            if (!formData.email_id)                           newErrors.email_id         = "Required";
            if (!formData.residential_address)                newErrors.residential_address = "Required";
            if (!formData.city)                               newErrors.city             = "Required";
            if (!formData.district)                           newErrors.district         = "Required";
            if (!formData.state)                              newErrors.state            = "Required";
            if (!formData.pin_code)                           newErrors.pin_code         = "Required";
            if (!formData.parent_name)                        newErrors.parent_name      = "Required";
            if (!formData.relationship)                       newErrors.relationship     = "Required";
            if (!formData.parent_mobile)                      newErrors.parent_mobile    = "Required";
            else if (!phone.test(formData.parent_mobile))     newErrors.parent_mobile    = "Must be 10 digits";
            if (!formData.occupation)                         newErrors.occupation       = "Required";
        }
        if (stepId === "DE") {
            if (!formData.highest_qualification) newErrors.highest_qualification = "Required";
            if (!formData.year_of_passing)       newErrors.year_of_passing       = "Required";
            if (!formData.institution_name)      newErrors.institution_name      = "Required";
            if (!formData.board_university)      newErrors.board_university      = "Required";
            if (!formData.medium_of_study)       newErrors.medium_of_study       = "Required";
        }
        if (stepId === "FG") {
            if (!formData.course_interested) newErrors.course_interested = "Required";
            if (!formData.career_goal)       newErrors.career_goal       = "Required";
        }
        if (stepId === "IJ") {
            if (!formData.counsellor_name)  newErrors.counsellor_name  = "Required";
            if (!formData.counsellor_code)  newErrors.counsellor_code  = "Required";
            if (!formData.counselling_date) newErrors.counselling_date = "Required";
            if (!formData.enquiry_date)     newErrors.enquiry_date     = "Required";
            if (!formData.course_name)      newErrors.course_name      = "Course Name is compulsory";
            if (!formData.payment_date)     newErrors.payment_date     = "Required";
        }
        if (stepId === "KLM") {
            if (!formData.has_aadhaar_file)       newErrors.has_aadhaar_file       = "Required";
            if (!formData.has_edu_certs_file)     newErrors.has_edu_certs_file     = "Required";
            if (!formData.has_resume_file)        newErrors.has_resume_file        = "Required";
            if (!formData.has_address_proof_file) newErrors.has_address_proof_file = "Required";
            if (!formData.has_guardian_id_file)   newErrors.has_guardian_id_file   = "Required";

            if (!formData.student_declaration) newErrors.student_declaration = "Compulsory";
            if (!formData.placement_assistance_required) newErrors.placement_assistance_required = "Please select Yes or No";
            if (formData.placement_assistance_required === "No" && !formData.placement_no_reason) newErrors.placement_no_reason = "Please select a reason";          
            if (!formData.training_attendance_ack)   newErrors.training_attendance_ack   = "Compulsory";
            if (!formData.certificate_policy_ack)    newErrors.certificate_policy_ack    = "Compulsory";
            if (!formData.document_verification_ack) newErrors.document_verification_ack = "Compulsory";
            if (!formData.conduct_workshop_ack)      newErrors.conduct_workshop_ack      = "Compulsory";
            if (!formData.conduct_hostel_ack)        newErrors.conduct_hostel_ack        = "Compulsory";
            if (!formData.security_deposit_ack)      newErrors.security_deposit_ack      = "Compulsory";
            if (!formData.photo_consent)       newErrors.photo_consent       = "Compulsory";
            if (!formData.refund_policy_ack)   newErrors.refund_policy_ack   = "Compulsory";
            if (!formData.data_privacy_ack)    newErrors.data_privacy_ack    = "Compulsory";
            if (!formData.general_conditions_ack) newErrors.general_conditions_ack = "Compulsory";
            if (!formData.final_undertaking)   newErrors.final_undertaking   = "Compulsory";
            if (!formData.emergency_contact_name)   newErrors.emergency_contact_name   = "Required";
            if (!formData.emergency_contact_number) newErrors.emergency_contact_number = "Required";
            else if (!phone.test(formData.emergency_contact_number)) newErrors.emergency_contact_number = "Must be 10 digits";
            if (!formData.emergency_authorized) newErrors.emergency_authorized = "Authorization required";
        }
        if (stepId === "N") {
            if (!formData.admission_number) newErrors.admission_number = "Required";
            if (!formData.batch_allotted)   newErrors.batch_allotted   = "Required";
            if (!formData.verified_by)      newErrors.verified_by      = "Required";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateAllSteps = () => {
        const start = isEditing ? 1 : 0;
        for (let i = start; i < steps.length; i++) {
            if (!validateStep(i)) { setCurrentStep(i); return false; }
        }
        return true;
    };

    const nextStep = () => {
        if (!validateStep(currentStep)) return;
        if (currentStep < steps.length - 1) { setCurrentStep(p => p + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }
    };
    const prevStep = () => {
        if (currentStep > 0) { setCurrentStep(p => p - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (currentStep < steps.length - 1) { nextStep(); return; }
        if (!validateAllSteps()) return;
        setIsSubmitting(true);
        const data = new FormData();
        
        // Compile helper fields into standard instalment ref strings
        const compiledForm = { 
            ...formData,
            discipline_ack: formData.training_attendance_ack && formData.certificate_policy_ack && formData.document_verification_ack && formData.conduct_workshop_ack && formData.conduct_hostel_ack && formData.security_deposit_ack,
            final_undertaking: formData.general_conditions_ack
        };
        if (Number(compiledForm.instalment_1) > 0) {
            compiledForm.instalment_1_ref = `${compiledForm.instalment_1_mode || compiledForm.payment_mode || "Cash"} | ${compiledForm.instalment_1_date || compiledForm.payment_date || new Date().toISOString().split("T")[0]} | ${compiledForm.instalment_1_ref_only || "—"}`;
        }
        if (Number(compiledForm.instalment_2) > 0) {
            compiledForm.instalment_2_ref = `${compiledForm.instalment_2_mode || compiledForm.payment_mode || "Cash"} | ${compiledForm.instalment_2_date || compiledForm.payment_date || new Date().toISOString().split("T")[0]} | ${compiledForm.instalment_2_ref_only || "—"}`;
        }
        if (Number(compiledForm.instalment_3) > 0) {
            compiledForm.instalment_3_ref = `${compiledForm.instalment_3_mode || compiledForm.payment_mode || "Cash"} | ${compiledForm.instalment_3_date || compiledForm.payment_date || new Date().toISOString().split("T")[0]} | ${compiledForm.instalment_3_ref_only || "—"}`;
        }
        if (Number(compiledForm.instalment_4) > 0) {
            compiledForm.instalment_4_ref = `${compiledForm.instalment_4_mode || compiledForm.payment_mode || "Cash"} | ${compiledForm.instalment_4_date || compiledForm.payment_date || new Date().toISOString().split("T")[0]} | ${compiledForm.instalment_4_ref_only || "—"}`;
        }

        Object.keys(compiledForm).forEach(k => { 
            if (compiledForm[k] !== null && compiledForm[k] !== undefined) {
                data.append(k, compiledForm[k]); 
            } 
        });
        try {
            if (isEditing && editId) {
                await axios.patch(`${API_BASE}/admissions/${editId}`, data, { headers: { ...getAuthHeaders(), "Content-Type": "multipart/form-data" } });
            } else {
                await axios.post(`${API_BASE}/admissions`, data, { headers: { ...getAuthHeaders(), "Content-Type": "multipart/form-data" } });
            }
            setIsSuccess(true);
            setTimeout(() => { setIsSuccess(false); window.location.reload(); }, 3000);
        } catch (error: any) {
            alert(error.response?.data?.error || "Error submitting admission.");
        } finally { setIsSubmitting(false); }
    };

    // ── Step content ─────────────────────────────────────────────────────────────
    const renderStepContent = () => {
        switch (steps[currentStep].id) {

            case "SEARCH": return (
                <div className="space-y-6 flex flex-col items-center py-8">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-500"><Search size={40} /></div>
                    <h3 className="text-xl font-bold text-slate-800">Start with Enquiry ID</h3>
                    <p className="text-slate-500 text-center max-w-sm">Enter the student's Enquiry ID to pull existing details.</p>
                    <div className="w-full max-w-md flex flex-col gap-4 mt-4">
                        <input type="text" placeholder="Enter Enquiry ID" value={searchId}
                            onChange={e => setSearchId(e.target.value)}
                            className="w-full px-6 py-4 bg-white border border-slate-300 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 font-black text-xl text-center tracking-widest text-[#0b1f3a]"
                        />
                        {errors.enquiry_id && <span className="text-red-500 text-sm font-bold">{errors.enquiry_id}</span>}
                        <button type="button" onClick={() => handleSearch()} disabled={isSearching || !searchId}
                            className="w-full py-4 bg-blue-500 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                            {isSearching ? "Searching..." : "Fetch Details"}
                        </button>
                    </div>
                </div>
            );

            case "A": return (
                <div className="space-y-6">
                    <InputField label="1. Full Name (As per Certificates)" name="full_name" value={formData.full_name} onChange={handleChange} error={errors.full_name} compulsory />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SelectField label="2. Gender" name="gender" value={formData.gender} options={["Male","Female","Other"]} onChange={handleChange} compulsory />
                        <InputField label="3. Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleChange} compulsory />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="4. Age" name="age" type="number" value={formData.age} onChange={handleChange} compulsory />
                        <InputField label="5. Aadhaar Number" name="aadhaar_number" value={formData.aadhaar_number} onChange={handleChange} compulsory />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="6. Passport Number (If Available)" name="passport_number" value={formData.passport_number} onChange={handleChange} />
                        <InputField label="7. Passport Validity" name="passport_validity" type="date" value={formData.passport_validity} onChange={handleChange} />
                    </div>
                    <FileField fileType="image" label="8. Recent Passport Size Photo" name="photo_file" value={formData.photo_file || formData.photo_url} onChange={handleChange} error={errors.photo_file} compulsory />
                </div>
            );

            case "BC": return (
                <div className="space-y-6">
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 shadow-sm">
                        <h4 className="font-black text-slate-800 mb-4 flex items-center gap-2 uppercase tracking-wider text-sm"><Smartphone className="text-blue-500" size={18}/> Contact Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <InputField label="9. Mobile Number"   name="mobile_number"     value={formData.mobile_number}     onChange={handleChange} error={errors.mobile_number}    compulsory />
                            <InputField label="10. Alternate Mobile" name="alt_mobile_number" value={formData.alt_mobile_number} onChange={handleChange} />
                            <InputField label="11. WhatsApp Number" name="whatsapp_number"   value={formData.whatsapp_number}   onChange={handleChange} error={errors.whatsapp_number}  compulsory />
                        </div>
                        <div className="mt-4">
                            <InputField label="12. Email ID" name="email_id" type="email" value={formData.email_id} onChange={handleChange} error={errors.email_id} compulsory />
                        </div>
                        <div className="mt-4">
                            <TextAreaField label="13. Full Residential Address" name="residential_address" value={formData.residential_address} onChange={handleChange} error={errors.residential_address} compulsory />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                            <InputField label="14. City/Village / Town" name="city"     value={formData.city}     onChange={handleChange} error={errors.city}     compulsory />
                            <InputField label="15. District"        name="district" value={formData.district} onChange={handleChange} error={errors.district} compulsory />
                            <InputField label="16. State"           name="state"    value={formData.state}    onChange={handleChange} error={errors.state}    compulsory />
                            <InputField label="17. PIN Code"        name="pin_code" value={formData.pin_code} onChange={handleChange} error={errors.pin_code} compulsory />
                        </div>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 shadow-sm">
                        <h4 className="font-black text-slate-800 mb-4 flex items-center gap-2 uppercase tracking-wider text-sm"><Users className="text-blue-500" size={18}/> Parent / Guardian Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="17. Parent / Guardian Name" name="parent_name"   value={formData.parent_name}   onChange={handleChange} error={errors.parent_name}   compulsory />
                            <InputField label="18. Relationship"           name="relationship"  value={formData.relationship}  onChange={handleChange} error={errors.relationship}  compulsory />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <InputField label="19. Parent Mobile" name="parent_mobile" value={formData.parent_mobile} onChange={handleChange} error={errors.parent_mobile} compulsory />
                            <InputField label="20. Occupation"    name="occupation"    value={formData.occupation}    onChange={handleChange} error={errors.occupation}    compulsory />
                        </div>
                        <div className="mt-4">
                            <InputField label="21. Annual Family Income (Optional)" name="annual_income" value={formData.annual_income} onChange={handleChange} />
                        </div>
                    </div>
                </div>
            );

            case "DE": return (
                <div className="space-y-6">
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                        <h4 className="font-black text-slate-800 mb-4 flex items-center gap-2 uppercase tracking-wider text-sm"><GraduationCap className="text-blue-500" size={18}/> Education Details</h4>
                        <SelectField label="22. Highest Qualification" name="highest_qualification" value={formData.highest_qualification}
                            options={["", "School Dropout", "10th / 12th", "ITI / Diploma", "Degree / Engineering"]} onChange={handleChange} compulsory error={errors.highest_qualification} />
                        {(formData.highest_qualification === "ITI / Diploma" || formData.highest_qualification === "Degree / Engineering") && (
                            <div className="mt-4">
                                <InputField label="Course Name" name="qualification_course_name" value={formData.qualification_course_name} onChange={handleChange} error={errors.qualification_course_name} compulsory />
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <InputField label="23. Year of Passing"  name="year_of_passing"  value={formData.year_of_passing}  onChange={handleChange} compulsory error={errors.year_of_passing}  />
                            <InputField label="24. Institution Name" name="institution_name" value={formData.institution_name} onChange={handleChange} compulsory error={errors.institution_name} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <InputField label="25. Board / University" name="board_university"  value={formData.board_university}  onChange={handleChange} compulsory error={errors.board_university}  />
                            <InputField label="26. Medium of Study"    name="medium_of_study"   value={formData.medium_of_study}   onChange={handleChange} compulsory error={errors.medium_of_study}   />
                        </div>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                        <h4 className="font-black text-slate-800 mb-4 flex items-center gap-2 uppercase tracking-wider text-sm"><Briefcase className="text-blue-500" size={18}/> Skill & Experience</h4>
                        <TextAreaField label="27. Technical Background (if any)" name="technical_background" value={formData.technical_background} onChange={handleChange} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <InputField label="28. Work Experience" name="total_experience"    value={formData.total_experience}    onChange={handleChange} />
                            <InputField label="29. Industry Experience" name="industry_experience" value={formData.industry_experience} onChange={handleChange} />
                        </div>
                        <div className="mt-4">
                            <TextAreaField label="30. Skills Already Known" name="skills_known" value={formData.skills_known} onChange={handleChange} />
                        </div>
                    </div>
                </div>
            );

            case "FG": return (
                <div className="space-y-6">
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                        <h4 className="font-black text-slate-800 mb-4 flex items-center gap-2 uppercase tracking-wider text-sm"><BookOpen className="text-blue-500" size={18}/> Course Selection</h4>
                        {/* ── Course Interested → DROPDOWN ── */}
                        <SelectField label="31. Course Interested In" name="course_interested" value={formData.course_interested}
                            options={
                                COURSE_OPTIONS.includes(formData.course_interested)
                                ? COURSE_OPTIONS
                                : [...COURSE_OPTIONS, formData.course_interested]
                            }
                            onChange={handleChange} compulsory error={errors.course_interested} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <SelectField label="32. Course Level" name="course_level" value={formData.course_level}
                                options={["Basic","Diploma","Advanced","International"]} onChange={handleChange} compulsory />
                            {/* ── Mode of Training → Online / Offline ── */}
                            <SelectField label="33. Mode of Training" name="mode_of_training" value={formData.mode_of_training}
                                options={["Online","Offline"]} onChange={handleChange} compulsory />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <InputField label="34. Batch Preference"  name="batch_preference"  value={formData.batch_preference}  onChange={handleChange} />
                            <InputField label="35. Training Location" name="training_location" value={formData.training_location} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                        <h4 className="font-black text-slate-800 mb-4 flex items-center gap-2 uppercase tracking-wider text-sm"><Target className="text-blue-500" size={18}/> Career Goal</h4>
                        <SelectField label="36. Career Goal" name="career_goal" value={formData.career_goal}
                            options={["Job in India","Overseas Job","Self-Employment / Entrepreneurship"]} onChange={handleChange} compulsory />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <InputField label="37. Preferred Country (if overseas)" name="preferred_country" value={formData.preferred_country} onChange={handleChange} />
                            <InputField label="38. Expected Salary Range"           name="expected_salary"   value={formData.expected_salary}   onChange={handleChange} />
                        </div>
                        <div className="mt-4">
                            <SelectField label="39. Willing to Relocate?" name="willing_to_relocate" value={formData.willing_to_relocate} options={["Yes","No"]} onChange={handleChange} compulsory />
                        </div>
                    </div>
                </div>
            );

            case "IJ": return (
                <div className="space-y-6">
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                        <h4 className="font-black text-slate-800 mb-4 flex items-center gap-2 uppercase tracking-wider text-sm"><Sparkles className="text-blue-500" size={18}/> Counsellor & Referral</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <CounsellorSearchField
                                label="43. Counsellor Name & Code"
                                compulsory
                                counsellors={counsellors}
                                value={{ name: formData.counsellor_name || "", code: formData.counsellor_code || "", type: formData.counsellor_type || "" }}
                                onSelect={c => {
                                    if (!c) {
                                        setFormData((p: any) => ({ ...p, counsellor_name: "", counsellor_code: "", counsellor_type: "" }));
                                    } else {
                                        setFormData((p: any) => ({ ...p, counsellor_name: c.name, counsellor_code: c.code, counsellor_type: c.type }));
                                    }
                                    if (errors.counsellor_name) setErrors((p: any) => ({ ...p, counsellor_name: "" }));
                                }}
                                error={errors.counsellor_name}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <SelectField label="45. Referral Source" name="referral_source" value={formData.referral_source}
                                options={["Career Counsellor", "Social Media", "Website", "NTSC", "Student Referral", "Staff Referral", "HR Consultant", "Just Dial"]} onChange={handleChange} compulsory />
                            <InputField label="46. Date of Counselling" name="counselling_date" type="date" value={formData.counselling_date} onChange={handleChange} compulsory error={errors.counselling_date} />
                        </div>
                    </div>

                    <div className="p-6 bg-blue-50 rounded-2xl border border-blue-200">
                        <h4 className="font-black text-blue-800 mb-4 flex items-center gap-2 uppercase tracking-wider text-sm"><CreditCard className="text-blue-500" size={18}/> Course Fee & Payment</h4>

                        {/* ── 47. Enquiry Date ── NEW ── */}
                        <div className="mb-4">
                            <InputField label="47. Enquiry Date" name="enquiry_date" type="date" value={formData.enquiry_date} onChange={handleChange} compulsory error={errors.enquiry_date} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <AutoCompleteField
                                label="48. Course Name"
                                name="course_name"
                                value={formData.course_name}
                                options={(() => {
                                    const apiTitles = courses.map((c: any) => c.title).filter(Boolean);
                                    const allOptions = Array.from(new Set(apiTitles));
                                    if (formData.course_name && !allOptions.includes(formData.course_name)) {
                                        allOptions.push(formData.course_name);
                                    }
                                    return allOptions;
                                })()}
                                onChange={handleChange}
                                compulsory
                                error={errors.course_name}
                                placeholder="Type to filter courses..."
                            />
                            <InputField label="Other or Miscellaneous (Short Term Details)" name="other_or_miscellaneous" value={formData.other_or_miscellaneous} onChange={handleChange} placeholder="Enter short term course details..." />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <InputField label="49. Course Fees *" name="course_fees" type="number" value={formData.course_fees} onChange={handleChange} compulsory />
                            <InputField label="Discount Fee" name="discount_fee" type="number" value={formData.discount_fee} onChange={handleChange} />
                        </div>
                        {parseFloat(formData.discount_fee || 0) > 0 && (
                            <div className="mt-4">
                                <InputField label="Discount Remark *" name="discount_remark" value={formData.discount_remark} onChange={handleChange} compulsory={parseFloat(formData.discount_fee || 0) > 0} error={errors.discount_remark} />
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <InputField label="50. Total Fees (Auto) *" name="total_fees" type="number" value={formData.total_fees} readOnly={true} />
                            <InputField label="Balance Fee (Auto)" name="balance_amount" type="number" value={formData.balance_amount} readOnly={true} />
                        </div>
                        <div className="mt-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl flex justify-between items-center">
                            <span className="text-emerald-700 font-bold text-xs uppercase tracking-widest">51. Paid Fees (Auto)</span>
                            <span className="text-emerald-700 text-xl font-black">₹{parseFloat(formData.paid_fees||0).toLocaleString("en-IN")}</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <SelectField label="52. Payment Mode" name="payment_mode" value={formData.payment_mode}
                                options={["Cash","UPI","Bank Transfer","Cheque","DD","Card"]} onChange={handleChange} compulsory />
                            <InputField label="53. Payment Reference No." name="payment_ref_no" value={formData.payment_ref_no} onChange={handleChange} />
                        </div>
                        <div className="mt-4">
                            <InputField label="54. Payment Date" name="payment_date" type="date" value={formData.payment_date} onChange={handleChange} compulsory error={errors.payment_date} />
                        </div>

                        {/* ── Installments with Payment Reference ── UPDATED ── */}
                        <div className="mt-6 pt-6 border-t border-blue-200">
                            <h5 className="font-bold text-blue-800 mb-4 text-xs uppercase tracking-widest">Installments</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Installment 1 */}
                                <div className="p-4 bg-white rounded-2xl border border-blue-100 space-y-3">
                                    <p className="text-[11px] font-black uppercase tracking-widest text-blue-700">55. Installment - 1</p>
                                    <InputField label="Amount"           name="instalment_1"     type="number" value={formData.instalment_1}     onChange={handleChange} />
                                    <SelectField label="Payment Mode" name="instalment_1_mode" value={formData.instalment_1_mode || "Cash"} options={["Cash", "UPI", "Bank Transfer", "Cheque", "DD", "Card"]} onChange={handleChange} />
                                    <InputField label="Payment Date" name="instalment_1_date" type="date" value={formData.instalment_1_date} onChange={handleChange} />
                                    <InputField label="Payment Reference" name="instalment_1_ref_only"             value={formData.instalment_1_ref_only} onChange={handleChange} placeholder="UTR / Ref No" />
                                </div>
                                {/* Installment 2 */}
                                <div className="p-4 bg-white rounded-2xl border border-blue-100 space-y-3">
                                    <p className="text-[11px] font-black uppercase tracking-widest text-blue-700">56. Installment - 2</p>
                                    <InputField label="Amount"           name="instalment_2"     type="number" value={formData.instalment_2}     onChange={handleChange} />
                                    <SelectField label="Payment Mode" name="instalment_2_mode" value={formData.instalment_2_mode || "Cash"} options={["Cash", "UPI", "Bank Transfer", "Cheque", "DD", "Card"]} onChange={handleChange} />
                                    <InputField label="Payment Date" name="instalment_2_date" type="date" value={formData.instalment_2_date} onChange={handleChange} />
                                    <InputField label="Payment Reference" name="instalment_2_ref_only"             value={formData.instalment_2_ref_only} onChange={handleChange} placeholder="UTR / Ref No" />
                                </div>
                                {/* Installment 3 */}
                                <div className="p-4 bg-white rounded-2xl border border-blue-100 space-y-3">
                                    <p className="text-[11px] font-black uppercase tracking-widest text-blue-700">57. Installment - 3</p>
                                    <InputField label="Amount"           name="instalment_3"     type="number" value={formData.instalment_3}     onChange={handleChange} />
                                    <SelectField label="Payment Mode" name="instalment_3_mode" value={formData.instalment_3_mode || "Cash"} options={["Cash", "UPI", "Bank Transfer", "Cheque", "DD", "Card"]} onChange={handleChange} />
                                    <InputField label="Payment Date" name="instalment_3_date" type="date" value={formData.instalment_3_date} onChange={handleChange} />
                                    <InputField label="Payment Reference" name="instalment_3_ref_only"             value={formData.instalment_3_ref_only} onChange={handleChange} placeholder="UTR / Ref No" />
                                </div>
                                {/* Installment 4 */}
                                <div className="p-4 bg-white rounded-2xl border border-blue-100 space-y-3">
                                    <p className="text-[11px] font-black uppercase tracking-widest text-blue-700">58. Installment - 4</p>
                                    <InputField label="Amount"           name="instalment_4"     type="number" value={formData.instalment_4}     onChange={handleChange} />
                                    <SelectField label="Payment Mode" name="instalment_4_mode" value={formData.instalment_4_mode || "Cash"} options={["Cash", "UPI", "Bank Transfer", "Cheque", "DD", "Card"]} onChange={handleChange} />
                                    <InputField label="Payment Date" name="instalment_4_date" type="date" value={formData.instalment_4_date} onChange={handleChange} />
                                    <InputField label="Payment Reference" name="instalment_4_ref_only"             value={formData.instalment_4_ref_only} onChange={handleChange} placeholder="UTR / Ref No" />
                                </div>
                            </div>


                            <p className="text-xs font-bold mt-2 flex items-center gap-1.5" style={{ color: "#1e3a8a" }}><AlertTriangle size={14} style={{ color: "#2563eb" }}/> Auto-points (10%) added once balance is 0.</p>
                        </div>
                    </div>
                </div>
            );

            case "KLM": return (
                <div className="space-y-6">
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                        <h4 className="font-black text-slate-800 mb-4 flex items-center gap-2 uppercase tracking-wider text-sm"><FileText className="text-blue-500" size={18}/> K. Documents Checklist</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FileField fileType="pdf" label="Aadhaar Card"              name="has_aadhaar_file"       value={formData.has_aadhaar_file}       onChange={handleChange} compulsory error={errors.has_aadhaar_file} />
                            <FileField fileType="pdf" label="Educational Certificates"  name="has_edu_certs_file"     value={formData.has_edu_certs_file}     onChange={handleChange} compulsory error={errors.has_edu_certs_file} />
                            <FileField fileType="pdf" label="Passport (If Available)"   name="has_passport_file"      value={formData.has_passport_file}      onChange={handleChange} />
                            <FileField fileType="pdf" label="Resume / Bio-data"         name="has_resume_file"        value={formData.has_resume_file}        onChange={handleChange} compulsory error={errors.has_resume_file} />
                            <FileField fileType="pdf" label="Address Proof"             name="has_address_proof_file" value={formData.has_address_proof_file} onChange={handleChange} compulsory error={errors.has_address_proof_file} />
                            <FileField fileType="pdf" label="Guardian / Parent ID"      name="has_guardian_id_file"  value={formData.has_guardian_id_file}  onChange={handleChange} compulsory error={errors.has_guardian_id_file} />
                        </div>
                    </div>


                    <div className="space-y-4">
                        <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs flex items-center gap-2"><ShieldCheck className="text-blue-500" size={16}/> STUDENT DECLARATION & DISCLAIMER</h4>
                        <div className="space-y-3">
                            <DeclarationAccordion label="STUDENT DECLARATION" name="student_declaration" checked={formData.student_declaration} onChange={handleChange} compulsory error={errors.student_declaration}>
                                <p>I hereby declare that I have voluntarily enrolled in the above-mentioned course at Niile Technical Skill and Consulting (NTSC). I have read, understood, and agree to abide by the following terms and conditions:</p>
                            </DeclarationAccordion>

                            <DeclarationAccordion label="FEES & REFUND POLICY" name="refund_policy_ack" checked={formData.refund_policy_ack} onChange={handleChange} compulsory error={errors.refund_policy_ack}>
                                <ol className="list-decimal pl-4 space-y-1">
                                    <li>All admission, registration, examination, and course fees paid to the institute are non-refundable and non-transferable.</li>
                                    <li>Students discontinuing the course after admission shall not be entitled to any refund.</li>
                                    <li>Any refund, if approved, shall be solely at the discretion of the management.</li>
                                    <li>Fees paid for Theory and Practical’s study Soft Copy materials, examinations, or certifications are non-refundable.</li>
                                </ol>
                            </DeclarationAccordion>

                            <DeclarationAccordion label="TRAINING & ATTENDANCE" name="training_attendance_ack" checked={formData.training_attendance_ack} onChange={handleChange} compulsory error={errors.training_attendance_ack}>
                                <ol className="list-decimal pl-4 space-y-1">
                                    <li>Students must maintain a minimum attendance of 80%.</li>
                                    <li>Practical training and assessments are compulsory.</li>
                                    <li>Students shall follow all workshop, laboratory, hostel, and safety regulations.</li>
                                    <li>Misconduct, indiscipline, harassment, violence, intoxication, or damage to institute property may result in suspension or cancellation of admission without fee refund.</li>
                                </ol>
                            </DeclarationAccordion>

                            <DeclarationAccordion label="CERTIFICATE POLICY" name="certificate_policy_ack" checked={formData.certificate_policy_ack} onChange={handleChange} compulsory error={errors.certificate_policy_ack}>
                                <ol className="list-decimal pl-4 space-y-1">
                                    <li>Certificates will be issued only after successful completion of the course.</li>
                                    <li>Students must complete attendance requirements, practical training, assessments, and fee payments before certificate issuance.</li>
                                    <li>Students leaving the course before completion shall not be eligible for course completion certificates.</li>
                                    <li>The institute reserves the right to withhold certificates in case of pending dues or disciplinary issues.</li>
                                </ol>
                            </DeclarationAccordion>

                            <DeclarationAccordion label="PLACEMENT ASSISTANCE" name="placement_ack" checked={formData.placement_ack} onChange={handleChange}>
                                <ol className="list-decimal pl-4 space-y-1">
                                    <li>The institute provides placement assistance only and does not guarantee employment.</li>
                                    <li>Job selection depends on student performance, skills, attendance, employer requirements, interview performance, and market conditions.</li>
                                    <li>Salary, location, designation, accommodation, and employment terms are decided solely by the recruiting company.</li>
                                    <li>The institute shall not be held responsible if a student is not selected by an employer.</li>
                                    <li>Students must attend interviews arranged by the institute when called.</li>
                                </ol>
                                {/* ── NEW: Placement Assistance Required Yes/No ── */}
                                <div className="mt-4 pt-4 border-t border-slate-200">
                                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-700 mb-2">
                                        Do you require Placement Assistance from NTSC? <span className="text-red-500">*</span>
                                    </p>
                                    <div className="flex gap-6">
                                        {["Yes", "No"].map(opt => (
                                            <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="placement_assistance_required"
                                                    value={opt}
                                                    checked={formData.placement_assistance_required === opt}
                                                    onChange={handleChange}
                                                    className="w-4 h-4 text-blue-500 border-slate-400 cursor-pointer"
                                                />
                                                <span className="text-xs font-bold text-slate-600">{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                    {errors.placement_assistance_required && (
                                        <p className="text-[9px] text-red-500 font-black uppercase tracking-wider mt-1">
                                            {errors.placement_assistance_required}
                                        </p>
                                    )}
                                </div>

                                {/* ── NEW: If No, reason options ── */}
                                {formData.placement_assistance_required === "No" && (
                                    <div className="mt-4 pt-4 border-t border-slate-200">
                                        <p className="text-[11px] font-black uppercase tracking-widest text-slate-700 mb-2">
                                            Please select one option: <span className="text-red-500">*</span>
                                        </p>
                                        <div className="flex flex-col gap-2">
                                            {[
                                                "I will search for a job on my own",
                                                "I am not interested in placement assistance",
                                                "I plan to start / continue my own business",
                                            ].map(opt => (
                                                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="placement_no_reason"
                                                        value={opt}
                                                        checked={formData.placement_no_reason === opt}
                                                        onChange={handleChange}
                                                        className="w-4 h-4 text-blue-500 border-slate-400 cursor-pointer"
                                                    />
                                                    <span className="text-xs font-bold text-slate-600">{opt}</span>
                                                </label>
                                            ))}
                                        </div>
                                        {errors.placement_no_reason && (
                                            <p className="text-[9px] text-red-500 font-black uppercase tracking-wider mt-1">
                                                {errors.placement_no_reason}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </DeclarationAccordion>

                            <DeclarationAccordion label="DOCUMENT VERIFICATION" name="document_verification_ack" checked={formData.document_verification_ack} onChange={handleChange} compulsory error={errors.document_verification_ack}>
                                <ol className="list-decimal pl-4 space-y-1">
                                    <li>All documents submitted by me are genuine and valid.</li>
                                    <li>Submission of false, forged, or misleading documents may result in cancellation of admission, cancellation of certification, and legal action.</li>
                                </ol>
                            </DeclarationAccordion>

                            <DeclarationAccordion label="Code of Conduct Training & Workshop" name="conduct_workshop_ack" checked={formData.conduct_workshop_ack} onChange={handleChange} compulsory error={errors.conduct_workshop_ack}>
                                <p className="mb-2">I agree to maintain professional behaviour and discipline throughout the training and workshop sessions conducted by NTSC. I understand and agree that I will:</p>
                                <ul className="list-disc pl-4 space-y-1 mb-2">
                                    <li>Attend all training sessions punctually.</li>
                                    <li>Follow the instructions of trainers and NTSC staff.</li>
                                    <li>Wear appropriate attire and Personal Protective Equipment (PPE) during practical sessions.</li>
                                    <li>Handle tools, machines, instruments, and training equipment safely and responsibly.</li>
                                    <li>Respect fellow trainees, trainers, staff, and visitors.</li>
                                    <li>Refrain from using abusive language, discrimination, harassment, or disruptive behavior.</li>
                                    <li>Keep classrooms, laboratories, and workshop areas clean and organized.</li>
                                    <li>Not use mobile phones during training sessions unless permitted by the trainer.</li>
                                    <li>Not consume alcohol, tobacco, narcotics, or any prohibited substances within the training premises.</li>
                                    <li>Immediately report any unsafe conditions, accidents, or damage to equipment.</li>
                                </ul>
                                <p>I understand that failure to comply with the above rules may result in disciplinary action, suspension, or termination from the training program.</p>
                            </DeclarationAccordion>

                            <DeclarationAccordion label="Code of Conduct Hostel" name="conduct_hostel_ack" checked={formData.conduct_hostel_ack} onChange={handleChange} compulsory error={errors.conduct_hostel_ack}>
                                <p className="mb-2">I understand that staying in the hostel is a privilege and agree to abide by the hostel rules and regulations. I agree to:</p>
                                <ul className="list-disc pl-4 space-y-1 mb-2">
                                    <li>Maintain discipline and respect hostel staff and fellow residents.</li>
                                    <li>Keep my room and common areas clean and hygienic.</li>
                                    <li>Avoid damaging hostel property. Any damages caused by negligence may be recovered from me.</li>
                                    <li>Follow the hostel timings and visitor policies.</li>
                                    <li>Maintain peace and avoid causing inconvenience to other residents.</li>
                                    <li>Not possess or consume alcohol, tobacco, drugs, or other prohibited substances.</li>
                                    <li>Follow all safety and emergency procedures.</li>
                                    <li>Inform the hostel warden before leaving the hostel for any extended period.</li>
                                </ul>
                                <p>I understand that violation of hostel rules may lead to disciplinary action, including cancellation of hostel accommodation.</p>
                            </DeclarationAccordion>

                            <DeclarationAccordion label="Security Deposit (Caution Deposit)" name="security_deposit_ack" checked={formData.security_deposit_ack} onChange={handleChange} compulsory error={errors.security_deposit_ack}>
                                <ol className="list-decimal pl-4 space-y-1">
                                    <li>Every student shall pay a refundable caution deposit of Rs. 1,000 at the time of hostel admission.</li>
                                    <li>The caution deposit will be refunded after the student vacates the hostel, subject to:
                                        <ul className="list-[circle] pl-4 mt-0.5 space-y-0.5">
                                            <li>No damage to hostel property.</li>
                                            <li>Return of any hostel property (if issued).</li>
                                            <li>Compliance with all hostel rules and regulations.</li>
                                        </ul>
                                    </li>
                                    <li>If any damage is caused to the hostel building, furniture, electrical fittings, plumbing fixtures, appliances, equipment, or any other hostel property due to the student's negligence, misuse, or intentional act, the cost of repair or replacement will be deducted from the caution deposit.</li>
                                    <li>If the actual cost of repair or replacement exceeds the caution deposit amount of Rs. 1,000, the student and/or parent/guardian shall pay the balance amount immediately before vacating the hostel or receiving any refund.</li>
                                    <li>The hostel management's assessment of the damage and repair cost shall be final and binding.</li>
                                </ol>
                            </DeclarationAccordion>

                            <DeclarationAccordion label="Data Privacy & Confidentiality" name="data_privacy_ack" checked={formData.data_privacy_ack} onChange={handleChange} compulsory error={errors.data_privacy_ack}>
                                <p className="mb-2">I understand that NTSC will collect and maintain my personal information for admission, training, certification, placement assistance, statutory compliance, and communication purposes.</p>
                                <p className="mb-2">I hereby consent to NTSC collecting, storing, processing, and using my information solely for official purposes.</p>
                                <p className="mb-2">I further agree that:</p>
                                <ul className="list-disc pl-4 space-y-1 mb-2">
                                    <li>I will maintain the confidentiality of all NTSC training materials, assessments, and any confidential information shared during the course.</li>
                                    <li>I will not copy, reproduce, distribute, record, or share NTSC training materials without prior written permission.</li>
                                    <li>I will not disclose confidential information obtained during industrial visits or company-sponsored training programs.</li>
                                </ul>
                                <p>NTSC will make reasonable efforts to protect my personal information and use it only for legitimate educational and administrative purposes.</p>
                            </DeclarationAccordion>

                            <DeclarationAccordion label="Photography & Video Consent" name="photo_consent" checked={formData.photo_consent} onChange={handleChange} compulsory error={errors.photo_consent}>
                                <p className="mb-2">I hereby grant permission to Niile Technical Skill & Consulting Pvt Ltd (NTSC) to capture photographs, audio recordings, and video recordings of me during training programs, workshops, seminars, industrial visits, placement activities, competitions, and other official events.</p>
                                <p className="mb-2">I understand that these photographs and videos may be used by NTSC for:</p>
                                <ul className="list-disc pl-4 space-y-1 mb-2">
                                    <li>Training and educational purposes</li>
                                    <li>Certificates and course documentation</li>
                                    <li>Website and social media platforms</li>
                                    <li>Brochures, newsletters, and promotional materials</li>
                                    <li>Marketing and branding activities</li>
                                    <li>Reports and presentations</li>
                                </ul>
                                <p className="mb-2">I understand that no financial compensation will be provided for the use of these photographs or videos.</p>
                                <p>If I do not wish to be photographed or recorded, I will inform NTSC in writing before the commencement of the training program.</p>
                            </DeclarationAccordion>

                            <DeclarationAccordion label="GENERAL CONDITIONS" name="general_conditions_ack" checked={formData.general_conditions_ack} onChange={handleChange} compulsory error={errors.general_conditions_ack}>
                                <ol className="list-decimal pl-4 space-y-1">
                                    <li>The institute reserves the right to modify batch timings, trainers, syllabus, examination schedules, training locations, or course structure whenever required.</li>
                                    <li>Management decisions regarding admission, training, certification, and placement shall be final and binding.</li>
                                    <li>Any dispute shall be subject to the jurisdiction of Chennai courts only.</li>
                                </ol>
                            </DeclarationAccordion>
                        </div>

                        {/* ── Emergency Contact — UPDATED with Relationship + Date of Admission ── */}
                        <div className="p-6 bg-red-50 rounded-2xl border border-red-100 space-y-4">
                            <h5 className="font-black text-red-900 text-[10px] uppercase tracking-widest">9. Emergency Contact</h5>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <InputField label="Contact Name"     name="emergency_contact_name"         value={formData.emergency_contact_name}         onChange={handleChange} compulsory error={errors.emergency_contact_name} />
                                {/* ── NEW: Relationship ── */}
                                <SelectField label="Relationship"    name="emergency_contact_relationship" value={formData.emergency_contact_relationship} onChange={handleChange}
                                    options={["","Father","Mother","Spouse","Brother","Sister","Relative","Friend","Other"]} />
                                <InputField label="Contact Number"   name="emergency_contact_number"       value={formData.emergency_contact_number}       onChange={handleChange} compulsory error={errors.emergency_contact_number} />
                            </div>
                            {/* ── NEW: Date of Admission ── */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField label="Date of Admission" name="admission_date" type="date" value={formData.admission_date} onChange={handleChange} />
                            </div>
                            <CheckboxField label="Authorize NTSC for Emergency Contact" name="emergency_authorized" checked={formData.emergency_authorized} onChange={handleChange} compulsory error={errors.emergency_authorized} />
                        </div>

                        <div className="p-6 rounded-2xl border border-white/10 shadow-2xl" style={{ backgroundColor: "#0f172a" }}>
                            <h5 className="font-black text-[10px] uppercase tracking-widest mb-4" style={{ color: "#93c5fd" }}>10. Student Undertaking</h5>
                            <CheckboxField label="I confirm that I have read all terms & conditions and voluntarily join NTSC Skill Centre." name="final_undertaking" checked={formData.final_undertaking} onChange={handleChange} compulsory error={errors.final_undertaking} dark />
                        </div>
                    </div>
                </div>
            );

            case "N": return (
                <div className="space-y-6">
                    <div className="p-10 border-4 border-dashed border-slate-200 rounded-[3rem] bg-slate-50 flex flex-col items-center text-center">
                        <h4 className="font-black text-slate-800 mb-6 flex items-center gap-2 uppercase tracking-widest text-lg"><PlusCircle className="text-blue-500" size={24}/> Office Use Only</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
                            <InputField label="Admission Number" name="admission_number" value={formData.admission_number} onChange={handleChange} placeholder="________" readOnly={user?.role !== "Super Admin"} />
                            <InputField label="Batch Allotted"   name="batch_allotted"   value={formData.batch_allotted}   onChange={handleChange} placeholder="________" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl mt-8">
                            <InputField label="Verified By"          name="verified_by"               value={formData.verified_by}               onChange={handleChange} placeholder="Counsellor Name" />
                            <InputField label="Authorized Signature" name="authorized_signature_by"   value={formData.authorized_signature_by}   onChange={handleChange} placeholder="Signatory" />
                        </div>
                    </div>
                </div>
            );

            default: return null;
        }
    };

    // ── List View ────────────────────────────────────────────────────────────────
    const renderListContent = () => (
        <div className="p-8">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <h3 className="text-xl font-black flex items-center gap-2 text-slate-800">
                    <List size={24}/> Recent Admissions
                    <span className="text-sm font-bold text-slate-400">({admissions.length})</span>
                </h3>
                {user?.role === "Admin" && (
                    <button onClick={() => exportToExcel(admissions)} disabled={admissions.length === 0}
                        className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition shadow-lg shadow-emerald-200">
                        <Download size={16}/> Export Excel
                    </button>
                )}
            </div>

            {isLoadingList ? (
                <div className="flex flex-col items-center py-12 gap-4">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"/>
                    <p className="font-bold text-slate-400">Loading admissions...</p>
                </div>
            ) : admissions.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-slate-400">
                    <Database size={48} className="mb-4 opacity-20"/>
                    <p className="font-bold uppercase tracking-widest text-sm">No admissions found.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b-2 border-slate-200">
                                {["Photo","Admission ID","Student Name","Associate","Course","Admission Date","Course Fees","Balance","Actions"].map(h => (
                                    <th key={h} className="py-4 px-4 font-black text-slate-900 uppercase text-xs tracking-wider whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {admissions.map(adm => (
                                <tr key={adm.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                    <td className="py-5 px-4">
                                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center text-[11px] font-black text-slate-500">
                                            {adm.photo_url ? (
                                                <img src={`${process.env.NEXT_PUBLIC_API_URL}/${adm.photo_url?.replace(/\\/g,"/")}`} alt="" className="w-full h-full object-cover"
                                                    onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(adm.full_name||"")}&background=0b1f3a&color=fff`; }}
                                                />
                                            ) : (adm.full_name||"?")[0].toUpperCase()}
                                        </div>
                                    </td>
                                    <td className="py-5 px-4 font-mono text-blue-700 font-black text-sm">{adm.admission_number||adm.enquiry_id}</td>
                                    <td className="py-5 px-4 font-black text-slate-900">{adm.full_name}</td>
                                    <td className="py-5 px-4 text-xs font-bold text-slate-500 uppercase">{adm.associate_name||"Admin"}</td>
                                    <td className="py-5 px-4 text-slate-700 font-bold">{adm.course_name||adm.course_interested}</td>
                                    <td className="py-5 px-4 text-slate-500 text-xs font-bold whitespace-nowrap">
                                        {adm.admission_date||adm.created_at ? new Date(adm.admission_date||adm.created_at).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) : "—"}
                                    </td>
                                    <td className="py-5 px-4 text-right font-black text-slate-700">₹{parseFloat(adm.course_fees||0).toLocaleString("en-IN")}</td>
                                    <td className="py-5 px-4 text-right font-black">
                                        <span className={parseFloat(adm.balance_amount)===0?"text-green-600":"text-red-500"}>
                                            ₹{parseFloat(adm.balance_amount||0).toLocaleString("en-IN")}
                                        </span>
                                    </td>
                                    <td className="py-5 px-4">
                                        <div className="flex gap-2 justify-center">
                                            {user?.role === "Admin" && (
                                                <button onClick={() => setSelectedAdmission(adm)} className="p-2 bg-blue-100 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-all" title="View"><Eye size={18}/></button>
                                            )}
                                            {can("Associate Management","edit") && user?.role !== "Associate" && (
                                                <button onClick={() => handleEdit(adm)} className="p-2 bg-amber-100 text-amber-600 rounded-lg hover:bg-amber-600 hover:text-white transition-all" title="Edit"><Edit size={18}/></button>
                                            )}
                                            {can("Associate Management","delete") && user?.role !== "Associate" && (
                                                <button onClick={() => handleDelete(adm)} className="p-2 bg-red-100 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all" title="Delete"><Trash2 size={18}/></button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto pb-12">
            {/* Toggle */}
            <div className="flex justify-between items-center mb-8 px-4">
                <div className="flex bg-slate-100 p-1 rounded-2xl">
                    <button onClick={() => { setViewMode("form"); setFormData(emptyForm); setCurrentStep(0); setIsEditing(false); setEditId(null); }}
                        style={{ color: viewMode==="form" ? "#ffffff" : "#64748b" }}
                        className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${viewMode==="form"?"bg-slate-900 shadow-xl":"hover:bg-slate-200"}`}>
                        <PlusCircle size={18}/> New Admission
                    </button>
                    <button onClick={() => setViewMode("list")}
                        style={{ color: viewMode==="list" ? "#ffffff" : "#64748b" }}
                        className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${viewMode==="list"?"bg-slate-900 shadow-xl":"hover:bg-slate-200"}`}>
                        <List size={18}/> View List
                    </button>
                </div>
            </div>

            {viewMode === "form" ? (
                <>
                    {/* Step progress bar */}
                    <div className="mb-10 px-4 overflow-x-auto">
                        <div className="flex justify-between items-center min-w-[700px] relative">
                            <div className="absolute top-5 left-0 w-full h-[2px] bg-slate-200 z-0"/>
                            {steps.map((step, idx) => {
                                const Icon = step.icon;
                                return (
                                    <div key={step.id} className="relative z-10 flex flex-col items-center">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                            idx === currentStep ? "bg-blue-500 border-blue-500 text-white shadow-xl scale-110" :
                                            idx < currentStep  ? "bg-green-500 border-green-500 text-white" :
                                            "bg-white border-slate-300 text-slate-300"
                                        }`}>
                                            {idx < currentStep ? <CheckCircle2 size={18}/> : <Icon size={18}/>}
                                        </div>
                                        <span className={`text-[9px] font-black uppercase mt-2 tracking-widest ${idx===currentStep?"text-blue-500":"text-slate-400 opacity-50"}`}>Step {idx+1}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Card */}
                    <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
                        <div className="bg-slate-900 px-8 pt-10 pb-6 text-white relative overflow-hidden">
                            <div className="flex justify-between items-center relative z-10 mb-8">
                                <div>
                                    <h2 className="text-3xl font-black tracking-tight flex items-center gap-3" style={{ color: "#ffffff" }}>
                                        <Award className="text-blue-500"/> {isEditing ? "Edit Admission" : "Student Admission"}
                                    </h2>
                                    <p className="font-bold mt-1 uppercase text-xs tracking-[0.1em]" style={{ color: "#93c5fd" }}>
                                        {isEditing ? "Update: " + (formData.full_name||"") : steps[currentStep].title}
                                    </p>
                                </div>
                                {formData.enquiry_id && (
                                    <div className="bg-white/10 px-6 py-3 rounded-2xl border border-white/20 hidden sm:block">
                                        <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">Ref ID</p>
                                        <p className="font-mono font-black text-lg">{formData.enquiry_id}</p>
                                    </div>
                                )}
                            </div>
                            <div className="relative z-10 flex gap-1 overflow-x-auto pb-2">
                                {steps.map((s, idx) => (
                                    <button key={s.id} type="button"
                                        onClick={() => {
                                            if (user?.role==="Super Admin"||user?.role==="Admin") { setCurrentStep(idx); }
                                            else if (idx > currentStep) { if (validateStep(currentStep)) setCurrentStep(idx); }
                                            else { setCurrentStep(idx); }
                                        }}
                                        style={{ color: currentStep===idx ? "#ffffff" : "rgba(147,197,253,0.5)" }}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap min-w-fit ${
                                            currentStep===idx?"bg-blue-500 shadow-lg":"hover:bg-white/5"
                                        }`}>
                                        <span className="text-[11px] font-black uppercase tracking-widest">{idx+1}. {s.title}</span>
                                    </button>
                                ))}
                            </div>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl z-0"/>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 md:p-12">
                            <AnimatePresence mode="wait">
                                <motion.div key={currentStep} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }} transition={{ duration:0.3 }}>
                                    {renderStepContent()}
                                </motion.div>
                            </AnimatePresence>
                            <div className="mt-12 flex justify-between items-center pt-8 border-t border-slate-100">
                                <button type="button" onClick={prevStep} disabled={currentStep===0}
                                    style={{ color: "#94a3b8" }}
                                    className="flex items-center gap-2 px-6 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-slate-50 disabled:opacity-0 transition-all border border-slate-200">
                                    <ChevronLeft size={16}/> Back
                                </button>
                                <div>
                                    {currentStep < steps.length - 1 ? (
                                        <button type="button" onClick={nextStep}
                                            style={{ color: "#ffffff" }}
                                            className="flex items-center gap-2 px-10 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[11px] bg-slate-900 hover:bg-blue-800 shadow-xl transition-all">
                                            Continue <ChevronRight size={16}/>
                                        </button>
                                    ) : (
                                        <button type="submit" disabled={isSubmitting}
                                            style={{ color: "#ffffff" }}
                                            className="flex items-center gap-2 px-12 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[11px] bg-green-600 hover:bg-green-700 shadow-xl transition-all">
                                            {isSubmitting ? "Finalizing..." : <>{isEditing?"Update":"Finish Admission"} <Send size={16}/></>}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>
                </>
            ) : (
                <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
                    {renderListContent()}
                </div>
            )}

            {/* View Modal */}
            <AnimatePresence>
                {selectedAdmission && (
                    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                        className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-6">
                        <motion.div initial={{ scale:0.9, y:20 }} animate={{ scale:1, y:0 }}
                            className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto relative shadow-2xl">
                            <button onClick={() => setSelectedAdmission(null)}
                                className="absolute top-6 right-6 p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all z-20">
                                <X size={24}/>
                            </button>
                            <div className="p-10">
                                <div className="flex items-center gap-6 mb-10 pb-8 border-b border-slate-100">
                                    <div className="w-20 h-20 bg-slate-900 rounded-[1.5rem] flex items-center justify-center text-white text-3xl font-black">
                                        {(selectedAdmission.full_name||"?")[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-black text-slate-800">{selectedAdmission.full_name}</h3>
                                        <div className="flex gap-3 mt-2 flex-wrap">
                                            <span className="px-3 py-1 bg-blue-50 text-blue-500 rounded-full text-[11px] font-black border border-blue-100">
                                                #{selectedAdmission.admission_number||selectedAdmission.enquiry_id}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-[11px] font-black border ${parseFloat(selectedAdmission.balance_amount)===0?"bg-green-50 text-green-600 border-green-100":"bg-red-50 text-red-600 border-red-100"}`}>
                                                {parseFloat(selectedAdmission.balance_amount)===0?"Fully Paid":`Balance ₹${parseFloat(selectedAdmission.balance_amount).toLocaleString("en-IN")}`}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-10">
                                    <Section title="Personal">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                                            <DetailRow label="Gender"        value={selectedAdmission.gender} />
                                            <DetailRow label="Age"           value={selectedAdmission.age} />
                                            <DetailRow label="DOB"           value={selectedAdmission.dob ? new Date(selectedAdmission.dob).toLocaleDateString("en-IN") : "—"} />
                                            <DetailRow label="Aadhaar"       value={selectedAdmission.aadhaar_number} />
                                            <DetailRow label="Passport"      value={selectedAdmission.passport_number} />
                                            <DetailRow label="Passport Validity" value={selectedAdmission.passport_validity ? new Date(selectedAdmission.passport_validity).toLocaleDateString("en-IN") : "—"} />
                                            <DetailRow label="Admission Date" value={selectedAdmission.admission_date ? new Date(selectedAdmission.admission_date).toLocaleDateString("en-IN") : selectedAdmission.created_at ? new Date(selectedAdmission.created_at).toLocaleDateString("en-IN") : "—"} />
                                            <DetailRow label="Verified By"   value={selectedAdmission.verified_by} />
                                        </div>
                                    </Section>

                                    <Section title="Contact">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                                            <DetailRow label="Mobile"        value={selectedAdmission.mobile_number}  fontMono />
                                            <DetailRow label="Alt Mobile"    value={selectedAdmission.alt_mobile_number} fontMono />
                                            <DetailRow label="WhatsApp"      value={selectedAdmission.whatsapp_number} fontMono />
                                            <DetailRow label="Email"         value={selectedAdmission.email_id} />
                                            <DetailRow label="City"          value={selectedAdmission.city} />
                                            <DetailRow label="State"         value={selectedAdmission.state} />
                                            <DetailRow label="PIN Code"      value={selectedAdmission.pin_code} />
                                            <DetailRow label="Residential Address" value={selectedAdmission.residential_address} className="col-span-full" />
                                        </div>
                                    </Section>

                                    <Section title="Parent / Guardian">
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                                            <DetailRow label="Guardian Name" value={selectedAdmission.parent_name} />
                                            <DetailRow label="Relation"      value={selectedAdmission.relationship} />
                                            <DetailRow label="Mobile"        value={selectedAdmission.parent_mobile} fontMono />
                                            <DetailRow label="Occupation"    value={selectedAdmission.occupation} />
                                            <DetailRow label="Annual Income" value={selectedAdmission.annual_income} />
                                        </div>
                                    </Section>

                                    <Section title="Education">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                                            <DetailRow label="Qualification"    value={selectedAdmission.highest_qualification} />
                                            <DetailRow label="Year of Passing"  value={selectedAdmission.year_of_passing} />
                                            <DetailRow label="Institution Name" value={selectedAdmission.institution_name} className="col-span-2" />
                                            <DetailRow label="Board / University" value={selectedAdmission.board_university} className="col-span-2" />
                                            <DetailRow label="Medium of Study"  value={selectedAdmission.medium_of_study} />
                                        </div>
                                    </Section>

                                    <Section title="Skill & Experience">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                                            <DetailRow label="Total Experience"    value={selectedAdmission.total_experience} />
                                            <DetailRow label="Industry Experience" value={selectedAdmission.industry_experience} />
                                            <DetailRow label="Technical Background" value={selectedAdmission.technical_background} className="col-span-full" />
                                            <DetailRow label="Skills Known"        value={selectedAdmission.skills_known} className="col-span-full" />
                                        </div>
                                    </Section>

                                    <Section title="Course & Career">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                                            <DetailRow label="Course Interested" value={selectedAdmission.course_interested} />
                                            <DetailRow label="Course"       value={selectedAdmission.course_name} bold />
                                            <DetailRow label="Level"        value={selectedAdmission.course_level} />
                                            <DetailRow label="Mode"         value={selectedAdmission.mode_of_training} />
                                            <DetailRow label="Batch Pref"   value={selectedAdmission.batch_preference} />
                                            <DetailRow label="Batch Allotted" value={selectedAdmission.batch_allotted||"Not assigned"} />
                                            <DetailRow label="Training Location" value={selectedAdmission.training_location} />
                                            <DetailRow label="Enquiry Date" value={selectedAdmission.enquiry_date ? new Date(selectedAdmission.enquiry_date).toLocaleDateString("en-IN") : "—"} />
                                            <DetailRow label="Career Goal"  value={selectedAdmission.career_goal} />
                                            <DetailRow label="Preferred Country" value={selectedAdmission.preferred_country} />
                                            <DetailRow label="Expected Salary" value={selectedAdmission.expected_salary} />
                                            <DetailRow label="Willing to Relocate" value={selectedAdmission.willing_to_relocate} />
                                        </div>
                                    </Section>

                                    <Section title="Counsellor & Referral">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                                            <DetailRow label="Counsellor Name" value={selectedAdmission.counsellor_name} />
                                            <DetailRow label="Counsellor Code" value={selectedAdmission.counsellor_code} />
                                            <DetailRow label="Referral Source" value={selectedAdmission.referral_source} />
                                            <DetailRow label="Counselling Date" value={selectedAdmission.counselling_date ? new Date(selectedAdmission.counselling_date).toLocaleDateString("en-IN") : "—"} />
                                        </div>
                                    </Section>

                                    <div className="p-6 bg-slate-900 rounded-2xl text-white">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-300 mb-5">Fee Details</p>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                                            <DetailRow label="Course Fees" value={`₹${parseFloat(selectedAdmission.course_fees||0).toLocaleString("en-IN")}`} light />
                                            <DetailRow label="Total Fees"  value={`₹${parseFloat(selectedAdmission.total_fees||0).toLocaleString("en-IN")}`}  light />
                                            <DetailRow label="Paid"        value={`₹${parseFloat(selectedAdmission.paid_fees||0).toLocaleString("en-IN")}`}   color="text-green-400" />
                                            <DetailRow label="Balance"     value={`₹${parseFloat(selectedAdmission.balance_amount||0).toLocaleString("en-IN")}`} color="text-red-400" bold />
                                            <DetailRow label="Mode"        value={selectedAdmission.payment_mode}  light />
                                            <DetailRow label="Date"        value={selectedAdmission.payment_date ? new Date(selectedAdmission.payment_date).toLocaleDateString("en-IN") : "—"} light />
                                            <DetailRow label="Payment Ref No" value={selectedAdmission.payment_ref_no} light className="col-span-full" />
                                        </div>
                                        {(selectedAdmission.instalment_1 > 0 || selectedAdmission.instalment_2 > 0 || selectedAdmission.instalment_3 > 0 || selectedAdmission.instalment_4 > 0) && (
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-5 pt-5 border-t border-white/10">
                                                <DetailRow label="Installment 1"     value={`₹${parseFloat(selectedAdmission.instalment_1||0).toLocaleString("en-IN")}`} light />
                                                <DetailRow label="Inst 1 Ref"       value={selectedAdmission.instalment_1_ref||"—"} light />
                                                <DetailRow label="Installment 2"     value={`₹${parseFloat(selectedAdmission.instalment_2||0).toLocaleString("en-IN")}`} light />
                                                <DetailRow label="Inst 2 Ref"       value={selectedAdmission.instalment_2_ref||"—"} light />
                                                <DetailRow label="Installment 3"     value={`₹${parseFloat(selectedAdmission.instalment_3||0).toLocaleString("en-IN")}`} light />
                                                <DetailRow label="Inst 3 Ref"       value={selectedAdmission.instalment_3_ref||"—"} light />
                                                <DetailRow label="Installment 4"     value={`₹${parseFloat(selectedAdmission.instalment_4||0).toLocaleString("en-IN")}`} light />
                                                <DetailRow label="Inst 4 Ref"       value={selectedAdmission.instalment_4_ref||"—"} light />
                                            </div>
                                        )}
                                    </div>

                                    <Section title="Emergency Contact">
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-5 p-5 bg-red-50 rounded-2xl border border-red-100">
                                            <DetailRow label="Name"         value={selectedAdmission.emergency_contact_name}         color="text-red-800" />
                                            <DetailRow label="Relationship" value={selectedAdmission.emergency_contact_relationship} color="text-red-800" />
                                            <DetailRow label="Mobile"       value={selectedAdmission.emergency_contact_number}       color="text-red-800" fontMono />
                                            <DetailRow label="Authorized"   value={selectedAdmission.emergency_authorized ? "Yes" : "No"} color="text-red-800" />
                                        </div>
                                    </Section>
                                    
                                    <Section title="Documents Check & Undertakings">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                                            <DetailRow label="Aadhaar File"        value={selectedAdmission.has_aadhaar_file ? <a href={`${process.env.NEXT_PUBLIC_API_URL}/${selectedAdmission.has_aadhaar_file.replace(/\\/g,"/")}`} target="_blank" rel="noreferrer" className="text-blue-500 font-bold hover:underline">View File</a> : "Pending"} />
                                            <DetailRow label="Edu Certs"           value={selectedAdmission.has_edu_certs_file ? <a href={`${process.env.NEXT_PUBLIC_API_URL}/${selectedAdmission.has_edu_certs_file.replace(/\\/g,"/")}`} target="_blank" rel="noreferrer" className="text-blue-500 font-bold hover:underline">View File</a> : "Pending"} />
                                            <DetailRow label="Passport File"       value={selectedAdmission.has_passport_file ? <a href={`${process.env.NEXT_PUBLIC_API_URL}/${selectedAdmission.has_passport_file.replace(/\\/g,"/")}`} target="_blank" rel="noreferrer" className="text-blue-500 font-bold hover:underline">View File</a> : "Pending"} />
                                            <DetailRow label="Resume File"         value={selectedAdmission.has_resume_file ? <a href={`${process.env.NEXT_PUBLIC_API_URL}/${selectedAdmission.has_resume_file.replace(/\\/g,"/")}`} target="_blank" rel="noreferrer" className="text-blue-500 font-bold hover:underline">View File</a> : "Pending"} />
                                            <DetailRow label="Address Proof"       value={selectedAdmission.has_address_proof_file ? <a href={`${process.env.NEXT_PUBLIC_API_URL}/${selectedAdmission.has_address_proof_file.replace(/\\/g,"/")}`} target="_blank" rel="noreferrer" className="text-blue-500 font-bold hover:underline">View File</a> : "Pending"} />
                                            <DetailRow label="Guardian / Parent ID" value={selectedAdmission.has_guardian_id_file ? <a href={`${process.env.NEXT_PUBLIC_API_URL}/${selectedAdmission.has_guardian_id_file.replace(/\\/g,"/")}`} target="_blank" rel="noreferrer" className="text-blue-500 font-bold hover:underline">View File</a> : "Pending"} />
                                            <DetailRow label="Student Declaration" value={selectedAdmission.student_declaration ? "Signed" : "—"} color="text-emerald-600" />
                                        </div>
                                    </Section>


                                </div>

                                <div className="mt-10 pt-6 border-t border-slate-100 flex gap-4">
                                    <button onClick={() => setSelectedAdmission(null)}
                                        style={{ color: "#475569", backgroundColor: "#f1f5f9" }}
                                        className="flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all">Close</button>
                                    {user?.role !== "Associate" && (
                                        <button onClick={() => { handleEdit(selectedAdmission); setSelectedAdmission(null); }}
                                            style={{ color: "#ffffff", backgroundColor: "#0f172a" }}
                                            className="flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-800 transition-all">Edit Record</button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Success */}
            <AnimatePresence>
                {isSuccess && (
                    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                        className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-6">
                        <motion.div initial={{ scale:0.9, y:20 }} animate={{ scale:1, y:0 }}
                            className="bg-white rounded-[3.5rem] p-16 max-w-sm w-full text-center shadow-2xl">
                            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8">
                                <CheckCircle2 size={56}/>
                            </div>
                            <h3 className="text-3xl font-black text-slate-800">Admission Confirmed!</h3>
                            <p className="text-slate-500 font-bold mt-4 uppercase text-[10px] tracking-widest">Points added after full payment.</p>
                            <button onClick={() => setIsSuccess(false)}
                                style={{ color: "#ffffff", backgroundColor: "#0f172a" }}
                                className="mt-10 w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-slate-800 transition-all">Close</button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ── Helper section wrapper ─────────────────────────────────────────────────────
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div>
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-500 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"/> {title}
        </p>
        {children}
    </div>
);

// ── Helper components ──────────────────────────────────────────────────────────
const DetailRow = ({ label, value, color="text-slate-700", bold=false, fontMono=false, light=false, className="" }: any) => (
    <div className={`flex flex-col gap-1 ${light?"":"border-b border-slate-100"} pb-3 ${className}`}>
        <span className={`text-[10px] font-black uppercase tracking-widest ${light?"text-blue-300/80":"text-slate-400"}`}>{label}</span>
        <span className={`text-sm ${bold?"font-black":"font-bold"} ${fontMono?"font-mono":""} ${color} ${light&&color==="text-slate-700"?"text-white":""}`}>
            {value||"—"}
        </span>
    </div>
);

const InputField = ({ label, name, value, onChange, type="text", placeholder="", error="", compulsory=false, readOnly=false }: any) => (
    <div className="flex flex-col gap-1.5 flex-1 w-full">
        <label className="text-[12px] font-black text-slate-700 uppercase tracking-[0.1em] ml-1 flex items-center gap-1">
            {label} {compulsory && <span className="text-red-500">*</span>}
        </label>
        <input type={type} name={name} value={value||""} onChange={onChange} placeholder={placeholder} readOnly={readOnly}
            className={`w-full px-5 py-4 ${readOnly?"bg-slate-100 text-slate-500":"bg-slate-50 text-slate-900"} border ${error?"border-red-500":"border-slate-300 focus:border-blue-500"} rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition-all font-black placeholder:text-slate-300`}
        />
        {error && <span className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-1 ml-1">{error}</span>}
    </div>
);

const SelectField = ({ label, name, value, options, onChange, error="", compulsory=false }: any) => (
    <div className="flex flex-col gap-1.5 flex-1 w-full">
        <label className="text-[12px] font-black text-slate-700 uppercase tracking-[0.1em] ml-1 flex items-center gap-1">
            {label} {compulsory && <span className="text-red-500">*</span>}
        </label>
        <select name={name} value={value||""} onChange={onChange}
            className={`w-full px-5 py-4 bg-slate-50 border ${error?"border-red-500":"border-slate-300 focus:border-blue-500"} rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition-all font-black text-slate-900`}>
            {options.map((o: string) => <option key={o} value={o}>{o||"Select..."}</option>)}
        </select>
        {error && <span className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-1 ml-1">{error}</span>}
    </div>
);

const AutoCompleteField = ({ label, name, value, options, onChange, error="", compulsory=false, placeholder="" }: any) => (
    <div className="flex flex-col gap-1.5 flex-1 w-full">
        <label className="text-[12px] font-black text-slate-700 uppercase tracking-[0.1em] ml-1 flex items-center gap-1">
            {label} {compulsory && <span className="text-red-500">*</span>}
        </label>
        <input list={`${name}-list`} name={name} value={value||""} onChange={onChange} placeholder={placeholder}
            className={`w-full px-5 py-4 bg-slate-50 border ${error?"border-red-500":"border-slate-300 focus:border-blue-500"} rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition-all font-black text-slate-900`} />
        <datalist id={`${name}-list`}>
            {options.filter((o: string) => o).map((o: string) => <option key={o} value={o} />)}
        </datalist>
        {error && <span className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-1 ml-1">{error}</span>}
    </div>
);

const TextAreaField = ({ label, name, value, onChange, error="", compulsory=false }: any) => (
    <div className="flex flex-col gap-1.5 w-full">
        <label className="text-[12px] font-black text-slate-700 uppercase tracking-[0.1em] ml-1 flex items-center gap-1">
            {label} {compulsory && <span className="text-red-500">*</span>}
        </label>
        <textarea name={name} value={value||""} onChange={onChange} rows={3}
            className={`w-full p-5 bg-slate-50 border ${error?"border-red-500":"border-slate-300 focus:border-blue-500"} rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition-all font-black text-slate-900`}
        />
        {error && <span className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-1 ml-1">{error}</span>}
    </div>
);

const CheckboxField = ({ label, name, checked, onChange, error="", compulsory=false, dark=false }: any) => {
    const textColor = error ? "#dc2626" : (dark ? "#e2e8f0" : "#334155");
    return (
        <label 
            style={{ 
                backgroundColor: dark ? "rgba(255, 255, 255, 0.05)" : undefined,
                borderColor: dark ? "rgba(255, 255, 255, 0.1)" : undefined
            }}
            className={`flex items-start gap-4 p-4 border transition-all cursor-pointer group w-full rounded-2xl ${dark?"hover:bg-white/10":"bg-slate-50 border-slate-200 hover:bg-white hover:border-blue-300"}`}>
            <input type="checkbox" name={name} checked={checked||false} onChange={onChange} className="mt-1 w-5 h-5 rounded-lg text-blue-500 border-slate-400 cursor-pointer"/>
            <div className="flex flex-col">
                <span 
                    style={{ color: textColor }}
                    className="text-[11px] uppercase tracking-widest font-black leading-tight group-hover:text-blue-500 transition-colors">
                    {label} {compulsory && <span className="text-red-500">*</span>}
                </span>
                {error && <span className="text-[9px] text-red-500 font-black uppercase mt-1">{error}</span>}
            </div>
        </label>
    );
};

const FileField = ({ label, name, value, onChange, error="", compulsory=false, fileType="any" }: any) => {
    const [localError, setLocalError] = React.useState<string | null>(null);
    const displayError = localError || error;
    return (
    <div className="flex flex-col gap-1.5 w-full">
        <label className="text-[12px] font-black text-slate-700 uppercase tracking-[0.1em] ml-1 flex items-center gap-1">
            {label} {compulsory && <span className="text-red-500">*</span>}
        </label>
        <div className={`relative flex flex-col`}>
            <div className={`relative flex items-center p-1 px-4 bg-slate-100 border-2 border-dashed ${displayError?"border-red-500 bg-red-50":"border-slate-300 hover:border-blue-500 hover:bg-blue-50"} rounded-2xl transition-all h-16`}>
                <ValidatedFileInput 
                    fileType={fileType} 
                    name={name} 
                    onChange={onChange} 
                    onFileError={setLocalError}
                    wrapperClassName=""
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex items-center gap-3">
                    <Upload size={20} className={displayError?"text-red-400":"text-blue-500"}/>
                    <span className={`text-xs font-black uppercase tracking-wider ${displayError?"text-red-600":"text-slate-600"}`}>
                        {value ? (typeof value==="string" ? value.split("/").pop() : value.name) : "Choose File"}
                    </span>
                </div>
            </div>
            {displayError && <span className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-1 ml-1">{displayError}</span>}
        </div>
    </div>
)};

