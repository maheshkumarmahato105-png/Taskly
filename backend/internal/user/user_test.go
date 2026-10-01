package user_test

import (
	"context"
	"testing"

	"github.com/taskly/task-manager/backend/internal/user"
)

func TestCreateUserValidation(t *testing.T) {
	svc := user.NewService(nil)
	ctx := context.Background()

	// Missing name
	_, err := svc.Create(ctx, user.CreateUserRequest{
		Name:  "",
		Email: "test@example.com",
	})
	if err == nil {
		t.Fatal("expected error for missing name, got nil")
	}

	// Missing email
	_, err = svc.Create(ctx, user.CreateUserRequest{
		Name:  "Test User",
		Email: "",
	})
	if err == nil {
		t.Fatal("expected error for missing email, got nil")
	}
}

func TestUpdateRoleValidation(t *testing.T) {
	svc := user.NewService(nil)
	ctx := context.Background()

	// Missing user ID
	_, err := svc.UpdateRole(ctx, "", "Lead Admin")
	if err == nil {
		t.Fatal("expected error for missing user ID, got nil")
	}

	// Missing role
	_, err = svc.UpdateRole(ctx, "usr-123", "")
	if err == nil {
		t.Fatal("expected error for missing role, got nil")
	}
}
