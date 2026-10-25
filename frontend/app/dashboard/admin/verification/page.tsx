"use client";

import { useState } from "react";
import { AdminLayout } from "@/app/components/layout/AdminLayout";

const TYPE_TABS = [
  { key: "contact", label: "Contact verification" },
  { key: "identity", label: "Identity verification" },
  { key: "business", label: "Business verification" },
  { key: "resubmissions", label: "Resubmissions & appeals" },
];

export default function AdminVerificationManagementPage() {
  const [typeTab, setTypeTab] = useState("identity");

  return (
    <AdminLayout>
      <div style={{ backgroundColor: "#F7F9F7", minHeight: "calc(100vh - 64px)" }}>
        <div className="px-6 py-8" style={{ maxWidth: 1200 }}>
          <div className="mb-6">
            <h1 className="text-[28px] font-semibold text-[#172B22] mb-1">Verification Management</h1>
            <p className="text-[#52645A]">Review cases, verify evidence, and manage decisions.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-[12px] border border-[#E2E8E4] p-4"><p className="text-sm text-[#52645A]">Awaiting review</p><p className="text-2xl font-bold text-[#172B22] mt-1">—</p></div>
            <div className="bg-white rounded-[12px] border border-[#E2E8E4] p-4"><p className="text-sm text-[#52645A]">Under review</p><p className="text-2xl font-bold text-[#172B22] mt-1">—</p></div>
            <div className="bg-white rounded-[12px] border border-[#E2E8E4] p-4"><p className="text-sm text-[#52645A]">More information</p><p className="text-2xl font-bold text-[#172B22] mt-1">—</p></div>
            <div className="bg-white rounded-[12px] border border-[#E2E8E4] p-4"><p className="text-sm text-[#52645A]">Verified cases</p><p className="text-2xl font-bold text-[#172B22] mt-1">—</p></div>
            <div className="bg-white rounded-[12px] border border-[#E2E8E4] p-4"><p className="text-sm text-[#52645A]">Appeals pending</p><p className="text-2xl font-bold text-[#172B22] mt-1">—</p></div>
          </div>
          <div className="flex gap-2 mb-4 border-b border-[#E2E8E4] overflow-x-auto">
            {TYPE_TABS.map((t) => (
              <button key={t.key} onClick={() => setTypeTab(t.key)} className={`pb-2 px-3 text-sm whitespace-nowrap ${typeTab === t.key ? "text-[#26734D] border-b-2 border-[#26734D] font-semibold" : "text-[#52645A] hover:text-[#26734D]"}`}>{t.label}</button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <input type="text" placeholder="Search case ID, user, organization..." className="border border-[#E2E8E4] rounded-[8px] px-4 py-2 flex-1 min-w-[200px] text-sm" />
            <select className="border border-[#E2E8E4] rounded-[8px] px-3 py-2 text-sm"><option>Filters: Type · Status · Reviewer · Submission date</option></select>
            <button className="px-3 py-2 border border-[#E2E8E4] rounded-[8px] text-sm bg-white">Clear filters</button>
          </div>
          <div className="bg-white rounded-[12px] border border-[#E2E8E4] overflow-hidden">
            <div className="p-4 border-b border-[#E2E8E4]"><p className="text-sm font-medium text-[#172B22]">Verification queue</p></div>
            <table className="w-full text-sm">
              <thead className="bg-[#F7F9F7]">
                <tr>
                  <th className="text-left p-4 text-[#52645A] font-medium">Case ID</th>
                  <th className="text-left p-4 text-[#52645A] font-medium">Applicant</th>
                  <th className="text-left p-4 text-[#52645A] font-medium">Type</th>
                  <th className="text-left p-4 text-[#52645A] font-medium">Submitted</th>
                  <th className="text-left p-4 text-[#52645A] font-medium">Status</th>
                  <th className="text-left p-4 text-[#52645A] font-medium">Assigned reviewer</th>
                  <th className="text-left p-4 text-[#52645A] font-medium">Waiting time</th>
                  <th className="text-left p-4 text-[#52645A] font-medium">Last updated</th>
                  <th className="text-left p-4 text-[#52645A] font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr><td colSpan={9} className="p-6 text-center text-[#52645A]">No verification cases.</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
