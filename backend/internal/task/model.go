package task

import "time"

// Task represents the full domain task record matching PostgreSQL schema & PDF specification
type Task struct {
	ID           string            `json:"id"`
	Title        string            `json:"title"`
	Description  string            `json:"description"`
	Status       string            `json:"status"`
	StatusID     string            `json:"statusId,omitempty"`
	Priority     string            `json:"priority"`
	PriorityID   string            `json:"priorityId,omitempty"`
	Category     string            `json:"category"`
	CategoryID   string            `json:"categoryId,omitempty"`
	DueDate      *string           `json:"dueDate,omitempty"`
	Assignee     string            `json:"assignee,omitempty"`
	AssignedTo   *string           `json:"assignedTo,omitempty"`
	SortOrder    int               `json:"sortOrder,omitempty"`
	IsArchived   bool              `json:"isArchived,omitempty"`
	Checklists   []ChecklistItem   `json:"checklists,omitempty"`
	Comments     []TaskComment     `json:"comments,omitempty"`
	Attachments  []TaskAttachment  `json:"attachments,omitempty"`
	CustomFields map[string]string `json:"customFields,omitempty"`
	CreatedAt    string            `json:"createdAt"`
	UpdatedAt    string            `json:"updatedAt"`
}

// ChecklistItem represents a measurable step within a task (PDF Page 7)
type ChecklistItem struct {
	ID        string `json:"id"`
	TaskID    string `json:"taskId,omitempty"`
	Text      string `json:"text"`
	Done      bool   `json:"done"`
	SortOrder int    `json:"sortOrder,omitempty"`
}

// TaskComment represents a team collaboration comment (PDF Page 7)
type TaskComment struct {
	ID     string  `json:"id"`
	TaskID string  `json:"taskId,omitempty"`
	Author string  `json:"author"`
	UserID *string `json:"userId,omitempty"`
	Date   string  `json:"date"`
	Text   string  `json:"text"`
}

// TaskAttachment represents file metadata for object storage (PDF Page 5)
type TaskAttachment struct {
	ID         string `json:"id"`
	TaskID     string `json:"taskId,omitempty"`
	Name       string `json:"name"`
	Size       string `json:"size"`
	Type       string `json:"type"`
	URL        string `json:"url,omitempty"`
	UploadedAt string `json:"uploadedAt"`
}

// ActivityLog represents an audit log entry for task changes (PDF Page 7)
type ActivityLog struct {
	ID        string `json:"id"`
	TaskID    string `json:"taskId,omitempty"`
	Action    string `json:"action"`
	User      string `json:"user"`
	Detail    string `json:"detail"`
	Timestamp string `json:"timestamp"`
}

// CreateTaskRequest accepts either UUID IDs or human-readable names
type CreateTaskRequest struct {
	Title        string            `json:"title"`
	Description  string            `json:"description,omitempty"`
	StatusID     string            `json:"statusId,omitempty"`
	Status       string            `json:"status,omitempty"`
	PriorityID   string            `json:"priorityId,omitempty"`
	Priority     string            `json:"priority,omitempty"`
	CategoryID   string            `json:"categoryId,omitempty"`
	Category     string            `json:"category,omitempty"`
	DueDate      *string           `json:"dueDate,omitempty"`
	AssignedTo   *string           `json:"assignedTo,omitempty"`
	Assignee     string            `json:"assignee,omitempty"`
	Checklists   []string          `json:"checklists,omitempty"`
	CustomFields map[string]string `json:"customFields,omitempty"`
}

// UpdateTaskRequest allows partial or full updates
type UpdateTaskRequest struct {
	Title        *string           `json:"title,omitempty"`
	Description  *string           `json:"description,omitempty"`
	StatusID     *string           `json:"statusId,omitempty"`
	Status       *string           `json:"status,omitempty"`
	PriorityID   *string           `json:"priorityId,omitempty"`
	Priority     *string           `json:"priority,omitempty"`
	CategoryID   *string           `json:"categoryId,omitempty"`
	Category     *string           `json:"category,omitempty"`
	DueDate      *string           `json:"dueDate,omitempty"`
	AssignedTo   *string           `json:"assignedTo,omitempty"`
	Assignee     *string           `json:"assignee,omitempty"`
	CustomFields map[string]string `json:"customFields,omitempty"`
}

// BulkActionRequest supports bulk operations on multiple tasks (PDF Page 7)
type BulkActionRequest struct {
	TaskIDs    []string `json:"taskIds"`
	Action     string   `json:"action"` // "update_status", "update_priority", "update_category", "archive"
	StatusID   string   `json:"statusId,omitempty"`
	Status     string   `json:"status,omitempty"`
	PriorityID string   `json:"priorityId,omitempty"`
	Priority   string   `json:"priority,omitempty"`
	CategoryID string   `json:"categoryId,omitempty"`
	Category   string   `json:"category,omitempty"`
}

// TaskFilter encapsulates query filters for listing tasks
type TaskFilter struct {
	Status      string
	Category    string
	Priority    string
	Search      string
	OverdueOnly bool
	SortBy      string
	SortOrder   string
}

// TaskWithDetails combines a Task with its relational sub-items
type TaskWithDetails struct {
	Task
	Checklists   []ChecklistItem   `json:"checklists"`
	Comments     []TaskComment     `json:"comments"`
	Attachments  []TaskAttachment  `json:"attachments"`
	ActivityLogs []ActivityLog     `json:"activityLogs"`
	CustomFields map[string]string `json:"customFields"`
}

// ParseTime helper for format
func FormatTime(t time.Time) string {
	return t.Format(time.RFC3339)
}
