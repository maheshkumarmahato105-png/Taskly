package task

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	pool *pgxpool.Pool
}

func NewRepository(pool *pgxpool.Pool) *Repository {
	return &Repository{pool: pool}
}

func (r *Repository) List(ctx context.Context, f TaskFilter) ([]Task, error) {
	query := `
		SELECT t.id, t.title, COALESCE(t.description,''), 
		       s.name, s.id, p.name, p.id, c.name, c.id,
		       CASE WHEN t.due_date IS NULL THEN NULL ELSE to_char(t.due_date, 'YYYY-MM-DD') END,
		       COALESCE(u.name, 'Unassigned'),
		       to_char(t.created_at, 'YYYY-MM-DD"T"HH24:MI:SSZ'),
		       to_char(t.updated_at, 'YYYY-MM-DD"T"HH24:MI:SSZ')
		FROM tasks t
		JOIN task_statuses s ON s.id = t.status_id
		JOIN task_priorities p ON p.id = t.priority_id
		JOIN task_categories c ON c.id = t.category_id
		LEFT JOIN users u ON u.id = t.assigned_to
		WHERE t.is_archived = FALSE
	`
	args := make([]any, 0, 5)

	if f.Status != "" {
		pos := len(args) + 1
		query += fmt.Sprintf(" AND (s.code ILIKE $%d OR s.name ILIKE $%d)", pos, pos)
		args = append(args, f.Status)
	}
	if f.Category != "" {
		pos := len(args) + 1
		query += fmt.Sprintf(" AND c.name ILIKE $%d", pos)
		args = append(args, f.Category)
	}
	if f.Priority != "" {
		pos := len(args) + 1
		query += fmt.Sprintf(" AND (p.code ILIKE $%d OR p.name ILIKE $%d)", pos, pos)
		args = append(args, f.Priority)
	}
	if f.Search != "" {
		pos := len(args) + 1
		query += fmt.Sprintf(" AND (t.title ILIKE '%%' || $%d || '%%' OR t.description ILIKE '%%' || $%d || '%%' OR c.name ILIKE '%%' || $%d || '%%')", pos, pos, pos)
		args = append(args, f.Search)
	}
	if f.OverdueOnly {
		query += " AND s.is_terminal = FALSE AND t.due_date < CURRENT_DATE"
	}

	query += " ORDER BY t.sort_order ASC, t.due_date NULLS LAST, t.created_at DESC"

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("query tasks: %w", err)
	}
	defer rows.Close()

	items := make([]Task, 0)
	for rows.Next() {
		var t Task
		if err := rows.Scan(
			&t.ID, &t.Title, &t.Description,
			&t.Status, &t.StatusID, &t.Priority, &t.PriorityID, &t.Category, &t.CategoryID,
			&t.DueDate, &t.Assignee, &t.CreatedAt, &t.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("scan task: %w", err)
		}
		items = append(items, t)
	}

	return items, nil
}

func (r *Repository) GetByID(ctx context.Context, id string) (*Task, error) {
	query := `
		SELECT t.id, t.title, COALESCE(t.description,''),
		       s.name, s.id, p.name, p.id, c.name, c.id,
		       CASE WHEN t.due_date IS NULL THEN NULL ELSE to_char(t.due_date, 'YYYY-MM-DD') END,
		       COALESCE(u.name, 'Unassigned'),
		       to_char(t.created_at, 'YYYY-MM-DD"T"HH24:MI:SSZ'),
		       to_char(t.updated_at, 'YYYY-MM-DD"T"HH24:MI:SSZ')
		FROM tasks t
		JOIN task_statuses s ON s.id = t.status_id
		JOIN task_priorities p ON p.id = t.priority_id
		JOIN task_categories c ON c.id = t.category_id
		LEFT JOIN users u ON u.id = t.assigned_to
		WHERE t.id = $1 AND t.is_archived = FALSE
	`
	var t Task
	err := r.pool.QueryRow(ctx, query, id).Scan(
		&t.ID, &t.Title, &t.Description,
		&t.Status, &t.StatusID, &t.Priority, &t.PriorityID, &t.Category, &t.CategoryID,
		&t.DueDate, &t.Assignee, &t.CreatedAt, &t.UpdatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("get task: %w", err)
	}

	// Fetch relational items
	t.Checklists, _ = r.ListChecklists(ctx, t.ID)
	t.Comments, _ = r.ListComments(ctx, t.ID)
	t.Attachments, _ = r.ListAttachments(ctx, t.ID)
	t.CustomFields, _ = r.GetCustomFieldValues(ctx, t.ID)

	return &t, nil
}

