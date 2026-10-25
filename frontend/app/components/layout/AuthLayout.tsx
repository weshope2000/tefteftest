import { ReactNode } from "react";
import Link from "next/link";

interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header with logo */}
      <header className="flex justify-center py-6 bg-white shadow">
        <Link href="/">
          <img
            src="/images/teftef-logo.png"
            alt="Teftef Logo"
            className="h-12 w-auto"
          />
        </Link>
      </header>

      {/* Auth content */}
      <main className="flex-grow flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
          {title && <h1 className="text-2xl font-bold text-center mb-2">{title}</h1>}
          {subtitle && <p className="text-gray-600 text-center mb-6">{subtitle}</p>}
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} Teftef. All rights reserved.
      </footer>
    </div>
  );
};