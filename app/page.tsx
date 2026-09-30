"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { SummaryGrid } from "@/components/dashboard/SummaryGrid";
import { Insights } from "@/components/dashboard/Insights";
import { TaskTable } from "@/components/tasks/TaskTable";
import { TaskKanban } from "@/components/tasks/TaskKanban";
import { TaskDrawer } from "@/components/tasks/TaskDrawer";
import { TaskModal } from "@/components/tasks/TaskModal";
import { BulkActions } from "@/components/tasks/BulkActions";
import { FilterBar } from "@/components/tasks/FilterBar";
import { api } from "@/lib/api";
import {
  loadStoredTasks,
  saveStoredTasks,
  loadStoredCategories,
  loadStoredStatuses,
  calculateSummary,
} from "@/lib/store";
import type { Lookup, Task, TaskPriority, TaskStatus, UpcomingTask } from "@/types/task";
import { Plus } from "lucide-react";

const initialCategories: Lookup[] = [
  { id: "cat-work", name: "Work", color: "#6366F1" },
  { id: "cat-study", name: "Study", color: "#10B981" },
  { id: "cat-marketing", name: "Marketing", color: "#EC4899" },
  { id: "cat-operations", name: "Operations", color: "#0EA5E9" },
  { id: "cat-admissions", name: "Admissions", color: "#8B5CF6" },
  { id: "cat-finance", name: "Finance", color: "#14B8A6" },
  { id: "cat-personal", name: "Personal", color: "#F59E0B" },
];

