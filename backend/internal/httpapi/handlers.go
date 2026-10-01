package httpapi

import (
	"context"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/taskly/task-manager/backend/internal/auth"
	"github.com/taskly/task-manager/backend/internal/configuration"
	"github.com/taskly/task-manager/backend/internal/dashboard"
	"github.com/taskly/task-manager/backend/internal/notification"
	"github.com/taskly/task-manager/backend/internal/task"
	"github.com/taskly/task-manager/backend/internal/user"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Handlers struct {
	db       *pgxpool.Pool
	taskSvc  *task.Service
	dashSvc  *dashboard.Service
	confSvc  *configuration.Service
	userSvc  *user.Service
	authSvc  *auth.Service
	notifSvc *notification.Service
}

func NewHandlers(
	db *pgxpool.Pool,
	taskSvc *task.Service,
	dashSvc *dashboard.Service,
	confSvc *configuration.Service,
	userSvc *user.Service,
	authSvc *auth.Service,
	notifSvc *notification.Service,
) *Handlers {
	return &Handlers{
		db:       db,
		taskSvc:  taskSvc,
		dashSvc:  dashSvc,
		confSvc:  confSvc,
		userSvc:  userSvc,
		authSvc:  authSvc,
		notifSvc: notifSvc,
	}
}

// Health check
func (h *Handlers) health(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
	defer cancel()
	if err := h.db.Ping(ctx); err != nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]string{
			"status":   "degraded",
			"database": "down",
		})
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{
		"status":   "ok",
		"database": "up",
	})
}

// Tasks endpoints
func (h *Handlers) listTasks(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	f := task.TaskFilter{
		Status:      q.Get("status"),
		Category:    q.Get("category"),
		Priority:    q.Get("priority"),
		Search:      strings.TrimSpace(q.Get("search")),
		OverdueOnly: q.Get("overdue") == "true",
	}

	items, err := h.taskSvc.List(r.Context(), f)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "database_error", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": items, "total": len(items)})
}

func (h *Handlers) getTask(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	t, err := h.taskSvc.GetByID(r.Context(), id)
	if err != nil {
		writeError(w, http.StatusNotFound, "task_not_found", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, t)
}

func (h *Handlers) createTask(w http.ResponseWriter, r *http.Request) {
	var req task.CreateTaskRequest
	if err := decodeJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid_json", "Failed to parse JSON body")
		return
	}

	created, err := h.taskSvc.Create(r.Context(), req)
	if err != nil {
		writeError(w, http.StatusBadRequest, "create_failed", err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, created)
}

func (h *Handlers) updateTask(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	var req task.UpdateTaskRequest
	if err := decodeJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid_json", "Failed to parse JSON body")
		return
	}

	updated, err := h.taskSvc.Update(r.Context(), id, req)
	if err != nil {
		writeError(w, http.StatusBadRequest, "update_failed", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, updated)
}

func (h *Handlers) deleteTask(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if err := h.taskSvc.Delete(r.Context(), id); err != nil {
		writeError(w, http.StatusNotFound, "delete_failed", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]bool{"deleted": true})
}

func (h *Handlers) bulkTasks(w http.ResponseWriter, r *http.Request) {
	var req task.BulkActionRequest
	if err := decodeJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid_json", "Failed to parse JSON body")
		return
	}

	if err := h.taskSvc.BulkAction(r.Context(), req); err != nil {
		writeError(w, http.StatusBadRequest, "bulk_action_failed", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]bool{"success": true})
}

