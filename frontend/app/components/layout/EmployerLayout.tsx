import { ReactNode } from "react";
import { EmployerSidebar } from "./EmployerSidebar";

export function EmployerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <EmployerSidebar />
      <main className="flex-1 bg-gray-50">
        {children}
      </main>
    </div>
  );
}