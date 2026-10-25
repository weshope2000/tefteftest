"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminLayout } from "@/app/components/layout/AdminLayout";
import api from "@/lib/api";

interface Job {
  id: string;
  title: string;
  description: string;
  budget: number;
  status: string;
  user_id: string;
  employer_name?: string;
  created_at: string;
}

const TABS = [
  { key: "all", label: "All Listings" },
  { key: "pending", label: "Pending Review" },
  { key: "reported", label: "Reported" },
  { key: "categories", label: "Categories" },
  { key: "skills", label: "Skills & Tags" },
];

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    api
      .get("/jobs")
      .then(async (res) => {
        const jobs = res.data || [];
        const uniqueIds = [...new Set(jobs.map((j: Job) => j.user_id))] as string[];
        const nameMap: Record<string, string> = {};
        await Promise.all(
          uniqueIds.map(async (id) => {
            try {
              const r = await api.get(`/employers/${id}`);
              nameMap[id] = r.data?.name || r.data?.company_name || id;
            } catch {
              nameMap[id] = id;
            }
          })
        );
        setJobs(jobs.map((j: Job) => ({ ...j, employer_name: nameMap[j.user_id] })));
      })
      .catch((err) => setError(err.response?.data?.error || "Failed to load jobs"))
      .finally(() => setLoading(false));
  }, []);

  const all = jobs.length;
  const pending = jobs.filter((j) => j.status === "pending" || j.status === "draft").length;
  const reported = 0;
  const draftCats = 0;

  const filtered = jobs.filter((j) => {
    const text = `${j.title} ${j.id} ${j.employer_name || ""}`.toLowerCase();
    if (search && !text.includes(search.toLowerCase())) return false;
    if (activeTab === "pending") return j.status === "pending" || j.status === "draft";
    return true;
  });

  return (
    <AdminLayout>
      <div style={{ backgroundColor: "#F7F9F7", minHeight: "calc(100vh - 64px)" }}>
        <div className="px-6 py-8" style={{ maxWidth: 1200 }}>
          <div className="mb-6">
            <h1 className="text-[28px] font-semibold text-[#172B22] mb-1">Jobs & Categories</h1>
            <p className="text-[#52645A]">Manage listings, moderation, and marketplace taxonomy</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-[12px] border border-[#E2E8E4] p-4">
              <p className="text-sm text-[#52645A]">All listings</p>
              <p className="text-2xl font-bold text-[#172B22] mt-1">{all}</p>
              <p className="text-xs text-[#52645A]">Live data required</p>
            </div>
            <div className="bg-white rounded-[12px] border border-[#E2E8E4] p-4">
              <p className="text-sm text-[#52645A]">Pending review</p>
              <p className="text-2xl font-bold text-[#172B22] mt-1">{pending}</p>
              <p className="text-xs text-[#52645A]">Awaiting moderation</p>
            </div>
            <div className="bg-white rounded-[12px] border border-[#E2E8E4] p-4">
              <p className="text-sm text-[#52645A]">Reported listings</p>
              <p className="text-2xl font-bold text-[#172B22] mt-1">{reported}</p>
              <p className="text-xs text-[#52645A]">Require assessment</p>
            </div>
            <div className="bg-white rounded-[12px] border border-[#E2E8E4] p-4">
              <p className="text-sm text-[#52645A]">Draft categories</p>
              <p className="text-2xl font-bold text-[#172B22] mt-1">{draftCats}</p>
              <p className="text-xs text-[#52645A]">Not yet published</p>
            </div>
          </div>

          <div className="flex gap-2 mb-4 border-b border-[#E2E8E4] overflow-x-auto">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`pb-2 px-4 text-sm whitespace-nowrap ${
                  activeTab === t.key
                    ? "text-[#26734D] border-b-2 border-[#26734D] font-semibold"
                    : "text-[#52645A] hover:text-[#26734D]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {(activeTab === "all" || activeTab === "pending" || activeTab === "reported") && (
            <>
              <div className="mb-3">
                <p className="text-sm text-[#172B22] font-medium">Marketplace management</p>
              </div>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search listings (title, listing ID, employer, or category)..."
                  className="border border-[#E2E8E4] rounded-[8px] px-4 py-2 flex-1 min-w-[200px] text-sm"
                />
                <select className="border border-[#E2E8E4] rounded-[8px] px-3 py-2 text-sm">
                  <option>Type: All types</option>
                  <option>Freelance</option>
                  <option>Internship</option>
                  <option>Monthly</option>
                  <option>Permanent</option>
                  <option>Civil service</option>
                </select>
                <select className="border border-[#E2E8E4] rounded-[8px] px-3 py-2 text-sm">
                  <option>Status: All</option>
                  <option>Draft</option>
                  <option>Pending review</option>
                  <option>Published</option>
                  <option>Paused</option>
                  <option>Rejected</option>
                  <option>Expired</option>
                  <option>Removed</option>
                </select>
                <select className="border border-[#E2E8E4] rounded-[8px] px-3 py-2 text-sm">
                  <option>Category: All</option>
                </select>
                <select className="border border-[#E2E8E4] rounded-[8px] px-3 py-2 text-sm">
                  <option>Date range</option>
                </select>
              </div>

              {error && <div className="text-red-600 mb-4">{error}</div>}
              {loading ? (
                <p className="text-[#52645A]">Loading jobs...</p>
              ) : (
                <div className="bg-white rounded-[12px] border border-[#E2E8E4] overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-[#F7F9F7]">
                      <tr>
                        <th className="text-left p-4 text-[#52645A] font-medium">Listing</th>
                        <th className="text-left p-4 text-[#52645A] font-medium">Employer</th>
                        <th className="text-left p-4 text-[#52645A] font-medium">Opportunity type</th>
                        <th className="text-left p-4 text-[#52645A] font-medium">Category</th>
                        <th className="text-left p-4 text-[#52645A] font-medium">Compensation</th>
                        <th className="text-left p-4 text-[#52645A] font-medium">Status</th>
                        <th className="text-left p-4 text-[#52645A] font-medium">Reports</th>
                        <th className="text-left p-4 text-[#52645A] font-medium">Updated</th>
                        <th className="text-left p-4 text-[#52645A] font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((j) => (
                        <tr key={j.id} className="border-t border-[#E2E8E4] hover:bg-[#F7F9F7]">
                          <td className="p-4">
                            <p className="text-[#172B22] font-medium">{j.title}</p>
                            <p className="text-xs text-[#52645A]">ID: {j.id.slice(0, 8)}</p>
                          </td>
                          <td className="p-4 text-[#52645A]">{j.employer_name || j.user_id}</td>
                          <td className="p-4 text-[#52645A]">Freelance</td>
                          <td className="p-4 text-[#52645A]"></td>
                          <td className="p-4 text-[#52645A]">${j.budget} (Fixed)</td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                j.status === "open" || j.status === "published"
                                  ? "bg-green-100 text-green-700"
                                  : j.status === "pending" || j.status === "draft"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {j.status}
                            </span>
                          </td>
                          <td className="p-4 text-[#52645A]"></td>
                          <td className="p-4 text-[#52645A]">{new Date(j.created_at).toLocaleDateString()}</td>
                          <td className="p-4">
                            <Link href={`/dashboard/admin/jobs/${j.id}`} className="text-[#26734D] hover:underline">
                              Open details
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {activeTab === "categories" && (
            <div className="bg-white rounded-[12px] border border-[#E2E8E4] p-6">
              <div className="mb-4">
                <p className="text-sm font-medium text-[#172B22]">Category directory</p>
                <p className="text-xs text-[#52645A]">Manage taxonomy</p>
              </div>
              <div className="space-y-2 text-sm text-[#52645A]">
                <div className="flex items-center justify-between p-3 border border-[#E2E8E4] rounded-[8px]">
                  <div>
                    <p className="text-[#172B22] font-medium">Technology & IT</p>
                    <p className="text-xs">Example parent category</p>
                  </div>
                  <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700">Active</span>
                </div>
                <div className="pl-6 space-y-2">
                  <div className="flex items-center justify-between p-3 border border-[#E2E8E4] rounded-[8px]">
                    <div><p className="text-[#172B22]">Software Development</p><p className="text-xs">Slug: software-development</p></div>
                    <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700">Active</span>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-[#E2E8E4] rounded-[8px]">
                    <div><p className="text-[#172B22]">Data & Analytics</p><p className="text-xs">Slug: data-analytics</p></div>
                    <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700">Active</span>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-[#E2E8E4] rounded-[8px]">
                    <div><p className="text-[#172B22]">IT Support</p><p className="text-xs">Slug: it-support</p></div>
                    <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">Draft</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "skills" && (
            <div className="bg-white rounded-[12px] border border-[#E2E8E4] p-6">
              <div className="mb-4">
                <p className="text-sm font-medium text-[#172B22]">Skills & Tags</p>
                <p className="text-xs text-[#52645A]">Search, create, rename, merge, and deactivate tags.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {["accounting", "graphic design", "customer support", "translation", "construction", "software development"].map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-[#F7F9F7] border border-[#E2E8E4] rounded-full text-sm text-[#172B22]">{tag}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
