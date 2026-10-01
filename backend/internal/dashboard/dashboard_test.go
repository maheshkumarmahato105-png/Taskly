package dashboard_test

import (
	"context"
	"testing"

	"github.com/taskly/task-manager/backend/internal/dashboard"
)

func TestWidgetValidation(t *testing.T) {
	svc := dashboard.NewService(nil)
	ctx := context.Background()

	// Empty widget id
	_, err := svc.ToggleWidget(ctx, "")
	if err == nil {
		t.Fatal("expected error for empty widget id on toggle, got nil")
	}

	_, err = svc.UpdateWidget(ctx, "", dashboard.UpdateWidgetRequest{})
	if err == nil {
		t.Fatal("expected error for empty widget id on update, got nil")
	}
}
