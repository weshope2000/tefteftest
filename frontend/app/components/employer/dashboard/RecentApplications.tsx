"use client";

import Link from "next/link";

export function RecentApplications() {
  return (
    <div className="bg-white rounded-[12px] border border-[#E2E8E4] p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[#172B22]">Recent Applications</h2>
        <Link href="/employer/applications" className="text-[#26734D] text-sm hover:underline">Review applications →</Link>
      </div>
      <p className="text-[#52645A] text-sm">Applications will appear here when candidates apply to your opportunities.</p>
    </div>
  );
}

export function UpcomingInterviews() {
  return (
    <div className="bg-white rounded-[12px] border border-[#E2E8E4] p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[#172B22]">Upcoming Interviews</h2>
        <Link href="/employer/interviews" className="text-[#26734D] text-sm hover:underline">View calendar →</Link>
      </div>
      <p className="text-[#52645A] text-sm">No upcoming interviews.</p>
    </div>
  );
}
