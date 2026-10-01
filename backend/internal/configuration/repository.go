package configuration

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	pool *pgxpool.Pool
}

func NewRepository(pool *pgxpool.Pool) *Repository {
	return &Repository{pool: pool}
}

// Categories
func (r *Repository) ListCategories(ctx context.Context) ([]Category, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, name, COALESCE(description,''), COALESCE(icon,''), color, sort_order
		FROM task_categories
		WHERE is_active = TRUE
		ORDER BY sort_order ASC, name ASC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := make([]Category, 0)
	for rows.Next() {
		var c Category
		if err := rows.Scan(&c.ID, &c.Name, &c.Description, &c.Icon, &c.Color, &c.SortOrder); err != nil {
			continue
		}
		items = append(items, c)
	}
	return items, nil
}

func (r *Repository) CreateCategory(ctx context.Context, c *Category) (string, error) {
	var id string
	err := r.pool.QueryRow(ctx, `
		INSERT INTO task_categories (name, description, icon, color, sort_order)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id
	`, c.Name, c.Description, c.Icon, c.Color, c.SortOrder).Scan(&id)
	return id, err
}

func (r *Repository) UpdateCategory(ctx context.Context, id string, c *Category) error {
	tag, err := r.pool.Exec(ctx, `
		UPDATE task_categories
		SET name = $1, description = $2, icon = $3, color = $4, sort_order = $5, updated_at = NOW()
		WHERE id = $6
	`, c.Name, c.Description, c.Icon, c.Color, c.SortOrder, id)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return errors.New("category not found")
	}
	return nil
}

func (r *Repository) DeleteCategory(ctx context.Context, id string) error {
	_, err := r.pool.Exec(ctx, "UPDATE task_categories SET is_active = FALSE WHERE id = $1", id)
	return err
}

func (r *Repository) ReorderCategories(ctx context.Context, items []CategoryOrderItem) error {
	if len(items) == 0 {
		return nil
	}
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	for _, item := range items {
		if item.ID == "" {
			continue
		}
		_, err := tx.Exec(ctx, `
			UPDATE task_categories 
			SET sort_order = $1, updated_at = NOW() 
			WHERE id::text = $2 OR name ILIKE $2
		`, item.SortOrder, item.ID)
		if err != nil {
			return fmt.Errorf("update category sort order: %w", err)
		}
	}
	return tx.Commit(ctx)
}

// Statuses
func (r *Repository) ListStatuses(ctx context.Context) ([]Status, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, code, name, COALESCE(description,''), color, sort_order, is_default, is_terminal
		FROM task_statuses
		WHERE is_active = TRUE
		ORDER BY sort_order ASC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := make([]Status, 0)
	for rows.Next() {
		var s Status
		if err := rows.Scan(&s.ID, &s.Code, &s.Name, &s.Description, &s.Color, &s.SortOrder, &s.IsDefault, &s.IsTerminal); err != nil {
			continue
		}
		items = append(items, s)
	}
	return items, nil
}

func (r *Repository) CreateStatus(ctx context.Context, s *Status) (string, error) {
	var id string
	err := r.pool.QueryRow(ctx, `
		INSERT INTO task_statuses (code, name, description, color, sort_order, is_default, is_terminal)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id
	`, s.Code, s.Name, s.Description, s.Color, s.SortOrder, s.IsDefault, s.IsTerminal).Scan(&id)
	return id, err
}

func (r *Repository) UpdateStatus(ctx context.Context, id string, s *Status) error {
	tag, err := r.pool.Exec(ctx, `
		UPDATE task_statuses
		SET code = $1, name = $2, description = $3, color = $4, sort_order = $5, is_default = $6, is_terminal = $7, updated_at = NOW()
		WHERE id = $8
	`, s.Code, s.Name, s.Description, s.Color, s.SortOrder, s.IsDefault, s.IsTerminal, id)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return errors.New("status not found")
	}
	return nil
}

func (r *Repository) DeleteStatus(ctx context.Context, id string) error {
	_, err := r.pool.Exec(ctx, "UPDATE task_statuses SET is_active = FALSE WHERE id = $1", id)
	return err
}

// Priorities
func (r *Repository) ListPriorities(ctx context.Context) ([]Priority, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, code, name, color, sort_order, weight
		FROM task_priorities
		WHERE is_active = TRUE
		ORDER BY sort_order ASC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := make([]Priority, 0)
	for rows.Next() {
		var p Priority
		if err := rows.Scan(&p.ID, &p.Code, &p.Name, &p.Color, &p.SortOrder, &p.Weight); err != nil {
			continue
		}
		items = append(items, p)
	}
	return items, nil
}

