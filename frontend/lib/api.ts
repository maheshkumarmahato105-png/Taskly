import type {
  DashboardSummary,
  Lookup,
  Task,
  UpcomingTask,
  UserAccount,
  AuditLogItem,
  SystemSettings
} from "@/types/task";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api/v1";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`API error ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  // Tasks
  tasks: (params?: { status?: string; category?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set("status", params.status);
    if (params?.category) q.set("category", params.category);
    if (params?.search) q.set("search", params.search);
    const qs = q.toString();
    return request<{ items: Task[] }>(`/tasks${qs ? `?${qs}` : ""}`);
  },
  getTask: (id: string) => request<Task>(`/tasks/${id}`),
  createTask: (payload: Record<string, unknown>) =>
    request<Task>("/tasks", { method: "POST", body: JSON.stringify(payload) }),
  updateTask: (id: string, payload: Record<string, unknown>) =>
    request<Task>(`/tasks/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteTask: (id: string) =>
    request<{ deleted: boolean }>(`/tasks/${id}`, { method: "DELETE" }),

  // Inline updates (PDF Page 4)
  updateStatus: (id: string, statusId: string) =>
    request<Task>(`/tasks/${id}/status`, { method: "PATCH", body: JSON.stringify({ statusId }) }),
  updatePriority: (id: string, priorityId: string) =>
    request<Task>(`/tasks/${id}/priority`, { method: "PATCH", body: JSON.stringify({ priorityId }) }),
  updateCategory: (id: string, categoryId: string) =>
    request<Task>(`/tasks/${id}/category`, { method: "PATCH", body: JSON.stringify({ categoryId }) }),
  updateDueDate: (id: string, dueDate: string | null) =>
    request<Task>(`/tasks/${id}/due-date`, { method: "PATCH", body: JSON.stringify({ dueDate }) }),

  // Checklist items (PDF Page 7)
  addChecklistItem: (taskId: string, text: string) =>
    request<Task>(`/tasks/${taskId}/checklist`, { method: "POST", body: JSON.stringify({ text }) }),
  toggleChecklistItem: (taskId: string, itemId: string, done: boolean) =>
    request<Task>(`/tasks/${taskId}/checklist/${itemId}`, { method: "PATCH", body: JSON.stringify({ done }) }),
  deleteChecklistItem: (taskId: string, itemId: string) =>
    request<{ deleted: boolean }>(`/tasks/${taskId}/checklist/${itemId}`, { method: "DELETE" }),

  // Comments (PDF Page 7)
  addComment: (taskId: string, text: string, author?: string) =>
    request<Task>(`/tasks/${taskId}/comments`, { method: "POST", body: JSON.stringify({ text, author }) }),

  // Dashboard & Lookups
  summary: () => request<DashboardSummary>("/dashboard/summary"),
  upcoming: () => request<{ items: UpcomingTask[] }>("/dashboard/upcoming"),
  widgets: () => request<{ items: Array<{ id: string; name: string; position: number }> }>("/dashboard/widgets"),
  categories: () => request<{ items: Lookup[] }>("/task-categories"),
  statuses: () => request<{ items: Lookup[] }>("/task-statuses"),
  priorities: () => request<{ items: Lookup[] }>("/task-priorities"),
  publicConfig: () => request<SystemSettings>("/config/public"),

  // Admin APIs (PDF Page 6)
  adminUsers: () => request<{ items: UserAccount[] }>("/admin/users"),
  adminAuditLogs: () => request<{ items: AuditLogItem[] }>("/admin/audit-logs"),
  updateSettings: (settings: Partial<SystemSettings>) =>
    request<SystemSettings>("/admin/settings", { method: "PUT", body: JSON.stringify(settings) }),
};
