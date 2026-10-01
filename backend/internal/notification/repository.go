package notification

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

func (r *Repository) List(ctx context.Context, userID string) ([]Notification, error) {
	query := `
		SELECT id, user_id, title, message, type, is_read, created_at
		FROM notifications
		ORDER BY created_at DESC
		LIMIT 20
	`
	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("list notifications: %w", err)
	}
	defer rows.Close()

	items := make([]Notification, 0)
	for rows.Next() {
		var n Notification
		if err := rows.Scan(&n.ID, &n.UserID, &n.Title, &n.Message, &n.Type, &n.IsRead, &n.CreatedAt); err != nil {
			continue
		}
		items = append(items, n)
	}
	return items, nil
}

func (r *Repository) MarkRead(ctx context.Context, id string) error {
	_, err := r.pool.Exec(ctx, "UPDATE notifications SET is_read = TRUE WHERE id = $1", id)
	return err
}

func (r *Repository) MarkAllRead(ctx context.Context) error {
	_, err := r.pool.Exec(ctx, "UPDATE notifications SET is_read = TRUE")
	return err
}

func (r *Repository) Create(ctx context.Context, n *Notification) error {
	query := `
		INSERT INTO notifications (user_id, title, message, type)
		VALUES ($1, $2, $3, $4)
		RETURNING id, created_at
	`
	return r.pool.QueryRow(ctx, query, n.UserID, n.Title, n.Message, n.Type).Scan(&n.ID, &n.CreatedAt)
}
