"use client";

import React from "react";
import type { Lookup, Task, TaskStatus } from "@/types/task";
import { ArrowLeft, ArrowRight, Plus } from "lucide-react";

interface TaskKanbanProps {
  tasks: Task[];
  categories: Lookup[];
  onOpenDetails: (task: Task) => void;
  onAddTask: (status: TaskStatus) => void;
  onMoveTask: (task: Task, newStatus: TaskStatus) => void;
}

export function TaskKanban({
  tasks,
  categories,
  onOpenDetails,
  onAddTask,
  onMoveTask,
}: TaskKanbanProps) {
  const columns: { status: TaskStatus; label: string; color: string }[] = [
    { status: "Not Started", label: "Not Started", color: "#64748B" },
    { status: "In Progress", label: "In Progress", color: "#2563EB" },
    { status: "Blocked", label: "Blocked", color: "#EF4444" },
    { status: "Completed", label: "Completed", color: "#10B981" },
  ];

  function getCategoryColor(catName: string) {
    const cat = categories.find(c => c.name.toLowerCase() === catName.toLowerCase());
    return cat?.color || "#64748B";
  }

  const today = new Date().toISOString().slice(0, 10);

  function formatDisplayDate(iso?: string | null) {
    if (!iso) return "No date";
    if (iso === today) return "Today";
    const parts = iso.split("-");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const m = months[parseInt(parts[1], 10) - 1] || parts[1];
    return `${m} ${parts[2]}`;
  }

  function getNextStatus(current: TaskStatus): TaskStatus | null {
    if (current === "Not Started") return "In Progress";
    if (current === "In Progress") return "Completed";
    if (current === "Blocked") return "In Progress";
    return null;
  }

  function getPrevStatus(current: TaskStatus): TaskStatus | null {
    if (current === "Completed") return "In Progress";
    if (current === "In Progress") return "Not Started";
    if (current === "Blocked") return "Not Started";
    return null;
  }

  return (
    <div className="kanban-view-container show">
      {columns.map(col => {
        const colTasks = tasks.filter(t => t.status === col.status);
        const cssStatus = col.status.toLowerCase().replace(/\s+/g, "-");

        return (
          <div
            key={col.status}
            className="kanban-column"
            style={{
              background: "#F8FAFC",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              padding: "14px",
              display: "flex",
              flexDirection: "column",
              minHeight: "450px",
            }}
          >
            <div
              className="kanban-column-header"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "12px",
                paddingBottom: "10px",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: col.color,
                  }}
                />
                <strong style={{ fontSize: "13px", color: "var(--ink)" }}>{col.label}</strong>
              </div>
              <span
                style={{
                  background: "#E2E8F0",
                  color: "#475569",
                  padding: "2px 7px",
                  borderRadius: "10px",
                  fontSize: "11px",
                  fontWeight: 800,
                }}
              >
                {colTasks.length}
              </span>
            </div>

            <div
              className="kanban-card-list"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                flex: 1,
              }}
            >
              {colTasks.map(task => {
                const catColor = getCategoryColor(task.category);
                const isOverdue = task.dueDate && task.dueDate < today && task.status !== "Completed";
                const prev = getPrevStatus(task.status);
                const next = getNextStatus(task.status);

                return (
                  <div
                    key={task.id}
                    className="kanban-card"
                    style={{
                      background: "#fff",
                      border: "1px solid var(--border)",
                      borderRadius: "10px",
                      padding: "12px",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                      cursor: "pointer",
                      transition: "transform 0.15s, box-shadow 0.15s",
                    }}
                    onClick={() => onOpenDetails(task)}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <div className="category-pill" style={{ fontSize: "10px", padding: "2px 8px" }}>
                        <span className="category-dot" style={{ background: catColor, width: "6px", height: "6px" }} />
                        {task.category}
                      </div>

                      <span
                        className={`priority-badge ${task.priority.toLowerCase()}`}
                        style={{ padding: "2px 6px", borderRadius: "5px", fontSize: "9px" }}
                      >
                        {task.priority}
                      </span>
                    </div>

                    <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--ink)", marginBottom: "4px" }}>
                      {task.title}
                    </div>

                    {task.description && (
                      <p
                        style={{
                          fontSize: "11px",
                          color: "var(--muted)",
                          margin: "0 0 8px",
                          overflow: "hidden",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {task.description}
                      </p>
                    )}

                    {task.customFields?.reference_number && (
                      <div style={{ fontSize: "10px", color: "var(--brand-dark)", fontWeight: 700, marginBottom: "6px" }}>
                        #{task.customFields.reference_number}
                      </div>
                    )}

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        paddingTop: "8px",
                        borderTop: "1px solid #F1F5F9",
                        fontSize: "10px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span
                          className={`due-pill ${isOverdue ? "overdue" : ""}`}
                          style={{ fontSize: "10px", padding: "2px 6px" }}
                        >
                          {isOverdue ? "Overdue" : formatDisplayDate(task.dueDate)}
                        </span>
                        {task.checklists && task.checklists.length > 0 && (
                          <span style={{ color: "var(--muted)" }}>
                            ☑ {task.checklists.filter(c => c.done).length}/{task.checklists.length}
                          </span>
                        )}
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        {prev && (
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              onMoveTask(task, prev);
                            }}
                            title={`Move back to ${prev}`}
                            style={{
                              background: "#F1F5F9",
                              border: 0,
                              borderRadius: "4px",
                              padding: "3px",
                              cursor: "pointer",
                              display: "flex",
                            }}
                          >
                            <ArrowLeft size={12} />
                          </button>
                        )}
                        {next && (
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              onMoveTask(task, next);
                            }}
                            title={`Advance to ${next}`}
                            style={{
                              background: "#FFAA00",
                              color: "#fff",
                              border: 0,
                              borderRadius: "4px",
                              padding: "3px",
                              cursor: "pointer",
                              display: "flex",
                            }}
                          >
                            <ArrowRight size={12} />
                          </button>
                        )}
                        <span style={{ fontWeight: 800, color: "var(--ink)", marginLeft: "4px" }}>
                          👤 {task.assignee || "BJ"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              className="kanban-add-btn"
              onClick={() => onAddTask(col.status)}
              style={{
                marginTop: "12px",
                width: "100%",
                padding: "8px",
                border: "1px dashed var(--border)",
                borderRadius: "8px",
                background: "transparent",
                color: "var(--muted)",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              <Plus size={14} /> Add Card
            </button>
          </div>
        );
      })}
    </div>
  );
}
