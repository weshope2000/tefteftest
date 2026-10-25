"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/app/components/layout/AdminLayout";
import api from "@/lib/api";

export default function AdminHealthPage() {
  const [health, setHealth] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const services = ["auth", "jobs", "bids", "contracts", "payments", "messages", "reviews"];
    Promise.all(
      services.map((svc) =>
        api
          .get(`/${svc}/health`)
          .then((r) => ({ [svc]: r.data.status || "ok" }))
          .catch(() => ({ [svc]: "down" }))
      )
    ).then((results) => {
      const merged = Object.assign({}, ...results);
      setHealth(merged);
      setLoading(false);
    });
  }, []);

  return (
    <AdminLayout>
      <div className="px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Service Health</h1>
        {loading ? (
          <p className="text-gray-500">Checking services...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(health).map(([svc, status]) => (
              <div key={svc} className="bg-white rounded-lg shadow-md p-4 flex justify-between items-center">
                <span className="font-medium capitalize">{svc}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status === "ok" || status === "running" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                  {status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}