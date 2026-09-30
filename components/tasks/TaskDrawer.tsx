"use client";

import React, { useState } from "react";
import type { Lookup, Task, TaskPriority, TaskStatus } from "@/types/task";
import { X, Check } from "lucide-react";

interface TaskDrawerProps {
  task: Task | null;
  isOpen: boolean;
  statuses: Lookup[];
  categories: Lookup[];
  onClose: () => void;
  onUpdate: (updated: Task) => void;
  onDelete: (task: Task) => void;
}

export function TaskDrawer({
  task,
  isOpen,
  statuses,
  categories,
  onClose,
  onUpdate,
  onDelete,
}: TaskDrawerProps) {
  const [activeTab, setActiveTab] = useState<"comments" | "activity">("comments");
  const [newChecklistText, setNewChecklistText] = useState("");
  const [newCommentText, setNewCommentText] = useState("");

  if (!isOpen || !task) return null;

  function updateField<K extends keyof Task>(field: K, value: Task[K]) {
    if (!task) return;
    const updated = { ...task, [field]: value, updatedAt: new Date().toISOString() };
    onUpdate(updated);
  }

  function handleAddChecklist() {
    if (!newChecklistText.trim() || !task) return;
    const lists = task.checklists ? [...task.checklists] : [];
    lists.push({ id: "c" + Date.now(), text: newChecklistText.trim(), done: false });
    updateField("checklists", lists);
    setNewChecklistText("");
  }

  function handleToggleChecklist(index: number) {
    if (!task || !task.checklists) return;
    const lists = [...task.checklists];
    lists[index] = { ...lists[index], done: !lists[index].done };
    updateField("checklists", lists);
  }

  function handleDeleteChecklist(index: number) {
    if (!task || !task.checklists) return;
    const lists = [...task.checklists];
    lists.splice(index, 1);
    updateField("checklists", lists);
  }

  function handleAddComment() {
    if (!newCommentText.trim() || !task) return;
    const comments = task.comments ? [...task.comments] : [];
    comments.push({
      id: "cm" + Date.now(),
      author: "Bishal",
      date: "Just now",
      text: newCommentText.trim(),
    });
    updateField("comments", comments);
    setNewCommentText("");
  }

  const checklistTotal = task.checklists?.length || 0;
  const checklistDone = task.checklists?.filter(c => c.done).length || 0;
  const checklistPct = checklistTotal > 0 ? Math.round((checklistDone / checklistTotal) * 100) : 0;

  return (
    <div className="drawer-backdrop show" onClick={onClose}>
      <div className="drawer-panel" onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="drawer-title-group">
            <small id="drawerCategoryTag">{task.category || "TASK"}</small>
            <h2 id="drawerTaskTitle">{task.title}</h2>
          </div>
          <button className="drawer-close-btn" onClick={onClose} title="Close drawer (Esc)">
            <X size={18} />
          </button>
        </div>

        <div className="drawer-body">
          <div className="form-field">
            <label>Task Title</label>
            <input
              type="text"
              className="form-input"
              value={task.title}
              onChange={e => updateField("title", e.target.value)}
            />
          </div>

          <div className="drawer-field-grid">
            <div className="drawer-field-item">
              <label>Status</label>
              <select
                className="drawer-field-select"
                value={task.status}
                onChange={e => updateField("status", e.target.value as TaskStatus)}
              >
                {statuses.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="drawer-field-item">
              <label>Priority</label>
              <select
                className="drawer-field-select"
                value={task.priority}
                onChange={e => updateField("priority", e.target.value as TaskPriority)}
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div className="drawer-field-item">
              <label>Category</label>
              <select
                className="drawer-field-select"
                value={task.category}
                onChange={e => updateField("category", e.target.value)}
              >
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="drawer-field-item">
              <label>Due Date</label>
              <input
                type="date"
                className="drawer-field-input"
                value={task.dueDate || ""}
                onChange={e => updateField("dueDate", e.target.value || null)}
              />
            </div>
          </div>

          <div className="drawer-field-grid">
            <div className="drawer-field-item">
              <label>Assignee</label>
              <select
                className="drawer-field-select"
                value={task.assignee || "Bishal"}
                onChange={e => updateField("assignee", e.target.value)}
              >
                <option value="Bishal">Bishal (Lead)</option>
                <option value="Anita">Anita (Dev)</option>
                <option value="Rahul">Rahul (Design)</option>
                <option value="Priya">Priya (QA)</option>
              </select>
            </div>
          </div>

          <div className="drawer-desc-box">
            <label>Description & Notes</label>
            <textarea
              className="drawer-desc-textarea"
              value={task.description || ""}
              placeholder="Add detailed scope or notes..."
              onChange={e => updateField("description", e.target.value)}
            />
          </div>

          {/* Interactive Checklist (PDF Page 7) */}
          <div className="checklist-section">
            <div className="checklist-header">
              <strong>Checklist Sub-items</strong>
              <span>{checklistDone} / {checklistTotal} done ({checklistPct}%)</span>
            </div>
            <div className="checklist-progress-bar">
              <div className="checklist-progress-fill" style={{ width: `${checklistPct}%` }} />
            </div>

            <div className="checklist-items-list">
              {(!task.checklists || task.checklists.length === 0) ? (
                <div style={{ fontSize: "11px", color: "var(--muted-2)", padding: "6px 0" }}>
                  No checklist items yet. Add measurable steps below.
                </div>
              ) : (
                task.checklists.map((item, idx) => (
                  <div key={item.id || idx} className={`checklist-item ${item.done ? "done" : ""}`}>
                    <button
                      className={`custom-checkbox ${item.done ? "checked" : ""}`}
                      style={{ width: "16px", height: "16px" }}
                      onClick={() => handleToggleChecklist(idx)}
                    >
                      {item.done && <Check size={12} />}
                    </button>
                    <span>{item.text}</span>
                    <button
                      className="checklist-delete-btn"
                      onClick={() => handleDeleteChecklist(idx)}
                      title="Remove step"
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="add-checklist-row">
              <input
                type="text"
                className="add-checklist-input"
                placeholder="Add new step..."
                value={newChecklistText}
                onChange={e => setNewChecklistText(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAddChecklist()}
              />
              <button
                className="btn btn-secondary"
                style={{ height: "34px", padding: "0 12px" }}
                onClick={handleAddChecklist}
              >
                + Add
              </button>
            </div>
          </div>

          {/* Comments & Activity Stream */}
          <div>
            <div className="drawer-tabs-nav">
              <button
                className={`drawer-tab-btn ${activeTab === "comments" ? "active" : ""}`}
                onClick={() => setActiveTab("comments")}
              >
                Comments ({task.comments?.length || 0})
              </button>
              <button
                className={`drawer-tab-btn ${activeTab === "activity" ? "active" : ""}`}
                onClick={() => setActiveTab("activity")}
              >
                Audit Activity
              </button>
            </div>

            {activeTab === "comments" && (
              <div className="drawer-tab-content active">
                <div className="comments-list">
                  {(!task.comments || task.comments.length === 0) ? (
                    <div style={{ fontSize: "11px", color: "var(--muted-2)", padding: "10px 0" }}>
                      No comments yet. Start a discussion with your team.
                    </div>
                  ) : (
                    task.comments.map((c, i) => (
                      <div key={c.id || i} className="comment-card">
                        <div className="comment-card-top">
                          <span className="comment-author">👤 {c.author}</span>
                          <span className="comment-date">{c.date}</span>
                        </div>
                        <div className="comment-text">{c.text}</div>
                      </div>
                    ))
                  )}
                </div>

                <div className="add-comment-box">
                  <textarea
                    className="add-comment-textarea"
                    placeholder="Write a note or discussion update..."
                    value={newCommentText}
                    onChange={e => setNewCommentText(e.target.value)}
                  />
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                      className="btn btn-primary"
                      style={{ height: "34px", padding: "0 14px" }}
                      onClick={handleAddComment}
                    >
                      Post Comment
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "activity" && (
              <div className="drawer-tab-content active">
                <div className="activity-stream">
                  <div className="activity-item">
                    <div className="activity-dot-line">
                      <div className="activity-marker" />
                    </div>
                    <div className="activity-info">
                      <strong>Task Created</strong>
                      <small>{new Date(task.createdAt).toLocaleString()}</small>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="drawer-footer">
          <button className="btn btn-danger" onClick={() => onDelete(task)}>
            Delete Task
          </button>
          <button className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
