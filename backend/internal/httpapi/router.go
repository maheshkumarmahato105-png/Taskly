package httpapi

import (
	"net/http"
	"strings"
)

type Router struct {
	mux         *http.ServeMux
	corsOrigins map[string]bool
}

func New(handlers *Handlers, corsOrigins []string) *Router {
	r := &Router{mux: http.NewServeMux(), corsOrigins: map[string]bool{}}
	for _, origin := range corsOrigins {
		r.corsOrigins[origin] = true
	}

	// Health check
	r.mux.HandleFunc("GET /health", handlers.health)

	// Dashboard (PDF Page 4)
	r.mux.HandleFunc("GET /api/v1/dashboard/summary", handlers.dashboardSummary)
	r.mux.HandleFunc("GET /api/v1/dashboard/upcoming", handlers.dashboardUpcoming)
	r.mux.HandleFunc("GET /api/v1/dashboard/widgets", handlers.dashboardWidgets)
	r.mux.HandleFunc("PATCH /api/v1/dashboard/widgets/{id}", handlers.updateWidget)
	r.mux.HandleFunc("PUT /api/v1/dashboard/widgets/{id}", handlers.updateWidget)

	// Tasks (PDF Page 4)
	r.mux.HandleFunc("GET /api/v1/tasks", handlers.listTasks)
	r.mux.HandleFunc("POST /api/v1/tasks", handlers.createTask)
	r.mux.HandleFunc("POST /api/v1/tasks/bulk", handlers.bulkTasks)
	r.mux.HandleFunc("GET /api/v1/tasks/{id}", handlers.getTask)
	r.mux.HandleFunc("PUT /api/v1/tasks/{id}", handlers.updateTask)
	r.mux.HandleFunc("DELETE /api/v1/tasks/{id}", handlers.deleteTask)

	// Inline updates (PDF Page 4)
	r.mux.HandleFunc("PATCH /api/v1/tasks/{id}/status", handlers.changeStatus)
	r.mux.HandleFunc("PATCH /api/v1/tasks/{id}/priority", handlers.changePriority)
	r.mux.HandleFunc("PATCH /api/v1/tasks/{id}/category", handlers.changeCategory)
	r.mux.HandleFunc("PATCH /api/v1/tasks/{id}/due-date", handlers.changeDueDate)

	// Task Details Drawer sub-routes (PDF Page 7)
	r.mux.HandleFunc("POST /api/v1/tasks/{id}/checklists", handlers.addChecklist)
	r.mux.HandleFunc("PATCH /api/v1/tasks/{id}/checklists/{cid}", handlers.toggleChecklist)
	r.mux.HandleFunc("DELETE /api/v1/tasks/{id}/checklists/{cid}", handlers.deleteChecklist)
	r.mux.HandleFunc("GET /api/v1/tasks/{id}/comments", handlers.listComments)
	r.mux.HandleFunc("POST /api/v1/tasks/{id}/comments", handlers.addComment)
	r.mux.HandleFunc("GET /api/v1/tasks/{id}/attachments", handlers.listAttachments)
	r.mux.HandleFunc("POST /api/v1/tasks/{id}/attachments", handlers.addAttachment)
	r.mux.HandleFunc("DELETE /api/v1/tasks/{id}/attachments/{aid}", handlers.deleteAttachment)
	r.mux.HandleFunc("GET /api/v1/tasks/{id}/activity", handlers.taskActivity)

	// Configuration & Reference tables (PDF Page 4, 5, 6)
	r.mux.HandleFunc("GET /api/v1/task-categories", handlers.listCategories)
	r.mux.HandleFunc("GET /task-categories", handlers.listCategories)
	r.mux.HandleFunc("POST /api/v1/task-categories", handlers.createCategory)
	r.mux.HandleFunc("PUT /api/v1/task-categories/reorder", handlers.reorderCategories)
	r.mux.HandleFunc("POST /api/v1/task-categories/reorder", handlers.reorderCategories)
	r.mux.HandleFunc("PUT /task-categories/reorder", handlers.reorderCategories)
	r.mux.HandleFunc("POST /task-categories/reorder", handlers.reorderCategories)
	r.mux.HandleFunc("PUT /api/v1/task-categories/{id}", handlers.updateCategory)
	r.mux.HandleFunc("DELETE /api/v1/task-categories/{id}", handlers.deleteCategory)

	r.mux.HandleFunc("GET /api/v1/task-statuses", handlers.listStatuses)
	r.mux.HandleFunc("GET /task-statuses", handlers.listStatuses)
	r.mux.HandleFunc("POST /api/v1/task-statuses", handlers.createStatus)
	r.mux.HandleFunc("PUT /api/v1/task-statuses/{id}", handlers.updateStatus)
	r.mux.HandleFunc("DELETE /api/v1/task-statuses/{id}", handlers.deleteStatus)

	r.mux.HandleFunc("GET /api/v1/task-priorities", handlers.listPriorities)
	r.mux.HandleFunc("GET /task-priorities", handlers.listPriorities)

	r.mux.HandleFunc("GET /api/v1/custom-fields", handlers.listCustomFields)
	r.mux.HandleFunc("POST /api/v1/custom-fields", handlers.createCustomField)
	r.mux.HandleFunc("DELETE /api/v1/custom-fields/{id}", handlers.deleteCustomField)

	r.mux.HandleFunc("GET /api/v1/config/public", handlers.publicConfig)
	r.mux.HandleFunc("GET /api/v1/settings", handlers.allSettings)
	r.mux.HandleFunc("PUT /api/v1/settings", handlers.updateSettings)
	r.mux.HandleFunc("GET /api/v1/audit-logs", handlers.auditLogs)
	r.mux.HandleFunc("POST /api/v1/database/reset", handlers.resetDatabase)
	r.mux.HandleFunc("POST /api/v1/admin/reset-seed", handlers.resetDatabase)

	// Users & Roles (RBAC) (PDF Page 5 & 6)
	r.mux.HandleFunc("GET /api/v1/roles", handlers.listRoles)
	r.mux.HandleFunc("GET /roles", handlers.listRoles)
	r.mux.HandleFunc("GET /api/v1/users", handlers.listUsers)
	r.mux.HandleFunc("POST /api/v1/users", handlers.createUser)
	r.mux.HandleFunc("PATCH /api/v1/users/{id}/role", handlers.updateUserRole)
	r.mux.HandleFunc("PUT /api/v1/users/{id}/role", handlers.updateUserRole)
	r.mux.HandleFunc("GET /api/v1/user/preferences", handlers.userPreferences)
	r.mux.HandleFunc("PUT /api/v1/user/preferences", handlers.updateUserPreferences)

	// Auth (PDF Page 9 & 10)
	r.mux.HandleFunc("POST /api/v1/auth/login", handlers.login)
	r.mux.HandleFunc("GET /api/v1/auth/me", handlers.me)
	r.mux.HandleFunc("POST /api/v1/auth/logout", handlers.logout)

	// Notifications (PDF Page 5 & 7)
	r.mux.HandleFunc("GET /api/v1/notifications", handlers.listNotifications)
	r.mux.HandleFunc("PATCH /api/v1/notifications/{id}/read", handlers.markNotificationRead)
	r.mux.HandleFunc("POST /api/v1/notifications/read-all", handlers.markAllNotificationsRead)

	return r
}

func (r *Router) ServeHTTP(w http.ResponseWriter, req *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.Header().Set("X-Frame-Options", "DENY")
	w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")

	origin := req.Header.Get("Origin")
	if origin != "" && (r.corsOrigins[origin] || r.corsOrigins["*"]) {
		w.Header().Set("Access-Control-Allow-Origin", origin)
		w.Header().Set("Vary", "Origin")
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
	}
	if req.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	if !strings.HasPrefix(req.URL.Path, "/api/") &&
		!strings.HasPrefix(req.URL.Path, "/task-") &&
		req.URL.Path != "/health" {
		writeError(w, http.StatusNotFound, "not_found", "Route not found")
		return
	}

	r.mux.ServeHTTP(w, req)
}
