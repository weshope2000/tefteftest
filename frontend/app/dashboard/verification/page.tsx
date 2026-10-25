"use client";

import { DashboardLayout } from "@/app/components/layout/DashboardLayout";

const VERIFICATION_ITEMS = [
  { key: "email", title: "Email address", description: "Confirm you can access your email.", status: "Verified" },
  { key: "phone", title: "Phone number", description: "Confirm your phone number using the supported method.", status: "Verified" },
  { key: "identity", title: "Identity verification", description: "Submit an accepted identity document if required.", status: "Not started" },
  { key: "business", title: "Business verification", description: "For organizations that need to verify their business.", status: "Optional" },
];

export default function VerificationPage() {
  const completed = 2;
  const total = 4;
  const percent = Math.round((completed / total) * 100);

  return (
    <DashboardLayout>
      <div style={{ backgroundColor: "#F7F9F7", minHeight: "calc(100vh - 64px)" }}>
        <div className="px-6 py-8" style={{ maxWidth: 1100 }}>
          <h1 className="text-[28px] font-semibold text-[#172B22] mb-2">Verification Center</h1>
          <p className="text-[#52645A] mb-6">Confirm your information and track your verification progress.</p>

          <div className="flex gap-6">
            <div className="flex-1 space-y-6">
              <div className="bg-white rounded-[12px] border border-[#E2E8E4] p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-[#172B22]">Your verification progress</h2>
                    <p className="text-sm text-[#52645A]">Example account · Illustrative statuses only</p>
                  </div>
                  <span className="text-sm text-[#52645A]">{completed} of {total} steps completed</span>
                </div>
                <div className="w-full h-2 bg-[#E2E8E4] rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-[#26734D] rounded-full" style={{ width: `${percent}%` }} />
                </div>
                <p className="text-sm font-semibold text-[#26734D]">{percent}%</p>
                <p className="text-sm text-[#52645A] mt-2">In progress</p>
              </div>

              <div className="bg-white rounded-[12px] border border-[#E2E8E4] overflow-hidden">
                <div className="p-6 border-b border-[#E2E8E4]">
                  <h2 className="text-lg font-semibold text-[#172B22]">Verification checklist</h2>
                </div>
                <div className="divide-y divide-[#E2E8E4]">
                  {VERIFICATION_ITEMS.map((item) => (
                    <div key={item.key} className="p-6 flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-[#172B22]">{item.title}</h3>
                        <p className="text-sm text-[#52645A] mt-1">{item.description}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded text-xs ${item.status === "Verified" ? "bg-green-100 text-green-700" : item.status === "Not started" ? "bg-gray-100 text-gray-700" : "bg-gray-100 text-gray-700"}`}>
                          {item.status}
                        </span>
                        {item.status === "Not started" && <button className="px-4 py-2 bg-[#26734D] text-white rounded-[8px] text-sm hover:bg-[#1e5a3d]">Start</button>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <aside className="space-y-4" style={{ width: 280 }}>
              <div className="bg-white rounded-[12px] border border-[#E2E8E4] p-4">
                <h3 className="text-[16px] font-semibold text-[#172B22] mb-2">Your information is protected</h3>
                <p className="text-sm text-[#52645A]">Verification documents should be submitted securely and accessed only by authorized personnel or an approved verification provider.</p>
              </div>
              <div className="bg-white rounded-[12px] border border-[#E2E8E4] p-4">
                <h3 className="text-[16px] font-semibold text-[#172B22] mb-2">Verification help</h3>
                <div className="space-y-2 text-sm">
                  <a href="#" className="block text-[#26734D] hover:underline">Why do I need to verify?</a>
                  <a href="#" className="block text-[#26734D] hover:underline">My submission is delayed</a>
                  <a href="#" className="block text-[#26734D] hover:underline">My document was rejected</a>
                  <a href="#" className="block text-[#26734D] hover:underline">Need assistance?</a>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}