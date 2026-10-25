"use client";

import { use, useEffect, useState } from "react";
import { AdminLayout } from "@/app/components/layout/AdminLayout";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

export default function AdminUserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [adminNotes, setAdminNotes] = useState("");
  const [verificationDecision, setVerificationDecision] = useState("");
  const [decisionReason, setDecisionReason] = useState("");
  const [accountAction, setAccountAction] = useState("");
  const [actionReason, setActionReason] = useState("");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await api.get(`/auth/users/${id}`);
        if (mounted && res.data) setUser(res.data);
      } catch {
        if (mounted) setError("Could not load user profile.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [id]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="px-8 py-12"><p className="text-gray-500">Loading user profile...</p></div>
      </AdminLayout>
    );
  }

  if (error || !user) {
    return (
      <AdminLayout>
        <div className="px-8 py-12">
          <p className="text-red-600">{error || "User not found."}</p>
          <button onClick={() => router.back()} className="mt-4 text-sm text-blue-600 hover:underline">Back to Users</button>
        </div>
      </AdminLayout>
    );
  }

  const tabs = ["Overview", "Details", "Verification", "Activity", "Notes", "Audit Log"];

  return (
    <AdminLayout>
      <div className="px-8 py-12">
        <button onClick={() => router.back()} className="text-sm text-blue-600 hover:underline mb-4">
          Back to Users
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-6">User Profile — Admin View</h1>

        <div className="flex gap-2 border-b mb-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase().replace(" ", "-"))}
              className={`px-4 py-2 text-sm font-medium ${activeTab === tab.toLowerCase().replace(" ", "-") ? "border-b-2 border-red-600 text-red-600" : "text-gray-500 hover:text-gray-700"}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">User Overview</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-gray-500">User ID</p><p className="text-sm font-medium">{user.id}</p></div>
              <div><p className="text-xs text-gray-500">Full Name</p><p className="text-sm font-medium">{user.name}</p></div>
              <div><p className="text-xs text-gray-500">Email</p><p className="text-sm font-medium">{user.email}</p></div>
              <div><p className="text-xs text-gray-500">Account Role</p><p className="text-sm font-medium capitalize">{user.role}</p></div>
              <div><p className="text-xs text-gray-500">Registration Date</p><p className="text-sm font-medium">{new Date(user.created_at).toLocaleDateString()}</p></div>
              <div><p className="text-xs text-gray-500">Account Status</p><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${user.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{user.status || "active"}</span></div>
            </div>
          </div>
        )}

        {activeTab === "details" && (
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Profile Details</h2>
            <p className="text-gray-500 text-sm">Profile details are loaded from the user service.</p>
          </div>
        )}

        {activeTab === "verification" && (
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Verification</h2>
            <div className="space-y-3">
              <div><p className="text-xs text-gray-500">Verification Type</p><p className="text-sm">Identity</p></div>
              <div><p className="text-xs text-gray-500">Verification Status</p><span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">pending</span></div>
            </div>
            <div className="border-t pt-4 space-y-3">
              <h3 className="font-medium text-gray-900">Assign Reviewer</h3>
              <select className="border rounded px-4 py-2 w-full text-sm">
                <option value="">Select reviewer...</option>
              </select>
              <h3 className="font-medium text-gray-900">Decision</h3>
              <select value={verificationDecision} onChange={(e) => setVerificationDecision(e.target.value)} className="border rounded px-4 py-2 w-full text-sm">
                <option value="">Select decision...</option>
                <option value="approve">Approve</option>
                <option value="reject">Reject</option>
                <option value="request_info">Request more information</option>
              </select>
              <h3 className="font-medium text-gray-900">Decision Reason</h3>
              <select value={decisionReason} onChange={(e) => setDecisionReason(e.target.value)} className="border rounded px-4 py-2 w-full text-sm">
                <option value="">Select reason...</option>
                <option value="identity_verified">Identity verified</option>
                <option value="insufficient_evidence">Insufficient evidence</option>
                <option value="fraud_suspected">Fraud suspected</option>
              </select>
              <h3 className="font-medium text-gray-900">Internal Notes</h3>
              <textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} rows={4} className="border rounded px-4 py-2 w-full text-sm" />
              <button className="px-6 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700">
                Submit Decision
              </button>
            </div>
          </div>
        )}

        {activeTab === "activity" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity History</h2>
            <p className="text-gray-500 text-sm">No activity records available.</p>
          </div>
        )}

        {activeTab === "notes" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Admin Notes</h2>
            <textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} rows={6} className="border rounded px-4 py-2 w-full text-sm" placeholder="Add case-related notes..." />
            <button className="mt-3 px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700">Save Notes</button>
          </div>
        )}

        {activeTab === "audit-log" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Audit Log</h2>
            <p className="text-gray-500 text-sm">No audit records available.</p>
          </div>
        )}

        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h2>
          <div className="space-y-3">
            <select value={accountAction} onChange={(e) => setAccountAction(e.target.value)} className="border rounded px-4 py-2 w-full text-sm">
              <option value="">Select action...</option>
              <option value="restrict">Restrict account</option>
              <option value="suspend">Suspend account</option>
              <option value="close">Close account</option>
            </select>
            <textarea value={actionReason} onChange={(e) => setActionReason(e.target.value)} rows={3} className="border rounded px-4 py-2 w-full text-sm" placeholder="Document the justification..." />
            <button className="px-6 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700">
              Confirm Action
            </button>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Communication</h2>
          <div className="space-y-3">
            <select className="border rounded px-4 py-2 w-full text-sm">
              <option value="">Select notification template...</option>
              <option value="verification_approved">Verification Approved</option>
              <option value="verification_rejected">Verification Rejected</option>
              <option value="account_suspended">Account Suspended</option>
            </select>
            <textarea rows={4} className="border rounded px-4 py-2 w-full text-sm" placeholder="Message preview..." readOnly />
            <button className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700">Send Notification</button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}