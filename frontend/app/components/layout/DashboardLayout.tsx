import { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { EmployerSidebar } from "./EmployerSidebar";
import { FreelancerSidebar } from "./FreelancerSidebar";
import { AdminSidebar } from "./AdminSidebar";
import { Navbar } from "./Navbar";

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const Sidebar =
    user?.role === "admin"
      ? AdminSidebar
      : user?.role === "freelancer"
      ? FreelancerSidebar
      : EmployerSidebar;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex flex-1 pt-[64px]">
        <Sidebar />
        <main className="flex-1 bg-gray-50">{children}</main>
      </div>
    </div>
  );
}