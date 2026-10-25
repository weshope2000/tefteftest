"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/app/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

interface Message {
  id: string;
  contract_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
}

const CONVERSATIONS = [
  { id: "1", name: "Abebe Digital", last: "I've shared the latest design.", time: "10:42", unread: true, project: "Business Website Development" },
  { id: "2", name: "Mekdes Studio", last: "Thank you for the proposal.", time: "Yesterday", unread: false },
  { id: "3", name: "Sample Tech Client", last: "Can we review the milestone?", time: "Mon", unread: false },
  { id: "4", name: "Creative Works", last: "The files are ready.", time: "Oct 20", unread: false },
];

export default function MessagesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeConv, setActiveConv] = useState(CONVERSATIONS[0]);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    let mounted = true;
    const load = async () => {
      try {
        const res = await api.get("/messages");
        if (mounted && Array.isArray(res.data)) setMessages(res.data);
      } catch {} finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [user, router]);

  if (!user) return null;

  return (
    <DashboardLayout>
      <div style={{ backgroundColor: "#F7F9F7", minHeight: "calc(100vh - 64px)" }}>
        <div className="h-[calc(100vh-64px)] flex">
          <aside className="border-r border-[#E2E8E4] bg-white" style={{ width: 300 }}>
            <div className="p-4 border-b border-[#E2E8E4]">
              <h2 className="text-lg font-semibold text-[#172B22] mb-3">Messages</h2>
              <input type="text" placeholder="Search messages..." className="border border-[#E2E8E4] rounded-[8px] px-3 py-2 w-full text-sm" />
              <div className="flex gap-2 mt-3">
                {["All", "Unread", "Archived"].map((f) => (
                  <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 rounded text-xs ${filter === f ? "bg-[#F0F5F1] text-[#26734D]" : "text-[#52645A] hover:bg-gray-50"}`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-auto h-[calc(100vh-64px-140px)]">
              {CONVERSATIONS.map((c) => (
                <button key={c.id} onClick={() => setActiveConv(c)} className={`w-full text-left p-4 border-b border-[#E2E8E4] hover:bg-[#F7F9F7] ${activeConv.id === c.id ? "bg-[#F0F5F1]" : ""}`}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#26734D] text-white flex items-center justify-center font-semibold text-sm">{c.name.charAt(0)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold text-[#172B22] truncate">{c.name}</p>
                        <span className="text-xs text-[#52645A]">{c.time}</span>
                      </div>
                      <p className="text-xs text-[#52645A] truncate">{c.last}</p>
                    </div>
                    {c.unread && <span className="w-2 h-2 rounded-full bg-[#DC2626]" />}
                  </div>
                </button>
              ))}
            </div>
          </aside>

          <main className="flex-1 flex flex-col bg-white">
            <div className="h-16 border-b border-[#E2E8E4] flex items-center justify-between px-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#26734D] text-white flex items-center justify-center font-semibold text-sm">{activeConv.name.charAt(0)}</div>
                <div>
                  <p className="text-sm font-semibold text-[#172B22]">{activeConv.name}</p>
                  <p className="text-xs text-[#52645A]">{activeConv.project || "Conversation"}</p>
                </div>
              </div>
              <button className="text-[#52645A] hover:text-[#26734D]">⋮</button>
            </div>
            <div className="flex-1 overflow-auto p-6 space-y-4">
              <div className="flex">
                <div className="max-w-[70%] bg-gray-100 rounded-2xl px-4 py-2">
                  <p className="text-sm text-[#172B22]">Hello! I've reviewed the homepage draft. Could you adjust the header spacing?</p>
                  <p className="text-xs text-[#52645A] mt-1">10:35 AM</p>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="max-w-[70%] bg-[#F0F5F1] rounded-2xl px-4 py-2">
                  <p className="text-sm text-[#172B22]">Sure. I'll update the spacing and share a revised version.</p>
                  <p className="text-xs text-[#52645A] mt-1">10:39 AM</p>
                </div>
              </div>
              <div className="flex">
                <div className="max-w-[70%] bg-gray-100 rounded-2xl px-4 py-2">
                  <p className="text-sm text-[#172B22]">Great, thank you. Please keep the mobile layout in mind too.</p>
                  <p className="text-xs text-[#52645A] mt-1">10:42 AM</p>
                </div>
              </div>
            </div>
            <div className="border-t border-[#E2E8E4] p-4 flex gap-3">
              <input type="text" placeholder="Write a message..." className="flex-1 border border-[#E2E8E4] rounded-[8px] px-4 py-2 text-sm" />
              <button className="px-6 py-2 bg-[#26734D] text-white rounded-[8px] text-sm hover:bg-[#1e5a3d]">Send</button>
            </div>
          </main>
        </div>
      </div>
    </DashboardLayout>
  );
}