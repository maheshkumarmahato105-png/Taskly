package httpapi

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/taskly/task-manager/backend/internal/task"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Handlers struct {
	DB *pgxpool.Pool
}

func NewHandlers(pool *pgxpool.Pool) *Handlers {
	return &Handlers{DB: pool}
}

func (h *Handlers) health(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
	defer cancel()
	if err := h.DB.Ping(ctx); err != nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]string{"status": "degraded", "database": "down"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok", "database": "up"})
}

func (h *Handlers) listTasks(w http.ResponseWriter, r *http.Request) {
	query := `
		SELECT t.id, t.title, COALESCE(t.description,''), s.name, p.name, c.name,
		       CASE WHEN t.due_date IS NULL THEN NULL ELSE to_char(t.due_date,'YYYY-MM-DD') END,
		       to_char(t.created_at,'YYYY-MM-DD"T"HH24:MI:SSZ'),
		       to_char(t.updated_at,'YYYY-MM-DD"T"HH24:MI:SSZ')
		FROM tasks t
		JOIN task_statuses s ON s.id=t.status_id
		JOIN task_priorities p ON p.id=t.priority_id
		JOIN task_categories c ON c.id=t.category_id
		WHERE t.is_archived=FALSE
	`
	args := make([]any, 0, 3)
	if status := r.URL.Query().Get("status"); status != "" {
		query += " AND s.code=$1"
		args = append(args, status)
	}
	if category := r.URL.Query().Get("category"); category != "" {
		pos := len(args) + 1
		query += " AND c.name=$" + itoa(pos)
		args = append(args, category)
	}
	if search := strings.TrimSpace(r.URL.Query().Get("search")); search != "" {
		pos := len(args) + 1
		query += " AND (t.title ILIKE '%'||$" + itoa(pos) + "||'%' OR t.description ILIKE '%'||$" + itoa(pos) + "||'%')"
		args = append(args, search)
	}
	query += " ORDER BY t.sort_order ASC, t.due_date NULLS LAST, t.created_at DESC"

	rows, err := h.DB.Query(r.Context(), query, args...)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "database_error"})
		return
	}
	defer rows.Close()

	result := make([]task.Task, 0)
	for rows.Next() {
		var item task.Task
		if err := rows.Scan(&item.ID, &item.Title, &item.Description, &item.Status, &item.Priority, &item.Category, &item.DueDate, &item.CreatedAt, &item.UpdatedAt); err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "scan_error"})
			return
		}
		result = append(result, item)
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": result})
}

func (h *Handlers) getTaskByID(w http.ResponseWriter, r *http.Request, id string) {
	var item task.Task
	err := h.DB.QueryRow(r.Context(), `
		SELECT t.id,t.title,COALESCE(t.description,''),s.name,p.name,c.name,
		       CASE WHEN t.due_date IS NULL THEN NULL ELSE to_char(t.due_date,'YYYY-MM-DD') END,
		       to_char(t.created_at,'YYYY-MM-DD"T"HH24:MI:SSZ'),
		       to_char(t.updated_at,'YYYY-MM-DD"T"HH24:MI:SSZ')
		FROM tasks t
		JOIN task_statuses s ON s.id=t.status_id
		JOIN task_priorities p ON p.id=t.priority_id
		JOIN task_categories c ON c.id=t.category_id
		WHERE t.id=$1 AND t.is_archived=FALSE`, id).
		Scan(&item.ID, &item.Title, &item.Description, &item.Status, &item.Priority, &item.Category, &item.DueDate, &item.CreatedAt, &item.UpdatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "task_not_found"})
		return
	}
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "database_error"})
		return
	}
	writeJSON(w, http.StatusOK, item)
}

