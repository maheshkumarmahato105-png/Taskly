package task

type Task struct {
	ID          string  `json:"id"`
	Title       string  `json:"title"`
	Description string  `json:"description"`
	Status      string  `json:"status"`
	Priority    string  `json:"priority"`
	Category    string  `json:"category"`
	DueDate     *string `json:"dueDate,omitempty"`
	CreatedAt   string  `json:"createdAt"`
	UpdatedAt   string  `json:"updatedAt"`
}

type CreateTaskRequest struct {
	Title       string  `json:"title"`
	Description string  `json:"description"`
	StatusID    string  `json:"statusId"`
	PriorityID  string  `json:"priorityId"`
	CategoryID  string  `json:"categoryId"`
	DueDate     *string `json:"dueDate"`
}

type UpdateTaskRequest struct {
	Title       string  `json:"title"`
	Description string  `json:"description"`
	StatusID    string  `json:"statusId"`
	PriorityID  string  `json:"priorityId"`
	CategoryID  string  `json:"categoryId"`
	DueDate     *string `json:"dueDate"`
}
