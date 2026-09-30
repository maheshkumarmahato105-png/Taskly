"use client";

import React from "react";
import Link from "next/link";
import { LayoutGrid, Circle, Clock3, CheckCircle2, AlertTriangle } from "lucide-react";
import type { DashboardSummary } from "@/types/task";

interface SummaryGridProps {
  // Allow extra fields (today, upcoming, etc.) spread in from page.tsx
  summary: DashboardSummary & Record<string, unknown>;
}

export function SummaryGrid({ summary }: SummaryGridProps) {
  return (
    <div className="summary-grid">
      <Link href="/tasks" className="summary-card" title="View all tasks" style={{ textDecoration: "none" }}>
        <div className="summary-card-header">
          <span>Total tasks</span>
          <div className="summary-card-icon">
            <LayoutGrid size={18} />
          </div>
        </div>
        <div className="summary-card-value">{summary.totalTasks}</div>
        <div className="summary-card-meta">All active &amp; completed items</div>
      </Link>

      <Link href="/tasks?filter=not-started" className="summary-card" title="View not started tasks" style={{ textDecoration: "none" }}>
        <div className="summary-card-header">
          <span>Not started</span>
          <div className="summary-card-icon">
            <Circle size={18} />
          </div>
        </div>
        <div className="summary-card-value">{summary.notStarted}</div>
        <div className="summary-card-meta">Waiting to be initiated</div>
      </Link>

      <Link href="/tasks?filter=in-progress" className="summary-card" title="View in progress tasks" style={{ textDecoration: "none" }}>
        <div className="summary-card-header">
          <span>In progress</span>
          <div className="summary-card-icon">
            <Clock3 size={18} />
          </div>
        </div>
        <div className="summary-card-value">{summary.inProgress}</div>
        <div className="summary-card-meta">Currently being executed</div>
      </Link>

      <Link href="/tasks?filter=completed" className="summary-card" title="View completed tasks" style={{ textDecoration: "none" }}>
        <div className="summary-card-header">
          <span>Completed</span>
          <div className="summary-card-icon">
            <CheckCircle2 size={18} />
          </div>
        </div>
        <div className="summary-card-value">{summary.completed}</div>
        <div className="summary-card-meta">{summary.completionRate}% completion rate</div>
      </Link>

      <Link href="/tasks?filter=overdue" className="summary-card danger" title="View overdue tasks" style={{ textDecoration: "none" }}>
        <div className="summary-card-header">
          <span>Overdue</span>
          <div className="summary-card-icon">
            <AlertTriangle size={18} />
          </div>
        </div>
        <div className="summary-card-value" style={{ color: "var(--red)" }}>{summary.overdue}</div>
        <div className="summary-card-meta">Requires urgent focus</div>
      </Link>
    </div>
  );
}
