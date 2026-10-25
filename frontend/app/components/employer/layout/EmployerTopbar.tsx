"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export function EmployerTopbar() {
  const { displayName } = useAuth();
  return (
    <header className="fixed top-0 left-0 right-0 h-[64px] bg-white border-b border-[#E2E8E4] z-50 flex items-center px-4 md:px-6">
      <div className="flex items-center gap-3 w-[264px]">
        <button className="md:hidden p-2 rounded hover:bg-[#F7F9F7]">☰</button>
        <Link href="/" className="text-lg font-semibold text-[#172B22]">TefTef</Link>
        <span className="hidden md:inline text-xs text-[#52645A] border-l border-[#E2E8E4] pl-3">EMPLOYER WORKSPACE</span>
      </div>
      <div className="flex-1 flex items-center justify-between">
        <div className="hidden md:flex items-center flex-1 max-w-xl">
          <input
            type="text"
            placeholder="Search opportunities, candidates..."
            className="w-full border border-[#E2E8E4] rounded-[8px] px-4 py-2 text-sm"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 rounded hover:bg-[#F7F9F7]" aria-label="Notifications">🔔</button>
          <button className="p-2 rounded hover:bg-[#F7F9F7]" aria-label="Help">❓</button>
          <div className="hidden md:flex items-center gap-2 border-l border-[#E2E8E4] pl-3">
            <div className="w-8 h-8 rounded-full bg-[#26734D] text-white flex items-center justify-center text-sm">
              {displayName?.[0]?.toUpperCase() || "E"}
            </div>
            <span className="text-sm text-[#172B22]">{displayName}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
