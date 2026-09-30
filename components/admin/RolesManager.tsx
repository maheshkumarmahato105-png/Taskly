"use client";

import React, { useState } from "react";
import type { UserAccount } from "@/types/task";
import { Plus, ShieldCheck, UserCheck } from "lucide-react";

interface RolesManagerProps {
  users: UserAccount[];
  onAddUser: (user: UserAccount) => void;
  onUpdateRole: (id: string, newRole: UserAccount["role"]) => void;
}

export function RolesManager({ users, onAddUser, onUpdateRole }: RolesManagerProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserAccount["role"]>("Full-Stack Dev");

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    const initials = name
      .split(" ")
      .map(p => p[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    onAddUser({
      id: "usr-" + Date.now(),
      name: name.trim(),
      email: email.trim(),
      role,
      status: "Active",
      avatar: initials,
    });
    setName("");
    setEmail("");
  }

  const permissionsMatrix = [
    { role: "Lead Admin", tasksCrud: "Full", statusInline: "Yes", adminConfig: "Yes", exportData: "Yes" },
    { role: "Project Manager", tasksCrud: "Full", statusInline: "Yes", adminConfig: "Partial", exportData: "Yes" },
    { role: "Full-Stack Dev", tasksCrud: "Create/Edit", statusInline: "Yes", adminConfig: "Read-only", exportData: "No" },
    { role: "Product Designer", tasksCrud: "Create/Edit", statusInline: "Yes", adminConfig: "Read-only", exportData: "No" },
    { role: "QA Engineer", tasksCrud: "Create/Edit", statusInline: "Yes", adminConfig: "Read-only", exportData: "No" },
    { role: "Viewer", tasksCrud: "Read-only", statusInline: "No", adminConfig: "No", exportData: "No" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Users List */}
      <div className="settings-card">
        <div className="settings-section-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Active Users & Profile Accounts</span>
          <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 400 }}>
            PostgreSQL: <code>users</code> & <code>user_roles</code>
          </span>
        </div>

        <table className="config-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Email</th>
              <th>Assigned Role (RBAC)</th>
              <th>Account Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #FFAA00, #E68A00)",
                        color: "#1E293B",
                        fontSize: "11px",
                        fontWeight: 800,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {u.avatar || u.name.slice(0, 2).toUpperCase()}
                    </span>
                    <strong>{u.name}</strong>
                  </div>
                </td>
                <td>{u.email}</td>
                <td>
                  <select
                    className="form-select"
                    style={{ width: "160px", height: "32px", fontSize: "11px" }}
                    value={u.role}
                    onChange={e => onUpdateRole(u.id, e.target.value as any)}
                  >
                    <option value="Lead Admin">Lead Admin</option>
                    <option value="Project Manager">Project Manager</option>
                    <option value="Full-Stack Dev">Full-Stack Dev</option>
                    <option value="Product Designer">Product Designer</option>
                    <option value="QA Engineer">QA Engineer</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                </td>
                <td>
                  <span style={{ color: "#10B981", fontWeight: 700, fontSize: "11px", display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10B981" }} />
                    {u.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Add User Form */}
        <form onSubmit={handleCreate} style={{ marginTop: "16px", background: "#F8FAFC", border: "1px solid var(--border)", borderRadius: "8px", padding: "14px" }}>
          <strong style={{ fontSize: "12px", color: "var(--ink)", display: "block", marginBottom: "10px" }}>
            + Invite New Team Member
          </strong>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 160px auto", gap: "10px" }}>
            <input
              type="text"
              className="form-input"
              placeholder="Full name..."
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <input
              type="email"
              className="form-input"
              placeholder="Work email address..."
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <select className="form-select" value={role} onChange={e => setRole(e.target.value as any)}>
              <option value="Full-Stack Dev">Full-Stack Dev</option>
              <option value="Lead Admin">Lead Admin</option>
              <option value="Project Manager">Project Manager</option>
              <option value="Product Designer">Product Designer</option>
              <option value="QA Engineer">QA Engineer</option>
              <option value="Viewer">Viewer</option>
            </select>
            <button type="submit" className="btn btn-primary" style={{ height: "39px" }}>
              <Plus size={15} /> Invite
            </button>
          </div>
        </form>
      </div>

      {/* Role-Based Permissions Matrix */}
      <div className="settings-card">
        <div className="settings-section-title">
          <span>Role-Based Access Control (RBAC) Matrix (PDF Page 5 & 9)</span>
        </div>
        <table className="config-table">
          <thead>
            <tr>
              <th>Role</th>
              <th>Task CRUD</th>
              <th>Inline Status Edit</th>
              <th>Admin Config</th>
              <th>Export Backups</th>
            </tr>
          </thead>
          <tbody>
            {permissionsMatrix.map(p => (
              <tr key={p.role}>
                <td><strong>{p.role}</strong></td>
                <td>{p.tasksCrud}</td>
                <td>{p.statusInline}</td>
                <td>{p.adminConfig}</td>
                <td>{p.exportData}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
