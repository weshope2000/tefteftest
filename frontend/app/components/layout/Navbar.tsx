"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";

export const Navbar = () => {
  const { user, displayName, logout } = useAuth();
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");

  if (!isDashboard) {
    return (
      <nav className="flex items-center justify-between px-8 py-4 bg-white shadow-md">
        <Link href="/">
          <Image src="/images/teftef-logo.png" alt="Teftef Logo" width={40} height={40} className="h-10 w-auto" style={{ width: "auto", height: "auto" }} />
        </Link>
        <ul className="hidden md:flex space-x-6 text-gray-700 font-medium">
          <li><Link href="/hire">Hire</Link></li>
          <li><Link href="/jobs">Find work</Link></li>
          <li><Link href="/why-teftef">Why Teftef</Link></li>
          <li><Link href="/whats-new">What's new</Link></li>
          <li><Link href="/pricing">Pricing</Link></li>
          <li><Link href="/enterprise">For enterprise</Link></li>
        </ul>
        <div className="flex items-center space-x-4">
          <input type="text" placeholder="Search talent..." className="border rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-green-600" />
          <Link href="/login" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">Log in</Link>
          <Link href="/register" className="px-4 py-2 border border-green-600 text-green-600 rounded hover:bg-green-50 transition">Sign up</Link>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed top-0 left-0 w-full h-[64px] bg-white border-b border-[#E2E8E4] flex items-center px-6 z-50" style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="flex items-center gap-2 shrink-0" style={{ width: 140 }}>
        <Image src="/images/teftef-logo.png" alt="Teftef Logo" width={36} height={36} className="w-9 h-9" />
        <span className="text-[22px] font-bold text-[#26734D]">TefTef</span>
      </div>

      <div className="flex-1 flex justify-center px-4">
        <div className="relative w-[320px] h-[40px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#344054]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="text" placeholder="Search TefTef..." className="w-full h-full pl-10 pr-3 border border-[#DDE5DF] rounded-[8px] text-[14px] text-[#344054] focus:outline-none focus:border-[#26734D]" />
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {user && (
          <>
            <button className="w-[36px] h-[36px] flex items-center justify-center rounded hover:bg-[#F0F5F1] text-[#344054] hover:text-[#26734D]" aria-label="Messages">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </button>
            <button className="w-[36px] h-[36px] flex items-center justify-center rounded hover:bg-[#F0F5F1] text-[#344054] hover:text-[#26734D]" aria-label="Notifications">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            </button>
            <div className="flex items-center gap-2 ml-4">
              <div className="w-9 h-9 rounded-full bg-[#26734D] text-white flex items-center justify-center font-semibold text-sm">
                {(displayName || "U").charAt(0).toUpperCase()}
              </div>
              <svg className="w-4 h-4 text-[#344054]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
            <button onClick={logout} className="ml-2 px-3 py-1.5 text-[13px] text-[#344054] hover:text-[#26734D]">Sign Out</button>
          </>
        )}
        {!user && (
          <div className="flex items-center gap-2">
            <Link href="/login" className="px-4 py-2 bg-[#26734D] text-white rounded-[8px] text-[14px] hover:bg-[#1e5a3d]">Log in</Link>
            <Link href="/register" className="px-4 py-2 border border-[#26734D] text-[#26734D] rounded-[8px] text-[14px] hover:bg-[#F0F5F1]">Sign up</Link>
          </div>
        )}
      </div>
    </nav>
  );
};