'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Config {
  total_qs: number;
  pass_percent: number;
  time_limit: number;
}

interface AttemptStatus {
  has_attempted: boolean;
  passed: boolean;
  score: number;
  total: number;
}

export default function PretestStartPage() {
  const { courseName } = useParams();
  const router = useRouter();
  const decoded = decodeURIComponent(courseName as string);

  const [config, setConfig] = useState<Config | null>(null);
  const [status, setStatus] = useState<AttemptStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [courseName]);

  const fetchData = async () => {
    try {
      const [configRes, statusRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/student/pretest/${encodeURIComponent(decoded)}/config`, { credentials: 'include' }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/student/pretest/${encodeURIComponent(decoded)}/status`, { credentials: 'include' }),
      ]);
      const configData = await configRes.json();
      const statusData = await statusRes.json();
      setConfig(configData.config);
      setStatus(statusData);
    } catch (err) {
      console.error(err);
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
    <div className="p-6 max-w-xl mx-auto">
      <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 px-6 py-8 text-white text-center">
          <div className="text-4xl mb-3">📝</div>
          <h1 className="text-2xl font-bold">Pre-Test</h1>
          <p className="text-blue-100 mt-1">{decoded}</p>
        </div>

        {/* Previous attempt result */}
        {status?.has_attempted && (
          <div className={`mx-6 mt-6 px-4 py-3 rounded-lg text-sm font-medium ${
            status.passed
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-600'
          }`}>
            {status.passed ? '✅' : '❌'} Previous attempt: {status.score}/{status.total} —{' '}
            {status.passed ? 'Passed' : 'Failed'}
          </div>
        )}

        {/* Config info */}
        {config && (
          <div className="px-6 py-6 space-y-4">
            <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
              Test Details
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">{config.total_qs}</p>
                <p className="text-xs text-gray-500 mt-1">Questions</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{config.pass_percent}%</p>
                <p className="text-xs text-gray-500 mt-1">Pass Mark</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-orange-500">{config.time_limit / 60}</p>
                <p className="text-xs text-gray-500 mt-1">Minutes</p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-xs text-yellow-700 space-y-1">
              <p>⚠️ Do not refresh or close the tab during the test.</p>
              <p>⏱️ The timer starts as soon as you click Start.</p>
              <p>✅ Each question has only one correct answer.</p>
            </div>

            <button
              onClick={() =>
                router.push(
                  `/dashboard/student-management/student/pretest/${courseName}/attempt`
                )
              }
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all"
            >
              {status?.has_attempted ? '🔁 Retake Test' : '🚀 Start Test'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}