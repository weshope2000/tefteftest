import { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { AdminSidebar } from "./AdminSidebar";
import { Navbar } from "./Navbar";

export function AdminLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Access denied. Admin only.</p>
      </div>
    );
  }
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex flex-1 pt-[64px]">
        <AdminSidebar />
        <main className="flex-1 bg-[#F7F9F7]">{children}</main>
      </div>
    </div>
  );
}