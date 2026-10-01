"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Search, HelpCircle, ChevronDown, Check, LogOut, Shield, User, ArrowRightLeft } from "lucide-react";
import { BrandMark } from "@/components/ui/BrandLogo";
import { loadStoredNotifications, saveStoredNotifications } from "@/lib/store";
import { useAuth } from "@/context/AuthContext";
import type { InAppNotification } from "@/types/task";

interface TopbarProps {
  breadcrumbTitle?: string;
  onSearchClick?: () => void;
  onHelpClick?: () => void;
  userName?: string;
  userRole?: string;
  userInitials?: string;
}

export function Topbar({
  breadcrumbTitle = "Tasks Dashboard",
  onSearchClick,
  onHelpClick,
  userName: propUserName,
  userRole: propUserRole,
  userInitials: propUserInitials,
}: TopbarProps) {
  const router = useRouter();
  const { user: authUser, roleTitle, switchUser, logout } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const userName = authUser?.name || propUserName || "Bishal";
  const userRole = authUser?.roleTitle || roleTitle || propUserRole || "Lead Admin";
  const userInitials = propUserInitials || userName.split(" ").map(p => p[0]).join("").toUpperCase().slice(0, 2);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setNotifications(loadStoredNotifications());
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  function handleMarkAllRead() {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    saveStoredNotifications(updated);
  }

  function handleToggleRead(id: string) {
    const updated = notifications.map(n => n.id === id ? { ...n, read: !n.read } : n);
    setNotifications(updated);
    saveStoredNotifications(updated);
  }

  return (
    <header className="topbar">
      <div className="breadcrumbs">
        <Link href="/" prefetch={true} className="topbar-brand-link" title="EasyMyLearning Workspace">
          <BrandMark size={26} glow={false} />
          <span className="topbar-brand-text">
            <span>EasyMy</span>
            <span style={{ color: "#FFAA00" }}>Learning</span>
          </span>
        </Link>
        <span className="crumb-sep">/</span>
        <strong className="topbar-crumb-title">{breadcrumbTitle}</strong>
      </div>

      <div className="topbar-actions">

        {onSearchClick && (
          <button className="icon-btn" onClick={onSearchClick} title="Search tasks (Press /)">
            <Search size={16} />
          </button>
        )}

        {onHelpClick && (
          <button className="icon-btn" onClick={onHelpClick} title="Keyboard shortcuts (?)">
            <HelpCircle size={16} />
          </button>
        )}

        {/* Notifications Center */}
        <div style={{ position: "relative" }}>
          <button
            className="icon-btn"
            onClick={() => setNotifOpen(!notifOpen)}
            title="Notifications (PDF Page 7)"
            style={{ position: "relative" }}
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "2px",
                  right: "2px",
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  background: "#EF4444",
                  color: "#fff",
                  fontSize: "9px",
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid #fff",
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div
              className="notifications-panel show"
              style={{
                position: "absolute",
                top: "45px",
                right: "0",
                width: "min(340px, calc(100vw - 32px))",
                background: "#fff",
                borderRadius: "12px",
                border: "1px solid var(--border)",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15)",
                zIndex: 100,
                padding: "0",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "12px 16px",
                  background: "#FAFBFC",
                  borderBottom: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <h4 style={{ margin: 0, fontSize: "13px", fontWeight: 800 }}>In-App Notifications</h4>
                  <small style={{ color: "var(--muted)", fontSize: "10px" }}>
                    {unreadCount} unread alert{unreadCount === 1 ? "" : "s"}
                  </small>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    style={{
                      background: "none",
                      border: 0,
                      color: "var(--brand-dark)",
                      fontSize: "11px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: "280px", overflowY: "auto" }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: "20px", textAlign: "center", color: "var(--muted)", fontSize: "12px" }}>
                    No notifications
                  </div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => handleToggleRead(n.id)}
                      style={{
                        padding: "10px 16px",
                        borderBottom: "1px solid #F1F5F9",
                        background: n.read ? "#fff" : "rgba(255, 170, 0, 0.05)",
                        cursor: "pointer",
                        display: "flex",
                        gap: "10px",
                        alignItems: "flex-start",
                      }}
                    >
                      <div
                        style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "6px",
                          background:
                            n.type === "overdue" ? "rgba(239, 68, 68, 0.12)" :
                            n.type === "assignment" ? "rgba(37, 99, 235, 0.12)" :
                            "rgba(255, 170, 0, 0.15)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                          flexShrink: 0,
                        }}
                      >
                        {n.type === "overdue" ? "⚠️" : n.type === "assignment" ? "📋" : "💬"}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <strong style={{ fontSize: "12px", color: "var(--ink)" }}>{n.title}</strong>
                          <span style={{ fontSize: "10px", color: "var(--muted)" }}>{n.timestamp}</span>
                        </div>
                        <p style={{ margin: "3px 0 0", fontSize: "11px", color: "var(--ink-2)", lineHeight: 1.4 }}>
                          {n.message}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div
                style={{
                  padding: "8px 16px",
                  background: "#FAFBFC",
                  borderTop: "1px solid var(--border)",
                  textAlign: "center",
                }}
              >
                <button
                  onClick={() => setNotifOpen(false)}
                  style={{
                    background: "none",
                    border: 0,
                    color: "var(--muted)",
                    fontSize: "11px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Close panel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Menu & Role Switcher (PDF Page 9) */}
        <div style={{ position: "relative" }} ref={userMenuRef}>
          <div
            className="user-menu-btn"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            style={{ cursor: "pointer" }}
            title="Click to view profile or switch active role"
          >
            <span className="user-avatar" style={{ background: "linear-gradient(135deg, #FFAA00, #E68A00)", color: "#1F2937" }}>
              {userInitials}
            </span>
            <div className="user-meta">
              <span className="user-meta-name">{userName}</span>
              <span className="user-meta-role" style={{ color: "#E68A00", fontWeight: 700 }}>
                {userRole}
              </span>
            </div>
            <ChevronDown size={14} style={{ transform: userMenuOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s ease" }} />
          </div>

          {userMenuOpen && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                marginTop: "8px",
                width: "280px",
                background: "#FFFFFF",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15)",
                zIndex: 100,
                padding: "0",
                overflow: "hidden",
              }}
            >
              <div style={{ padding: "12px 16px", background: "#FAFBFC", borderBottom: "1px solid var(--border)" }}>
                <div style={{ fontSize: "13px", fontWeight: 800, color: "#1E293B" }}>{userName}</div>
                <div style={{ fontSize: "11px", color: "var(--muted)" }}>{authUser?.email || "user@taskly.com"}</div>
                <div style={{ marginTop: "6px" }}>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 800,
                      padding: "2px 8px",
                      borderRadius: "12px",
                      background: "rgba(255, 170, 0, 0.15)",
                      color: "#B45309",
                      border: "1px solid rgba(255, 170, 0, 0.4)",
                      display: "inline-block",
                    }}
                  >
                    Role: {userRole}
                  </span>
                </div>
              </div>

              {/* Quick Switch Profiles */}
              <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>
                <div style={{ fontSize: "10px", fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px", display: "flex", alignItems: "center", gap: "4px" }}>
                  <ArrowRightLeft size={11} /> Switch Role / Persona (PDF Page 9)
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  {[
                    { name: "Bishal (Lead Admin)", email: "bishal@taskly.com", role: "ADMIN" },
                    { name: "Rahul (Project Manager)", email: "rahul@taskly.com", role: "MANAGER" },
                    { name: "Anita (Full-Stack Dev)", email: "anita@taskly.com", role: "USER" },
                    { name: "Priya (QA Engineer)", email: "priya@taskly.com", role: "USER" },
                    { name: "Demo (Viewer - Read Only)", email: "viewer@taskly.com", role: "VIEWER" },
                  ].map(p => (
                    <button
                      key={p.email}
                      type="button"
                      onClick={() => {
                        void switchUser(p.email);
                        setUserMenuOpen(false);
                      }}
                      style={{
                        padding: "6px 8px",
                        fontSize: "11px",
                        textAlign: "left",
                        background: authUser?.email === p.email ? "rgba(255, 170, 0, 0.1)" : "transparent",
                        border: 0,
                        borderRadius: "6px",
                        color: authUser?.email === p.email ? "var(--brand-dark)" : "#334155",
                        fontWeight: authUser?.email === p.email ? 700 : 500,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>{p.name}</span>
                      {authUser?.email === p.email && <Check size={12} color="#FFAA00" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ padding: "8px 12px", background: "#FAFBFC", display: "flex", flexDirection: "column", gap: "4px" }}>
                <Link
                  href="/login"
                  onClick={() => setUserMenuOpen(false)}
                  style={{
                    padding: "6px 8px",
                    fontSize: "11px",
                    color: "var(--brand-dark)",
                    fontWeight: 700,
                    textDecoration: "none",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <User size={13} /> Open Login Portal
                </Link>
                <button
                  type="button"
                  onClick={async () => {
                    await logout();
                    setUserMenuOpen(false);
                    router.push("/login");
                  }}
                  style={{
                    padding: "6px 8px",
                    fontSize: "11px",
                    color: "#EF4444",
                    fontWeight: 700,
                    background: "none",
                    border: 0,
                    borderRadius: "6px",
                    cursor: "pointer",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <LogOut size={13} /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
