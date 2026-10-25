"use client";

import { useState } from "react";
import axios from "axios";
import { useAuth as useAuthContext } from "@/context/AuthContext";

const API_URL = "http://localhost:8000";

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login: setAuth, logout: clearAuth } = useAuthContext();

  const register = async (
    email: string,
    password: string,
    role: string,
    name = ""
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${API_URL}/auth/register`,
        { name, email, password, role },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      return response.data;
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data?.message || "Registration failed");
      } else {
        setError("Network error. Check API Gateway.");
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${API_URL}/auth/login`,
        { email, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      setAuth(response.data.token);
      return response.data;
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data?.message || "Login failed");
      } else {
        setError("Network error. Check API Gateway.");
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearAuth();
  };

  return { register, login, logout, loading, error };
};