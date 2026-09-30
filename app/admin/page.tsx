"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { CategoryManager } from "@/components/admin/CategoryManager";
import { StatusManager } from "@/components/admin/StatusManager";
import { SystemSettings } from "@/components/admin/SystemSettings";
import { CustomFieldsManager } from "@/components/admin/CustomFieldsManager";
import { WidgetsManager } from "@/components/admin/WidgetsManager";
import { RolesManager } from "@/components/admin/RolesManager";
import { DatabaseOperations } from "@/components/admin/DatabaseOperations";
import { ArchitectureModal } from "@/components/layout/ArchitectureModal";
import { ShortcutsModal } from "@/components/layout/ShortcutsModal";
import { toast } from "@/components/ui/Toast";
import {
  loadStoredCategories,
  saveStoredCategories,
  loadStoredStatuses,
  saveStoredStatuses,
  loadStoredPriorities,
  loadStoredSettings,
  saveStoredSettings,
  loadStoredUsers,
  saveStoredUsers,
  loadStoredCustomFields,
  saveStoredCustomFields,
  loadStoredWidgets,
  saveStoredWidgets,
  loadStoredAuditLogs,
  loadStoredTasks,
  calculateSummary,
} from "@/lib/store";
import type {
  Lookup,
  SystemSettings as SystemSettingsType,
  UserAccount,
  AuditLogItem,
  CustomFieldDefinition,
  DashboardWidgetConfig,
} from "@/types/task";

