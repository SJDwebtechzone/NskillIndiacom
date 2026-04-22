// "use client";

// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { Save, MapPin, Phone, Mail, Globe, MessageSquare, Facebook, Twitter, Instagram, Linkedin, Loader2 } from "lucide-react";

// const API_BASE = "http://localhost:5000/api";

// export default function ContactSettingsPage() {
//     const [loading, setLoading] = useState(true);
//     const [saving, setSaving] = useState(false);
//     const [formData, setFormData] = useState({
//         company_name: "",
//         address: "",
//         primary_phone: "",
//         secondary_phone: "",
//         whatsapp_number: "",
//         email: "",
//         map_embed_url: "",
//         facebook_url: "",
//         twitter_url: "",
//         instagram_url: "",
//         linkedin_url: ""
//     });

//     useEffect(() => {
//         fetchContactInfo();
//     }, []);

//     const fetchContactInfo = async () => {
//         try {
//             const res = await axios.get(`${API_BASE}/settings/contact-info`);
//             if (res.data) {
//                 setFormData(prev => ({ ...prev, ...res.data }));
//             }
//         } catch (err) {
//             console.error("Failed to fetch contact info", err);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({ ...prev, [name]: value }));
//     };

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         setSaving(true);
//         try {
//             await axios.post(`${API_BASE}/settings/contact-info`, formData);
//             alert("Contact Information updated successfully!");
//         } catch (err) {
//             console.error("Update failed", err);
//             alert("Failed to update contact info.");
//         } finally {
//             setSaving(false);
//         }
//     };

//     if (loading) {
//         return (
//             <div className="flex h-[60vh] items-center justify-center">
//                 <Loader2 className="animate-spin text-blue-600" size={40} />
//             </div>
//         );
//     }

//     return (
//         <div className="p-8 max-w-5xl mx-auto space-y-8">
//             <div className="flex justify-between items-center">
//                 <div>
//                     <h1 className="text-3xl font-black text-black">Contact Information</h1>
//                     <p className="text-black font-medium">Manage your office location, phone numbers, and social links</p>
//                 </div>
//             </div>

//             <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                 {/* Basic Info */}
//                 <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-6">
//                     <h2 className="text-xl font-bold text-black flex items-center gap-2 border-b pb-4">
//                         <MapPin className="text-blue-600" size={20} /> Office & Location
//                     </h2>
                    
//                     <div className="space-y-4">
//                         <div className="space-y-1">
//                             <label className="text-xs font-black uppercase tracking-widest text-black ml-1">Company Name</label>
//                             <input 
//                                 name="company_name"
//                                 value={formData.company_name}
//                                 onChange={handleChange}
//                                 placeholder="e.g. N-Skill Training"
//                                 className="w-full px-6 py-4 bg-slate-50 border border-slate-400 rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold text-black transition-all outline-none"
//                             />
//                         </div>

//                         <div className="space-y-1">
//                             <label className="text-xs font-black uppercase tracking-widest text-black ml-1">Full Address</label>
//                             <textarea 
//                                 name="address"
//                                 value={formData.address}
//                                 onChange={handleChange}
//                                 placeholder="Enter office address"
//                                 rows={3}
//                                 className="w-full px-6 py-4 bg-slate-50 border border-slate-400 rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold text-black transition-all outline-none"
//                             />
//                         </div>

//                         <div className="space-y-1">
//                             <label className="text-xs font-black uppercase tracking-widest text-black ml-1">Google Maps Embed URL</label>
//                             <input 
//                                 name="map_embed_url"
//                                 value={formData.map_embed_url}
//                                 onChange={handleChange}
//                                 placeholder="https://www.google.com/maps/embed..."
//                                 className="w-full px-6 py-4 bg-slate-50 border border-slate-400 rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold text-black transition-all outline-none"
//                             />
//                             <p className="text-[10px] text-slate-400 mt-1 italic font-bold">Go to Google Maps → Share → Embed a map → Copy the 'src' attribute</p>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Contact Channels */}
//                 <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-6">
//                     <h2 className="text-xl font-bold text-black flex items-center gap-2 border-b pb-4">
//                         <Phone className="text-green-600" size={20} /> Contact Channels
//                     </h2>
                    