const initialStatuses: Lookup[] = [
  { id: "st-not-started", code: "NOT_STARTED", name: "Not Started", color: "#64748B" },
  { id: "st-in-progress", code: "IN_PROGRESS", name: "In Progress", color: "#3B82F6" },
  { id: "st-completed", code: "COMPLETED", name: "Completed", color: "#10B981" },
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [statuses, setStatuses] = useState<Lookup[]>(initialStatuses);
  const [categories, setCategories] = useState<Lookup[]>(initialCategories);
  const [upcoming, setUpcoming] = useState<UpcomingTask[]>([]);

  const [currentFilter, setCurrentFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [activeDrawerTask, setActiveDrawerTask] = useState<Task | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Load data — API first, localStorage fallback
  useEffect(() => {
    async function loadData() {
      try {
        const [taskRes, upcomingRes, statusRes, catRes] = await Promise.all([
          api.tasks(),
          api.upcoming(),
          api.statuses(),
          api.categories(),
        ]);
        setTasks(taskRes.items);
        setUpcoming(upcomingRes.items);
        setStatuses(statusRes.items);
        setCategories(catRes.items);
      } catch {
        // Backend offline — use localStorage
        const storedTasks = loadStoredTasks();
        const storedCats = loadStoredCategories();
        const storedStatuses = loadStoredStatuses();
        setTasks(storedTasks);
        setCategories(storedCats);
        setStatuses(storedStatuses);
        const today = new Date().toISOString().slice(0, 10);
        setUpcoming(
          storedTasks
            .filter(t => t.dueDate && t.dueDate >= today && t.status !== "Completed")
            .slice(0, 4)
            .map(t => ({ id: t.id, title: t.title, status: t.status, category: t.category, dueDate: t.dueDate! }))
        );
      }
    }
    void loadData();
  }, []);

  // Persist tasks to localStorage whenever they change
  useEffect(() => {
    if (tasks.length > 0) {
      saveStoredTasks(tasks);
    }
  }, [tasks]);

  // Derived summary — always in sync with real tasks list
  const summary = useMemo(() => calculateSummary(tasks), [tasks]);

  const counts = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return {
      total: tasks.length,
      today: tasks.filter(t => t.dueDate === today && t.status !== "Completed").length,
      upcoming: tasks.filter(t => t.dueDate && t.dueDate > today && t.status !== "Completed").length,
      completed: tasks.filter(t => t.status === "Completed").length,
      overdue: tasks.filter(t => t.dueDate && t.dueDate < today && t.status !== "Completed").length,
    };
  }, [tasks]);

  const completionRate = tasks.length > 0 ? Math.round((counts.completed / tasks.length) * 100) : 0;

  const filteredTasks = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const list = tasks.filter(t => {
      if (searchQuery) {
        const str = `${t.title} ${t.description} ${t.category} ${t.status} ${t.priority}`.toLowerCase();
        if (!str.includes(searchQuery.toLowerCase())) return false;
      }
      if (currentFilter === "today") return t.dueDate === today;
      if (currentFilter === "upcoming") return t.dueDate && t.dueDate > today && t.status !== "Completed";
      if (currentFilter === "completed") return t.status === "Completed";
      if (currentFilter === "not-started") return t.status === "Not Started";
      if (currentFilter === "in-progress") return t.status === "In Progress";
      if (currentFilter === "high") return t.priority === "High" || t.priority === "Urgent";
      if (currentFilter === "overdue") return Boolean(t.dueDate && t.dueDate < today && t.status !== "Completed");
      if (currentFilter.startsWith("category:")) return t.category === currentFilter.slice(9);
      return true;
    });

    return [...list].sort((a, b) => {
      if (sortBy === "priority") {
        const rank: Record<string, number> = { Urgent: 1, High: 2, Medium: 3, Low: 4 };
        return (rank[a.priority] ?? 9) - (rank[b.priority] ?? 9);
      }
      if (sortBy === "status") {
        const rank: Record<string, number> = { "In Progress": 1, "Not Started": 2, "Completed": 3 };
        return (rank[a.status] ?? 9) - (rank[b.status] ?? 9);
      }
      if (sortBy === "due") return (a.dueDate || "9999").localeCompare(b.dueDate || "9999");
      if (sortBy === "category") return (a.category || "").localeCompare(b.category || "");
      if (sortBy === "title") return a.title.localeCompare(b.title);
      return 0;
    });
  }, [tasks, currentFilter, searchQuery, sortBy]);

  function handleToggleSelect(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleSelectAll() {
    if (selectedIds.size === filteredTasks.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredTasks.map(t => t.id)));
    }
  }

  function handleBulkStatus(status: TaskStatus) {
    setTasks(prev => prev.map(t => selectedIds.has(t.id) ? { ...t, status, updatedAt: new Date().toISOString() } : t));
    setSelectedIds(new Set());
  }

  function handleBulkPriority(priority: TaskPriority) {
    setTasks(prev => prev.map(t => selectedIds.has(t.id) ? { ...t, priority, updatedAt: new Date().toISOString() } : t));
    setSelectedIds(new Set());
  }

  function handleBulkDelete() {
    if (!confirm(`Delete ${selectedIds.size} selected task${selectedIds.size > 1 ? "s" : ""}?`)) return;
    setTasks(prev => prev.filter(t => !selectedIds.has(t.id)));
    setSelectedIds(new Set());
  }

  function handleSaveTask(payload: {
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    category: string;
    dueDate: string;
    assignee: string;
  }) {
    if (editingTask) {
      setTasks(prev =>
        prev.map(t => t.id === editingTask.id
          ? { ...t, ...payload, updatedAt: new Date().toISOString() }
          : t
        )
      );
    } else {
      const newTask: Task = {
        id: String(Date.now()),
        ...payload,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setTasks(prev => [newTask, ...prev]);
    }
    setModalOpen(false);
    setEditingTask(null);
  }

  return (
    <div className="app">
      <Sidebar categories={categories} counts={counts} completionRate={completionRate} />

      <div className="main-wrapper">
        <Topbar breadcrumbTitle="Tasks Dashboard" />

        <main className="content-area">
          <div className="hero">
            <div>
              <div className="hero-tag">TASK MANAGEMENT</div>
              <h1 className="hero-title">{getGreeting()}, Bishal 👋</h1>
              <p className="hero-desc">Plan your work, track progress, and keep every deadline visible across the team.</p>
            </div>
            <div className="hero-controls">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  if (confirm("Clear all completed tasks?")) {
                    setTasks(prev => prev.filter(t => t.status !== "Completed"));
                  }
                }}
              >
                Clear completed
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setEditingTask(null);
                  setModalOpen(true);
                }}
              >
                <Plus size={16} /> New task
              </button>
            </div>
          </div>

          <SummaryGrid summary={{ ...summary, ...counts, completionRate }} />

          <div className="dashboard-layout">
            <div className="panel-card">
              <div className="task-panel-header">
                <div className="task-panel-title">
                  <h2>Tasks Workspace</h2>
                  <p>Move tasks through workflow stages, set priorities, and collaborate.</p>
                </div>
                <div className="view-switchers">
                  <button
                    className={`view-switcher-btn ${viewMode === "list" ? "active" : ""}`}
                    onClick={() => setViewMode("list")}
                  >
                    Table
                  </button>
                  <button
                    className={`view-switcher-btn ${viewMode === "kanban" ? "active" : ""}`}
                    onClick={() => setViewMode("kanban")}
                  >
                    Kanban
                  </button>
                </div>
              </div>

              <FilterBar
                currentFilter={currentFilter}
                searchQuery={searchQuery}
                sortBy={sortBy}
                onFilterChange={setCurrentFilter}
                onSearchChange={setSearchQuery}
                onSortChange={setSortBy}
                onSavedViewChange={view =>
                  setCurrentFilter(view === "overdue-work" ? "overdue" : view === "today-focus" ? "today" : "all")
                }
              />

              <BulkActions
                selectedCount={selectedIds.size}
                onSetStatus={handleBulkStatus}
                onSetPriority={handleBulkPriority}
                onDelete={handleBulkDelete}
                onCancel={() => setSelectedIds(new Set())}
              />

              {viewMode === "list" ? (
                <TaskTable
                  tasks={filteredTasks}
                  statuses={statuses}
                  categories={categories}
                  selectedIds={selectedIds}
                  onToggleSelect={handleToggleSelect}
                  onSelectAll={handleSelectAll}
                  onOpenDetails={setActiveDrawerTask}
                  onEdit={task => {
                    setEditingTask(task);
                    setModalOpen(true);
                  }}
                  onDelete={task => {
                    if (confirm(`Delete "${task.title}"?`)) {
                      setTasks(prev => prev.filter(t => t.id !== task.id));
                    }
                  }}
                  onChangeStatus={(task, status) => {
                    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status, updatedAt: new Date().toISOString() } : t));
                  }}
                  onChangePriority={(task, priority) => {
                    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, priority, updatedAt: new Date().toISOString() } : t));
                  }}
                />
              ) : (
                <TaskKanban
                  tasks={filteredTasks}
                  categories={categories}
                  onOpenDetails={setActiveDrawerTask}
                  onAddTask={_status => {
                    setEditingTask(null);
                    setModalOpen(true);
                  }}
                  onMoveTask={(task, newStatus) => {
                    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t));
                  }}
                />
              )}
            </div>

            <Insights
              summary={{ ...summary, ...counts, completionRate }}
              upcoming={upcoming}
              onTaskClick={task => {
                const found = tasks.find(t => t.id === task.id);
                if (found) setActiveDrawerTask(found);
              }}
              onViewAllUpcoming={() => setCurrentFilter("upcoming")}
            />
          </div>
        </main>
      </div>

      <TaskDrawer
        task={activeDrawerTask}
        isOpen={Boolean(activeDrawerTask)}
        statuses={statuses}
        categories={categories}
        onClose={() => setActiveDrawerTask(null)}
        onUpdate={updated => {
          setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
          setActiveDrawerTask(updated);
        }}
        onDelete={task => {
          setTasks(prev => prev.filter(t => t.id !== task.id));
          setActiveDrawerTask(null);
        }}
      />

      <TaskModal
        isOpen={modalOpen}
        editingTask={editingTask}
        statuses={statuses}
        categories={categories}
        onClose={() => {
          setModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
      />
    </div>
  );
}
