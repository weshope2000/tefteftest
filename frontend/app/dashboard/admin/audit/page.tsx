"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/app/components/layout/AdminLayout";
import api from "@/lib/api";

interface AuditLog {
  id: number;
  actor_id: string;
  actor_role: string;
  action: string;
  target_type: string;
  target_id: string;
  reason: string;
  outcome: string;
  created_at: string;
}

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/auth/audit")
      .then((res) => setLogs(res.data))
      .catch((err) => setError(err.response?.data?.error || "Failed to load audit logs"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout>
      <div className="px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Audit Logs</h1>
        {error && <div className="text-red-600 mb-4">{error}</div>}
        {loading ? (
          <p className="text-gray-500">Loading audit logs...</p>
        ) : logs.length === 0 ? (
          <p className="text-gray-500">No audit logs yet.</p>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-4 py-3">Actor</th>
                  <th className="text-left px-4 py-3">Role</th>
                  <th className="text-left px-4 py-3">Action</th>
                  <th className="text-left px-4 py-3">Target</th>
                  <th className="text-left px-4 py-3">Outcome</th>
                  <th className="text-left px-4 py-3">Time</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id} className="border-t">
                    <td className="px-4 py-3">{l.actor_id}</td>
                    <td className="px-4 py-3">{l.actor_role}</td>
                    <td className="px-4 py-3">{l.action}</td>
                    <td className="px-4 py-3">{l.target_type}:{l.target_id}</td>
                    <td className="px-4 py-3">{l.outcome}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(l.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}