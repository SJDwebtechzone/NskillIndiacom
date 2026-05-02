"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Save, MapPin, Phone, Mail, Loader2, Inbox, User, BookOpen,
  MessageSquare, Clock, Plus, Pencil, Trash2, Star, X,
  ChevronDown, ChevronUp, Facebook, Twitter, Instagram, Linkedin
} from "lucide-react";

// FIX 1: API base from env variable, not hardcoded
const API_BASE = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api`
  : "http://localhost:5000/api";

// ─── Types ───────────────────────────────────────────────
interface Location {
  id?: number;
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
  sort_order: number;
}

interface Enquiry {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  created_at: string;
}

const emptyLocation: Location = {
  location_name: "",
  address: "",
  primary_phone: "",
  secondary_phone: "",
  whatsapp_number: "",
  email: "",
  map_embed_url: "",
  facebook_url: "",
  twitter_url: "",
  instagram_url: "",
  linkedin_url: "",
  is_primary: false,
  sort_order: 0,
};

// ─── Social Icons Helper (FIX 8: extracted as proper component) ──
function SocialIcons({ loc }: { loc: Location }) {
  const links = [
    { url: loc.facebook_url,  icon: <Facebook  size={12} />, bg: "bg-blue-600"  },
    { url: loc.twitter_url,   icon: <Twitter   size={12} />, bg: "bg-slate-800" },
    { url: loc.instagram_url, icon: <Instagram size={12} />, bg: "bg-pink-500"  },
    { url: loc.linkedin_url,  icon: <Linkedin  size={12} />, bg: "bg-blue-700"  },
  ].filter((s) => s.url);

  if (links.length === 0) return null;
  return (
    <div className="flex items-center gap-1.5 mt-1">
      {links.map((s, i) => (
        <span key={i} className={`${s.bg} text-white p-1 rounded-full`}>
          {s.icon}
        </span>
      ))}
    </div>
  );
}

// ─── Confirm Delete Modal (FIX 3: replaces confirm()) ────
function ConfirmModal({
  onConfirm,
  onCancel,
  loading,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm p-8 space-y-4">
        <h3 className="text-lg font-black text-black">Delete Location?</h3>
        <p className="text-slate-500 font-medium text-sm">
          This action cannot be undone.
        </p>
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-600 hover:bg-slate-100 transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Location Form Modal ──────────────────────────────────
function LocationModal({
  initial,
  onSave,
  onClose,
  saving,
}: {
  initial: Location;
  onSave: (data: Location) => void;
  onClose: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<Location>(initial);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      // FIX 6: cast sort_order to number, handle checkbox properly
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : name === "sort_order"
          ? Number(value)
          : value,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        {/* Modal Header */}
        <div className="flex items-center justify-between p-8 border-b border-slate-100">
          <h3 className="text-xl font-black text-black flex items-center gap-2">
            <MapPin className="text-blue-600" size={20} />
            {initial.id ? "Edit Location" : "Add New Location"}
          </h3>
          <button type="button" onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-8 space-y-5">

          {/* Location Name + Sort Order */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1 col-span-2 md:col-span-1">
              <label className="text-xs font-black uppercase tracking-widest text-black ml-1">
                Location Name *
              </label>
              {/* FIX 7: was "bg-slateate-50" (typo), corrected to "bg-slate-50" */}
              <input name="location_name" value={form.location_name} onChange={handleChange}
                placeholder="e.g. Head Office / Branch - Velachery" required
                className="w-full px-5 py-3 bg-slate-50 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold text-black outline-none transition-all" />
            </div>
            <div className="space-y-1 col-span-2 md:col-span-1">
              <label className="text-xs font-black uppercase tracking-widest text-black ml-1">Sort Order</label>
              <input name="sort_order" type="number" value={form.sort_order} onChange={handleChange}
                placeholder="0"
                className="w-full px-5 py-3 bg-slate-50 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold text-black outline-none transition-all" />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-1">
            <label className="text-xs font-black uppercase tracking-widest text-black ml-1">Full Address *</label>
            <textarea name="address" value={form.address} onChange={handleChange}
              placeholder="Enter full address" rows={3} required
              className="w-full px-5 py-3 bg-slate-50 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold text-black outline-none transition-all resize-none" />
          </div>

          {/* Phones */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-black uppercase tracking-widest text-black ml-1">Primary Phone</label>
              <input name="primary_phone" value={form.primary_phone} onChange={handleChange}
                placeholder="+91 98842 09774"
                className="w-full px-5 py-3 bg-slate-50 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold text-black outline-none transition-all" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black uppercase tracking-widest text-black ml-1">Secondary Phone</label>
              <input name="secondary_phone" value={form.secondary_phone} onChange={handleChange}
                placeholder="+91 80560 63023"
                className="w-full px-5 py-3 bg-slate-50 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold text-black outline-none transition-all" />
            </div>
          </div>

          {/* WhatsApp + Email */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-black uppercase tracking-widest text-green-600 ml-1">WhatsApp Number</label>
              <input name="whatsapp_number" value={form.whatsapp_number} onChange={handleChange}
                placeholder="10 digit number"
                className="w-full px-5 py-3 bg-green-50 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-green-500 font-bold text-black outline-none transition-all" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black uppercase tracking-widest text-black ml-1">Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange}
                placeholder="branch@example.com"
                className="w-full px-5 py-3 bg-slate-50 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold text-black outline-none transition-all" />
            </div>
          </div>

          {/* Map Embed URL */}
          <div className="space-y-1">
            <label className="text-xs font-black uppercase tracking-widest text-black ml-1">Google Maps Embed URL</label>
           <input name="map_embed_url" value={form.map_embed_url ?? ""} onChange={handleChange}
              placeholder="https://www.google.com/maps/embed?..."
              className="w-full px-5 py-3 bg-slate-50 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold text-black outline-none transition-all" />
            <p className="text-[10px] text-slate-400 italic font-bold ml-1">
              Google Maps → Share → Embed a map → Copy the &apos;src&apos; attribute
            </p>
          </div>

          {/* Social Media URLs */}
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3 ml-1 flex items-center gap-2">
              <span className="w-16 h-px bg-slate-200 inline-block" />
              Social Media Links (Optional)
              <span className="flex-1 h-px bg-slate-200 inline-block" />
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-widest text-blue-600 ml-1 flex items-center gap-1">
                  <Facebook size={11} /> Facebook
                </label>
                <input name="facebook_url" value={form.facebook_url} onChange={handleChange}
                  placeholder="https://facebook.com/yourpage"
                  className="w-full px-5 py-3 bg-blue-50 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold text-black outline-none transition-all text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-widest text-slate-700 ml-1 flex items-center gap-1">
                  <Twitter size={11} /> Twitter / X
                </label>
                <input name="twitter_url" value={form.twitter_url} onChange={handleChange}
                  placeholder="https://twitter.com/yourhandle"
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-slate-500 font-bold text-black outline-none transition-all text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-widest text-pink-500 ml-1 flex items-center gap-1">
                  <Instagram size={11} /> Instagram
                </label>
                <input name="instagram_url" value={form.instagram_url} onChange={handleChange}
                  placeholder="https://instagram.com/yourprofile"
                  className="w-full px-5 py-3 bg-pink-50 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-pink-400 font-bold text-black outline-none transition-all text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-widest text-blue-700 ml-1 flex items-center gap-1">
                  <Linkedin size={11} /> LinkedIn
                </label>
                <input name="linkedin_url" value={form.linkedin_url} onChange={handleChange}
                  placeholder="https://linkedin.com/company/yourco"
                  className="w-full px-5 py-3 bg-blue-50 border border-blue-200 rounded-2xl focus:ring-2 focus:ring-blue-700 font-bold text-black outline-none transition-all text-sm" />
              </div>
            </div>
          </div>

          {/* Primary Toggle */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div className="relative">
              <input type="checkbox" name="is_primary" checked={form.is_primary}
                onChange={handleChange} className="sr-only" />
              <div className={`w-12 h-6 rounded-full transition-all ${form.is_primary ? "bg-yellow-400" : "bg-slate-200"}`}>
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.is_primary ? "translate-x-6" : ""}`} />
              </div>
            </div>
            <div>
              <p className="font-black text-black text-sm flex items-center gap-1">
                <Star size={14} className={form.is_primary ? "text-yellow-500 fill-yellow-500" : "text-slate-400"} />
                Mark as Primary Location
              </p>
              <p className="text-xs text-slate-400 font-medium">This will be shown first on the contact page</p>
            </div>
          </label>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 p-8 border-t border-slate-100">
          <button type="button" onClick={onClose}
            className="px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-600 hover:bg-slate-100 transition-all">
            Cancel
          </button>
          <button type="button" onClick={() => onSave(form)}
            disabled={saving || !form.location_name || !form.address}
            className="flex items-center gap-2 px-8 py-3 bg-[#0b1f3a] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all disabled:opacity-50">
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            {initial.id ? "Update Location" : "Add Location"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────
export default function ContactSettingsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [locLoading, setLocLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // FIX 3: proper confirm modal state instead of confirm()
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location>(emptyLocation);

  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [enquiriesLoading, setEnquiriesLoading] = useState(true);
  const [expandedEnquiry, setExpandedEnquiry] = useState<number | null>(null);

  // FIX 2: wrapped in useCallback so they're stable for useEffect deps
  const fetchLocations = useCallback(async () => {
    setLocLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/settings/locations`);
      // FIX 5: guard against non-array response
      setLocations(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch locations", err);
      setLocations([]);
    } finally {
      setLocLoading(false);
    }
  }, []);

  const fetchEnquiries = useCallback(async () => {
    setEnquiriesLoading(true);
    try {
      const res = await fetch(`${API_BASE}/settings/enquiry`);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      // FIX 4: guard against non-array response
      setEnquiries(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching enquiries:", err);
      setEnquiries([]);
    } finally {
      setEnquiriesLoading(false);
    }
  }, []);

  // FIX 2: stable references now safe in deps array
  useEffect(() => {
    fetchLocations();
    fetchEnquiries();
  }, [fetchLocations, fetchEnquiries]);

  const handleOpenAdd = () => {
    setEditingLocation({ ...emptyLocation, sort_order: locations.length });
    setModalOpen(true);
  };

  const handleOpenEdit = (loc: Location) => {
   setEditingLocation({
    ...loc,
    facebook_url:  loc.facebook_url  || "",
    twitter_url:   loc.twitter_url   || "",
    instagram_url: loc.instagram_url || "",
    linkedin_url:  loc.linkedin_url  || "",
    map_embed_url: loc.map_embed_url || "",
  });
  setModalOpen(true);
  
  };

  const handleSaveLocation = async (data: Location) => {
    setSaving(true);
    try {
      if (data.id) {
        await axios.put(`${API_BASE}/settings/locations/${data.id}`, data);
      } else {
        await axios.post(`${API_BASE}/settings/locations`, data);
      }
      setModalOpen(false);
      await fetchLocations();
    } catch (err) {
      console.error("Save location error:", err);
      alert("Failed to save location.");
    } finally {
      setSaving(false);
    }
  };

  // FIX 3: delete now triggered from ConfirmModal, no confirm()
  const handleDelete = async () => {
    // FIX 9: guard against undefined id
    if (confirmDeleteId === null) return;
    setDeleteLoading(true);
    try {
      await axios.delete(`${API_BASE}/settings/locations/${confirmDeleteId}`);
      setConfirmDeleteId(null);
      await fetchLocations();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete location.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-10">

      {/* FIX 3: Confirm delete modal */}
      {confirmDeleteId !== null && (
        <ConfirmModal
          onConfirm={handleDelete}
          onCancel={() => setConfirmDeleteId(null)}
          loading={deleteLoading}
        />
      )}

      {modalOpen && (
        <LocationModal
          initial={editingLocation}
          onSave={handleSaveLocation}
          onClose={() => setModalOpen(false)}
          saving={saving}
        />
      )}

      <div>
        <h1 className="text-3xl font-black text-black">Contact Settings</h1>
        <p className="text-slate-500 font-medium">Manage multiple office locations and enquiries</p>
      </div>

      {/* ── LOCATIONS SECTION ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-black flex items-center gap-2">
              <MapPin className="text-blue-600" size={22} />
              Office Locations
              {!locLoading && (
                <span className="text-sm font-bold bg-blue-100 text-blue-600 px-3 py-1 rounded-full ml-1">
                  {locations.length}
                </span>
              )}
            </h2>
            <p className="text-slate-500 font-medium text-sm">All locations shown on the contact page</p>
          </div>
          <button type="button" onClick={handleOpenAdd}
            className="flex items-center gap-2 px-6 py-3 bg-[#0b1f3a] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg">
            <Plus size={16} /> Add Location
          </button>
        </div>

        {locLoading && (
          <div className="flex items-center justify-center py-16 bg-white rounded-[2.5rem] shadow-xl border border-slate-100">
            <Loader2 className="animate-spin text-blue-600" size={36} />
          </div>
        )}

        {!locLoading && locations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[2.5rem] shadow-xl border border-slate-100 space-y-4">
            <MapPin size={48} className="text-slate-300" />
            <p className="text-slate-400 font-bold text-lg">No locations added yet</p>
            <button type="button" onClick={handleOpenAdd}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all">
              <Plus size={14} /> Add Your First Location
            </button>
          </div>
        )}

        {!locLoading && locations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {locations.map((loc) => (
              <div key={loc.id}
                className={`bg-white p-6 rounded-[2rem] shadow-xl border transition-all
                  ${loc.is_primary
                    ? "border-yellow-400 border-2 ring-2 ring-yellow-100"
                    : "border-slate-100 border-l-4 border-l-blue-500"
                  }`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-black text-lg">{loc.location_name}</h3>
                      {loc.is_primary && (
                        <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded-full">
                          <Star size={10} className="fill-yellow-500 text-yellow-500" /> Primary
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 font-medium">Sort #{loc.sort_order}</p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => handleOpenEdit(loc)}
                      className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all" title="Edit">
                      <Pencil size={15} />
                    </button>
                    {/* FIX 3 & 9: open confirm modal, guard id */}
                    <button
                      type="button"
                      onClick={() => loc.id !== undefined && setConfirmDeleteId(loc.id)}
                      disabled={deleteLoading && confirmDeleteId === loc.id}
                      className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-all disabled:opacity-50"
                      title="Delete"
                    >
                      {deleteLoading && confirmDeleteId === loc.id
                        ? <Loader2 size={15} className="animate-spin" />
                        : <Trash2 size={15} />
                      }
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-sm text-slate-600">
                    <MapPin size={14} className="text-blue-400 mt-0.5 shrink-0" />
                    <span className="font-medium line-clamp-2">{loc.address}</span>
                  </div>
                  {loc.primary_phone && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone size={14} className="text-green-400 shrink-0" />
                      <span className="font-medium">
                        {loc.primary_phone}
                        {loc.secondary_phone && (
                          <span className="text-slate-400"> / {loc.secondary_phone}</span>
                        )}
                      </span>
                    </div>
                  )}
                  {loc.email && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail size={14} className="text-purple-400 shrink-0" />
                      <span className="font-medium truncate">{loc.email}</span>
                    </div>
                  )}
                  {/* FIX 8: now a proper component */}
                  <SocialIcons loc={loc} />
                  {loc.map_embed_url && (
                    <div className="mt-3 rounded-xl overflow-hidden h-28">
                      <iframe
                        src={loc.map_embed_url}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="grayscale hover:grayscale-0 transition-all duration-500"
                        title={loc.location_name}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── ENQUIRIES SECTION ── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-black flex items-center gap-2">
              <MessageSquare className="text-blue-600" size={24} /> Enquiries
              {!enquiriesLoading && (
                <span className="text-sm font-bold bg-blue-100 text-blue-600 px-3 py-1 rounded-full">
                  {enquiries.length}
                </span>
              )}
            </h2>
            <p className="text-slate-500 font-medium">Messages from the contact form</p>
          </div>
          <button type="button" onClick={fetchEnquiries}
            className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all">
            <Loader2 size={14} className={enquiriesLoading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {enquiriesLoading && (
          <div className="flex items-center justify-center py-16 bg-white rounded-[2.5rem] shadow-xl border border-slate-100">
            <Loader2 className="animate-spin text-blue-600" size={36} />
          </div>
        )}

        {!enquiriesLoading && enquiries.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[2.5rem] shadow-xl border border-slate-100 space-y-4">
            <Inbox size={48} className="text-slate-300" />
            <p className="text-slate-400 font-bold text-lg">No enquiries yet</p>
            <p className="text-slate-400 text-sm">Messages from your contact form will appear here</p>
          </div>
        )}

        {!enquiriesLoading && enquiries.length > 0 && (
          <div className="grid gap-4">
            {enquiries.map((item, i) => (
              <div key={i}
                className="bg-white rounded-[2rem] shadow-xl border border-slate-100 border-l-4 border-l-blue-500 overflow-hidden">
                <div
                  className="flex items-start justify-between flex-wrap gap-2 p-6 cursor-pointer hover:bg-slate-50 transition-all"
                  onClick={() => setExpandedEnquiry(expandedEnquiry === i ? null : i)}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-50 p-2 rounded-full text-blue-500">
                      <User size={18} />
                    </div>
                    <div>
                      <p className="font-black text-black">{item.name}</p>
                      <p className="text-xs text-slate-400 font-medium">{item.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-xs text-slate-400 font-bold">
                      <Clock size={12} />
                      {new Date(item.created_at).toLocaleString("en-IN", {
                        day: "2-digit", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </div>
                    {expandedEnquiry === i
                      ? <ChevronUp size={16} className="text-slate-400" />
                      : <ChevronDown size={16} className="text-slate-400" />
                    }
                  </div>
                </div>
                {expandedEnquiry === i && (
                  <div className="px-6 pb-6 space-y-3 border-t border-slate-100 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                        <Phone size={14} className="text-green-400 shrink-0" />
                        <span>{item.phone || "—"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                        <BookOpen size={14} className="text-purple-400 shrink-0" />
                        <span className="truncate">{item.subject || "—"}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 bg-slate-50 rounded-2xl px-5 py-4">
                      <MessageSquare size={16} className="text-slate-400 mt-0.5 shrink-0" />
                      <p className="text-sm text-slate-700 font-medium leading-relaxed">{item.message}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
