"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export function WelcomeHeader() {
  const { displayName } = useAuth();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return (
    <div className="mb-6">
      <nav className="text-sm text-[#52645A] mb-2">Employer Workspace / Overview</nav>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold text-[#172B22]">{greeting}{displayName ? `, ${displayName}` : ""}!</h1>
          <p className="text-[#52645A] mt-1">Here’s what’s happening with your hiring activity.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/employer/jobs/new" className="px-4 py-2 bg-[#26734D] text-white rounded-[8px] hover:bg-[#1e5a3d]">
            Post Opportunity
          </Link>
          <Link href="/employer/talent" className="px-4 py-2 border border-[#E2E8E4] text-[#172B22] rounded-[8px] hover:bg-white">
            Find Talent
          </Link>
        </div>
      </div>
    </div>
  );
}
