"use client";

import Link from "next/link";

export function OpportunitiesTable() {
  return (
    <div className="bg-white rounded-[12px] border border-[#E2E8E4] overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4">
        <h2 className="text-lg font-semibold text-[#172B22]">My Opportunities</h2>
        <Link href="/employer/jobs" className="text-[#26734D] text-sm hover:underline">View all →</Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#F7F9F7]">
            <tr>
              <th className="text-left p-4 text-[#52645A] font-medium">Opportunity</th>
              <th className="text-left p-4 text-[#52645A] font-medium">Type</th>
              <th className="text-left p-4 text-[#52645A] font-medium">Applications</th>
              <th className="text-left p-4 text-[#52645A] font-medium">Deadline</th>
              <th className="text-left p-4 text-[#52645A] font-medium">Status</th>
              <th className="text-left p-4 text-[#52645A] font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-[#E2E8E4]">
              <td className="p-4">
                <p className="text-[#172B22] font-medium">Opportunity title</p>
                <p className="text-xs text-[#52645A]">Category</p>
              </td>
              <td className="p-4 text-[#52645A]">Freelance · Date posted</td>
              <td className="p-4 text-[#52645A]">—</td>
              <td className="p-4 text-[#52645A]">—</td>
              <td className="p-4"><span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700">Active</span></td>
              <td className="p-4"><Link href="/employer/jobs" className="text-[#26734D] hover:underline">Manage</Link></td>
            </tr>
            <tr className="border-t border-[#E2E8E4]">
              <td className="p-4">
                <p className="text-[#172B22] font-medium">Opportunity title</p>
                <p className="text-xs text-[#52645A]">Category</p>
              </td>
              <td className="p-4 text-[#52645A]">Internship · Date posted</td>
              <td className="p-4 text-[#52645A]">—</td>
              <td className="p-4 text-[#52645A]">—</td>
              <td className="p-4"><span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-700">Review</span></td>
              <td className="p-4"><Link href="/employer/jobs" className="text-[#26734D] hover:underline">Manage</Link></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
