"use client";
import { useEffect, useState } from "react";

interface Question {
  id: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
}

interface Config {
  total_qs: number;
  pass_percent: number;
  time_limit: number;
}

interface Result {
  score: number;
  total: number;
  passed: boolean;
}

export default function StudentPostTestPage() {
  const [courseName, setCourseName] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [config, setConfig] = useState<Config>({ total_qs: 10, pass_percent: 50, time_limit: 600 });
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [attempted, setAttempted] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [testStarted, setTestStarted] = useState(false);
  const [error, setError] = useState(""); // ← MOVED HERE (outside useEffect)

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const API = process.env.NEXT_PUBLIC_API_URL;

  // Step 1: fetch student's course
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API}/api/admin/finaltest/student/course`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
    
        if (data.course_name) {
          setCourseName(data.course_name);
        } else {
          setError("No course found: " + JSON.stringify(data));
          setLoading(false); // ← stop loading if no course
        }
      } catch (err) {
        console.error("Failed to fetch student course", err);
        setError("API error - check console");
        setLoading(false);
      }
    };
    fetchCourse();
  }, []);

  // Step 2: once we have course, fetch attempt status + questions + config
  useEffect(() => {
    if (!courseName) return;
    const fetchData = async () => {
      try {
        const [attemptRes, questionsRes, configRes] = await Promise.all([
          fetch(`${API}/api/admin/finaltest/student/attempt-status?course_name=${encodeURIComponent(courseName)}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API}/api/admin/finaltest/${encodeURIComponent(courseName)}/questions`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API}/api/admin/finaltest/${encodeURIComponent(courseName)}/config`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const attemptData = await attemptRes.json();
        const questionsData = await questionsRes.json();
        const configData = await configRes.json();

        if (attemptData.attempted) {
          setAttempted(true);
          setResult(attemptData.attempt);
        }

        const allQs: Question[] = questionsData.questions || [];
        const limit = configData.total_qs || 10;
        const shuffled = [...allQs].sort(() => Math.random() - 0.5).slice(0, limit);
        setQuestions(shuffled);
        setConfig(configData);
        setTimeLeft(configData.time_limit || 600);
      } catch (err) {
        console.error("Failed to fetch post-test data", err);
        setError("Failed to load test data. Please refresh.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseName]);

  // Timer countdown
  useEffect(() => {
    if (!testStarted || attempted) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [testStarted, attempted]);

  const handleStartTest = () => {
    setTestStarted(true);
    setStartTime(Date.now());
  };

  const handleSubmit = async (autoSubmit = false) => {
    if (!autoSubmit && !confirm("Submit your post-test now?")) return;
    setSubmitting(true);
    try {
      const timeTaken = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
      const res = await fetch(`${API}/api/admin/finaltest/student/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ course_name: courseName, answers, time_taken: timeTaken }),
      });
      const data = await res.json();
      setResult(data);
      setAttempted(true);
    } catch (err) {
      console.error("Failed to submit post-test", err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === questions.length && questions.length > 0;

  // ── LOADING ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-gray-400">
        Loading post-test...
      </div>
    );
  }

  // ── ERROR ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="p-6 text-center py-20">
        <div className="text-5xl mb-4">⚠️</div>
        <p className="text-red-500 font-semibold">{error}</p>
        <p className="text-gray-400 text-sm mt-2">Please try refreshing the page.</p>
      </div>
    );
  }

  // ── NO COURSE ─────────────────────────────────────────────────────────────
  if (!courseName) {
    return (
      <div className="p-6 text-center py-20">
        <div className="text-5xl mb-4">📚</div>
        <p className="text-gray-500">You are not enrolled in any course.</p>
      </div>
    );
  }

  // ── RESULT VIEW ───────────────────────────────────────────────────────────
  if (attempted && result) {
    const percent = result.total > 0 ? Math.round((result.score / result.total) * 100) : 0;
    return (
      <div className="p-6 max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Post-Test Result</h1>
        <p className="text-gray-500 text-sm mb-6">{courseName}</p>
        <div className={`rounded-2xl p-8 text-center border-2 ${result.passed ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300"}`}>
          <div className="text-6xl mb-4">{result.passed ? "🎉" : "😔"}</div>
          <h2 className={`text-3xl font-bold mb-2 ${result.passed ? "text-green-700" : "text-red-600"}`}>
            {result.passed ? "Passed!" : "Failed"}
          </h2>
          <p className="text-5xl font-bold text-gray-800 my-4">{result.score}/{result.total}</p>
          <p className="text-lg text-gray-600">{percent}%</p>
          <p className="text-sm text-gray-500 mt-2">Pass mark: {config.pass_percent}%</p>
        </div>
        {!result.passed && (
          <p className="text-center text-sm text-gray-400 mt-4">
            Contact your trainer to reset and retake the test.
          </p>
        )}
      </div>
    );
  }

  // ── NO QUESTIONS ──────────────────────────────────────────────────────────
  if (questions.length === 0) {
    return (
      <div className="p-6 text-center py-20">
        <div className="text-5xl mb-4">❓</div>
        <p className="text-gray-500">No post-test questions available for your course yet.</p>
        <p className="text-gray-400 text-sm mt-2">Please check back later.</p>
      </div>
    );
  }

  // ── START SCREEN ──────────────────────────────────────────────────────────
  if (!testStarted) {
    return (
      <div className="p-6 max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Post-Test</h1>
        <p className="text-gray-500 text-sm mb-6">{courseName}</p>
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm">
          <div className="text-5xl mb-4">📝</div>
          <h2 className="text-xl font-bold text-gray-800 mb-6">Ready to start?</h2>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-purple-50 rounded-xl p-4">
              <p className="text-2xl font-bold text-purple-600">{questions.length}</p>
              <p className="text-xs text-gray-500 mt-1">Questions</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-4">
              <p className="text-2xl font-bold text-amber-600">{config.pass_percent}%</p>
              <p className="text-xs text-gray-500 mt-1">Pass Mark</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-2xl font-bold text-blue-600">{Math.floor(config.time_limit / 60)}m</p>
              <p className="text-xs text-gray-500 mt-1">Time Limit</p>
            </div>
          </div>
          <button
            onClick={handleStartTest}
            className="w-full bg-purple-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-purple-700 transition-all"
          >
            Start Post-Test →
          </button>
        </div>
      </div>
    );
  }

  // ── TEST VIEW ─────────────────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Post-Test</h1>
          <p className="text-gray-500 text-sm">{courseName}</p>
        </div>
        <div className={`text-xl font-bold px-4 py-2 rounded-xl ${timeLeft < 60 ? "bg-red-100 text-red-600" : "bg-purple-100 text-purple-600"}`}>
          ⏱ {formatTime(timeLeft)}
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{answeredCount} of {questions.length} answered</span>
          <span>{Math.round((answeredCount / questions.length) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="bg-purple-500 h-2 rounded-full transition-all"
            style={{ width: `${(answeredCount / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-6 mb-8">
        {questions.map((q, index) => (
          <div key={q.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <p className="font-semibold text-gray-800 mb-4">
              <span className="text-purple-500 mr-2">Q{index + 1}.</span>
              {q.question}
            </p>
            <div className="flex flex-col gap-2">
              {[
                { key: "a", label: "A", val: q.option_a },
                { key: "b", label: "B", val: q.option_b },
                { key: "c", label: "C", val: q.option_c },
                { key: "d", label: "D", val: q.option_d },
              ].map(({ key, label, val }) => (
                <button
                  key={key}
                  onClick={() => setAnswers({ ...answers, [q.id]: key })}
                  className={`text-left px-4 py-3 rounded-lg border text-sm transition-all ${
                    answers[q.id] === key
                      ? "bg-purple-600 border-purple-600 text-white font-semibold"
                      : "bg-gray-50 border-gray-200 text-gray-700 hover:border-purple-300 hover:bg-purple-50"
                  }`}
                >
                  <span className="font-semibold mr-2">{label}.</span> {val}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => handleSubmit(false)}
        disabled={submitting || !allAnswered}
        className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${
          allAnswered
            ? "bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-200"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        {submitting ? "Submitting..." : allAnswered ? "Submit Post-Test ✓" : `Answer all questions (${answeredCount}/${questions.length})`}
      </button>
    </div>
  );
}
