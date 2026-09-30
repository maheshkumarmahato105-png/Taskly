"use client";

import React from "react";
import { Search, X, Folder } from "lucide-react";
import type { Lookup } from "@/types/task";

interface FilterBarProps {
  currentFilter: string;
  searchQuery: string;
  sortBy: string;
  onFilterChange: (filter: string) => void;
  onSearchChange: (search: string) => void;
  onSortChange: (sort: string) => void;
  onSavedViewChange: (viewKey: string) => void;
  categories?: Lookup[];
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
}

export function FilterBar({
  currentFilter,
  searchQuery,
  sortBy,
  onFilterChange,
  onSearchChange,
  onSortChange,
  onSavedViewChange,
  categories,
  selectedCategory,
  onCategoryChange,
}: FilterBarProps) {
  const tabs = [
    { key: "all", label: "All" },
    { key: "today", label: "Today" },
    { key: "upcoming", label: "Upcoming" },
    { key: "not-started", label: "Not Started" },
    { key: "in-progress", label: "In Progress" },
    { key: "completed", label: "Completed" },
    { key: "high", label: "High Priority" },
    { key: "overdue", label: "Overdue" },
  ];

  return (
    <>
      <div className="task-toolbar">
        <div className="filter-tabs">
          {tabs.map(t => (
            <button
              key={t.key}
              className={`filter-tab ${currentFilter === t.key ? "active" : ""}`}
              onClick={() => onFilterChange(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="task-tools-right">
          <div className="search-input-wrap">
            <Search className="search-icon" size={14} />
            <input
              type="text"
              className="search-input"
              placeholder="Search tasks (/)..."
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
            />
          </div>

          {categories && categories.length > 0 && (
            <select
              className="select-filter"
              value={selectedCategory || ""}
              onChange={e => onCategoryChange?.(e.target.value)}
              title="Filter by category"
              style={{
                borderColor: selectedCategory ? "var(--brand)" : undefined,
                background: selectedCategory ? "#FFFBF1" : undefined,
                color: selectedCategory ? "#92400E" : undefined,
                fontWeight: selectedCategory ? 700 : 500,
              }}
            >
              <option value="">All Categories ({categories.length})</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          )}

          <select
            className="select-filter"
            value={sortBy}
            onChange={e => onSortChange(e.target.value)}
            title="Sort tasks"
          >
            <option value="default">Sort: Default</option>
            <option value="priority">Sort by Priority</option>
            <option value="status">Sort by Status</option>
            <option value="due">Sort by Due Date</option>
            <option value="category">Sort by Category</option>
            <option value="title">Sort by Title</option>
          </select>

          <select
            className="select-filter"
            onChange={e => onSavedViewChange(e.target.value)}
            defaultValue=""
            title="Saved Views"
          >
            <option value="" disabled>Saved Views</option>
            <option value="overdue-work">⚡ Overdue Work</option>
            <option value="high-ops">🔥 High Priority Ops</option>
            <option value="today-focus">🎯 Today's Focus</option>
          </select>
        </div>
      </div>

      {selectedCategory && (
        <div className="active-category-pill-row">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Folder size={14} style={{ color: "#FFAA00" }} />
            <span>
              Showing only category: <strong>{selectedCategory}</strong>
            </span>
          </div>
          <button
            className="clear-category-pill-btn"
            onClick={() => onCategoryChange?.("")}
            title="Clear category filter and show all tasks"
          >
            <X size={12} /> Clear Filter
          </button>
        </div>
      )}
    </>
  );
}
