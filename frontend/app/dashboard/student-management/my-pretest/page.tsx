// 'use client';

// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { useAuth } from '@/app/context/AuthContext';
// import { ClipboardList, CheckCircle2, XCircle } from 'lucide-react';

// interface CoursePretest {
//   course_name: string;
//   has_attempted: boolean;
//   passed: boolean;
//   score: number;
//   total: number;
// }

// export default function MyPretestPage() {
//   const { user } = useAuth();
//   const router = useRouter();
//   const [courses, setCourses] = useState<CoursePretest[]>([]);
//   const [loading, setLoading] = useState(true);

//   const getHeaders = () => {
//     const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
//     return token
//       ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
//       : { 'Content-Type': 'application/json' };
//   };

//   useEffect(() => {
//     fetchCourses();
//   }, []);

//   const fetchCourses = async () => {
//     try {
//       const res = await fetch(
//         `${process.env.NEXT_PUBLIC_API_URL}/api/student/pretest/my-courses`,
//         { headers: getHeaders(), credentials: 'include' }
//       );
//       const data = await res.json();
//       setCourses(data.courses || []);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
//         <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
//         <p className="text-slate-500 font-bold animate-pulse">Loading your pre-tests...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6 pb-20">
//       {/* Header */}
//       <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm flex items-center gap-4">
//         <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
//           <ClipboardList className="w-7 h-7" />
//         </div>
//         <div>
//           <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">My Pre-Tests</h1>
//           <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">
//             Welcome, {user?.name} — your course assessments
//           </p>
//         </div>
//       </div>

//       {/* Course Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         {courses.length === 0 ? (
//           <div className="col-span-2 bg-white rounded-[24px] border border-slate-100 p-20 text-center">
//             <ClipboardList className="w-12 h-12 text-slate-200 mx-auto mb-4" />
//             <p className="text-slate-400 font-bold uppercase tracking-widest">
//               No pre-tests available for your course
//             </p>
//           </div>
//         ) : (
//           courses.map((course) => (
//             <div
//               key={course.course_name}
//               className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden"
//             >
//               {/* Status color bar */}
//               <div className={`h-2 w-full ${
//                 !course.has_attempted ? 'bg-blue-500' :
//                 course.passed ? 'bg-emerald-500' : 'bg-red-400'
//               }`} />

//               <div className="p-6">
//                 <div className="flex justify-between items-start mb-4">
//                   <div>
//                     <h3 className="font-black text-slate-800 text-base">{course.course_name}</h3>
//                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">
//                       {course.has_attempted ? 'Attempted' : 'Not attempted yet'}
//                     </p>
//                   </div>
//                   {course.has_attempted && (
//                     course.passed
//                       ? <CheckCircle2 className="w-6 h-6 text-emerald-500" />
//                       : <XCircle className="w-6 h-6 text-red-400" />
//                   )}
//                 </div>

//                 {/* Score progress bar */}
//                 {course.has_attempted && (
//                   <div className="mb-4">
//                     <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-1">
//                       <span className={course.passed ? 'text-emerald-600' : 'text-red-500'}>
//                         {course.passed ? '✅ Passed' : '❌ Failed'}
//                       </span>
//                       <span className="text-slate-400">{course.score}/{course.total}</span>
//                     </div>
//                     <div className="w-full bg-slate-100 rounded-full h-2">
//                       <div
//                         className={`h-2 rounded-full transition-all ${
//                           course.passed ? 'bg-emerald-500' : 'bg-red-400'
//                         }`}
//                         style={{ width: `${Math.round((course.score / course.total) * 100)}%` }}
//                       />
//                     </div>
//                   </div>
//                 )}

//                 <button
//                   onClick={() =>
//                     router.push(
//                       `/dashboard/student-management/student/pretest/${encodeURIComponent(course.course_name)}`
//                     )
//                   }
//                   className={`w-full py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 ${
//                     !course.has_attempted
//                       ? 'bg-blue-600 hover:bg-blue-700 text-white'
//                       : course.passed
//                       ? 'bg-slate-100 hover:bg-slate-200 text-slate-600'
//                       : 'bg-orange-500 hover:bg-orange-600 text-white'
//                   }`}
//                 >
//                   {!course.has_attempted ? '🚀 Start Test' : course.passed ? '📄 View Result' : '🔁 Retake'}
//                 </button>
//               </div>
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// }

'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/app/context/AuthContext';

interface Question {
  id: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
}

interface Answer {
  [questionId: number]: string;
}

