"use client";

import React, { useState } from "react";
import { Download, Upload, RotateCcw, Database, CheckCircle2 } from "lucide-react";
import { exportBackupJson, importBackupJson, getInitialTasks, saveStoredTasks } from "@/lib/store";
import { toast } from "@/components/ui/Toast";

export function DatabaseOperations() {
  const [copied, setCopied] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  function handleDownloadBackup() {
    const json = exportBackupJson();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `easymylearning_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMsg("Database state exported successfully!");
    toast.success("Database Backup Exported", "Snapshot downloaded as JSON file");
  }

  function handleResetSeed() {
    if (!confirm("Reset database state to original seed data (PDF Page 11)?")) return;
    saveStoredTasks(getInitialTasks());
    setStatusMsg("Database reset to demo seed data. Please refresh to view.");
    toast.info("Database Reset", "Seed data restored to defaults");
    window.location.reload();
  }

  return (
    <div className="settings-card">
      <div className="settings-section-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>Database Initialization & Backup (PDF Page 11)</span>
        <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 400 }}>
          PostgreSQL commands & JSON snapshot tools.
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
        {/* CLI Reference */}
        <div style={{ background: "#1E293B", color: "#F8FAFC", borderRadius: "10px", padding: "16px", fontSize: "12px", fontFamily: "monospace" }}>
          <div style={{ color: "#FFAA00", fontWeight: 700, marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
            <Database size={14} /> PostgreSQL CLI Commands
          </div>
          <div style={{ color: "#94A3B8" }}># Initialize Schema</div>
          <div style={{ color: "#38BDF8", marginBottom: "8px" }}>
            psql &quot;$DATABASE_URL&quot; -f database/migrations/001_init.sql
          </div>
          <div style={{ color: "#94A3B8" }}># Seed Reference Data</div>
          <div style={{ color: "#38BDF8", marginBottom: "8px" }}>
            psql &quot;$DATABASE_URL&quot; -f database/seeds/001_seed.sql
          </div>
          <div style={{ color: "#94A3B8" }}># Backup Database</div>
          <div style={{ color: "#38BDF8" }}>
            pg_dump &quot;$DATABASE_URL&quot; &gt; backups/easymylearning_tasks_TIMESTAMP.sql
          </div>
        </div>

        {/* Browser Backup Snapshot */}
        <div style={{ background: "#FAFBFC", border: "1px solid var(--border)", borderRadius: "10px", padding: "16px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <strong style={{ fontSize: "13px", color: "var(--ink)", display: "block" }}>
              Snapshot &amp; Backup Operations
            </strong>
            <p style={{ margin: "4px 0 14px", fontSize: "11px", color: "var(--muted)" }}>
              Export current full relational state including tasks, categories, statuses, custom fields, and audit trail.
            </p>
          </div>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button className="btn btn-primary" onClick={handleDownloadBackup} style={{ gap: "6px" }}>
              <Download size={14} /> Export Backup JSON
            </button>
            <button className="btn btn-secondary" onClick={handleResetSeed} style={{ gap: "6px" }}>
              <RotateCcw size={14} /> Reset Seed Data
            </button>
          </div>

          {statusMsg && (
            <div style={{ marginTop: "10px", fontSize: "11px", color: "#10B981", display: "flex", alignItems: "center", gap: "4px", fontWeight: 700 }}>
              <CheckCircle2 size={13} /> {statusMsg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
