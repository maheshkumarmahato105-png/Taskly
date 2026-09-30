"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { ShortcutsModal } from "@/components/layout/ShortcutsModal";
import { toast } from "@/components/ui/Toast";
import {
  loadStoredCategories,
  loadStoredSettings,
  saveStoredSettings,
  loadStoredTasks,
  calculateSummary,
} from "@/lib/store";
import type { Lookup, SystemSettings } from "@/types/task";

export default function SettingsPage() {
  const [categories, setCategories] = useState<Lookup[]>([]);
  const [settings, setSettings] = useState<SystemSettings>({
    appName: "EasyMyLearning",
    brandColor: "#FFAA00",
    theme: "light",
    defaultView: "list",
    auditEnabled: true,
    companyName: "EasyMyLearning Inc.",
    supportEmail: "support@easymylearning.com",
  });
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    setCategories(loadStoredCategories());
    setSettings(loadStoredSettings());
  }, []);

  const tasks = typeof window !== "undefined" ? loadStoredTasks() : [];
  const summary = calculateSummary(tasks);

  function handleSave() {
    saveStoredSettings(settings);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2500);
    toast.success("Preferences Saved", "Your workspace settings have been updated successfully");
  }

  return (
    <div className="app">
      <Sidebar
        categories={categories}
        counts={{
          total: tasks.length,
          today: tasks.filter(t => t.dueDate === new Date().toISOString().slice(0, 10)).length,
          upcoming: tasks.filter(t => t.dueDate && t.dueDate > new Date().toISOString().slice(0, 10)).length,
          completed: summary.completed,
          overdue: summary.overdue,
        }}
        completionRate={summary.completionRate}
        brandName="EasyMyLearning"
      />

      <div className="main-wrapper">
        <Topbar
          breadcrumbTitle="Preferences &amp; Settings"
          onHelpClick={() => setShortcutsModalOpen(true)}
        />

        <main className="content-area">
          <div className="hero">
            <div>
              <div className="hero-tag" style={{ color: "#FFAA00" }}>USER PREFERENCES (PDF PAGE 5 &amp; 6)</div>
              <h1 className="hero-title">Account &amp; Application Settings</h1>
              <p className="hero-desc">Personalize your workspace experience, themes, notifications, and default task view.</p>
            </div>
            <div className="hero-controls">
              <button className="btn btn-primary" onClick={handleSave}>
                Save Preferences
              </button>
            </div>
          </div>

          {savedMsg && (
            <div style={{ marginBottom: "16px", padding: "10px 16px", background: "rgba(16, 185, 129, 0.12)", border: "1px solid #10B981", borderRadius: "8px", color: "#065F46", fontSize: "12px", fontWeight: 700 }}>
              ✓ Preferences updated successfully!
            </div>
          )}

          <div className="settings-card">
            <div className="settings-section">
              <div className="settings-section-title">Theme &amp; Interface (PDF Page 6: user_preferences)</div>
              <div className="settings-row">
                <div className="settings-row-text">
                  <strong>Color Theme</strong>
                  <p>Switch between Light, Dark Slate, or System theme.</p>
                </div>
                <select
                  className="form-select"
                  style={{ width: "160px" }}
                  value={settings.theme}
                  onChange={e => setSettings({ ...settings, theme: e.target.value as any })}
                >
                  <option value="light">Light Mode</option>
                  <option value="dark">Dark Slate</option>
                  <option value="system">System Default</option>
                </select>
              </div>

              <div className="settings-row">
                <div className="settings-row-text">
                  <strong>Default Task View</strong>
                  <p>Default landing layout for tasks (Table list vs. Kanban board).</p>
                </div>
                <select
                  className="form-select"
                  style={{ width: "160px" }}
                  value={settings.defaultView}
                  onChange={e => setSettings({ ...settings, defaultView: e.target.value as any })}
                >
                  <option value="list">Table View</option>
                  <option value="kanban">Kanban Board</option>
                </select>
              </div>

              <div className="settings-row">
                <div className="settings-row-text">
                  <strong>Timezone</strong>
                  <p>Display task deadlines and audit timestamps in local timezone.</p>
                </div>
                <select className="form-select" style={{ width: "240px" }}>
                  <option>Asia/Kolkata (IST +05:30)</option>
                  <option>UTC (Coordinated Universal Time)</option>
                  <option>America/New_York (EST)</option>
                  <option>Europe/London (GMT)</option>
                </select>
              </div>
            </div>

            <div className="settings-section">
              <div className="settings-section-title">Notification Settings (PDF Page 5: notifications)</div>
              <div className="settings-row">
                <div className="settings-row-text">
                  <strong>Overdue &amp; Due Date Alerts</strong>
                  <p>Receive notifications when tasks approach or exceed deadlines.</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  style={{ width: "18px", height: "18px", accentColor: "#FFAA00" }}
                />
              </div>

              <div className="settings-row">
                <div className="settings-row-text">
                  <strong>Assignment Notifications</strong>
                  <p>Notify team members when assigned to a task or sub-item.</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  style={{ width: "18px", height: "18px", accentColor: "#FFAA00" }}
                />
              </div>

              <div className="settings-row">
                <div className="settings-row-text">
                  <strong>Discussion Comments</strong>
                  <p>Notify when teammates post notes or checklist updates.</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  style={{ width: "18px", height: "18px", accentColor: "#FFAA00" }}
                />
              </div>
            </div>
          </div>
        </main>
      </div>

      <ShortcutsModal isOpen={shortcutsModalOpen} onClose={() => setShortcutsModalOpen(false)} />
    </div>
  );
}
