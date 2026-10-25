"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/app/components/layout/AdminLayout";
import api from "@/lib/api";

interface Payment {
  id: number;
  amount: number;
  status: string;
  created_at: string;
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/payments")
      .then((res) => setPayments(res.data))
      .catch((err) => setError(err.response?.data?.error || "Failed to load payments"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout>
      <div className="px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Payments & Transactions</h1>
        {error && <div className="text-red-600 mb-4">{error}</div>}
        {loading ? (
          <p className="text-gray-500">Loading payments...</p>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-4 py-3">ID</th>
                  <th className="text-left px-4 py-3">Amount</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="px-4 py-3">{p.id}</td>
                    <td className="px-4 py-3">${p.amount}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${p.status === "completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(p.created_at).toLocaleDateString()}
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