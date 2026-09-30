"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CheckCircle2,
  Clock3,
  CalendarClock,
  ListChecks,
  ShieldAlert,
  Settings,
  LayoutGrid,
  Layers,
  FileCode2,
} from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import type { Lookup } from "@/types/task";

interface SidebarProps {
  categories: Lookup[];
  counts: {
    total: number;
    today: number;
    upcoming: number;
    completed: number;
    overdue: number;
  };
  completionRate: number;
  brandName?: string;
  onAddCategory?: () => void;
  onOpenArchitectureModal?: () => void;
}

export function Sidebar({
  categories,
  counts,
  completionRate,
  brandName = "EasyMyLearning",
  onAddCategory,
  onOpenArchitectureModal,
}: SidebarProps) {
  const pathname = usePathname();

  const isNavActive = (path: string) => pathname === path;

  return (
    <aside className="sidebar">
      <Link href="/" className="brand" title="EasyMyLearning — Task Manager">
        <BrandLogo brandName={brandName} subTitle="Task Manager" badge="ENTERPRISE" />
      </Link>

      {/* Workspace */}
      <div className="nav-group">
        <div className="nav-label">Workspace</div>
        <nav className="nav-list">
          <Link href="/" className={`nav-item ${isNavActive("/") ? "active" : ""}`}>
            <span className="nav-icon"><LayoutGrid size={17} /></span>
            <span className="nav-title">Dashboard</span>
            <span className="nav-badge">{counts.total}</span>
          </Link>

          <Link href="/tasks" className={`nav-item ${isNavActive("/tasks") ? "active" : ""}`}>
            <span className="nav-icon"><ListChecks size={17} /></span>
            <span className="nav-title">All Tasks</span>
          </Link>

          <Link href="/tasks?filter=today" className="nav-item">
            <span className="nav-icon"><Clock3 size={17} /></span>
            <span className="nav-title">Today's Focus</span>
            <span className="nav-badge">{counts.today}</span>
          </Link>

          <Link href="/tasks?filter=upcoming" className="nav-item">
            <span className="nav-icon"><CalendarClock size={17} /></span>
            <span className="nav-title">Upcoming</span>
            <span className="nav-badge">{counts.upcoming}</span>
          </Link>

          <Link href="/tasks?filter=completed" className="nav-item">
            <span className="nav-icon"><CheckCircle2 size={17} /></span>
            <span className="nav-title">Completed</span>
            <span className="nav-badge">{counts.completed}</span>
          </Link>

          <Link href="/tasks?filter=overdue" className="nav-item">
            <span className="nav-icon" style={{ color: "var(--red)" }}><ShieldAlert size={17} /></span>
            <span className="nav-title">Overdue</span>
            <span className="nav-badge" style={{ color: "var(--red)", background: "rgba(239,68,68,0.18)" }}>
              {counts.overdue}
            </span>
          </Link>
        </nav>
      </div>

      {/* Categories */}
      <div className="nav-group">
        <div className="nav-label">
          <span>Categories</span>
          <Link href="/categories" style={{ color: "#FFAA00", fontSize: "10px", fontWeight: 700 }}>
            Manage →
          </Link>
        </div>
        <nav className="nav-list">
          {categories.slice(0, 7).map(cat => (
            <Link key={cat.id} href={`/tasks?category=${encodeURIComponent(cat.name)}`} className="nav-item">
              <span className="category-dot" style={{ background: cat.color || "#64748B" }} />
              <span className="nav-title">{cat.name}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Administration */}
      <div className="nav-group">
        <div className="nav-label">Administration</div>
        <nav className="nav-list">
          <Link href="/admin" className={`nav-item ${isNavActive("/admin") ? "active" : ""}`}>
            <span className="nav-icon"><Layers size={17} /></span>
            <span className="nav-title">Admin Console</span>
          </Link>
          <Link href="/settings" className={`nav-item ${isNavActive("/settings") ? "active" : ""}`}>
            <span className="nav-icon"><Settings size={17} /></span>
            <span className="nav-title">Preferences</span>
          </Link>
          {onOpenArchitectureModal && (
            <button
              className="nav-item"
              onClick={onOpenArchitectureModal}
              style={{ width: "100%", textAlign: "left", background: "none", border: 0, cursor: "pointer", color: "#FFAA00" }}
            >
              <span className="nav-icon"><FileCode2 size={17} /></span>
              <span className="nav-title">Architecture Plan</span>
              <span className="nav-badge" style={{ background: "rgba(255,170,0,0.2)", color: "#FFAA00" }}>PDF</span>
            </button>
          )}
        </nav>
      </div>

      {/* Focus Progress Widget */}
      <div className="sidebar-focus">
        <div className="sidebar-focus-top">
          <strong>Daily Productivity</strong>
          <span>{completionRate}%</span>
        </div>
        <p>Complete priority tasks to hit weekly milestones.</p>
        <div className="focus-bar-bg">
          <div className="focus-bar-fill" style={{ width: `${completionRate}%`, background: "linear-gradient(90deg, #FFAA00, #10B981)" }} />
        </div>
      </div>
    </aside>
  );
}
