"use client";
import React, { useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

import { AuthLayout } from "@/app/components/layout/AuthLayout";



export default function Dashboard() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-6 hidden md:block">
        <h2 className="text-2xl font-bold text-green-600 mb-8">
          UpTalent
        </h2>

        <nav className="space-y-4 text-sm">
          <a href="#" className="block font-medium">Dashboard</a>
          <a href="#" className="block text-gray-600">My Projects</a>
          <a href="#" className="block text-gray-600">Messages</a>
          <a href="#" className="block text-gray-600">Settings</a>
        </nav>

        <button
          onClick={handleLogout}
          className="mt-10 text-red-500 text-sm"
        >
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10">
        <h1 className="text-3xl font-bold mb-6">
          Welcome to your dashboard 👋
        </h1>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-semibold">Active Projects</h3>
            <p className="text-2xl mt-2">3</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-semibold">Pending Proposals</h3>
            <p className="text-2xl mt-2">5</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-semibold">Earnings</h3>
            <p className="text-2xl mt-2">$4,200</p>
          </div>
        </div>
      </main>

    </div>
  );
}
