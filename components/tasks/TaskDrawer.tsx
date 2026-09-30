"use client";

import React, { useState } from "react";
import type { Lookup, Task, TaskPriority, TaskStatus, TaskAttachment } from "@/types/task";
import { X, Check, Paperclip, Plus, Trash2, Calendar, Hash, Clock } from "lucide-react";
import { toast } from "@/components/ui/Toast";

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
  const [activeTab, setActiveTab] = useState<"comments" | "activity" | "attachments">("comments");
  const [newChecklistText, setNewChecklistText] = useState("");
  const [newCommentText, setNewCommentText] = useState("");
  const [newAttachmentName, setNewAttachmentName] = useState("");
  const [showAttachInput, setShowAttachInput] = useState(false);

  if (!isOpen || !task) return null;

  function updateField<K extends keyof Task>(field: K, value: Task[K], notify = false) {
    if (!task) return;
    const updated = { ...task, [field]: value, updatedAt: new Date().toISOString() };
    onUpdate(updated);
    if (notify) {
      const fieldNames: Record<string, string> = {
        title: "Title",
        description: "Description",
        status: "Status",
        priority: "Priority",
        category: "Category",
        dueDate: "Due Date",
        assignee: "Assignee",
      };
      const label = fieldNames[field as string] || String(field);
      toast.success(`${label} Updated`, `Changed to ${String(value)}`);
    }
  }

  function updateCustomField(key: string, value: string) {
    if (!task) return;
    const currentCustom = task.customFields ? { ...task.customFields } : {};
    currentCustom[key] = value;
    updateField("customFields", currentCustom, false);
    toast.success("Field Updated", `${key.replace(/_/g, " ")} saved`);
  }

  function handleAddChecklist() {
    if (!newChecklistText.trim() || !task) return;
    const itemText = newChecklistText.trim();
    const lists = task.checklists ? [...task.checklists] : [];
    lists.push({ id: "c" + Date.now(), text: itemText, done: false });
    updateField("checklists", lists, false);
    setNewChecklistText("");
    toast.success("Checklist Added", `'${itemText}' added to steps`);
  }

  function handleToggleChecklist(index: number) {
    if (!task || !task.checklists) return;
    const lists = [...task.checklists];
    const isDone = !lists[index].done;
    lists[index] = { ...lists[index], done: isDone };
    updateField("checklists", lists, false);
    toast.success(isDone ? "Step Completed" : "Step Reopened", `'${lists[index].text}'`);
  }

  function handleDeleteChecklist(index: number) {
    if (!task || !task.checklists) return;
    const lists = [...task.checklists];
    const removedText = lists[index]?.text || "Step";
    lists.splice(index, 1);
    updateField("checklists", lists, false);
    toast.info("Checklist Removed", `'${removedText}' deleted`);
  }

  function handleAddComment() {
    if (!newCommentText.trim() || !task) return;
    const comments = task.comments ? [...task.comments] : [];
    comments.push({
      id: "cm" + Date.now(),
      author: "Bishal (Lead)",
      date: "Just now",
      text: newCommentText.trim(),
    });
    updateField("comments", comments, false);
    setNewCommentText("");
    toast.success("Comment Posted", "Your discussion note has been added");
  }

  function handleAddAttachment() {
    if (!newAttachmentName.trim() || !task) return;
    const name = newAttachmentName.trim();
    const attachments = task.attachments ? [...task.attachments] : [];
    attachments.push({
      id: "att-" + Date.now(),
      name,
      size: "1.2 MB",
      type: "application/pdf",
      uploadedAt: "Just now",
    });
    updateField("attachments", attachments, false);
    setNewAttachmentName("");
    setShowAttachInput(false);
    toast.success("Attachment Uploaded", `'${name}' attached to task`);
  }

  const checklistTotal = task.checklists?.length || 0;
  const checklistDone = task.checklists?.filter(c => c.done).length || 0;
  const checklistPct = checklistTotal > 0 ? Math.round((checklistDone / checklistTotal) * 100) : 0;

  return (
    <div className="drawer-backdrop show" onClick={onClose}>
      <div className="drawer-panel" onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="drawer-title-group">
            <small id="drawerCategoryTag" style={{ color: "#FFAA00", fontWeight: 800, letterSpacing: "1px" }}>
              {task.category?.toUpperCase() || "OPERATIONS"}
            </small>
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
              onBlur={e => e.target.value.trim() && toast.success("Title Saved", `'${e.target.value}' saved`)}
            />
          </div>

          <div className="drawer-field-grid">
            <div className="drawer-field-item">
              <label>Status</label>
              <select
                className="drawer-field-select"
                value={task.status}
                onChange={e => updateField("status", e.target.value as TaskStatus, true)}
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
                onChange={e => updateField("priority", e.target.value as TaskPriority, true)}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div className="drawer-field-item">
              <label>Category</label>
              <select
                className="drawer-field-select"
                value={task.category}
                onChange={e => updateField("category", e.target.value, true)}
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
                onChange={e => updateField("dueDate", e.target.value || null, true)}
              />
            </div>
          </div>

          <div className="drawer-field-grid">
            <div className="drawer-field-item">
              <label>Task Assignee (PDF Page 7)</label>
              <select
                className="drawer-field-select"
                value={task.assignee || "Bishal"}
                onChange={e => updateField("assignee", e.target.value, true)}
              >
                <option value="Bishal">Bishal (Lead Admin)</option>
                <option value="Anita">Anita (Full-Stack Dev)</option>
                <option value="Rahul">Rahul (Product Designer)</option>
                <option value="Priya">Priya (QA Engineer)</option>
              </select>
            </div>

            <div className="drawer-field-item">
              <label style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <Hash size={12} /> Reference Number (Custom Field)
              </label>
              <input
                type="text"
                className="drawer-field-input"
                placeholder="e.g. EML-2026-001"
                value={task.customFields?.reference_number || ""}
                onChange={e => updateCustomField("reference_number", e.target.value)}
              />
            </div>
          </div>

          <div className="drawer-field-grid">
            <div className="drawer-field-item">
              <label style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <Calendar size={12} /> Follow-up Date (Custom Field)
              </label>
              <input
                type="date"
                className="drawer-field-input"
                value={task.customFields?.follow_up_date || ""}
                onChange={e => updateCustomField("follow_up_date", e.target.value)}
              />
            </div>
          </div>

          <div className="drawer-desc-box">
            <label>Description & Scope</label>
            <textarea
              className="drawer-desc-textarea"
              value={task.description || ""}
              placeholder="Add detailed task scope or specifications..."
              onChange={e => updateField("description", e.target.value)}
              onBlur={() => toast.success("Description Saved", "Task description updated")}
            />
          </div>

          {/* Interactive Checklist (PDF Page 7: [x] Collect data, [x] Verify figures, [ ] Finalize charts) */}
          <div className="checklist-section">
            <div className="checklist-header">
              <strong>Checklist Sub-items (PDF Page 7)</strong>
              <span>{checklistDone} / {checklistTotal} done ({checklistPct}%)</span>
            </div>
            <div className="checklist-progress-bar">
              <div
                className="checklist-progress-fill"
                style={{ width: `${checklistPct}%`, background: "linear-gradient(90deg, #FFAA00, #10B981)" }}
              />
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
                placeholder="Add new measurable step (e.g. Finalize charts)..."
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

          {/* Tabs: Comments, Activity Audit, Attachments (PDF Page 5 & 7) */}
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
                Activity Log
              </button>
              <button
                className={`drawer-tab-btn ${activeTab === "attachments" ? "active" : ""}`}
                onClick={() => setActiveTab("attachments")}
              >
                Attachments ({task.attachments?.length || 0})
              </button>
            </div>

            {/* Comments Stream */}
            {activeTab === "comments" && (
              <div className="drawer-tab-content active">
                <div className="comments-list">
                  {(!task.comments || task.comments.length === 0) ? (
                    <div style={{ fontSize: "11px", color: "var(--muted-2)", padding: "10px 0" }}>
                      No comments yet. Start a discussion with your team notes.
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
                    placeholder="Team notes and discussion..."
                    value={newCommentText}
                    onChange={e => setNewCommentText(e.target.value)}
                  />
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                      className="btn btn-primary"
                      style={{ height: "34px", padding: "0 14px" }}
                      onClick={handleAddComment}
                    >
                      Post Note
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Activity Stream (PDF Page 7: - Priority changed, - Status changed) */}
            {activeTab === "activity" && (
              <div className="drawer-tab-content active">
                <div className="activity-stream">
                  <div className="activity-item">
                    <div className="activity-dot-line">
                      <div className="activity-marker" style={{ background: "#FFAA00" }} />
                    </div>
                    <div className="activity-info">
                      <strong>Status Updated</strong>
                      <p style={{ margin: "2px 0 0", fontSize: "11px", color: "var(--ink-2)" }}>
                        Current status: {task.status}
                      </p>
                      <small>Logged in task_activity_logs</small>
                    </div>
                  </div>

                  <div className="activity-item">
                    <div className="activity-dot-line">
                      <div className="activity-marker" style={{ background: "#2563EB" }} />
                    </div>
                    <div className="activity-info">
                      <strong>Priority Assigned</strong>
                      <p style={{ margin: "2px 0 0", fontSize: "11px", color: "var(--ink-2)" }}>
                        Priority level set to {task.priority}
                      </p>
                      <small>Updated recently</small>
                    </div>
                  </div>

                  <div className="activity-item">
                    <div className="activity-dot-line">
                      <div className="activity-marker" style={{ background: "#10B981" }} />
                    </div>
                    <div className="activity-info">
                      <strong>Task Created</strong>
                      <small>{new Date(task.createdAt).toLocaleString()}</small>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Attachments Section (PDF Page 2 & 5: S3 / Cloudflare R2 task attachments) */}
            {activeTab === "attachments" && (
              <div className="drawer-tab-content active">
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
                  {(!task.attachments || task.attachments.length === 0) ? (
                    <div style={{ fontSize: "11px", color: "var(--muted)", padding: "8px 0" }}>
                      No files attached to this task.
                    </div>
                  ) : (
                    task.attachments.map(att => (
                      <div
                        key={att.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "8px 12px",
                          background: "#FAFBFC",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <Paperclip size={14} style={{ color: "#FFAA00" }} />
                          <strong>{att.name}</strong>
                          <span style={{ fontSize: "10px", color: "var(--muted)" }}>({att.size})</span>
                        </div>
                        <span style={{ fontSize: "10px", color: "var(--muted)" }}>{att.uploadedAt}</span>
                      </div>
                    ))
                  )}
                </div>

                {showAttachInput ? (
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. project_proposal.pdf"
                      value={newAttachmentName}
                      onChange={e => setNewAttachmentName(e.target.value)}
                    />
                    <button className="btn btn-primary" onClick={handleAddAttachment}>Attach</button>
                    <button className="btn btn-secondary" onClick={() => setShowAttachInput(false)}>Cancel</button>
                  </div>
                ) : (
                  <button
                    className="btn btn-secondary"
                    style={{ width: "100%", justifyContent: "center", gap: "6px" }}
                    onClick={() => setShowAttachInput(true)}
                  >
                    <Plus size={14} /> Upload to Storage (S3 / R2)
                  </button>
                )}
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
