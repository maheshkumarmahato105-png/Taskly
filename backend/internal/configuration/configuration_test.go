package configuration_test

import (
	"context"
	"testing"

	"github.com/taskly/task-manager/backend/internal/configuration"
)

func TestCategoryValidation(t *testing.T) {
	svc := configuration.NewService(nil)
	ctx := context.Background()

	// Empty category name
	_, err := svc.CreateCategory(ctx, configuration.Category{Name: ""})
	if err == nil {
		t.Fatal("expected error for empty category name, got nil")
	}

	_, err = svc.UpdateCategory(ctx, "cat-1", configuration.Category{Name: ""})
	if err == nil {
		t.Fatal("expected error for empty category update name, got nil")
	}
}

func TestStatusValidation(t *testing.T) {
	svc := configuration.NewService(nil)
	ctx := context.Background()

	// Empty status name
	_, err := svc.CreateStatus(ctx, configuration.Status{Name: ""})
	if err == nil {
		t.Fatal("expected error for empty status name, got nil")
	}
}

func TestCustomFieldValidation(t *testing.T) {
	svc := configuration.NewService(nil)
	ctx := context.Background()

	// Empty field name
	_, err := svc.CreateCustomField(ctx, configuration.CustomField{Name: ""})
	if err == nil {
		t.Fatal("expected error for empty custom field name, got nil")
	}
}
