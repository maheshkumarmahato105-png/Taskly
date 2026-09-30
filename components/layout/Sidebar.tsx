"use client";

import React, { useState, useMemo } from "react";
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
  ArrowUpDown,
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
  categoryCounts?: Record<string, number>;
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
  categoryCounts,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [catSort, setCatSort] = useState<"default" | "tasks" | "az">("default");

  const sortedCategories = useMemo(() => {
    const list = [...categories];
    if (catSort === "az") {
      return list.sort((a, b) => a.name.localeCompare(b.name));
    }
    if (catSort === "tasks") {
      return list.sort((a, b) => (categoryCounts?.[b.name] ?? 0) - (categoryCounts?.[a.name] ?? 0));
    }
    return list.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [categories, catSort, categoryCounts]);

  const isNavActive = (path: string) => pathname === path;

  const isDashboardActive = pathname === "/" && (!currentFilter || currentFilter === "all");
  const isAllTasksActive = pathname === "/tasks" && (!currentFilter || currentFilter === "all");
  const isTodayActive = pathname === "/tasks" && currentFilter === "today";
  const isUpcomingActive = pathname === "/tasks" && currentFilter === "upcoming";
  const isCompletedActive = pathname === "/tasks" && currentFilter === "completed";
  const isOverdueActive = pathname === "/tasks" && currentFilter === "overdue";

  const handleDashboardClick = (e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) return;
    if (pathname === "/") {
      e.preventDefault();
      onSelectCategory?.("");
      onFilterChange?.("all");
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.search = "";
        window.history.pushState({}, "", url.pathname);
      }
    }
  };

  const handleFilterClick = (e: React.MouseEvent, filterKey: string) => {
    if (e.ctrlKey || e.metaKey) return;
    if (pathname === "/tasks") {
      e.preventDefault();
      onFilterChange?.(filterKey);
      if (filterKey === "all") {
        onSelectCategory?.("");
      }
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        if (filterKey === "all") {
          url.searchParams.delete("filter");
          url.searchParams.delete("category");
        } else {
          url.searchParams.set("filter", filterKey);
        }
        window.history.pushState({}, "", url.toString());
      }
    }
    // If not currently on /tasks, default <Link prefetch={true}> navigates natively without reload
  };

  return (
    <aside className="sidebar">
      {/* Desktop & Tablet Sidebar View */}
      <div className="sidebar-desktop-content">
        <Link href="/" prefetch={true} onClick={handleDashboardClick} className="brand" title="EasyMyLearning — Task Manager">
          <BrandLogo brandName={brandName} subTitle="Task Manager" badge="ENTERPRISE" />
        </Link>

        {/* Workspace */}
        <div className="nav-group">
          <div className="nav-label">Workspace</div>
          <nav className="nav-list">
            <Link
              href="/"
              prefetch={true}
              onClick={handleDashboardClick}
              className={`nav-item ${isDashboardActive ? "active" : ""}`}
              title="Overview Dashboard"
            >
              <span className="nav-icon"><LayoutGrid size={17} /></span>
              <span className="nav-title">Dashboard</span>
              <span className="nav-badge">{counts.total}</span>
            </Link>

            <Link
              href="/tasks"
              prefetch={true}
              onClick={e => handleFilterClick(e, "all")}
              className={`nav-item ${isAllTasksActive ? "active" : ""}`}
              title="Show all tasks"
            >
              <span className="nav-icon"><ListChecks size={17} /></span>
              <span className="nav-title">All Tasks</span>
            </Link>

            <Link
              href="/tasks?filter=today"
              prefetch={true}
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
              prefetch={true}
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
              prefetch={true}
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
              prefetch={true}
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
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                type="button"
                onClick={() => setCatSort(prev => prev === "default" ? "tasks" : prev === "tasks" ? "az" : "default")}
                title={`Arrange categories (Current: ${catSort === "default" ? "Custom Order" : catSort === "tasks" ? "Most Tasks First" : "A-Z Alphabetical"}). Click to switch.`}
                style={{
                  color: catSort !== "default" ? "#FFAA00" : "#8FA0B6",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "3px",
                  fontSize: "9px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                <ArrowUpDown size={11} />
                <span>{catSort === "default" ? "Order" : catSort === "tasks" ? "Active" : "A-Z"}</span>
              </button>
              <Link href="/categories" style={{ color: "#FFAA00", fontSize: "10px", fontWeight: 700 }}>
                Manage →
              </Link>
            </div>
          </div>
          <nav className="nav-list">
            {sortedCategories.slice(0, 10).map(cat => {
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
                  }}
                  title={isSelected ? `Clear filter: ${cat.name}` : `Show only ${cat.name} tasks`}
                >
                  <span className="category-dot" style={{ background: cat.color || "#64748B" }} />
                  <span className="nav-title">{cat.name}</span>
                  {categoryCounts && categoryCounts[cat.name] !== undefined && (
                    <span className="nav-badge">
                      {categoryCounts[cat.name]}
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
        <Link
          href="/"
          prefetch={true}
          onClick={handleDashboardClick}
          className={`mobile-nav-item ${isNavActive("/") ? "active" : ""}`}
          title="Dashboard"
        >
          <div className="mobile-nav-icon"><LayoutGrid size={18} /></div>
          <span className="mobile-nav-text">Home</span>
        </Link>

        <Link
          href="/tasks"
          prefetch={true}
          onClick={e => handleFilterClick(e, "all")}
          className={`mobile-nav-item ${isNavActive("/tasks") ? "active" : ""}`}
          title="All Tasks"
        >
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
