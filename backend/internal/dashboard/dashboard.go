package dashboard

type Summary struct {
	TotalTasks     int `json:"totalTasks"`
	NotStarted     int `json:"notStarted"`
	InProgress     int `json:"inProgress"`
	Completed      int `json:"completed"`
	Overdue        int `json:"overdue"`
	CompletionRate int `json:"completionRate"`
}

type UpcomingTask struct {
	ID       string `json:"id"`
	Title    string `json:"title"`
	Status   string `json:"status"`
	Category string `json:"category"`
	DueDate  string `json:"dueDate"`
}

type Widget struct {
	ID           string `json:"id"`
	Code         string `json:"code,omitempty"`
	Name         string `json:"name"`
	Description  string `json:"description"`
	WidgetType   string `json:"widgetType,omitempty"`
	Title        string `json:"title,omitempty"`
	DefaultWidth int    `json:"defaultWidth,omitempty"`
	SortOrder    int    `json:"sortOrder,omitempty"`
	Enabled      bool   `json:"enabled"`
	Position     int    `json:"position"`
}

type UpdateWidgetRequest struct {
	Enabled  *bool `json:"enabled,omitempty"`
	Position *int  `json:"position,omitempty"`
}
