"use client";

import { useState } from "react";
import { AdminLayout } from "@/app/components/layout/AdminLayout";

const SUBTABS = [
  { key: "email", label: "Email verification" },
  { key: "phone", label: "Phone verification" },
  { key: "identity", label: "Identity verification" },
  { key: "business", label: "Business verification" },
  { key: "resubmissions", label: "Resubmissions & appeals" },
];

export default function AdminVerificationsPage() {
  const [subtab, setSubtab] = useState("identity");

  return (
    <AdminLayout>
      <div style={{ backgroundColor: "#F7F9F7", minHeight: "calc(100vh - 64px)" }}>
        <div className="px-6 py-8" style={{ maxWidth: 1200 }}>
          <div className="mb-6">
            <h1 className="text-[28px] font-semibold text-[#172B22] mb-1">Verification queue</h1>
            <p className="text-[#52645A]">Contact checks, identity cases, business verification, resubmissions and appeals.</p>
          </div>

          <div className="flex gap-2 mb-4 border-b border-[#E2E8E4] overflow-x-auto">
            {SUBTABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setSubtab(t.key)}
                className={`pb-2 px-3 text-sm whitespace-nowrap ${
                  subtab === t.key
                    ? "text-[#26734D] border-b-2 border-[#26734D] font-semibold"
                    : "text-[#52645A] hover:text-[#26734D]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            <input type="text" placeholder="Search by case ID, user, email..." className="border border-[#E2E8E4] rounded-[8px] px-4 py-2 flex-1 min-w-[200px] text-sm" />
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
        </div>
      </div>
    </AdminLayout>
  );
}
