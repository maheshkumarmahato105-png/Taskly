"use client";

import React, { useState } from "react";
import { BrandLogo, BrandMark } from "@/components/ui/BrandLogo";
import type { SystemSettings as SystemSettingsType } from "@/types/task";

interface SystemSettingsProps {
  settings: SystemSettingsType;
  onSave: (newSettings: SystemSettingsType) => void;
}

export function SystemSettings({ settings, onSave }: SystemSettingsProps) {
  const [appName, setAppName] = useState(settings.appName || "EasyMyLearning");
  const [brandColor, setBrandColor] = useState(settings.brandColor || "#FFAA00");
  const [companyName, setCompanyName] = useState(settings.companyName || "EasyMyLearning Inc.");
  const [supportEmail, setSupportEmail] = useState(settings.supportEmail || "support@easymylearning.com");
  const [defaultView, setDefaultView] = useState<"list" | "kanban">(settings.defaultView || "list");
  const [auditEnabled, setAuditEnabled] = useState(settings.auditEnabled ?? true);

  function handleSave() {
    onSave({
      appName,
      brandColor,
      theme: settings.theme || "light",
      defaultView,
      auditEnabled,
      companyName,
      supportEmail,
    });
  }

  return (
    <div className="settings-card">
      <div className="settings-section">
        <div className="settings-section-title">Brand Appearance & Identity</div>

        <div className="settings-row" style={{ alignItems: "flex-start" }}>
          <div className="settings-row-text">
            <strong>Brand Logo & Mark Preview</strong>
            <p>Official graduation cap + task completion vector mark for desktop & mobile.</p>
          </div>
          <div
            style={{
              background: "#0F172A",
              padding: "14px 18px",
              borderRadius: "12px",
              border: "1px solid #1E293B",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              minWidth: "260px",
            }}
          >
            <BrandLogo brandName={appName} subTitle="Task Manager" badge="ENTERPRISE" />
            <div style={{ display: "flex", alignItems: "center", gap: "12px", borderTop: "1px solid #1E293B", paddingTop: "8px" }}>
              <span style={{ fontSize: "10px", color: "#64748B" }}>Icon Mark:</span>
              <BrandMark size={26} />
              <span style={{ fontSize: "10px", color: "#64748B", marginLeft: "auto" }}>SVG & Retina Ready</span>
            </div>
          </div>
        </div>

        <div className="settings-row">
          <div className="settings-row-text">
            <strong>Platform Name</strong>
            <p>Displayed on topbar, emails and client headers.</p>
          </div>
          <input
            type="text"
            className="form-input"
            style={{ width: "240px" }}
            value={appName}
            onChange={e => setAppName(e.target.value)}
          />
        </div>

        <div className="settings-row">
          <div className="settings-row-text">
            <strong>Primary Brand Color</strong>
            <p>Core brand highlight color (Default: #FFAA00)</p>
          </div>
          <div className="brand-color-preview-box">
            <input
              type="color"
              value={brandColor}
              className="color-swatch"
              onChange={e => setBrandColor(e.target.value)}
            />
            <span style={{ fontFamily: "monospace", fontSize: "12px", fontWeight: 700 }}>
              {brandColor}
            </span>
          </div>
        </div>

        <div className="settings-row">
          <div className="settings-row-text">
            <strong>Company / Organization Name</strong>
            <p>Parent entity name for legal, report footers, and billing.</p>
          </div>
          <input
            type="text"
            className="form-input"
            style={{ width: "240px" }}
            value={companyName}
            onChange={e => setCompanyName(e.target.value)}
          />
        </div>

        <div className="settings-row">
          <div className="settings-row-text">
            <strong>Support Contact Email</strong>
            <p>Email address for system notifications and help requests.</p>
          </div>
          <input
            type="email"
            className="form-input"
            style={{ width: "240px" }}
            value={supportEmail}
            onChange={e => setSupportEmail(e.target.value)}
          />
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-title">Operational Settings</div>
        <div className="settings-row">
          <div className="settings-row-text">
            <strong>Default Task View</strong>
            <p>Initial landing view when opening tasks.</p>
          </div>
          <select
            className="form-select"
            style={{ width: "180px" }}
            value={defaultView}
            onChange={e => setDefaultView(e.target.value as "list" | "kanban")}
          >
            <option value="list">Table View</option>
            <option value="kanban">Kanban Board</option>
          </select>
        </div>

        <div className="settings-row">
          <div className="settings-row-text">
            <strong>Audit Logging</strong>
            <p>Record all task creations, inline updates, and removals.</p>
          </div>
          <input
            type="checkbox"
            checked={auditEnabled}
            onChange={e => setAuditEnabled(e.target.checked)}
            style={{ width: "18px", height: "18px", accentColor: "var(--primary)" }}
          />
        </div>
      </div>

      <button className="btn btn-primary" onClick={handleSave}>
        Save Configuration
      </button>
    </div>
  );
}
