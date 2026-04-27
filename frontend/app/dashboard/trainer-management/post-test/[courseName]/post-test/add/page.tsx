"use client";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function AddPostTestQuestionPage() {
  const router = useRouter();
  const params = useParams();
  const courseName = decodeURIComponent(params?.courseName as string);

  const [form, setForm] = useState({
    question: "", option_a: "", option_b: "", option_c: "", option_d: "", correct_ans: "a",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!form.question || !form.option_a || !form.option_b || !form.option_c || !form.option_d) {
      setError("All fields are required."); return;
    }
    setSaving(true); setError("");
    try {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/finaltest/${encodeURIComponent(courseName)}/questions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ ...form, trainer_id: user?.id }),
        }
      );
      if (!res.ok) throw new Error("Failed");
      router.push(`/dashboard/trainer-management/post-test/${encodeURIComponent(courseName)}/post-test`);
    } catch {
      setError("Failed to add question. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <button
        onClick={() => router.push(`/dashboard/trainer-management/post-test/${encodeURIComponent(courseName)}/post-test`)}
        className="text-sm text-purple-600 hover:underline mb-4 block"
      >← Back to questions</button>
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Add Post-Test Question</h1>
      <p className="text-gray-500 text-sm mb-6">{courseName}</p>

      {error && <div className="mb-4 px-4 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>}

      <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-4">
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-1 block">Question *</label>
          <textarea name="question" value={form.question} onChange={(e) => setForm({...form, question: e.target.value})}
            rows={3} placeholder="Enter your question here..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none resize-none" />
        </div>
        {[["option_a","Option A"],["option_b","Option B"],["option_c","Option C"],["option_d","Option D"]].map(([name, label]) => (
          <div key={name}>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">{label} *</label>
            <input value={form[name as keyof typeof form]} onChange={(e) => setForm({...form, [name]: e.target.value})}
              placeholder={`Enter ${label}`}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none" />
          </div>
        ))}
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-1 block">Correct Answer *</label>
          <select value={form.correct_ans} onChange={(e) => setForm({...form, correct_ans: e.target.value})}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white">
            <option value="a">A</option>
            <option value="b">B</option>
            <option value="c">C</option>
            <option value="d">D</option>
          </select>
        </div>
        <button onClick={handleSubmit} disabled={saving}
          className="w-full bg-purple-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-purple-700 disabled:opacity-60">
          {saving ? "Saving..." : "Save Question"}
        </button>
      </div>
    </div>
  );
}