"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { UserPublic, LoginRequest, RegisterRequest, AuthResponse } from "@/lib/auth-types";

interface AuthContextType {
  user: UserPublic | null;
  token: string | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserPublic | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    if (storedToken) {
      setToken(storedToken);
      fetchCurrentUser(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async (authToken: string) => {
    try {
      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        localStorage.removeItem("auth_token");
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
      localStorage.removeItem("auth_token");
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = useCallback(async (credentials: LoginRequest) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Login failed");
      }

      const data: AuthResponse = await response.json();
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem("auth_token", data.token);
    } catch (error) {
      throw error;
    }
  }, []);

  const register = useCallback(
    async (data: RegisterRequest) => {
      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Registration failed");
        }

        await login({ username: data.username, password: data.password });
      } catch (error) {
        throw error;
      }
    },
    [login]
  );

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("auth_token");
  }, []);

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useAuthHeaders() {
  const { token } = useAuth();

  return useCallback(() => {
    if (!token) {
      return {};
    }
    return {
      Authorization: `Bearer ${token}`,
    };
  }, [token]);
}