//                     <div className="space-y-4">
//                         <div className="grid grid-cols-2 gap-4">
//                             <div className="space-y-1">
//                                 <label className="text-xs font-black uppercase tracking-widest text-black ml-1">Primary Phone</label>
//                                 <input 
//                                     name="primary_phone"
//                                     value={formData.primary_phone}
//                                     onChange={handleChange}
//                                     placeholder="+91 - 988..."
//                                     className="w-full px-6 py-4 bg-slate-50 border border-slate-400 rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold text-black transition-all outline-none"
//                                 />
//                             </div>
//                             <div className="space-y-1">
//                                 <label className="text-xs font-black uppercase tracking-widest text-black ml-1">Secondary Phone</label>
//                                 <input 
//                                     name="secondary_phone"
//                                     value={formData.secondary_phone}
//                                     onChange={handleChange}
//                                     className="w-full px-6 py-4 bg-slate-50 border border-slate-400 rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold text-black transition-all outline-none"
//                                 />
//                             </div>
//                         </div>

//                         <div className="space-y-1">
//                             <label className="text-xs font-black uppercase tracking-widest text-green-600 ml-1">WhatsApp Number</label>
//                             <input 
//                                 name="whatsapp_number"
//                                 value={formData.whatsapp_number}
//                                 onChange={handleChange}
//                                 placeholder="10 digit number"
//                                 className="w-full px-6 py-4 bg-green-50/50 border border-slate-400 rounded-2xl focus:ring-2 focus:ring-green-500 font-bold text-black transition-all outline-none"
//                             />
//                         </div>

//                         <div className="space-y-1">
//                             <label className="text-xs font-black uppercase tracking-widest text-black ml-1">Public Email</label>
//                             <input 
//                                 name="email"
//                                 type="email"
//                                 value={formData.email}
//                                 onChange={handleChange}
//                                 className="w-full px-6 py-4 bg-slate-50 border border-slate-400 rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold text-black transition-all outline-none"
//                             />
//                         </div>
//                     </div>
//                 </div>

//                 {/* Social Media */}
//                 <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-6 md:col-span-2">
//                     <h2 className="text-xl font-bold text-black flex items-center gap-2 border-b pb-4">
//                         <Globe className="text-purple-600" size={20} /> Social Media Links
//                     </h2>
                    
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//                         <div className="space-y-1">
//                             <label className="text-xs font-black uppercase tracking-widest text-black ml-1 flex items-center gap-2"><Facebook size={12}/> Facebook</label>
//                             <input name="facebook_url" value={formData.facebook_url} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-400 rounded-xl focus:ring-2 focus:ring-blue-600 font-bold text-black outline-none transition-all"/>
//                         </div>
//                         <div className="space-y-1">
//                             <label className="text-xs font-black uppercase tracking-widest text-black ml-1 flex items-center gap-2"><Twitter size={12}/> Twitter (X)</label>
//                             <input name="twitter_url" value={formData.twitter_url} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-400 rounded-xl focus:ring-2 focus:ring-slate-900 font-bold text-black outline-none transition-all"/>
//                         </div>
//                         <div className="space-y-1">
//                             <label className="text-xs font-black uppercase tracking-widest text-black ml-1 flex items-center gap-2"><Instagram size={12}/> Instagram</label>
//                             <input name="instagram_url" value={formData.instagram_url} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-400 rounded-xl focus:ring-2 focus:ring-pink-500 font-bold text-black outline-none transition-all"/>
//                         </div>
//                         <div className="space-y-1">
//                             <label className="text-xs font-black uppercase tracking-widest text-black ml-1 flex items-center gap-2"><Linkedin size={12}/> LinkedIn</label>
//                             <input name="linkedin_url" value={formData.linkedin_url} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-400 rounded-xl focus:ring-2 focus:ring-blue-700 font-bold text-black outline-none transition-all"/>
//                         </div>
//                     </div>
//                 </div>

//                 <div className="md:col-span-2 flex justify-end">
//                     <button 
//                         type="submit"
//                         disabled={saving}
//                         className="flex items-center gap-3 px-12 py-5 bg-[#0b1f3a] text-white rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-blue-600 transition-all shadow-xl hover:shadow-blue-200/50 active:scale-95 disabled:opacity-50"
//                     >
//                         {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
//                         Save Changes
//                     </button>
//                 </div>
//             </form>
//         </div>
//     );
// }
"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Save, MapPin, Phone, Mail, Globe, Facebook, Twitter, Instagram, Linkedin, Loader2, Inbox, User, BookOpen, MessageSquare, Clock } from "lucide-react";

