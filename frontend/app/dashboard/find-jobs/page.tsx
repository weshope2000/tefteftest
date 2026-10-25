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
  delivery_days: number;
  proposal_count: number;
  proposals_disclosed: boolean;
}

const OPPORTUNITY_TYPES = ["All opportunities", "Freelance", "Internships", "Monthly jobs", "Permanent", "Civil service"];

export default function BrowseJobsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [keywords, setKeywords] = useState("");
  const [oppType, setOppType] = useState("All opportunities");
  const [activeTab, setActiveTab] = useState("All opportunities");

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
    const text = `${j.title} ${j.description} ${j.skills}`.toLowerCase();
    return text.includes(keywords.trim().toLowerCase());
  });

  return (
    <DashboardLayout>
      <div className="px-6 py-8" style={{ maxWidth: 1200, margin: "0 auto" }}>
        <h1 className="text-[28px] font-semibold text-[#172B22] mb-2">Find your next opportunity</h1>
        <p className="text-[#52645A] mb-6">Explore opportunities that match your skills, interests, and goals.</p>

        <div className="bg-white rounded-[12px] border border-[#E2E8E4] p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm text-[#52645A] mb-1">Keywords</label>
              <input type="text" value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="e.g. Web developer, graphic design" className="border border-[#E2E8E4] rounded-[8px] px-4 py-2 w-full text-sm" />
            </div>
            <div>
              <label className="block text-sm text-[#52645A] mb-1">Opportunity type</label>
              <select value={oppType} onChange={(e) => setOppType(e.target.value)} className="border border-[#E2E8E4] rounded-[8px] px-4 py-2 w-full text-sm">
                <option>Freelance projects</option>
                <option>Internships</option>
                <option>Monthly jobs</option>
                <option>Permanent</option>
                <option>Civil service</option>
              </select>
            </div>
            <div className="flex items-end">
              <button className="w-full px-4 py-2 bg-[#26734D] text-white rounded-[8px] text-sm hover:bg-[#1e5a3d]">Search opportunities</button>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-6 border-b border-[#E2E8E4]">
          {OPPORTUNITY_TYPES.map((t) => (
            <button key={t} onClick={() => setActiveTab(t)} className={`pb-2 px-3 text-sm ${activeTab === t ? "text-[#26734D] border-b-2 border-[#26734D] font-semibold" : "text-[#52645A] hover:text-[#26734D]"}`}>
              {t}
            </button>
          ))}
        </div>

        <div className="flex gap-6">
          <aside className="space-y-4" style={{ width: 240 }}>
            <div className="bg-white rounded-[12px] border border-[#E2E8E4] p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[14px] font-semibold text-[#172B22]">Filters</h3>
                <button className="text-[12px] text-[#26734D] hover:underline">Reset</button>
              </div>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-medium text-[#172B22] mb-2">Category</p>
                  <label className="flex items-center gap-2 mb-1"><input type="checkbox" /> Development</label>
                  <label className="flex items-center gap-2 mb-1"><input type="checkbox" /> Design</label>
                  <label className="flex items-center gap-2 mb-1"><input type="checkbox" /> Writing</label>
                  <label className="flex items-center gap-2 mb-1"><input type="checkbox" /> Marketing</label>
                </div>
                <div>
                  <p className="font-medium text-[#172B22] mb-2">Pricing model</p>
                  <label className="flex items-center gap-2 mb-1"><input type="radio" name="pm" /> Fixed price</label>
                  <label className="flex items-center gap-2 mb-1"><input type="radio" name="pm" /> Hourly</label>
                </div>
                <div>
                  <p className="font-medium text-[#172B22] mb-2">Experience</p>
                  <label className="flex items-center gap-2 mb-1"><input type="radio" name="exp" /> Entry level</label>
                  <label className="flex items-center gap-2 mb-1"><input type="radio" name="exp" /> Intermediate</label>
                  <label className="flex items-center gap-2 mb-1"><input type="radio" name="exp" /> Expert</label>
                </div>
                <div>
                  <p className="font-medium text-[#172B22] mb-2">Client preferences</p>
                  <label className="flex items-center gap-2 mb-1"><input type="checkbox" /> Verified clients</label>
                  <label className="flex items-center gap-2 mb-1"><input type="checkbox" /> Payment method verified</label>
                </div>
              </div>
            </div>
          </aside>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-[#52645A]">{filtered.length} opportunities</span>
              <select className="border border-[#E2E8E4] rounded-[8px] px-3 py-2 text-sm">
                <option>Sort: Newest first</option>
                <option>Best match</option>
                <option>Budget / salary</option>
              </select>
            </div>

            {loading ? (
              <p className="text-[#52645A]">Loading...</p>
            ) : filtered.length === 0 ? (
              <p className="text-[#52645A]">No jobs found.</p>
            ) : (
              <div className="space-y-4">
                {filtered.map((job) => (
                  <div key={job.id} className="bg-white rounded-[12px] border border-[#E2E8E4] p-5">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <Link href={`/jobs/${job.id}`} className="font-semibold text-[#172B22] hover:underline">{job.title}</Link>
                        <p className="text-xs text-[#52645A] mt-1">Web Development · Posted recently</p>
                        <p className="text-sm text-[#52645A] mt-2 line-clamp-2">{job.description}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-[#52645A]">
                          <span className="px-2 py-1 bg-[#F0F5F1] rounded">{job.type === "hourly" ? "Hourly" : "Fixed price"}</span>
                          <span>Intermediate</span>
                          <span>Remote</span>
                        </div>
                        <div className="mt-3">
                          <p className="text-sm font-semibold text-[#172B22]">Budget set by client</p>
                          <p className="text-xs text-[#52645A]">Budget details on listing</p>
                        </div>
                      </div>
                      <Link href={`/jobs/${job.id}`} className="px-4 py-2 bg-[#26734D] text-white rounded-[8px] text-sm hover:bg-[#1e5a3d] shrink-0">
                        View job
                      </Link>
                    </div>
                  </div>
                ))}
                <div className="text-center mt-6">
                  <button className="text-[#26734D] text-sm hover:underline">Load more jobs →</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}