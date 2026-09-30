"use client";

import React from "react";
import { X, CheckCircle, Server, Database, Globe, Shield, Terminal, Layers } from "lucide-react";

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ArchitectureModal({ isOpen, onClose }: ArchitectureModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay show" onClick={onClose} style={{ zIndex: 110 }}>
      <div
        className="modal-card"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: "800px", width: "92%", maxHeight: "90vh", display: "flex", flexDirection: "column" }}
      >
        <div className="modal-header" style={{ background: "linear-gradient(135deg, #1E293B, #0F172A)", color: "#fff" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ background: "#FFAA00", color: "#1E293B", padding: "2px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: 900 }}>
                ARCHITECTURE & DEPLOYMENT PLAN
              </span>
              <span style={{ fontSize: "11px", color: "#94A3B8" }}>EasyMyLearning Task Manager</span>
            </div>
            <h2 style={{ color: "#fff", fontSize: "18px", marginTop: "6px" }}>Full-Stack System Architecture</h2>
            <p style={{ color: "#94A3B8", fontSize: "11px" }}>
              Next.js + React frontend | Go backend | PostgreSQL | Docker | REST API
            </p>
          </div>
          <button className="drawer-close-btn" onClick={onClose} style={{ color: "#fff" }}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ overflowY: "auto", padding: "20px" }}>
          {/* Section 1: Overview */}
          <div style={{ marginBottom: "20px" }}>
            <h4 style={{ fontSize: "14px", fontWeight: 800, color: "var(--ink)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
              <Globe size={16} style={{ color: "#FFAA00" }} /> 1. System Architecture & Topology
            </h4>
            <div style={{ background: "#F8FAFC", border: "1px solid var(--border)", borderRadius: "8px", padding: "12px", fontSize: "12px", fontFamily: "monospace", color: "#334155" }}>
              {"Browser -> Cloudflare (CDN) -> Next.js Application (Vercel / Port 3000)"}<br />
              {"                     `--> Nginx Proxy -> Go REST API (Port 8080)"}<br />
              {"                                           +--> PostgreSQL (Source of Truth)"}<br />
              {"                                           +--> Redis (Queue / Cache)"}<br />
              {"                                           `--> S3 / Cloudflare R2 (Attachments)"}
            </div>
          </div>

          {/* Section 2: Production Domains */}
          <div style={{ marginBottom: "20px" }}>
            <h4 style={{ fontSize: "14px", fontWeight: 800, color: "var(--ink)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
              <Server size={16} style={{ color: "#2563EB" }} /> 2. Target Production Domains
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div style={{ padding: "10px", background: "#EFF6FF", borderRadius: "8px", border: "1px solid #BFDBFE" }}>
                <strong style={{ fontSize: "12px", color: "#1E40AF" }}>app.easymylearning.com</strong>
                <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#3B82F6" }}>Next.js UI Application Layer</p>
              </div>
              <div style={{ padding: "10px", background: "#FEF3C7", borderRadius: "8px", border: "1px solid #FDE68A" }}>
                <strong style={{ fontSize: "12px", color: "#92400E" }}>api.easymylearning.com</strong>
                <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#D97706" }}>Go REST API (Business & Auth)</p>
              </div>
            </div>
          </div>

          {/* Section 3: REST API Endpoints */}
          <div style={{ marginBottom: "20px" }}>
            <h4 style={{ fontSize: "14px", fontWeight: 800, color: "var(--ink)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
              <Terminal size={16} style={{ color: "#10B981" }} /> 3. Core Go REST API Endpoints (Implemented)
            </h4>
            <table className="config-table" style={{ fontSize: "11px" }}>
              <thead>
                <tr>
                  <th>Group</th>
                  <th>Methods & Endpoints</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Tasks CRUD</strong></td>
                  <td><code>GET /api/v1/tasks</code> | <code>POST /api/v1/tasks</code> | <code>GET|PUT|DELETE /api/v1/tasks/:id</code></td>
                </tr>
                <tr>
                  <td><strong>Inline Updates</strong></td>
                  <td><code>PATCH /api/v1/tasks/:id/status | /priority | /category | /due-date</code></td>
                </tr>
                <tr>
                  <td><strong>Dashboard</strong></td>
                  <td><code>GET /api/v1/dashboard/summary</code> | <code>GET /api/v1/dashboard/upcoming</code></td>
                </tr>
                <tr>
                  <td><strong>Config & Reference</strong></td>
                  <td><code>GET /task-categories</code> | <code>GET /task-statuses</code> | <code>GET /task-priorities</code></td>
                </tr>
                <tr>
                  <td><strong>System Health</strong></td>
                  <td><code>GET /health</code> (Status: healthy)</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 4: Database Model */}
          <div style={{ marginBottom: "20px" }}>
            <h4 style={{ fontSize: "14px", fontWeight: 800, color: "var(--ink)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
              <Database size={16} style={{ color: "#8B5CF6" }} /> 4. PostgreSQL Normalized Schema (15 Tables)
            </h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {[
                "users", "roles / user_roles", "task_categories", "task_statuses", "task_priorities",
                "tasks", "task_checklists", "task_comments", "task_attachments", "task_activity_logs",
                "notifications", "user_preferences", "dashboard_widgets", "custom_fields", "system_settings"
              ].map(t => (
                <span key={t} style={{ background: "#F1F5F9", border: "1px solid #CBD5E1", padding: "3px 8px", borderRadius: "6px", fontSize: "11px", fontFamily: "monospace" }}>
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Section 5: Preserved Principles */}
          <div style={{ background: "rgba(255, 170, 0, 0.08)", border: "1px solid #FFD36B", borderRadius: "8px", padding: "12px" }}>
            <strong style={{ fontSize: "12px", color: "var(--brand-dark)", display: "flex", alignItems: "center", gap: "6px" }}>
              <CheckCircle size={14} /> Core Architectural Principle
            </strong>
            <p style={{ margin: "4px 0 0", fontSize: "11px", color: "var(--ink-2)", lineHeight: 1.5 }}>
              "Anything an administrator may reasonably want to change later should be represented as configuration/data instead of being hardcoded into the frontend." — EasyMyLearning Architecture Plan (Page 1)
            </p>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>
            Close Plan Specs
          </button>
        </div>
      </div>
    </div>
  );
}