func (r *Repository) Create(ctx context.Context, t *Task) (string, error) {
	query := `
		INSERT INTO tasks (title, description, status_id, priority_id, category_id, assigned_to, due_date)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id
	`
	var newID string
	err := r.pool.QueryRow(ctx, query,
		t.Title, t.Description, t.StatusID, t.PriorityID, t.CategoryID, t.AssignedTo, t.DueDate,
	).Scan(&newID)
	if err != nil {
		return "", fmt.Errorf("insert task: %w", err)
	}

	if len(t.CustomFields) > 0 {
		_ = r.SetCustomFieldValues(ctx, newID, t.CustomFields)
	}

	return newID, nil
}

func (r *Repository) Update(ctx context.Context, id string, t *Task) error {
	query := `
		UPDATE tasks
		SET title = $1, description = $2, status_id = $3, priority_id = $4, category_id = $5,
		    assigned_to = $6, due_date = $7, updated_at = NOW()
		WHERE id = $8 AND is_archived = FALSE
	`
	tag, err := r.pool.Exec(ctx, query,
		t.Title, t.Description, t.StatusID, t.PriorityID, t.CategoryID, t.AssignedTo, t.DueDate, id,
	)
	if err != nil {
		return fmt.Errorf("update task: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return errors.New("task not found")
	}

	if len(t.CustomFields) > 0 {
		_ = r.SetCustomFieldValues(ctx, id, t.CustomFields)
	}
	return nil
}

func (r *Repository) Delete(ctx context.Context, id string) error {
	tag, err := r.pool.Exec(ctx, "UPDATE tasks SET is_archived = TRUE, updated_at = NOW() WHERE id = $1 AND is_archived = FALSE", id)
	if err != nil {
		return fmt.Errorf("archive task: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return errors.New("task not found")
	}
	return nil
}

func (r *Repository) UpdateStatus(ctx context.Context, id, statusID string, isTerminal bool) error {
	var query string
	if isTerminal {
		query = "UPDATE tasks SET status_id = $1, completed_at = NOW(), updated_at = NOW() WHERE id = $2 AND is_archived = FALSE"
	} else {
		query = "UPDATE tasks SET status_id = $1, completed_at = NULL, updated_at = NOW() WHERE id = $2 AND is_archived = FALSE"
	}
	tag, err := r.pool.Exec(ctx, query, statusID, id)
	if err != nil {
		return fmt.Errorf("update status: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return errors.New("task not found")
	}
	return nil
}

func (r *Repository) UpdatePriority(ctx context.Context, id, priorityID string) error {
	tag, err := r.pool.Exec(ctx, "UPDATE tasks SET priority_id = $1, updated_at = NOW() WHERE id = $2 AND is_archived = FALSE", priorityID, id)
	if err != nil {
		return fmt.Errorf("update priority: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return errors.New("task not found")
	}
	return nil
}

func (r *Repository) UpdateCategory(ctx context.Context, id, categoryID string) error {
	tag, err := r.pool.Exec(ctx, "UPDATE tasks SET category_id = $1, updated_at = NOW() WHERE id = $2 AND is_archived = FALSE", categoryID, id)
	if err != nil {
		return fmt.Errorf("update category: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return errors.New("task not found")
	}
	return nil
}

func (r *Repository) UpdateDueDate(ctx context.Context, id string, dueDate *string) error {
	tag, err := r.pool.Exec(ctx, "UPDATE tasks SET due_date = $1, updated_at = NOW() WHERE id = $2 AND is_archived = FALSE", dueDate, id)
	if err != nil {
		return fmt.Errorf("update due date: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return errors.New("task not found")
	}
	return nil
}

func (r *Repository) BulkUpdateStatus(ctx context.Context, ids []string, statusID string, isTerminal bool) error {
	if len(ids) == 0 {
		return nil
	}
	var query string
	if isTerminal {
		query = "UPDATE tasks SET status_id = $1, completed_at = NOW(), updated_at = NOW() WHERE id = ANY($2) AND is_archived = FALSE"
	} else {
		query = "UPDATE tasks SET status_id = $1, completed_at = NULL, updated_at = NOW() WHERE id = ANY($2) AND is_archived = FALSE"
	}
	_, err := r.pool.Exec(ctx, query, statusID, ids)
	return err
}

func (r *Repository) BulkUpdatePriority(ctx context.Context, ids []string, priorityID string) error {
	if len(ids) == 0 {
		return nil
	}
	_, err := r.pool.Exec(ctx, "UPDATE tasks SET priority_id = $1, updated_at = NOW() WHERE id = ANY($2) AND is_archived = FALSE", priorityID, ids)
	return err
}

func (r *Repository) BulkUpdateCategory(ctx context.Context, ids []string, categoryID string) error {
	if len(ids) == 0 {
		return nil
	}
	_, err := r.pool.Exec(ctx, "UPDATE tasks SET category_id = $1, updated_at = NOW() WHERE id = ANY($2) AND is_archived = FALSE", categoryID, ids)
	return err
}

func (r *Repository) BulkArchive(ctx context.Context, ids []string) error {
	if len(ids) == 0 {
		return nil
	}
	_, err := r.pool.Exec(ctx, "UPDATE tasks SET is_archived = TRUE, updated_at = NOW() WHERE id = ANY($1)", ids)
	return err
}

// Checklist repository methods
func (r *Repository) ListChecklists(ctx context.Context, taskID string) ([]ChecklistItem, error) {
	rows, err := r.pool.Query(ctx, "SELECT id, title, is_completed, sort_order FROM task_checklists WHERE task_id = $1 ORDER BY sort_order ASC, created_at ASC", taskID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := make([]ChecklistItem, 0)
	for rows.Next() {
		var item ChecklistItem
		item.TaskID = taskID
		if err := rows.Scan(&item.ID, &item.Text, &item.Done, &item.SortOrder); err != nil {
			continue
		}
		items = append(items, item)
	}
	return items, nil
}

func (r *Repository) AddChecklist(ctx context.Context, taskID, text string) (*ChecklistItem, error) {
	var id string
	err := r.pool.QueryRow(ctx, "INSERT INTO task_checklists (task_id, title) VALUES ($1, $2) RETURNING id", taskID, text).Scan(&id)
	if err != nil {
		return nil, err
	}
	return &ChecklistItem{ID: id, TaskID: taskID, Text: text, Done: false}, nil
}

func (r *Repository) ToggleChecklist(ctx context.Context, id string) (*ChecklistItem, error) {
	var item ChecklistItem
	err := r.pool.QueryRow(ctx, "UPDATE task_checklists SET is_completed = NOT is_completed, updated_at = NOW() WHERE id = $1 RETURNING id, task_id, title, is_completed", id).
		Scan(&item.ID, &item.TaskID, &item.Text, &item.Done)
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *Repository) DeleteChecklist(ctx context.Context, id string) error {
	_, err := r.pool.Exec(ctx, "DELETE FROM task_checklists WHERE id = $1", id)
	return err
}

// Comment repository methods
func (r *Repository) ListComments(ctx context.Context, taskID string) ([]TaskComment, error) {
	query := `
		SELECT c.id, COALESCE(u.name, 'Bishal (Lead)'), c.user_id,
		       to_char(c.created_at, 'YYYY-MM-DD HH24:MI'), c.comment
		FROM task_comments c
		LEFT JOIN users u ON u.id = c.user_id
		WHERE c.task_id = $1
		ORDER BY c.created_at ASC
	`
	rows, err := r.pool.Query(ctx, query, taskID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := make([]TaskComment, 0)
	for rows.Next() {
		var c TaskComment
		c.TaskID = taskID
		if err := rows.Scan(&c.ID, &c.Author, &c.UserID, &c.Date, &c.Text); err != nil {
			continue
		}
		items = append(items, c)
	}
	return items, nil
}

func (r *Repository) AddComment(ctx context.Context, taskID, text string, userID *string) (*TaskComment, error) {
	var id string
	query := "INSERT INTO task_comments (task_id, comment, user_id) VALUES ($1, $2, $3) RETURNING id"
	err := r.pool.QueryRow(ctx, query, taskID, text, userID).Scan(&id)
	if err != nil {
		return nil, err
	}
	return &TaskComment{
		ID:     id,
		TaskID: taskID,
		Author: "Bishal (Lead)",
		Date:   "Just now",
		Text:   text,
	}, nil
}

// Attachment repository methods
func (r *Repository) ListAttachments(ctx context.Context, taskID string) ([]TaskAttachment, error) {
	query := `
		SELECT id, file_name, file_size || ' KB', mime_type, COALESCE(file_url, ''),
		       to_char(created_at, 'YYYY-MM-DD')
		FROM task_attachments
		WHERE task_id = $1
		ORDER BY created_at DESC
	`
	rows, err := r.pool.Query(ctx, query, taskID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := make([]TaskAttachment, 0)
	for rows.Next() {
		var a TaskAttachment
		a.TaskID = taskID
		if err := rows.Scan(&a.ID, &a.Name, &a.Size, &a.Type, &a.URL, &a.UploadedAt); err != nil {
			continue
		}
		items = append(items, a)
	}
	return items, nil
}

func (r *Repository) AddAttachment(ctx context.Context, taskID, name, mimeType string, sizeBytes int64) (*TaskAttachment, error) {
	var id string
	query := "INSERT INTO task_attachments (task_id, file_name, file_key, mime_type, file_size) VALUES ($1, $2, $3, $4, $5) RETURNING id"
	key := fmt.Sprintf("attachments/%s/%s", taskID, name)
	err := r.pool.QueryRow(ctx, query, taskID, name, key, mimeType, sizeBytes).Scan(&id)
	if err != nil {
		return nil, err
	}
	return &TaskAttachment{
		ID:         id,
		TaskID:     taskID,
		Name:       name,
		Size:       fmt.Sprintf("%d KB", sizeBytes/1024),
		Type:       mimeType,
		UploadedAt: "Just now",
	}, nil
}

func (r *Repository) DeleteAttachment(ctx context.Context, id string) error {
	_, err := r.pool.Exec(ctx, "DELETE FROM task_attachments WHERE id = $1", id)
	return err
}

// Activity Log methods
func (r *Repository) ListActivityLogs(ctx context.Context, taskID string) ([]ActivityLog, error) {
	query := `
		SELECT a.id, a.action, COALESCE(u.name, 'System'),
		       COALESCE(a.new_value->>'detail', a.action),
		       to_char(a.created_at, 'YYYY-MM-DD HH24:MI:SS')
		FROM task_activity_logs a
		LEFT JOIN users u ON u.id = a.user_id
		WHERE a.task_id = $1
		ORDER BY a.created_at DESC
		LIMIT 20
	`
	rows, err := r.pool.Query(ctx, query, taskID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	logs := make([]ActivityLog, 0)
	for rows.Next() {
		var l ActivityLog
		l.TaskID = taskID
		if err := rows.Scan(&l.ID, &l.Action, &l.User, &l.Detail, &l.Timestamp); err != nil {
			continue
		}
		logs = append(logs, l)
	}
	return logs, nil
}

func (r *Repository) AddActivityLog(ctx context.Context, taskID, action, detail string, userID *string) error {
	query := `
		INSERT INTO task_activity_logs (task_id, user_id, action, new_value)
		VALUES ($1, $2, $3, jsonb_build_object('detail', $4::text))
	`
	_, err := r.pool.Exec(ctx, query, taskID, userID, action, detail)
	return err
}

// Resolution helpers for UUID or human names
func (r *Repository) ResolveStatus(ctx context.Context, val string) (id, name string, isTerminal bool, err error) {
	val = strings.TrimSpace(val)
	if val == "" {
		err = r.pool.QueryRow(ctx, "SELECT id, name, is_terminal FROM task_statuses WHERE is_default = TRUE LIMIT 1").
			Scan(&id, &name, &isTerminal)
		return
	}
	err = r.pool.QueryRow(ctx, `
		SELECT id, name, is_terminal FROM task_statuses
		WHERE id::text = $1 OR code ILIKE $1 OR name ILIKE $1
		LIMIT 1
	`, val).Scan(&id, &name, &isTerminal)
	return
}

func (r *Repository) ResolvePriority(ctx context.Context, val string) (id, name string, err error) {
	val = strings.TrimSpace(val)
	if val == "" {
		err = r.pool.QueryRow(ctx, "SELECT id, name FROM task_priorities WHERE code = 'MEDIUM' LIMIT 1").
			Scan(&id, &name)
		return
	}
	err = r.pool.QueryRow(ctx, `
		SELECT id, name FROM task_priorities
		WHERE id::text = $1 OR code ILIKE $1 OR name ILIKE $1
		LIMIT 1
	`, val).Scan(&id, &name)
	return
}

func (r *Repository) ResolveCategory(ctx context.Context, val string) (id, name string, err error) {
	val = strings.TrimSpace(val)
	if val == "" {
		err = r.pool.QueryRow(ctx, "SELECT id, name FROM task_categories WHERE is_active = TRUE ORDER BY sort_order ASC LIMIT 1").
			Scan(&id, &name)
		return
	}
	err = r.pool.QueryRow(ctx, `
		SELECT id, name FROM task_categories
		WHERE id::text = $1 OR name ILIKE $1
		LIMIT 1
	`, val).Scan(&id, &name)
	return
}

func (r *Repository) ResolveUser(ctx context.Context, val string) (id, name string, err error) {
	val = strings.TrimSpace(val)
	if val == "" {
		err = r.pool.QueryRow(ctx, "SELECT id, name FROM users WHERE is_active = TRUE LIMIT 1").
			Scan(&id, &name)
		return
	}
	err = r.pool.QueryRow(ctx, `
		SELECT id, name FROM users
		WHERE id::text = $1 OR email ILIKE $1 OR name ILIKE $1
		LIMIT 1
	`, val).Scan(&id, &name)
	return
}

func (r *Repository) GetCustomFieldValues(ctx context.Context, taskID string) (map[string]string, error) {
	query := `
		SELECT cf.field_key, COALESCE(v.value_text, v.value_number::text, to_char(v.value_date, 'YYYY-MM-DD'), CASE WHEN v.value_boolean THEN 'true' ELSE 'false' END, '')
		FROM custom_field_values v
		JOIN custom_fields cf ON cf.id = v.custom_field_id
		WHERE v.entity_id = $1
	`
	rows, err := r.pool.Query(ctx, query, taskID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	res := make(map[string]string)
	for rows.Next() {
		var k, v string
		if err := rows.Scan(&k, &v); err != nil {
			continue
		}
		res[k] = v
	}
	return res, nil
}

func (r *Repository) SetCustomFieldValues(ctx context.Context, taskID string, fields map[string]string) error {
	if len(fields) == 0 {
		return nil
	}
	for k, v := range fields {
		var cfID string
		err := r.pool.QueryRow(ctx, "SELECT id FROM custom_fields WHERE field_key = $1 OR name ILIKE $1 LIMIT 1", k).Scan(&cfID)
		if err != nil {
			continue
		}
		query := `
			INSERT INTO custom_field_values (custom_field_id, entity_id, value_text, updated_at)
			VALUES ($1, $2, $3, NOW())
			ON CONFLICT (custom_field_id, entity_id) DO UPDATE
			SET value_text = EXCLUDED.value_text, updated_at = NOW()
		`
		_, _ = r.pool.Exec(ctx, query, cfID, taskID, v)
	}
	return nil
}