// Inline updates (PDF Page 4)
func (h *Handlers) changeStatus(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	var body struct {
		Status   string `json:"status"`
		StatusID string `json:"statusId"`
	}
	if err := decodeJSON(r, &body); err != nil {
		writeError(w, http.StatusBadRequest, "invalid_json", "Failed to parse JSON body")
		return
	}

	val := body.StatusID
	if val == "" {
		val = body.Status
	}
	if val == "" {
		writeError(w, http.StatusBadRequest, "status_required", "status or statusId is required")
		return
	}

	updated, err := h.taskSvc.UpdateStatus(r.Context(), id, val)
	if err != nil {
		writeError(w, http.StatusBadRequest, "status_update_failed", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, updated)
}

func (h *Handlers) changePriority(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	var body struct {
		Priority   string `json:"priority"`
		PriorityID string `json:"priorityId"`
	}
	if err := decodeJSON(r, &body); err != nil {
		writeError(w, http.StatusBadRequest, "invalid_json", "Failed to parse JSON body")
		return
	}

	val := body.PriorityID
	if val == "" {
		val = body.Priority
	}
	if val == "" {
		writeError(w, http.StatusBadRequest, "priority_required", "priority or priorityId is required")
		return
	}

	updated, err := h.taskSvc.UpdatePriority(r.Context(), id, val)
	if err != nil {
		writeError(w, http.StatusBadRequest, "priority_update_failed", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, updated)
}

func (h *Handlers) changeCategory(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	var body struct {
		Category   string `json:"category"`
		CategoryID string `json:"categoryId"`
	}
	if err := decodeJSON(r, &body); err != nil {
		writeError(w, http.StatusBadRequest, "invalid_json", "Failed to parse JSON body")
		return
	}

	val := body.CategoryID
	if val == "" {
		val = body.Category
	}
	if val == "" {
		writeError(w, http.StatusBadRequest, "category_required", "category or categoryId is required")
		return
	}

	updated, err := h.taskSvc.UpdateCategory(r.Context(), id, val)
	if err != nil {
		writeError(w, http.StatusBadRequest, "category_update_failed", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, updated)
}

func (h *Handlers) changeDueDate(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	var body struct {
		DueDate *string `json:"dueDate"`
	}
	if err := decodeJSON(r, &body); err != nil {
		writeError(w, http.StatusBadRequest, "invalid_json", "Failed to parse JSON body")
		return
	}

	updated, err := h.taskSvc.UpdateDueDate(r.Context(), id, body.DueDate)
	if err != nil {
		writeError(w, http.StatusBadRequest, "due_date_update_failed", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, updated)
}

// Checklists (PDF Page 7)
func (h *Handlers) addChecklist(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	var body struct {
		Text string `json:"text"`
	}
	if err := decodeJSON(r, &body); err != nil || strings.TrimSpace(body.Text) == "" {
		writeError(w, http.StatusBadRequest, "text_required", "text is required")
		return
	}

	item, err := h.taskSvc.AddChecklist(r.Context(), id, body.Text)
	if err != nil {
		writeError(w, http.StatusBadRequest, "add_checklist_failed", err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, item)
}

func (h *Handlers) toggleChecklist(w http.ResponseWriter, r *http.Request) {
	cid := r.PathValue("cid")
	item, err := h.taskSvc.ToggleChecklist(r.Context(), cid)
	if err != nil {
		writeError(w, http.StatusBadRequest, "toggle_checklist_failed", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, item)
}

func (h *Handlers) deleteChecklist(w http.ResponseWriter, r *http.Request) {
	cid := r.PathValue("cid")
	if err := h.taskSvc.DeleteChecklist(r.Context(), cid); err != nil {
		writeError(w, http.StatusBadRequest, "delete_checklist_failed", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]bool{"deleted": true})
}

// Comments (PDF Page 7)
func (h *Handlers) listComments(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	comments, err := h.taskSvc.ListComments(r.Context(), id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "database_error", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": comments})
}

func (h *Handlers) addComment(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	var body struct {
		Text string `json:"text"`
	}
	if err := decodeJSON(r, &body); err != nil || strings.TrimSpace(body.Text) == "" {
		writeError(w, http.StatusBadRequest, "text_required", "comment text is required")
		return
	}

	comment, err := h.taskSvc.AddComment(r.Context(), id, body.Text, nil)
	if err != nil {
		writeError(w, http.StatusBadRequest, "add_comment_failed", err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, comment)
}

// Attachments
func (h *Handlers) listAttachments(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	items, err := h.taskSvc.ListAttachments(r.Context(), id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "database_error", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": items})
}

func (h *Handlers) addAttachment(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	var body struct {
		Name     string `json:"name"`
		Type     string `json:"type"`
		Size     int64  `json:"size"`
	}
	if err := decodeJSON(r, &body); err != nil || strings.TrimSpace(body.Name) == "" {
		writeError(w, http.StatusBadRequest, "name_required", "file name is required")
		return
	}
	if body.Type == "" {
		body.Type = "application/octet-stream"
	}
	if body.Size <= 0 {
		body.Size = 1024 * 128
	}

	att, err := h.taskSvc.AddAttachment(r.Context(), id, body.Name, body.Type, body.Size)
	if err != nil {
		writeError(w, http.StatusBadRequest, "add_attachment_failed", err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, att)
}

func (h *Handlers) deleteAttachment(w http.ResponseWriter, r *http.Request) {
	aid := r.PathValue("aid")
	if err := h.taskSvc.DeleteAttachment(r.Context(), aid); err != nil {
		writeError(w, http.StatusBadRequest, "delete_attachment_failed", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]bool{"deleted": true})
}

// Task Activity Logs (PDF Page 7)
func (h *Handlers) taskActivity(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	logs, err := h.taskSvc.ListActivityLogs(r.Context(), id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "database_error", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": logs})
}

// Dashboard endpoints (PDF Page 4)
func (h *Handlers) dashboardSummary(w http.ResponseWriter, r *http.Request) {
	summary, err := h.dashSvc.GetSummary(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "database_error", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, summary)
}

func (h *Handlers) dashboardUpcoming(w http.ResponseWriter, r *http.Request) {
	items, err := h.dashSvc.GetUpcoming(r.Context(), 6)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "database_error", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": items})
}

func (h *Handlers) dashboardWidgets(w http.ResponseWriter, r *http.Request) {
	widgets, err := h.dashSvc.GetWidgets(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "database_error", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": widgets})
}

// Configuration endpoints (PDF Page 5 & 6)
func (h *Handlers) listCategories(w http.ResponseWriter, r *http.Request) {
	items, err := h.confSvc.ListCategories(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "database_error", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": items})
}

func (h *Handlers) createCategory(w http.ResponseWriter, r *http.Request) {
	var c configuration.Category
	if err := decodeJSON(r, &c); err != nil {
		writeError(w, http.StatusBadRequest, "invalid_json", "Failed to parse JSON body")
		return
	}
	created, err := h.confSvc.CreateCategory(r.Context(), c)
	if err != nil {
		writeError(w, http.StatusBadRequest, "create_failed", err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, created)
}

func (h *Handlers) updateCategory(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	var c configuration.Category
	if err := decodeJSON(r, &c); err != nil {
		writeError(w, http.StatusBadRequest, "invalid_json", "Failed to parse JSON body")
		return
	}
	updated, err := h.confSvc.UpdateCategory(r.Context(), id, c)
	if err != nil {
		writeError(w, http.StatusBadRequest, "update_failed", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, updated)
}

func (h *Handlers) deleteCategory(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if err := h.confSvc.DeleteCategory(r.Context(), id); err != nil {
		writeError(w, http.StatusBadRequest, "delete_failed", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]bool{"deleted": true})
}

func (h *Handlers) listStatuses(w http.ResponseWriter, r *http.Request) {
	items, err := h.confSvc.ListStatuses(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "database_error", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": items})
}

func (h *Handlers) createStatus(w http.ResponseWriter, r *http.Request) {
	var s configuration.Status
	if err := decodeJSON(r, &s); err != nil {
		writeError(w, http.StatusBadRequest, "invalid_json", "Failed to parse JSON body")
		return
	}
	created, err := h.confSvc.CreateStatus(r.Context(), s)
	if err != nil {
		writeError(w, http.StatusBadRequest, "create_failed", err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, created)
}

func (h *Handlers) updateStatus(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	var s configuration.Status
	if err := decodeJSON(r, &s); err != nil {
		writeError(w, http.StatusBadRequest, "invalid_json", "Failed to parse JSON body")
		return
	}
	updated, err := h.confSvc.UpdateStatus(r.Context(), id, s)
	if err != nil {
		writeError(w, http.StatusBadRequest, "update_failed", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, updated)
}

func (h *Handlers) deleteStatus(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if err := h.confSvc.DeleteStatus(r.Context(), id); err != nil {
		writeError(w, http.StatusBadRequest, "delete_failed", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]bool{"deleted": true})
}

func (h *Handlers) listPriorities(w http.ResponseWriter, r *http.Request) {
	items, err := h.confSvc.ListPriorities(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "database_error", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": items})
}

func (h *Handlers) listCustomFields(w http.ResponseWriter, r *http.Request) {
	items, err := h.confSvc.ListCustomFields(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "database_error", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": items})
}

func (h *Handlers) createCustomField(w http.ResponseWriter, r *http.Request) {
	var cf configuration.CustomField
	if err := decodeJSON(r, &cf); err != nil {
		writeError(w, http.StatusBadRequest, "invalid_json", "Failed to parse JSON body")
		return
	}
	created, err := h.confSvc.CreateCustomField(r.Context(), cf)
	if err != nil {
		writeError(w, http.StatusBadRequest, "create_failed", err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, created)
}

func (h *Handlers) deleteCustomField(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if err := h.confSvc.DeleteCustomField(r.Context(), id); err != nil {
		writeError(w, http.StatusBadRequest, "delete_failed", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]bool{"deleted": true})
}

func (h *Handlers) publicConfig(w http.ResponseWriter, r *http.Request) {
	settings, err := h.confSvc.GetPublicSettings(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "database_error", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, settings)
}

func (h *Handlers) allSettings(w http.ResponseWriter, r *http.Request) {
	settings, err := h.confSvc.GetAllSettings(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "database_error", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, settings)
}

func (h *Handlers) updateSettings(w http.ResponseWriter, r *http.Request) {
	var body map[string]any
	if err := decodeJSON(r, &body); err != nil {
		writeError(w, http.StatusBadRequest, "invalid_json", "Failed to parse JSON body")
		return
	}
	strMap := make(map[string]string, len(body))
	for k, v := range body {
		strMap[k] = fmt.Sprintf("%v", v)
	}
	if err := h.confSvc.UpdateSettings(r.Context(), strMap); err != nil {
		writeError(w, http.StatusBadRequest, "update_settings_failed", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]bool{"success": true})
}

func (h *Handlers) auditLogs(w http.ResponseWriter, r *http.Request) {
	limit := 50
	if lStr := r.URL.Query().Get("limit"); lStr != "" {
		if parsed, err := strconv.Atoi(lStr); err == nil && parsed > 0 {
			limit = parsed
		}
	}
	logs, err := h.confSvc.ListAuditLogs(r.Context(), limit)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "database_error", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": logs})
}

// Users endpoints
func (h *Handlers) listUsers(w http.ResponseWriter, r *http.Request) {
	users, err := h.userSvc.List(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "database_error", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": users})
}

func (h *Handlers) userPreferences(w http.ResponseWriter, r *http.Request) {
	p, err := h.userSvc.GetPreferences(r.Context(), "default")
	if err != nil {
		writeError(w, http.StatusInternalServerError, "database_error", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, p)
}

func (h *Handlers) updateUserPreferences(w http.ResponseWriter, r *http.Request) {
	var p user.UserPreferences
	if err := decodeJSON(r, &p); err != nil {
		writeError(w, http.StatusBadRequest, "invalid_json", "Failed to parse JSON body")
		return
	}
	p.UserID = "default"
	if err := h.userSvc.UpdatePreferences(r.Context(), &p); err != nil {
		writeError(w, http.StatusBadRequest, "update_preferences_failed", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, p)
}

// Auth endpoints
func (h *Handlers) login(w http.ResponseWriter, r *http.Request) {
	var req auth.LoginRequest
	_ = decodeJSON(r, &req)

	session, err := h.authSvc.Login(r.Context(), req.Email, req.Password)
	if err != nil {
		writeError(w, http.StatusUnauthorized, "invalid_credentials", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, session)
}

func (h *Handlers) me(w http.ResponseWriter, r *http.Request) {
	session, err := h.authSvc.Login(r.Context(), "bishal@taskly.com", "")
	if err != nil {
		writeError(w, http.StatusUnauthorized, "unauthorized", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, session)
}

// Notifications
func (h *Handlers) listNotifications(w http.ResponseWriter, r *http.Request) {
	notifs, err := h.notifSvc.List(r.Context(), "default")
	if err != nil {
		writeError(w, http.StatusInternalServerError, "database_error", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": notifs})
}

func (h *Handlers) markNotificationRead(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if err := h.notifSvc.MarkRead(r.Context(), id); err != nil {
		writeError(w, http.StatusBadRequest, "mark_read_failed", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]bool{"success": true})
}

func (h *Handlers) markAllNotificationsRead(w http.ResponseWriter, r *http.Request) {
	if err := h.notifSvc.MarkAllRead(r.Context()); err != nil {
		writeError(w, http.StatusBadRequest, "mark_all_read_failed", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]bool{"success": true})
}

// Category Reordering
func (h *Handlers) reorderCategories(w http.ResponseWriter, r *http.Request) {
	var req configuration.ReorderCategoriesRequest
	if err := decodeJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid_json", "Failed to parse JSON body")
		return
	}
	if err := h.confSvc.ReorderCategories(r.Context(), req); err != nil {
		writeError(w, http.StatusBadRequest, "reorder_failed", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]bool{"success": true})
}

// Widgets
func (h *Handlers) toggleWidget(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	wgt, err := h.dashSvc.ToggleWidget(r.Context(), id)
	if err != nil {
		writeError(w, http.StatusBadRequest, "toggle_widget_failed", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, wgt)
}

func (h *Handlers) updateWidget(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	var req dashboard.UpdateWidgetRequest
	if err := decodeJSON(r, &req); err != nil {
		wgt, err := h.dashSvc.ToggleWidget(r.Context(), id)
		if err != nil {
			writeError(w, http.StatusBadRequest, "update_widget_failed", err.Error())
			return
		}
		writeJSON(w, http.StatusOK, wgt)
		return
	}
	if req.Enabled == nil && req.Position == nil {
		wgt, err := h.dashSvc.ToggleWidget(r.Context(), id)
		if err != nil {
			writeError(w, http.StatusBadRequest, "update_widget_failed", err.Error())
			return
		}
		writeJSON(w, http.StatusOK, wgt)
		return
	}
	wgt, err := h.dashSvc.UpdateWidget(r.Context(), id, req)
	if err != nil {
		writeError(w, http.StatusBadRequest, "update_widget_failed", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, wgt)
}

// Roles & Users (RBAC)
func (h *Handlers) listRoles(w http.ResponseWriter, r *http.Request) {
	roles, err := h.userSvc.ListRoles(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "database_error", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": roles})
}

func (h *Handlers) createUser(w http.ResponseWriter, r *http.Request) {
	var req user.CreateUserRequest
	if err := decodeJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid_json", "Failed to parse JSON body")
		return
	}
	u, err := h.userSvc.Create(r.Context(), req)
	if err != nil {
		writeError(w, http.StatusBadRequest, "create_user_failed", err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, u)
}

func (h *Handlers) updateUserRole(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	var body struct {
		Role string `json:"role"`
	}
	if err := decodeJSON(r, &body); err != nil || strings.TrimSpace(body.Role) == "" {
		writeError(w, http.StatusBadRequest, "role_required", "role is required")
		return
	}
	u, err := h.userSvc.UpdateRole(r.Context(), id, body.Role)
	if err != nil {
		writeError(w, http.StatusBadRequest, "update_role_failed", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, u)
}

// Database Reset (PDF Page 11)
func (h *Handlers) resetDatabase(w http.ResponseWriter, r *http.Request) {
	if err := h.confSvc.ResetSeed(r.Context()); err != nil {
		writeError(w, http.StatusInternalServerError, "reset_failed", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"success": true,
		"message": "Database state successfully reset to original seed data",
	})
}

