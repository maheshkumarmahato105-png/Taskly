"use client";

import React from "react";
import { X, Command } from "lucide-react";

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: "N", desc: "Open modal to create a new task" },
    { key: "/", desc: "Focus task search filter bar" },
    { key: "K", desc: "Toggle between Table and Kanban view" },
    { key: "?", desc: "Show keyboard shortcuts reference" },
    { key: "Esc", desc: "Close active drawer, modal, or dropdown" },
  ];

  return (
    <div className="modal-overlay show" onClick={onClose} style={{ zIndex: 120 }}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: "460px" }}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: "rgba(255, 170, 0, 0.15)", color: "#FFAA00", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Command size={16} />
            </div>
            <div>
              <h2 style={{ fontSize: "15px" }}>Keyboard Shortcuts</h2>
              <p style={{ fontSize: "11px" }}>Power-user productivity shortcuts (PDF Page 7)</p>
            </div>
          </div>
          <button className="drawer-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: "16px 20px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {shortcuts.map(s => (
              <div
                key={s.key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  background: "#F8FAFC",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                }}
              >
                <span style={{ fontSize: "12px", color: "var(--ink-2)" }}>{s.desc}</span>
                <kbd
                  style={{
                    background: "#fff",
                    border: "1px solid #CBD5E1",
                    borderRadius: "6px",
                    boxShadow: "0 2px 0 #CBD5E1",
                    padding: "3px 8px",
                    fontFamily: "monospace",
                    fontSize: "12px",
                    fontWeight: 800,
                    color: "var(--ink)",
                  }}
                >
                  {s.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
