
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, Variants } from "framer-motion";
import {
  MapPin, Phone, Mail, Send, RefreshCw,
  Facebook, Twitter, Instagram, Linkedin, Star
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

  // ─── KEY LOGIC: Pick primary location, fallback to first, then hardcoded ───
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

  // Default = admin-marked primary. User can override by clicking "Other Locations"
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
      <div className="relative h-[280px] md:h-[350px] flex flex-col items-center justify-center text-white overflow-hidden">
        <img
          src="/images/contact/contactus.jpg"
          alt="Contact Us"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#0b1f3a]/75" />
        <div className="absolute bottom-0 left-0 w-full h-1 bg-[#0b1f3a]" />
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative text-orange-400 text-xs font-bold uppercase tracking-widest mb-3 z-10"
        >
          Get In Touch
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative text-4xl md:text-5xl font-black mb-3 z-10 uppercase tracking-tight"
        >
          Contact Us
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="relative text-slate-300 z-10 text-sm"
        >
          We&apos;re here to help you
        </motion.p>
      </div>

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
              <div className="flex items-center gap-2 bg-[#0b1f3a] text-white px-4 py-2 rounded-full text-sm font-bold">
                <MapPin size={14} />
                {primaryLocation.location_name}
                {primaryLocation.is_primary && selectedLocationId === null && (
                  <span className="flex items-center gap-1 bg-yellow-400 text-yellow-900 text-[10px] font-black px-2 py-0.5 rounded-full">
                    <Star size={8} className="fill-yellow-900" /> Primary
                  </span>
                )}
                {selectedLocationId !== null && (
                  <button
                    type="button"
                    onClick={() => setSelectedLocationId(null)}
                    className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white text-[10px] font-black px-2 py-0.5 rounded-full transition-all"
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
              whileHover={{ scale: 1.02 }}
              className="bg-white p-6 rounded-lg shadow-sm flex items-start space-x-4 border-l-4 border-[#0b1f3a]"
            >
              <div className="bg-orange-50 p-3 rounded-full text-orange-500 shrink-0">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0b1f3a] mb-1">Office Location</h3>
                <p className="text-sm text-gray-600">{primaryLocation.address}</p>
              </div>
            </motion.div>

            {/* Phone Card */}
            {(primaryLocation.primary_phone || primaryLocation.secondary_phone) && (
              <motion.div
                custom={1}
                initial="hidden"
                animate="visible"
                variants={cardVariants}
                whileHover={{ scale: 1.02 }}
                className="bg-white p-6 rounded-lg shadow-sm flex items-start space-x-4 border-l-4 border-[#0b1f3a]"
              >
                <div className="bg-orange-50 p-3 rounded-full text-orange-500 shrink-0">
                  <Phone size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#0b1f3a] mb-1">Phone</h3>
                  {primaryLocation.primary_phone && (
                    <p className="text-sm text-gray-600 font-semibold">{primaryLocation.primary_phone}</p>
                  )}
                  {primaryLocation.secondary_phone && (
                    <p className="text-sm text-gray-600 font-semibold">{primaryLocation.secondary_phone}</p>
                  )}
                  {primaryLocation.whatsapp_number && (
                    <a
                      href={`https://wa.me/${primaryLocation.whatsapp_number.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full hover:bg-green-100 transition-all"
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
                whileHover={{ scale: 1.02 }}
                className="bg-white p-6 rounded-lg shadow-sm flex items-start space-x-4 border-l-4 border-[#0b1f3a]"
              >
                <div className="bg-orange-50 p-3 rounded-full text-orange-500 shrink-0">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#0b1f3a] mb-1">Email</h3>
                  <a
                    href={`mailto:${primaryLocation.email}`}
                    className="text-sm text-gray-600 font-semibold hover:text-orange-500 transition-colors"
                  >
                    {primaryLocation.email}
                  </a>
                </div>
              </motion.div>
            )}

            {/* Social Media Card — shown only if at least one social URL exists */}
            {(primaryLocation.facebook_url || primaryLocation.twitter_url ||
              primaryLocation.instagram_url || primaryLocation.linkedin_url) && (
              <motion.div
                custom={3}
                initial="hidden"
                animate="visible"
                variants={cardVariants}
                whileHover={{ scale: 1.02 }}
                className="bg-white p-6 rounded-lg shadow-sm flex items-start space-x-4 border-l-4 border-[#0b1f3a]"
              >
                <div className="bg-orange-50 p-3 rounded-full text-orange-500 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#0b1f3a] mb-3">Follow Us</h3>
                  <div className="flex items-center gap-3">
                    {primaryLocation.facebook_url && (
                      <a href={primaryLocation.facebook_url} target="_blank" rel="noopener noreferrer"
                        className="bg-orange-500 text-white p-2 rounded-full hover:bg-orange-600 transition-all hover:scale-110" title="Facebook">
                        <Facebook size={18} />
                      </a>
                    )}
                    {primaryLocation.twitter_url && (
                      <a href={primaryLocation.twitter_url} target="_blank" rel="noopener noreferrer"
                        className="bg-slate-800 text-white p-2 rounded-full hover:bg-slate-900 transition-all hover:scale-110" title="Twitter / X">
                        <Twitter size={18} />
                      </a>
                    )}
                    {primaryLocation.instagram_url && (
                      <a href={primaryLocation.instagram_url} target="_blank" rel="noopener noreferrer"
                        className="bg-pink-500 text-white p-2 rounded-full hover:bg-pink-600 transition-all hover:scale-110" title="Instagram">
                        <Instagram size={18} />
                      </a>
                    )}
                    {primaryLocation.linkedin_url && (
                      <a href={primaryLocation.linkedin_url} target="_blank" rel="noopener noreferrer"
                        className="bg-orange-500 text-white p-2 rounded-full hover:bg-orange-600 transition-all hover:scale-110" title="LinkedIn">
                        <Linkedin size={18} />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Other Locations Mini List (shown only if 2+ locations exist) */}
            {displayLocations.length > 1 && (
              <motion.div
                custom={3}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={cardVariants}
                className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-[#0b1f3a]"
              >
                <h3 className="text-lg font-bold text-[#0b1f3a] mb-3 flex items-center gap-2">
                  <MapPin size={18} className="text-orange-500" />
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
                          className={`w-full text-left flex items-start gap-2 px-4 py-3 rounded-xl transition-all text-sm
                            ${isActive
                              ? "bg-[#0b1f3a] text-white"
                              : "bg-slate-50 text-slate-600 hover:bg-orange-50 hover:text-orange-600"
                            }`}
                        >
                          <MapPin size={13} className={`shrink-0 mt-0.5 ${isActive ? "text-orange-300" : "text-orange-500"}`} />
                          <div>
                            <p className={`font-bold ${isActive ? "text-white" : "text-[#0b1f3a]"}`}>{loc.location_name}</p>
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
            className="bg-white p-8 rounded-lg shadow-md border border-gray-200 border-t-4 border-t-[#0b1f3a]"
          >
            <h2 className="text-3xl font-bold text-[#0b1f3a] mb-4">Send a Message</h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#0b1f3a] uppercase tracking-wider ml-1">Full Name</label>
                  <input
                    type="text" name="name" placeholder="Enter your name"
                    value={formData.name} onChange={handleChange} required
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:border-[#0b1f3a] focus:ring-1 focus:ring-orange-500 outline-none transition-all placeholder:text-gray-400 text-gray-900 font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#0b1f3a] uppercase tracking-wider ml-1">Email Address</label>
                  <input
                    type="email" name="email" placeholder="Enter your email"
                    value={formData.email} onChange={handleChange} required
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:border-[#0b1f3a] focus:ring-1 focus:ring-orange-500 outline-none transition-all placeholder:text-gray-400 text-gray-900 font-medium"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#0b1f3a] uppercase tracking-wider ml-1">Phone Number</label>
                  <input
                    type="tel" name="phone" placeholder="Enter phone number"
                    value={formData.phone} onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:border-[#0b1f3a] focus:ring-1 focus:ring-orange-500 outline-none transition-all placeholder:text-gray-400 text-gray-900 font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#0b1f3a] uppercase tracking-wider ml-1">Subject</label>
                  <input
                    type="text" name="subject" placeholder="How can we help?"
                    value={formData.subject} onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:border-[#0b1f3a] focus:ring-1 focus:ring-orange-500 outline-none transition-all placeholder:text-gray-400 text-gray-900 font-medium"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#0b1f3a] uppercase tracking-wider ml-1">Message</label>
                <textarea
                  name="message" rows={4} placeholder="Write your message here..."
                  value={formData.message} onChange={handleChange} required
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:border-[#0b1f3a] focus:ring-1 focus:ring-orange-500 outline-none transition-all placeholder:text-gray-400 text-gray-900 font-medium"
                />
              </div>

              {/* Captcha */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="bg-gray-100 px-6 py-3 border border-dashed border-gray-400 rounded font-serif italic text-2xl tracking-[0.3em] text-gray-800 select-none shadow-inner min-w-[140px] text-center">
                    {captcha}
                  </div>
                  <button
                    type="button"
                    onClick={() => { generateCaptcha(); setCaptchaInput(""); }}
                    className="p-2 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-full transition-all"
                    title="Refresh Captcha"
                  >
                    <RefreshCw size={20} />
                  </button>
                </div>
                <input
                  type="text" placeholder="Enter Captcha"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  className="px-4 py-3 bg-white border border-gray-300 rounded focus:border-[#0b1f3a] focus:ring-1 focus:ring-orange-500 outline-none w-48 text-gray-900"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-orange-500 text-white font-bold py-4 rounded-xl hover:bg-orange-600 transition-all flex items-center justify-center gap-3 shadow-lg shadow-orange-500/20 hover:shadow-xl active:scale-[0.99]"
              >
                Send Message <Send size={18} />
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
              <MapPin size={18} className="text-orange-500" />
              <h3 className="font-bold text-[#0b1f3a] text-lg">
                {primaryLocation.location_name} — Map
              </h3>
            </div>
            <div className="w-full h-[400px] bg-gray-200 relative rounded-2xl overflow-hidden shadow-md">
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
