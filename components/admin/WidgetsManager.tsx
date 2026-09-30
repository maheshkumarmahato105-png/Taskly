"use client";

import React from "react";
import type { DashboardWidgetConfig } from "@/types/task";
import { LayoutGrid, Eye, EyeOff } from "lucide-react";

interface WidgetsManagerProps {
  widgets: DashboardWidgetConfig[];
  onToggleWidget: (id: string) => void;
}

export function WidgetsManager({ widgets, onToggleWidget }: WidgetsManagerProps) {
  return (
    <div className="settings-card">
      <div className="settings-section-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>Configurable Dashboard Widgets (PDF Page 5 & 6)</span>
        <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 400 }}>
          Manage per-user or global dashboard widget layouts.
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {widgets.map(w => (
          <div
            key={w.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
              background: w.enabled ? "#FAFBFC" : "#F1F5F9",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              opacity: w.enabled ? 1 : 0.65,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: w.enabled ? "rgba(255, 170, 0, 0.15)" : "#E2E8F0",
                  color: w.enabled ? "#FFAA00" : "#94A3B8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <LayoutGrid size={16} />
              </div>
              <div>
                <strong style={{ fontSize: "13px", color: "var(--ink)", display: "block" }}>{w.name}</strong>
                <p style={{ margin: "2px 0 0", fontSize: "11px", color: "var(--muted)" }}>{w.description}</p>
              </div>
            </div>

            <button
              onClick={() => onToggleWidget(w.id)}
              className={w.enabled ? "btn btn-secondary" : "btn btn-primary"}
              style={{ height: "32px", padding: "0 12px", fontSize: "11px", gap: "6px" }}
            >
              {w.enabled ? (
                <>
                  <EyeOff size={13} /> Disable Widget
                </>
              ) : (
                <>
                  <Eye size={13} /> Enable Widget
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
