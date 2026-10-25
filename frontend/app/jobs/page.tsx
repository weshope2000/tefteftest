"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
  user_id: string;
  delivery_days: number;
  proposal_count: number;
  proposals_disclosed: boolean;
}

export default function JobsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-gray-50 px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Browse Jobs</h1>
      <p className="text-gray-600 mb-6">
        Find open projects and submit your proposal.
      </p>
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : jobs.length === 0 ? (
        <p className="text-gray-500">No open jobs yet.</p>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <Link
                    href={`/jobs/${job.id}`}
                    className="font-semibold text-lg hover:underline"
                  >
                    {job.title}
                  </Link>
                  <p className="text-gray-600 text-sm mt-1">{job.description}</p>
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                    <span>Skills: {job.skills}</span>
                    <span>Budget: ${job.budget}</span>
                    <span className="capitalize">Type: {job.type}</span>
                    {job.delivery_days > 0 && (
                      <span>Delivery: {job.delivery_days} days</span>
                    )}
                    {job.proposals_disclosed && (
                      <span>Proposals: {job.proposal_count}</span>
                    )}
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                      {job.status}
                    </span>
                  </div>
                </div>
                <Link
                  href={`/jobs/${job.id}`}
                  className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 shrink-0"
                >
                  View job
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}