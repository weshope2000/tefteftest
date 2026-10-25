"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminLayout } from "@/app/components/layout/AdminLayout";
import api from "@/lib/api";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status?: string;
  created_at: string;
}

const TABS = [
  { key: "users", label: "Users" },
  { key: "verification", label: "Verification queue" },
];

const VERIFICATION_SUBTABS = [
  { key: "email", label: "Email verification" },
  { key: "phone", label: "Phone verification" },
  { key: "identity", label: "Identity verification" },
  { key: "business", label: "Business verification" },
  { key: "resubmissions", label: "Resubmissions & appeals" },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("users");
  const [verificationSubtab, setVerificationSubtab] = useState("identity");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await api.get("/auth/users");
        if (mounted && Array.isArray(res.data)) setUsers(res.data);
      } catch {
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const total = users.length;
  const active = users.filter((u) => (u.status || "active") === "active").length;
  const restricted = users.filter((u) => u.status === "suspended").length;
  const pending = 0;

  const filtered = users.filter((u) => {
    const text = `${u.name} ${u.email} ${u.id}`.toLowerCase();
    return text.includes(search.trim().toLowerCase());
  });

  return (
    <AdminLayout>
      <div style={{ backgroundColor: "#F7F9F7", minHeight: "calc(100vh - 64px)" }}>
        <div className="px-6 py-8" style={{ maxWidth: 1200 }}>
          <div className="mb-6">
            <h1 className="text-[28px] font-semibold text-[#172B22] mb-1">Users & Verification</h1>
            <p className="text-[#52645A]">
              Manage accounts, review verification cases, and maintain marketplace trust.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Link href="/admin/users" className="bg-white rounded-[12px] border border-[#E2E8E4] p-4 hover:shadow-sm transition">
              <p className="text-sm text-[#52645A]">Total users</p>
              <p className="text-2xl font-bold text-[#172B22] mt-1">{total}</p>
            </Link>
            <Link href="/admin/users?status=active" className="bg-white rounded-[12px] border border-[#E2E8E4] p-4 hover:shadow-sm transition">
              <p className="text-sm text-[#52645A]">Active accounts</p>
              <p className="text-2xl font-bold text-[#172B22] mt-1">{active}</p>
            </Link>
            <Link href="/admin/verifications" className="bg-white rounded-[12px] border border-[#E2E8E4] p-4 hover:shadow-sm transition">
              <p className="text-sm text-[#52645A]">Pending reviews</p>
              <p className="text-2xl font-bold text-[#172B22] mt-1">{pending}</p>
            </Link>
            <Link href="/admin/users?status=restricted" className="bg-white rounded-[12px] border border-[#E2E8E4] p-4 hover:shadow-sm transition">
              <p className="text-sm text-[#52645A]">Restricted accounts</p>
              <p className="text-2xl font-bold text-[#172B22] mt-1">{restricted}</p>
            </Link>
          </div>

          <div className="flex gap-2 mb-4 border-b border-[#E2E8E4]">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`pb-2 px-4 text-sm ${
                  activeTab === t.key
                    ? "text-[#26734D] border-b-2 border-[#26734D] font-semibold"
                    : "text-[#52645A] hover:text-[#26734D]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {activeTab === "users" && (
            <>
              <div className="mb-3">
                <p className="text-sm text-[#172B22] font-medium">Users</p>
                <p className="text-xs text-[#52645A]">Directory, profile, status, restrictions, account history.</p>
              </div>

              <div className="flex flex-wrap items-center gap-3 mb-4">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, email, user ID, organization name, verification case ID..."
                  className="border border-[#E2E8E4] rounded-[8px] px-4 py-2 flex-1 min-w-[200px] text-sm"
                />
                <select className="border border-[#E2E8E4] rounded-[8px] px-3 py-2 text-sm">
                  <option>Filters: account type  status  verification  date joined</option>
                  <option>Freelancer</option>
                  <option>Client</option>
                  <option>Organization</option>
                </select>
                <button className="px-3 py-2 border border-[#E2E8E4] rounded-[8px] text-sm bg-white">Apply filters</button>
                <button className="px-3 py-2 border border-[#E2E8E4] rounded-[8px] text-sm bg-white">Reset</button>
              </div>

              {loading ? (
                <p className="text-[#52645A]">Loading users...</p>
              ) : (
                <div className="bg-white rounded-[12px] border border-[#E2E8E4] overflow-hidden">
                  <div className="p-4 border-b border-[#E2E8E4]">
                    <p className="text-sm font-medium text-[#172B22]">User directory</p>
                  </div>
                  <table className="w-full text-sm">
                    <thead className="bg-[#F7F9F7]">
                      <tr>
                        <th className="text-left p-4 text-[#52645A] font-medium">User / ID</th>
                        <th className="text-left p-4 text-[#52645A] font-medium">Account type</th>
                        <th className="text-left p-4 text-[#52645A] font-medium">Account status</th>
                        <th className="text-left p-4 text-[#52645A] font-medium">Verification</th>
                        <th className="text-left p-4 text-[#52645A] font-medium">Joined</th>
                        <th className="text-left p-4 text-[#52645A] font-medium">Last activity</th>
                        <th className="text-left p-4 text-[#52645A] font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((u) => (
                        <tr key={u.id} className="border-t border-[#E2E8E4] hover:bg-[#F7F9F7]">
                          <td className="p-4">
                            <p className="text-[#172B22] font-medium">{u.name || ""}</p>
                            <p className="text-xs text-[#52645A]">{u.email}</p>
                            <p className="text-xs text-[#52645A]">ID: {u.id.slice(0, 8)}</p>
                          </td>
                          <td className="p-4 text-[#52645A] capitalize">{u.role}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs ${u.status === "suspended" ? "bg-red-100 text-red-700" : u.status === "restricted" ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"}`}>
                              {u.status || "active"}
                            </span>
                          </td>
                          <td className="p-4 text-[#52645A]">Contact / Identity / Business</td>
                          <td className="p-4 text-[#52645A]">{new Date(u.created_at).toLocaleDateString()}</td>
                          <td className="p-4 text-[#52645A]"></td>
                          <td className="p-4">
                            <Link href={`/dashboard/admin/users/${u.id}`} className="text-[#26734D] hover:underline">
                              View  More
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="p-4 flex items-center justify-between text-sm text-[#52645A]">
                    <p>Rows per page: 25</p>
                    <p>1</p>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === "verification" && (
            <>
              <div className="mb-3">
                <p className="text-sm text-[#172B22] font-medium">Verification queue</p>
                <p className="text-xs text-[#52645A]">
                  Contact checks, identity cases, business verification, resubmissions and appeals.
                </p>
              </div>

              <div className="flex gap-2 mb-4 border-b border-[#E2E8E4] overflow-x-auto">
                {VERIFICATION_SUBTABS.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setVerificationSubtab(t.key)}
                    className={`pb-2 px-3 text-sm whitespace-nowrap ${
                      verificationSubtab === t.key
                        ? "text-[#26734D] border-b-2 border-[#26734D] font-semibold"
                        : "text-[#52645A] hover:text-[#26734D]"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3 mb-4">
                <input
                  type="text"
                  placeholder="Search by case ID, user, email..."
                  className="border border-[#E2E8E4] rounded-[8px] px-4 py-2 flex-1 min-w-[200px] text-sm"
                />
                <select className="border border-[#E2E8E4] rounded-[8px] px-3 py-2 text-sm">
                  <option>Case status</option>
                  <option>Pending</option>
                  <option>Under review</option>
                  <option>More information required</option>
                  <option>Verified</option>
                  <option>Rejected</option>
                  <option>Expired</option>
                </select>
                <select className="border border-[#E2E8E4] rounded-[8px] px-3 py-2 text-sm">
                  <option>Assigned reviewer</option>
                </select>
                <select className="border border-[#E2E8E4] rounded-[8px] px-3 py-2 text-sm">
                  <option>Queue age</option>
                </select>
              </div>

              <div className="bg-white rounded-[12px] border border-[#E2E8E4] overflow-hidden">
                <div className="p-4 border-b border-[#E2E8E4]">
                  <p className="text-sm font-medium text-[#172B22]">Verification queue</p>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-[#F7F9F7]">
                    <tr>
                      <th className="text-left p-4 text-[#52645A] font-medium">Case ID</th>
                      <th className="text-left p-4 text-[#52645A] font-medium">User</th>
                      <th className="text-left p-4 text-[#52645A] font-medium">Verification type</th>
                      <th className="text-left p-4 text-[#52645A] font-medium">Submitted</th>
                      <th className="text-left p-4 text-[#52645A] font-medium">Status</th>
                      <th className="text-left p-4 text-[#52645A] font-medium">Assigned reviewer</th>
                      <th className="text-left p-4 text-[#52645A] font-medium">Age / priority</th>
                      <th className="text-left p-4 text-[#52645A] font-medium">Next action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={8} className="p-6 text-center text-[#52645A]">
                        No pending verification cases.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
