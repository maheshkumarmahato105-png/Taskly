package user

import (
	"context"
	"errors"
	"strings"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) List(ctx context.Context) ([]User, error) {
	return s.repo.List(ctx)
}

func (s *Service) ListRoles(ctx context.Context) ([]RoleItem, error) {
	return s.repo.ListRoles(ctx)
}

func (s *Service) GetByID(ctx context.Context, id string) (*User, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *Service) GetByEmail(ctx context.Context, email string) (*User, error) {
	return s.repo.GetByEmail(ctx, email)
}

func (s *Service) Create(ctx context.Context, req CreateUserRequest) (*User, error) {
	name := strings.TrimSpace(req.Name)
	if name == "" {
		return nil, errors.New("name is required")
	}
	email := strings.TrimSpace(req.Email)
	if email == "" {
		return nil, errors.New("email is required")
	}
	role := strings.TrimSpace(req.Role)
	if role == "" {
		role = "Full-Stack Dev"
	}
	return s.repo.Create(ctx, name, email, role)
}

func (s *Service) UpdateRole(ctx context.Context, userID, role string) (*User, error) {
	userID = strings.TrimSpace(userID)
	if userID == "" {
		return nil, errors.New("user id is required")
	}
	role = strings.TrimSpace(role)
	if role == "" {
		return nil, errors.New("role is required")
	}
	return s.repo.UpdateRole(ctx, userID, role)
}

func (s *Service) GetPreferences(ctx context.Context, userID string) (*UserPreferences, error) {
	return s.repo.GetPreferences(ctx, userID)
}

func (s *Service) UpdatePreferences(ctx context.Context, p *UserPreferences) error {
	return s.repo.UpdatePreferences(ctx, p)
}
