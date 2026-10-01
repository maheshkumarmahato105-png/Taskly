package dashboard

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

func (s *Service) GetSummary(ctx context.Context) (*Summary, error) {
	return s.repo.GetSummary(ctx)
}

func (s *Service) GetUpcoming(ctx context.Context, limit int) ([]UpcomingTask, error) {
	return s.repo.GetUpcoming(ctx, limit)
}

func (s *Service) GetWidgets(ctx context.Context) ([]Widget, error) {
	return s.repo.GetWidgets(ctx)
}

func (s *Service) ToggleWidget(ctx context.Context, id string) (*Widget, error) {
	if strings.TrimSpace(id) == "" {
		return nil, errors.New("widget id is required")
	}
	return s.repo.ToggleWidget(ctx, strings.TrimSpace(id))
}

func (s *Service) UpdateWidget(ctx context.Context, id string, req UpdateWidgetRequest) (*Widget, error) {
	if strings.TrimSpace(id) == "" {
		return nil, errors.New("widget id is required")
	}
	return s.repo.UpdateWidget(ctx, strings.TrimSpace(id), req.Enabled, req.Position)
}
