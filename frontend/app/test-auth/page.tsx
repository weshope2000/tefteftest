"use client";

import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import styles from "./test-auth.module.css";

export default function TestAuthPage() {
  const { register, login, logout, loading, error } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("freelancer");
  const [message, setMessage] = useState("");

  const handleRegister = async () => {
    try {
      const res = await register(email, password, role);
      setMessage(JSON.stringify(res));
    } catch {
      setMessage("Registration failed");
    }
  };

  const handleLogin = async () => {
    try {
      const res = await login(email, password);
      setMessage(JSON.stringify(res));
    } catch {
      setMessage("Login failed");
    }
  };

  const handleLogout = () => {
    logout();
    setMessage("Logged out");
  };

  return (
    <div className={styles.container}>
      <h1>Test Auth</h1>

      <div className={styles.inputGroup}>
        <label htmlFor="email-input">Email</label>
        <input
          id="email-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.input}
        />
        <label htmlFor="password-input">Password</label>
        <input
          id="password-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.input}
        />
        <label htmlFor="role-select">Role</label>
        <select id="role-select" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="freelancer">Freelancer</option>
          <option value="client">Client</option>
        </select>
      </div>

      <div className={styles.buttonGroup}>
        <button onClick={handleRegister} disabled={loading} className={styles.button}>
          Register
        </button>
        <button onClick={handleLogin} disabled={loading} className={styles.button}>
          Login
        </button>
        <button onClick={handleLogout} disabled={loading}>
          Logout
        </button>
      </div>

      {message && <p className={styles.result}>Result: {message}</p>}
    </div>
  );
}