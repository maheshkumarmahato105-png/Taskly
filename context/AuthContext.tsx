"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { AuthSession, UserAccount } from "@/types/task";
import { api } from "@/lib/api";
import { toast } from "@/components/ui/Toast";

interface AuthContextType {
  user: AuthSession | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  switchUser: (user: UserAccount | string) => Promise<void>;
  can: (action: string) => boolean;
  role: string;
  roleTitle: string;
}

const DEFAULT_SESSION: AuthSession = {
  userId: "usr-1",
  name: "Bishal Kumar Jaiswal",
  email: "bishal@taskly.com",
  role: "ADMIN",
  roleTitle: "Lead Admin",
  token: "tok_default_admin",
  expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
};

const AuthContext = createContext<AuthContextType>({
  user: DEFAULT_SESSION,
  loading: false,
  login: async () => false,
  logout: async () => {},
  switchUser: async () => {},
  can: () => true,
  role: "ADMIN",
  roleTitle: "Lead Admin",
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthSession | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("taskly_session");
        if (stored) return JSON.parse(stored);
      } catch (_) {}
    }
    return DEFAULT_SESSION;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && typeof window !== "undefined") {
      localStorage.setItem("taskly_session", JSON.stringify(user));
    }
  }, [user]);

  const login = useCallback(async (email: string, password?: string): Promise<boolean> => {
    setLoading(true);
    try {
      const sess = await api.login({ email, password });
      setUser(sess);
      if (typeof window !== "undefined") {
        localStorage.setItem("taskly_session", JSON.stringify(sess));
      }
      toast.success("Welcome back!", `Logged in as ${sess.name} (${sess.roleTitle || sess.role})`);
      return true;
    } catch (err: any) {
      toast.error("Login Failed", err.message || "Invalid credentials");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch (_) {}
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("taskly_session");
    }
    toast.info("Logged Out", "You have signed out of Taskly");
  }, []);

  const switchUser = useCallback(async (target: UserAccount | string) => {
    const email = typeof target === "string" ? target : target.email;
    setLoading(true);
    try {
      const sess = await api.login({ email });
      setUser(sess);
      if (typeof window !== "undefined") {
        localStorage.setItem("taskly_session", JSON.stringify(sess));
      }
      toast.success("Profile Switched", `Active as ${sess.name} (${sess.roleTitle || sess.role})`);
    } catch (err: any) {
      toast.error("Switch Failed", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const can = useCallback((action: string): boolean => {
    if (!user) return false;
    const r = user.role.toUpperCase();
    switch (action) {
      case "admin:access":
      case "admin:manage_roles":
      case "admin:reset_db":
      case "config:write":
        return r === "ADMIN" || user.roleTitle === "Lead Admin";
      case "tasks:delete":
        return r === "ADMIN" || r === "MANAGER" || user.roleTitle === "Project Manager";
      case "tasks:create":
      case "tasks:edit":
      case "tasks:status":
        return r !== "VIEWER" && user.roleTitle !== "Viewer";
      case "tasks:read":
        return true;
      default:
        return r === "ADMIN";
    }
  }, [user]);

  const role = user?.role || "USER";
  const roleTitle = user?.roleTitle || (role === "ADMIN" ? "Lead Admin" : role === "MANAGER" ? "Project Manager" : role === "VIEWER" ? "Viewer" : "Full-Stack Dev");

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, switchUser, can, role, roleTitle }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
