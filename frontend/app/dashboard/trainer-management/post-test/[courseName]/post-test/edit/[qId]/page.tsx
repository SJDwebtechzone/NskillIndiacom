"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditPostTestQuestionPage() {
  const router = useRouter();
  const params = useParams();
  const courseName = decodeURIComponent(params?.courseName as string);
  const qId = params?.qId as string;

  const [form, setForm] = useState({
    question: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_ans: "a",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/finaltest/questions/${qId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        setForm({
          question: data.question,
          option_a: data.option_a,
          option_b: data.option_b,
          option_c: data.option_c,
          option_d: data.option_d,
          correct_ans: data.correct_ans,
        });
      } catch (err) {
        console.error("Failed to fetch question", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestion();
  }, [qId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.question || !form.option_a || !form.option_b || !form.option_c || !form.option_d) {
      setError("All fields are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/finaltest/questions/${qId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        }
      );
      if (!res.ok) throw new Error("Failed to update question");
      router.push(
        `/dashboard/trainer-management/post-test/${encodeURIComponent(courseName)}/post-test`
      );
    } catch (err) {
      console.error(err);
      setError("Failed to update question. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 text-gray-400">Loading question...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
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
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Edit Post-Test Question</h1>
      <p className="text-gray-500 text-sm mb-6">{courseName}</p>

      {error && (
        <div className="mb-4 px-4 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-4">
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-1 block">Question *</label>
          <textarea
            name="question"
            value={form.question}
            onChange={handleChange}
            rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none resize-none"
          />
        </div>

        {[
          { name: "option_a", label: "Option A *" },
          { name: "option_b", label: "Option B *" },
          { name: "option_c", label: "Option C *" },
          { name: "option_d", label: "Option D *" },
        ].map((opt) => (
          <div key={opt.name}>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">{opt.label}</label>
            <input
              name={opt.name}
              value={form[opt.name as keyof typeof form]}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
            />
          </div>
        ))}

        <div>
          <label className="text-sm font-semibold text-gray-700 mb-1 block">Correct Answer *</label>
          <select
            name="correct_ans"
            value={form.correct_ans}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white"
          >
            <option value="a">A</option>
            <option value="b">B</option>
            <option value="c">C</option>
            <option value="d">D</option>
          </select>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="w-full bg-purple-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-purple-700 disabled:opacity-60 transition-all"
        >
          {saving ? "Saving..." : "Update Question"}
        </button>
      </div>
    </div>
  );
}
