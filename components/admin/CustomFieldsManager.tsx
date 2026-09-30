"use client";

import React, { useState } from "react";
import type { CustomFieldDefinition } from "@/types/task";
import { Plus, Trash2, Calendar, Hash, Type } from "lucide-react";

interface CustomFieldsManagerProps {
  fields: CustomFieldDefinition[];
  onAddField: (field: Omit<CustomFieldDefinition, "id">) => void;
  onDeleteField: (id: string) => void;
}

export function CustomFieldsManager({ fields, onAddField, onDeleteField }: CustomFieldsManagerProps) {
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [type, setType] = useState<"text" | "date" | "number">("text");

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const generatedKey = key.trim() || name.toLowerCase().replace(/\s+/g, "_");
    onAddField({
      name: name.trim(),
      key: generatedKey,
      type,
      placeholder: `Enter ${name.trim()}...`,
      required: false,
    });
    setName("");
    setKey("");
  }

  return (
    <div className="settings-card">
      <div className="settings-section-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>Admin-Defined Dynamic Fields (PDF Page 5 & 6)</span>
        <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 400 }}>
          Changes reflect immediately in task drawer & modals without rebuild.
        </span>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <table className="config-table">
          <thead>
            <tr>
              <th>Field Label</th>
              <th>System Key</th>
              <th>Data Type</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {fields.map(f => (
              <tr key={f.id}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {f.type === "date" ? <Calendar size={14} style={{ color: "#FFAA00" }} /> :
                     f.type === "number" ? <Hash size={14} style={{ color: "#2563EB" }} /> :
                     <Type size={14} style={{ color: "#10B981" }} />}
                    <strong>{f.name}</strong>
                  </div>
                </td>
                <td><code>{f.key}</code></td>
                <td>
                  <span style={{ background: "#F1F5F9", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 700 }}>
                    {f.type.toUpperCase()}
                  </span>
                </td>
                <td style={{ textAlign: "right" }}>
                  <button
                    onClick={() => onDeleteField(f.id)}
                    style={{ background: "none", border: 0, color: "var(--red)", cursor: "pointer", padding: "4px" }}
                    title="Remove custom field"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form onSubmit={handleCreate} style={{ background: "#F8FAFC", border: "1px solid var(--border)", borderRadius: "10px", padding: "16px" }}>
        <strong style={{ fontSize: "12px", color: "var(--ink)", display: "block", marginBottom: "12px" }}>
          + Add New Dynamic Field
        </strong>
        <div className="admin-field-form-grid">
          <div>
            <label style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 700, display: "block", marginBottom: "4px" }}>
              Field Label
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Budget Code"
              value={name}
              onChange={e => {
                setName(e.target.value);
                if (!key) setKey(e.target.value.toLowerCase().replace(/\s+/g, "_"));
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 700, display: "block", marginBottom: "4px" }}>
              Key (snake_case)
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="budget_code"
              value={key}
              onChange={e => setKey(e.target.value)}
            />
          </div>
          <div>
            <label style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 700, display: "block", marginBottom: "4px" }}>
              Field Type
            </label>
            <select className="form-select" value={type} onChange={e => setType(e.target.value as any)}>
              <option value="text">Text</option>
              <option value="date">Date</option>
              <option value="number">Number</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" style={{ height: "39px" }}>
            <Plus size={15} /> Add Field
          </button>
        </div>
      </form>
    </div>
  );
}
