"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
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
import { ShortcutsModal } from "@/components/layout/ShortcutsModal";
import { api } from "@/lib/api";
import {
  loadStoredTasks,
  saveStoredTasks,
  loadStoredCategories,
  loadStoredStatuses,
  loadStoredSettings,
  calculateSummary,
  addStoredAuditLog,
  DEFAULT_CATEGORIES,
  DEFAULT_STATUSES,
  DEFAULT_USERS,
} from "@/lib/store";
import type { Lookup, Task, TaskPriority, TaskStatus, UpcomingTask, UserAccount } from "@/types/task";
import { Plus, Command, ShieldAlert } from "lucide-react";
import { toast } from "@/components/ui/Toast";
import { useAuth } from "@/context/AuthContext";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function HomePage() {
  const { user: authUser, can, roleTitle } = useAuth();
  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window !== "undefined") return loadStoredTasks();
    return [];
  });
  const [statuses, setStatuses] = useState<Lookup[]>(() => {
    if (typeof window !== "undefined") return loadStoredStatuses();
    return DEFAULT_STATUSES;
  });
  const [categories, setCategories] = useState<Lookup[]>(() => {
    if (typeof window !== "undefined") return loadStoredCategories();
    return DEFAULT_CATEGORIES;
  });
  const [users, setUsers] = useState<UserAccount[]>(() => DEFAULT_USERS);
  const [upcoming, setUpcoming] = useState<UpcomingTask[]>(() => {
    if (typeof window !== "undefined") {
      const stored = loadStoredTasks();
      const today = new Date().toISOString().slice(0, 10);
      return stored
        .filter(t => t.dueDate && t.dueDate >= today && t.status !== "Completed")
        .slice(0, 4)
        .map(t => ({ id: t.id, title: t.title, status: t.status, category: t.category, dueDate: t.dueDate! }));
    }
    return [];
  });

  const [currentFilter, setCurrentFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const [activeDrawerTask, setActiveDrawerTask] = useState<Task | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Background refresh — if backend is available, sync updates quietly without UI flicker
  useEffect(() => {
    async function loadData() {
      try {
        const [taskRes, upcomingRes, statusRes, catRes, userRes] = await Promise.all([
          api.tasks(),
          api.upcoming(),
          api.statuses(),
          api.categories(),
          api.users(),
        ]);
        if (taskRes?.items?.length) setTasks(taskRes.items);
        if (upcomingRes?.items?.length) setUpcoming(upcomingRes.items);
        if (statusRes?.items?.length) setStatuses(statusRes.items);
        if (catRes?.items?.length) setCategories(catRes.items);
        if (userRes?.items?.length) setUsers(userRes.items);
      } catch {
        // Data already loaded synchronously from localStorage on mount.
      }
    }
    void loadData();
  }, []);

  // Save changes to storage
  useEffect(() => {
    if (tasks.length > 0) {
      saveStoredTasks(tasks);
    }
  }, [tasks]);

  // Read initial category and filter from URL query parameters (e.g., ?category=Work&filter=today)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get("category");
      if (cat) {
        setSelectedCategory(cat);
      }
      const f = params.get("filter");
      if (f) {
        setCurrentFilter(f);
      }
    }
  }, []);

  const handleSelectCategory = (catName: string) => {
    setSelectedCategory(catName);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (catName) {
        url.searchParams.set("category", catName);
      } else {
        url.searchParams.delete("category");
      }
      window.history.pushState({}, "", url.toString());
    }
  };

  const handleFilterChange = (filterKey: string) => {
    setCurrentFilter(filterKey);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (filterKey === "all") {
        url.searchParams.delete("filter");
      } else {
        url.searchParams.set("filter", filterKey);
      }
      window.history.pushState({}, "", url.toString());
    }
  };

  // Global Keyboard Shortcuts (PDF Page 7)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === "input" || activeTag === "textarea" || activeTag === "select") {
        if (e.key === "Escape") {
          (document.activeElement as HTMLElement)?.blur();
        }
        return;
      }

      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        setEditingTask(null);
        setModalOpen(true);
      } else if (e.key === "/") {
        e.preventDefault();
        const input = document.querySelector(".search-input") as HTMLInputElement;
        if (input) input.focus();
      } else if (e.key === "k" || e.key === "K") {
        e.preventDefault();
        setViewMode(prev => prev === "list" ? "kanban" : "list");
      } else if (e.key === "?") {
        e.preventDefault();
        setShortcutsModalOpen(true);
      } else if (e.key === "Escape") {
        setActiveDrawerTask(null);
        setModalOpen(false);
        setShortcutsModalOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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

  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = {};
    tasks.forEach(t => {
      map[t.category] = (map[t.category] || 0) + 1;
    });
    return map;
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const list = tasks.filter(t => {
      // Exclusively filter by selected category if one is chosen
      if (selectedCategory && t.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
      if (searchQuery) {
        const str = `${t.title} ${t.description} ${t.category} ${t.status} ${t.priority} ${t.customFields?.reference_number || ""}`.toLowerCase();
        if (!str.includes(searchQuery.toLowerCase())) return false;
      }
      if (currentFilter === "today") return Boolean(t.dueDate === today && t.status !== "Completed");
      if (currentFilter === "upcoming") return Boolean(t.dueDate && t.dueDate > today && t.status !== "Completed");
      if (currentFilter === "completed") return t.status === "Completed";
      if (currentFilter === "not-started") return t.status === "Not Started";
      if (currentFilter === "in-progress") return t.status === "In Progress";
      if (currentFilter === "blocked") return t.status === "Blocked" || t.status === "On Hold";
      if (currentFilter === "high") return t.priority === "High" || t.priority === "Urgent";
      if (currentFilter === "overdue") return Boolean(t.dueDate && t.dueDate < today && t.status !== "Completed");
      if (currentFilter.startsWith("category:")) return t.category.toLowerCase() === currentFilter.slice(9).toLowerCase();
      return true;
    });

    return [...list].sort((a, b) => {
      if (sortBy === "priority") {
        const rank: Record<string, number> = { Urgent: 1, High: 2, Medium: 3, Low: 4 };
        return (rank[a.priority] ?? 9) - (rank[b.priority] ?? 9);
      }
      if (sortBy === "status") {
        const rank: Record<string, number> = { "In Progress": 1, Blocked: 2, "Not Started": 3, Completed: 4 };
        return (rank[a.status] ?? 9) - (rank[b.status] ?? 9);
      }
      if (sortBy === "due") return (a.dueDate || "9999").localeCompare(b.dueDate || "9999");
      if (sortBy === "category") return (a.category || "").localeCompare(b.category || "");
      if (sortBy === "title") return a.title.localeCompare(b.title);
      return 0;
    });
  }, [tasks, currentFilter, searchQuery, sortBy, selectedCategory]);

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
    const count = selectedIds.size;
    const ids = Array.from(selectedIds);
    setTasks(prev => prev.map(t => selectedIds.has(t.id) ? { ...t, status, updatedAt: new Date().toISOString() } : t));
    addStoredAuditLog("Bulk Status Update", `Updated ${count} tasks to ${status}`);
    toast.success("Bulk Status Updated", `Updated ${count} task${count > 1 ? "s" : ""} to ${status}`);
    api.bulkAction({ taskIds: ids, action: "update_status", status }).catch(() => {});
    setSelectedIds(new Set());
  }

  function handleBulkPriority(priority: TaskPriority) {
    const count = selectedIds.size;
    const ids = Array.from(selectedIds);
    setTasks(prev => prev.map(t => selectedIds.has(t.id) ? { ...t, priority, updatedAt: new Date().toISOString() } : t));
    addStoredAuditLog("Bulk Priority Update", `Updated ${count} tasks to ${priority}`);
    toast.success("Bulk Priority Updated", `Updated ${count} task${count > 1 ? "s" : ""} to ${priority}`);
    api.bulkAction({ taskIds: ids, action: "update_priority", priority }).catch(() => {});
    setSelectedIds(new Set());
  }

  function handleBulkDelete() {
    const count = selectedIds.size;
    const ids = Array.from(selectedIds);
    if (!confirm(`Delete ${count} selected task${count > 1 ? "s" : ""}?`)) return;
    setTasks(prev => prev.filter(t => !selectedIds.has(t.id)));
    addStoredAuditLog("Bulk Task Deletion", `Removed ${count} tasks`);
    toast.info("Bulk Tasks Deleted", `Removed ${count} task${count > 1 ? "s" : ""}`);
    api.bulkAction({ taskIds: ids, action: "archive" }).catch(() => {});
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
    customFields?: Record<string, string>;
  }) {
    if (editingTask) {
      setTasks(prev =>
        prev.map(t => t.id === editingTask.id
          ? { ...t, ...payload, updatedAt: new Date().toISOString() }
          : t
        )
      );
      addStoredAuditLog("Task Updated", `Updated '${payload.title}' (${payload.status})`);
      toast.success("Task Updated", `'${payload.title}' was successfully updated`);
      api.updateTask(editingTask.id, payload).catch(() => {});
    } else {
      const newTask: Task = {
        id: String(Date.now()),
        ...payload,
        checklists: [
          { id: "c1", text: "Collect data", done: true },
          { id: "c2", text: "Verify figures", done: false },
          { id: "c3", text: "Finalize charts", done: false },
        ],
        comments: [],
        attachments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setTasks(prev => [newTask, ...prev]);
      addStoredAuditLog("Task Created", `Created '${payload.title}' in ${payload.category}`);
      toast.success("Task Created", `'${payload.title}' created in ${payload.category}`);
      api.createTask(newTask).then(created => {
        if (created?.id) {
          setTasks(prev => prev.map(t => t.id === newTask.id ? { ...created, ...newTask, id: created.id } : t));
        }
      }).catch(() => {});
    }
    setModalOpen(false);
    setEditingTask(null);
  }

  return (
    <div className="app">
      <Sidebar
        categories={categories}
        counts={counts}
        completionRate={completionRate}
        brandName="EasyMyLearning"
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        currentFilter={currentFilter}
        onFilterChange={handleFilterChange}
        categoryCounts={categoryCounts}
      />

      <div className="main-wrapper">
        <Topbar
          breadcrumbTitle="Task Manager Workspace"
          onHelpClick={() => setShortcutsModalOpen(true)}
          userName={authUser?.name}
          userRole={authUser?.roleTitle || roleTitle}
        />

        <main className="content-area">
          <div className="hero">
            <div>
              <div className="hero-tag" style={{ color: "#FFAA00" }}>EASYMYLEARNING TASK PLATFORM</div>
              <h1 className="hero-title">{getGreeting()}, {authUser?.name || "Bishal"} 👋</h1>
              <p className="hero-desc">
                Next.js + React frontend | Go backend | PostgreSQL | Docker | REST API
              </p>
              {!can("tasks:create") && (
                <div
                  style={{
                    marginTop: "10px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "rgba(239, 68, 68, 0.12)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    color: "#EF4444",
                    fontWeight: 700,
                  }}
                >
                  <ShieldAlert size={14} /> Read-Only Viewer mode (RBAC Policy Active)
                </div>
              )}
            </div>
            <div className="hero-controls">
              <button
                className="btn btn-secondary"
                onClick={() => setShortcutsModalOpen(true)}
                title="View Keyboard Shortcuts (?)"
              >
                <Command size={15} /> Shortcuts
              </button>
              {can("tasks:create") ? (
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setEditingTask(null);
                    setModalOpen(true);
                  }}
                >
                  <Plus size={16} /> New task
                </button>
              ) : (
                <button
                  className="btn btn-secondary"
                  disabled
                  title="Viewer role cannot create tasks per RBAC"
                  style={{ opacity: 0.6, cursor: "not-allowed" }}
                >
                  <Plus size={16} /> Read-Only
                </button>
              )}
            </div>
          </div>

          <SummaryGrid summary={{ ...summary, ...counts, completionRate }} />

          <div className="dashboard-layout">
            <div className="panel-card">
              <div className="task-panel-header">
                <div className="task-panel-title">
                  <h2>Tasks Workspace</h2>
                  <p>Move tasks through workflow stages, set priorities, and collaborate in real-time.</p>
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
                onFilterChange={handleFilterChange}
                onSearchChange={setSearchQuery}
                onSortChange={setSortBy}
                onSavedViewChange={view =>
                  handleFilterChange(view === "overdue-work" ? "overdue" : view === "today-focus" ? "today" : "all")
                }
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={handleSelectCategory}
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
                      addStoredAuditLog("Task Deleted", `Deleted '${task.title}'`);
                      toast.info("Task Deleted", `'${task.title}' was deleted`);
                    }
                  }}
                  onChangeStatus={(task, status) => {
                    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status, updatedAt: new Date().toISOString() } : t));
                    addStoredAuditLog("Status Changed", `'${task.title}' moved to ${status}`);
                    toast.success("Status Updated", `'${task.title}' moved to ${status}`);
                    api.updateStatus(task.id, status).catch(() => {});
                  }}
                  onChangePriority={(task, priority) => {
                    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, priority, updatedAt: new Date().toISOString() } : t));
                    addStoredAuditLog("Priority Changed", `'${task.title}' priority set to ${priority}`);
                    toast.success("Priority Updated", `'${task.title}' priority set to ${priority}`);
                    api.updatePriority(task.id, priority).catch(() => {});
                  }}
                  onSelectCategory={handleSelectCategory}
                />
              ) : (
                <TaskKanban
                  tasks={filteredTasks}
                  categories={categories}
                  onOpenDetails={setActiveDrawerTask}
                  onAddTask={status => {
                    setEditingTask(null);
                    setModalOpen(true);
                  }}
                  onMoveTask={(task, newStatus) => {
                    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t));
                    addStoredAuditLog("Status Transition", `'${task.title}' moved to ${newStatus}`);
                    toast.success("Status Transition", `'${task.title}' moved to ${newStatus}`);
                    api.updateStatus(task.id, newStatus).catch(() => {});
                  }}
                  onSelectCategory={handleSelectCategory}
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
        users={users}
        onClose={() => setActiveDrawerTask(null)}
        onUpdate={updated => {
          if (!can("tasks:edit")) {
            toast.error("Read-Only Mode", "Viewer role cannot modify task properties.");
            return;
          }
          setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
          setActiveDrawerTask(updated);
          toast.success("Task Saved", `'${updated.title}' saved`);
          api.updateTask(updated.id, updated).catch(() => {});
        }}
        onDelete={task => {
          if (!can("tasks:delete")) {
            toast.error("Access Denied", "Viewer/Developer roles cannot delete tasks. Requires Manager or Lead Admin.");
            return;
          }
          setTasks(prev => prev.filter(t => t.id !== task.id));
          setActiveDrawerTask(null);
          toast.info("Task Deleted", `'${task.title}' deleted`);
          api.deleteTask(task.id).catch(() => {});
        }}
      />

      <TaskModal
        isOpen={modalOpen}
        editingTask={editingTask}
        statuses={statuses}
        categories={categories}
        users={users}
        onClose={() => {
          setModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
      />

      <ShortcutsModal isOpen={shortcutsModalOpen} onClose={() => setShortcutsModalOpen(false)} />
    </div>
  );
}
