"use client";

import React from "react";
import type { Lookup, Task, TaskPriority, TaskStatus } from "@/types/task";
import { Pencil, Trash2 } from "lucide-react";

interface TaskTableProps {
  tasks: Task[];
  statuses: Lookup[];
  categories: Lookup[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string, e: React.MouseEvent) => void;
  onSelectAll: () => void;
  onOpenDetails: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onChangeStatus: (task: Task, status: TaskStatus) => void;
  onChangePriority: (task: Task, priority: TaskPriority) => void;
}

export function TaskTable({
  tasks,
  statuses,
  categories,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onOpenDetails,
  onEdit,
  onDelete,
  onChangeStatus,
  onChangePriority,
}: TaskTableProps) {
  function getCategoryColor(catName: string) {
    const cat = categories.find(c => c.name.toLowerCase() === catName.toLowerCase());
    return cat?.color || "#64748B";
  }

  function isOverdue(task: Task) {
    if (task.status === "Completed" || !task.dueDate) return false;
    const today = new Date().toISOString().slice(0, 10);
    return task.dueDate < today;
  }

  function formatDisplayDate(iso?: string | null) {
    if (!iso) return "No date";
    const today = new Date().toISOString().slice(0, 10);
    if (iso === today) return "Today";
    const parts = iso.split("-");
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const m = months[parseInt(parts[1], 10) - 1] || parts[1];
    return `${m} ${parts[2]}`;
  }

  const allSelected = tasks.length > 0 && tasks.every(t => selectedIds.has(t.id));

  return (
    <div className="task-table-wrapper">
      <div className="task-table-head">
        <div className="task-check-cell">
          <button
            className={`custom-checkbox ${allSelected ? "checked" : ""}`}
            onClick={onSelectAll}
            title="Select all"
          >
            {allSelected ? "✓" : ""}
          </button>
        </div>
        <span>Task / Description</span>
        <span className="status-cell-col">Status</span>
        <span className="priority-cell-col">Priority</span>
        <span className="due-cell-col">Due Date</span>
        <span className="category-cell-col">Category</span>
        <span style={{ textAlign: "right" }}>Actions</span>
      </div>

      <div id="taskTableBody">
        {tasks.map(task => {
          const isDone = task.status === "Completed";
          const overdue = isOverdue(task);
          const isSelected = selectedIds.has(task.id);
          const catColor = getCategoryColor(task.category);

          return (
            <div key={task.id} className={`task-table-row ${isDone ? "is-complete" : ""}`}>
              <div className="task-check-cell">
                <button
                  className={`custom-checkbox ${isSelected ? "checked" : ""}`}
                  onClick={e => onToggleSelect(task.id, e)}
                  title="Select for bulk action"
                >
                  {isSelected ? "✓" : ""}
                </button>
              </div>

              <div className="task-info-cell" onClick={() => onOpenDetails(task)}>
                <div className="task-title-text" title={task.title}>
                  {task.title}
                </div>
                <div className="task-desc-preview">
                  {task.description || "No description provided"}
                </div>
                <div className="task-meta-pills">
                  {task.assignee && <span className="task-meta-badge">👤 {task.assignee}</span>}
                  {task.checklists && task.checklists.length > 0 && (
                    <span>☑ {task.checklists.filter(c => c.done).length}/{task.checklists.length}</span>
                  )}
                  {task.comments && task.comments.length > 0 && (
                    <span>💬 {task.comments.length}</span>
                  )}
                </div>
              </div>

              <div className="status-cell-col">
                <select
                  className={`inline-badge-select status-badge ${task.status.toLowerCase().replace(/\s+/g, "-")}`}
                  value={task.status}
                  onChange={e => onChangeStatus(task, e.target.value as TaskStatus)}
                >
                  {statuses.map(s => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="priority-cell-col">
                <select
                  className={`inline-badge-select priority-badge ${task.priority.toLowerCase()}`}
                  value={task.priority}
                  onChange={e => onChangePriority(task, e.target.value as TaskPriority)}
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div className="due-cell-col">
                <div className={`due-pill ${task.dueDate === new Date().toISOString().slice(0, 10) ? "today" : ""} ${overdue ? "overdue" : ""}`}>
                  {overdue ? "Overdue" : formatDisplayDate(task.dueDate)}
                </div>
              </div>

              <div className="category-cell-col">
                <div className="category-pill">
                  <span className="category-dot" style={{ background: catColor }} />
                  {task.category}
                </div>
              </div>

              <div className="row-actions-group">
                <button className="row-action-btn edit" onClick={() => onEdit(task)} title="Edit Task">
                  <Pencil size={14} />
                </button>
                <button className="row-action-btn delete" onClick={() => onDelete(task)} title="Delete Task">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
