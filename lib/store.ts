import type {
  Task,
  Lookup,
  SystemSettings,
  AuditLogItem,
  UserAccount,
  DashboardSummary,
  CustomFieldDefinition,
  DashboardWidgetConfig,
  InAppNotification,
} from "@/types/task";

const STORAGE_KEYS = {
  TASKS: "eml_tasks_v2",
  CATEGORIES: "eml_categories_v2",
  STATUSES: "eml_statuses_v2",
  PRIORITIES: "eml_priorities_v2",
  SETTINGS: "eml_settings_v2",
  AUDIT: "eml_audit_v2",
  USERS: "eml_users_v2",
  CUSTOM_FIELDS: "eml_custom_fields_v2",
  WIDGETS: "eml_widgets_v2",
  NOTIFICATIONS: "eml_notifications_v2",
};

export const DEFAULT_CATEGORIES: Lookup[] = [
  { id: "cat-work", name: "Work", color: "#6366F1", sortOrder: 1 },
  { id: "cat-study", name: "Study", color: "#10B981", sortOrder: 2 },
  { id: "cat-admissions", name: "Admissions", color: "#8B5CF6", sortOrder: 3 },
  { id: "cat-finance", name: "Finance", color: "#14B8A6", sortOrder: 4 },
  { id: "cat-marketing", name: "Marketing", color: "#EC4899", sortOrder: 5 },
  { id: "cat-operations", name: "Operations", color: "#0EA5E9", sortOrder: 6 },
  { id: "cat-personal", name: "Personal", color: "#F59E0B", sortOrder: 7 },
];

export const DEFAULT_STATUSES: Lookup[] = [
  { id: "st-not-started", code: "NOT_STARTED", name: "Not Started", color: "#64748B", sortOrder: 1 },
  { id: "st-in-progress", code: "IN_PROGRESS", name: "In Progress", color: "#2563EB", sortOrder: 2 },
  { id: "st-blocked", code: "BLOCKED", name: "Blocked", color: "#EF4444", sortOrder: 3 },
  { id: "st-completed", code: "COMPLETED", name: "Completed", color: "#10B981", sortOrder: 4 },
  { id: "st-on-hold", code: "ON_HOLD", name: "On Hold", color: "#F59E0B", sortOrder: 5 },
];

export const DEFAULT_PRIORITIES: Lookup[] = [
  { id: "pr-low", code: "LOW", name: "Low", color: "#10B981", sortOrder: 1 },
  { id: "pr-medium", code: "MEDIUM", name: "Medium", color: "#F59E0B", sortOrder: 2 },
  { id: "pr-high", code: "HIGH", name: "High", color: "#F97316", sortOrder: 3 },
  { id: "pr-urgent", code: "URGENT", name: "Urgent", color: "#EF4444", sortOrder: 4 },
];

export const DEFAULT_SETTINGS: SystemSettings = {
  appName: "EasyMyLearning",
  brandColor: "#FFAA00",
  theme: "light",
  defaultView: "list",
  auditEnabled: true,
  companyName: "EasyMyLearning Inc.",
  supportEmail: "support@easymylearning.com",
};

export const DEFAULT_USERS: UserAccount[] = [
  { id: "usr-1", name: "Bishal", email: "bishal@easymylearning.com", role: "Lead Admin", status: "Active", avatar: "BJ" },
  { id: "usr-2", name: "Anita", email: "anita@easymylearning.com", role: "Full-Stack Dev", status: "Active", avatar: "AS" },
  { id: "usr-3", name: "Rahul", email: "rahul@easymylearning.com", role: "Product Designer", status: "Active", avatar: "RM" },
  { id: "usr-4", name: "Priya", email: "priya@easymylearning.com", role: "QA Engineer", status: "Active", avatar: "PS" },
];

export const DEFAULT_CUSTOM_FIELDS: CustomFieldDefinition[] = [
  {
    id: "cf-1",
    name: "Follow-up Date",
    key: "follow_up_date",
    type: "date",
    placeholder: "YYYY-MM-DD",
    required: false,
  },
  {
    id: "cf-2",
    name: "Reference Number",
    key: "reference_number",
    type: "text",
    placeholder: "e.g. EML-2026-084",
    required: false,
  },
];

