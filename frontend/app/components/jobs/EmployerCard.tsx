"use client";

import { Employer } from "@/lib/types";

const verificationStyles: Record<string, { label: string; className: string }> = {
  verified: { label: "Verified", className: "bg-green-100 text-green-700" },
  pending: { label: "Verification pending", className: "bg-amber-100 text-amber-700" },
  rejected: { label: "Verification rejected", className: "bg-red-100 text-red-700" },
  unverified: { label: "Unverified", className: "bg-gray-100 text-gray-600" },
};

export default function EmployerCard({ employer }: { employer: Employer | null | undefined }) {
  if (!employer) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="font-semibold text-gray-900 mb-2">Employer</h3>
        <p className="text-sm text-gray-500">Employer details are not available.</p>
      </div>
    );
  }

  const verification = verificationStyles[employer.verification_status] ?? verificationStyles.unverified;
  const displayName = employer.name || employer.company_name || "Employer";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="font-semibold text-gray-900 mb-4">Employer</h3>

      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center font-semibold text-lg shrink-0">
          {initial}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 truncate">{displayName}</p>
          {employer.company_name && (
            <p className="text-sm text-gray-600 truncate">{employer.company_name}</p>
          )}
          <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${verification.className}`}>
            {verification.label}
          </span>
        </div>
      </div>

      {employer.headline && (
        <p className="text-sm text-gray-700 mt-4">{employer.headline}</p>
      )}
      {employer.bio && (
        <p className="text-sm text-gray-600 mt-2 whitespace-pre-line">{employer.bio}</p>
      )}

      <dl className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-sm">
        {employer.country && (
          <div className="flex justify-between">
            <dt className="text-gray-500">Location</dt>
            <dd className="text-gray-900">{employer.country}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-gray-500">Total spent</dt>
          <dd className="text-gray-900">${employer.total_spent.toLocaleString()}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-500">Hires</dt>
          <dd className="text-gray-900">{employer.total_hired}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-500">Member since</dt>
          <dd className="text-gray-900">
            {new Date(employer.member_since).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
            })}
          </dd>
        </div>
      </dl>
    </div>
  );
}
