'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Question {
  id: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
}

export default function PretestAttemptPage() {
  const { courseName } = useParams();
  const router = useRouter();
  const decoded = decodeURIComponent(courseName as string);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    fetchQuestions();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/student/pretest/${encodeURIComponent(decoded)}/questions`,
        { credentials: 'include' }
      );
      const data = await res.json();
      setQuestions(data.questions || []);
      setTimeLeft(data.time_limit || 1200);
      startTimer(data.time_limit || 1200);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startTimer = (seconds: number) => {
    let remaining = seconds;
    timerRef.current = setInterval(() => {
      remaining -= 1;
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(timerRef.current!);
        handleSubmit(true);
      }
    }, 1000);
  };

  const handleSelect = (qId: number, option: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: option }));
  };

  const handleSubmit = async (autoSubmit = false) => {
    if (!autoSubmit && !confirm('Submit the test? You cannot change answers after submitting.')) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setSubmitting(true);

    const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const payload = {
      answers: questions.map((q) => ({
        question_id: q.id,
        selected_ans: answers[q.id] || null,
      })),
      time_taken: timeTaken,
    };

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/student/pretest/${encodeURIComponent(decoded)}/submit`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      router.push(
        `/dashboard/student-management/student/pretest/${courseName}/result?attemptId=${data.attempt_id}`
      );
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  const q = questions[current];
  const answered = Object.keys(answers).length;

  return (
    <div className="p-4 max-w-2xl mx-auto">
      {/* Top bar */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-medium text-gray-600">
          Question {current + 1} / {questions.length}
        </span>
        <span className={`text-sm font-bold px-3 py-1 rounded-full ${
          timeLeft < 60 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
        }`}>
          ⏱ {formatTime(timeLeft)}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-6">
        <div
          className="bg-blue-600 h-1.5 rounded-full transition-all"
          style={{ width: `${((current + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question card */}
      <div className="bg-white rounded-2xl shadow border border-gray-200 p-6 mb-4">
        <p className="text-gray-800 font-medium text-base mb-6">{q.question}</p>

        <div className="space-y-3">
          {(['a', 'b', 'c', 'd'] as const).map((opt) => {
            const val = q[`option_${opt}` as keyof Question] as string;
            const optKey = opt.toUpperCase();
            const selected = answers[q.id] === optKey;
            return (
              <button
                key={opt}
                onClick={() => handleSelect(q.id, optKey)}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm transition-all ${
                  selected
                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                    : 'border-gray-200 hover:border-blue-300 text-gray-700'
                }`}
              >
                <span className={`inline-block w-6 h-6 rounded-full text-xs font-bold mr-3 text-center leading-6 ${
                  selected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {optKey}
                </span>
                {val}
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setCurrent((p) => Math.max(0, p - 1))}
          disabled={current === 0}
          className="px-5 py-2 border border-gray-300 text-gray-600 rounded-xl text-sm hover:bg-gray-50 disabled:opacity-40"
        >
          ← Previous
        </button>

        <span className="text-xs text-gray-400">{answered}/{questions.length} answered</span>

        {current < questions.length - 1 ? (
          <button
            onClick={() => setCurrent((p) => p + 1)}
            className="px-5 py-2 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700"
          >
            Next →
          </button>
        ) : (
          <button
            onClick={() => handleSubmit(false)}
            disabled={submitting}
            className="px-5 py-2 bg-green-600 text-white rounded-xl text-sm hover:bg-green-700 disabled:opacity-50 font-medium"
          >
            {submitting ? 'Submitting...' : '✅ Submit'}
          </button>
        )}
      </div>

      {/* Question dots */}
      <div className="flex flex-wrap gap-2 mt-6 justify-center">
        {questions.map((q, i) => (
          <button
            key={q.id}
            onClick={() => setCurrent(i)}
            className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${
              i === current
                ? 'bg-blue-600 text-white'
                : answers[q.id]
                ? 'bg-green-400 text-white'
                : 'bg-gray-200 text-gray-500'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}