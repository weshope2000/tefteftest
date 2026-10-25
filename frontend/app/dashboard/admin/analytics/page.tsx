"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/app/components/layout/AdminLayout";
import api from "@/lib/api";

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState({ users: 0, jobs: 0, bids: 0, contracts: 0, payments: 0, reviews: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/auth/users").then((r) => r.data.length).catch(() => 0),
      api.get("/jobs").then((r) => r.data.length).catch(() => 0),
      api.get("/bids").then((r) => r.data.length).catch(() => 0),
      api.get("/contracts").then((r) => r.data.length).catch(() => 0),
      api.get("/payments").then((r) => r.data.length).catch(() => 0),
      api.get("/reviews").then((r) => r.data.length).catch(() => 0),
    ]).then(([users, jobs, bids, contracts, payments, reviews]) => {
      setStats({ users, jobs, bids, contracts, payments, reviews });
      setLoading(false);
    });
  }, []);

  return (
    <AdminLayout>
      <div className="px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Analytics & Reports</h1>
        {loading ? (
          <p className="text-gray-500">Loading analytics...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(stats).map(([key, val]) => (
              <div key={key} className="bg-white rounded-lg shadow-md p-6">
                <p className="text-sm text-gray-500 capitalize">{key}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{val}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}