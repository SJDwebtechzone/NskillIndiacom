'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface CourseInfo {
  course_name: string;
  student_count: number;
}

export default function TrainerAssessmentsPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<CourseInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchCourses(); }, []);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/assessments/trainer/courses`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setCourses(data.courses || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Assessment & Assignment</h1>
        <p className="text-gray-500 text-sm mt-1">Select a course to manage assessments</p>
      </div>
      {courses.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <div className="text-5xl mb-4">📝</div>
          <p className="text-gray-400 text-lg">No courses found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <div
              key={course.course_name}
              onClick={() => router.push(`/dashboard/trainer-management/assessments/${encodeURIComponent(course.course_name)}`)}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-indigo-400 cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="bg-indigo-100 text-indigo-600 rounded-lg p-2 text-xl">📋</div>
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                  {course.student_count} students
                </span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">{course.course_name}</h3>
              <div className="text-indigo-600 text-xs font-medium mt-4">
                Manage Assessments →
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}