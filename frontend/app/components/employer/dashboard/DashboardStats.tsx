"use client";

import Link from "next/link";

export function DashboardStats() {
  const stats = [
    { label: "Active opportunities", value: "—", href: "/employer/jobs?status=active", sub: "Live data" },
    { label: "New applications", value: "—", href: "/employer/applications?status=new", sub: "Live data" },
    { label: "Active contracts", value: "—", href: "/employer/contracts?status=active", sub: "Live data" },
    { label: "Upcoming interviews", value: "—", href: "/employer/interviews?status=upcoming", sub: "Live data" },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((s) => (
        <Link key={s.label} href={s.href} className="bg-white rounded-[12px] border border-[#E2E8E4] p-4 hover:border-[#26734D] transition">
          <p className="text-sm text-[#52645A]">{s.label}</p>
          <p className="text-3xl font-bold text-[#172B22] mt-2">{s.value}</p>
          <p className="text-xs text-[#52645A] mt-1">{s.sub}</p>
        </Link>
      ))}
    </div>
  );
}
