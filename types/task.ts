export type TaskStatus = "Not Started" | "In Progress" | "Completed" | "On Hold" | "Blocked";
export type TaskPriority = "Low" | "Medium" | "High" | "Urgent";

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface TaskComment {
  id: string;
  author: string;
  date: string;
  text: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: string;
  dueDate?: string | null;
  assignee?: string;
  checklists?: ChecklistItem[];
  comments?: TaskComment[];
  createdAt: string;
  updatedAt: string;
}

export interface DashboardSummary {
  totalTasks: number;
  notStarted: number;
  inProgress: number;
  completed: number;
  overdue: number;
  completionRate: number;
}

export interface Lookup {
  id: string;
  code?: string;
  name: string;
  description?: string;
  color?: string;
  sortOrder?: number;
}

export interface UpcomingTask {
  id: string;
  title: string;
  status: string;
  category: string;
  dueDate: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

export interface AuditLogItem {
  id: string;
  action: string;
  detail: string;
  user: string;
  timestamp: string;
}

export interface SystemSettings {
  appName: string;
  brandColor: string;
  theme: string;
  defaultView: "list" | "kanban";
  auditEnabled: boolean;
}