const API_BASE = "http://localhost:5000/api";

const defaultForm = {
    company_name: "",
    address: "",
    primary_phone: "",
    secondary_phone: "",
    whatsapp_number: "",
    email: "",
    map_embed_url: "",
    facebook_url: "",
    twitter_url: "",
    instagram_url: "",
    linkedin_url: ""
};

interface Enquiry {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
    created_at: string;
}

export default function ContactSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState(defaultForm);

    // Enquiries state
    const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
    const [enquiriesLoading, setEnquiriesLoading] = useState(true);

    useEffect(() => {
        fetchContactInfo();
        fetchEnquiries();
    }, []);

    const fetchContactInfo = async () => {
        try {
            const res = await axios.get(`${API_BASE}/settings/contact-info`);
            if (res.data) {
                setFormData({ ...defaultForm, ...res.data });
            }
        } catch (err) {
            console.error("Failed to fetch contact info", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchEnquiries = () => {
        setEnquiriesLoading(true);
        fetch(`${API_BASE}/settings/enquiry`)
            .then(res => res.json())
            .then(data => {
                setEnquiries(data);
                setEnquiriesLoading(false);
            })
            .catch(err => {
                console.error("Error fetching enquiries:", err);
                setEnquiriesLoading(false);
            });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await axios.post(`${API_BASE}/settings/contact-info`, formData);
            alert("Contact Information updated successfully!");
            await fetchContactInfo();
        } catch (err) {
            console.error("Update failed", err);
            alert("Failed to update contact info.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            {/* Page Title */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-black">Contact Information</h1>
                    <p className="text-black font-medium">Manage your office location, phone numbers, and social links</p>
                </div>
            </div>

            {/* ── CONTACT SETTINGS FORM ── */}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Office & Location */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-6">
                    <h2 className="text-xl font-bold text-black flex items-center gap-2 border-b pb-4">
                        <MapPin className="text-blue-600" size={20} /> Office & Location
                    </h2>
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-black uppercase tracking-widest text-black ml-1">Company Name</label>
                            <input
                                name="company_name"
                                value={formData.company_name}
                                onChange={handleChange}
                                placeholder="e.g. N-Skill Training"
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-400 rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold text-black transition-all outline-none"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-black uppercase tracking-widest text-black ml-1">Full Address</label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Enter office address"
                                rows={3}
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-400 rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold text-black transition-all outline-none"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-black uppercase tracking-widest text-black ml-1">Google Maps Embed URL</label>
                            <input
                                name="map_embed_url"
                                value={formData.map_embed_url}
                                onChange={handleChange}
                                placeholder="https://www.google.com/maps/embed..."
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-400 rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold text-black transition-all outline-none"
                            />
                            <p className="text-[10px] text-slate-400 mt-1 italic font-bold">Go to Google Maps → Share → Embed a map → Copy the 'src' attribute</p>
                        </div>
                    </div>
                </div>

                {/* Contact Channels */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-6">
                    <h2 className="text-xl font-bold text-black flex items-center gap-2 border-b pb-4">
                        <Phone className="text-green-600" size={20} /> Contact Channels
                    </h2>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-black uppercase tracking-widest text-black ml-1">Primary Phone</label>
                                <input
                                    name="primary_phone"
                                    value={formData.primary_phone}
                                    onChange={handleChange}
                                    placeholder="+91 - 988..."
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-400 rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold text-black transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-black uppercase tracking-widest text-black ml-1">Secondary Phone</label>
                                <input
                                    name="secondary_phone"
                                    value={formData.secondary_phone}
                                    onChange={handleChange}
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-400 rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold text-black transition-all outline-none"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-black uppercase tracking-widest text-green-600 ml-1">WhatsApp Number</label>
                            <input
                                name="whatsapp_number"
                                value={formData.whatsapp_number}
                                onChange={handleChange}
                                placeholder="10 digit number"
                                className="w-full px-6 py-4 bg-green-50/50 border border-slate-400 rounded-2xl focus:ring-2 focus:ring-green-500 font-bold text-black transition-all outline-none"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-black uppercase tracking-widest text-black ml-1">Public Email</label>
                            <input
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-400 rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold text-black transition-all outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Social Media */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-6 md:col-span-2">
                    <h2 className="text-xl font-bold text-black flex items-center gap-2 border-b pb-4">
                        <Globe className="text-purple-600" size={20} /> Social Media Links
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-1">
                            <label className="text-xs font-black uppercase tracking-widest text-black ml-1 flex items-center gap-2"><Facebook size={12} /> Facebook</label>
                            <input name="facebook_url" value={formData.facebook_url} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-400 rounded-xl focus:ring-2 focus:ring-blue-600 font-bold text-black outline-none transition-all" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-black uppercase tracking-widest text-black ml-1 flex items-center gap-2"><Twitter size={12} /> Twitter (X)</label>
                            <input name="twitter_url" value={formData.twitter_url} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-400 rounded-xl focus:ring-2 focus:ring-slate-900 font-bold text-black outline-none transition-all" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-black uppercase tracking-widest text-black ml-1 flex items-center gap-2"><Instagram size={12} /> Instagram</label>
                            <input name="instagram_url" value={formData.instagram_url} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-400 rounded-xl focus:ring-2 focus:ring-pink-500 font-bold text-black outline-none transition-all" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-black uppercase tracking-widest text-black ml-1 flex items-center gap-2"><Linkedin size={12} /> LinkedIn</label>
                            <input name="linkedin_url" value={formData.linkedin_url} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-400 rounded-xl focus:ring-2 focus:ring-blue-700 font-bold text-black outline-none transition-all" />
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="md:col-span-2 flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-3 px-12 py-5 bg-[#0b1f3a] text-white rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-blue-600 transition-all shadow-xl hover:shadow-blue-200/50 active:scale-95 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Save Changes
                    </button>
                </div>
            </form>

            {/* ── ENQUIRIES SECTION ── */}
            <div className="space-y-6">
                {/* Section Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-black flex items-center gap-2">
                            <MessageSquare className="text-blue-600" size={24} /> Enquiries
                            {!enquiriesLoading && (
                                <span className="ml-2 text-sm font-bold bg-blue-100 text-blue-600 px-3 py-1 rounded-full">
                                    {enquiries.length}
                                </span>
                            )}
                        </h2>
                        <p className="text-black font-medium">Messages submitted through the contact form</p>
                    </div>
                    <button
                        type="button"
                        onClick={fetchEnquiries}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all"
                    >
                        <Loader2 size={14} className={enquiriesLoading ? "animate-spin" : ""} />
                        Refresh
                    </button>
                </div>

                {/* Loading */}
                {enquiriesLoading && (
                    <div className="flex items-center justify-center py-16 bg-white rounded-[2.5rem] shadow-xl border border-slate-100">
                        <Loader2 className="animate-spin text-blue-600" size={36} />
                    </div>
                )}

                {/* No Data */}
                {!enquiriesLoading && enquiries.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[2.5rem] shadow-xl border border-slate-100 space-y-4">
                        <Inbox size={48} className="text-slate-300" />
                        <p className="text-slate-400 font-bold text-lg">No enquiries yet</p>
                        <p className="text-slate-400 text-sm">Messages from your contact form will appear here</p>
                    </div>
                )}

                {/* Enquiry Cards */}
                {!enquiriesLoading && enquiries.length > 0 && (
                    <div className="grid gap-6">
                        {enquiries.map((item, i) => (
                            <div
                                key={i}
                                className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 border-l-4 border-l-blue-500 space-y-4"
                            >
                                {/* Name + Date */}
                                <div className="flex items-start justify-between flex-wrap gap-2">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-blue-50 p-2 rounded-full text-blue-500">
                                            <User size={18} />
                                        </div>
                                        <span className="font-black text-black text-lg">{item.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-slate-400 font-bold">
                                        <Clock size={12} />
                                        {new Date(item.created_at).toLocaleString("en-IN", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit"
                                        })}
                                    </div>
                                </div>

                                {/* Contact Details Row */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                        <Mail size={14} className="text-blue-400 shrink-0" />
                                        <span className="truncate">{item.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                        <Phone size={14} className="text-green-400 shrink-0" />
                                        <span>{item.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                        <BookOpen size={14} className="text-purple-400 shrink-0" />
                                        <span className="truncate">{item.subject || "—"}</span>
                                    </div>
                                </div>

                                {/* Message */}
                                <div className="flex items-start gap-2 bg-slate-50 rounded-2xl px-5 py-4">
                                    <MessageSquare size={16} className="text-slate-400 mt-0.5 shrink-0" />
                                    <p className="text-sm text-slate-700 font-medium leading-relaxed">{item.message}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
