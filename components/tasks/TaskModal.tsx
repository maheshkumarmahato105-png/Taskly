"use client";

import React, { useState, useEffect } from "react";
import type { Lookup, Task, TaskPriority, TaskStatus } from "@/types/task";
import { X } from "lucide-react";

interface TaskModalProps {
  isOpen: boolean;
  editingTask: Task | null;
  statuses: Lookup[];
  categories: Lookup[];
  onClose: () => void;
  onSave: (payload: {
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    category: string;
    dueDate: string;
    assignee: string;
  }) => void;
}

export function TaskModal({
  isOpen,
  editingTask,
  statuses,
  categories,
  onClose,
  onSave,
}: TaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("Not Started");
  const [priority, setPriority] = useState<TaskPriority>("Medium");
  const [category, setCategory] = useState("Work");
  const [dueDate, setDueDate] = useState("");
  const [assignee, setAssignee] = useState("Bishal");

  // Populate form when editing an existing task
  useEffect(() => {
    if (!isOpen) return;
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || "");
      setStatus(editingTask.status);
      setPriority(editingTask.priority);
      setCategory(editingTask.category);
      setDueDate(editingTask.dueDate || "");
      setAssignee(editingTask.assignee || "Bishal");
    } else {
      // Reset to defaults for new task creation
      setTitle("");
      setDescription("");
      setStatus("Not Started");
      setPriority("Medium");
      setCategory(categories[0]?.name || "Work");
      setDueDate(new Date().toISOString().slice(0, 10));
      setAssignee("Bishal");
    }
  }, [isOpen, editingTask]); // intentionally excludes categories to avoid resetting mid-session

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      alert("Please enter a task title");
      return;
    }
    onSave({
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      category,
      dueDate,
      assignee,
    });
  }

  return (
    <div className="modal-overlay show" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>{editingTask ? "Edit Task" : "Create Task"}</h2>
            <p>{editingTask ? "Update workflow status, deadline, and details." : "Add a task with clear status, priority, category, and deadline."}</p>
          </div>
          <button className="drawer-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-field">
              <label>Task Title *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Prepare monthly performance report"
                value={title}
                onChange={e => setTitle(e.target.value)}
                autoFocus
              />
            </div>

            <div className="form-field">
              <label>Task Details & Notes</label>
              <textarea
                className="form-textarea"
                placeholder="Add notes, requirements, or reference links..."
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <div className="form-grid-2">
              <div className="form-field">
                <label>Status</label>
                <select
                  className="form-select"
                  value={status}
                  onChange={e => setStatus(e.target.value as TaskStatus)}
                >
                  {statuses.map(s => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>Priority</label>
                <select
                  className="form-select"
                  value={priority}
                  onChange={e => setPriority(e.target.value as TaskPriority)}
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-field">
                <label>Due Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label>Task Category</label>
                <select
                  className="form-select"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-field">
                <label>Assignee</label>
                <select
                  className="form-select"
                  value={assignee}
                  onChange={e => setAssignee(e.target.value)}
                >
                  <option value="Bishal">Bishal (Lead)</option>
                  <option value="Anita">Anita (Dev)</option>
                  <option value="Rahul">Rahul (Design)</option>
                  <option value="Priya">Priya (QA)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingTask ? "Save Changes" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