// Custom Fields
func (r *Repository) ListCustomFields(ctx context.Context) ([]CustomField, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, name, field_key, field_type, options_json, sort_order
		FROM custom_fields
		WHERE is_active = TRUE
		ORDER BY sort_order ASC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := make([]CustomField, 0)
	for rows.Next() {
		var cf CustomField
		var rawOptions []byte
		if err := rows.Scan(&cf.ID, &cf.Name, &cf.FieldKey, &cf.FieldType, &rawOptions, &cf.SortOrder); err != nil {
			continue
		}
		_ = json.Unmarshal(rawOptions, &cf.Options)
		items = append(items, cf)
	}
	return items, nil
}

func (r *Repository) CreateCustomField(ctx context.Context, cf *CustomField) (string, error) {
	var id string
	optBytes, _ := json.Marshal(cf.Options)
	err := r.pool.QueryRow(ctx, `
		INSERT INTO custom_fields (name, field_key, field_type, options_json, sort_order)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id
	`, cf.Name, cf.FieldKey, cf.FieldType, optBytes, cf.SortOrder).Scan(&id)
	return id, err
}

func (r *Repository) DeleteCustomField(ctx context.Context, id string) error {
	_, err := r.pool.Exec(ctx, "UPDATE custom_fields SET is_active = FALSE WHERE id = $1", id)
	return err
}

func enrichSettings(settings map[string]any) map[string]any {
	if _, ok := settings["appName"]; !ok {
		if val, exists := settings["app.name"]; exists {
			settings["appName"] = val
		} else {
			settings["appName"] = "EasyMyLearning"
		}
	}
	if _, ok := settings["brandColor"]; !ok {
		if val, exists := settings["app.primary_color"]; exists {
			settings["brandColor"] = val
		} else {
			settings["brandColor"] = "#FFAA00"
		}
	}
	if _, ok := settings["companyName"]; !ok {
		settings["companyName"] = "EasyMyLearning Inc."
	}
	if _, ok := settings["supportEmail"]; !ok {
		settings["supportEmail"] = "support@easymylearning.com"
	}
	if _, ok := settings["defaultView"]; !ok {
		settings["defaultView"] = "list"
	}
	if _, ok := settings["theme"]; !ok {
		settings["theme"] = "light"
	}
	if _, ok := settings["auditEnabled"]; !ok {
		settings["auditEnabled"] = true
	}
	return settings
}

// System Settings
func (r *Repository) GetPublicSettings(ctx context.Context) (map[string]any, error) {
	rows, err := r.pool.Query(ctx, "SELECT setting_key, COALESCE(setting_value,'') FROM system_settings WHERE is_public = TRUE")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	settings := make(map[string]any)
	for rows.Next() {
		var k, v string
		if err := rows.Scan(&k, &v); err != nil {
			continue
		}
		settings[k] = v
	}
	return enrichSettings(settings), nil
}

func (r *Repository) GetAllSettings(ctx context.Context) (map[string]any, error) {
	rows, err := r.pool.Query(ctx, "SELECT setting_key, COALESCE(setting_value,'') FROM system_settings")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	settings := make(map[string]any)
	for rows.Next() {
		var k, v string
		if err := rows.Scan(&k, &v); err != nil {
			continue
		}
		settings[k] = v
	}
	return enrichSettings(settings), nil
}

func (r *Repository) UpdateSetting(ctx context.Context, key, val string) error {
	query := `
		INSERT INTO system_settings (setting_key, setting_value, updated_at)
		VALUES ($1, $2, NOW())
		ON CONFLICT (setting_key) DO UPDATE
		SET setting_value = EXCLUDED.setting_value, updated_at = NOW()
	`
	_, err := r.pool.Exec(ctx, query, key, val)
	if err != nil {
		return err
	}

	// Mirror camelCase <-> dot notation
	if key == "appName" {
		_, _ = r.pool.Exec(ctx, query, "app.name", val)
	} else if key == "app.name" {
		_, _ = r.pool.Exec(ctx, query, "appName", val)
	} else if key == "brandColor" {
		_, _ = r.pool.Exec(ctx, query, "app.primary_color", val)
	} else if key == "app.primary_color" {
		_, _ = r.pool.Exec(ctx, query, "brandColor", val)
	}
	return nil
}

