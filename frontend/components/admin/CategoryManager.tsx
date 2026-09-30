"use client";

import React, { useState } from "react";
import type { Lookup } from "@/types/task";

interface CategoryManagerProps {
  categories: Lookup[];
  taskCountsByCategory: Record<string, number>;
  onAddCategory: (category: { name: string; color: string }) => void;
  onDeleteCategory: (id: string) => void;
}

export function CategoryManager({
  categories,
  taskCountsByCategory,
  onAddCategory,
  onDeleteCategory,
}: CategoryManagerProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#3B82F6");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onAddCategory({ name: name.trim(), color });
    setName("");
    setShowAdd(false);
  }

  return (
    <div className="panel-card" style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div>
          <h3 style={{ fontSize: "16px", fontWeight: 800 }}>Configurable Task Categories</h3>
          <p style={{ fontSize: "12px", color: "var(--muted)", marginTop: "2px" }}>
            Categories define departments and business operations across your workspace.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? "Close" : "+ Add Category"}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleSubmit} style={{ background: "var(--surface-soft)", padding: "14px", borderRadius: "8px", marginBottom: "16px" }}>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <input
              type="text"
              className="form-input"
              placeholder="Category name..."
              value={name}
              onChange={e => setName(e.target.value)}
              style={{ width: "240px" }}
              autoFocus
            />
            <input
              type="color"
              value={color}
              onChange={e => setColor(e.target.value)}
              className="color-swatch"
            />
            <button type="submit" className="btn btn-primary" style={{ height: "36px" }}>Save</button>
          </div>
        </form>
      )}

      <table className="config-table">
        <thead>
          <tr>
            <th>Color</th>
            <th>Category Name</th>
            <th>Associated Tasks</th>
            <th style={{ textAlign: "right" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map(cat => (
            <tr key={cat.id}>
              <td>
                <span className="category-dot" style={{ background: cat.color || "#64748B", display: "inline-block" }} />
              </td>
              <td><strong>{cat.name}</strong></td>
              <td>{taskCountsByCategory[cat.name] || 0} tasks</td>
              <td style={{ textAlign: "right" }}>
                <button
                  className="btn btn-secondary"
                  style={{ height: "28px", padding: "0 8px", fontSize: "11px" }}
                  onClick={() => onDeleteCategory(cat.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
