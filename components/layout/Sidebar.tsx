"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CheckCircle2,
  Clock3,
  CalendarClock,
  ListChecks,
  ShieldAlert,
  Settings,
  LayoutGrid,
  Layers,
  FolderTree,
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
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
  currentFilter?: string;
  onFilterChange?: (filter: string) => void;
}

export function Sidebar({
  categories,
  counts,
  completionRate,
  brandName = "EasyMyLearning",
  selectedCategory,
  onSelectCategory,
  currentFilter,
  onFilterChange,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isNavActive = (path: string) => pathname === path;

  const isDashboardActive = pathname === "/" && (!currentFilter || currentFilter === "all");
  const isAllTasksActive = pathname === "/tasks" && (!currentFilter || currentFilter === "all");
  const isTodayActive = pathname === "/tasks" && currentFilter === "today";
  const isUpcomingActive = pathname === "/tasks" && currentFilter === "upcoming";
  const isCompletedActive = pathname === "/tasks" && currentFilter === "completed";
  const isOverdueActive = pathname === "/tasks" && currentFilter === "overdue";

  const handleFilterClick = (e: React.MouseEvent, filterKey: string) => {
    if (e.ctrlKey || e.metaKey) return;
    e.preventDefault();
    if (pathname === "/tasks") {
      onFilterChange?.(filterKey);
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        if (filterKey === "all") {
          url.searchParams.delete("filter");
        } else {
          url.searchParams.set("filter", filterKey);
        }
        window.history.pushState({}, "", url.toString());
      }
    } else {
      router.push(filterKey === "all" ? "/tasks" : `/tasks?filter=${filterKey}`);
    }
  };

  return (
    <aside className="sidebar">
      {/* Desktop & Tablet Sidebar View */}
      <div className="sidebar-desktop-content">
        <Link href="/" className="brand" title="EasyMyLearning — Task Manager">
          <BrandLogo brandName={brandName} subTitle="Task Manager" badge="ENTERPRISE" />
        </Link>

        {/* Workspace */}
        <div className="nav-group">
          <div className="nav-label">Workspace</div>
          <nav className="nav-list">
            <Link href="/" className={`nav-item ${isDashboardActive ? "active" : ""}`} title="Overview Dashboard">
              <span className="nav-icon"><LayoutGrid size={17} /></span>
              <span className="nav-title">Dashboard</span>
              <span className="nav-badge">{counts.total}</span>
            </Link>

            <Link
              href="/tasks"
              onClick={e => handleFilterClick(e, "all")}
              className={`nav-item ${isAllTasksActive ? "active" : ""}`}
              title="Show all tasks"
            >
              <span className="nav-icon"><ListChecks size={17} /></span>
              <span className="nav-title">All Tasks</span>
            </Link>

            <Link
              href="/tasks?filter=today"
              onClick={e => handleFilterClick(e, "today")}
              className={`nav-item ${isTodayActive ? "active" : ""}`}
              title="Show only tasks due today"
            >
              <span className="nav-icon"><Clock3 size={17} /></span>
              <span className="nav-title">Today's Focus</span>
              <span className="nav-badge">{counts.today}</span>
            </Link>

            <Link
              href="/tasks?filter=upcoming"
              onClick={e => handleFilterClick(e, "upcoming")}
              className={`nav-item ${isUpcomingActive ? "active" : ""}`}
              title="Show only upcoming tasks"
            >
              <span className="nav-icon"><CalendarClock size={17} /></span>
              <span className="nav-title">Upcoming</span>
              <span className="nav-badge">{counts.upcoming}</span>
            </Link>

            <Link
              href="/tasks?filter=completed"
              onClick={e => handleFilterClick(e, "completed")}
              className={`nav-item ${isCompletedActive ? "active" : ""}`}
              title="Show only completed tasks"
            >
              <span className="nav-icon"><CheckCircle2 size={17} /></span>
              <span className="nav-title">Completed</span>
              <span className="nav-badge">{counts.completed}</span>
            </Link>

            <Link
              href="/tasks?filter=overdue"
              onClick={e => handleFilterClick(e, "overdue")}
              className={`nav-item ${isOverdueActive ? "active" : ""}`}
              title="Show only overdue tasks"
            >
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
            {categories.slice(0, 10).map(cat => {
              const isSelected = selectedCategory?.toLowerCase() === cat.name.toLowerCase();
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    if (onSelectCategory) {
                      onSelectCategory(isSelected ? "" : cat.name);
                    } else {
                      router.push(`/tasks?category=${encodeURIComponent(cat.name)}`);
                    }
                  }}
                  className={`nav-item ${isSelected ? "active" : ""}`}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    cursor: "pointer",
                    border: "none",
                    background: isSelected ? "#2A3448" : "transparent",
                    boxShadow: isSelected ? "inset 3px 0 0 var(--brand)" : "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "9px 10px",
                  }}
                  title={isSelected ? `Clear filter: ${cat.name}` : `Show only ${cat.name} tasks`}
                >
                  <span className="category-dot" style={{ background: cat.color || "#64748B" }} />
                  <span className="nav-title" style={{ color: isSelected ? "#fff" : undefined }}>{cat.name}</span>
                  {isSelected && (
                    <span className="nav-badge" style={{ background: "var(--brand)", color: "#1E293B", fontWeight: 800 }}>
                      Selected
                    </span>
                  )}
                </button>
              );
            })}
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
      </div>

      {/* Mobile Dedicated Bottom Navigation Bar */}
      <nav className="sidebar-mobile-nav" aria-label="Mobile Navigation">
        <Link href="/" className={`mobile-nav-item ${isNavActive("/") ? "active" : ""}`} title="Dashboard">
          <div className="mobile-nav-icon"><LayoutGrid size={18} /></div>
          <span className="mobile-nav-text">Home</span>
        </Link>

        <Link href="/tasks" className={`mobile-nav-item ${isNavActive("/tasks") ? "active" : ""}`} title="All Tasks">
          <div className="mobile-nav-icon" style={{ position: "relative" }}>
            <ListChecks size={18} />
            {counts.total > 0 && <span className="mobile-badge-dot">{counts.total}</span>}
          </div>
          <span className="mobile-nav-text">Tasks</span>
        </Link>

        <Link href="/categories" className={`mobile-nav-item ${isNavActive("/categories") ? "active" : ""}`} title="Categories">
          <div className="mobile-nav-icon"><FolderTree size={18} /></div>
          <span className="mobile-nav-text">Categories</span>
        </Link>

        <Link href="/admin" className={`mobile-nav-item ${isNavActive("/admin") ? "active" : ""}`} title="Admin Console">
          <div className="mobile-nav-icon"><Layers size={18} /></div>
          <span className="mobile-nav-text">Admin</span>
        </Link>

        <Link href="/settings" className={`mobile-nav-item ${isNavActive("/settings") ? "active" : ""}`} title="Preferences">
          <div className="mobile-nav-icon"><Settings size={18} /></div>
          <span className="mobile-nav-text">Settings</span>
        </Link>
      </nav>
    </aside>
  );
}
