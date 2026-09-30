import type {
  Task,
  Lookup,
  SystemSettings,
  AuditLogItem,
  UserAccount,
  DashboardSummary,
} from "@/types/task";

const STORAGE_KEYS = {
  TASKS: "taskly_tasks",
  CATEGORIES: "taskly_categories",
  STATUSES: "taskly_statuses",
  SETTINGS: "taskly_settings",
  AUDIT: "taskly_audit",
  USERS: "taskly_users",
};

export const DEFAULT_CATEGORIES: Lookup[] = [
  { id: "cat-work", name: "Work", color: "#6366F1", sortOrder: 1 },
  { id: "cat-personal", name: "Personal", color: "#F59E0B", sortOrder: 2 },
  { id: "cat-study", name: "Study", color: "#10B981", sortOrder: 3 },
  { id: "cat-marketing", name: "Marketing", color: "#EC4899", sortOrder: 4 },
  { id: "cat-operations", name: "Operations", color: "#0EA5E9", sortOrder: 5 },
  { id: "cat-admissions", name: "Admissions", color: "#8B5CF6", sortOrder: 6 },
  { id: "cat-finance", name: "Finance", color: "#14B8A6", sortOrder: 7 },
];

export const DEFAULT_STATUSES: Lookup[] = [
  { id: "st-not-started", code: "NOT_STARTED", name: "Not Started", color: "#64748B", sortOrder: 1 },
  { id: "st-in-progress", code: "IN_PROGRESS", name: "In Progress", color: "#3B82F6", sortOrder: 2 },
  { id: "st-completed", code: "COMPLETED", name: "Completed", color: "#10B981", sortOrder: 3 },
  { id: "st-on-hold", code: "ON_HOLD", name: "On Hold", color: "#F59E0B", sortOrder: 4 },
  { id: "st-blocked", code: "BLOCKED", name: "Blocked", color: "#EF4444", sortOrder: 5 },
];

export const DEFAULT_SETTINGS: SystemSettings = {
  appName: "Taskly",
  brandColor: "#FFAA00",
  theme: "light",
  defaultView: "list",
  auditEnabled: true,
};

export const DEFAULT_USERS: UserAccount[] = [
  { id: "usr-1", name: "Bishal", email: "bishal@taskly.com", role: "Lead Admin", status: "Active" },
  { id: "usr-2", name: "Anita", email: "anita@taskly.com", role: "Full-Stack Dev", status: "Active" },
  { id: "usr-3", name: "Rahul", email: "rahul@taskly.com", role: "Product Designer", status: "Active" },
  { id: "usr-4", name: "Priya", email: "priya@taskly.com", role: "QA Engineer", status: "Active" },
];

export const DEFAULT_AUDIT_LOGS: AuditLogItem[] = [
  { id: "aud-1", action: "Task Created", detail: "Created 'Finalize Taskly content plan'", user: "Bishal", timestamp: "Today, 10:00 AM" },
  { id: "aud-2", action: "Status Updated", detail: "Moved 'Prepare tomorrow''s team meeting' to Completed", user: "Bishal", timestamp: "Today, 1:45 PM" },
  { id: "aud-3", action: "Priority Changed", detail: "Updated 'Update CRM lead tracking system' to Medium", user: "Anita", timestamp: "Today, 2:30 PM" },
];

