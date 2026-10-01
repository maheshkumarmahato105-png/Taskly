package user

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

func computeInitials(name string) string {
	parts := strings.Fields(name)
	if len(parts) == 0 {
		return "U"
	}
	if len(parts) == 1 {
		if len(parts[0]) > 0 {
			return strings.ToUpper(string([]rune(parts[0])[:1]))
		}
		return "U"
	}
	r1 := []rune(parts[0])
	r2 := []rune(parts[len(parts)-1])
	return strings.ToUpper(string(r1[:1]) + string(r2[:1]))
}

func (r *Repository) List(ctx context.Context) ([]User, error) {
	query := `
		SELECT u.id, u.name, u.email, u.avatar_url, u.is_active, u.created_at, u.updated_at,
		       COALESCE(r.name, 'Full-Stack Dev') as role_name
		FROM users u
		LEFT JOIN user_roles ur ON ur.user_id = u.id
		LEFT JOIN roles r ON r.id = ur.role_id
		WHERE u.is_active = TRUE
		ORDER BY u.name ASC
	`
	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("list users: %w", err)
	}
	defer rows.Close()

	users := make([]User, 0)
	for rows.Next() {
		var u User
		var roleName string
		if err := rows.Scan(&u.ID, &u.Name, &u.Email, &u.AvatarURL, &u.IsActive, &u.CreatedAt, &u.UpdatedAt, &roleName); err != nil {
			continue
		}
		u.Role = roleName
		u.Roles = []string{roleName}
		if u.IsActive {
			u.Status = "Active"
		} else {
			u.Status = "Inactive"
		}
		u.Avatar = computeInitials(u.Name)
		users = append(users, u)
	}
	return users, nil
}

func (r *Repository) ListRoles(ctx context.Context) ([]RoleItem, error) {
	query := `SELECT id, name, COALESCE(description,'') FROM roles ORDER BY name ASC`
	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("list roles: %w", err)
	}
	defer rows.Close()

	roles := make([]RoleItem, 0)
	for rows.Next() {
		var item RoleItem
		if err := rows.Scan(&item.ID, &item.Name, &item.Description); err != nil {
			continue
		}
		roles = append(roles, item)
	}
	return roles, nil
}

func (r *Repository) GetByID(ctx context.Context, id string) (*User, error) {
	query := `
		SELECT u.id, u.name, u.email, u.avatar_url, u.is_active, u.created_at, u.updated_at,
		       COALESCE(r.name, 'Full-Stack Dev')
		FROM users u
		LEFT JOIN user_roles ur ON ur.user_id = u.id
		LEFT JOIN roles r ON r.id = ur.role_id
		WHERE u.id = $1
	`
	var u User
	var roleName string
	err := r.pool.QueryRow(ctx, query, id).Scan(&u.ID, &u.Name, &u.Email, &u.AvatarURL, &u.IsActive, &u.CreatedAt, &u.UpdatedAt, &roleName)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	u.Role = roleName
	u.Roles = []string{roleName}
	if u.IsActive {
		u.Status = "Active"
	} else {
		u.Status = "Inactive"
	}
	u.Avatar = computeInitials(u.Name)
	return &u, nil
}

func (r *Repository) GetByEmail(ctx context.Context, email string) (*User, error) {
	query := `
		SELECT u.id, u.name, u.email, u.avatar_url, u.is_active, u.created_at, u.updated_at,
		       COALESCE(r.name, 'Full-Stack Dev')
		FROM users u
		LEFT JOIN user_roles ur ON ur.user_id = u.id
		LEFT JOIN roles r ON r.id = ur.role_id
		WHERE u.email = $1
	`
	var u User
	var roleName string
	err := r.pool.QueryRow(ctx, query, email).Scan(&u.ID, &u.Name, &u.Email, &u.AvatarURL, &u.IsActive, &u.CreatedAt, &u.UpdatedAt, &roleName)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	u.Role = roleName
	u.Roles = []string{roleName}
	if u.IsActive {
		u.Status = "Active"
	} else {
		u.Status = "Inactive"
	}
	u.Avatar = computeInitials(u.Name)
	return &u, nil
}