func (h *Handlers) getTask(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	var item task.Task
	err := h.DB.QueryRow(r.Context(), `
		SELECT t.id,t.title,COALESCE(t.description,''),s.name,p.name,c.name,
		       CASE WHEN t.due_date IS NULL THEN NULL ELSE to_char(t.due_date,'YYYY-MM-DD') END,
		       to_char(t.created_at,'YYYY-MM-DD"T"HH24:MI:SSZ'),
		       to_char(t.updated_at,'YYYY-MM-DD"T"HH24:MI:SSZ')
		FROM tasks t
		JOIN task_statuses s ON s.id=t.status_id
		JOIN task_priorities p ON p.id=t.priority_id
		JOIN task_categories c ON c.id=t.category_id
		WHERE t.id=$1 AND t.is_archived=FALSE`, id).
		Scan(&item.ID, &item.Title, &item.Description, &item.Status, &item.Priority, &item.Category, &item.DueDate, &item.CreatedAt, &item.UpdatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "task_not_found"})
		return
	}
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "database_error"})
		return
	}
	writeJSON(w, http.StatusOK, item)
}

func (h *Handlers) createTask(w http.ResponseWriter, r *http.Request) {
	var input task.CreateTaskRequest
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid_json"})
		return
	}
	if strings.TrimSpace(input.Title) == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "title_required"})
		return
	}

	var id string
	err := h.DB.QueryRow(r.Context(), `
		INSERT INTO tasks(title,description,status_id,priority_id,category_id,due_date)
		VALUES($1,$2,$3,$4,$5,$6)
		RETURNING id`, input.Title, input.Description, input.StatusID, input.PriorityID, input.CategoryID, input.DueDate).Scan(&id)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "create_failed"})
		return
	}

	r.URL.Path = "/api/v1/tasks/" + id
	h.getTask(w, r)
}

func (h *Handlers) updateTask(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	var input task.UpdateTaskRequest
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid_json"})
		return
	}
	_, err := h.DB.Exec(r.Context(), `
		UPDATE tasks
		SET title=$1,description=$2,status_id=$3,priority_id=$4,category_id=$5,due_date=$6,updated_at=NOW()
		WHERE id=$7 AND is_archived=FALSE`,
		input.Title, input.Description, input.StatusID, input.PriorityID, input.CategoryID, input.DueDate, id)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "update_failed"})
		return
	}
	r.URL.Path = "/api/v1/tasks/" + id
	h.getTask(w, r)
}

func (h *Handlers) deleteTask(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	tag, err := h.DB.Exec(r.Context(), "UPDATE tasks SET is_archived=TRUE,updated_at=NOW() WHERE id=$1", id)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "delete_failed"})
		return
	}
	if tag.RowsAffected() == 0 {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "task_not_found"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]bool{"deleted": true})
}

func (h *Handlers) changeStatus(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	var body struct {
		StatusID string `json:"statusId"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.StatusID == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "status_id_required"})
		return
	}
	_, err := h.DB.Exec(r.Context(), `UPDATE tasks SET status_id=$1,completed_at=CASE WHEN EXISTS(SELECT 1 FROM task_statuses s WHERE s.id=$1 AND s.is_terminal) THEN NOW() ELSE NULL END,updated_at=NOW() WHERE id=$2 AND is_archived=FALSE`, body.StatusID, id)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "status_update_failed"})
		return
	}
	r.URL.Path = "/api/v1/tasks/" + id
	h.getTask(w, r)
}

func (h *Handlers) changePriority(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	var body struct {
		PriorityID string `json:"priorityId"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.PriorityID == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "priority_id_required"})
		return
	}
	_, err := h.DB.Exec(r.Context(), "UPDATE tasks SET priority_id=$1,updated_at=NOW() WHERE id=$2 AND is_archived=FALSE", body.PriorityID, id)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "priority_update_failed"})
		return
	}
	r.URL.Path = "/api/v1/tasks/" + id
	h.getTask(w, r)
}

