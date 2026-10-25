"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import styles from "./register.module.css";

export default function RegisterPage() {
  const router = useRouter();
  const { register, loading, error: authError } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("freelancer");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await register(email, password, role);
      alert("Registration successful! Please login.");
      router.push("/login");
    } catch {
      // Error is handled by the hook
    }
  };

  return (
    <div className={styles.registerContainer}>
      <h2>Register</h2>

      <form onSubmit={handleRegister}>
        <input
          type="email"
          placeholder="Email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

       <label htmlFor="role">Role</label>
       <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
         <option value="freelancer">Freelancer</option>
         <option value="client">Client</option>
       </select>

        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>

      {authError && <p className={styles.error}>{authError}</p>}
    </div>
  );
}