export const DEFAULT_WIDGETS: DashboardWidgetConfig[] = [
  { id: "w-summary", name: "Workflow Summary Cards", description: "Total, active, completed and overdue counts", enabled: true, position: 1 },
  { id: "w-tasks", name: "Tasks Workspace Table/Kanban", description: "Primary collaborative tasks panel", enabled: true, position: 2 },
  { id: "w-upcoming", name: "Upcoming Deadlines", description: "Shortlist of approaching tasks", enabled: true, position: 3 },
  { id: "w-insights", name: "Productivity & Completion Rate", description: "Daily completion progress and recommendations", enabled: true, position: 4 },
];

export const DEFAULT_NOTIFICATIONS: InAppNotification[] = [
  {
    id: "notif-1",
    title: "Overdue Task Alert",
    message: "'Follow up on pending approval' is past its scheduled deadline.",
    type: "overdue",
    timestamp: "10m ago",
    read: false,
    taskId: "10",
  },
  {
    id: "notif-2",
    title: "New Assignment",
    message: "You were assigned to 'Finalize Taskly content plan' by Bishal.",
    type: "assignment",
    timestamp: "1h ago",
    read: false,
    taskId: "1",
  },
  {
    id: "notif-3",
    title: "Discussion Update",
    message: "Anita commented on 'Finalize Taskly content plan'.",
    type: "comment",
    timestamp: "3h ago",
    read: true,
    taskId: "1",
  },
];

export const DEFAULT_AUDIT_LOGS: AuditLogItem[] = [
  { id: "aud-1", action: "Task Created", detail: "Created 'Prepare monthly report' in Operations", user: "Bishal", timestamp: "Today, 10:00 AM" },
  { id: "aud-2", action: "Status Updated", detail: "Moved 'Prepare tomorrow''s team meeting' to Completed", user: "Bishal", timestamp: "Today, 11:30 AM" },
  { id: "aud-3", action: "Priority Changed", detail: "Updated 'Finalize Taskly content plan' to High", user: "Anita", timestamp: "Today, 1:15 PM" },
  { id: "aud-4", action: "Checklist Updated", detail: "Completed 'Collect data' in Operations task", user: "Bishal", timestamp: "Today, 2:45 PM" },
];

