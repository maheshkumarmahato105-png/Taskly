import type {
  Task,
  Lookup,
  SystemSettings,
  DashboardSummary,
  UpcomingTask,
  UserAccount,
  CustomFieldDefinition,
  DashboardWidgetConfig,
  InAppNotification,
} from "@/types/task";
import {
  DEFAULT_CATEGORIES,
  DEFAULT_STATUSES,
  DEFAULT_PRIORITIES,
  DEFAULT_SETTINGS,
  DEFAULT_USERS,
  DEFAULT_CUSTOM_FIELDS,
  DEFAULT_WIDGETS,
  DEFAULT_NOTIFICATIONS,
  getInitialTasks,
  calculateSummary,
} from "./store";

// Global singleton in Node.js serverless runtime memory
const globalStore = global as unknown as {
  __eml_tasks?: Task[];
  __eml_categories?: Lookup[];
  __eml_statuses?: Lookup[];
  __eml_priorities?: Lookup[];
  __eml_settings?: SystemSettings;
  __eml_users?: UserAccount[];
  __eml_custom_fields?: CustomFieldDefinition[];
  __eml_widgets?: DashboardWidgetConfig[];
  __eml_notifications?: InAppNotification[];
};

if (!globalStore.__eml_tasks) globalStore.__eml_tasks = getInitialTasks();
if (!globalStore.__eml_categories) globalStore.__eml_categories = [...DEFAULT_CATEGORIES];
if (!globalStore.__eml_statuses) globalStore.__eml_statuses = [...DEFAULT_STATUSES];
if (!globalStore.__eml_priorities) globalStore.__eml_priorities = [...DEFAULT_PRIORITIES];
if (!globalStore.__eml_settings) globalStore.__eml_settings = { ...DEFAULT_SETTINGS };
if (!globalStore.__eml_users) globalStore.__eml_users = [...DEFAULT_USERS];
if (!globalStore.__eml_custom_fields) globalStore.__eml_custom_fields = [...DEFAULT_CUSTOM_FIELDS];
if (!globalStore.__eml_widgets) globalStore.__eml_widgets = [...DEFAULT_WIDGETS];
if (!globalStore.__eml_notifications) globalStore.__eml_notifications = [...DEFAULT_NOTIFICATIONS];

export const serverDb = {
  getTasks: () => globalStore.__eml_tasks!,
  getTaskById: (id: string) => globalStore.__eml_tasks!.find(t => t.id === id),
  createTask: (data: Partial<Task>): Task => {
    const newTask: Task = {
      id: String(Date.now()),
      title: data.title || "Untitled Task",
      description: data.description || "",
      status: data.status || "Not Started",
      priority: data.priority || "Medium",
      category: data.category || "Work",
      dueDate: data.dueDate || null,
      assignee: data.assignee || "Bishal",
      checklists: data.checklists || [],
      comments: data.comments || [],
      attachments: data.attachments || [],
      customFields: data.customFields || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    globalStore.__eml_tasks!.unshift(newTask);
    return newTask;
  },
  updateTask: (id: string, updates: Partial<Task>): Task | null => {
    const idx = globalStore.__eml_tasks!.findIndex(t => t.id === id);
    if (idx === -1) return null;
    globalStore.__eml_tasks![idx] = {
      ...globalStore.__eml_tasks![idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return globalStore.__eml_tasks![idx];
  },
  deleteTask: (id: string): boolean => {
    const idx = globalStore.__eml_tasks!.findIndex(t => t.id === id);
    if (idx === -1) return false;
    globalStore.__eml_tasks!.splice(idx, 1);
    return true;
  },
  getCategories: () => globalStore.__eml_categories!,
  getStatuses: () => globalStore.__eml_statuses!,
  getPriorities: () => globalStore.__eml_priorities!,
  getSettings: () => globalStore.__eml_settings!,
  getUsers: () => globalStore.__eml_users!,
  getCustomFields: () => globalStore.__eml_custom_fields!,
  getWidgets: () => globalStore.__eml_widgets!,
  getNotifications: () => globalStore.__eml_notifications!,
  getSummary: (): DashboardSummary => calculateSummary(globalStore.__eml_tasks!),
  getUpcoming: (): UpcomingTask[] => {
    const today = new Date().toISOString().slice(0, 10);
    return globalStore.__eml_tasks!
      .filter(t => t.dueDate && t.dueDate >= today && t.status !== "Completed")
      .slice(0, 5)
      .map(t => ({
        id: t.id,
        title: t.title,
        status: t.status,
        category: t.category,
        dueDate: t.dueDate!,
      }));
  },
};
