"use client";

import { useState, useEffect } from "react";
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

export default function ActiveJobsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    let mounted = true;
    const load = async () => {
      try {
        const res = await api.get("/jobs", { params: { status: "open" } });
        if (mounted) setJobs(res.data);
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
      <div className="px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Active Jobs</h1>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : jobs.length === 0 ? (
          <p className="text-gray-500">No active jobs yet.</p>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="font-semibold text-lg">{job.title}</h3>
                <p className="text-gray-600 text-sm mt-1">{job.description}</p>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  <span>Skills: {job.skills}</span>
                  <span>Budget: ${job.budget}</span>
                  <span className="capitalize">Type: {job.type}</span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                    {job.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
