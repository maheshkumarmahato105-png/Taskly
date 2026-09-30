package httpapi

import (
	"encoding/json"
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

	r.mux.HandleFunc("GET /health", handlers.health)
	r.mux.HandleFunc("GET /api/v1/dashboard/summary", handlers.dashboardSummary)
	r.mux.HandleFunc("GET /api/v1/dashboard/upcoming", handlers.dashboardUpcoming)

	r.mux.HandleFunc("GET /api/v1/tasks", handlers.listTasks)
	r.mux.HandleFunc("POST /api/v1/tasks", handlers.createTask)
	r.mux.HandleFunc("GET /api/v1/tasks/{id}", handlers.getTask)
	r.mux.HandleFunc("PUT /api/v1/tasks/{id}", handlers.updateTask)
	r.mux.HandleFunc("DELETE /api/v1/tasks/{id}", handlers.deleteTask)
	r.mux.HandleFunc("PATCH /api/v1/tasks/{id}/status", handlers.changeStatus)
	r.mux.HandleFunc("PATCH /api/v1/tasks/{id}/priority", handlers.changePriority)
	r.mux.HandleFunc("PATCH /api/v1/tasks/{id}/category", handlers.changeCategory)
	r.mux.HandleFunc("PATCH /api/v1/tasks/{id}/due-date", handlers.changeDueDate)

	r.mux.HandleFunc("GET /api/v1/task-categories", handlers.listCategories)
	r.mux.HandleFunc("GET /api/v1/task-statuses", handlers.listStatuses)
	r.mux.HandleFunc("GET /api/v1/task-priorities", handlers.listPriorities)
	r.mux.HandleFunc("GET /api/v1/config/public", handlers.publicConfig)
	r.mux.HandleFunc("GET /api/v1/dashboard/widgets", handlers.dashboardWidgets)

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

	if !strings.HasPrefix(req.URL.Path, "/api/") && req.URL.Path != "/health" {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "not_found"})
		return
	}
	r.mux.ServeHTTP(w, req)
}

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}
