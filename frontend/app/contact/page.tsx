// "use client";

// import React, { useState, useEffect, useCallback } from "react";
// import { motion, Variants } from "framer-motion";
// import { MapPin, Phone, Mail, Send, RotateCcw, RefreshCw } from "lucide-react";


// const ContactPage: React.FC = () => {
//     const [captcha, setCaptcha] = useState<string>("");
//     const [contact, setContact] = useState<any>(null);
//     const [loading, setLoading] = useState(true);

//     const generateCaptcha = useCallback(() => {
//         const characters = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
//         let result = "";
//         for (let i = 0; i < 6; i++) {
//             result += characters.charAt(Math.floor(Math.random() * characters.length));
//         }
//         setCaptcha(result);
//     }, []);

//     useEffect(() => {
//         generateCaptcha();
//         fetchContact();
//     }, [generateCaptcha]);

//     const fetchContact = async () => {
//         try {
//             const res = await fetch("http://localhost:5000/api/settings/contact-info");
//             const data = await res.json();
//             setContact(data);
//         } catch (err) {
//             console.error("Failed to load contact info", err);
//         } finally {
//             setLoading(false);
//         }
//     };
    
//     // Fallback while loading or error
//     const displayData = contact || {
//         address: "361/3, Pillayar Kovil Street, Raghavendra Nagar, Chennai.",
//         primary_phone: "+91 98842 09774",
//         secondary_phone: "+91 80560 63023",
//         email: "nskilltraining@gmail.com",
//         map_embed_url: ""
//     };

//     const cardVariants: Variants = {
//         hidden: { opacity: 0, y: 20 },
//         visible: (i: number) => ({
//             opacity: 1,
//             y: 0,
//             transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
//         }),
//     };

//     return (
//         <div className="bg-gray-50 min-h-screen font-sans">
//             {/* Page Header Header Banner */}
//             <div className="relative h-[250px] md:h-[300px] bg-[#1a1a1a] flex flex-col items-center justify-center text-white overflow-hidden">
//                 <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80')] bg-cover bg-center"></div>
//                 <div className="absolute inset-0 bg-black/50"></div>

//                 <motion.h1
//                     initial={{ opacity: 0, y: -20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ duration: 0.6 }}
//                     className="relative text-4xl md:text-5xl font-bold mb-4 z-10"
//                 >
//                     Contact Us
//                 </motion.h1>
//             </div>

//             <div className="max-w-6xl mx-auto px-4 md:px-12 py-16">
//                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                     {/* Left Column: Contact Info Cards */}
//                     <div className="space-y-4">
//                         <motion.div
//                             custom={0}
//                             initial="hidden"
//                             whileInView="visible"
//                             viewport={{ once: true }}
//                             variants={cardVariants}
//                             whileHover={{ scale: 1.02 }}
//                             className="bg-white p-6 rounded-lg shadow-sm flex items-start space-x-4 border-l-4 border-blue-500"
//                         >
//                             <div className="bg-blue-50 p-3 rounded-full text-blue-500 shrink-0">
//                                 <MapPin size={24} />
//                             </div>
//                             <div>
//                                 <h3 className="text-lg font-bold text-[#0b1f3a] mb-1">Office Location</h3>
//                                 <p className="text-sm text-gray-600">
//                                     {displayData.address}
//                                 </p>

//                             </div>
//                         </motion.div>

//                         <motion.div
//                             custom={1}
//                             initial="hidden"
//                             whileInView="visible"
//                             viewport={{ once: true }}
//                             variants={cardVariants}
//                             whileHover={{ scale: 1.02 }}
//                             className="bg-white p-6 rounded-lg shadow-sm flex items-start space-x-4 border-l-4 border-blue-500"
//                         >
//                             <div className="bg-blue-50 p-3 rounded-full text-blue-500 shrink-0">
//                                 <Phone size={24} />
//                             </div>
//                             <div>
//                                 <h3 className="text-lg font-bold text-[#0b1f3a] mb-1">Phone</h3>
//                                 <p className="text-sm text-gray-600 font-semibold">{displayData.primary_phone}</p>
//                                 {displayData.secondary_phone && (
//                                     <p className="text-sm text-gray-600 font-semibold">{displayData.secondary_phone}</p>
//                                 )}

//                             </div>
//                         </motion.div>

