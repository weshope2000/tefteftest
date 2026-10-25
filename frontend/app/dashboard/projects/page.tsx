"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/app/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

interface Job {
  id: string;
  title: string;
  description: string;
  skills: string;
  budget: number;
  type: string;
  status: string;
}

const TABS = [
  { key: "all", label: "All projects" },
  { key: "in progress", label: "In progress" },
  { key: "needs attention", label: "Needs attention" },
  { key: "completed", label: "Completed" },
  { key: "archived", label: "Archived" },
];

export default function ProjectsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    let mounted = true;
    const load = async () => {
      try {
        const res = await api.get("/jobs", { params: { status: "open" } });
        if (mounted) setJobs(res.data);
      } catch {} finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [user, router]);

  if (!user) return null;

  const filtered = jobs.filter((j) => {
    const text = `${j.title} ${j.description}`.toLowerCase();
    if (!text.includes(search.trim().toLowerCase())) return false;
    if (activeTab === "all") return true;
    if (activeTab === "in progress") return true;
    if (activeTab === "needs attention") return false;
    if (activeTab === "completed") return false;
    if (activeTab === "archived") return false;
    return true;
  });

  const activeCount = jobs.length;
  const upcoming = 2;
  const tasks = 6;
  const completed = 8;

  return (
    <DashboardLayout>
      <div style={{ backgroundColor: "#F7F9F7", minHeight: "calc(100vh - 64px)" }}>
        <div className="px-6 py-8" style={{ maxWidth: 1100 }}>
          <h1 className="text-[28px] font-semibold text-[#172B22] mb-2">My Projects</h1>
          <p className="text-[#52645A] mb-6">Organize your work, track progress, and stay ahead of deadlines.</p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-[12px] border border-[#E2E8E4] p-4" style={{ minHeight: 120 }}>
              <p className="text-sm text-[#52645A]">Active projects</p>
              <p className="text-3xl font-bold text-[#172B22] mt-2">{activeCount}</p>
            </div>
            <div className="bg-white rounded-[12px] border border-[#E2E8E4] p-4" style={{ minHeight: 120 }}>
              <p className="text-sm text-[#52645A]">Upcoming deadlines</p>
              <p className="text-3xl font-bold text-[#172B22] mt-2">{upcoming}</p>
            </div>
            <div className="bg-white rounded-[12px] border border-[#E2E8E4] p-4" style={{ minHeight: 120 }}>
              <p className="text-sm text-[#52645A]">Tasks to complete</p>
              <p className="text-3xl font-bold text-[#172B22] mt-2">{tasks}</p>
            </div>
            <div className="bg-white rounded-[12px] border border-[#E2E8E4] p-4" style={{ minHeight: 120 }}>
              <p className="text-sm text-[#52645A]">Completed projects</p>
              <p className="text-3xl font-bold text-[#172B22] mt-2">{completed}</p>
            </div>
          </div>

          <div className="flex gap-2 mb-4 border-b border-[#E2E8E4]">
            {TABS.map((t) => (
              <button key={t.key} onClick={() => setActiveTab(t.key)} className={`pb-2 px-4 text-sm ${activeTab === t.key ? "text-[#26734D] border-b-2 border-[#26734D] font-semibold" : "text-[#52645A] hover:text-[#26734D]"}`}>
                {t.label}
              </button>
            ))}
          </div>

          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by project or client..." className="border border-[#E2E8E4] rounded-[8px] px-4 py-2 w-full md:w-72 text-sm mb-4" style={{ height: 44 }} />

          {loading ? (
            <p className="text-[#52645A]">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="text-[#52645A]">No projects found.</p>
          ) : (
            <div className="space-y-4">
              {filtered.map((job, idx) => {
                const status = idx === 1 ? "Needs attention" : "In progress";
                const progress = idx === 0 ? 65 : idx === 1 ? 35 : 80;
                const next = idx === 0 ? "Homepage delivery" : idx === 1 ? "Review client feedback" : "Final testing";
                return (
                  <div key={job.id} className="bg-white rounded-[12px] border border-[#E2E8E4] p-5" style={{ minHeight: 170 }}>
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-[#172B22]">{job.title}</h3>
                          <span className={`px-2 py-1 rounded text-xs ${status === "Needs attention" ? "bg-orange-100 text-orange-700" : "bg-yellow-100 text-yellow-700"}`}>{status}</span>
                        </div>
                        <p className="text-xs text-[#52645A]">Client · Contract linked</p>
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-[#52645A]">Project progress</span>
                            <span className="text-xs text-[#52645A]">{progress}%</span>
                          </div>
                          <div className="w-full bg-[#E2E8E4] rounded-full h-2">
                            <div className="bg-[#26734D] h-2 rounded-full" style={{ width: `${progress}%` }} />
                          </div>
                        </div>
                        <p className="text-sm text-[#52645A] mt-2">Next: {next}</p>
                        <p className="text-xs text-[#52645A] mt-1">Tasks · Milestones · Files</p>
                      </div>
                      <Link href={`/dashboard/contracts`} className="px-4 py-2 border border-[#E2E8E4] rounded-[8px] text-sm text-[#172B22] hover:bg-[#F7F9F7] shrink-0">
                        Open project →
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