func (r *Repository) ensureRoleID(ctx context.Context, roleName string) (string, error) {
	roleName = strings.TrimSpace(roleName)
	if roleName == "" {
		roleName = "Full-Stack Dev"
	}
	var roleID string
	err := r.pool.QueryRow(ctx, "SELECT id FROM roles WHERE name ILIKE $1 LIMIT 1", roleName).Scan(&roleID)
	if err == nil {
		return roleID, nil
	}
	if errors.Is(err, pgx.ErrNoRows) {
		err = r.pool.QueryRow(ctx, `
			INSERT INTO roles (name, description)
			VALUES ($1, $2)
			RETURNING id
		`, roleName, fmt.Sprintf("%s role", roleName)).Scan(&roleID)
		if err != nil {
			return "", fmt.Errorf("create role: %w", err)
		}
		return roleID, nil
	}
	return "", err
}

func (r *Repository) Create(ctx context.Context, name, email, roleName string) (*User, error) {
	var u User
	query := `
		INSERT INTO users (name, email, is_active)
		VALUES ($1, $2, TRUE)
		RETURNING id, name, email, avatar_url, is_active, created_at, updated_at
	`
	err := r.pool.QueryRow(ctx, query, name, email).
		Scan(&u.ID, &u.Name, &u.Email, &u.AvatarURL, &u.IsActive, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("insert user: %w", err)
	}

	if roleName == "" {
		roleName = "Full-Stack Dev"
	}
	roleID, err := r.ensureRoleID(ctx, roleName)
	if err == nil && roleID != "" {
		_, _ = r.pool.Exec(ctx, "INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", u.ID, roleID)
	}

	u.Role = roleName
	u.Roles = []string{roleName}
	u.Status = "Active"
	u.Avatar = computeInitials(u.Name)
	return &u, nil
}

func (r *Repository) UpdateRole(ctx context.Context, userID, roleName string) (*User, error) {
	u, err := r.GetByID(ctx, userID)
	if err != nil || u == nil {
		return nil, errors.New("user not found")
	}

	roleID, err := r.ensureRoleID(ctx, roleName)
	if err != nil {
		return nil, fmt.Errorf("resolve role: %w", err)
	}

	// Replace existing roles with new role
	_, _ = r.pool.Exec(ctx, "DELETE FROM user_roles WHERE user_id = $1", userID)
	_, err = r.pool.Exec(ctx, "INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)", userID, roleID)
	if err != nil {
		return nil, fmt.Errorf("update user role: %w", err)
	}

	u.Role = roleName
	u.Roles = []string{roleName}
	return u, nil
}

func (r *Repository) GetPreferences(ctx context.Context, userID string) (*UserPreferences, error) {
	query := `SELECT theme, timezone, default_task_view FROM user_preferences WHERE user_id = $1`
	var p UserPreferences
	p.UserID = userID
	err := r.pool.QueryRow(ctx, query, userID).Scan(&p.Theme, &p.Timezone, &p.DefaultTaskView)
	if errors.Is(err, pgx.ErrNoRows) {
		return &UserPreferences{
			UserID:          userID,
			Theme:           "light",
			Timezone:        "Asia/Kathmandu",
			DefaultTaskView: "list",
		}, nil
	}
	return &p, err
}

func (r *Repository) UpdatePreferences(ctx context.Context, p *UserPreferences) error {
	query := `
		INSERT INTO user_preferences (user_id, theme, timezone, default_task_view, updated_at)
		VALUES ($1, $2, $3, $4, NOW())
		ON CONFLICT (user_id) DO UPDATE
		SET theme = EXCLUDED.theme, timezone = EXCLUDED.timezone, default_task_view = EXCLUDED.default_task_view, updated_at = NOW()
	`
	_, err := r.pool.Exec(ctx, query, p.UserID, p.Theme, p.Timezone, p.DefaultTaskView)
	return err
}