export default function AdminPage() {
  const [categories, setCategories] = useState<Lookup[]>([]);
  const [statuses, setStatuses] = useState<Lookup[]>([]);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>([]);
  const [widgets, setWidgets] = useState<DashboardWidgetConfig[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [activeTab, setActiveTab] = useState<"categories" | "statuses" | "fields" | "widgets" | "branding" | "users" | "audit">("categories");
  const [settings, setSettings] = useState<SystemSettingsType>({
    appName: "EasyMyLearning",
    brandColor: "#FFAA00",
    theme: "light",
    defaultView: "list",
    auditEnabled: true,
    companyName: "EasyMyLearning Inc.",
    supportEmail: "support@easymylearning.com",
  });

  const [archModalOpen, setArchModalOpen] = useState(false);
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);

  useEffect(() => {
    setCategories(loadStoredCategories());
    setStatuses(loadStoredStatuses());
    setUsers(loadStoredUsers());
    setCustomFields(loadStoredCustomFields());
    setWidgets(loadStoredWidgets());
    setAuditLogs(loadStoredAuditLogs());
    setSettings(loadStoredSettings());
  }, []);

  function handleAddCategory(newCat: { name: string; color: string }) {
    const updated = [...categories, { id: "cat-" + Date.now(), ...newCat }];
    setCategories(updated);
    saveStoredCategories(updated);
    toast.success("Category Added", `'${newCat.name}' has been created`);
  }

  function handleDeleteCategory(id: string) {
    const cat = categories.find(c => c.id === id);
    const updated = categories.filter(c => c.id !== id);
    setCategories(updated);
    saveStoredCategories(updated);
    toast.info("Category Deleted", cat ? `'${cat.name}' removed` : "Category removed");
  }

  function handleAddCustomField(field: Omit<CustomFieldDefinition, "id">) {
    const updated = [...customFields, { id: "cf-" + Date.now(), ...field }];
    setCustomFields(updated);
    saveStoredCustomFields(updated);
    toast.success("Custom Field Created", `'${field.name}' dynamic field added`);
  }

  function handleDeleteCustomField(id: string) {
    const f = customFields.find(cf => cf.id === id);
    const updated = customFields.filter(f => f.id !== id);
    setCustomFields(updated);
    saveStoredCustomFields(updated);
    toast.info("Custom Field Deleted", f ? `'${f.name}' field removed` : "Field removed");
  }

  function handleToggleWidget(id: string) {
    const updated = widgets.map(w => w.id === id ? { ...w, enabled: !w.enabled } : w);
    const w = updated.find(item => item.id === id);
    setWidgets(updated);
    saveStoredWidgets(updated);
    toast.success("Widget Updated", `${w?.name || "Widget"} is now ${w?.enabled ? "visible" : "hidden"}`);
  }

  function handleAddUser(user: UserAccount) {
    const updated = [...users, user];
    setUsers(updated);
    saveStoredUsers(updated);
    toast.success("User Added", `'${user.name}' (${user.role}) added`);
  }

  function handleUpdateRole(id: string, role: UserAccount["role"]) {
    const updated = users.map(u => u.id === id ? { ...u, role } : u);
    const u = updated.find(user => user.id === id);
    setUsers(updated);
    saveStoredUsers(updated);
    toast.success("Role Updated", `${u?.name || "User"} permission updated to ${role}`);
  }

  const tasks = typeof window !== "undefined" ? loadStoredTasks() : [];
  const summary = calculateSummary(tasks);

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
        brandName={settings.appName}
        onOpenArchitectureModal={() => setArchModalOpen(true)}
      />

      <div className="main-wrapper">
        <Topbar
          breadcrumbTitle="Admin Configuration Console"
          onOpenArchitecture={() => setArchModalOpen(true)}
          onHelpClick={() => setShortcutsModalOpen(true)}
        />

        <main className="content-area">
          <div className="hero">
            <div>
              <div className="hero-tag">CONFIGURABLE SYSTEM GOVERNANCE (PDF PAGE 6)</div>
              <h1 className="hero-title">Admin Configuration Console</h1>
              <p className="hero-desc">
                Configure statuses, priorities, task categories, dashboard widgets, branding, and custom fields without rebuilding.
              </p>
            </div>
            <div className="hero-controls">
              <button className="btn btn-secondary" onClick={() => setArchModalOpen(true)}>
                Architecture Plan
              </button>
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
                className={`admin-tab-btn ${activeTab === "fields" ? "active" : ""}`}
                onClick={() => setActiveTab("fields")}
              >
                Custom Fields
              </button>
              <button
                className={`admin-tab-btn ${activeTab === "widgets" ? "active" : ""}`}
                onClick={() => setActiveTab("widgets")}
              >
                Dashboard Widgets
              </button>
              <button
                className={`admin-tab-btn ${activeTab === "branding" ? "active" : ""}`}
                onClick={() => setActiveTab("branding")}
              >
                Branding &amp; Settings
              </button>
              <button
                className={`admin-tab-btn ${activeTab === "users" ? "active" : ""}`}
                onClick={() => setActiveTab("users")}
              >
                Users &amp; Roles
              </button>
              <button
                className={`admin-tab-btn ${activeTab === "audit" ? "active" : ""}`}
                onClick={() => setActiveTab("audit")}
              >
                Audit &amp; Database
              </button>
            </div>

            {activeTab === "categories" && (
              <CategoryManager
                categories={categories}
                taskCountsByCategory={{
                  Operations: tasks.filter(t => t.category === "Operations").length,
                  Marketing: tasks.filter(t => t.category === "Marketing").length,
                  Study: tasks.filter(t => t.category === "Study").length,
                  Finance: tasks.filter(t => t.category === "Finance").length,
                  Admissions: tasks.filter(t => t.category === "Admissions").length,
                  Work: tasks.filter(t => t.category === "Work").length,
                  Personal: tasks.filter(t => t.category === "Personal").length,
                }}
                onAddCategory={handleAddCategory}
                onDeleteCategory={handleDeleteCategory}
              />
            )}

            {activeTab === "statuses" && (
              <StatusManager statuses={statuses} />
            )}

            {activeTab === "fields" && (
              <CustomFieldsManager
                fields={customFields}
                onAddField={handleAddCustomField}
                onDeleteField={handleDeleteCustomField}
              />
            )}

            {activeTab === "widgets" && (
              <WidgetsManager
                widgets={widgets}
                onToggleWidget={handleToggleWidget}
              />
            )}

            {activeTab === "branding" && (
              <SystemSettings
                settings={settings}
                onSave={newS => {
                  setSettings(newS);
                  saveStoredSettings(newS);
                  toast.success("Settings Saved", "System settings and branding updated successfully");
                }}
              />
            )}

            {activeTab === "users" && (
              <RolesManager
                users={users}
                onAddUser={handleAddUser}
                onUpdateRole={handleUpdateRole}
              />
            )}

            {activeTab === "audit" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <DatabaseOperations />

                <div className="panel-card" style={{ padding: "20px" }}>
                  <div className="settings-section-title" style={{ marginBottom: "14px" }}>
                    Task Activity Logs (Audit Trail)
                  </div>
                  <div className="activity-stream">
                    {auditLogs.map(l => (
                      <div key={l.id} className="activity-item">
                        <div className="activity-dot-line">
                          <div className="activity-marker" style={{ background: "#FFAA00" }} />
                        </div>
                        <div className="activity-info">
                          <strong>{l.action}</strong>: {l.detail}
                          <small>{l.timestamp} · {l.user}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <ArchitectureModal isOpen={archModalOpen} onClose={() => setArchModalOpen(false)} />
      <ShortcutsModal isOpen={shortcutsModalOpen} onClose={() => setShortcutsModalOpen(false)} />
    </div>
  );
}
