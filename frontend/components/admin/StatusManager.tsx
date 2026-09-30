"use client";

import React from "react";
import type { Lookup } from "@/types/task";

interface StatusManagerProps {
  statuses: Lookup[];
}

export function StatusManager({ statuses }: StatusManagerProps) {
  return (
    <div className="panel-card" style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div>
          <h3 style={{ fontSize: "16px", fontWeight: 800 }}>Workflow Statuses</h3>
          <p style={{ fontSize: "12px", color: "var(--muted)", marginTop: "2px" }}>
            Configure stages tasks move through from creation to completion.
          </p>
        </div>
      </div>

      <table className="config-table">
        <thead>
          <tr>
            <th>Status Name</th>
            <th>Code</th>
            <th>Badge Preview</th>
          </tr>
        </thead>
        <tbody>
          {statuses.map(s => (
            <tr key={s.id}>
              <td><strong>{s.name}</strong></td>
              <td><span style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--muted)" }}>{s.code || s.name.toUpperCase().replace(/\s+/g, "_")}</span></td>
              <td>
                <span className={`status-badge ${s.name.toLowerCase().replace(/\s+/g, "-")}`} style={{ padding: "4px 8px", borderRadius: "6px" }}>
                  {s.name}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
