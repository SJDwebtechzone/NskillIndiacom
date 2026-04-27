"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function PostTestConfigPage() {
  const router = useRouter();
  const params = useParams();
  const courseName = decodeURIComponent(params?.courseName as string);

  const [config, setConfig] = useState({ total_qs: 10, pass_percent: 50, time_limit: 600 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/finaltest/${encodeURIComponent(courseName)}/config`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        setConfig({ total_qs: data.total_qs, pass_percent: data.pass_percent, time_limit: data.time_limit });
      } catch (err) {
        console.error("Failed to fetch config", err);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    try {
      const token = localStorage.getItem("token");
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/finaltest/${encodeURIComponent(courseName)}/config`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(config),
        }
      );
      setSuccess(true);
    } catch (err) {
      console.error("Failed to save config", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 text-gray-400">Loading config...</div>;

  return (
    <div className="p-6 max-w-lg mx-auto">
      <button
        onClick={() =>
          router.push(
            `/dashboard/trainer-management/post-test/${encodeURIComponent(courseName)}/post-test`
          )
        }
        className="text-sm text-purple-600 hover:underline mb-4 block"
      >
        ← Back to questions
      </button>
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Post-Test Configuration</h1>
      <p className="text-gray-500 text-sm mb-6">{courseName}</p>

      {success && (
        <div className="mb-4 px-4 py-2.5 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600">
          ✅ Configuration saved successfully!
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-5">
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-1 block">
            Number of Questions
          </label>
          <input
            type="number"
            min={1}
            value={config.total_qs}
            onChange={(e) => setConfig({ ...config, total_qs: Number(e.target.value) })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-1 block">
            Pass Percentage (%)
          </label>
          <input
            type="number"
            min={1}
            max={100}
            value={config.pass_percent}
            onChange={(e) => setConfig({ ...config, pass_percent: Number(e.target.value) })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-1 block">
            Time Limit (seconds)
          </label>
          <input
            type="number"
            min={60}
            value={config.time_limit}
            onChange={(e) => setConfig({ ...config, time_limit: Number(e.target.value) })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
          />
          <p className="text-xs text-gray-400 mt-1">
            {Math.floor(config.time_limit / 60)} minutes {config.time_limit % 60} seconds
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-purple-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-purple-700 disabled:opacity-60 transition-all"
        >
          {saving ? "Saving..." : "Save Configuration"}
        </button>
      </div>
    </div>
  );
}
