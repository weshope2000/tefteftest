"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/app/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

interface Report {
  label: string;
  value: string;
}

const summaryCards: Report[] = [
  { label: "Total jobs posted", value: "—" },
  { label: "Total bids received", value: "—" },
  { label: "Active contracts", value: "—" },
  { label: "Total payments", value: "—" },
];

export default function ReportsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ jobs: 0, bids: 0, contracts: 0, payments: 0 });

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    let mounted = true;
    const load = async () => {
      try {
        const [jobs, bids, contracts, payments] = await Promise.all([
          api.get("/jobs"),
          api.get("/bids"),
          api.get("/contracts"),
          api.get("/payments"),
        ]);
        if (mounted) {
          setCounts({
            jobs: jobs.data.length,
            bids: bids.data.length,
            contracts: contracts.data.length,
            payments: payments.data.length,
          });
        }
      } catch {} finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [user, router]);

  if (!user) return null;

  const items = [
    { label: "Total jobs posted", value: counts.jobs },
    { label: "Total bids received", value: counts.bids },
    { label: "Active contracts", value: counts.contracts },
    { label: "Total payments", value: counts.payments },
  ];

  return (
    <DashboardLayout>
      <div className="px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Reports</h1>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.map((r) => (
              <div key={r.label} className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-sm text-gray-500">{r.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{r.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