// Audit Logs (system-wide)
func (r *Repository) ListAuditLogs(ctx context.Context, limit int) ([]map[string]any, error) {
	if limit <= 0 || limit > 100 {
		limit = 50
	}
	query := `
		SELECT a.id, a.action, COALESCE(u.name, 'Admin'), 
		       COALESCE(a.new_value->>'detail', a.action),
		       to_char(a.created_at, 'YYYY-MM-DD HH24:MI:SS')
		FROM task_activity_logs a
		LEFT JOIN users u ON u.id = a.user_id
		ORDER BY a.created_at DESC
		LIMIT $1
	`
	rows, err := r.pool.Query(ctx, query, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := make([]map[string]any, 0)
	for rows.Next() {
		var id, action, user, detail, ts string
		if err := rows.Scan(&id, &action, &user, &detail, &ts); err != nil {
			continue
		}
		items = append(items, map[string]any{
			"id":        id,
			"action":    action,
			"user":      user,
			"detail":    detail,
			"timestamp": ts,
		})
	}
	return items, nil
}

// Reset seed data (PDF Page 11)
func (r *Repository) ResetSeed(ctx context.Context) error {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	// Clean tasks and task-dependent tables
	_, _ = tx.Exec(ctx, "DELETE FROM task_activity_logs")
	_, _ = tx.Exec(ctx, "DELETE FROM task_attachments")
	_, _ = tx.Exec(ctx, "DELETE FROM task_comments")
	_, _ = tx.Exec(ctx, "DELETE FROM task_checklists")
	_, _ = tx.Exec(ctx, "DELETE FROM tasks")

	// Ensure categories exist and are active
	categories := []struct {
		name, desc, icon, color string
		order                   int
	}{
		{"Work", "General work tasks", "briefcase", "#4F46E5", 1},
		{"Personal", "Personal productivity", "user", "#F59E0B", 2},
		{"Study", "Learning and study tasks", "book-open", "#10B981", 3},
		{"Marketing", "Marketing and content", "megaphone", "#EC4899", 4},
		{"Operations", "Operations and internal process", "settings", "#0EA5E9", 5},
		{"Admissions", "Admissions and counselling", "graduation-cap", "#8B5CF6", 6},
		{"Finance", "Finance and payments", "wallet-cards", "#16A34A", 7},
	}
	for _, c := range categories {
		_, _ = tx.Exec(ctx, `
			INSERT INTO task_categories (name, description, icon, color, sort_order, is_active)
			VALUES ($1, $2, $3, $4, $5, TRUE)
			ON CONFLICT (name) DO UPDATE
			SET is_active = TRUE, sort_order = EXCLUDED.sort_order
		`, c.name, c.desc, c.icon, c.color, c.order)
	}

	// Reinsert demo tasks
	demoTasks := []struct {
		title, desc, status, priority, category string
		daysOffset                              int
	}{
		{
			"Finalize Taskly content plan",
			"Finalize the content calendar, topics, and publishing schedule for the next campaign.",
			"IN_PROGRESS", "HIGH", "Marketing", 0,
		},
		{
			"Review student application documents",
			"Verify all required academic and identity documents before submission.",
			"NOT_STARTED", "MEDIUM", "Admissions", 0,
		},
		{
			"Prepare tomorrow's team meeting",
			"Prepare agenda, discussion points, metrics, and action items.",
			"COMPLETED", "HIGH", "Work", 0,
		},
		{
			"Update CRM lead tracking system",
			"Add lead status rules, follow-up fields, and dashboard tracking improvements.",
			"IN_PROGRESS", "MEDIUM", "Operations", 1,
		},
		{
			"Follow up on pending approval",
			"Follow up on the pending approval and document the response for the team.",
			"NOT_STARTED", "HIGH", "Operations", -1,
		},
	}

	for i, dt := range demoTasks {
		_, _ = tx.Exec(ctx, `
			INSERT INTO tasks (title, description, status_id, priority_id, category_id, due_date, sort_order)
			VALUES (
				$1, $2,
				(SELECT id FROM task_statuses WHERE code = $3 LIMIT 1),
				(SELECT id FROM task_priorities WHERE code = $4 LIMIT 1),
				(SELECT id FROM task_categories WHERE name = $5 LIMIT 1),
				CURRENT_DATE + $6 * INTERVAL '1 day',
				$7
			)
		`, dt.title, dt.desc, dt.status, dt.priority, dt.category, dt.daysOffset, i+1)
	}

	// Add audit log for the reset action
	_, _ = tx.Exec(ctx, `
		INSERT INTO task_activity_logs (action, new_value)
		VALUES ('DATABASE_RESET', jsonb_build_object('detail', 'Database state restored to original demo seed'))
	`)

	return tx.Commit(ctx)
}
