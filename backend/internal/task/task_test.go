package task_test

import (
	"context"
	"testing"

	"github.com/taskly/task-manager/backend/internal/task"
)

func TestCreateTaskValidation(t *testing.T) {
	svc := task.NewService(nil)
	ctx := context.Background()

	// Missing title should fail
	_, err := svc.Create(ctx, task.CreateTaskRequest{
		Title: "",
	})
	if err == nil {
		t.Fatal("expected error for empty title, got nil")
	}
}

func TestBulkActionValidation(t *testing.T) {
	svc := task.NewService(nil)
	ctx := context.Background()

	// Empty task IDs should fail
	err := svc.BulkAction(ctx, task.BulkActionRequest{
		TaskIDs: []string{},
		Action:  "update_status",
	})
	if err == nil {
		t.Fatal("expected error for empty task IDs, got nil")
	}

	// Unsupported action should fail
	err = svc.BulkAction(ctx, task.BulkActionRequest{
		TaskIDs: []string{"task-1"},
		Action:  "unsupported_action",
	})
	if err == nil {
		t.Fatal("expected error for unsupported action, got nil")
	}
}
