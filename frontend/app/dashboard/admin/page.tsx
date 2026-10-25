"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminLayout } from "@/app/components/layout/AdminLayout";
import api from "@/lib/api";

export default function AdminOverviewPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AdminLayout>
      <div style={{ backgroundColor: "#F7F9F7", minHeight: "calc(100vh - 64px)" }}>
        <div className="px-6 py-8" style={{ maxWidth: 1200 }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-[28px] font-semibold text-[#172B22]">Overview</h1>
              <p className="text-[#52645A] mt-1">Monitor platform performance and outstanding work.</p>
            </div>
            <div className="flex items-center gap-3">
              <select className="border border-[#E2E8E4] rounded-[8px] px-3 py-2 text-sm bg-white">
                <option>Last 30 days</option>
                <option>Last 7 days</option>
                <option>Today</option>
                <option>Last 90 days</option>
                <option>Custom</option>
              </select>
              <button className="px-3 py-2 border border-[#E2E8E4] rounded-[8px] text-sm bg-white">Refresh</button>
              <button className="px-3 py-2 border border-[#E2E8E4] rounded-[8px] text-sm bg-white">Export report</button>
            </div>
          </div>

          {loading ? (
            <p className="text-[#52645A]">Loading...</p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Link href="/dashboard/admin/users" className="bg-white rounded-[12px] border border-[#E2E8E4] p-5 hover:shadow-sm transition">
                  <p className="text-sm text-[#52645A]">Total users</p>
                  <p className="text-2xl font-bold text-[#172B22] mt-2">—</p>
                  <p className="text-xs text-[#26734D] mt-2">User growth →</p>
                </Link>
                <Link href="/dashboard/admin/jobs" className="bg-white rounded-[12px] border border-[#E2E8E4] p-5 hover:shadow-sm transition">
                  <p className="text-sm text-[#52645A]">Published jobs</p>
                  <p className="text-2xl font-bold text-[#172B22] mt-2">—</p>
                  <p className="text-xs text-[#26734D] mt-2">Live listings →</p>
                </Link>
                <Link href="/dashboard/admin/bids" className="bg-white rounded-[12px] border border-[#E2E8E4] p-5 hover:shadow-sm transition">
                  <p className="text-sm text-[#52645A]">Active contracts</p>
                  <p className="text-2xl font-bold text-[#172B22] mt-2">—</p>
                  <p className="text-xs text-[#26734D] mt-2">In progress →</p>
                </Link>
                <Link href="/dashboard/admin/payments" className="bg-white rounded-[12px] border border-[#E2E8E4] p-5 hover:shadow-sm transition">
                  <p className="text-sm text-[#52645A]">Platform revenue</p>
                  <p className="text-2xl font-bold text-[#172B22] mt-2">—</p>
                  <p className="text-xs text-[#26734D] mt-2">Selected period →</p>
                </Link>
              </div>

              <h2 className="text-lg font-semibold text-[#172B22] mb-4">Needs attention</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <Link href="/dashboard/admin/verification" className="bg-white rounded-[12px] border border-[#E2E8E4] p-4 hover:shadow-sm transition">
                  <p className="text-sm text-[#172B22] font-medium">Verification reviews</p>
                  <p className="text-xs text-[#52645A] mt-1">Review cases →</p>
                </Link>
                <Link href="/dashboard/admin/disputes" className="bg-white rounded-[12px] border border-[#E2E8E4] p-4 hover:shadow-sm transition">
                  <p className="text-sm text-[#172B22] font-medium">Open disputes & reports</p>
                  <p className="text-xs text-[#52645A] mt-1">Investigate →</p>
                </Link>
                <Link href="/dashboard/admin/payments" className="bg-white rounded-[12px] border border-[#E2E8E4] p-4 hover:shadow-sm transition">
                  <p className="text-sm text-[#172B22] font-medium">Payment exceptions</p>
                  <p className="text-xs text-[#52645A] mt-1">Review payments →</p>
                </Link>
                <Link href="/dashboard/admin/jobs" className="bg-white rounded-[12px] border border-[#E2E8E4] p-4 hover:shadow-sm transition">
                  <p className="text-sm text-[#172B22] font-medium">Support requests</p>
                  <p className="text-xs text-[#52645A] mt-1">Open support →</p>
                </Link>
              </div>

              <div className="bg-white rounded-[12px] border border-[#E2E8E4] p-6 mb-6">
                <h2 className="text-lg font-semibold text-[#172B22] mb-4">Marketplace trends</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border border-[#E2E8E4] rounded-[12px] p-4">
                    <p className="text-sm text-[#52645A] mb-4">User registrations</p>
                    <div className="h-40 flex items-end gap-2">
                      <div className="flex-1 bg-[#26734D] opacity-20 h-[30%]"></div>
                      <div className="flex-1 bg-[#26734D] opacity-30 h-[40%]"></div>
                      <div className="flex-1 bg-[#26734D] opacity-40 h-[35%]"></div>
                      <div className="flex-1 bg-[#26734D] opacity-60 h-[60%]"></div>
                    </div>
                  </div>
                  <div className="border border-[#E2E8E4] rounded-[12px] p-4">
                    <p className="text-sm text-[#52645A] mb-4">Job activity</p>
                    <div className="h-40 flex items-end gap-2">
                      <div className="flex-1 bg-[#26734D] opacity-30 h-[50%]"></div>
                      <div className="flex-1 bg-[#26734D] opacity-40 h-[60%]"></div>
                      <div className="flex-1 bg-[#26734D] opacity-30 h-[40%]"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-[12px] border border-[#E2E8E4] p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-[#172B22]">Recent activity</h2>
                    <button className="text-sm text-[#26734D] hover:underline">View activity log →</button>
                  </div>
                  <p className="text-sm text-[#52645A]">Activity records appear here when supplied by the backend.</p>
                </div>
                <div className="bg-white rounded-[12px] border border-[#E2E8E4] p-6">
                  <h2 className="text-lg font-semibold text-[#172B22] mb-4">System health</h2>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between"><span>API services</span><span className="text-[#52645A]">Not checked</span></div>
                    <div className="flex items-center justify-between"><span>Database</span><span className="text-[#52645A]">Not checked</span></div>
                    <div className="flex items-center justify-between"><span>Payment integration</span><span className="text-[#52645A]">Not checked</span></div>
                    <div className="flex items-center justify-between"><span>Email and SMS</span><span className="text-[#52645A]">Not checked</span></div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}