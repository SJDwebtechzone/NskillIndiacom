"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

interface Question {
  id: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_ans: string;
}

export default function PostTestQuestionsPage() {
  const router = useRouter();
  const params = useParams();
  const courseName = decodeURIComponent(params?.courseName as string);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuestions = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/finaltest/${encodeURIComponent(courseName)}/questions`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setQuestions(data.questions || []);
    } catch (err) {
      console.error("Failed to fetch questions", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQuestions(); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this question?")) return;
    try {
      const token = localStorage.getItem("token");
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/finaltest/questions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchQuestions();
    } catch (err) {
      console.error("Failed to delete question", err);
    }
  };

  const optionLabel: Record<string, string> = { a: "A", b: "B", c: "C", d: "D" };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={() => router.push("/dashboard/trainer-management/post-test")}
            className="text-sm text-purple-600 hover:underline mb-1 block"
          >
            ← Back to courses
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Post-Test Questions</h1>
          <p className="text-gray-500 text-sm mt-1">{courseName}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() =>
              router.push(
                `/dashboard/trainer-management/post-test/${encodeURIComponent(courseName)}/post-test/config`
              )
            }
            className="bg-gray-100 text-gray-700 text-sm px-4 py-2 rounded-lg hover:bg-gray-200 transition-all"
          >
            ⚙️ Config
          </button>
          <button
            onClick={() =>
              router.push(
                `/dashboard/trainer-management/post-test/${encodeURIComponent(courseName)}/post-test/add`
              )
            }
            className="bg-purple-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-purple-700 transition-all"
          >
            + Add Question
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading questions...</div>
      ) : questions.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <div className="text-5xl mb-4">❓</div>
          <p className="text-gray-400 text-lg">No questions yet.</p>
          <button
            onClick={() =>
              router.push(
                `/dashboard/trainer-management/post-test/${encodeURIComponent(courseName)}/post-test/add`
              )
            }
            className="mt-4 bg-purple-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-purple-700"
          >
            Add First Question
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {questions.map((q, index) => (
            <div key={q.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 mb-3">
                    <span className="text-purple-500 mr-2">Q{index + 1}.</span>
                    {q.question}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: "a", val: q.option_a },
                      { key: "b", val: q.option_b },
                      { key: "c", val: q.option_c },
                      { key: "d", val: q.option_d },
                    ].map(({ key, val }) => (
                      <div
                        key={key}
                        className={`text-sm px-3 py-2 rounded-lg border ${
                          q.correct_ans.toLowerCase() === key
                            ? "bg-green-50 border-green-400 text-green-700 font-semibold"
                            : "bg-gray-50 border-gray-200 text-gray-600"
                        }`}
                      >
                        {optionLabel[key]}. {val}
                        {q.correct_ans.toLowerCase() === key && (
                          <span className="ml-2">✓</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={() =>
                      router.push(
                        `/dashboard/trainer-management/post-test/${encodeURIComponent(courseName)}/post-test/edit/${q.id}`
                      )
                    }
                    className="text-blue-600 text-xs border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="text-red-500 text-xs border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
