package dashboard

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	pool *pgxpool.Pool
}

func NewRepository(pool *pgxpool.Pool) *Repository {
	return &Repository{pool: pool}
}

func (r *Repository) GetSummary(ctx context.Context) (*Summary, error) {
	var total, notStarted, inProgress, completed, overdue int

	err := r.pool.QueryRow(ctx, "SELECT COUNT(*) FROM tasks WHERE is_archived = FALSE").Scan(&total)
	if err != nil {
		return nil, fmt.Errorf("count total tasks: %w", err)
	}

	_ = r.pool.QueryRow(ctx, `
		SELECT COUNT(*) FROM tasks t
		JOIN task_statuses s ON s.id = t.status_id
		WHERE t.is_archived = FALSE AND (s.code = 'NOT_STARTED' OR s.name ILIKE 'Not Started')
	`).Scan(&notStarted)

	_ = r.pool.QueryRow(ctx, `
		SELECT COUNT(*) FROM tasks t
		JOIN task_statuses s ON s.id = t.status_id
		WHERE t.is_archived = FALSE AND (s.code = 'IN_PROGRESS' OR s.name ILIKE 'In Progress')
	`).Scan(&inProgress)

	_ = r.pool.QueryRow(ctx, `
		SELECT COUNT(*) FROM tasks t
		JOIN task_statuses s ON s.id = t.status_id
		WHERE t.is_archived = FALSE AND (s.code = 'COMPLETED' OR s.is_terminal = TRUE)
	`).Scan(&completed)

	_ = r.pool.QueryRow(ctx, `
		SELECT COUNT(*) FROM tasks t
		JOIN task_statuses s ON s.id = t.status_id
		WHERE t.is_archived = FALSE AND s.is_terminal = FALSE AND t.due_date < CURRENT_DATE
	`).Scan(&overdue)

	rate := 0
	if total > 0 {
		rate = int(float64(completed) / float64(total) * 100)
	}

	return &Summary{
		TotalTasks:     total,
		NotStarted:     notStarted,
		InProgress:     inProgress,
		Completed:      completed,
		Overdue:        overdue,
		CompletionRate: rate,
	}, nil
}

func (r *Repository) GetUpcoming(ctx context.Context, limit int) ([]UpcomingTask, error) {
	if limit <= 0 {
		limit = 6
	}
	query := `
		SELECT t.id, t.title, s.name, c.name, to_char(t.due_date, 'YYYY-MM-DD')
		FROM tasks t
		JOIN task_statuses s ON s.id = t.status_id
		JOIN task_categories c ON c.id = t.category_id
		WHERE t.is_archived = FALSE AND s.is_terminal = FALSE AND t.due_date IS NOT NULL
		ORDER BY t.due_date ASC
		LIMIT $1
	`
	rows, err := r.pool.Query(ctx, query, limit)
	if err != nil {
		return nil, fmt.Errorf("query upcoming: %w", err)
	}
	defer rows.Close()

	items := make([]UpcomingTask, 0)
	for rows.Next() {
		var item UpcomingTask
		if err := rows.Scan(&item.ID, &item.Title, &item.Status, &item.Category, &item.DueDate); err != nil {
			continue
		}
		items = append(items, item)
	}
	return items, nil
}

func (r *Repository) GetWidgets(ctx context.Context) ([]Widget, error) {
	query := `
		SELECT id, code, name, COALESCE(description,''), widget_type, title, default_width, sort_order, is_active
		FROM dashboard_widgets
		ORDER BY sort_order ASC
	`
	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("query widgets: %w", err)
	}
	defer rows.Close()

	items := make([]Widget, 0)
	for rows.Next() {
		var w Widget
		if err := rows.Scan(&w.ID, &w.Code, &w.Name, &w.Description, &w.WidgetType, &w.Title, &w.DefaultWidth, &w.SortOrder, &w.Enabled); err != nil {
			continue
		}
		w.Position = w.SortOrder
		items = append(items, w)
	}
	return items, nil
}

func (r *Repository) ToggleWidget(ctx context.Context, id string) (*Widget, error) {
	query := `
		UPDATE dashboard_widgets
		SET is_active = NOT is_active, updated_at = NOW()
		WHERE id::text = $1 OR code ILIKE $1
		RETURNING id, code, name, COALESCE(description,''), widget_type, title, default_width, sort_order, is_active
	`
	var w Widget
	err := r.pool.QueryRow(ctx, query, id).Scan(
		&w.ID, &w.Code, &w.Name, &w.Description, &w.WidgetType, &w.Title, &w.DefaultWidth, &w.SortOrder, &w.Enabled,
	)
	if err != nil {
		return nil, fmt.Errorf("toggle widget: %w", err)
	}
	w.Position = w.SortOrder
	return &w, nil
}

func (r *Repository) UpdateWidget(ctx context.Context, id string, enabled *bool, position *int) (*Widget, error) {
	var w Widget
	query := `
		UPDATE dashboard_widgets
		SET is_active = COALESCE($2, is_active),
		    sort_order = COALESCE($3, sort_order),
		    updated_at = NOW()
		WHERE id::text = $1 OR code ILIKE $1
		RETURNING id, code, name, COALESCE(description,''), widget_type, title, default_width, sort_order, is_active
	`
	err := r.pool.QueryRow(ctx, query, id, enabled, position).Scan(
		&w.ID, &w.Code, &w.Name, &w.Description, &w.WidgetType, &w.Title, &w.DefaultWidth, &w.SortOrder, &w.Enabled,
	)
	if err != nil {
		return nil, fmt.Errorf("update widget: %w", err)
	}
	w.Position = w.SortOrder
	return &w, nil
}
