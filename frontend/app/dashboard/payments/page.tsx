"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/app/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

interface Payment {
  id: string;
  contract_id: string;
  client_id: string;
  amount: number;
  status: string;
  created_at?: string;
}

const TABS = ["All transactions", "Earnings", "Withdrawals", "Refunds and adjustments", "Subscription charges"];

export default function PaymentsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All transactions");

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    let mounted = true;
    const load = async () => {
      try {
        const res = await api.get("/payments");
        if (mounted && Array.isArray(res.data)) setPayments(res.data);
      } catch {} finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [user, router]);

  if (!user) return null;

  const pending = payments.filter((p) => p.status === "pending").reduce((sum, p) => sum + (p.amount || 0), 0);
  const completed = payments.filter((p) => p.status === "completed").reduce((sum, p) => sum + (p.amount || 0), 0);

  const getStatus = (status: string) => {
    if (status === "completed") return { label: "Completed", cls: "bg-green-100 text-green-700" };
    if (status === "pending") return { label: "Pending", cls: "bg-yellow-100 text-yellow-700" };
    if (status === "processing") return { label: "Processing", cls: "bg-yellow-100 text-yellow-700" };
    return { label: status, cls: "bg-gray-100 text-gray-700" };
  };

  return (
    <DashboardLayout>
      <div style={{ backgroundColor: "#F7F9F7", minHeight: "calc(100vh - 64px)" }}>
        <div className="px-6 py-8" style={{ maxWidth: 1200 }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-[28px] font-semibold text-[#172B22] mb-1">Earnings & Payments</h1>
              <p className="text-[#52645A]">Track your income, manage withdrawals, and review financial activity.</p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-[#E2E8E4] rounded-[8px] text-sm text-[#172B22] hover:bg-white">Download statement</button>
              <button className="px-4 py-2 bg-[#26734D] text-white rounded-[8px] text-sm hover:bg-[#1e5a3d]">Withdraw</button>
            </div>
          </div>

          <div className="bg-white rounded-[12px] border border-[#E2E8E4] p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#172B22]">Available to withdraw</h2>
              <button className="px-4 py-2 bg-[#26734D] text-white rounded-[8px] text-sm hover:bg-[#1e5a3d]">Withdraw funds</button>
            </div>
            <p className="text-4xl font-bold text-[#172B22] mb-4">ETB {completed.toLocaleString()}.00</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-[#52645A]">Pending earnings</p>
                <p className="font-semibold text-[#172B22]">ETB {pending.toLocaleString()}.00</p>
              </div>
              <div>
                <p className="text-[#52645A]">Withdrawals in progress</p>
                <p className="font-semibold text-[#172B22]">ETB 1,500.00</p>
              </div>
              <div>
                <p className="text-[#52645A]">Last balance update</p>
                <p className="font-semibold text-[#172B22]">Today</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-[12px] border border-[#E2E8E4] p-4">
              <p className="text-sm text-[#52645A]">Gross earnings</p>
              <p className="text-2xl font-bold text-[#172B22] mt-1">ETB {(completed + pending).toLocaleString()}</p>
              <p className="text-xs text-[#52645A] mt-1">Before fees and adjustments</p>
            </div>
            <div className="bg-white rounded-[12px] border border-[#E2E8E4] p-4">
              <p className="text-sm text-[#52645A]">Platform fees</p>
              <p className="text-2xl font-bold text-[#172B22] mt-1">ETB 500</p>
              <p className="text-xs text-[#52645A] mt-1">Fees charged on eligible work</p>
            </div>
            <div className="bg-white rounded-[12px] border border-[#E2E8E4] p-4">
              <p className="text-sm text-[#52645A]">Net earnings</p>
              <p className="text-2xl font-bold text-[#172B22] mt-1">ETB {(completed + pending - 500).toLocaleString()}</p>
              <p className="text-xs text-[#52645A] mt-1">After applicable fees</p>
            </div>
            <div className="bg-white rounded-[12px] border border-[#E2E8E4] p-4">
              <p className="text-sm text-[#52645A]">Next expected release</p>
              <p className="text-2xl font-bold text-[#172B22] mt-1">—</p>
              <p className="text-xs text-[#52645A] mt-1">View schedule</p>
            </div>
          </div>

          <div className="flex gap-2 mb-4 border-b border-[#E2E8E4]">
            {TABS.map((t) => (
              <button key={t} onClick={() => setActiveTab(t)} className={`pb-2 px-4 text-sm ${activeTab === t ? "text-[#26734D] border-b-2 border-[#26734D] font-semibold" : "text-[#52645A] hover:text-[#26734D]"}`}>
                {t}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="text-[#52645A]">Loading...</p>
          ) : payments.length === 0 ? (
            <p className="text-[#52645A]">No payments yet.</p>
          ) : (
            <div className="bg-white rounded-[12px] border border-[#E2E8E4] overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[#F7F9F7]">
                  <tr>
                    <th className="text-left p-4 text-[#52645A] font-medium">Date</th>
                    <th className="text-left p-4 text-[#52645A] font-medium">Description</th>
                    <th className="text-left p-4 text-[#52645A] font-medium">Type</th>
                    <th className="text-left p-4 text-[#52645A] font-medium">Gross amount</th>
                    <th className="text-left p-4 text-[#52645A] font-medium">Fee</th>
                    <th className="text-left p-4 text-[#52645A] font-medium">Net amount</th>
                    <th className="text-left p-4 text-[#52645A] font-medium">Status</th>
                    <th className="text-left p-4 text-[#52645A] font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => {
                    const s = getStatus(p.status);
                    return (
                      <tr key={p.id} className="border-t border-[#E2E8E4]">
                        <td className="p-4 text-[#172B22]">{p.created_at ? new Date(p.created_at).toLocaleDateString() : "Oct 21"}</td>
                        <td className="p-4 text-[#172B22]">Project payment · Contract #{p.contract_id.slice(0, 8)}</td>
                        <td className="p-4 text-[#52645A]">Earning</td>
                        <td className="p-4 text-[#172B22]">ETB {p.amount}</td>
                        <td className="p-4 text-[#52645A]">ETB 0</td>
                        <td className="p-4 text-[#172B22]">ETB {p.amount}</td>
                        <td className="p-4"><span className={`px-2 py-1 rounded text-xs ${s.cls}`}>{s.label}</span></td>
                        <td className="p-4"><button className="text-[#26734D] hover:underline">View details</button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}