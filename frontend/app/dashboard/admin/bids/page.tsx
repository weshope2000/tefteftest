"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/app/components/layout/AdminLayout";
import api from "@/lib/api";

interface Bid {
  id: number;
  job_title: string;
  freelancer_name: string;
  amount: number;
  rate_type: string;
  delivery_days: number;
  status: string;
  created_at: string;
}

export default function AdminBidsPage() {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const filteredBids = statusFilter === "all" ? bids : bids.filter((b) => b.status === statusFilter);

  useEffect(() => {
    api
      .get("/bids")
      .then((res) => setBids(res.data))
      .catch((err) => setError(err.response?.data?.error || "Failed to load bids"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout>
      <div className="px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Bids & Contracts</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {[
            { label: "Pending acceptance", value: bids.filter((b) => b.status === "pending").length },
            { label: "Active contracts", value: "—" },
            { label: "Overdue milestones", value: "—" },
            { label: "Open contract disputes", value: "—" },
          ].map((c) => (
            <div key={c.label} className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-sm text-gray-500">{c.label}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{c.value}</p>
            </div>
          ))}
        </div>
        {error && <div className="text-red-600 mb-4">{error}</div>}
        <div className="mb-4">
          <label className="text-sm text-gray-600 mr-2">Status:</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border rounded px-3 py-1 text-sm">
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="withdrawn">Withdrawn</option>
          </select>
        </div>
        {loading ? (
          <p className="text-gray-500">Loading bids...</p>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-4 py-3">Job</th>
                  <th className="text-left px-4 py-3">Freelancer</th>
                  <th className="text-left px-4 py-3">Amount</th>
                  <th className="text-left px-4 py-3">Rate Type</th>
                  <th className="text-left px-4 py-3">Delivery</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {filteredBids.map((b) => (
                  <tr key={b.id} className="border-t">
                    <td className="px-4 py-3">{b.job_title}</td>
                    <td className="px-4 py-3">{b.freelancer_name}</td>
                    <td className="px-4 py-3">${b.amount}</td>
                    <td className="px-4 py-3">{b.rate_type}</td>
                    <td className="px-4 py-3">{b.delivery_days}d</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${b.status === "pending" ? "bg-yellow-100 text-yellow-800" : b.status === "accepted" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(b.created_at).toLocaleDateString()}
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