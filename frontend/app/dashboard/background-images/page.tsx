"use client";

import React, { useEffect, useState, useRef } from "react";
import { Trash2, Plus, CheckCircle, Upload } from "lucide-react";

interface BgImage {
  id: number;
  name: string;
  category: string;
  image_url: string;
  is_active: boolean;
  created_at: string;
}

export default function BackgroundImagesPage() {
  const [images, setImages] = useState<BgImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", category: "ID Card" });
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const API = process.env.NEXT_PUBLIC_API_URL;

  const fetchImages = async () => {
    try {
      const res = await fetch(`${API}/api/background-images`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setImages(data.images || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchImages(); }, []);

  const handleUpload = async () => {
    if (!file) { setError("Please select an image."); return; }
    setUploading(true); setError(""); setSuccess("");
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("name", form.name || file.name);
      formData.append("category", form.category);

      const res = await fetch(`${API}/api/background-images`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setSuccess("Image uploaded successfully!");
      setFile(null);
      setForm({ name: "", category: "ID Card" });
      setShowForm(false);
      fetchImages();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSetActive = async (id: number) => {
    try {
      await fetch(`${API}/api/background-images/${id}/set-active`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Background image set as active for ID cards!");
      fetchImages();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this image?")) return;
    try {
      await fetch(`${API}/api/background-images/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchImages();
    } catch (err) {
      console.error(err);
    }
  };

  const getImageUrl = (url: string) =>
    url ? `${API}${url.replace(/\\/g, "/")}` : "";

  return (
    <div className="py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Background Images</h1>
          <p className="text-gray-500 text-sm mt-1">
            Upload and manage background images for student ID cards
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-all"
        >
          <Plus className="w-4 h-4" />
          {showForm ? "Cancel" : "Add Image"}
        </button>
      </div>

      {/* Active image notice */}
      {images.some(i => i.is_active) && (
        <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          Active background image is set — student ID cards will use this image.
        </div>
      )}

      {success && (
        <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          ✅ {success}
        </div>
      )}
      {error && (
        <div className="mb-4 px-4 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Upload Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Upload New Background Image</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Image Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Blue Theme ID Background"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Category</label>
          <select
  value={form.category}
  onChange={(e) => setForm({ ...form, category: e.target.value })}
  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white"
>
  <option value="ID Card">ID Card</option>
  <option value="Fees Receipt">Fees Receipt</option>
  <option value="Certificate">Certificate</option>
  <option value="Homepage">Homepage</option>
  <option value="General">General</option>
</select>
            </div>
          </div>

          {/* File Upload */}
          <div
            className={`border-2 border-dashed rounded-xl px-4 py-8 text-center cursor-pointer transition-all mb-4 ${
              file ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-gray-50 hover:border-gray-300"
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.gif"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            {file ? (
              <div>
                <div className="text-4xl mb-2">🖼️</div>
                <p className="text-sm font-semibold text-gray-800">{file.name}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {(file.size / 1024).toFixed(0)} KB · Click to change
                </p>
                {/* Preview */}
                <img
                  src={URL.createObjectURL(file)}
                  alt="preview"
                  className="mt-3 mx-auto max-h-32 rounded-lg object-contain border border-gray-200"
                />
              </div>
            ) : (
              <div>
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-600">Click to upload image</p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP — Max 10MB</p>
              </div>
            )}
          </div>

          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-all"
          >
            {uploading ? "Uploading..." : "Upload Image"}
          </button>
        </div>
      )}

      {/* Images Grid */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading images...</div>
      ) : images.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <div className="text-5xl mb-4">🖼️</div>
          <p className="text-gray-400 font-medium">No background images uploaded yet.</p>
          <p className="text-gray-400 text-sm mt-1">Click "Add Image" to upload your first background.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image) => (
            <div
              key={image.id}
              className={`group bg-white rounded-2xl overflow-hidden shadow-sm border transition-all duration-300 hover:shadow-xl ${
                image.is_active
                  ? "border-green-400 ring-2 ring-green-300"
                  : "border-slate-100"
              }`}
            >
              {/* Image Preview */}
              <div className="aspect-video relative overflow-hidden bg-slate-100">
                <img
                  src={getImageUrl(image.image_url)}
                  alt={image.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Active badge */}
                {image.is_active && (
                  <div className="absolute top-3 left-3 flex items-center gap-1 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                    <CheckCircle className="w-3 h-3" /> Active
                  </div>
                )}

                <span className="absolute top-3 right-3 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-bold text-blue-600 uppercase tracking-widest shadow-sm">
                  {image.category}
                </span>
              </div>

              {/* Details */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h3 className="text-slate-800 font-bold leading-tight group-hover:text-blue-600 transition-colors text-sm">
                      {image.name}
                    </h3>
                    <p className="text-slate-400 text-xs mt-1">
                      {new Date(image.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(image.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Set Active Button */}
                {!image.is_active ? (
                  <button
                    onClick={() => handleSetActive(image.id)}
                    className="w-full text-sm border border-blue-200 text-blue-600 py-2 rounded-lg hover:bg-blue-50 font-semibold transition-all"
                  >
                   ✅ Set as Active for {image.category}
                  </button>
                ) : (
                  <div className="w-full text-sm bg-green-50 text-green-700 py-2 rounded-lg font-semibold text-center border border-green-200">
                    ✓ Currently Active
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