function calcISO(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export function getInitialTasks(): Task[] {
  return [
    {
      id: "101",
      title: "Prepare monthly report",
      description: "Finalize KPI report, summarize departmental metrics, and review variance.",
      status: "In Progress",
      priority: "High",
      dueDate: calcISO(4),
      category: "Operations",
      assignee: "Bishal",
      customFields: {
        follow_up_date: calcISO(5),
        reference_number: "EML-OPS-101",
      },
      checklists: [
        { id: "c1", text: "Collect data", done: true },
        { id: "c2", text: "Verify figures", done: true },
        { id: "c3", text: "Finalize charts", done: false },
      ],
      comments: [
        { id: "cm1", author: "Bishal", date: "Today, 09:15 AM", text: "Data collection completed from all leads." },
        { id: "cm2", author: "Anita", date: "Today, 10:30 AM", text: "Finance numbers match the reconciliation ledger." },
      ],
      attachments: [
        { id: "att-1", name: "Monthly_KPI_Summary.pdf", size: "2.4 MB", type: "application/pdf", uploadedAt: "Today, 9:00 AM" },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "10",
      title: "Follow up on pending approval",
      description: "Follow up on the pending budget approval and document the sign-off for the board.",
      status: "Not Started",
      priority: "Urgent",
      dueDate: calcISO(-1),
      category: "Finance",
      assignee: "Bishal",
      customFields: {
        follow_up_date: calcISO(0),
        reference_number: "EML-FIN-009",
      },
      checklists: [
        { id: "c1", text: "Contact finance director", done: true },
        { id: "c2", text: "Log response in audit register", done: false },
      ],
      comments: [
        { id: "cm10", author: "Bishal", date: "Yesterday, 4:30 PM", text: "Follow-up email sent. Awaiting response." },
      ],
      attachments: [],
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "1",
      title: "Finalize EasyMyLearning marketing plan",
      description: "Finalize quarterly marketing channels, SEO campaign, and student outreach roadmap.",
      status: "In Progress",
      priority: "High",
      dueDate: calcISO(0),
      category: "Marketing",
      assignee: "Rahul",
      customFields: {
        follow_up_date: calcISO(2),
        reference_number: "EML-MKT-042",
      },
      checklists: [
        { id: "c11", text: "Review Google Ads performance", done: true },
        { id: "c12", text: "Outline content calendar", done: true },
        { id: "c13", text: "Coordinate social banners with design", done: false },
      ],
      comments: [
        { id: "cm11", author: "Anita", date: "Today, 11:15 AM", text: "Draft looks solid, targeting launch next Monday." },
      ],
      attachments: [
        { id: "att-2", name: "Marketing_Plan_Q4.pdf", size: "1.1 MB", type: "application/pdf", uploadedAt: "Yesterday" },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "2",
      title: "Review student admissions dossiers",
      description: "Verify academic transcripts, eligibility criteria, and identity documents for international cohort.",
      status: "Not Started",
      priority: "Medium",
      dueDate: calcISO(0),
      category: "Admissions",
      assignee: "Priya",
      customFields: {
        reference_number: "EML-ADM-204",
      },
      checklists: [
        { id: "c21", text: "Verify certificate authenticity", done: false },
        { id: "c22", text: "Issue conditional acceptance letters", done: false },
      ],
      comments: [],
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "3",
      title: "Team sprint retrospective meeting",
      description: "Discuss delivery velocity, architecture plan review, and upcoming milestone deliverables.",
      status: "Completed",
      priority: "High",
      dueDate: calcISO(0),
      category: "Work",
      assignee: "Bishal",
      customFields: {
        reference_number: "EML-DEV-007",
      },
      checklists: [
        { id: "c31", text: "Compile sprint velocity metrics", done: true },
        { id: "c32", text: "Distribute meeting notes", done: true },
      ],
      comments: [
        { id: "cm31", author: "Bishal", date: "Today, 2:00 PM", text: "Great session. Action items documented." },
      ],
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "4",
      title: "Update CRM student tracking system",
      description: "Implement configurable status transitions, custom fields for follow-ups, and webhook alerts.",
      status: "In Progress",
      priority: "Medium",
      dueDate: calcISO(1),
      category: "Study",
      assignee: "Anita",
      customFields: {
        follow_up_date: calcISO(3),
        reference_number: "EML-DEV-018",
      },
      checklists: [
        { id: "c41", text: "Design database migrations", done: true },
        { id: "c42", text: "Implement Go REST endpoints", done: false },
      ],
      comments: [],
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "5",
      title: "Complete cloud infrastructure study module",
      description: "Read Docker, PostgreSQL scaling, and Cloudflare CDN proxy deployment architecture documentation.",
      status: "Completed",
      priority: "Low",
      dueDate: calcISO(1),
      category: "Study",
      assignee: "Bishal",
      checklists: [],
      comments: [],
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "6",
      title: "Design social media educational graphics",
      description: "Create 6 high-contrast infographic carousels explaining study habits and productivity hacks.",
      status: "Blocked",
      priority: "Medium",
      dueDate: calcISO(2),
      category: "Marketing",
      assignee: "Rahul",
      customFields: {
        reference_number: "EML-MKT-088",
      },
      checklists: [
        { id: "c61", text: "Finalize copy text", done: true },
        { id: "c62", text: "Awaiting brand asset approval", done: false },
      ],
      comments: [
        { id: "cm61", author: "Rahul", date: "Today, 12:00 PM", text: "Blocked on final brand guidelines." },
      ],
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "7",
      title: "Quarterly financial reconciliation",
      description: "Audit incoming tuition receipts, Stripe payments, and server infrastructure invoices.",
      status: "In Progress",
      priority: "High",
      dueDate: calcISO(3),
      category: "Finance",
      assignee: "Bishal",
      customFields: {
        reference_number: "EML-FIN-104",
      },
      checklists: [],
      comments: [],
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "8",
      title: "Clean and archive old study materials",
      description: "Structure current quarter folders in cloud storage and remove deprecated syllabus files.",
      status: "Completed",
      priority: "Low",
      dueDate: calcISO(4),
      category: "Personal",
      assignee: "Anita",
      checklists: [],
      comments: [],
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

// LocalStorage helpers with SSR safety
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
  return safeGet<Task[]>(STORAGE_KEYS.TASKS, getInitialTasks());
}

export function saveStoredTasks(tasks: Task[]): void {
  safeSet(STORAGE_KEYS.TASKS, tasks);
}

export function loadStoredCategories(): Lookup[] {
  return safeGet<Lookup[]>(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
}

export function saveStoredCategories(categories: Lookup[]): void {
  safeSet(STORAGE_KEYS.CATEGORIES, categories);
}

export function loadStoredStatuses(): Lookup[] {
  return safeGet<Lookup[]>(STORAGE_KEYS.STATUSES, DEFAULT_STATUSES);
}

export function saveStoredStatuses(statuses: Lookup[]): void {
  safeSet(STORAGE_KEYS.STATUSES, statuses);
}

export function loadStoredPriorities(): Lookup[] {
  return safeGet<Lookup[]>(STORAGE_KEYS.PRIORITIES, DEFAULT_PRIORITIES);
}

export function saveStoredPriorities(priorities: Lookup[]): void {
  safeSet(STORAGE_KEYS.PRIORITIES, priorities);
}

export function loadStoredSettings(): SystemSettings {
  return safeGet<SystemSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
}

export function saveStoredSettings(settings: SystemSettings): void {
  safeSet(STORAGE_KEYS.SETTINGS, settings);
}

export function loadStoredUsers(): UserAccount[] {
  return safeGet<UserAccount[]>(STORAGE_KEYS.USERS, DEFAULT_USERS);
}

export function saveStoredUsers(users: UserAccount[]): void {
  safeSet(STORAGE_KEYS.USERS, users);
}

export function loadStoredCustomFields(): CustomFieldDefinition[] {
  return safeGet<CustomFieldDefinition[]>(STORAGE_KEYS.CUSTOM_FIELDS, DEFAULT_CUSTOM_FIELDS);
}

export function saveStoredCustomFields(fields: CustomFieldDefinition[]): void {
  safeSet(STORAGE_KEYS.CUSTOM_FIELDS, fields);
}

export function loadStoredWidgets(): DashboardWidgetConfig[] {
  return safeGet<DashboardWidgetConfig[]>(STORAGE_KEYS.WIDGETS, DEFAULT_WIDGETS);
}

export function saveStoredWidgets(widgets: DashboardWidgetConfig[]): void {
  safeSet(STORAGE_KEYS.WIDGETS, widgets);
}

export function loadStoredNotifications(): InAppNotification[] {
  return safeGet<InAppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, DEFAULT_NOTIFICATIONS);
}

export function saveStoredNotifications(notifs: InAppNotification[]): void {
  safeSet(STORAGE_KEYS.NOTIFICATIONS, notifs);
}

export function loadStoredAuditLogs(): AuditLogItem[] {
  return safeGet<AuditLogItem[]>(STORAGE_KEYS.AUDIT, DEFAULT_AUDIT_LOGS);
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
    version: "2.0",
    appName: "EasyMyLearning Task Manager",
    exportedAt: new Date().toISOString(),
    tasks: loadStoredTasks(),
    categories: loadStoredCategories(),
    statuses: loadStoredStatuses(),
    priorities: loadStoredPriorities(),
    customFields: loadStoredCustomFields(),
    widgets: loadStoredWidgets(),
    settings: loadStoredSettings(),
    users: loadStoredUsers(),
    auditLogs: loadStoredAuditLogs(),
  };
  return JSON.stringify(payload, null, 2);
}

export function importBackupJson(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (data.tasks) saveStoredTasks(data.tasks);
    if (data.categories) saveStoredCategories(data.categories);
    if (data.statuses) saveStoredStatuses(data.statuses);
    if (data.priorities) saveStoredPriorities(data.priorities);
    if (data.settings) saveStoredSettings(data.settings);
    if (data.customFields) saveStoredCustomFields(data.customFields);
    return true;
  } catch {
    return false;
  }
}
