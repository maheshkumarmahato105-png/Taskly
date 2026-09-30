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
import type { DashboardSummary, Lookup, Task, TaskPriority, TaskStatus, UpcomingTask } from "@/types/task";
import { Plus } from "lucide-react";

const initialSummary: DashboardSummary = {
  totalTasks: 10,
  notStarted: 4,
  inProgress: 3,
  completed: 3,
  overdue: 1,
  completionRate: 30,
};

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

function getDemoTasks(): Task[] {
  const d = (offset: number) => {
    const dt = new Date();
    dt.setDate(dt.getDate() + offset);
    return dt.toISOString().slice(0, 10);
  };
  return [
    {
      id: "10",
      title: "Follow up on pending approval",
      description: "Follow up on the pending approval and document the response for the team.",
      status: "Not Started",
      priority: "High",
      dueDate: d(-1),
      category: "Operations",
      assignee: "Bishal",
      checklists: [
        { id: "c1", text: "Contact finance head", done: true },
        { id: "c2", text: "Log response in CRM", done: false },
      ],
      comments: [
        { id: "cm1", author: "Bishal", date: "Yesterday", text: "Awaiting final director sign-off." },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "1",
      title: "Finalize Taskly content plan",
      description: "Finalize the content calendar, topics, and publishing schedule for the next campaign.",
      status: "In Progress",
      priority: "High",
      dueDate: d(0),
      category: "Marketing",
      assignee: "Bishal",
      checklists: [
        { id: "c1", text: "Review SEO keywords", done: true },
        { id: "c2", text: "Draft editorial calendar", done: true },
        { id: "c3", text: "Review with design team", done: false },
      ],
      comments: [
        { id: "cm1", author: "Anita", date: "Today", text: "Draft looks very promising." },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "2",
      title: "Review student application documents",
      description: "Verify all required academic and identity documents before submission.",
      status: "Not Started",
      priority: "Medium",
      dueDate: d(0),
      category: "Admissions",
      assignee: "Priya",
      checklists: [],
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "3",
      title: "Prepare tomorrow's team meeting",
      description: "Prepare agenda, discussion points, metrics, and action items.",
      status: "Completed",
      priority: "High",
      dueDate: d(0),
      category: "Work",
      assignee: "Bishal",
      checklists: [],
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "4",
      title: "Update CRM lead tracking system",
      description: "Add lead status rules, follow-up fields, and dashboard tracking improvements.",
      status: "In Progress",
      priority: "Medium",
      dueDate: d(1),
      category: "Operations",
      assignee: "Anita",
      checklists: [],
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "5",
      title: "Read 20 pages of learning material",
      description: "Complete the selected chapter and note key takeaways.",
      status: "Completed",
      priority: "Low",
      dueDate: d(1),
      category: "Personal",
      assignee: "Bishal",
      checklists: [],
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "6",
      title: "Create social media content ideas",
      description: "Draft 10 short-form content ideas for social media.",
      status: "Not Started",
      priority: "Medium",
      dueDate: d(2),
      category: "Marketing",
      assignee: "Rahul",
      checklists: [],
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [statuses, setStatuses] = useState<Lookup[]>(initialStatuses);
  const [categories, setCategories] = useState<Lookup[]>(initialCategories);
  const [summary, setSummary] = useState<DashboardSummary>(initialSummary);
  const [upcoming, setUpcoming] = useState<UpcomingTask[]>([]);

  const [currentFilter, setCurrentFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [activeDrawerTask, setActiveDrawerTask] = useState<Task | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [taskRes, summaryRes, upcomingRes, statusRes, catRes] = await Promise.all([
          api.tasks(),
          api.summary(),
          api.upcoming(),
          api.statuses(),
          api.categories(),
        ]);
        setTasks(taskRes.items);
        setSummary(summaryRes);
        setUpcoming(upcomingRes.items);
        setStatuses(statusRes.items);
        setCategories(catRes.items);
      } catch {
        const demo = getDemoTasks();
        setTasks(demo);
        setSummary(initialSummary);
        setUpcoming([
          { id: "1", title: "Finalize Taskly content plan", status: "In Progress", category: "Marketing", dueDate: new Date().toISOString().slice(0, 10) },
          { id: "4", title: "Update CRM lead tracking system", status: "In Progress", category: "Operations", dueDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10) },
        ]);
      }
    }
    void loadData();
  }, []);

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
    let list = tasks.filter(t => {
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

    list.sort((a, b) => {
      if (sortBy === "priority") {
        const rank = { Urgent: 1, High: 2, Medium: 3, Low: 4 };
        return (rank[a.priority] || 9) - (rank[b.priority] || 9);
      }
      if (sortBy === "status") {
        const rank = { "In Progress": 1, "Not Started": 2, "Completed": 3 };
        return (rank[a.status] || 9) - (rank[b.status] || 9);
      }
      if (sortBy === "due") return (a.dueDate || "9999").localeCompare(b.dueDate || "9999");
      if (sortBy === "category") return (a.category || "").localeCompare(b.category || "");
      if (sortBy === "title") return a.title.localeCompare(b.title);
      return 0;
    });

    return list;
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
    setTasks(prev => prev.map(t => selectedIds.has(t.id) ? { ...t, status } : t));
    setSelectedIds(new Set());
  }

  function handleBulkPriority(priority: TaskPriority) {
    setTasks(prev => prev.map(t => selectedIds.has(t.id) ? { ...t, priority } : t));
    setSelectedIds(new Set());
  }

  function handleBulkDelete() {
    if (!confirm(`Delete ${selectedIds.size} selected tasks?`)) return;
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
      setTasks(prev => prev.map(t => t.id === editingTask.id ? { ...t, ...payload, updatedAt: new Date().toISOString() } : t));
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
              <h1 className="hero-title">Good evening, Bishal</h1>
              <p className="hero-desc">Plan your work, track progress, and keep every deadline visible across the team.</p>
            </div>
            <div className="hero-controls">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  if (confirm("Clear completed tasks?")) {
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
                onSavedViewChange={view => setCurrentFilter(view === "overdue-work" ? "overdue" : view === "today-focus" ? "today" : "all")}
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
                    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status } : t));
                  }}
                  onChangePriority={(task, priority) => {
                    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, priority } : t));
                  }}
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
                    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
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