//                         <motion.div
//                             custom={2}
//                             initial="hidden"
//                             whileInView="visible"
//                             viewport={{ once: true }}
//                             variants={cardVariants}
//                             whileHover={{ scale: 1.02 }}
//                             className="bg-white p-6 rounded-lg shadow-sm flex items-start space-x-4 border-l-4 border-blue-500"
//                         >
//                             <div className="bg-blue-50 p-3 rounded-full text-blue-500 shrink-0">
//                                 <Mail size={24} />
//                             </div>
//                             <div>
//                                 <h3 className="text-lg font-bold text-[#0b1f3a] mb-1">Email</h3>
//                                 <p className="text-sm text-gray-600 font-semibold">{displayData.email}</p>

//                             </div>
//                         </motion.div>
//                     </div>

//                     {/* Right Column: Contact Form */}
//                     <motion.div
//                         initial="hidden"
//                         whileInView="visible"
//                         viewport={{ once: true }}
//                         variants={cardVariants}
//                         custom={3}
//                         className="bg-white p-8 rounded-lg shadow-md border border-gray-200 border-t-4 border-t-blue-500"
//                     >
//                         <h2 className="text-3xl font-bold text-[#0b1f3a] mb-4">Send a Message</h2>
//                         <form className="space-y-4">
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                 <div className="space-y-1">
//                                     <label className="text-xs font-bold text-[#0b1f3a] uppercase tracking-wider ml-1">Full Name</label>
//                                     <input
//                                         type="text"
//                                         placeholder="Enter your name"
//                                         className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-400 text-gray-900 font-medium"
//                                     />
//                                 </div>
//                                 <div className="space-y-1">
//                                     <label className="text-xs font-bold text-[#0b1f3a] uppercase tracking-wider ml-1">Email Address</label>
//                                     <input
//                                         type="email"
//                                         placeholder="Enter your email"
//                                         className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-400 text-gray-900 font-medium"
//                                     />
//                                 </div>
//                             </div>
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                 <div className="space-y-1">
//                                     <label className="text-xs font-bold text-[#0b1f3a] uppercase tracking-wider ml-1">Phone Number</label>
//                                     <input
//                                         type="tel"
//                                         placeholder="Enter phone number"
//                                         className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-400 text-gray-900 font-medium"
//                                     />
//                                 </div>
//                                 <div className="space-y-1">
//                                     <label className="text-xs font-bold text-[#0b1f3a] uppercase tracking-wider ml-1">Subject</label>
//                                     <input
//                                         type="text"
//                                         placeholder="How can we help?"
//                                         className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-400 text-gray-900 font-medium"
//                                     />
//                                 </div>
//                             </div>
//                             <div className="space-y-1">
//                                 <label className="text-xs font-bold text-[#0b1f3a] uppercase tracking-wider ml-1">Message</label>
//                                 <textarea
//                                     rows={4}
//                                     placeholder="Write your message here..."
//                                     className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-400 text-gray-900 font-medium"
//                                 ></textarea>
//                             </div>
//                             <div className="flex items-center gap-4">
//                                 <div className="flex items-center gap-2">
//                                     <div
//                                         className="bg-gray-100 px-6 py-3 border border-dashed border-gray-400 rounded font-serif italic text-2xl tracking-[0.3em] text-gray-800 select-none shadow-inner min-w-[140px] text-center"
//                                     >
//                                         {captcha}
//                                     </div>
//                                     <button
//                                         type="button"
//                                         onClick={generateCaptcha}
//                                         className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
//                                         title="Refresh Captcha"
//                                     >
//                                         <RefreshCw size={20} />
//                                     </button>
//                                 </div>
//                                 <input
//                                     type="text"
//                                     placeholder="Enter Captcha"
//                                     className="px-4 py-3 bg-white border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none w-48 text-gray-900"
//                                 />
//                             </div>
//                             <button className="w-full bg-[#0b1f3a] text-white font-bold py-4 rounded hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl active:scale-[0.99] transition-transform">
//                                 Send Message <Send size={18} />
//                             </button>
//                         </form>
//                     </motion.div>
//                 </div>
//             </div>

//             {/* Google Maps Section */}
//             <motion.div
//                 initial="hidden"
//                 whileInView="visible"
//                 viewport={{ once: true }}
//                 variants={cardVariants}
//                 custom={4}
//                 className="max-w-6xl mx-auto px-4 md:px-12 pb-16"
//             >
//                 <div className="w-full h-[400px] bg-gray-200 relative rounded-2xl overflow-hidden shadow-md">
//                     <iframe
//                         title="N-Skill India Location"
//                         src={displayData.map_embed_url || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.355152504856!2d80.1293214!3d13.012892!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a525fdf8e6b19a3%3A0x6b7b2586e3f1e1e!2sPillayar%20Kovil%20St%2C%20Chennai%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1709476000000!5m2!1sen!2sin"}
//                         width="100%"
//                         height="100%"
//                         style={{ border: 0 }}
//                         allowFullScreen={true}
//                         loading="lazy"
//                         referrerPolicy="no-referrer-when-downgrade"
//                         className="grayscale hover:grayscale-0 transition-all duration-500"
//                     ></iframe>
//                 </div>
//             </motion.div>
//         </div>
//     );
// };

