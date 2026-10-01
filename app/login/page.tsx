"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { ShieldCheck, UserCheck, Lock, Mail, ArrowRight, Shield, Eye, Users } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, switchUser, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const demoAccounts = [
    {
      name: "Bishal Kumar Jaiswal",
      email: "bishal@taskly.com",
      role: "Lead Admin",
      roleCode: "ADMIN",
      badgeColor: "#EF4444",
      desc: "Full administrative access, DB reset, user role modification, and system configs",
    },
    {
      name: "Rahul Mishra",
      email: "rahul@taskly.com",
      role: "Project Manager",
      roleCode: "MANAGER",
      badgeColor: "#F59E0B",
      desc: "Task management, team assignments oversight, and workflow planning",
    },
    {
      name: "Anita Sharma",
      email: "anita@taskly.com",
      role: "Full-Stack Dev",
      roleCode: "USER",
      badgeColor: "#3B82F6",
      desc: "Standard task execution, checklists, comments, and status transitions",
    },
    {
      name: "Priya Sharma",
      email: "priya@taskly.com",
      role: "QA Engineer",
      roleCode: "USER",
      badgeColor: "#8B5CF6",
      desc: "Verification testing, bug tracking, and collaborative discussions",
    },
    {
      name: "Demo Viewer",
      email: "viewer@taskly.com",
      role: "Viewer (Read-Only)",
      roleCode: "VIEWER",
      badgeColor: "#64748B",
      desc: "Read-only access; cannot create or modify tasks or admin configurations",
    },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    const success = await login(email.trim(), password);
    setSubmitting(false);
    if (success) {
      router.push("/tasks");
    }
  }

  async function handleQuickLogin(account: typeof demoAccounts[0]) {
    setSubmitting(true);
    await switchUser(account.email);
    setSubmitting(false);
    router.push("/tasks");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0B0F19 0%, #111827 50%, #1E293B 100%)",
        color: "#F8FAFC",
        padding: "24px 16px",
      }}
    >
      <div style={{ maxWidth: "460px", width: "100%", margin: "0 auto" }}>
        {/* Brand Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ display: "inline-block", marginBottom: "12px" }}>
            <BrandLogo size={42} />
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, margin: "8px 0 4px", letterSpacing: "-0.5px" }}>
            Authentication & Security Portal
          </h1>
          <p style={{ color: "#94A3B8", fontSize: "13px", margin: 0 }}>
            EasyMyLearning Task Manager • Architecture & Deployment Blueprint (PDF Page 9)
          </p>
        </div>

        {/* Login Card */}
        <div
          style={{
            background: "rgba(30, 41, 59, 0.7)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "16px",
            padding: "28px",
            boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.5)",
          }}
        >
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px", color: "#CBD5E1" }}>
                Work Email Address
              </label>
              <div style={{ position: "relative" }}>
                <Mail
                  size={16}
                  style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#64748B" }}
                />
                <input
                  type="email"
                  required
                  placeholder="name@taskly.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px 10px 38px",
                    background: "#0F172A",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#F8FAFC",
                    fontSize: "13px",
                    outline: "none",
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px", color: "#CBD5E1" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock
                  size={16}
                  style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#64748B" }}
                />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px 10px 38px",
                    background: "#0F172A",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#F8FAFC",
                    fontSize: "13px",
                    outline: "none",
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                width: "100%",
                padding: "12px",
                background: "linear-gradient(135deg, #FFAA00, #E68A00)",
                border: 0,
                borderRadius: "8px",
                color: "#1E293B",
                fontWeight: 800,
                fontSize: "14px",
                cursor: submitting ? "not-allowed" : "pointer",
                marginTop: "4px",
                boxShadow: "0 4px 12px rgba(255, 170, 0, 0.3)",
              }}
            >
              <span>{submitting ? "Authenticating..." : "Sign In to Workspace"}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Quick Demo Switcher */}
          <div style={{ marginTop: "28px", borderTop: "1px solid #334155", paddingTop: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <span style={{ fontSize: "12px", fontWeight: 800, color: "#FFAA00", display: "flex", alignItems: "center", gap: "6px" }}>
                <ShieldCheck size={14} /> Quick Demo Profiles (RBAC Test)
              </span>
              <span style={{ fontSize: "10px", color: "#94A3B8" }}>Instant login</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {demoAccounts.map(acc => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleQuickLogin(acc)}
                  disabled={submitting}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    background: "#0F172A",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    textAlign: "left",
                    color: "#F8FAFC",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "#FFAA00")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "#334155")}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        background: acc.badgeColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        fontSize: "11px",
                        color: "#fff",
                      }}
                    >
                      {acc.name.slice(0, 2).toUpperCase()}
                    </span>
                    <div>
                      <div style={{ fontSize: "12px", fontWeight: 700 }}>{acc.name}</div>
                      <div style={{ fontSize: "10px", color: "#94A3B8" }}>{acc.email}</div>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 800,
                      padding: "2px 8px",
                      borderRadius: "12px",
                      background: `${acc.badgeColor}22`,
                      color: acc.badgeColor,
                      border: `1px solid ${acc.badgeColor}44`,
                    }}
                  >
                    {acc.role}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Security Baseline Footer */}
        <div style={{ textAlign: "center", marginTop: "24px", color: "#64748B", fontSize: "11px" }}>
          <div>PostgreSQL <code>users</code> & <code>user_roles</code> schema active.</div>
          <div style={{ marginTop: "4px" }}>
            Role-based authorization enforced in Go backend & Next.js frontend.
          </div>
        </div>
      </div>
    </div>
  );
}
