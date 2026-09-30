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
import { ArchitectureModal } from "@/components/layout/ArchitectureModal";
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
} from "@/lib/store";
import type { Lookup, Task, TaskPriority, TaskStatus, UpcomingTask } from "@/types/task";
import { Plus, FileText, Command } from "lucide-react";
import { toast } from "@/components/ui/Toast";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [statuses, setStatuses] = useState<Lookup[]>([]);
  const [categories, setCategories] = useState<Lookup[]>([]);
  const [upcoming, setUpcoming] = useState<UpcomingTask[]>([]);

  const [currentFilter, setCurrentFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const [activeDrawerTask, setActiveDrawerTask] = useState<Task | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [archModalOpen, setArchModalOpen] = useState(false);
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement | null>(null);

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

  // Save changes to storage
  useEffect(() => {
    if (tasks.length > 0) {
      saveStoredTasks(tasks);
    }
  }, [tasks]);

  // Read initial category from URL query parameters (e.g., ?category=Work)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get("category");
      if (cat) {
        setSelectedCategory(cat);
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
        setArchModalOpen(false);
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
      if (currentFilter === "today") return t.dueDate === today;
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
    setTasks(prev => prev.map(t => selectedIds.has(t.id) ? { ...t, status, updatedAt: new Date().toISOString() } : t));
    addStoredAuditLog("Bulk Status Update", `Updated ${count} tasks to ${status}`);
    toast.success("Bulk Status Updated", `Updated ${count} task${count > 1 ? "s" : ""} to ${status}`);
    setSelectedIds(new Set());
  }

  function handleBulkPriority(priority: TaskPriority) {
    const count = selectedIds.size;
    setTasks(prev => prev.map(t => selectedIds.has(t.id) ? { ...t, priority, updatedAt: new Date().toISOString() } : t));
    addStoredAuditLog("Bulk Priority Update", `Updated ${count} tasks to ${priority}`);
    toast.success("Bulk Priority Updated", `Updated ${count} task${count > 1 ? "s" : ""} to ${priority}`);
    setSelectedIds(new Set());
  }

  function handleBulkDelete() {
    const count = selectedIds.size;
    if (!confirm(`Delete ${count} selected task${count > 1 ? "s" : ""}?`)) return;
    setTasks(prev => prev.filter(t => !selectedIds.has(t.id)));
    addStoredAuditLog("Bulk Task Deletion", `Removed ${count} tasks`);
    toast.info("Bulk Tasks Deleted", `Removed ${count} task${count > 1 ? "s" : ""}`);
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
        onOpenArchitectureModal={() => setArchModalOpen(true)}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
      />

      <div className="main-wrapper">
        <Topbar
          breadcrumbTitle="Task Manager Workspace"
          onOpenArchitecture={() => setArchModalOpen(true)}
          onHelpClick={() => setShortcutsModalOpen(true)}
        />

        <main className="content-area">
          <div className="hero">
            <div>
              <div className="hero-tag" style={{ color: "#FFAA00" }}>EASYMYLEARNING TASK PLATFORM</div>
              <h1 className="hero-title">{getGreeting()}, Bishal 👋</h1>
              <p className="hero-desc">
                Next.js + React frontend | Go backend | PostgreSQL | Docker | REST API
              </p>
            </div>
            <div className="hero-controls">
              <button
                className="btn btn-secondary"
                onClick={() => setArchModalOpen(true)}
                title="View Full Architecture Plan"
              >
                <FileText size={15} style={{ color: "#FFAA00" }} /> Architecture Plan
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setShortcutsModalOpen(true)}
                title="View Keyboard Shortcuts (?)"
              >
                <Command size={15} /> Shortcuts
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
                onFilterChange={setCurrentFilter}
                onSearchChange={setSearchQuery}
                onSortChange={setSortBy}
                onSavedViewChange={view =>
                  setCurrentFilter(view === "overdue-work" ? "overdue" : view === "today-focus" ? "today" : "all")
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
                  }}
                  onChangePriority={(task, priority) => {
                    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, priority, updatedAt: new Date().toISOString() } : t));
                    addStoredAuditLog("Priority Changed", `'${task.title}' priority set to ${priority}`);
                    toast.success("Priority Updated", `'${task.title}' priority set to ${priority}`);
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
        onClose={() => setActiveDrawerTask(null)}
        onUpdate={updated => {
          setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
          setActiveDrawerTask(updated);
          toast.success("Task Saved", `'${updated.title}' saved`);
        }}
        onDelete={task => {
          setTasks(prev => prev.filter(t => t.id !== task.id));
          setActiveDrawerTask(null);
          toast.info("Task Deleted", `'${task.title}' deleted`);
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

      <ArchitectureModal isOpen={archModalOpen} onClose={() => setArchModalOpen(false)} />
      <ShortcutsModal isOpen={shortcutsModalOpen} onClose={() => setShortcutsModalOpen(false)} />
    </div>
  );
}