// export default ContactPage;
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, Variants } from "framer-motion";
import { MapPin, Phone, Mail, Send, RefreshCw, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

const ContactPage: React.FC = () => {
    const [captcha, setCaptcha] = useState<string>("");
    const [captchaInput, setCaptchaInput] = useState<string>("");
    const [contact, setContact] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
    });

    const generateCaptcha = useCallback(() => {
        const characters = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
        let result = "";
        for (let i = 0; i < 6; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        setCaptcha(result);
    }, []);

    useEffect(() => {
        generateCaptcha();
        fetchContact();
    }, [generateCaptcha]);

    const fetchContact = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/settings/contact-info");
            const data = await res.json();
            setContact(data);
        } catch (err) {
            console.error("Failed to load contact info", err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (captchaInput !== captcha) {
            alert("❌ Captcha does not match. Please try again.");
            generateCaptcha();
            setCaptchaInput("");
            return;
        }

        try {
            await fetch("http://localhost:5000/api/settings/enquiry", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            alert("Message Sent ✅");

            setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
            setCaptchaInput("");
            generateCaptcha();
        } catch (err) {
            console.error("Failed to send message", err);
            alert("❌ Failed to send message. Please try again.");
        }
    };

    const displayData = contact || {
        address: "361/3, Pillayar Kovil Street, Raghavendra Nagar, Chennai.",
        primary_phone: "+91 98842 09774",
        secondary_phone: "+91 80560 63023",
        email: "nskilltraining@gmail.com",
        map_embed_url: "",
        facebook_url: "",
        twitter_url: "",
        instagram_url: "",
        linkedin_url: ""
    };

    const cardVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
        }),
    };

    const hasSocialLinks =
        displayData.facebook_url ||
        displayData.twitter_url ||
        displayData.instagram_url ||
        displayData.linkedin_url;

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            {/* Page Header Banner */}
            <div className="relative h-[250px] md:h-[300px] bg-[#1a1a1a] flex flex-col items-center justify-center text-white overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80')] bg-cover bg-center"></div>
                <div className="absolute inset-0 bg-black/50"></div>
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative text-4xl md:text-5xl font-bold mb-4 z-10"
                >
                    Contact Us
                </motion.h1>
            </div>

            <div className="max-w-6xl mx-auto px-4 md:px-12 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* ── LEFT COLUMN ── */}
                    <div className="space-y-4">

                        {/* Address */}
                        <motion.div
                            custom={0}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={cardVariants}
                            whileHover={{ scale: 1.02 }}
                            className="bg-white p-6 rounded-lg shadow-sm flex items-start space-x-4 border-l-4 border-blue-500"
                        >
                            <div className="bg-blue-50 p-3 rounded-full text-blue-500 shrink-0">
                                <MapPin size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-[#0b1f3a] mb-1">Office Location</h3>
                                <p className="text-sm text-gray-600">{displayData.address}</p>
                            </div>
                        </motion.div>

                        {/* Phone */}
                        <motion.div
                            custom={1}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={cardVariants}
                            whileHover={{ scale: 1.02 }}
                            className="bg-white p-6 rounded-lg shadow-sm flex items-start space-x-4 border-l-4 border-blue-500"
                        >
                            <div className="bg-blue-50 p-3 rounded-full text-blue-500 shrink-0">
                                <Phone size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-[#0b1f3a] mb-1">Phone</h3>
                                <p className="text-sm text-gray-600 font-semibold">{displayData.primary_phone}</p>
                                {displayData.secondary_phone && (
                                    <p className="text-sm text-gray-600 font-semibold">{displayData.secondary_phone}</p>
                                )}
                            </div>
                        </motion.div>

                        {/* Email */}
                        <motion.div
                            custom={2}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={cardVariants}
                            whileHover={{ scale: 1.02 }}
                            className="bg-white p-6 rounded-lg shadow-sm flex items-start space-x-4 border-l-4 border-blue-500"
                        >
                            <div className="bg-blue-50 p-3 rounded-full text-blue-500 shrink-0">
                                <Mail size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-[#0b1f3a] mb-1">Email</h3>
                                <p className="text-sm text-gray-600 font-semibold">{displayData.email}</p>
                            </div>
                        </motion.div>

                        {/* Social Links — only renders if admin has filled at least one URL */}
                        {hasSocialLinks && (
                            <motion.div
                                custom={3}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={cardVariants}
                                whileHover={{ scale: 1.02 }}
                                className="bg-white p-6 rounded-lg shadow-sm flex items-start space-x-4 border-l-4 border-blue-500"
                            >
                                <div className="bg-blue-50 p-3 rounded-full text-blue-500 shrink-0">
                                    {/* Share icon inline SVG */}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-[#0b1f3a] mb-3">Follow Us</h3>
                                    <div className="flex items-center gap-3">
                                        {displayData.facebook_url && (
                                            <a
                                                href={displayData.facebook_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-all hover:scale-110"
                                                title="Facebook"
                                            >
                                                <Facebook size={18} />
                                            </a>
                                        )}
                                        {displayData.twitter_url && (
                                            <a
                                                href={displayData.twitter_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="bg-slate-800 text-white p-2 rounded-full hover:bg-slate-900 transition-all hover:scale-110"
                                                title="Twitter / X"
                                            >
                                                <Twitter size={18} />
                                            </a>
                                        )}
                                        {displayData.instagram_url && (
                                            <a
                                                href={displayData.instagram_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="bg-pink-500 text-white p-2 rounded-full hover:bg-pink-600 transition-all hover:scale-110"
                                                title="Instagram"
                                            >
                                                <Instagram size={18} />
                                            </a>
                                        )}
                                        {displayData.linkedin_url && (
                                            <a
                                                href={displayData.linkedin_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="bg-blue-700 text-white p-2 rounded-full hover:bg-blue-800 transition-all hover:scale-110"
                                                title="LinkedIn"
                                            >
                                                <Linkedin size={18} />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* ── RIGHT COLUMN: Form ── */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={cardVariants}
                        custom={4}
                        className="bg-white p-8 rounded-lg shadow-md border border-gray-200 border-t-4 border-t-blue-500"
                    >
                        <h2 className="text-3xl font-bold text-[#0b1f3a] mb-4">Send a Message</h2>
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-[#0b1f3a] uppercase tracking-wider ml-1">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Enter your name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-400 text-gray-900 font-medium"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-[#0b1f3a] uppercase tracking-wider ml-1">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Enter your email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-400 text-gray-900 font-medium"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-[#0b1f3a] uppercase tracking-wider ml-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        placeholder="Enter phone number"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-400 text-gray-900 font-medium"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-[#0b1f3a] uppercase tracking-wider ml-1">Subject</label>
                                    <input
                                        type="text"
                                        name="subject"
                                        placeholder="How can we help?"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-400 text-gray-900 font-medium"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-[#0b1f3a] uppercase tracking-wider ml-1">Message</label>
                                <textarea
                                    name="message"
                                    rows={4}
                                    placeholder="Write your message here..."
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-400 text-gray-900 font-medium"
                                ></textarea>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="bg-gray-100 px-6 py-3 border border-dashed border-gray-400 rounded font-serif italic text-2xl tracking-[0.3em] text-gray-800 select-none shadow-inner min-w-[140px] text-center">
                                        {captcha}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => { generateCaptcha(); setCaptchaInput(""); }}
                                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                                        title="Refresh Captcha"
                                    >
                                        <RefreshCw size={20} />
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Enter Captcha"
                                    value={captchaInput}
                                    onChange={(e) => setCaptchaInput(e.target.value)}
                                    className="px-4 py-3 bg-white border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none w-48 text-gray-900"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-[#0b1f3a] text-white font-bold py-4 rounded hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl active:scale-[0.99]"
                            >
                                Send Message <Send size={18} />
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>

            {/* Google Maps Section */}
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={cardVariants}
                custom={5}
                className="max-w-6xl mx-auto px-4 md:px-12 pb-16"
            >
                <div className="w-full h-[400px] bg-gray-200 relative rounded-2xl overflow-hidden shadow-md">
                    <iframe
                        title="N-Skill India Location"
                        src={displayData.map_embed_url || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.355152504856!2d80.1293214!3d13.012892!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a525fdf8e6b19a3%3A0x6b7b2586e3f1e1e!2sPillayar%20Kovil%20St%2C%20Chennai%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1709476000000!5m2!1sen!2sin"}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen={true}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="grayscale hover:grayscale-0 transition-all duration-500"
                    ></iframe>
                </div>
            </motion.div>
        </div>
    );
};

export default ContactPage;
