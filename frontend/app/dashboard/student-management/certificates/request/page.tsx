"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CertificateRequestPage() {
  const router = useRouter();

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Request Certificate</h1>
        <p className="text-gray-500 text-sm mt-1">
          If you believe all conditions are met, you can request a manual review
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">📋</div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">Manual Certificate Request</h2>
          <p className="text-gray-500 text-sm">
            If your certificate is not auto-unlocking despite completing all tasks, 
            you can request a manual review by the admin.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <p className="text-blue-700 text-sm font-semibold mb-1">ℹ️ Before requesting:</p>
          <ul className="text-blue-600 text-sm space-y-1 list-disc list-inside">
            <li>Make sure all fees are cleared</li>
            <li>All tests must be completed and passed</li>
            <li>Practical video must be verified by trainer</li>
            <li>Google review and feedback must be submitted</li>
            <li>Attendance must be 75% or above</li>
            <li>Placement details must be uploaded</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => router.push("/dashboard/student-management/certificates/download")}
            className="flex-1 bg-blue-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all"
          >
            Check My Progress
          </button>
        </div>
      </div>
    </div>
  );
}
