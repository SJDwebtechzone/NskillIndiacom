




"use client";

import { useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";

type FormType = {
  name: string;
  email: string;
  password: string;
  phone: string;
  status: string;
};

export default function PlacementRegister() {
  const router = useRouter();
  const [form, setForm] = useState<FormType>({
    name: "",
    email: "",
    password: "",
    phone: "",
    status: "",
  });
  const [loading, setLoading] = useState(false);
  const [tried, setTried] = useState(false);
  const [showPass, setShowPass] = useState(false);
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setTried(true);
    if (!form.name || !form.email || !form.password || !form.phone || !form.status) return;

    try {
      setLoading(true);
      const res = await fetch(`${API}/api/placement/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Something went wrong");
        setLoading(false);
        return;
      }
      alert("Registered Successfully!");
      setForm({ name: "", email: "", password: "", phone: "", status: "" });
      router.push("/placements/profile");
    } catch (err) {
      console.error(err);
      alert("Server Error");
    } finally {
      setLoading(false);
    }
  };

  const fieldBorderClass = (val: string) => {
    if (!tried) return "border-[#e0e0f0]";
    return !val ? "border-[#e24b4a]" : "border-indigo-500";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f0c29] via-[#1a1a3e] to-[#0f3460] p-4 md:p-8 relative overflow-hidden">
      {/* Blobs */}
      <div className="absolute w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.25)_0%,transparent_70%)] -top-24 -left-24 pointer-events-none" />
      <div className="absolute w-[350px] h-[350px] rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.2)_0%,transparent_70%)] -bottom-20 -right-20 pointer-events-none" />

      {/* Card */}
      <div className="flex flex-col md:flex-row w-full max-w-[820px] rounded-3xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.4)] relative z-10">

        {/* LEFT PANEL */}
        <div className="w-full md:w-[42%] bg-gradient-to-br from-[#7c3aed] via-[#4f46e5] to-[#2563eb] p-8 md:p-10 flex flex-col gap-6 justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-white inline-block" />
            <span className="text-white text-lg font-semibold tracking-widest">placement</span>
          </div>

          <div>
            <h2 className="text-[22px] font-semibold text-white leading-snug mb-2">
              Start your career<br />journey today.
            </h2>
            <p className="text-[13px] text-white/70 leading-relaxed">
              Build your profile once and apply to thousands of jobs with a single click.
            </p>
          </div>

          {/* Feature List */}
          <div className="flex flex-col gap-3">
            {[
              "Instant job alerts for your skills",
              "Easy one-click apply",
              "Career growth tracking",
              "Top company visibility",
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="w-[22px] h-[22px] rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-[13px] text-white/90">{f}</span>
              </div>
            ))}
          </div>

          <p className="text-[13px] text-white/70">
            Already have an account?{" "}
            <span
              className="text-white font-semibold cursor-pointer"
              onClick={() => router.push("/placements/login")}
            >
              Login →
            </span>
          </p>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-full md:w-[58%] bg-white flex items-center justify-center p-6 md:p-8 overflow-y-auto">
          <div className="w-full flex flex-col gap-3.5">
            <div>
              <h2 className="text-[22px] font-semibold text-[#1e1e2e] mb-1">Create your profile</h2>
              <p className="text-[13px] text-gray-400">It only takes a minute</p>
            </div>

            {/* Full Name */}
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-semibold text-[#555] tracking-[0.3px]">Full Name</label>
              <input
                name="name"
                value={form.name}
                placeholder="Enter your full name"
                onChange={handleChange}
                className={`w-full px-3 py-2.5 rounded-xl border-[1.5px] text-[14px] text-[#1e1e2e] outline-none bg-[#fafafe] ${fieldBorderClass(form.name)}`}
              />
              {tried && !form.name && <p className="text-[11px] text-[#e24b4a] mt-0.5">Name cannot be empty</p>}
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-semibold text-[#555] tracking-[0.3px]">Email ID</label>
              <input
                name="email"
                value={form.email}
                placeholder="Enter your email"
                onChange={handleChange}
                className={`w-full px-3 py-2.5 rounded-xl border-[1.5px] text-[14px] text-[#1e1e2e] outline-none bg-[#fafafe] ${fieldBorderClass(form.email)}`}
              />
              {tried && !form.email && <p className="text-[11px] text-[#e24b4a] mt-0.5">Email cannot be empty</p>}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-semibold text-[#555] tracking-[0.3px]">Password</label>
              <div className="relative">
                <input
                  name="password"
                  value={form.password}
                  type={showPass ? "text" : "password"}
                  placeholder="Create a password"
                  onChange={handleChange}
                  className={`w-full px-3 py-2.5 pr-11 rounded-xl border-[1.5px] text-[14px] text-[#1e1e2e] outline-none bg-[#fafafe] ${fieldBorderClass(form.password)}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer p-0 flex items-center"
                >
                  {showPass ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {tried && !form.password && <p className="text-[11px] text-[#e24b4a] mt-0.5">Password cannot be empty</p>}
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-semibold text-[#555] tracking-[0.3px]">Mobile Number</label>
              <input
                name="phone"
                value={form.phone}
                placeholder="Enter your mobile number"
                onChange={handleChange}
                className={`w-full px-3 py-2.5 rounded-xl border-[1.5px] text-[14px] text-[#1e1e2e] outline-none bg-[#fafafe] ${fieldBorderClass(form.phone)}`}
              />
              {tried && !form.phone && <p className="text-[11px] text-[#e24b4a] mt-0.5">Mobile cannot be empty</p>}
            </div>

            {/* Work Status */}
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-semibold text-[#555] tracking-[0.3px]">Work Status</label>
              <div className="flex gap-2.5">
                {["experienced", "fresher"].map((val) => (
                  <label
                    key={val}
                    className={`flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border-[1.5px] cursor-pointer transition-all duration-200 ${
                      form.status === val
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-[#e0e0f0] bg-[#fafafe]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={val}
                      checked={form.status === val}
                      onChange={handleChange}
                      className="hidden"
                    />
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        form.status === val ? "border-indigo-500" : "border-gray-300"
                      }`}
                    >
                      {form.status === val && (
                        <div className="w-[7px] h-[7px] rounded-full bg-indigo-500" />
                      )}
                    </div>
                    <span
                      className={`text-[13px] font-medium capitalize ${
                        form.status === val ? "text-indigo-700" : "text-[#555]"
                      }`}
                    >
                      {val}
                    </span>
                  </label>
                ))}
              </div>
              {tried && !form.status && <p className="text-[11px] text-[#e24b4a] mt-0.5">Please select work status</p>}
            </div>

            {/* Register Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-700 text-white text-[15px] font-semibold border-none cursor-pointer mt-1 disabled:opacity-70"
            >
              {loading ? "Registering..." : "Create Account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
