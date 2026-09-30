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

export interface TaskAttachment {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadedAt: string;
  url?: string;
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
  attachments?: TaskAttachment[];
  customFields?: Record<string, string>;
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
  isDefault?: boolean;
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
  role: "Lead Admin" | "Full-Stack Dev" | "Product Designer" | "QA Engineer" | "Project Manager" | "Viewer";
  status: "Active" | "Inactive" | "Invited";
  avatar?: string;
}

export interface CustomFieldDefinition {
  id: string;
  name: string;
  key: string;
  type: "text" | "date" | "number" | "select";
  options?: string[];
  placeholder?: string;
  required?: boolean;
}

export interface DashboardWidgetConfig {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  position: number;
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
  theme: "light" | "dark" | "system";
  defaultView: "list" | "kanban";
  auditEnabled: boolean;
  companyName?: string;
  supportEmail?: string;
}

export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  type: "assignment" | "due_date" | "overdue" | "comment" | "system";
  timestamp: string;
  read: boolean;
  taskId?: string;
}
