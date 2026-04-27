"use client";
import { useEffect, useState } from "react";

interface MarksRow {
  pretest_marks: number;
  posttest_marks: number;
  weekly_test_marks: number;
  attendance_marks: number;
  practical_marks: number;
  assessment_marks: number;
  total_marks: number;
  grade: string;
  course_name: string;
  updated_at: string;
}

export default function StudentMarksPage() {
  const [marks, setMarks] = useState<MarksRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const API = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchMarks = async () => {
      try {
        const res = await fetch(`${API}/api/marks/my-marks`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.marks) {
          setMarks(data.marks);
        } else {
          setMessage(data.message || "Marks not available yet.");
        }
      } catch (err) {
        console.error(err);
        setMessage("Failed to load marks.");
      } finally {
        setLoading(false);
      }
    };
    fetchMarks();
  }, []);

  const getGradeColor = (grade: string) => {
    if (grade === "A+" || grade === "A") return "text-green-600";
    if (grade === "B") return "text-blue-600";
    if (grade === "C" || grade === "D") return "text-yellow-600";
    return "text-red-600";
  };

  const passed = marks ? marks.total_marks >= 50 : false;

  const components = marks
    ? [
        { label: "Pre-Test",    marks: marks.pretest_marks,    max: 10,  icon: "📝", color: "bg-purple-50 border-purple-200" },
        { label: "Post-Test",   marks: marks.posttest_marks,   max: 15,  icon: "📋", color: "bg-blue-50 border-blue-200"   },
        { label: "Weekly Test", marks: marks.weekly_test_marks,max: 20,  icon: "📅", color: "bg-indigo-50 border-indigo-200"},
        { label: "Attendance",  marks: marks.attendance_marks, max: 5,   icon: "✅", color: "bg-green-50 border-green-200" },
        { label: "Assessment",  marks: marks.assessment_marks, max: 10,  icon: "📄", color: "bg-amber-50 border-amber-200" },
        { label: "Practical",   marks: marks.practical_marks,  max: 40,  icon: "🎥", color: "bg-orange-50 border-orange-200"},
      ]
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-gray-400">
        Loading marks...
      </div>
    );
  }

  if (!marks) {
    return (
      <div className="p-6 text-center py-20">
        <div className="text-5xl mb-4">📊</div>
        <p className="text-gray-500 font-semibold">{message}</p>
        <p className="text-gray-400 text-sm mt-2">
          Your trainer will publish your marks soon.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Marks & Result</h1>
        <p className="text-gray-500 text-sm mt-1">
          Course: <span className="font-semibold text-blue-600">{marks.course_name}</span>
        </p>
        <p className="text-gray-400 text-xs mt-0.5">
          Last updated: {new Date(marks.updated_at).toLocaleString()}
        </p>
      </div>

      {/* Result Banner */}
      <div className={`rounded-2xl p-6 mb-6 text-center border-2 ${passed ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300"}`}>
        <div className="text-5xl mb-2">{passed ? "🎉" : "😔"}</div>
        <h2 className={`text-2xl font-bold mb-1 ${passed ? "text-green-700" : "text-red-600"}`}>
          {passed ? "Congratulations! You Passed!" : "Better Luck Next Time"}
        </h2>
        <div className="flex items-center justify-center gap-6 mt-4">
          <div>
            <p className="text-4xl font-bold text-gray-800">{marks.total_marks}<span className="text-lg text-gray-400">/100</span></p>
            <p className="text-sm text-gray-500 mt-1">Total Marks</p>
          </div>
          <div className="w-px h-12 bg-gray-300" />
          <div>
            <p className={`text-4xl font-bold ${getGradeColor(marks.grade)}`}>{marks.grade}</p>
            <p className="text-sm text-gray-500 mt-1">Grade</p>
          </div>
        </div>
      </div>

      {/* Component wise marks */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {components.map((item) => {
          const percent = Math.round((item.marks / item.max) * 100);
          return (
            <div key={item.label} className={`rounded-xl p-4 border ${item.color}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{item.icon}</span>
                <p className="text-xs font-semibold text-gray-600">{item.label}</p>
              </div>
              <p className="text-2xl font-bold text-gray-800">
                {item.marks}
                <span className="text-sm text-gray-400 font-normal">/{item.max}</span>
              </p>
              {/* Progress bar */}
              <div className="w-full bg-white rounded-full h-1.5 mt-2">
                <div
                  className="bg-blue-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">{percent}%</p>
            </div>
          );
        })}
      </div>

      {/* Grade legend */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <p className="text-xs font-semibold text-gray-600 mb-3">Grade Scale</p>
        <div className="flex flex-wrap gap-2">
          {[
            { grade: "A+", range: "90-100", color: "bg-green-100 text-green-700" },
            { grade: "A",  range: "80-89",  color: "bg-green-100 text-green-700" },
            { grade: "B",  range: "70-79",  color: "bg-blue-100 text-blue-700"   },
            { grade: "C",  range: "60-69",  color: "bg-yellow-100 text-yellow-700"},
            { grade: "D",  range: "50-59",  color: "bg-orange-100 text-orange-700"},
            { grade: "F",  range: "< 50",   color: "bg-red-100 text-red-600"     },
          ].map((g) => (
            <span key={g.grade} className={`text-xs font-semibold px-2.5 py-1 rounded-full ${g.color} ${marks.grade === g.grade ? "ring-2 ring-offset-1 ring-gray-400" : ""}`}>
              {g.grade}: {g.range}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