func (h *Handlers) changeCategory(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	var body struct {
		CategoryID string `json:"categoryId"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.CategoryID == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "category_id_required"})
		return
	}
	_, err := h.DB.Exec(r.Context(), "UPDATE tasks SET category_id=$1,updated_at=NOW() WHERE id=$2 AND is_archived=FALSE", body.CategoryID, id)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "category_update_failed"})
		return
	}
	r.URL.Path = "/api/v1/tasks/" + id
	h.getTask(w, r)
}

func (h *Handlers) changeDueDate(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	var body struct {
		DueDate *string `json:"dueDate"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid_body"})
		return
	}
	_, err := h.DB.Exec(r.Context(), "UPDATE tasks SET due_date=$1,updated_at=NOW() WHERE id=$2 AND is_archived=FALSE", body.DueDate, id)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "due_date_update_failed"})
		return
	}
	r.URL.Path = "/api/v1/tasks/" + id
	h.getTask(w, r)
}

func (h *Handlers) dashboardSummary(w http.ResponseWriter, r *http.Request) {
	var total, notStarted, inProgress, completed, overdue int
	err := h.DB.QueryRow(r.Context(), `SELECT COUNT(*) FROM tasks WHERE is_archived=FALSE`).Scan(&total)
	if err != nil {
		writeJSON(w, 500, map[string]string{"error": "database_error"})
		return
	}
	_ = h.DB.QueryRow(r.Context(), `SELECT COUNT(*) FROM tasks t JOIN task_statuses s ON s.id=t.status_id WHERE t.is_archived=FALSE AND s.code='NOT_STARTED'`).Scan(&notStarted)
	_ = h.DB.QueryRow(r.Context(), `SELECT COUNT(*) FROM tasks t JOIN task_statuses s ON s.id=t.status_id WHERE t.is_archived=FALSE AND s.code='IN_PROGRESS'`).Scan(&inProgress)
	_ = h.DB.QueryRow(r.Context(), `SELECT COUNT(*) FROM tasks t JOIN task_statuses s ON s.id=t.status_id WHERE t.is_archived=FALSE AND s.code='COMPLETED'`).Scan(&completed)
	_ = h.DB.QueryRow(r.Context(), `SELECT COUNT(*) FROM tasks t JOIN task_statuses s ON s.id=t.status_id WHERE t.is_archived=FALSE AND s.is_terminal=FALSE AND t.due_date < CURRENT_DATE`).Scan(&overdue)
	pct := 0
	if total > 0 {
		pct = int(float64(completed) / float64(total) * 100)
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"totalTasks": total, "notStarted": notStarted, "inProgress": inProgress,
		"completed": completed, "overdue": overdue, "completionRate": pct,
	})
}

func (h *Handlers) dashboardUpcoming(w http.ResponseWriter, r *http.Request) {
	rows, err := h.DB.Query(r.Context(), `
		SELECT t.id,t.title,s.name,c.name,to_char(t.due_date,'YYYY-MM-DD')
		FROM tasks t
		JOIN task_statuses s ON s.id=t.status_id
		JOIN task_categories c ON c.id=t.category_id
		WHERE t.is_archived=FALSE AND s.is_terminal=FALSE AND t.due_date IS NOT NULL
		ORDER BY t.due_date ASC LIMIT 6`)
	if err != nil {
		writeJSON(w, 500, map[string]string{"error": "database_error"})
		return
	}
	defer rows.Close()
	type item struct{ ID, Title, Status, Category, DueDate string }
	items := make([]item, 0)
	for rows.Next() {
		var x item
		if err := rows.Scan(&x.ID, &x.Title, &x.Status, &x.Category, &x.DueDate); err != nil {
			writeJSON(w, 500, map[string]string{"error": "scan_error"})
			return
		}
		items = append(items, x)
	}
	writeJSON(w, 200, map[string]any{"items": items})
}

