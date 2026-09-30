"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { CategoryManager } from "@/components/admin/CategoryManager";
import { StatusManager } from "@/components/admin/StatusManager";
import { SystemSettings } from "@/components/admin/SystemSettings";
import { api } from "@/lib/api";
import type { Lookup, SystemSettings as SystemSettingsType, UserAccount, AuditLogItem } from "@/types/task";

export default function AdminPage() {
  const [categories, setCategories] = useState<Lookup[]>([]);
  const [statuses, setStatuses] = useState<Lookup[]>([]);
  const [priorities, setPriorities] = useState<Lookup[]>([]);
  const [activeTab, setActiveTab] = useState("categories");
  const [settings, setSettings] = useState<SystemSettingsType>({
    appName: "Taskly",
    brandColor: "#FFAA00",
    theme: "light",
    defaultView: "list",
    auditEnabled: true,
  });

  const demoUsers: UserAccount[] = [
    { id: "usr-1", name: "Bishal", email: "bishal@taskly.com", role: "Lead Admin", status: "Active" },
    { id: "usr-2", name: "Anita", email: "anita@taskly.com", role: "Full-Stack Dev", status: "Active" },
    { id: "usr-3", name: "Rahul", email: "rahul@taskly.com", role: "Product Designer", status: "Active" },
    { id: "usr-4", name: "Priya", email: "priya@taskly.com", role: "QA Engineer", status: "Active" },
  ];

  const demoAuditLogs: AuditLogItem[] = [
    { id: "aud-1", action: "Task Created", detail: "Created 'Finalize Taskly content plan'", user: "Bishal", timestamp: "Today, 10:00 AM" },
    { id: "aud-2", action: "Status Updated", detail: "Moved 'Prepare tomorrow's team meeting' to Completed", user: "Bishal", timestamp: "Today, 1:45 PM" },
  ];

  useEffect(() => {
    async function loadData() {
      try {
        const [catRes, stRes, prRes] = await Promise.all([
          api.categories(),
          api.statuses(),
          api.priorities(),
        ]);
        setCategories(catRes.items);
        setStatuses(stRes.items);
        setPriorities(prRes.items);
      } catch (e) {
        console.warn("Using offline fallback data for admin", e);
      }
    }
    void loadData();
  }, []);

  function handleAddCategory(newCat: { name: string; color: string }) {
    setCategories(prev => [...prev, { id: "cat-" + Date.now(), ...newCat }]);
  }

  function handleDeleteCategory(id: string) {
    setCategories(prev => prev.filter(c => c.id !== id));
  }

  return (
    <div className="app">
      <Sidebar
        categories={categories}
        counts={{ total: 10, today: 3, upcoming: 4, completed: 3, overdue: 1 }}
        completionRate={30}
      />

      <div className="main-wrapper">
        <Topbar breadcrumbTitle="Admin Configuration Console" />

        <main className="content-area">
          <div className="hero">
            <div>
              <div className="hero-tag">SYSTEM GOVERNANCE</div>
              <h1 className="hero-title">Admin Configuration Console</h1>
              <p className="hero-desc">Configure statuses, categories, branding, users, and audit logs.</p>
            </div>
          </div>

          <div className="admin-container">
            <div className="admin-tabs-nav">
              <button
                className={`admin-tab-btn ${activeTab === "categories" ? "active" : ""}`}
                onClick={() => setActiveTab("categories")}
              >
                Task Categories
              </button>
              <button
                className={`admin-tab-btn ${activeTab === "statuses" ? "active" : ""}`}
                onClick={() => setActiveTab("statuses")}
              >
                Workflow Statuses
              </button>
              <button
                className={`admin-tab-btn ${activeTab === "branding" ? "active" : ""}`}
                onClick={() => setActiveTab("branding")}
              >
                Branding & Settings
              </button>
              <button
                className={`admin-tab-btn ${activeTab === "users" ? "active" : ""}`}
                onClick={() => setActiveTab("users")}
              >
                Users & Roles
              </button>
              <button
                className={`admin-tab-btn ${activeTab === "audit" ? "active" : ""}`}
                onClick={() => setActiveTab("audit")}
              >
                Audit Trail
              </button>
            </div>

            {activeTab === "categories" && (
              <CategoryManager
                categories={categories}
                taskCountsByCategory={{ Work: 4, Marketing: 2, Operations: 2, Admissions: 1, Personal: 1 }}
                onAddCategory={handleAddCategory}
                onDeleteCategory={handleDeleteCategory}
              />
            )}

            {activeTab === "statuses" && (
              <StatusManager statuses={statuses} />
            )}

            {activeTab === "branding" && (
              <SystemSettings
                settings={settings}
                onSave={newS => {
                  setSettings(newS);
                  alert("Settings saved successfully!");
                }}
              />
            )}

            {activeTab === "users" && (
              <div className="panel-card" style={{ padding: "20px" }}>
                <table className="config-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {demoUsers.map(u => (
                      <tr key={u.id}>
                        <td><strong>👤 {u.name}</strong></td>
                        <td>{u.email}</td>
                        <td style={{ color: "var(--primary-dark)", fontWeight: 700 }}>{u.role}</td>
                        <td style={{ color: "var(--green)", fontWeight: 700 }}>● {u.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "audit" && (
              <div className="panel-card" style={{ padding: "20px" }}>
                <div className="activity-stream">
                  {demoAuditLogs.map(l => (
                    <div key={l.id} className="activity-item">
                      <div className="activity-dot-line">
                        <div className="activity-marker" />
                      </div>
                      <div className="activity-info">
                        <strong>{l.action}</strong>: {l.detail}
                        <small>{l.timestamp} · {l.user}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
