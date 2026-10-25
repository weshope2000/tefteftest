"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

const navSections = [
  {
    label: "WORKSPACE",
    items: [
      { label: "Overview", href: "/employer" },
      {
        label: "My Opportunities",
        href: "/employer/jobs",
        submenu: [
          { label: "All Opportunities", href: "/employer/jobs" },
          { label: "Post Opportunity", href: "/employer/jobs/new" },
        ],
      },
      { label: "Applications", href: "/employer/applications" },
      { label: "Find Talent", href: "/employer/talent" },
      { label: "Proposals", href: "/employer/proposals" },
      { label: "Contracts", href: "/employer/contracts" },
      { label: "Interviews", href: "/employer/interviews" },
      { label: "Messages", href: "/employer/messages" },
      { label: "Tasks", href: "/employer/tasks" },
    ],
  },
  {
    label: "ORGANIZATION",
    items: [
      { label: "Company Profile", href: "/employer/company" },
      { label: "Verification", href: "/employer/verification" },
      { label: "Billing", href: "/employer/billing" },
      { label: "Analytics", href: "/employer/analytics" },
      { label: "Notifications", href: "/employer/notifications" },
      { label: "Settings", href: "/employer/settings" },
    ],
  },
];

export function EmployerSidebar() {
  const pathname = usePathname();
  const { displayName, logout } = useAuth();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ "My Opportunities": true });

  const toggle = (label: string) => {
    setExpanded((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <aside className="w-[264px] min-h-screen bg-[#0F1A14] text-white flex flex-col fixed left-0 top-[64px] bottom-0 z-40">
      <div className="px-6 py-5 border-b border-white/10">
        <h2 className="text-xs tracking-widest text-white/60">EMPLOYER WORKSPACE</h2>
        <p className="text-sm text-white mt-2 truncate" title={displayName}>
          {displayName}
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        {navSections.map((section) => (
          <div key={section.label} className="mb-6">
            <p className="px-6 text-xs uppercase tracking-widest text-white/40 mb-2">{section.label}</p>
            <ul className="px-3 space-y-1">
              {section.items.map((item: any) => {
                const isActive =
                  pathname === item.href || (item.href !== "/employer" && pathname?.startsWith(item.href));
                const hasSub = Array.isArray(item.submenu);
                return (
                  <li key={item.href}>
                    {hasSub ? (
                      <div>
                        <button
                          onClick={() => toggle(item.label)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition ${
                            isActive ? "bg-[#26734D] text-white" : "text-white/80 hover:bg-white/5"
                          }`}
                        >
                          <span>{item.label}</span>
                          <span className="text-xs">{expanded[item.label] ? "▾" : "▸"}</span>
                        </button>
                        {expanded[item.label] && (
                          <ul className="mt-1 ml-4 space-y-1">
                            {item.submenu.map((sub: any) => (
                              <li key={sub.href}>
                                <Link
                                  href={sub.href}
                                  className={`block px-3 py-2 rounded-lg text-sm transition ${
                                    pathname === sub.href
                                      ? "text-white bg-white/10"
                                      : "text-white/70 hover:bg-white/5 hover:text-white"
                                  }`}
                                >
                                  {sub.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        className={`block px-3 py-2 rounded-lg text-sm transition ${
                          isActive ? "bg-[#26734D] text-white" : "text-white/80 hover:bg-white/5"
                        }`}
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-full bg-[#26734D] flex items-center justify-center text-sm font-semibold">
            {displayName?.[0]?.toUpperCase() || "E"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white truncate">{displayName}</p>
            <p className="text-xs text-white/50">Employer</p>
          </div>
          <button onClick={logout} className="text-xs text-white/60 hover:text-white">Logout</button>
        </div>
      </div>
    </aside>
  );
}
