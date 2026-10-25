"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from './dashboard.module.css';

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className={styles.container}>
      <h1>Dashboard</h1>
      <p>You are logged in.</p>
    </div>
  );
}
