"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AuthLayout } from "@/app/components/layout/AuthLayout";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch {
      setError("Invalid credentials");
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to continue"
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
          autoComplete="current-password"
          required
          className="w-full border rounded-md px-4 py-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-3 rounded-md font-medium hover:bg-green-700"
        >
          Log in
        </button>
      </form>

      <p className="text-sm text-center mt-6">
        Don’t have an account?{" "}
        <a href="/register" className="text-green-600 font-medium">
          Sign up
        </a>
      </p>
    </AuthLayout>
  );
}