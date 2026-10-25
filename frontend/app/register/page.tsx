"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AuthLayout } from "@/app/components/layout/AuthLayout";
import Link from "next/link";

export default function RegisterPage() {
  const { register, error } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "client",
  });
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(form.email, form.password, form.role, form.name);
      setSuccess(true);
    } catch {
      // error already set by hook
    }
  };

  if (success) {
    return (
      <AuthLayout>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-green-600 mb-4">
            Account created!
          </h2>
          <p className="text-gray-600 mb-6">
            You can now log in with your email and password.
          </p>
          <Link
            href="/login"
            className="inline-block bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
          >
            Go to Login
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">
        Create your account
      </h2>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Full Name"
          className="w-full border rounded px-4 py-2 focus:ring-2 focus:ring-green-600 outline-none"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full border rounded px-4 py-2 focus:ring-2 focus:ring-green-600 outline-none"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border rounded px-4 py-2 focus:ring-2 focus:ring-green-600 outline-none"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <label htmlFor="role-select" className="block text-sm font-medium text-gray-700 mb-1">
          Role
        </label>
        <select
          id="role-select"
          className="w-full border rounded px-4 py-2 focus:ring-2 focus:ring-green-600 outline-none"
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="" disabled>Select your role</option>
          <option value="client">Client</option>
          <option value="freelancer">Freelancer</option>
        </select>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
        >
          Sign Up
        </button>
      </form>

      <p className="text-sm text-center mt-6 text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="text-green-600 font-medium">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}