"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function MyPreTests() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API = process.env.NEXT_PUBLIC_API_URL;
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(`${API}/api/student/pretest/my-courses`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.courses) {
          setCourses(data.courses);
        } else {
          setError("Failed to load pre-tests.");
        }
      } catch (err) {
        setError("Error fetching pre-tests.");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [API, token]);

  if (loading) {
    return <div className="p-10 text-center text-gray-500">Loading your pre-tests...</div>;
  }

  if (error) {
    return <div className="p-10 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Pre Tests</h1>
      
      {courses.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-gray-200 text-center text-gray-500 shadow-sm">
          You are not enrolled in any courses with a pre-test yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map((c, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="font-bold text-lg text-blue-700 mb-2">{c.course_name}</h2>
              <div className="mb-4">
                {c.has_attempted ? (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${c.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {c.passed ? "Passed" : "Failed"} (Score: {c.score}/{c.total})
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Not Attempted
                  </span>
                )}
              </div>
              <Link
                href={`/dashboard/student-management/student/pretest/${encodeURIComponent(c.course_name)}`}
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                {c.has_attempted ? "View Details / Retake" : "Start Pre Test"}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
