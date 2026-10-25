"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AuthLayout } from "@/app/components/layout/AuthLayout";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { login, error } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(form.email, form.password);
      router.push("/dashboard");
    } catch {
      // error already set by hook
    }
  };

  return (
    <AuthLayout>
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">
        Welcome back
      </h2>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          autoComplete="email"
          className="w-full border rounded px-4 py-2 focus:ring-2 focus:ring-green-600 outline-none"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          className="w-full border rounded px-4 py-2 focus:ring-2 focus:ring-green-600 outline-none"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
        >
          Log In
        </button>
      </form>

      <p className="text-sm text-center mt-6 text-gray-600">
        Don't have an account?{" "}
        <Link href="/register" className="text-green-600 font-medium">
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
}