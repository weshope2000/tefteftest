"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/app/components/layout/DashboardLayout";
import api from "@/lib/api";

interface Contract {
  id: string;
  job_id: string;
  client_id: string;
  freelancer_id: string;
  amount: number;
  status: string;
  created_at?: string;
}

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "awaiting acceptance", label: "Awaiting acceptance" },
  { key: "active", label: "Active" },
  { key: "in progress", label: "In progress" },
  { key: "submitted", label: "Submitted" },
  { key: "completed", label: "Completed" },
  { key: "disputed", label: "Disputed" },
];

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("recent");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await api.get("/contracts");
        if (mounted) setContracts(Array.isArray(res.data) ? res.data : []);
      } catch {
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const activeCount = contracts.filter((c) => c.status === "active" || c.status === "in progress").length;
  const awaiting = contracts.filter((c) => c.status === "pending" || c.status === "awaiting acceptance").length;
  const completed = contracts.filter((c) => c.status === "completed").length;

  const filtered = contracts.filter((c) => {
    const text = `${c.id} ${c.job_id}`.toLowerCase();
    if (!text.includes(search.trim().toLowerCase())) return false;
    if (activeTab === "all") return true;
    if (activeTab === "awaiting acceptance") return c.status === "pending" || c.status === "awaiting acceptance";
    if (activeTab === "active") return c.status === "active";
    if (activeTab === "in progress") return c.status === "in progress";
    if (activeTab === "submitted") return c.status === "submitted";
    if (activeTab === "completed") return c.status === "completed";
    if (activeTab === "disputed") return c.status === "disputed";
    return true;
  });

  const getStatusBadge = (status: string) => {
    if (status === "completed") return { label: "Completed", cls: "bg-green-100 text-green-700" };
    if (status === "disputed") return { label: "Disputed", cls: "bg-red-100 text-red-700" };
    if (status === "submitted") return { label: "Submitted", cls: "bg-blue-100 text-blue-700" };
    if (status === "in progress") return { label: "In progress", cls: "bg-yellow-100 text-yellow-700" };
    if (status === "pending" || status === "awaiting acceptance") return { label: "Awaiting acceptance", cls: "bg-orange-100 text-orange-700" };
    if (status === "active") return { label: "Active", cls: "bg-green-100 text-green-700" };
    return { label: status, cls: "bg-gray-100 text-gray-700" };
  };

  return (
    <DashboardLayout>
      <div style={{ backgroundColor: "#F7F9F7", minHeight: "calc(100vh - 64px)" }}>
        <div className="px-6 py-8" style={{ maxWidth: 1100 }}>
          <h1 className="text-[28px] font-semibold text-[#172B22] mb-2">My Contracts</h1>
          <p className="text-[#52645A] mb-6">Manage your agreements, deliverables, deadlines, and project progress.</p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-[12px] border border-[#E2E8E4] p-4" style={{ minHeight: 120 }}>
              <p className="text-sm text-[#52645A]">Active contracts</p>
              <p className="text-3xl font-bold text-[#172B22] mt-2">{activeCount}</p>
            </div>
            <div className="bg-white rounded-[12px] border border-[#E2E8E4] p-4" style={{ minHeight: 120 }}>
              <p className="text-sm text-[#52645A]">Awaiting action</p>
              <p className="text-3xl font-bold text-[#172B22] mt-2">{awaiting}</p>
            </div>
            <div className="bg-white rounded-[12px] border border-[#E2E8E4] p-4" style={{ minHeight: 120 }}>
              <p className="text-sm text-[#52645A]">Upcoming deadlines</p>
              <p className="text-3xl font-bold text-[#172B22] mt-2">2</p>
            </div>
            <div className="bg-white rounded-[12px] border border-[#E2E8E4] p-4" style={{ minHeight: 120 }}>
              <p className="text-sm text-[#52645A]">Completed contracts</p>
              <p className="text-3xl font-bold text-[#172B22] mt-2">{completed}</p>
            </div>
          </div>

          <div className="flex gap-2 mb-4 border-b border-[#E2E8E4]">
            {STATUS_TABS.map((t) => (
              <button key={t.key} onClick={() => setActiveTab(t.key)} className={`pb-2 px-4 text-sm ${activeTab === t.key ? "text-[#26734D] border-b-2 border-[#26734D] font-semibold" : "text-[#52645A] hover:text-[#26734D]"}`}>
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by contract, project, or client..." className="border border-[#E2E8E4] rounded-[8px] px-4 py-2 flex-1 min-w-[200px] text-sm" style={{ height: 44 }} />
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="border border-[#E2E8E4] rounded-[8px] px-3 py-2 text-sm">
              <option value="recent">Sort: Recently updated</option>
              <option value="newest">Newest contract</option>
              <option value="deadline">Nearest deadline</option>
            </select>
          </div>

          {loading ? (
            <p className="text-[#52645A]">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="text-[#52645A]">No contracts yet.</p>
          ) : (
            <div className="space-y-4">
              {filtered.map((c) => {
                const s = getStatusBadge(c.status);
                return (
                  <div key={c.id} className="bg-white rounded-[12px] border border-[#E2E8E4] p-5" style={{ minHeight: 160 }}>
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-[#172B22]">Contract #{c.id.slice(0, 8)}</h3>
                          <span className={`px-2 py-1 rounded text-xs ${s.cls}`}>{s.label}</span>
                        </div>
                        <p className="text-xs text-[#52645A]">Client · Job: {c.job_id.slice(0, 8)}</p>
                        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-[#52645A]">
                          <span>Fixed price</span>
                          <span>Contract value: ETB {c.amount}</span>
                          <span>Next milestone: Homepage delivery</span>
                          <span>Milestones: 2 of 4 complete</span>
                          <span>Payment status: Check payment details</span>
                        </div>
                        <div className="mt-3 w-full bg-[#E2E8E4] rounded-full h-2">
                          <div className="bg-[#26734D] h-2 rounded-full" style={{ width: "50%" }} />
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        <Link href={`/freelancer/contracts/${c.id}`} className="px-4 py-2 border border-[#E2E8E4] rounded-[8px] text-sm text-[#172B22] hover:bg-[#F7F9F7] text-center">
                          View contract →
                        </Link>
                        <button className="px-4 py-2 border border-[#E2E8E4] rounded-[8px] text-sm text-[#172B22] hover:bg-[#F7F9F7]">
                          Message client
                        </button>
                      </div>
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
