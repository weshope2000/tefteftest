"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/app/components/layout/DashboardLayout";
import api from "@/lib/api";
import { SavedJob } from "@/lib/types";

export default function SavedJobsPage() {
  const [saved, setSaved] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await api.get("/jobs/saved");
        if (mounted && Array.isArray(res.data)) setSaved(res.data);
      } catch {
        // the service may not be reachable
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const unsave = async (jobId: string) => {
    try {
      await api.delete(`/jobs/${jobId}/save`);
      setSaved((current) => current.filter((job) => job.job_id !== jobId));
    } catch {
      // handle error
    }
  };

  return (
    <DashboardLayout>
      <div className="px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Saved Jobs</h1>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : saved.length === 0 ? (
          <p className="text-gray-500">You have not saved any jobs yet.</p>
        ) : (
          <div className="space-y-4">
            {saved.map((job) => (
              <div key={job.job_id} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <Link
                      href={`/jobs/${job.job_id}`}
                      className="font-semibold text-lg hover:underline"
                    >
                      {job.title}
                    </Link>
                    {job.company && <p className="text-sm text-gray-600 mt-1">{job.company}</p>}
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      <span>Budget: ${job.budget.toLocaleString()}</span>
                      <span className="capitalize">Type: {job.type}</span>
                      {job.skills && <span>Skills: {job.skills}</span>}
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {job.status}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => unsave(job.job_id)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50 transition"
                  >
                    Unsave
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
