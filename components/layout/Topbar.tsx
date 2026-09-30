"use client";

import React, { useState, useEffect } from "react";
import { Bell, Search, HelpCircle, ChevronDown, Check, FileText } from "lucide-react";
import { loadStoredNotifications, saveStoredNotifications } from "@/lib/store";
import type { InAppNotification } from "@/types/task";

interface TopbarProps {
  breadcrumbTitle?: string;
  onSearchClick?: () => void;
  onHelpClick?: () => void;
  onOpenArchitecture?: () => void;
  userName?: string;
  userRole?: string;
  userInitials?: string;
}

export function Topbar({
  breadcrumbTitle = "Tasks Dashboard",
  onSearchClick,
  onHelpClick,
  onOpenArchitecture,
  userName = "Bishal",
  userRole = "Lead Admin",
  userInitials = "BJ",
}: TopbarProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);

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
        <span>EasyMyLearning</span>
        <span>/</span>
        <strong>{breadcrumbTitle}</strong>
      </div>

      <div className="topbar-actions">
        {onOpenArchitecture && (
          <button
            className="btn btn-secondary"
            onClick={onOpenArchitecture}
            style={{ height: "34px", padding: "0 10px", fontSize: "11px", gap: "6px" }}
            title="View Architecture & Deployment Plan"
          >
            <FileText size={14} style={{ color: "#FFAA00" }} />
            <span>Plan Specs</span>
          </button>
        )}

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
                width: "320px",
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

        {/* User Menu */}
        <div className="user-menu-btn">
          <span className="user-avatar" style={{ background: "linear-gradient(135deg, #FFAA00, #E68A00)", color: "#1F2937" }}>
            {userInitials}
          </span>
          <div className="user-meta">
            <span className="user-meta-name">{userName}</span>
            <span className="user-meta-role" style={{ color: "#E68A00" }}>{userRole}</span>
          </div>
          <ChevronDown size={14} />
        </div>
      </div>
    </header>
  );
}
