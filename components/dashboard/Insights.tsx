"use client";

import React from "react";
import type { DashboardSummary, UpcomingTask } from "@/types/task";
import { UpcomingList } from "./UpcomingList";
import { AlertCircle } from "lucide-react";

interface InsightsProps {
  summary: DashboardSummary & Record<string, unknown>;
  upcoming: UpcomingTask[];
  onTaskClick?: (task: UpcomingTask) => void;
  onViewAllUpcoming?: () => void;
}

export function Insights({ summary, upcoming, onTaskClick, onViewAllUpcoming }: InsightsProps) {
  let focusAdvice = "Review high-priority tasks and ensure overdue items are addressed first.";
  if (summary.overdue > 0) {
    focusAdvice = `You have ${summary.overdue} overdue task${summary.overdue > 1 ? "s" : ""}. Take action on these first to unblock your schedule.`;
  } else if (summary.inProgress > 0) {
    focusAdvice = `You have ${summary.inProgress} active task${summary.inProgress > 1 ? "s" : ""} in progress. Prioritize finishing active items.`;
  } else if (summary.notStarted > 0) {
    focusAdvice = "All tasks are ready to begin. Pick one high priority item to start your workflow.";
  }

  return (
    <aside className="panel-card insights-sidebar">
      <div className="insight-header">
        <h3>Today’s Overview</h3>
        {onViewAllUpcoming && <button onClick={onViewAllUpcoming}>Details →</button>}
      </div>

      <div className="progress-card">
        <div className="progress-info-row">
          <span>Overall completion</span>
          <strong>{summary.completionRate}%</strong>
        </div>
        <div className="progress-track-bg">
          <div className="progress-track-val" style={{ width: `${summary.completionRate}%` }} />
        </div>
        <div className="progress-subtitle">
          {summary.completed} of {summary.totalTasks} tasks completed
        </div>

        <div className="mini-metrics-row">
          <div className="mini-metric-box">
            <small>Pending</small>
            <strong>{summary.notStarted}</strong>
          </div>
          <div className="mini-metric-box">
            <small>Active</small>
            <strong>{summary.inProgress}</strong>
          </div>
          <div className="mini-metric-box">
            <small>Done</small>
            <strong>{summary.completed}</strong>
          </div>
        </div>
      </div>

      <UpcomingList upcoming={upcoming} onTaskClick={onTaskClick} onViewAll={onViewAllUpcoming} />

      <div className="attention-card">
        <strong>
          <AlertCircle size={15} />
          Focus Recommendation
        </strong>
        <p>{focusAdvice}</p>
      </div>
    </aside>
  );
}
