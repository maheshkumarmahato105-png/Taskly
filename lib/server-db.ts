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
  AuditLogItem,
  ChecklistItem,
  TaskComment,
  TaskAttachment,
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
  DEFAULT_AUDIT_LOGS,
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
  __eml_audit_logs?: AuditLogItem[];
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
if (!globalStore.__eml_audit_logs) globalStore.__eml_audit_logs = [...DEFAULT_AUDIT_LOGS];

export const serverDb = {
  // Tasks
  getTasks: (filter?: { status?: string; category?: string; priority?: string; search?: string; overdue?: boolean }) => {
    let list = [...globalStore.__eml_tasks!];
    if (filter?.status) {
      list = list.filter(t => t.status.toLowerCase() === filter.status!.toLowerCase());
    }
    if (filter?.category) {
      list = list.filter(t => t.category.toLowerCase() === filter.category!.toLowerCase());
    }
    if (filter?.priority) {
      list = list.filter(t => t.priority.toLowerCase() === filter.priority!.toLowerCase());
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    }
    if (filter?.overdue) {
      const today = new Date().toISOString().slice(0, 10);
      list = list.filter(t => t.dueDate && t.dueDate < today && t.status !== "Completed");
    }
    return list;
  },

  getTaskById: (id: string) => globalStore.__eml_tasks!.find(t => t.id === id),

  createTask: (data: Partial<Task>): Task => {
    const newTask: Task = {
      id: "t" + Date.now(),
      title: data.title || "Untitled Task",
      description: data.description || "",
      status: data.status || "Not Started",
      priority: data.priority || "Medium",
      category: data.category || "Work",
      dueDate: data.dueDate || null,
      assignee: data.assignee || "Bishal (Lead)",
      checklists: data.checklists || [],
      comments: data.comments || [],
      attachments: data.attachments || [],
      customFields: data.customFields || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    globalStore.__eml_tasks!.unshift(newTask);
    serverDb.addAuditLog("TASK_CREATED", `Task '${newTask.title}' created`);
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
    serverDb.addAuditLog("TASK_UPDATED", `Task '${globalStore.__eml_tasks![idx].title}' updated`);
    return globalStore.__eml_tasks![idx];
  },

  deleteTask: (id: string): boolean => {
    const idx = globalStore.__eml_tasks!.findIndex(t => t.id === id);
    if (idx === -1) return false;
    const removed = globalStore.__eml_tasks!.splice(idx, 1)[0];
    serverDb.addAuditLog("TASK_ARCHIVED", `Task '${removed.title}' archived`);
    return true;
  },

  bulkAction: (taskIds: string[], action: string, value?: string): boolean => {
    if (!taskIds || taskIds.length === 0) return false;
    const idSet = new Set(taskIds);

    if (action === "archive" || action === "delete") {
      globalStore.__eml_tasks = globalStore.__eml_tasks!.filter(t => !idSet.has(t.id));
      serverDb.addAuditLog("BULK_ARCHIVE", `Archived ${taskIds.length} tasks`);
      return true;
    }

    globalStore.__eml_tasks = globalStore.__eml_tasks!.map(t => {
      if (!idSet.has(t.id)) return t;
      if (action === "update_status" && value) {
        return { ...t, status: value as any, updatedAt: new Date().toISOString() };
      }
      if (action === "update_priority" && value) {
        return { ...t, priority: value as any, updatedAt: new Date().toISOString() };
      }
      if (action === "update_category" && value) {
        return { ...t, category: value, updatedAt: new Date().toISOString() };
      }
      return t;
    });

    serverDb.addAuditLog("BULK_ACTION", `Executed ${action} on ${taskIds.length} tasks`);
    return true;
  },

  // Checklists (PDF Page 7)
  addChecklist: (taskId: string, text: string): ChecklistItem | null => {
    const task = serverDb.getTaskById(taskId);
    if (!task) return null;
    const item: ChecklistItem = {
      id: "c" + Date.now(),
      text,
      done: false,
    };
    if (!task.checklists) task.checklists = [];
    task.checklists.push(item);
    task.updatedAt = new Date().toISOString();
    serverDb.addAuditLog("CHECKLIST_ADDED", `Added step '${text}' to task '${task.title}'`);
    return item;
  },

  toggleChecklist: (taskId: string, checklistId: string): ChecklistItem | null => {
    const task = serverDb.getTaskById(taskId);
    if (!task || !task.checklists) return null;
    const item = task.checklists.find(c => c.id === checklistId);
    if (!item) return null;
    item.done = !item.done;
    task.updatedAt = new Date().toISOString();
    return item;
  },

  deleteChecklist: (taskId: string, checklistId: string): boolean => {
    const task = serverDb.getTaskById(taskId);
    if (!task || !task.checklists) return false;
    const idx = task.checklists.findIndex(c => c.id === checklistId);
    if (idx === -1) return false;
    task.checklists.splice(idx, 1);
    task.updatedAt = new Date().toISOString();
    return true;
  },

  // Comments (PDF Page 7)
  addComment: (taskId: string, text: string, author = "Bishal (Lead)"): TaskComment | null => {
    const task = serverDb.getTaskById(taskId);
    if (!task) return null;
    const comment: TaskComment = {
      id: "cm" + Date.now(),
      author,
      date: "Just now",
      text,
    };
    if (!task.comments) task.comments = [];
    task.comments.push(comment);
    task.updatedAt = new Date().toISOString();
    serverDb.addAuditLog("COMMENT_ADDED", `Comment added to task '${task.title}'`);
    return comment;
  },

  // Attachments (PDF Page 5)
  addAttachment: (taskId: string, att: { name: string; type?: string; size?: number }): TaskAttachment | null => {
    const task = serverDb.getTaskById(taskId);
    if (!task) return null;
    const item: TaskAttachment = {
      id: "att" + Date.now(),
      name: att.name,
      size: `${Math.round((att.size || 1024 * 128) / 1024)} KB`,
      type: att.type || "application/octet-stream",
      uploadedAt: "Just now",
    };
    if (!task.attachments) task.attachments = [];
    task.attachments.unshift(item);
    task.updatedAt = new Date().toISOString();
    serverDb.addAuditLog("ATTACHMENT_ADDED", `File '${att.name}' attached to task '${task.title}'`);
    return item;
  },

  deleteAttachment: (taskId: string, attachmentId: string): boolean => {
    const task = serverDb.getTaskById(taskId);
    if (!task || !task.attachments) return false;
    const idx = task.attachments.findIndex(a => a.id === attachmentId);
    if (idx === -1) return false;
    task.attachments.splice(idx, 1);
    task.updatedAt = new Date().toISOString();
    return true;
  },

  // Categories CRUD (PDF Page 6)
  getCategories: () => globalStore.__eml_categories!,
  createCategory: (cat: Partial<Lookup>): Lookup => {
    const item: Lookup = {
      id: "cat" + Date.now(),
      name: cat.name || "New Category",
      description: cat.description || "",
      color: cat.color || "#FFAA00",
      sortOrder: (globalStore.__eml_categories!.length + 1),
    };
    globalStore.__eml_categories!.push(item);
    serverDb.addAuditLog("CATEGORY_CREATED", `Category '${item.name}' created`);
    return item;
  },
  updateCategory: (id: string, updates: Partial<Lookup>): Lookup | null => {
    const idx = globalStore.__eml_categories!.findIndex(c => c.id === id);
    if (idx === -1) return null;
    globalStore.__eml_categories![idx] = { ...globalStore.__eml_categories![idx], ...updates };
    return globalStore.__eml_categories![idx];
  },
  deleteCategory: (id: string): boolean => {
    const idx = globalStore.__eml_categories!.findIndex(c => c.id === id);
    if (idx === -1) return false;
    globalStore.__eml_categories!.splice(idx, 1);
    return true;
  },
  reorderCategories: (categories: { id: string; sortOrder?: number }[]): boolean => {
    if (!categories || categories.length === 0) return false;
    const catMap = new Map(globalStore.__eml_categories!.map(c => [c.id, c]));
    const reordered: Lookup[] = [];
    categories.forEach((item, idx) => {
      const existing = catMap.get(item.id) || globalStore.__eml_categories!.find(c => c.name === item.id);
      if (existing) {
        existing.sortOrder = item.sortOrder ?? (idx + 1);
        reordered.push(existing);
        catMap.delete(existing.id);
      }
    });
    catMap.forEach(rem => reordered.push(rem));
    globalStore.__eml_categories = reordered;
    serverDb.addAuditLog("CATEGORIES_REORDERED", `Reordered ${categories.length} categories`);
    return true;
  },

  // Statuses CRUD (PDF Page 6)
  getStatuses: () => globalStore.__eml_statuses!,
  createStatus: (st: Partial<Lookup>): Lookup => {
    const item: Lookup = {
      id: "st" + Date.now(),
      code: st.code || (st.name || "STATUS").toUpperCase().replace(/\s+/g, "_"),
      name: st.name || "New Status",
      description: st.description || "",
      color: st.color || "#64748B",
      sortOrder: (globalStore.__eml_statuses!.length + 1),
    };
    globalStore.__eml_statuses!.push(item);
    serverDb.addAuditLog("STATUS_CREATED", `Status '${item.name}' created`);
    return item;
  },
  updateStatus: (id: string, updates: Partial<Lookup>): Lookup | null => {
    const idx = globalStore.__eml_statuses!.findIndex(s => s.id === id);
    if (idx === -1) return null;
    globalStore.__eml_statuses![idx] = { ...globalStore.__eml_statuses![idx], ...updates };
    return globalStore.__eml_statuses![idx];
  },
  deleteStatus: (id: string): boolean => {
    const idx = globalStore.__eml_statuses!.findIndex(s => s.id === id);
    if (idx === -1) return false;
    globalStore.__eml_statuses!.splice(idx, 1);
    return true;
  },

  getPriorities: () => globalStore.__eml_priorities!,
  getSettings: () => globalStore.__eml_settings!,
  updateSettings: (updates: Partial<SystemSettings>): SystemSettings => {
    globalStore.__eml_settings = { ...globalStore.__eml_settings!, ...updates };
    serverDb.addAuditLog("SETTINGS_UPDATED", "System settings updated");
    return globalStore.__eml_settings!;
  },

  getUsers: () => globalStore.__eml_users!,
  createUser: (user: Partial<UserAccount>): UserAccount => {
    const initials = (user.name || "U")
      .split(" ")
      .map(p => p[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
    const item: UserAccount = {
      id: user.id || "usr-" + Date.now(),
      name: user.name || "New Team Member",
      email: user.email || "",
      role: (user.role as any) || "Full-Stack Dev",
      status: user.status || "Active",
      avatar: user.avatar || initials,
    };
    globalStore.__eml_users!.push(item);
    serverDb.addAuditLog("USER_INVITED", `Team member '${item.name}' (${item.role}) added`);
    return item;
  },
  updateUserRole: (id: string, role: UserAccount["role"]): UserAccount | null => {
    const u = globalStore.__eml_users!.find(user => user.id === id);
    if (!u) return null;
    u.role = role;
    serverDb.addAuditLog("ROLE_UPDATED", `${u.name} role updated to ${role}`);
    return u;
  },
  getRoles: () => [
    { id: "r1", name: "Lead Admin", description: "Full administration, configuration, and data management" },
    { id: "r2", name: "Project Manager", description: "Project oversight, workflow orchestration, and reporting" },
    { id: "r3", name: "Full-Stack Dev", description: "Task lifecycle execution, code collaboration, and sprint work" },
    { id: "r4", name: "Product Designer", description: "UI/UX asset specification, feedback, and reviews" },
    { id: "r5", name: "QA Engineer", description: "Verification, bug logging, and test validation" },
    { id: "r6", name: "Viewer", description: "Read-only access across workspace tasks and boards" },
  ],

  login: (email?: string, password?: string): AuthSession => {
    const users = globalStore.__eml_users!;
    let u = users.find(user => email && user.email.toLowerCase() === email.toLowerCase());
    if (!u) {
      u = users.find(user => email && user.name.toLowerCase().includes(email.toLowerCase()));
    }
    if (!u) {
      u = users[0] || {
        id: "usr-1",
        name: "Bishal Kumar Jaiswal",
        email: email || "bishal@taskly.com",
        role: "Lead Admin",
        status: "Active",
        avatar: "BJ",
      };
    }
    let roleCode = "USER";
    if (u.role.includes("Admin") || u.role.includes("Lead")) roleCode = "ADMIN";
    else if (u.role.includes("Manager")) roleCode = "MANAGER";
    else if (u.role.includes("Viewer")) roleCode = "VIEWER";

    return {
      userId: u.id,
      email: u.email,
      name: u.name,
      role: roleCode,
      roleTitle: u.role,
      token: "tok_" + Buffer.from(u.id + ":" + Date.now()).toString("hex"),
      expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    };
  },

  getCustomFields: () => globalStore.__eml_custom_fields!,
  createCustomField: (cf: Partial<CustomFieldDefinition>): CustomFieldDefinition => {
    const item: CustomFieldDefinition = {
      id: "cf" + Date.now(),
      name: cf.name || "New Field",
      key: cf.key || (cf.name || "field").toLowerCase().replace(/\s+/g, "_"),
      type: cf.type || "text",
      options: cf.options || [],
      required: cf.required || false,
    };
    globalStore.__eml_custom_fields!.push(item);
    return item;
  },
  deleteCustomField: (id: string): boolean => {
    const idx = globalStore.__eml_custom_fields!.findIndex(c => c.id === id);
    if (idx === -1) return false;
    globalStore.__eml_custom_fields!.splice(idx, 1);
    return true;
  },

  getWidgets: () => globalStore.__eml_widgets!,
  toggleWidget: (id: string): DashboardWidgetConfig | null => {
    const w = globalStore.__eml_widgets!.find(widget => widget.id === id);
    if (!w) return null;
    w.enabled = !w.enabled;
    serverDb.addAuditLog("WIDGET_TOGGLED", `Widget '${w.name}' is now ${w.enabled ? "visible" : "hidden"}`);
    return w;
  },
  updateWidget: (id: string, updates: Partial<DashboardWidgetConfig>): DashboardWidgetConfig | null => {
    const w = globalStore.__eml_widgets!.find(widget => widget.id === id);
    if (!w) return null;
    Object.assign(w, updates);
    return w;
  },
  resetDatabase: (): boolean => {
    globalStore.__eml_tasks = getInitialTasks();
    globalStore.__eml_categories = [...DEFAULT_CATEGORIES];
    globalStore.__eml_statuses = [...DEFAULT_STATUSES];
    globalStore.__eml_priorities = [...DEFAULT_PRIORITIES];
    globalStore.__eml_settings = { ...DEFAULT_SETTINGS };
    globalStore.__eml_users = [...DEFAULT_USERS];
    globalStore.__eml_custom_fields = [...DEFAULT_CUSTOM_FIELDS];
    globalStore.__eml_widgets = [...DEFAULT_WIDGETS];
    globalStore.__eml_notifications = [...DEFAULT_NOTIFICATIONS];
    globalStore.__eml_audit_logs = [...DEFAULT_AUDIT_LOGS];
    serverDb.addAuditLog("DATABASE_RESET", "Database state restored to original demo seed");
    return true;
  },
  getNotifications: () => globalStore.__eml_notifications!,
  markNotificationRead: (id: string): boolean => {
    const notif = globalStore.__eml_notifications!.find(n => n.id === id);
    if (!notif) return false;
    notif.read = true;
    return true;
  },
  markAllNotificationsRead: (): boolean => {
    globalStore.__eml_notifications!.forEach(n => { n.read = true; });
    return true;
  },

  getAuditLogs: (limit = 50): AuditLogItem[] => {
    return globalStore.__eml_audit_logs!.slice(0, limit);
  },
  addAuditLog: (action: string, detail: string, user = "Bishal (Lead)") => {
    const log: AuditLogItem = {
      id: "log" + Date.now(),
      action,
      detail,
      user,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    };
    if (!globalStore.__eml_audit_logs) globalStore.__eml_audit_logs = [];
    globalStore.__eml_audit_logs.unshift(log);
  },

  getSummary: (): DashboardSummary => calculateSummary(globalStore.__eml_tasks!),
  getUpcoming: (): UpcomingTask[] => {
    const today = new Date().toISOString().slice(0, 10);
    return globalStore.__eml_tasks!
      .filter(t => t.dueDate && t.dueDate >= today && t.status !== "Completed")
      .slice(0, 6)
      .map(t => ({
        id: t.id,
        title: t.title,
        status: t.status,
        category: t.category,
        dueDate: t.dueDate!,
      }));
  },
};
