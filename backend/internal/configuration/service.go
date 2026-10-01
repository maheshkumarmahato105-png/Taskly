package configuration

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

// Categories
func (s *Service) ListCategories(ctx context.Context) ([]Category, error) {
	return s.repo.ListCategories(ctx)
}

func (s *Service) CreateCategory(ctx context.Context, c Category) (*Category, error) {
	if strings.TrimSpace(c.Name) == "" {
		return nil, errors.New("category name is required")
	}
	if c.Color == "" {
		c.Color = "#FFAA00"
	}
	id, err := s.repo.CreateCategory(ctx, &c)
	if err != nil {
		return nil, err
	}
	c.ID = id
	return &c, nil
}

func (s *Service) UpdateCategory(ctx context.Context, id string, c Category) (*Category, error) {
	if strings.TrimSpace(c.Name) == "" {
		return nil, errors.New("category name is required")
	}
	c.ID = id
	if err := s.repo.UpdateCategory(ctx, id, &c); err != nil {
		return nil, err
	}
	return &c, nil
}

func (s *Service) DeleteCategory(ctx context.Context, id string) error {
	return s.repo.DeleteCategory(ctx, id)
}

func (s *Service) ReorderCategories(ctx context.Context, req ReorderCategoriesRequest) error {
	items := req.Items
	if len(items) == 0 && len(req.CategoryIDs) > 0 {
		items = make([]CategoryOrderItem, len(req.CategoryIDs))
		for i, id := range req.CategoryIDs {
			items[i] = CategoryOrderItem{
				ID:        id,
				SortOrder: i + 1,
			}
		}
	}
	return s.repo.ReorderCategories(ctx, items)
}

// Statuses
func (s *Service) ListStatuses(ctx context.Context) ([]Status, error) {
	return s.repo.ListStatuses(ctx)
}

func (s *Service) CreateStatus(ctx context.Context, st Status) (*Status, error) {
	if strings.TrimSpace(st.Name) == "" {
		return nil, errors.New("status name is required")
	}
	if st.Code == "" {
		st.Code = strings.ToUpper(strings.ReplaceAll(st.Name, " ", "_"))
	}
	if st.Color == "" {
		st.Color = "#64748B"
	}
	id, err := s.repo.CreateStatus(ctx, &st)
	if err != nil {
		return nil, err
	}
	st.ID = id
	return &st, nil
}

func (s *Service) UpdateStatus(ctx context.Context, id string, st Status) (*Status, error) {
	if strings.TrimSpace(st.Name) == "" {
		return nil, errors.New("status name is required")
	}
	st.ID = id
	if err := s.repo.UpdateStatus(ctx, id, &st); err != nil {
		return nil, err
	}
	return &st, nil
}

func (s *Service) DeleteStatus(ctx context.Context, id string) error {
	return s.repo.DeleteStatus(ctx, id)
}

// Priorities
func (s *Service) ListPriorities(ctx context.Context) ([]Priority, error) {
	return s.repo.ListPriorities(ctx)
}

// Custom Fields
func (s *Service) ListCustomFields(ctx context.Context) ([]CustomField, error) {
	return s.repo.ListCustomFields(ctx)
}

func (s *Service) CreateCustomField(ctx context.Context, cf CustomField) (*CustomField, error) {
	if strings.TrimSpace(cf.Name) == "" {
		return nil, errors.New("field name is required")
	}
	if cf.FieldKey == "" {
		cf.FieldKey = strings.ToLower(strings.ReplaceAll(cf.Name, " ", "_"))
	}
	if cf.FieldType == "" {
		cf.FieldType = "text"
	}
	id, err := s.repo.CreateCustomField(ctx, &cf)
	if err != nil {
		return nil, err
	}
	cf.ID = id
	return &cf, nil
}

func (s *Service) DeleteCustomField(ctx context.Context, id string) error {
	return s.repo.DeleteCustomField(ctx, id)
}

// System Settings
func (s *Service) GetPublicSettings(ctx context.Context) (map[string]any, error) {
	return s.repo.GetPublicSettings(ctx)
}

func (s *Service) GetAllSettings(ctx context.Context) (map[string]any, error) {
	return s.repo.GetAllSettings(ctx)
}

func (s *Service) UpdateSettings(ctx context.Context, settings map[string]string) error {
	for k, v := range settings {
		if err := s.repo.UpdateSetting(ctx, k, v); err != nil {
			return err
		}
	}
	return nil
}

// Audit Logs
func (s *Service) ListAuditLogs(ctx context.Context, limit int) ([]map[string]any, error) {
	return s.repo.ListAuditLogs(ctx, limit)
}

// Reset Seed Data (PDF Page 11)
func (s *Service) ResetSeed(ctx context.Context) error {
	return s.repo.ResetSeed(ctx)
}
