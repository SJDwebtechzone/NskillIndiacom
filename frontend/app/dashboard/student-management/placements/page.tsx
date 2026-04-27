"use client";
import { useEffect, useState } from "react";

interface Placement {
  id: number;
  company_name: string;
  position: string;
  salary: string;
  job_location: string;
  offer_letter_url: string;
  status: string;
  submitted_at: string;
}

export default function StudentPlacementPage() {
  const [form, setForm] = useState({
    company_name: "",
    position: "",
    salary: "",
    job_location: "",
  });
  const [offerLetter, setOfferLetter] = useState<File | null>(null);
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const API = process.env.NEXT_PUBLIC_API_URL;

  const fetchPlacements = async () => {
    try {
      const res = await fetch(`${API}/api/placement-feedback/placement/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setPlacements(data.placements || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlacements(); }, []);

  const handleSubmit = async () => {
    if (!form.company_name || !form.position || !form.salary || !form.job_location) {
      setError("All fields are required."); return;
    }
    setSaving(true); setError(""); setSuccess("");
    try {
      const formData = new FormData();
      formData.append("company_name", form.company_name);
      formData.append("position", form.position);
      formData.append("salary", form.salary);
      formData.append("job_location", form.job_location);
      if (offerLetter) formData.append("offer_letter", offerLetter);

      const res = await fetch(`${API}/api/placement-feedback/placement`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit");

      setSuccess("Placement details submitted successfully!");
      setForm({ company_name: "", position: "", salary: "", job_location: "" });
      setOfferLetter(null);
      setShowForm(false);
      fetchPlacements();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    if (status === "verified") return "bg-green-100 text-green-700";
    if (status === "rejected") return "bg-red-100 text-red-600";
    return "bg-yellow-100 text-yellow-700";
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Placement Details</h1>
          <p className="text-gray-500 text-sm mt-1">Upload your placement information and offer letter</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-all"
        >
          {showForm ? "Cancel" : "+ Add Placement"}
        </button>
      </div>

      {success && (
        <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          ✅ {success}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Add Placement Details</h2>
          {error && (
            <div className="mb-4 px-4 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { name: "company_name", label: "Company Name", placeholder: "e.g. TCS, Infosys" },
              { name: "position", label: "Position / Job Title", placeholder: "e.g. HVAC Technician" },
              { name: "salary", label: "Salary (CTC)", placeholder: "e.g. ₹3.5 LPA" },
              { name: "job_location", label: "Job Location", placeholder: "e.g. Chennai" },
            ].map((field) => (
              <div key={field.name}>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">{field.label} *</label>
                <input
                  value={form[field.name as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                  placeholder={field.placeholder}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
                />
              </div>
            ))}
          </div>

          <div className="mt-4">
            <label className="text-sm font-semibold text-gray-700 mb-1 block">
              Offer Letter (PDF/Image) — Optional
            </label>
            <div
              className={`border-2 border-dashed rounded-lg px-4 py-5 cursor-pointer text-center transition-all ${
                offerLetter ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-gray-50"
              }`}
              onClick={() => document.getElementById("offer-letter-input")?.click()}
            >
              <input
                id="offer-letter-input"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => setOfferLetter(e.target.files?.[0] || null)}
              />
              {offerLetter ? (
                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl">📄</span>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-800">{offerLetter.name}</p>
                    <p className="text-xs text-gray-400">{(offerLetter.size / 1024).toFixed(0)} KB · Click to change</p>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-semibold text-gray-600">⬆️ Click to upload offer letter</p>
                  <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG — Max 10MB</p>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full mt-5 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-all"
          >
            {saving ? "Submitting..." : "Submit Placement Details"}
          </button>
        </div>
      )}

      {/* Placements List */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading...</div>
      ) : placements.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <div className="text-5xl mb-4">🎯</div>
          <p className="text-gray-400 text-lg">No placements submitted yet.</p>
          <p className="text-gray-400 text-sm mt-1">Click "Add Placement" to submit your placement details.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {placements.map((p) => (
            <div key={p.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">{p.company_name}</h3>
                  <p className="text-blue-600 font-semibold text-sm">{p.position}</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusColor(p.status)}`}>
                  {p.status === "verified" ? "✅ Verified" : p.status === "rejected" ? "❌ Rejected" : "⏳ Pending"}
                </span>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                <span>💰 {p.salary}</span>
                <span>📍 {p.job_location}</span>
                <span>📅 {new Date(p.submitted_at).toLocaleDateString()}</span>
              </div>
              {p.offer_letter_url && (
                <a
                  href={`${API}${p.offer_letter_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 text-blue-600 text-xs font-semibold hover:underline"
                >
                  📄 View Offer Letter
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
