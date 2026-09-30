"use client";

import React from "react";
import type { TaskPriority, TaskStatus } from "@/types/task";

interface BulkActionsProps {
  selectedCount: number;
  onSetStatus: (status: TaskStatus) => void;
  onSetPriority: (priority: TaskPriority) => void;
  onDelete: () => void;
  onCancel: () => void;
}

export function BulkActions({
  selectedCount,
  onSetStatus,
  onSetPriority,
  onDelete,
  onCancel,
}: BulkActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="bulk-actions-bar show">
      <div className="bulk-info">
        <span>{selectedCount} item{selectedCount > 1 ? "s" : ""} selected</span>
      </div>
      <div className="bulk-btn-group">
        <button className="btn-bulk" onClick={() => onSetStatus("Completed")}>
          Mark Completed
        </button>
        <button className="btn-bulk" onClick={() => onSetStatus("In Progress")}>
          Set In Progress
        </button>
        <button className="btn-bulk" onClick={() => onSetPriority("High")}>
          Set High Priority
        </button>
        <button className="btn-bulk danger" onClick={onDelete}>
          Delete Selected
        </button>
        <button className="btn-bulk" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