export default function StudentPreTestPage() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer>({});
  const [courseName, setCourseName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [passed, setPassed] = useState<boolean | null>(null);
  const [total, setTotal] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [error, setError] = useState('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ── Start timer when questions load ──────────────────
  useEffect(() => {
    if (questions.length > 0 && !submitted) {
      timerRef.current = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [questions, submitted]);

  // ── Fetch student course + questions ─────────────────
  useEffect(() => {
    fetchStudentCourse();
  }, []);

  const fetchStudentCourse = async () => {
    try {
      const token = localStorage.getItem('token');

      // 1. Get student's course
      const courseRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/pretest/student/course`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const courseData = await courseRes.json();

      if (!courseData.course_name) {
        setError('No course found for your account. Please contact admin.');
        setLoading(false);
        return;
      }

      setCourseName(courseData.course_name);

      // 2. Check if already attempted
      const attemptRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/pretest/student/attempt-status?course_name=${encodeURIComponent(courseData.course_name)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const attemptData = await attemptRes.json();

      if (attemptData.attempted) {
        setScore(attemptData.score);
        setTotal(attemptData.total);
        setPassed(attemptData.passed);
        setSubmitted(true);
        setLoading(false);
        return;
      }

      // 3. Get questions for that course
      const qRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/pretest/${encodeURIComponent(courseData.course_name)}/questions`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const qData = await qRes.json();
      setQuestions(qData.questions || []);

    } catch (err) {
      console.error('Error fetching pretest:', err);
      setError('Failed to load pretest. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Handle answer selection ───────────────────────────
  const handleAnswer = (questionId: number, option: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  // ── Submit handler ────────────────────────────────────
  const handleSubmit = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/pretest/student/submit`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            course_name: courseName,
            answers,
            time_taken: timeElapsed,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      setScore(data.score);
      setTotal(data.total);
      setPassed(data.passed);
      setSubmitted(true);
    } catch (err) {
      console.error('Submit error:', err);
      setError('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Format timer ──────────────────────────────────────
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // ── Loading state ─────────────────────────────────────
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-5xl">⚠️</div>
        <p className="text-gray-500 text-center">{error}</p>
      </div>
    );
  }

  // ── Already submitted / Result screen ────────────────
  if (submitted && score !== null) {
    return (
      <div className="max-w-md mx-auto mt-16">
        <div className={`rounded-2xl p-8 text-center shadow-lg border-2 ${
          passed
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="text-6xl mb-4">{passed ? '🎉' : '😞'}</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {passed ? 'Congratulations!' : 'Better Luck Next Time'}
          </h2>
          <p className="text-gray-500 mb-6">
            {passed
              ? 'You have passed the pre-test.'
              : 'You did not meet the passing criteria.'}
          </p>

          {/* Score card */}
          <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
            <p className="text-sm text-gray-400 mb-1">Your Score</p>
            <p className={`text-5xl font-black mb-1 ${
              passed ? 'text-green-600' : 'text-red-500'
            }`}>
              {score}
              <span className="text-2xl text-gray-400">/{total}</span>
            </p>
            <p className="text-sm text-gray-400">
              {total > 0 ? Math.round((score / total) * 100) : 0}% correct
            </p>
          </div>

          {/* Course */}
          <div className="bg-white rounded-xl px-4 py-3 text-sm text-gray-500 mb-4">
            Course: <span className="font-semibold text-blue-600">{courseName}</span>
          </div>

          {/* Pass/Fail badge */}
          <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold ${
            passed
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}>
            {passed ? '✅ PASSED' : '❌ FAILED'}
          </div>
        </div>
      </div>
    );
  }

  // ── No questions available ────────────────────────────
  if (questions.length === 0) {
    return (
      <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
        <div className="text-5xl mb-4">📝</div>
        <p className="text-gray-400 text-lg font-medium">
          No pretest questions available for your course yet.
        </p>
        <p className="text-gray-400 text-sm mt-2">
          Course: <span className="font-semibold text-blue-500">{courseName}</span>
        </p>
      </div>
    );
  }

  // ── Main test UI ──────────────────────────────────────
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === questions.length;

  return (
    <div className="max-w-3xl mx-auto p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Pre-Test</h1>
          <p className="text-gray-500 text-sm mt-1">
            Course:{' '}
            <span className="font-semibold text-blue-600">{courseName}</span>
          </p>
        </div>
        {/* Timer */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 text-center">
          <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Time</p>
          <p className="text-xl font-black text-blue-600">{formatTime(timeElapsed)}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-400 mb-1 font-medium">
          <span>{answeredCount} of {questions.length} answered</span>
          <span>{Math.round((answeredCount / questions.length) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(answeredCount / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {questions.map((q, index) => (
          <div
            key={q.id}
            className={`bg-white border rounded-xl p-5 shadow-sm transition-all ${
              answers[q.id] ? 'border-blue-200' : 'border-gray-200'
            }`}
          >
            <p className="font-semibold text-gray-800 mb-4">
              <span className="text-blue-500 mr-2">Q{index + 1}.</span>
              {q.question}
            </p>
            <div className="space-y-2">
              {(['a', 'b', 'c', 'd'] as const).map(opt => (
                <label
                  key={opt}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    answers[q.id] === opt
                      ? 'border-blue-400 bg-blue-50 shadow-sm'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name={`q_${q.id}`}
                    value={opt}
                    checked={answers[q.id] === opt}
                    onChange={() => handleAnswer(q.id, opt)}
                    className="accent-blue-600"
                  />
                  <span className={`text-sm font-bold uppercase mr-1 ${
                    answers[q.id] === opt ? 'text-blue-500' : 'text-gray-400'
                  }`}>
                    {opt}.
                  </span>
                  <span className="text-gray-700 text-sm">
                    {q[`option_${opt}` as keyof Question]}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Submit button */}
      <div className="mt-8 sticky bottom-6">
        <button
          onClick={handleSubmit}
          disabled={!allAnswered || submitting}
          className={`w-full font-bold py-4 rounded-xl transition-all text-white shadow-lg ${
            allAnswered && !submitting
              ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          {submitting
            ? 'Submitting...'
            : allAnswered
            ? `Submit Pre-Test ✓`
            : `Answer all questions (${answeredCount}/${questions.length})`}
        </button>
      </div>
    </div>
  );
}