"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AuthLayout } from "@/app/components/layout/AuthLayout";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("freelancer");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    try {
      await register(email, password, role);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join thousands of freelancers and clients"
    >
      <form onSubmit={handleSubmit} className="space-y-4">

        <input
          type="email"
          placeholder="Email"
          required
          className="w-full border rounded-md px-4 py-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          autoComplete="new-password"
          required
          className="w-full border rounded-md px-4 py-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <label htmlFor="role-select" className="block text-sm font-medium text-gray-700 mb-1">
          Role
        </label>
        <select
          id="role-select"
          className="w-full border rounded-md px-4 py-3"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="freelancer">Freelancer</option>
          <option value="client">Client</option>
        </select>

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-3 rounded-md font-medium hover:bg-green-700"
        >
          Sign up
        </button>
      </form>

      <p className="text-sm text-center mt-6">
        Already have an account?{" "}
        <a href="/login" className="text-green-600 font-medium">
          Log in
        </a>
      </p>
    </AuthLayout>
  );
}