"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export default function SettingsPage() {
  const [theme, setTheme] = useState("light");

  return (
    <div className="app">
      <Sidebar
        categories={[{ id: "1", name: "Work", color: "#6366F1" }]}
        counts={{ total: 10, today: 3, upcoming: 4, completed: 3, overdue: 1 }}
        completionRate={30}
      />

      <div className="main-wrapper">
        <Topbar breadcrumbTitle="Preferences & Settings" />

        <main className="content-area">
          <div className="hero">
            <div>
              <div className="hero-tag">USER PREFERENCES</div>
              <h1 className="hero-title">Account & Application Settings</h1>
              <p className="hero-desc">Personalize your workspace experience, themes, notifications, and defaults.</p>
            </div>
          </div>

          <div className="settings-card">
            <div className="settings-section">
              <div className="settings-section-title">Theme & Interface</div>
              <div className="settings-row">
                <div className="settings-row-text">
                  <strong>Color Theme</strong>
                  <p>Switch between Light, Dark or System theme.</p>
                </div>
                <select
                  className="form-select"
                  style={{ width: "160px" }}
                  value={theme}
                  onChange={e => setTheme(e.target.value)}
                >
                  <option value="light">Light Mode</option>
                  <option value="dark">Dark Slate</option>
                </select>
              </div>

              <div className="settings-row">
                <div className="settings-row-text">
                  <strong>Timezone</strong>
                  <p>Display due dates and deadlines in your local timezone.</p>
                </div>
                <select className="form-select" style={{ width: "220px" }}>
                  <option>Asia/Kolkata (IST +05:30)</option>
                  <option>UTC (Coordinated Universal Time)</option>
                  <option>America/New_York (EST)</option>
                  <option>Europe/London (GMT)</option>
                </select>
              </div>
            </div>

            <div className="settings-section">
              <div className="settings-section-title">Notifications</div>
              <div className="settings-row">
                <div className="settings-row-text">
                  <strong>Deadline Reminders</strong>
                  <p>Receive alerts when tasks become due or overdue.</p>
                </div>
                <input type="checkbox" defaultChecked style={{ width: "18px", height: "18px" }} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
