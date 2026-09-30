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
	ID            string `json:"id"`
	Code          string `json:"code"`
	Name          string `json:"name"`
	WidgetType    string `json:"widgetType"`
	Title         string `json:"title"`
	DefaultWidth  int    `json:"defaultWidth"`
	SortOrder     int    `json:"sortOrder"`
}
