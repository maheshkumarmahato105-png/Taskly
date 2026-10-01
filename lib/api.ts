import type {
  DashboardSummary,
  Lookup,
  Task,
  UpcomingTask,
  UserAccount,
  AuditLogItem,
  SystemSettings,
  DashboardWidgetConfig,
  CustomFieldDefinition,
  InAppNotification,
  ChecklistItem,
  TaskComment,
  TaskAttachment,
  AuthSession,
} from "@/types/task";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1";

let isBackendOffline = false;
let lastOfflineCheck = 0;
const OFFLINE_RETRY_MS = 15000;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (typeof window !== "undefined") {
    if (window.location.protocol === "https:" && API_BASE.startsWith("http://localhost")) {
      throw new Error("Mixed content skipped on HTTPS");
    }
    const now = Date.now();
    if (isBackendOffline && now - lastOfflineCheck < OFFLINE_RETRY_MS) {
      throw new Error("Backend offline; using local state engine");
    }
  }

  const authHeaders: Record<string, string> = {};
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("taskly_session");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.token) authHeaders["Authorization"] = `Bearer ${parsed.token}`;
        if (parsed.role) authHeaders["X-User-Role"] = parsed.role;
      }
    } catch (_) {}
  }

  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, {
      ...init,
      signal: init?.signal ?? controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`API error ${response.status}: ${response.statusText}`);
    }

    isBackendOffline = false;
    return await response.json();
  } catch (err) {
    if (typeof window !== "undefined") {
      isBackendOffline = true;
      lastOfflineCheck = Date.now();
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

export const api = {
  // Tasks (PDF Page 4)
  tasks: (params?: { status?: string; category?: string; priority?: string; search?: string; overdue?: boolean }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set("status", params.status);
    if (params?.category) q.set("category", params.category);
    if (params?.priority) q.set("priority", params.priority);
    if (params?.search) q.set("search", params.search);
    if (params?.overdue) q.set("overdue", "true");
    const qs = q.toString();
    return request<{ items: Task[]; total?: number }>(`/tasks${qs ? `?${qs}` : ""}`);
  },
  getTask: (id: string) => request<Task>(`/tasks/${id}`),
  createTask: (payload: Partial<Task>) =>
    request<Task>("/tasks", { method: "POST", body: JSON.stringify(payload) }),
  updateTask: (id: string, payload: Partial<Task>) =>
    request<Task>(`/tasks/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteTask: (id: string) =>
    request<{ deleted: boolean }>(`/tasks/${id}`, { method: "DELETE" }),

  // Bulk Operations (PDF Page 7)
  bulkAction: (payload: { taskIds: string[]; action: string; status?: string; priority?: string; category?: string }) =>
    request<{ success: boolean }>("/tasks/bulk", { method: "POST", body: JSON.stringify(payload) }),

  // Inline fast updates (PDF Page 4)
  updateStatus: (id: string, status: string) =>
    request<Task>(`/tasks/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, statusId: status }),
    }),
  updatePriority: (id: string, priority: string) =>
    request<Task>(`/tasks/${id}/priority`, {
      method: "PATCH",
      body: JSON.stringify({ priority, priorityId: priority }),
    }),
  updateCategory: (id: string, category: string) =>
    request<Task>(`/tasks/${id}/category`, {
      method: "PATCH",
      body: JSON.stringify({ category, categoryId: category }),
    }),
  updateDueDate: (id: string, dueDate: string | null) =>
    request<Task>(`/tasks/${id}/due-date`, {
      method: "PATCH",
      body: JSON.stringify({ dueDate }),
    }),

  // Task Details Drawer Sub-Entities (PDF Page 7)
  addChecklist: (taskId: string, text: string) =>
    request<ChecklistItem>(`/tasks/${taskId}/checklists`, {
      method: "POST",
      body: JSON.stringify({ text }),
    }),
  toggleChecklist: (taskId: string, checklistId: string) =>
    request<ChecklistItem>(`/tasks/${taskId}/checklists/${checklistId}`, { method: "PATCH" }),
  deleteChecklist: (taskId: string, checklistId: string) =>
    request<{ deleted: boolean }>(`/tasks/${taskId}/checklists/${checklistId}`, { method: "DELETE" }),

  addComment: (taskId: string, text: string) =>
    request<TaskComment>(`/tasks/${taskId}/comments`, {
      method: "POST",
      body: JSON.stringify({ text }),
    }),
  getComments: (taskId: string) =>
    request<{ items: TaskComment[] }>(`/tasks/${taskId}/comments`),

  addAttachment: (taskId: string, payload: { name: string; type?: string; size?: number }) =>
    request<TaskAttachment>(`/tasks/${taskId}/attachments`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  deleteAttachment: (taskId: string, attachmentId: string) =>
    request<{ deleted: boolean }>(`/tasks/${taskId}/attachments/${attachmentId}`, { method: "DELETE" }),

  getTaskActivity: (taskId: string) =>
    request<{ items: AuditLogItem[] }>(`/tasks/${taskId}/activity`),

  // Dashboard & Lookups (PDF Page 4)
  summary: () => request<DashboardSummary>("/dashboard/summary"),
  upcoming: () => request<{ items: UpcomingTask[] }>("/dashboard/upcoming"),
  publicConfig: () => request<SystemSettings>("/config/public"),
  // Categories CRUD (PDF Page 6)
  categories: () => request<{ items: Lookup[] }>("/task-categories"),
  createCategory: (payload: Partial<Lookup>) =>
    request<Lookup>("/task-categories", { method: "POST", body: JSON.stringify(payload) }),
  reorderCategories: (categories: { id: string; sortOrder?: number }[]) =>
    request<{ success: boolean }>("/task-categories/reorder", {
      method: "PUT",
      body: JSON.stringify({ items: categories }),
    }),
  updateCategoryConfig: (id: string, payload: Partial<Lookup>) =>
    request<Lookup>(`/task-categories/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteCategory: (id: string) =>
    request<{ deleted: boolean }>(`/task-categories/${id}`, { method: "DELETE" }),

  statuses: () => request<{ items: Lookup[] }>("/task-statuses"),
  createStatus: (payload: Partial<Lookup>) =>
    request<Lookup>("/task-statuses", { method: "POST", body: JSON.stringify(payload) }),
  updateStatusConfig: (id: string, payload: Partial<Lookup>) =>
    request<Lookup>(`/task-statuses/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteStatus: (id: string) =>
    request<{ deleted: boolean }>(`/task-statuses/${id}`, { method: "DELETE" }),

  priorities: () => request<{ items: Lookup[] }>("/task-priorities"),

  // Widgets (PDF Page 4 & 6)
  widgets: () => request<{ items: DashboardWidgetConfig[] }>("/dashboard/widgets"),
  toggleWidget: (id: string) =>
    request<DashboardWidgetConfig>(`/dashboard/widgets/${id}`, { method: "PATCH" }),
  updateWidget: (id: string, payload: Partial<DashboardWidgetConfig>) =>
    request<DashboardWidgetConfig>(`/dashboard/widgets/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  // Custom Fields (PDF Page 6)
  customFields: () => request<{ items: CustomFieldDefinition[] }>("/custom-fields"),
  createCustomField: (payload: Partial<CustomFieldDefinition>) =>
    request<CustomFieldDefinition>("/custom-fields", { method: "POST", body: JSON.stringify(payload) }),
  deleteCustomField: (id: string) =>
    request<{ deleted: boolean }>(`/custom-fields/${id}`, { method: "DELETE" }),

  // Settings & System (PDF Page 6)
  settings: () => request<Record<string, string>>("/settings"),
  updateSettings: (payload: Record<string, any>) =>
    request<{ success: boolean }>("/settings", { method: "PUT", body: JSON.stringify(payload) }),
  auditLogs: (limit = 50) =>
    request<{ items: AuditLogItem[] }>(`/audit-logs?limit=${limit}`),
  resetDatabase: () =>
    request<{ success: boolean; message: string }>("/database/reset", { method: "POST" }),

  // Users, Roles & Preferences (PDF Page 5)
  roles: () => request<{ items: { id: string; name: string; description: string }[] }>("/roles"),
  users: () => request<{ items: UserAccount[] }>("/users"),
  createUser: (payload: Partial<UserAccount>) =>
    request<UserAccount>("/users", { method: "POST", body: JSON.stringify(payload) }),
  updateUserRole: (id: string, role: string) =>
    request<UserAccount>(`/users/${id}/role`, { method: "PATCH", body: JSON.stringify({ role }) }),
  notifications: () => request<{ items: InAppNotification[] }>("/notifications"),
  markNotificationRead: (id: string) =>
    request<{ success: boolean }>(`/notifications/${id}/read`, { method: "PATCH" }),

  // Authentication & Security (PDF Page 9)
  login: (payload: { email: string; password?: string }) =>
    request<AuthSession>("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  me: (email?: string) =>
    request<AuthSession>(email ? `/auth/me?email=${encodeURIComponent(email)}` : "/auth/me"),
  logout: () =>
    request<{ success: boolean }>("/auth/logout", { method: "POST" }),

  health: () => request<{ status: string; database?: string }>("/health"),
};
