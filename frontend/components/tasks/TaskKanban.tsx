"use client";

import React from "react";
import type { Lookup, Task, TaskStatus } from "@/types/task";

interface TaskKanbanProps {
  tasks: Task[];
  categories: Lookup[];
  onOpenDetails: (task: Task) => void;
  onAddTask: (status: TaskStatus) => void;
  onMoveTask: (task: Task, newStatus: TaskStatus) => void;
}

export function TaskKanban({ tasks, categories, onOpenDetails, onAddTask, onMoveTask }: TaskKanbanProps) {
  const columns: TaskStatus[] = ["Not Started", "In Progress", "Completed"];

  function getCategoryColor(catName: string) {
    const cat = categories.find(c => c.name.toLowerCase() === catName.toLowerCase());
    return cat?.color || "#64748B";
  }

  function formatDisplayDate(iso?: string | null) {
    if (!iso) return "No date";
    const parts = iso.split("-");
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const m = months[parseInt(parts[1], 10) - 1] || parts[1];
    return `${m} ${parts[2]}`;
  }

  return (
    <div className="kanban-view-container show">
      {columns.map(status => {
        const colTasks = tasks.filter(t => t.status === status);
        const cssStatus = status.toLowerCase().replace(/\s+/g, "-");

        return (
          <div key={status} className="kanban-column">
            <div className="kanban-column-header">
              <div className="kanban-column-title">
                <span className={`status-badge ${cssStatus}`} style={{ padding: "3px 8px", borderRadius: "6px" }}>
                  {status}
                </span>
              </div>
              <span className="kanban-count-pill">{colTasks.length}</span>
            </div>

            <div className="kanban-card-list">
              {colTasks.map(task => {
                const catColor = getCategoryColor(task.category);

                return (
                  <div
                    key={task.id}
                    className="kanban-card"
                    onClick={() => onOpenDetails(task)}
                  >
                    <div className="kanban-card-top">
                      <span className={`priority-badge ${task.priority.toLowerCase()}`} style={{ padding: "2px 7px", borderRadius: "5px", fontSize: "9px" }}>
                        {task.priority}
                      </span>
                      <div className="category-pill" style={{ fontSize: "10px" }}>
                        <span className="category-dot" style={{ background: catColor, width: "6px", height: "6px" }} />
                        {task.category}
                      </div>
                    </div>

                    <div className="kanban-card-title">{task.title}</div>
                    {task.description && <div className="kanban-card-desc">{task.description}</div>}

                    <div className="kanban-card-footer">
                      <div className="kanban-footer-left">
                        <span className="due-pill" style={{ fontSize: "10px" }}>
                          {formatDisplayDate(task.dueDate)}
                        </span>
                        {task.checklists && task.checklists.length > 0 && (
                          <span>☑ {task.checklists.filter(c => c.done).length}/{task.checklists.length}</span>
                        )}
                      </div>
                      {task.assignee && (
                        <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--ink)" }}>
                          👤 {task.assignee}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button className="kanban-add-btn" onClick={() => onAddTask(status)}>
              + Add Card
            </button>
          </div>
        );
      })}
    </div>
  );
}
