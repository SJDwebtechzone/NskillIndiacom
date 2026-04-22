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
interface Answer { [questionId: number]: string; }

export default function StudentPostTestPage() {
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

  useEffect(() => {
    if (questions.length > 0 && !submitted) {
      timerRef.current = setInterval(() => setTimeElapsed(p => p + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [questions, submitted]);

  useEffect(() => { fetchStudentCourse(); }, []);

  const fetchStudentCourse = async () => {
    try {
      const token = localStorage.getItem('token');
      const courseRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/posttest/student/course`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const courseData = await courseRes.json();
      if (!courseData.course_name) { setError('No course found. Contact admin.'); setLoading(false); return; }
      setCourseName(courseData.course_name);

      const attemptRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/posttest/student/attempt-status?course_name=${encodeURIComponent(courseData.course_name)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const attemptData = await attemptRes.json();
      if (attemptData.attempted) {
        setScore(attemptData.score); setTotal(attemptData.total); setPassed(attemptData.passed);
        setSubmitted(true); setLoading(false); return;
      }

      const qRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/posttest/${encodeURIComponent(courseData.course_name)}/questions`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const qData = await qRes.json();
      setQuestions(qData.questions || []);
    } catch (err) { setError('Failed to load post-test.'); }
    finally { setLoading(false); }
  };

  const handleAnswer = (questionId: number, option: string) => {
    setAnswers(prev => ({...prev, [questionId]: option}));
  };

  const handleSubmit = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/posttest/student/submit`,
        { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ course_name: courseName, answers, time_taken: timeElapsed }) }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setScore(data.score); setTotal(data.total); setPassed(data.passed); setSubmitted(true);
    } catch (err) { setError('Failed to submit. Try again.'); }
    finally { setSubmitting(false); }
  };

  const formatTime = (s: number) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600" /></div>;

  if (error) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="text-5xl">⚠️</div>
      <p className="text-gray-500 text-center">{error}</p>
    </div>
  );

  if (submitted && score !== null) return (
    <div className="max-w-md mx-auto mt-16">
      <div className={`rounded-2xl p-8 text-center shadow-lg border-2 ${passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
        <div className="text-6xl mb-4">{passed ? '🎉' : '😞'}</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{passed ? 'Congratulations!' : 'Better Luck Next Time'}</h2>
       <p className="text-gray-500 mb-6">{passed ? 'You passed the weekly test.' : 'You did not meet the passing criteria.'}</p>
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <p className="text-sm text-gray-400 mb-1">Your Score</p>
          <p className={`text-5xl font-black mb-1 ${passed ? 'text-green-600' : 'text-red-500'}`}>
            {score}<span className="text-2xl text-gray-400">/{total}</span>
          </p>
          <p className="text-sm text-gray-400">{total > 0 ? Math.round((score/total)*100) : 0}% correct</p>
        </div>
        <div className="bg-white rounded-xl px-4 py-3 text-sm text-gray-500 mb-4">
          Course: <span className="font-semibold text-purple-600">{courseName}</span>
        </div>
        <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold ${passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {passed ? '✅ PASSED' : '❌ FAILED'}
        </div>
      </div>
    </div>
  );

  if (questions.length === 0) return (
    <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
      <div className="text-5xl mb-4">📋</div>
      <p className="text-gray-400 text-lg font-medium">No weekly test questions available yet.</p>
      <p className="text-gray-400 text-sm mt-2">Course: <span className="font-semibold text-purple-500">{courseName}</span></p>
    </div>
  );

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === questions.length;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Weekly Test</h1>
          <p className="text-gray-500 text-sm mt-1">Course: <span className="font-semibold text-purple-600">{courseName}</span></p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-2 text-center">
          <p className="text-[10px] text-purple-400 font-bold uppercase tracking-widest">Time</p>
          <p className="text-xl font-black text-purple-600">{formatTime(timeElapsed)}</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-400 mb-1 font-medium">
          <span>{answeredCount} of {questions.length} answered</span>
          <span>{Math.round((answeredCount/questions.length)*100)}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div className="bg-purple-500 h-2 rounded-full transition-all duration-300" style={{width: `${(answeredCount/questions.length)*100}%`}} />
        </div>
      </div>

      <div className="space-y-6">
        {questions.map((q, index) => (
          <div key={q.id} className={`bg-white border rounded-xl p-5 shadow-sm transition-all ${answers[q.id] ? 'border-purple-200' : 'border-gray-200'}`}>
            <p className="font-semibold text-gray-800 mb-4">
              <span className="text-purple-500 mr-2">Q{index + 1}.</span>{q.question}
            </p>
            <div className="space-y-2">
              {(['a','b','c','d'] as const).map(opt => (
                <label key={opt} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${answers[q.id] === opt ? 'border-purple-400 bg-purple-50 shadow-sm' : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'}`}>
                  <input type="radio" name={`q_${q.id}`} value={opt} checked={answers[q.id] === opt} onChange={() => handleAnswer(q.id, opt)} className="accent-purple-600" />
                  <span className={`text-sm font-bold uppercase mr-1 ${answers[q.id] === opt ? 'text-purple-500' : 'text-gray-400'}`}>{opt}.</span>
                  <span className="text-gray-700 text-sm">{q[`option_${opt}` as keyof Question]}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 sticky bottom-6">
        <button
          onClick={handleSubmit}
          disabled={!allAnswered || submitting}
          className={`w-full font-bold py-4 rounded-xl transition-all text-white shadow-lg ${allAnswered && !submitting ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-200' : 'bg-gray-300 cursor-not-allowed'}`}
        >
          {submitting ? 'Submitting...' : allAnswered ? 'Submit Weekly Test ✓' : `Answer all questions (${answeredCount}/${questions.length})`}
        </button>
      </div>
    </div>
  );
}