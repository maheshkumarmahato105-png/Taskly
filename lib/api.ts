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
} from "@/types/task";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1";

let isBackendOffline = false;
let lastOfflineCheck = 0;
const OFFLINE_RETRY_MS = 20000;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (typeof window !== "undefined") {
    if (window.location.protocol === "https:" && API_BASE.startsWith("http://localhost")) {
      throw new Error("Mixed content skipped on HTTPS");
    }
    const now = Date.now();
    if (isBackendOffline && now - lastOfflineCheck < OFFLINE_RETRY_MS) {
      throw new Error("Backend offline; using local data");
    }
  }

  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 500);
  try {
    const response = await fetch(url, {
      ...init,
      signal: init?.signal ?? controller.signal,
      headers: {
        "Content-Type": "application/json",
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
  tasks: (params?: { status?: string; category?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set("status", params.status);
    if (params?.category) q.set("category", params.category);
    if (params?.search) q.set("search", params.search);
    const qs = q.toString();
    return request<{ items: Task[] }>(`/tasks${qs ? `?${qs}` : ""}`);
  },
  getTask: (id: string) => request<Task>(`/tasks/${id}`),
  createTask: (payload: Partial<Task>) =>
    request<Task>("/tasks", { method: "POST", body: JSON.stringify(payload) }),
  updateTask: (id: string, payload: Partial<Task>) =>
    request<Task>(`/tasks/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteTask: (id: string) =>
    request<{ deleted: boolean }>(`/tasks/${id}`, { method: "DELETE" }),

  // Inline updates (PDF Page 4)
  updateStatus: (id: string, status: string) =>
    request<Task>(`/tasks/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  updatePriority: (id: string, priority: string) =>
    request<Task>(`/tasks/${id}/priority`, { method: "PATCH", body: JSON.stringify({ priority }) }),
  updateCategory: (id: string, category: string) =>
    request<Task>(`/tasks/${id}/category`, { method: "PATCH", body: JSON.stringify({ category }) }),
  updateDueDate: (id: string, dueDate: string | null) =>
    request<Task>(`/tasks/${id}/due-date`, { method: "PATCH", body: JSON.stringify({ dueDate }) }),

  // Dashboard & Lookups (PDF Page 4)
  summary: () => request<DashboardSummary>("/dashboard/summary"),
  upcoming: () => request<{ items: UpcomingTask[] }>("/dashboard/upcoming"),
  widgets: () => request<{ items: DashboardWidgetConfig[] }>("/dashboard/widgets"),
  publicConfig: () => request<SystemSettings>("/config/public"),
  categories: () => request<{ items: Lookup[] }>("/task-categories"),
  statuses: () => request<{ items: Lookup[] }>("/task-statuses"),
  priorities: () => request<{ items: Lookup[] }>("/task-priorities"),
  health: () => request<{ status: string }>("/health"),
};
