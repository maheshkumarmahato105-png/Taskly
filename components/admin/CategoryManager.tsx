"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowUp, ArrowDown, ArrowUpDown, Sparkles, RotateCcw } from "lucide-react";
import type { Lookup } from "@/types/task";
import { DEFAULT_CATEGORIES } from "@/lib/store";

interface CategoryManagerProps {
  categories: Lookup[];
  taskCountsByCategory: Record<string, number>;
  onAddCategory: (category: { name: string; color: string }) => void;
  onDeleteCategory: (id: string) => void;
  onReorderCategories?: (categories: Lookup[]) => void;
}

export function CategoryManager({
  categories,
  taskCountsByCategory,
  onAddCategory,
  onDeleteCategory,
  onReorderCategories,
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

  function handleMoveUp(index: number) {
    if (index === 0) return;
    const next = [...categories];
    const temp = next[index - 1];
    next[index - 1] = next[index];
    next[index] = temp;
    const updated = next.map((c, i) => ({ ...c, sortOrder: i + 1 }));
    onReorderCategories?.(updated);
  }

  function handleMoveDown(index: number) {
    if (index === categories.length - 1) return;
    const next = [...categories];
    const temp = next[index + 1];
    next[index + 1] = next[index];
    next[index] = temp;
    const updated = next.map((c, i) => ({ ...c, sortOrder: i + 1 }));
    onReorderCategories?.(updated);
  }

  function handleSortAZ() {
    const next = [...categories].sort((a, b) => a.name.localeCompare(b.name));
    const updated = next.map((c, i) => ({ ...c, sortOrder: i + 1 }));
    onReorderCategories?.(updated);
  }

  function handleSortByTasks() {
    const next = [...categories].sort((a, b) => (taskCountsByCategory[b.name] || 0) - (taskCountsByCategory[a.name] || 0));
    const updated = next.map((c, i) => ({ ...c, sortOrder: i + 1 }));
    onReorderCategories?.(updated);
  }

  function handleResetDefault() {
    onReorderCategories?.([...DEFAULT_CATEGORIES]);
  }

  return (
    <div className="panel-card" style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h3 style={{ fontSize: "16px", fontWeight: 800 }}>Configurable Task Categories</h3>
          <p style={{ fontSize: "12px", color: "var(--muted)", marginTop: "2px" }}>
            Arrange and organize departments, categories, and business operations across your workspace.
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          {onReorderCategories && (
            <>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: "11px", height: "34px", padding: "0 10px" }}
                onClick={handleSortAZ}
                title="Arrange categories alphabetically (A-Z)"
              >
                <ArrowUpDown size={13} /> Sort A-Z
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: "11px", height: "34px", padding: "0 10px" }}
                onClick={handleSortByTasks}
                title="Arrange categories by most active tasks"
              >
                <Sparkles size={13} style={{ color: "#FFAA00" }} /> Most Active
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: "11px", height: "34px", padding: "0 8px" }}
                onClick={handleResetDefault}
                title="Reset to default category arrangement"
              >
                <RotateCcw size={13} />
              </button>
            </>
          )}
          <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)} style={{ height: "34px" }}>
            {showAdd ? "Close" : "+ Add Category"}
          </button>
        </div>
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
            <th style={{ width: "80px" }}>Order</th>
            <th style={{ width: "45px" }}>Color</th>
            <th>Category Name</th>
            <th>Associated Tasks</th>
            <th style={{ textAlign: "right" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat, index) => (
            <tr key={cat.id}>
              <td>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 700, minWidth: "18px" }}>
                    #{index + 1}
                  </span>
                  {onReorderCategories && (
                    <div style={{ display: "inline-flex", flexDirection: "column", gap: "1px" }}>
                      <button
                        type="button"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        style={{
                          opacity: index === 0 ? 0.3 : 1,
                          cursor: index === 0 ? "not-allowed" : "pointer",
                          padding: "1px 4px",
                          borderRadius: "3px",
                          background: "var(--surface-soft)",
                          lineHeight: 1,
                        }}
                        title="Move Up"
                      >
                        <ArrowUp size={11} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === categories.length - 1}
                        style={{
                          opacity: index === categories.length - 1 ? 0.3 : 1,
                          cursor: index === categories.length - 1 ? "not-allowed" : "pointer",
                          padding: "1px 4px",
                          borderRadius: "3px",
                          background: "var(--surface-soft)",
                          lineHeight: 1,
                        }}
                        title="Move Down"
                      >
                        <ArrowDown size={11} />
                      </button>
                    </div>
                  )}
                </div>
              </td>
              <td>
                <span className="category-dot" style={{ background: cat.color || "#64748B", display: "inline-block" }} />
              </td>
              <td><strong>{cat.name}</strong></td>
              <td>
                <span style={{
                  background: (taskCountsByCategory[cat.name] || 0) > 0 ? "rgba(255,170,0,0.12)" : "transparent",
                  color: (taskCountsByCategory[cat.name] || 0) > 0 ? "#B45309" : "var(--muted)",
                  padding: "2px 7px",
                  borderRadius: "999px",
                  fontSize: "11px",
                  fontWeight: 700,
                }}>
                  {taskCountsByCategory[cat.name] || 0} tasks
                </span>
              </td>
              <td style={{ textAlign: "right" }}>
                <div style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}>
                  <Link
                    href={`/tasks?category=${encodeURIComponent(cat.name)}`}
                    className="btn btn-secondary"
                    style={{ height: "28px", padding: "0 10px", fontSize: "11px", textDecoration: "none", display: "inline-flex", alignItems: "center" }}
                    title={`View only ${cat.name} tasks`}
                  >
                    View Tasks →
                  </Link>
                  <button
                    className="btn btn-secondary"
                    style={{ height: "28px", padding: "0 8px", fontSize: "11px" }}
                    onClick={() => onDeleteCategory(cat.id)}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
