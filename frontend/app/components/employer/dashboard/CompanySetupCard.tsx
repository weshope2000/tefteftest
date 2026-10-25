"use client";

import Link from "next/link";

export function CompanySetupCard() {
  return (
    <div className="bg-white rounded-[12px] border border-[#E2E8E4] p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[#172B22] mb-2">Company Setup</h2>
          <p className="text-[#52645A] text-sm">Review your company profile, verification and subscription setup.</p>
        </div>
        <Link href="/employer/company" className="px-4 py-2 border border-[#E2E8E4] text-[#172B22] rounded-[8px] hover:bg-[#F7F9F7]">
          Manage company profile →
        </Link>
      </div>
    </div>
  );
}
