package notification

import "context"

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) List(ctx context.Context, userID string) ([]Notification, error) {
	return s.repo.List(ctx, userID)
}

func (s *Service) MarkRead(ctx context.Context, id string) error {
	return s.repo.MarkRead(ctx, id)
}

func (s *Service) MarkAllRead(ctx context.Context) error {
	return s.repo.MarkAllRead(ctx)
}

func (s *Service) Create(ctx context.Context, n *Notification) error {
	return s.repo.Create(ctx, n)
}
