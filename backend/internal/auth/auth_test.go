package auth_test

import (
	"context"
	"testing"

	"github.com/taskly/task-manager/backend/internal/auth"
	"github.com/taskly/task-manager/backend/internal/user"
)

func TestParseRole(t *testing.T) {
	tests := []struct {
		input    string
		expected auth.Role
	}{
		{"ADMIN", auth.RoleAdmin},
		{"Lead Admin", auth.RoleAdmin},
		{"MANAGER", auth.RoleManager},
		{"Project Manager", auth.RoleManager},
		{"VIEWER", auth.RoleViewer},
		{"Viewer", auth.RoleViewer},
		{"Full-Stack Dev", auth.RoleUser},
		{"QA Engineer", auth.RoleUser},
		{"USER", auth.RoleUser},
	}

	for _, tc := range tests {
		got := auth.ParseRole(tc.input)
		if got != tc.expected {
			t.Errorf("ParseRole(%q) = %v; want %v", tc.input, got, tc.expected)
		}
	}
}

func TestAuthPermissions(t *testing.T) {
	svc := auth.NewService(user.NewService(nil))

	// Admin permissions
	if !svc.Can(auth.RoleAdmin, "admin:access") {
		t.Error("Admin should have admin:access")
	}
	if !svc.Can(auth.RoleAdmin, "admin:reset_db") {
		t.Error("Admin should have admin:reset_db")
	}

	// Viewer permissions
	if svc.Can(auth.RoleViewer, "admin:access") {
		t.Error("Viewer should NOT have admin:access")
	}
	if svc.Can(auth.RoleViewer, "tasks:create") {
		t.Error("Viewer should NOT have tasks:create")
	}
	if !svc.Can(auth.RoleViewer, "tasks:read") {
		t.Error("Viewer should have tasks:read")
	}

	// Manager permissions
	if !svc.Can(auth.RoleManager, "tasks:create") {
		t.Error("Manager should have tasks:create")
	}
	if !svc.Can(auth.RoleManager, "tasks:delete") {
		t.Error("Manager should have tasks:delete")
	}
	if svc.Can(auth.RoleManager, "admin:reset_db") {
		t.Error("Manager should NOT have admin:reset_db")
	}
}

func TestLoginAndSessionValidation(t *testing.T) {
	svc := auth.NewService(user.NewService(nil))
	ctx := context.Background()

	sess, err := svc.Login(ctx, "bishal@taskly.com", "")
	if err != nil {
		t.Fatalf("Login failed: %v", err)
	}
	if sess.Token == "" {
		t.Fatal("Expected non-empty session token")
	}
	if sess.Role != auth.RoleAdmin {
		t.Errorf("Expected RoleAdmin, got %v", sess.Role)
	}

	validated, err := svc.ValidateSession(sess.Token)
	if err != nil {
		t.Fatalf("ValidateSession failed: %v", err)
	}
	if validated.UserID != sess.UserID {
		t.Errorf("UserID mismatch: %v vs %v", validated.UserID, sess.UserID)
	}

	// Test Logout
	svc.Logout(sess.Token)
	_, err = svc.ValidateSession(sess.Token)
	if err == nil {
		t.Error("Expected error after logout")
	}
}
