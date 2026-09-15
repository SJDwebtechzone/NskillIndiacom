"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import {
  MapPin, Phone, Mail, Send, RefreshCw,
  Facebook, Twitter, Instagram, Linkedin, Star,
  MessageCircle
} from "lucide-react";

interface Location {
  id: number;
  location_name: string;
  address: string;
  primary_phone: string;
  secondary_phone: string;
  whatsapp_number: string;
  email: string;
  map_embed_url: string;
  facebook_url: string;
  twitter_url: string;
  instagram_url: string;
  linkedin_url: string;
  is_primary: boolean;
}

const ContactPage: React.FC = () => {
  const [captcha, setCaptcha] = useState<string>("");
  const [captchaInput, setCaptchaInput] = useState<string>("");
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", subject: "", message: ""
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
    fetchLocations();
  }, [generateCaptcha]);

  const fetchLocations = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/settings/locations`);
      const data = await res.json();
      setLocations(data);
    } catch (err) {
      console.error("Failed to load locations", err);
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
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/settings/enquiry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      alert("Message Sent ✅");
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      setCaptchaInput("");
      generateCaptcha();
    } catch (err) {
      alert("❌ Failed to send message. Please try again.");
    }
  };

  const fallbackLocation: Location = {
    id: 0,
    location_name: "Head Office",
    address: "361/3, Pillayar Kovil Street, Raghavendra Nagar, Chennai.",
    primary_phone: "+91 98842 09774",
    secondary_phone: "+91 80560 63023",
    whatsapp_number: "9884209774",
    email: "nskilltraining@gmail.com",
    map_embed_url: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.355152504856!2d80.1293214!3d13.012892!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a525fdf8e6b19a3%3A0x6b7b2586e3f1e1e!2sPillayar%20Kovil%20St%2C%20Chennai%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1709476000000!5m2!1sen!2sin",
    facebook_url: "",
    twitter_url: "",
    instagram_url: "",
    linkedin_url: "",
    is_primary: true
  };

  const displayLocations = (!loading && locations.length > 0) ? locations : [fallbackLocation];

  const defaultPrimary: Location =
    displayLocations.find(loc => loc.is_primary) || displayLocations[0];

  const primaryLocation: Location =
    (selectedLocationId !== null
      ? displayLocations.find(loc => loc.id === selectedLocationId)
      : undefined) ?? defaultPrimary;

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1, y: 0,
      transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" }
    })
  };

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* ── Page Header ── */}
      <section className="relative min-h-[315px] overflow-hidden flex items-center">
        <img
          src="/images/contact/contactus.png"
          alt="Contact Us"
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
        />
        <div className="absolute bottom-0 left-0 w-full h-1 bg-[#f97316]" />
        <div className="relative z-10 mx-auto flex min-h-[315px] max-w-[1420px] items-center px-6 py-10 md:px-10 w-full">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-[650px] text-white"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/20 px-3.5 py-1 backdrop-blur-sm border border-orange-400/30 mb-3.5">
              <span className="h-2 w-2 rounded-full bg-orange-500" />
              <span className="text-xs font-black uppercase tracking-widest text-orange-400">Get In Touch</span>
            </div>
            <h1 className="text-[40px] font-black leading-[1.12] tracking-tight md:text-[46px] text-white">
              Contact Us
            </h1>
            <p className="mt-3 max-w-[540px] text-sm md:text-base font-semibold leading-relaxed text-orange-500">
              We&apos;re here to help you build your career
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 mt-5">
              <Link
                href="/courses"
                className="bg-[#f97316] hover:bg-[#ea580c] text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-600/30 transition-all active:scale-95 cursor-pointer inline-flex items-center justify-center"
              >
                EXPLORE COURSES
              </Link>
              <a
                href="https://wa.me/919884209774?text=Hi%20NSkill%2C%20I%20am%20interested%20in%20courses.%20Please%20guide%20me."
                target="_blank"
                rel="noopener noreferrer"
                className="border border-white/80 hover:border-white text-white hover:bg-white/10 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all active:scale-95 cursor-pointer shadow-sm bg-white/5 backdrop-blur-sm"
              >
                <MessageCircle className="w-4 h-4 text-green-400" />
                <span>TALK TO COUNSELLOR</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 md:px-12 py-16 space-y-12">

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── LEFT: Primary Location Info Cards ── */}
          <div className="space-y-4">

            {/* Primary Location Badge */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2"
            >
              <div className="flex items-center gap-2 bg-[#0a2d5c] text-white px-4 py-2 rounded-full text-sm font-bold shadow-md">
                <MapPin size={14} className="text-[#f97316]" />
                {primaryLocation.location_name}
                {primaryLocation.is_primary && selectedLocationId === null && (
                  <span className="flex items-center gap-1 bg-white text-[#ea580c] text-[10px] font-black px-2 py-0.5 rounded-full">
                    <Star size={8} className="fill-[#ea580c]" /> Primary
                  </span>
                )}
                {selectedLocationId !== null && (
                  <button
                    type="button"
                    onClick={() => setSelectedLocationId(null)}
                    className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white text-[10px] font-black px-2 py-0.5 rounded-full transition-all cursor-pointer"
                  >
                    ✕ Reset
                  </button>
                )}
              </div>
            </motion.div>

            {/* Address Card */}
            <motion.div
              custom={0}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              whileHover={{ scale: 1.01 }}
              className="bg-white p-6 rounded-2xl shadow-sm flex items-start space-x-4 border-l-4 border-[#0a2d5c] border border-slate-100"
            >
              <div className="bg-orange-50 p-3 rounded-xl text-[#f97316] shrink-0">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#0a2d5c] mb-1">Office Location</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">{primaryLocation.address}</p>
              </div>
            </motion.div>

            {/* Phone Card */}
            {(primaryLocation.primary_phone || primaryLocation.secondary_phone) && (
              <motion.div
                custom={1}
                initial="hidden"
                animate="visible"
                variants={cardVariants}
                whileHover={{ scale: 1.01 }}
                className="bg-white p-6 rounded-2xl shadow-sm flex items-start space-x-4 border-l-4 border-[#0a2d5c] border border-slate-100"
              >
                <div className="bg-orange-50 p-3 rounded-xl text-[#f97316] shrink-0">
                  <Phone size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#0a2d5c] mb-1">Phone</h3>
                  {primaryLocation.primary_phone && (
                    <p className="text-sm text-slate-700 font-bold">{primaryLocation.primary_phone}</p>
                  )}
                  {primaryLocation.secondary_phone && (
                    <p className="text-sm text-slate-700 font-bold">{primaryLocation.secondary_phone}</p>
                  )}
                  {primaryLocation.whatsapp_number && (
                    <a
                      href={`https://wa.me/${primaryLocation.whatsapp_number.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-2.5 text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full hover:bg-green-100 transition-all cursor-pointer"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      WhatsApp
                    </a>
                  )}
                </div>
              </motion.div>
            )}

            {/* Email Card */}
            {primaryLocation.email && (
              <motion.div
                custom={2}
                initial="hidden"
                animate="visible"
                variants={cardVariants}
                whileHover={{ scale: 1.01 }}
                className="bg-white p-6 rounded-2xl shadow-sm flex items-start space-x-4 border-l-4 border-[#0a2d5c] border border-slate-100"
              >
                <div className="bg-orange-50 p-3 rounded-xl text-[#f97316] shrink-0">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#0a2d5c] mb-1">Email</h3>
                  <a
                    href={`mailto:${primaryLocation.email}`}
                    className="text-sm text-slate-700 font-bold hover:text-[#ea580c] transition-colors"
                  >
                    {primaryLocation.email}
                  </a>
                </div>
              </motion.div>
            )}

            {/* Social Media Card */}
            {(primaryLocation.facebook_url || primaryLocation.twitter_url ||
              primaryLocation.instagram_url || primaryLocation.linkedin_url) && (
              <motion.div
                custom={3}
                initial="hidden"
                animate="visible"
                variants={cardVariants}
                whileHover={{ scale: 1.01 }}
                className="bg-white p-6 rounded-2xl shadow-sm flex items-start space-x-4 border-l-4 border-[#0a2d5c] border border-slate-100"
              >
                <div className="bg-orange-50 p-3 rounded-xl text-[#f97316] shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#0a2d5c] mb-3">Follow Us</h3>
                  <div className="flex items-center gap-3">
                    {primaryLocation.facebook_url && (
                      <a href={primaryLocation.facebook_url} target="_blank" rel="noopener noreferrer"
                        className="bg-[#0a2d5c] text-white p-2.5 rounded-full hover:bg-[#081f3d] transition-all hover:scale-105" title="Facebook">
                        <Facebook size={16} />
                      </a>
                    )}
                    {primaryLocation.twitter_url && (
                      <a href={primaryLocation.twitter_url} target="_blank" rel="noopener noreferrer"
                        className="bg-slate-800 text-white p-2.5 rounded-full hover:bg-slate-900 transition-all hover:scale-105" title="Twitter / X">
                        <Twitter size={16} />
                      </a>
                    )}
                    {primaryLocation.instagram_url && (
                      <a href={primaryLocation.instagram_url} target="_blank" rel="noopener noreferrer"
                        className="bg-pink-600 text-white p-2.5 rounded-full hover:bg-pink-700 transition-all hover:scale-105" title="Instagram">
                        <Instagram size={16} />
                      </a>
                    )}
                    {primaryLocation.linkedin_url && (
                      <a href={primaryLocation.linkedin_url} target="_blank" rel="noopener noreferrer"
                        className="bg-[#0a2d5c] text-white p-2.5 rounded-full hover:bg-[#081f3d] transition-all hover:scale-105" title="LinkedIn">
                        <Linkedin size={16} />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Other Locations Mini List */}
            {displayLocations.length > 1 && (
              <motion.div
                custom={3}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={cardVariants}
                className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-[#0a2d5c] border border-slate-100"
              >
                <h3 className="text-lg font-black text-[#0a2d5c] mb-3 flex items-center gap-2">
                  <MapPin size={18} className="text-[#f97316]" />
                  Our Other Locations
                </h3>
                <div className="space-y-2">
                  {displayLocations
                    .filter(loc => loc.id !== defaultPrimary.id)
                    .map((loc) => {
                      const isActive = primaryLocation.id === loc.id;
                      return (
                        <button
                          key={loc.id}
                          type="button"
                          onClick={() =>
                            setSelectedLocationId(isActive ? null : loc.id)
                          }
                          className={`w-full text-left flex items-start gap-2.5 px-4 py-3 rounded-xl transition-all text-sm cursor-pointer
                            ${isActive
                              ? "bg-[#0a2d5c] text-white shadow-md shadow-[#0a2d5c]/20"
                              : "bg-slate-50 text-slate-700 hover:bg-orange-50 hover:text-[#0a2d5c]"
                            }`}
                        >
                          <MapPin size={14} className={`shrink-0 mt-0.5 ${isActive ? "text-[#f97316]" : "text-[#f97316]"}`} />
                          <div>
                            <p className={`font-bold ${isActive ? "text-white" : "text-[#0a2d5c]"}`}>{loc.location_name}</p>
                            <p className={`text-xs ${isActive ? "text-slate-300" : "text-slate-500"}`}>{loc.address}</p>
                            {loc.primary_phone && (
                              <p className={`text-xs ${isActive ? "text-slate-300" : "text-slate-500"}`}>{loc.primary_phone}</p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                </div>
              </motion.div>
            )}
          </div>

          {/* ── RIGHT: Contact Form ── */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={cardVariants}
            custom={4}
            className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 border-t-4 border-t-[#0a2d5c]"
          >
            <h2 className="text-2xl sm:text-3xl font-black text-[#0a2d5c] mb-2">Send a Message</h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mb-6">Fill out the form below and our counseling team will get in touch.</p>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-[#0a2d5c] uppercase tracking-wider ml-1">Full Name</label>
                  <input
                    type="text" name="name" placeholder="Enter your name"
                    value={formData.name} onChange={handleChange} required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#0a2d5c] focus:bg-white focus:ring-2 focus:ring-[#0a2d5c]/10 outline-none transition-all placeholder:text-slate-400 text-slate-900 font-medium text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black text-[#0a2d5c] uppercase tracking-wider ml-1">Email Address</label>
                  <input
                    type="email" name="email" placeholder="Enter your email"
                    value={formData.email} onChange={handleChange} required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#0a2d5c] focus:bg-white focus:ring-2 focus:ring-[#0a2d5c]/10 outline-none transition-all placeholder:text-slate-400 text-slate-900 font-medium text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-[#0a2d5c] uppercase tracking-wider ml-1">Phone Number</label>
                  <input
                    type="tel" name="phone" placeholder="Enter phone number"
                    value={formData.phone} onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#0a2d5c] focus:bg-white focus:ring-2 focus:ring-[#0a2d5c]/10 outline-none transition-all placeholder:text-slate-400 text-slate-900 font-medium text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black text-[#0a2d5c] uppercase tracking-wider ml-1">Subject</label>
                  <input
                    type="text" name="subject" placeholder="How can we help?"
                    value={formData.subject} onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#0a2d5c] focus:bg-white focus:ring-2 focus:ring-[#0a2d5c]/10 outline-none transition-all placeholder:text-slate-400 text-slate-900 font-medium text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-[#0a2d5c] uppercase tracking-wider ml-1">Message</label>
                <textarea
                  name="message" rows={4} placeholder="Write your message here..."
                  value={formData.message} onChange={handleChange} required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#0a2d5c] focus:bg-white focus:ring-2 focus:ring-[#0a2d5c]/10 outline-none transition-all placeholder:text-slate-400 text-slate-900 font-medium text-sm"
                />
              </div>

              {/* Captcha */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="bg-slate-100 px-6 py-2.5 border border-dashed border-slate-400 rounded-xl font-mono italic text-xl font-bold tracking-[0.3em] text-[#0a2d5c] select-none shadow-inner min-w-[140px] text-center">
                    {captcha}
                  </div>
                  <button
                    type="button"
                    onClick={() => { generateCaptcha(); setCaptchaInput(""); }}
                    className="p-2 text-slate-500 hover:text-[#0a2d5c] hover:bg-orange-50 rounded-full transition-all cursor-pointer"
                    title="Refresh Captcha"
                  >
                    <RefreshCw size={20} />
                  </button>
                </div>
                <input
                  type="text" placeholder="Enter Captcha"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#0a2d5c] focus:bg-white focus:ring-2 focus:ring-[#0a2d5c]/10 outline-none w-full sm:w-48 text-slate-900 text-sm font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white font-black py-4 rounded-xl transition-all flex items-center justify-center gap-2.5 shadow-lg shadow-orange-600/25 active:scale-[0.99] uppercase tracking-wider text-sm cursor-pointer"
              >
                Send Message <Send size={16} />
              </button>
            </form>
          </motion.div>
        </div>

        {/* ── Google Map for Primary Location ── */}
        {primaryLocation.map_embed_url && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <MapPin size={20} className="text-[#f97316]" />
              <h3 className="font-black text-[#0a2d5c] text-lg uppercase tracking-wide">
                {primaryLocation.location_name} — Map
              </h3>
            </div>
            <div className="w-full h-[400px] bg-slate-200 relative rounded-2xl overflow-hidden shadow-sm border border-slate-200">
              <iframe
                title={`${primaryLocation.location_name} Map`}
                src={primaryLocation.map_embed_url}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale hover:grayscale-0 transition-all duration-500"
              />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ContactPage;
