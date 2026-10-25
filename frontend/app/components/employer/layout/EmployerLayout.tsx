"use client";

import { ReactNode } from "react";
import { EmployerSidebar } from "./EmployerSidebar";
import { EmployerTopbar } from "./EmployerTopbar";

export function EmployerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F7F9F7]">
      <EmployerTopbar />
      <div className="flex pt-[64px]">
        <EmployerSidebar />
        <main className="flex-1 md:ml-[264px] px-4 md:px-8 py-6">{children}</main>
      </div>
    </div>
  );
}
