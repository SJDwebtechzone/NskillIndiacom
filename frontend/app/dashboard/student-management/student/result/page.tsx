'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';

interface ResultData {
  score: number;
  total: number;
  passed: boolean;
  pass_percent: number;
  time_taken: number;
  answers: {
    question: string;
    selected_ans: string;
    correct_ans: string;
    is_correct: boolean;
  }[];
}

export default function PretestResultPage() {
  const { courseName } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const decoded = decodeURIComponent(courseName as string);
  const attemptId = searchParams.get('attemptId');

  const [result, setResult] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchResult();
  }, [attemptId]);

  const fetchResult = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/student/pretest/result/${attemptId}`,
        { credentials: 'include' }
      );
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!result) return null;

  const percent = Math.round((result.score / result.total) * 100);

  return (
    <div className="p-6 max-w-xl mx-auto">
      <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">

        {/* Result header */}
        <div className={`px-6 py-8 text-center ${result.passed ? 'bg-green-500' : 'bg-red-500'} text-white`}>
          <div className="text-5xl mb-3">{result.passed ? '🎉' : '😔'}</div>
          <h1 className="text-2xl font-bold">{result.passed ? 'Congratulations!' : 'Better Luck Next Time'}</h1>
          <p className="text-sm opacity-90 mt-1">{decoded}</p>
        </div>

        {/* Score */}
        <div className="px-6 py-6">
          <div className="flex justify-center mb-6">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15.9" fill="none"
                  stroke={result.passed ? '#22c55e' : '#ef4444'}
                  strokeWidth="3"
                  strokeDasharray={`${percent} ${100 - percent}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-gray-800">{percent}%</span>
                <span className="text-xs text-gray-400">{result.score}/{result.total}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-green-600">{result.score}</p>
              <p className="text-xs text-gray-500">Correct</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-red-500">{result.total - result.score}</p>
              <p className="text-xs text-gray-500">Wrong</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-blue-600">{formatTime(result.time_taken)}</p>
              <p className="text-xs text-gray-500">Time Taken</p>
            </div>
          </div>

          <div className={`text-center text-sm font-medium px-4 py-2 rounded-lg mb-6 ${
            result.passed
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-600 border border-red-200'
          }`}>
            {result.passed
              ? `✅ Passed! Required ${result.pass_percent}%, you scored ${percent}%`
              : `❌ Failed. Required ${result.pass_percent}%, you scored ${percent}%`}
          </div>

          {/* Review answers toggle */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full py-2 border border-gray-300 text-gray-600 rounded-xl text-sm hover:bg-gray-50 mb-4"
          >
            {showDetails ? '▲ Hide' : '▼ Review Answers'}
          </button>

          {showDetails && (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {result.answers.map((a, i) => (
                <div key={i} className={`rounded-xl p-4 border text-sm ${
                  a.is_correct ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}>
                  <p className="font-medium text-gray-800 mb-2">{i + 1}. {a.question}</p>
                  <p className={a.is_correct ? 'text-green-700' : 'text-red-600'}>
                    Your answer: <strong>{a.selected_ans || 'Not answered'}</strong>
                  </p>
                  {!a.is_correct && (
                    <p className="text-green-700">
                      Correct answer: <strong>{a.correct_ans}</strong>
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => router.push('/dashboard/student-management/pre-test')}
            className="w-full mt-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
          >
            ← Back to Courses
          </button>
        </div>
      </div>
    </div>
  );
}
