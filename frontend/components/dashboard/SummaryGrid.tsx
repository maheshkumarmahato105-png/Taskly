"use client";

import React from "react";
import { LayoutGrid, Circle, Clock3, CheckCircle2, AlertTriangle } from "lucide-react";
import type { DashboardSummary } from "@/types/task";

interface SummaryGridProps {
  summary: DashboardSummary;
}

export function SummaryGrid({ summary }: SummaryGridProps) {
  return (
    <div className="summary-grid">
      <div className="summary-card">
        <div className="summary-card-header">
          <span>Total tasks</span>
          <div className="summary-card-icon">
            <LayoutGrid size={18} />
          </div>
        </div>
        <div className="summary-card-value">{summary.totalTasks}</div>
        <div className="summary-card-meta">All active & completed items</div>
      </div>

      <div className="summary-card">
        <div className="summary-card-header">
          <span>Not started</span>
          <div className="summary-card-icon">
            <Circle size={18} />
          </div>
        </div>
        <div className="summary-card-value">{summary.notStarted}</div>
        <div className="summary-card-meta">Waiting to be initiated</div>
      </div>

      <div className="summary-card">
        <div className="summary-card-header">
          <span>In progress</span>
          <div className="summary-card-icon">
            <Clock3 size={18} />
          </div>
        </div>
        <div className="summary-card-value">{summary.inProgress}</div>
        <div className="summary-card-meta">Currently being executed</div>
      </div>

      <div className="summary-card">
        <div className="summary-card-header">
          <span>Completed</span>
          <div className="summary-card-icon">
            <CheckCircle2 size={18} />
          </div>
        </div>
        <div className="summary-card-value">{summary.completed}</div>
        <div className="summary-card-meta">{summary.completionRate}% completion rate</div>
      </div>

      <div className="summary-card danger">
        <div className="summary-card-header">
          <span>Overdue</span>
          <div className="summary-card-icon">
            <AlertTriangle size={18} />
          </div>
        </div>
        <div className="summary-card-value" style={{ color: "var(--red)" }}>{summary.overdue}</div>
        <div className="summary-card-meta">Requires urgent focus</div>
      </div>
    </div>
  );
}
