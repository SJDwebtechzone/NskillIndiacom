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
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/pretest/courses`,
        { credentials: 'include' }
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Pre-Test Management</h1>
        <p className="text-gray-500 text-sm mt-1">
          Select a course to manage its pretest questions
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-400 text-lg">No courses found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <div
  key={course.course_name}
  onClick={() =>
    router.push(
      `/dashboard/student-management/pretest/${encodeURIComponent(course.course_name)}/pre-test`
    )
  }
  className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-blue-400 cursor-pointer transition-all"
>
              <div className="flex items-center justify-between mb-3">
                <div className="bg-blue-100 text-blue-600 rounded-lg p-2">📝</div>
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                  {course.student_count} students
                </span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">{course.course_name}</h3>
              <div className="text-blue-600 text-xs font-medium mt-4">
                Manage Questions →
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}