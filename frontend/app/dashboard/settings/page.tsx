"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/app/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const MENU_ITEMS = [
  { key: "account", label: "Account information" },
  { key: "contact", label: "Contact & verification" },
  { key: "security", label: "Security & login" },
  { key: "notifications", label: "Notifications" },
  { key: "privacy", label: "Privacy & visibility" },
  { key: "language", label: "Language & region" },
  { key: "payment", label: "Payment preferences" },
  { key: "work", label: "Work preferences" },
  { key: "appearance", label: "Appearance & accessibility" },
  { key: "help", label: "Help & support" },
  { key: "management", label: "Account management" },
];

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [active, setActive] = useState("account");

  useEffect(() => {
    if (!user) router.push("/login");
  }, [user, router]);

  if (!user) return null;

  return (
    <DashboardLayout>
      <div style={{ backgroundColor: "#F7F9F7", minHeight: "calc(100vh - 64px)" }}>
        <div className="px-6 py-8" style={{ maxWidth: 1200 }}>
          <div className="mb-6">
            <h1 className="text-[28px] font-semibold text-[#172B22] mb-1">Settings</h1>
            <p className="text-[#52645A]">Manage your account, preferences, and security.</p>
          </div>

          <div className="flex gap-6">
            <aside className="bg-white rounded-[12px] border border-[#E2E8E4] p-4" style={{ width: 240 }}>
              <div className="mb-4">
                <p className="font-semibold text-[#172B22]">Abebe Alemu</p>
                <p className="text-sm text-[#52645A]">Freelancer account</p>
              </div>
              <nav className="space-y-1">
                {MENU_ITEMS.map((item) => (
                  <button key={item.key} onClick={() => setActive(item.key)} className={`w-full text-left px-3 py-2 rounded text-sm ${active === item.key ? "bg-[#F0F5F1] text-[#26734D] font-semibold" : "text-[#52645A] hover:bg-[#F7F9F7]"}`}>
                    {item.label}
                  </button>
                ))}
              </nav>
            </aside>

            <main className="flex-1 bg-white rounded-[12px] border border-[#E2E8E4] p-6" style={{ minHeight: 400 }}>
              {active === "account" && (
                <div>
                  <h2 className="text-lg font-semibold text-[#172B22] mb-4">Account information</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-[#52645A] mb-1">First and last name</label>
                      <input type="text" defaultValue="Abebe Alemu" className="border border-[#E2E8E4] rounded-[8px] px-4 py-2 w-full text-sm" style={{ height: 44 }} />
                    </div>
                    <div>
                      <label className="block text-sm text-[#52645A] mb-1">Email address</label>
                      <input type="email" defaultValue={user.email || ""} className="border border-[#E2E8E4] rounded-[8px] px-4 py-2 w-full text-sm" style={{ height: 44 }} />
                    </div>
                    <div>
                      <label className="block text-sm text-[#52645A] mb-1">Phone number</label>
                      <input type="text" placeholder="+251 ..." className="border border-[#E2E8E4] rounded-[8px] px-4 py-2 w-full text-sm" style={{ height: 44 }} />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button className="px-4 py-2 border border-[#E2E8E4] rounded-[8px] text-sm">Cancel</button>
                      <button className="px-4 py-2 bg-[#26734D] text-white rounded-[8px] text-sm hover:bg-[#1e5a3d]">Save changes</button>
                    </div>
                  </div>
                </div>
              )}
              {active === "notifications" && (
                <div>
                  <h2 className="text-lg font-semibold text-[#172B22] mb-4">Notifications</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-[#172B22]">Project and contract updates</p>
                        <p className="text-xs text-[#52645A]">Email notifications</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-[#172B22]">Messages and proposals</p>
                        <p className="text-xs text-[#52645A]">In-app notifications</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                  </div>
                </div>
              )}
              {active === "privacy" && (
                <div>
                  <h2 className="text-lg font-semibold text-[#172B22] mb-4">Privacy & visibility</h2>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-medium text-[#172B22]">Profile visibility</p>
                      <p className="text-xs text-[#52645A]">Control who can view your freelancer profile</p>
                    </div>
                    <select className="border border-[#E2E8E4] rounded-[8px] px-3 py-2 text-sm">
                      <option>Public</option>
                      <option>Private</option>
                    </select>
                  </div>
                </div>
              )}
              {active === "management" && (
                <div>
                  <h2 className="text-lg font-semibold text-[#172B22] mb-4">Account management</h2>
                  <button onClick={() => { logout(); router.push("/"); }} className="px-4 py-2 bg-red-600 text-white rounded-[8px] text-sm hover:bg-red-700">Log out</button>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}