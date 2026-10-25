"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/app/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Summary {
  activeJobs: number;
  newProposals: number;
  activeContracts: number;
  pendingPayments: number;
}

const cardClass =
  "bg-white p-6 rounded-lg shadow-md";

export default function DashboardPage() {
  const { user, displayName } = useAuth();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    let mounted = true;
    const load = async () => {
      try {
const isEmployer = user?.role !== "freelancer" && user?.role !== "admin";
      const safe = async (fn: () => Promise<any>) => {
        try { return await fn(); } catch { return { data: [] }; }
      };
      const [jobsRes, bidsRes, contractsRes, paymentsRes] = await Promise.all([
        safe(() => api.get("/jobs", { params: { status: "open" } })),
        safe(() => api.get("/bids")),
        safe(() => api.get("/contracts", { params: { status: "active" } })),
        safe(() => api.get("/payments", { params: { status: "pending" } })),
      ]);
        if (mounted) {
          setSummary({
            activeJobs: jobsRes.data.length,
            newProposals: bidsRes.data.length,
            activeContracts: contractsRes.data.length,
            pendingPayments: paymentsRes.data.length,
          });
        }
      } catch {
        // services may not be running yet
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="flex gap-6 p-6" style={{ backgroundColor: "#F7F9F7" }}>
        <div className="flex-1 space-y-6">
          <div className="mb-8">
            <h1 className="text-[28px] font-semibold text-[#172B22]">
              Good morning, {displayName}!
            </h1>
            <p className="text-[#52645A] mt-1">
              Here's what's happening with your freelance work.
            </p>
          </div>

          <div className="bg-white rounded-[12px] border border-[#E2E8E4] p-6">
            <h2 className="text-lg font-semibold text-[#172B22] mb-2">Ready for your next opportunity?</h2>
            <p className="text-[#52645A] text-sm mb-4">Discover projects that match your skills and submit a proposal.</p>
            <Link href="/dashboard/find-jobs" className="inline-block px-4 py-2 bg-[#26734D] text-white rounded-[8px] text-sm hover:bg-[#1e5a3d]">
              Find Projects
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-[12px] border border-[#E2E8E4] p-4 animate-pulse h-24" />
              ))}
            </div>
          ) : summary ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-[12px] border border-[#E2E8E4] p-4">
                <p className="text-sm text-[#52645A]">Proposals sent</p>
                <p className="text-3xl font-bold text-[#172B22] mt-2">{summary.newProposals}</p>
              </div>
              <div className="bg-white rounded-[12px] border border-[#E2E8E4] p-4">
                <p className="text-sm text-[#52645A]">Active contracts</p>
                <p className="text-3xl font-bold text-[#172B22] mt-2">{summary.activeContracts}</p>
              </div>
              <div className="bg-white rounded-[12px] border border-[#E2E8E4] p-4">
                <p className="text-sm text-[#52645A]">Completed projects</p>
                <p className="text-3xl font-bold text-[#172B22] mt-2">{summary.activeJobs}</p>
              </div>
              <div className="bg-white rounded-[12px] border border-[#E2E8E4] p-4">
                <p className="text-sm text-[#52645A]">Available balance</p>
                <p className="text-3xl font-bold text-[#172B22] mt-2">ETB —</p>
              </div>
            </div>
          ) : null}

          <div className="bg-white rounded-[12px] border border-[#E2E8E4] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#172B22]">Recommended projects</h2>
              <Link href="/dashboard/find-jobs" className="text-[#26734D] text-sm hover:underline">View all →</Link>
            </div>
            <div className="space-y-4">
              <div className="border border-[#E2E8E4] rounded-[12px] p-4">
                <h3 className="font-semibold text-[#172B22]">Frontend Developer</h3>
                <p className="text-xs text-[#52645A]">React · TypeScript</p>
                <p className="text-xs text-[#52645A] mt-1">Fixed price</p>
                <Link href="/dashboard/find-jobs" className="text-[#26734D] text-sm mt-2 inline-block hover:underline">View project →</Link>
              </div>
              <div className="border border-[#E2E8E4] rounded-[12px] p-4">
                <h3 className="font-semibold text-[#172B22]">Website UI Design</h3>
                <p className="text-xs text-[#52645A]">Figma · UI/UX</p>
                <p className="text-xs text-[#52645A] mt-1">Hourly</p>
                <Link href="/dashboard/find-jobs" className="text-[#26734D] text-sm mt-2 inline-block hover:underline">View project →</Link>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[12px] border border-[#E2E8E4] p-6">
            <h2 className="text-lg font-semibold text-[#172B22] mb-4">Recent activity</h2>
            <p className="text-[#52645A] text-sm">Proposal updates, contract changes, and client messages appear here.</p>
          </div>
        </div>

        <aside className="space-y-4" style={{ width: 280 }}>
          <div className="bg-white rounded-[12px] border border-[#E2E8E4] p-4" style={{ width: 280 }}>
            <h3 className="text-[16px] font-semibold text-[#172B22] mb-2">Profile completion</h3>
            <p className="text-[13px] text-[#52645A] mb-2">Profile strength</p>
            <div className="w-full h-2 bg-[#E2E8E4] rounded-full overflow-hidden mb-2">
              <div className="h-full bg-[#26734D] rounded-full" style={{ width: "75%" }} />
            </div>
            <p className="text-[13px] font-semibold text-[#26734D] mb-3">75%</p>
            <p className="text-[13px] text-[#52645A] mb-3">Add portfolio projects to improve your profile.</p>
            <Link href="/dashboard/profile" className="text-[#26734D] text-sm hover:underline">Complete profile →</Link>
          </div>

          <div className="bg-white rounded-[12px] border border-[#E2E8E4] p-4" style={{ width: 280 }}>
            <h3 className="text-[16px] font-semibold text-[#172B22] mb-2">Verification</h3>
            <div className="space-y-2 text-[13px]">
              <div className="flex items-center justify-between"><span>Email</span><span className="text-[#26734D]">Verified</span></div>
              <div className="flex items-center justify-between"><span>Identity</span><span className="text-[#52645A]">Pending</span></div>
            </div>
            <Link href="/dashboard/profile" className="text-[#26734D] text-sm mt-3 inline-block hover:underline">View verification →</Link>
          </div>

          <div className="bg-white rounded-[12px] border border-[#E2E8E4] p-4" style={{ width: 280 }}>
            <h3 className="text-[16px] font-semibold text-[#172B22] mb-2">Upcoming deadlines</h3>
            <p className="text-[13px] text-[#52645A]">Contract milestones and due dates appear here.</p>
            <Link href="/dashboard/contracts" className="text-[#26734D] text-sm mt-3 inline-block hover:underline">View my contracts →</Link>
          </div>

          <div className="bg-white rounded-[12px] border border-[#E2E8E4] p-4" style={{ width: 280 }}>
            <h3 className="text-[16px] font-semibold text-[#172B22] mb-2">Quick actions</h3>
            <div className="space-y-2 text-[13px]">
              <Link href="/dashboard/find-jobs" className="block text-[#26734D] hover:underline">Browse jobs</Link>
              <Link href="/dashboard/proposals" className="block text-[#26734D] hover:underline">My proposals</Link>
              <Link href="/dashboard/profile" className="block text-[#26734D] hover:underline">Edit profile</Link>
              <Link href="/dashboard/messages" className="block text-[#26734D] hover:underline">Open messages</Link>
            </div>
          </div>
        </aside>
      </div>
    </DashboardLayout>
  );
}
