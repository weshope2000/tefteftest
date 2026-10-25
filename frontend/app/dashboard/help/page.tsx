"use client";

import Link from "next/link";
import { DashboardLayout } from "@/app/components/layout/DashboardLayout";

const CATEGORIES = [
  { title: "Payments & Earnings", desc: "Withdrawals, missing payments, fees, and billing.", articles: 12 },
  { title: "Contracts & Projects", desc: "Milestones, deadlines, cancellations, and disputes.", articles: 15 },
  { title: "Account & Verification", desc: "Sign-in problems, identity checks, and account access.", articles: 10 },
  { title: "Safety & Reporting", desc: "Report scams, abuse, impersonation, or suspicious activity.", articles: 8 },
];

const TICKETS = [
  { id: "TF-1042", subject: "Withdrawal status inquiry", status: "In progress" },
  { id: "TF-1038", subject: "Account verification", status: "Resolved" },
];

export default function HelpPage() {
  return (
    <DashboardLayout>
      <div style={{ backgroundColor: "#F7F9F7", minHeight: "calc(100vh - 64px)" }}>
        <div className="px-6 py-8" style={{ maxWidth: 1200 }}>
          <div className="text-center mb-8">
            <h1 className="text-[28px] font-semibold text-[#172B22] mb-2">How can we help you?</h1>
            <p className="text-[#52645A] mb-6">Find answers, get support, and track your requests.</p>
            <div className="max-w-2xl mx-auto relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#52645A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" placeholder="Search help articles, payments, contracts..." className="w-full border border-[#E2E8E4] rounded-[8px] pl-12 pr-4 py-3 text-sm" />
            </div>
          </div>

          <h2 className="text-lg font-semibold text-[#172B22] mb-4">Popular help categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {CATEGORIES.map((cat) => (
              <div key={cat.title} className="bg-white rounded-[12px] border border-[#E2E8E4] p-6 hover:shadow-sm cursor-pointer">
                <h3 className="font-semibold text-[#172B22] mb-1">{cat.title}</h3>
                <p className="text-sm text-[#52645A] mb-2">{cat.desc}</p>
                <p className="text-xs text-[#26734D]">{cat.articles} articles</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-[12px] border border-[#E2E8E4] p-6 mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#172B22] mb-1">Still need help?</h2>
              <p className="text-sm text-[#52645A]">Send a support request and follow its progress from your account.</p>
            </div>
            <button className="px-6 py-2 bg-[#26734D] text-white rounded-[8px] text-sm hover:bg-[#1e5a3d]">Contact Support</button>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#172B22]">My support requests</h2>
              <button className="text-sm text-[#26734D] hover:underline">View all</button>
            </div>
            <div className="bg-white rounded-[12px] border border-[#E2E8E4] overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[#F7F9F7]">
                  <tr>
                    <th className="text-left p-4 text-[#52645A] font-medium">Ticket</th>
                    <th className="text-left p-4 text-[#52645A] font-medium">Subject</th>
                    <th className="text-left p-4 text-[#52645A] font-medium">Status</th>
                    <th className="text-left p-4 text-[#52645A] font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {TICKETS.map((t) => (
                    <tr key={t.id} className="border-t border-[#E2E8E4]">
                      <td className="p-4 text-[#172B22]">{t.id}</td>
                      <td className="p-4 text-[#172B22]">{t.subject}</td>
                      <td className="p-4"><span className={`px-2 py-1 rounded text-xs ${t.status === "Resolved" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{t.status}</span></td>
                      <td className="p-4"><button className="text-[#26734D] hover:underline">View</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}