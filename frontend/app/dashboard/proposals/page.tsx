"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/app/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import api, { errorMessage } from "@/lib/api";
import { Bid } from "@/lib/types";

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "submitted", label: "Under review" },
  { key: "responded", label: "Responded" },
  { key: "accepted", label: "Accepted" },
  { key: "declined", label: "Declined" },
  { key: "withdrawn", label: "Withdrawn" },
];

export default function ProposalsPage() {
  const { user } = useAuth();
  const isFreelancer = user?.role === "freelancer";
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await api.get("/bids");
        if (mounted && Array.isArray(res.data)) setBids(res.data);
      } catch (err: unknown) {
        if (mounted) setError(errorMessage(err, "Could not load proposals."));
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const total = bids.length;
  const awaiting = bids.filter((b) => b.status === "pending" || b.status === "submitted").length;
  const responded = bids.filter((b) => b.status === "shortlisted" || b.status === "responded").length;
  const accepted = bids.filter((b) => b.status === "accepted").length;

  const filtered = bids.filter((b) => {
    const text = `${b.job_title || ""} ${b.freelancer_name || ""}`.toLowerCase();
    const matchesSearch = text.includes(search.trim().toLowerCase());
    if (!matchesSearch) return false;
    if (activeTab === "all") return true;
    if (activeTab === "submitted") return b.status === "pending" || b.status === "submitted";
    if (activeTab === "responded") return b.status === "shortlisted" || b.status === "responded";
    if (activeTab === "accepted") return b.status === "accepted";
    if (activeTab === "declined") return b.status === "rejected" || b.status === "declined";
    if (activeTab === "withdrawn") return b.status === "withdrawn";
    return true;
  });

  const getStatus = (status: string) => {
    if (status === "accepted") return { label: "Accepted", cls: "bg-green-100 text-green-700" };
    if (status === "rejected" || status === "declined") return { label: "Declined", cls: "bg-red-100 text-red-700" };
    if (status === "withdrawn") return { label: "Withdrawn", cls: "bg-gray-100 text-gray-700" };
    if (status === "shortlisted") return { label: "Client responded", cls: "bg-blue-100 text-blue-700" };
    if (status === "pending" || status === "submitted") return { label: "Under review", cls: "bg-yellow-100 text-yellow-700" };
    return { label: status, cls: "bg-gray-100 text-gray-700" };
  };

  const getMessage = (status: string) => {
    if (status === "accepted") return "Review the offer and contract steps";
    if (status === "shortlisted") return "A client message is available";
    if (status === "pending" || status === "submitted") return "Waiting for client review";
    return "";
  };

  return (
    <DashboardLayout>
      <div style={{ backgroundColor: "#F7F9F7", minHeight: "calc(100vh - 64px)" }}>
        <div className="px-6 py-8" style={{ maxWidth: 1100 }}>
          <h1 className="text-[28px] font-semibold text-[#172B22] mb-2">My Proposals</h1>
          <p className="text-[#52645A] mb-6">Track your applications and stay on top of client responses.</p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-[12px] border border-[#E2E8E4] p-4" style={{ minHeight: 120 }}>
              <p className="text-sm text-[#52645A]">Total submitted</p>
              <p className="text-3xl font-bold text-[#172B22] mt-2">{total}</p>
            </div>
            <div className="bg-white rounded-[12px] border border-[#E2E8E4] p-4" style={{ minHeight: 120 }}>
              <p className="text-sm text-[#52645A]">Awaiting response</p>
              <p className="text-3xl font-bold text-[#172B22] mt-2">{awaiting}</p>
            </div>
            <div className="bg-white rounded-[12px] border border-[#E2E8E4] p-4" style={{ minHeight: 120 }}>
              <p className="text-sm text-[#52645A]">Client responded</p>
              <p className="text-3xl font-bold text-[#172B22] mt-2">{responded}</p>
            </div>
            <div className="bg-white rounded-[12px] border border-[#E2E8E4] p-4" style={{ minHeight: 120 }}>
              <p className="text-sm text-[#52645A]">Accepted</p>
              <p className="text-3xl font-bold text-[#172B22] mt-2">{accepted}</p>
            </div>
          </div>

          <div className="flex gap-2 mb-4 border-b border-[#E2E8E4]">
            {STATUS_TABS.map((t) => (
              <button key={t.key} onClick={() => setActiveTab(t.key)} className={`pb-2 px-4 text-sm ${activeTab === t.key ? "text-[#26734D] border-b-2 border-[#26734D] font-semibold" : "text-[#52645A] hover:text-[#26734D]"}`}>
                {t.label}
              </button>
            ))}
          </div>

          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search proposals by job title or client..." className="border border-[#E2E8E4] rounded-[8px] px-4 py-2 w-full md:w-72 text-sm mb-4" style={{ height: 44 }} />

          {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-2 rounded mb-4">{error}</div>}

          {loading ? (
            <p className="text-[#52645A]">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="text-[#52645A]">No proposals found.</p>
          ) : (
            <div className="space-y-4">
              {filtered.map((bid) => {
                const s = getStatus(bid.status);
                const m = getMessage(bid.status);
                return (
                  <div key={bid.id} className="bg-white rounded-[12px] border border-[#E2E8E4] p-5" style={{ minHeight: 150 }}>
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <Link href={`/jobs/${bid.job_id}`} className="font-semibold text-[#172B22] hover:underline">{bid.job_title || `Job ${bid.job_id.slice(0, 8)}`}</Link>
                          <span className={`px-2 py-1 rounded text-xs ${s.cls}`}>{s.label}</span>
                        </div>
                        <p className="text-xs text-[#52645A]">Client · Submitted {bid.created_at ? new Date(bid.created_at).toLocaleDateString() : "recently"}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-[#52645A]">
                          <span>Your bid: {bid.rate_type === "hourly" ? `ETB ${bid.hourly_rate}/hr` : `ETB ${bid.amount || "—"}`}</span>
                        </div>
                        {m && <p className="text-xs text-[#26734D] mt-2">{m}</p>}
                      </div>
                      <Link href={`/jobs/${bid.job_id}`} className="px-4 py-2 border border-[#E2E8E4] rounded-[8px] text-sm text-[#172B22] hover:bg-[#F7F9F7] shrink-0">
                        View details →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
