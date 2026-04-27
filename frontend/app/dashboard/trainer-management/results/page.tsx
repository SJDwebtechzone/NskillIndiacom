"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Student {
  id: number;
  full_name: string;
  email_id: string;
  course_name: string;
}

interface Marks {
  pretest: { marks: number; max: number };
  posttest: { marks: number; max: number };
  weekly_test: { marks: number; max: number };
  attendance: { marks: number; max: number };
  practical: { marks: number; max: number };
  assessment: { marks: number; max: number };
  total: { marks: number; max: number };
  grade: string;
  passed: boolean;
}

interface StudentMarks {
  student: Student;
  marks: Marks;
}

export default function TrainerMarksPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [marksData, setMarksData] = useState<Record<number, Marks>>({});
  const [loading, setLoading] = useState(true);
  const [loadingMarks, setLoadingMarks] = useState<Record<number, boolean>>({});
  const [search, setSearch] = useState("");
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const API = process.env.NEXT_PUBLIC_API_URL;

useEffect(() => {
  // Decode token to see contents
  const token = localStorage.getItem("token");
  if (token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(window.atob(base64));
    console.log('=== TOKEN CONTENTS ===', decoded);
  }

  const fetchStudents = async () => {
    try {
      const res = await fetch(`${API}/api/marks/trainer/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      console.log('API response:', data);
      setStudents(data.students || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  fetchStudents();
}, []);

  const fetchMarks = async (studentId: number) => {
    setLoadingMarks((prev) => ({ ...prev, [studentId]: true }));
    try {
      const res = await fetch(`${API}/api/marks/student/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: StudentMarks = await res.json();
      setMarksData((prev) => ({ ...prev, [studentId]: data.marks }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMarks((prev) => ({ ...prev, [studentId]: false }));
    }
  };

  const getGradeColor = (grade: string) => {
    if (grade === "A+" || grade === "A") return "bg-green-100 text-green-700";
    if (grade === "B") return "bg-blue-100 text-blue-700";
    if (grade === "C" || grade === "D") return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-600";
  };

  const filtered = students.filter(
    (s) =>
      s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.email_id.toLowerCase().includes(search.toLowerCase()) ||
      s.course_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Marks & Results</h1>
        <p className="text-gray-500 text-sm mt-1">
          View and calculate marks for all students
        </p>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          className="w-full max-w-md border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none"
          placeholder="Search by name, email or course..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading students...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <div className="text-5xl mb-4">👨‍🎓</div>
          <p className="text-gray-400">No students found.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((student) => {
            const marks = marksData[student.id];
            const isLoading = loadingMarks[student.id];

            return (
              <div
                key={student.id}
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
              >
                {/* Student Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-sm">
                      {student.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{student.full_name}</p>
                      <p className="text-xs text-gray-400">{student.email_id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {student.course_name}
                    </span>
                    <button
                      onClick={() => fetchMarks(student.id)}
                      disabled={isLoading}
                      className="bg-blue-600 text-white text-xs px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-all"
                    >
                      {isLoading ? "Calculating..." : marks ? "🔄 Recalculate" : "📊 Calculate Marks"}
                    </button>
                  </div>
                </div>

                {/* Marks Display */}
                {marks && (
                  <div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
                      {[
                        { label: "Pre-Test", value: marks.pretest.marks, max: marks.pretest.max, color: "purple" },
                        { label: "Post-Test", value: marks.posttest.marks, max: marks.posttest.max, color: "blue" },
                        { label: "Weekly Test", value: marks.weekly_test.marks, max: marks.weekly_test.max, color: "indigo" },
                        { label: "Attendance", value: marks.attendance.marks, max: marks.attendance.max, color: "green" },
                        { label: "Assessment", value: marks.assessment.marks, max: marks.assessment.max, color: "amber" },
                        { label: "Practical", value: marks.practical.marks, max: marks.practical.max, color: "orange" },
                      ].map((item) => (
                        <div key={item.label} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                          <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                          <p className="text-lg font-bold text-gray-800">
                            {item.value}
                            <span className="text-xs text-gray-400 font-normal">/{item.max}</span>
                          </p>
                          {/* Progress bar */}
                          <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                            <div
                              className="bg-blue-500 h-1 rounded-full"
                              style={{ width: `${(item.value / item.max) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Total + Grade */}
                    <div className="flex items-center justify-between bg-gray-50 rounded-xl px-5 py-3 border border-gray-100">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Total Marks</p>
                          <p className="text-2xl font-bold text-gray-800">
                            {marks.total.marks}
                            <span className="text-sm text-gray-400 font-normal">/100</span>
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Grade</p>
                          <span className={`text-lg font-bold px-3 py-1 rounded-lg ${getGradeColor(marks.grade)}`}>
                            {marks.grade}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className={`text-sm font-bold px-4 py-2 rounded-full ${marks.passed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                          {marks.passed ? "✅ Passed" : "❌ Failed"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
