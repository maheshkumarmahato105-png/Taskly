"use client";

import React, { useState } from "react";
import { Bell, Search, HelpCircle, ChevronDown } from "lucide-react";

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
  userName = "Bishal",
  userRole = "Lead Admin",
  userInitials = "BJ",
}: TopbarProps) {
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <header className="topbar">
      <div className="breadcrumbs">
        <span>Workspace</span>
        <span>/</span>
        <strong>{breadcrumbTitle}</strong>
      </div>

      <div className="topbar-actions">
        {onSearchClick && (
          <button className="icon-btn" onClick={onSearchClick} title="Search tasks (Press /)">
            <Search size={17} />
          </button>
        )}

        {onHelpClick && (
          <button className="icon-btn" onClick={onHelpClick} title="Keyboard shortcuts (?)">
            <HelpCircle size={17} />
          </button>
        )}

        <div style={{ position: "relative" }}>
          <button className="icon-btn" onClick={() => setNotifOpen(!notifOpen)} title="Notifications">
            <Bell size={17} />
            <span className="unread-indicator" />
          </button>

          {notifOpen && (
            <div className="notifications-panel show" style={{ position: "absolute", top: "45px", right: "0" }}>
              <div className="notifications-header">
                <h4>Notifications</h4>
                <button onClick={() => setNotifOpen(false)}>Close</button>
              </div>
              <div className="notifications-list">
                <div className="notification-item unread">
                  <div className="notification-icon">⚠️</div>
                  <div>
                    <strong>Overdue Task Notice</strong>
                    <p style={{ fontSize: "11px", color: "var(--muted)", marginTop: "2px" }}>
                      Follow up on pending approval is overdue.
                    </p>
                    <small style={{ color: "var(--muted-2)" }}>Urgent</small>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <button className="user-menu-btn">
          <span className="user-avatar">{userInitials}</span>
          <div className="user-meta">
            <span className="user-meta-name">{userName}</span>
            <span className="user-meta-role">{userRole}</span>
          </div>
          <ChevronDown size={14} />
        </button>
      </div>
    </header>
  );
}