function calcISO(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export function getInitialTasks(): Task[] {
  return [
    {
      id: "10",
      title: "Follow up on pending approval",
      description: "Follow up on the pending approval and document the response for the team.",
      status: "Not Started",
      priority: "High",
      dueDate: calcISO(-1),
      category: "Operations",
      assignee: "Bishal",
      checklists: [
        { id: "c1", text: "Contact finance head", done: true },
        { id: "c2", text: "Log response in CRM", done: false },
      ],
      comments: [
        { id: "cm1", author: "Bishal", date: "Yesterday, 4:30 PM", text: "Awaiting final sign-off from director." },
      ],
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "1",
      title: "Finalize Taskly content plan",
      description: "Finalize the content calendar, topics, and publishing schedule for the next campaign.",
      status: "In Progress",
      priority: "High",
      dueDate: calcISO(0),
      category: "Marketing",
      assignee: "Bishal",
      checklists: [
        { id: "c1", text: "Review SEO keywords", done: true },
        { id: "c2", text: "Draft editorial calendar", done: true },
        { id: "c3", text: "Review with design team", done: false },
      ],
      comments: [
        { id: "cm2", author: "Anita", date: "Today, 11:15 AM", text: "Draft looks very promising. Ready for final review." },
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
      dueDate: calcISO(0),
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
      dueDate: calcISO(0),
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
      dueDate: calcISO(1),
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
      dueDate: calcISO(1),
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
      dueDate: calcISO(2),
      category: "Marketing",
      assignee: "Rahul",
      checklists: [],
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "7",
      title: "Monthly account reconciliation",
      description: "Match account ledger with bank statements.",
      status: "In Progress",
      priority: "High",
      dueDate: calcISO(3),
      category: "Finance",
      assignee: "Bishal",
      checklists: [],
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "8",
      title: "Organize digital workspace folders",
      description: "Archive old files and structure current quarter resources.",
      status: "Completed",
      priority: "Low",
      dueDate: calcISO(4),
      category: "Personal",
      assignee: "Anita",
      checklists: [],
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "9",
      title: "Weekly reflection and plan next week",
      description: "Review completed goals, pending tasks, and set priorities.",
      status: "Not Started",
      priority: "Medium",
      dueDate: calcISO(5),
      category: "Personal",
      assignee: "Bishal",
      checklists: [],
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

// LocalStorage helpers
function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Failed to write to localStorage:", e);
  }
}

export function loadStoredTasks(): Task[] {
  // Support both taskly_tasks and previous eml_tasks key
  const legacy = safeGet<Task[] | null>("eml_tasks", null);
  const current = safeGet<Task[]>(STORAGE_KEYS.TASKS, legacy || getInitialTasks());
  return current;
}

export function saveStoredTasks(tasks: Task[]): void {
  safeSet(STORAGE_KEYS.TASKS, tasks);
}

export function loadStoredCategories(): Lookup[] {
  const legacy = safeGet<Lookup[] | null>("eml_categories", null);
  return safeGet<Lookup[]>(STORAGE_KEYS.CATEGORIES, legacy || DEFAULT_CATEGORIES);
}

export function saveStoredCategories(categories: Lookup[]): void {
  safeSet(STORAGE_KEYS.CATEGORIES, categories);
}

export function loadStoredStatuses(): Lookup[] {
  const legacy = safeGet<Lookup[] | null>("eml_statuses", null);
  return safeGet<Lookup[]>(STORAGE_KEYS.STATUSES, legacy || DEFAULT_STATUSES);
}

export function loadStoredSettings(): SystemSettings {
  const legacy = safeGet<SystemSettings | null>("eml_settings", null);
  const settings = safeGet<SystemSettings>(STORAGE_KEYS.SETTINGS, legacy || DEFAULT_SETTINGS);
  if (!settings.appName || settings.appName === "EasyMyLearning") {
    settings.appName = "Taskly";
    safeSet(STORAGE_KEYS.SETTINGS, settings);
  }
  return settings;
}

export function saveStoredSettings(settings: SystemSettings): void {
  safeSet(STORAGE_KEYS.SETTINGS, settings);
}

export function loadStoredAuditLogs(): AuditLogItem[] {
  const legacy = safeGet<AuditLogItem[] | null>("eml_audit", null);
  return safeGet<AuditLogItem[]>(STORAGE_KEYS.AUDIT, legacy || DEFAULT_AUDIT_LOGS);
}

export function addStoredAuditLog(action: string, detail: string, user = "Bishal"): void {
  const logs = loadStoredAuditLogs();
  const newLog: AuditLogItem = {
    id: "aud-" + Date.now(),
    action,
    detail,
    user,
    timestamp: "Just now",
  };
  safeSet(STORAGE_KEYS.AUDIT, [newLog, ...logs].slice(0, 100));
}

export function calculateSummary(tasks: Task[]): DashboardSummary {
  const today = calcISO(0);
  const totalTasks = tasks.length;
  const notStarted = tasks.filter(t => t.status === "Not Started").length;
  const inProgress = tasks.filter(t => t.status === "In Progress").length;
  const completed = tasks.filter(t => t.status === "Completed").length;
  const overdue = tasks.filter(t => t.dueDate && t.dueDate < today && t.status !== "Completed").length;
  const completionRate = totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0;

  return {
    totalTasks,
    notStarted,
    inProgress,
    completed,
    overdue,
    completionRate,
  };
}

export function exportBackupJson(): string {
  const payload = {
    version: "1.0",
    appName: "Taskly",
    exportedAt: new Date().toISOString(),
    tasks: loadStoredTasks(),
    categories: loadStoredCategories(),
    statuses: loadStoredStatuses(),
    settings: loadStoredSettings(),
    auditLogs: loadStoredAuditLogs(),
  };
  return JSON.stringify(payload, null, 2);
}

export function importBackupJson(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (data.tasks) saveStoredTasks(data.tasks);
    if (data.categories) saveStoredCategories(data.categories);
    if (data.settings) saveStoredSettings(data.settings);
    return true;
  } catch {
    return false;
  }
}
