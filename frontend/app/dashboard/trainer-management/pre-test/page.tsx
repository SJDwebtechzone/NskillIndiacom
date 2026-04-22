'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface CourseInfo {
  course_name: string;
  student_count: number;
}

export default function PreTestLandingPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<CourseInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/pretest/trainer/courses`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setCourses(data.courses || []);
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Pre-Test Management</h1>
        <p className="text-gray-500 text-sm mt-1">
          Select a course to manage its pretest questions or view student attempts
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <div className="text-5xl mb-4">📝</div>
          <p className="text-gray-400 text-lg">No courses found.</p>
          <p className="text-gray-400 text-sm mt-2">
            Contact admin to assign courses to your account.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <div
              key={course.course_name}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="bg-blue-100 text-blue-600 rounded-lg p-2 text-xl">📝</div>
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                  {course.student_count} students
                </span>
              </div>

              {/* Course Name */}
              <h3 className="font-semibold text-gray-800 mb-4">{course.course_name}</h3>

              {/* Two Action Buttons */}
              <div className="flex gap-2">
                <button
                  // Manage Questions button — change pretest → pre-test
onClick={() =>
  router.push(
    `/dashboard/trainer-management/pre-test/${encodeURIComponent(course.course_name)}/pre-test`
  )
}

// View Attempts button — change pretest → pre-test

                  className="flex-1 text-blue-600 text-xs font-semibold border border-blue-200 rounded-lg py-2 hover:bg-blue-50 transition-all"
                >
                  ✏️ Manage Questions
                </button>
                <button
                  onClick={() =>
  router.push(
    `/dashboard/trainer-management/pre-test/${encodeURIComponent(course.course_name)}/attempts`
  )
}
                  className="flex-1 text-amber-600 text-xs font-semibold border border-amber-200 rounded-lg py-2 hover:bg-amber-50 transition-all"
                >
                  👁️ View Attempts
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}