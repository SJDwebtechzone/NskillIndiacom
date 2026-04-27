"use client";
import { useEffect, useState } from "react";

interface CourseFeesData {
  // Student
  full_name: string;
  admission_number: string;
  admission_date: string;
  course_name: string;
  course_level: string;
  mode_of_training: string;
  batch_allotted: string;
  training_location: string;
  // Fees
  course_fees: number;
  total_fees: number;
  paid_fees: number;
  balance_amount: number;
  payment_mode: string;
  payment_date: string;
  instalment_1: number;
  instalment_2: number;
  // Trainer & Course
  trainer_name: string;
  duration: string;
}

export default function CourseFeesDetailsPage() {
  const [data, setData] = useState<CourseFeesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const API = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API}/api/admissions/course-fees-details`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await res.json();
        if (result.data) setData(result.data);
        else setError(result.error || "Data not found.");
      } catch (err) {
        console.error(err);
        setError("Failed to load course details.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit", month: "long", year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    if (!amount && amount !== 0) return "₹0";
    return `₹${Number(amount).toLocaleString("en-IN")}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-gray-400">
        Loading details...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 text-center py-20">
        <div className="text-5xl mb-4">⚠️</div>
        <p className="text-red-500 font-semibold">{error || "No data found"}</p>
      </div>
    );
  }

  const paidPercent = data.total_fees > 0
    ? Math.round((data.paid_fees / data.total_fees) * 100)
    : 0;

  const payments = [];
  if (data.instalment_1 > 0) payments.push({ label: "Instalment 1", amount: data.instalment_1, date: data.payment_date, mode: data.payment_mode });
  if (data.instalment_2 > 0) payments.push({ label: "Instalment 2", amount: data.instalment_2, date: data.payment_date, mode: data.payment_mode });
  const remaining = data.paid_fees - data.instalment_1 - data.instalment_2;
  if (remaining > 0) payments.push({ label: "Additional Payment", amount: remaining, date: data.payment_date, mode: data.payment_mode });
  if (payments.length === 0 && data.paid_fees > 0) {
    payments.push({ label: "Full Payment", amount: data.paid_fees, date: data.payment_date, mode: data.payment_mode });
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Course & Fees Details</h1>
        <p className="text-gray-500 text-sm mt-1">Your enrolled course and payment information</p>
      </div>

      {/* Course Details Card */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm mb-5">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-4">
          <h2 className="text-white font-bold text-sm uppercase tracking-wider">📚 Course Details</h2>
        </div>
        <div className="p-5">
          {/* Course name highlight */}
          <div className="flex items-center gap-4 mb-5 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center text-white text-2xl font-black flex-shrink-0">
              {data.course_name?.charAt(0) || "C"}
            </div>
            <div>
              <p className="text-lg font-black text-gray-900">{data.course_name}</p>
              <p className="text-sm text-blue-600 font-semibold">{data.course_level || "N/A"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Admission No", value: data.admission_number || "N/A", icon: "🪪" },
              { label: "Admission Date", value: formatDate(data.admission_date), icon: "📅" },
              { label: "Trainer", value: data.trainer_name || "N/A", icon: "👨‍🏫" },
              { label: "Duration", value: data.duration || "N/A", icon: "⏱️" },
              { label: "Mode of Training", value: data.mode_of_training || "N/A", icon: "🏫" },
              { label: "Batch", value: data.batch_allotted || "N/A", icon: "👥" },
              { label: "Training Location", value: data.training_location || "N/A", icon: "📍" },
            ].map((item) => (
              <div key={item.label} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">
                  {item.icon} {item.label}
                </p>
                <p className="text-sm font-bold text-gray-800">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Progress Card */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm mb-5">
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-5 py-4">
          <h2 className="text-white font-bold text-sm uppercase tracking-wider">💰 Fee Summary</h2>
        </div>
        <div className="p-5">
          {/* Progress Bar */}
          <div className="mb-5">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold text-gray-700">Payment Progress</span>
              <span className={`font-bold ${paidPercent >= 100 ? "text-green-600" : "text-amber-600"}`}>
                {paidPercent}% Paid
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
              <div
                className="h-4 rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(paidPercent, 100)}%`,
                  background: paidPercent >= 100
                    ? "linear-gradient(90deg, #16a34a, #22c55e)"
                    : "linear-gradient(90deg, #d97706, #f59e0b)",
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>₹0</span>
              <span>{formatCurrency(data.total_fees)}</span>
            </div>
          </div>

          {/* Fee Breakdown */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { label: "Course Fees", value: formatCurrency(data.course_fees), color: "bg-gray-50 border-gray-200", textColor: "text-gray-800" },
              { label: "Total Fees", value: formatCurrency(data.total_fees), color: "bg-blue-50 border-blue-200", textColor: "text-blue-800" },
              { label: "Amount Paid", value: formatCurrency(data.paid_fees), color: "bg-green-50 border-green-200", textColor: "text-green-700" },
              { label: "Balance Due", value: formatCurrency(data.balance_amount), color: data.balance_amount > 0 ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200", textColor: data.balance_amount > 0 ? "text-red-600" : "text-green-600" },
            ].map((item) => (
              <div key={item.label} className={`rounded-xl p-4 border ${item.color}`}>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">{item.label}</p>
                <p className={`text-xl font-black ${item.textColor}`}>{item.value}</p>
              </div>
            ))}
          </div>

          {/* Status Banner */}
          {data.balance_amount <= 0 ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
              <p className="text-green-700 font-bold text-sm">✅ Fully Paid — No Balance Due</p>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
              <p className="text-amber-700 font-bold text-sm">
                ⚠️ Balance Due: {formatCurrency(data.balance_amount)}
              </p>
              <p className="text-amber-600 text-xs mt-1">Please contact the admin to clear your balance.</p>
            </div>
          )}
        </div>
      </div>

      {/* Payment History */}
      {payments.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-5 py-4">
            <h2 className="text-white font-bold text-sm uppercase tracking-wider">🧾 Payment History</h2>
          </div>
          <div className="p-5">
            <div className="flex flex-col gap-3">
              {payments.map((p, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-sm flex-shrink-0">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{p.label}</p>
                      <p className="text-xs text-gray-400">
                        {p.mode} · {formatDate(p.date)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-gray-800">{formatCurrency(p.amount)}</p>
                    <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
                      Paid
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