func (h *Handlers) listCategories(w http.ResponseWriter, r *http.Request) {
	rows, err := h.DB.Query(r.Context(), `SELECT id,name,COALESCE(description,''),COALESCE(icon,''),color FROM task_categories WHERE is_active=TRUE ORDER BY sort_order,name`)
	if err != nil {
		writeJSON(w, 500, map[string]string{"error": "database_error"})
		return
	}
	defer rows.Close()
	items := make([]map[string]string, 0)
	for rows.Next() {
		var id, name, description, icon, color string
		if err := rows.Scan(&id, &name, &description, &icon, &color); err != nil {
			continue
		}
		items = append(items, map[string]string{"id": id, "name": name, "description": description, "icon": icon, "color": color})
	}
	writeJSON(w, 200, map[string]any{"items": items})
}

func (h *Handlers) listStatuses(w http.ResponseWriter, r *http.Request) {
	rows, err := h.DB.Query(r.Context(), `SELECT id,code,name,description,color FROM task_statuses WHERE is_active=TRUE ORDER BY sort_order`)
	if err != nil {
		writeJSON(w, 500, map[string]string{"error": "database_error"})
		return
	}
	defer rows.Close()
	items := make([]map[string]string, 0)
	for rows.Next() {
		var id, code, name, description, color string
		if err := rows.Scan(&id, &code, &name, &description, &color); err != nil {
			continue
		}
		items = append(items, map[string]string{"id": id, "code": code, "name": name, "description": description, "color": color})
	}
	writeJSON(w, 200, map[string]any{"items": items})
}

func (h *Handlers) listPriorities(w http.ResponseWriter, r *http.Request) {
	rows, err := h.DB.Query(r.Context(), `SELECT id,code,name,color FROM task_priorities WHERE is_active=TRUE ORDER BY sort_order`)
	if err != nil {
		writeJSON(w, 500, map[string]string{"error": "database_error"})
		return
	}
	defer rows.Close()
	items := make([]map[string]string, 0)
	for rows.Next() {
		var id, code, name, color string
		if err := rows.Scan(&id, &code, &name, &color); err != nil {
			continue
		}
		items = append(items, map[string]string{"id": id, "code": code, "name": name, "color": color})
	}
	writeJSON(w, 200, map[string]any{"items": items})
}

func (h *Handlers) publicConfig(w http.ResponseWriter, r *http.Request) {
	rows, err := h.DB.Query(r.Context(), `SELECT setting_key,COALESCE(setting_value,''),data_type FROM system_settings WHERE is_public=TRUE`)
	if err != nil {
		writeJSON(w, 500, map[string]string{"error": "database_error"})
		return
	}
	defer rows.Close()
	items := map[string]any{}
	for rows.Next() {
		var key, value, typ string
		if err := rows.Scan(&key, &value, &typ); err != nil {
			continue
		}
		items[key] = value
	}
	writeJSON(w, 200, map[string]any{"settings": items})
}

func (h *Handlers) dashboardWidgets(w http.ResponseWriter, r *http.Request) {
	rows, err := h.DB.Query(r.Context(), `SELECT id,code,name,widget_type,title,COALESCE(description,''),COALESCE(icon,''),COALESCE(color,''),default_width,sort_order FROM dashboard_widgets WHERE is_active=TRUE ORDER BY sort_order`)
	if err != nil {
		writeJSON(w, 500, map[string]string{"error": "database_error"})
		return
	}
	defer rows.Close()
	type widget struct {
		ID, Code, Name, WidgetType, Title, Description, Icon, Color string
		DefaultWidth, SortOrder                                     int
	}
	items := make([]widget, 0)
	for rows.Next() {
		var x widget
		if err := rows.Scan(&x.ID, &x.Code, &x.Name, &x.WidgetType, &x.Title, &x.Description, &x.Icon, &x.Color, &x.DefaultWidth, &x.SortOrder); err != nil {
			continue
		}
		items = append(items, x)
	}
	writeJSON(w, 200, map[string]any{"items": items})
}

func itoa(v int) string {
	return strconv.Itoa(v)
}
