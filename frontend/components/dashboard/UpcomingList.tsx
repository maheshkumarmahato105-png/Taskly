"use client";

import React from "react";
import type { UpcomingTask } from "@/types/task";

interface UpcomingListProps {
  upcoming: UpcomingTask[];
  onTaskClick?: (task: UpcomingTask) => void;
  onViewAll?: () => void;
}

export function UpcomingList({ upcoming, onTaskClick, onViewAll }: UpcomingListProps) {
  function formatMonthDay(iso: string) {
    if (!iso) return "TBD";
    const parts = iso.split("-");
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const m = months[parseInt(parts[1], 10) - 1] || parts[1];
    return `${m}\n${parts[2]}`;
  }

  return (
    <div>
      <div className="insight-header">
        <h3>Upcoming Deadlines</h3>
        {onViewAll && <button onClick={onViewAll}>View all →</button>}
      </div>
      <div className="upcoming-deadlines-list">
        {upcoming.length === 0 ? (
          <div style={{ padding: "14px 0", fontSize: "11px", color: "var(--muted-2)", textAlign: "center" }}>
            No upcoming deadlines scheduled.
          </div>
        ) : (
          upcoming.slice(0, 4).map(task => (
            <div
              key={task.id}
              className="upcoming-task-item"
              onClick={() => onTaskClick && onTaskClick(task)}
            >
              <div className="upcoming-date-box" style={{ whiteSpace: "pre-line" }}>
                {formatMonthDay(task.dueDate)}
              </div>
              <div className="upcoming-info">
                <strong>{task.title}</strong>
                <span>
                  {task.category} · <strong style={{ color: "var(--ink-2)" }}>{task.status}</strong>
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
