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
import { ShortcutsModal } from "@/components/layout/ShortcutsModal";
import { toast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
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
  const [categories, setCategories] = useState<Lookup[]>(() => {
    if (typeof window !== "undefined") return loadStoredCategories();
    return [];
  });
  const [statuses, setStatuses] = useState<Lookup[]>(() => {
    if (typeof window !== "undefined") return loadStoredStatuses();
    return [];
  });
  const [users, setUsers] = useState<UserAccount[]>(() => {
    if (typeof window !== "undefined") return loadStoredUsers();
    return [];
  });
  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>(() => {
    if (typeof window !== "undefined") return loadStoredCustomFields();
    return [];
  });
  const [widgets, setWidgets] = useState<DashboardWidgetConfig[]>(() => {
    if (typeof window !== "undefined") return loadStoredWidgets();
    return [];
  });
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(() => {
    if (typeof window !== "undefined") return loadStoredAuditLogs();
    return [];
  });
  const [activeTab, setActiveTab] = useState<"categories" | "statuses" | "fields" | "widgets" | "branding" | "users" | "audit">("categories");
  const [settings, setSettings] = useState<SystemSettingsType>(() => {
    if (typeof window !== "undefined") return loadStoredSettings();
    return {
      appName: "EasyMyLearning",
      brandColor: "#FFAA00",
      theme: "light",
      defaultView: "list",
      auditEnabled: true,
      companyName: "EasyMyLearning Inc.",
      supportEmail: "support@easymylearning.com",
    };
  });
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
    api.createCategory(newCat).catch(() => {});
  }

  function handleDeleteCategory(id: string) {
    const cat = categories.find(c => c.id === id);
    const updated = categories.filter(c => c.id !== id);
    setCategories(updated);
    saveStoredCategories(updated);
    toast.info("Category Deleted", cat ? `'${cat.name}' removed` : "Category removed");
    api.deleteCategory(id).catch(() => {});
  }

  function handleAddCustomField(field: Omit<CustomFieldDefinition, "id">) {
    const updated = [...customFields, { id: "cf-" + Date.now(), ...field }];
    setCustomFields(updated);
    saveStoredCustomFields(updated);
    toast.success("Custom Field Created", `'${field.name}' dynamic field added`);
    api.createCustomField(field).catch(() => {});
  }

  function handleDeleteCustomField(id: string) {
    const f = customFields.find(cf => cf.id === id);
    const updated = customFields.filter(f => f.id !== id);
    setCustomFields(updated);
    saveStoredCustomFields(updated);
    toast.info("Custom Field Deleted", f ? `'${f.name}' field removed` : "Field removed");
    api.deleteCustomField(id).catch(() => {});
  }

  function handleToggleWidget(id: string) {
    const updated = widgets.map(w => w.id === id ? { ...w, enabled: !w.enabled } : w);
    const w = updated.find(item => item.id === id);
    setWidgets(updated);
    saveStoredWidgets(updated);
    toast.success("Widget Updated", `${w?.name || "Widget"} is now ${w?.enabled ? "visible" : "hidden"}`);
    api.toggleWidget(id).catch(() => {});
  }

  function handleAddUser(user: UserAccount) {
    const updated = [...users, user];
    setUsers(updated);
    saveStoredUsers(updated);
    toast.success("User Added", `'${user.name}' (${user.role}) added`);
    api.createUser(user).catch(() => {});
  }

  function handleUpdateRole(id: string, role: UserAccount["role"]) {
    const updated = users.map(u => u.id === id ? { ...u, role } : u);
    const u = updated.find(user => user.id === id);
    setUsers(updated);
    saveStoredUsers(updated);
    toast.success("Role Updated", `${u?.name || "User"} permission updated to ${role}`);
    api.updateUserRole(id, role).catch(() => {});
  }

  function handleReorderCategories(updated: Lookup[]) {
    setCategories(updated);
    saveStoredCategories(updated);
    toast.success("Categories Arranged", "Category order updated successfully");
    api.reorderCategories(updated.map((c, i) => ({ id: c.id, sortOrder: i + 1 }))).catch(() => {});
  }

  const tasks = typeof window !== "undefined" ? loadStoredTasks() : [];
  const summary = calculateSummary(tasks);
  const taskCounts: Record<string, number> = {};
  tasks.forEach(t => {
    taskCounts[t.category] = (taskCounts[t.category] || 0) + 1;
  });

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
        categoryCounts={taskCounts}
      />

      <div className="main-wrapper">
        <Topbar
          breadcrumbTitle="Admin Configuration Console"
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
                onReorderCategories={handleReorderCategories}
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
                  api.updateSettings(newS as any).catch(() => {});
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

      <ShortcutsModal isOpen={shortcutsModalOpen} onClose={() => setShortcutsModalOpen(false)} />
    </div>
  );
}
