package auth

import "time"

type Role string

const (
	RoleAdmin   Role = "ADMIN"
	RoleManager Role = "MANAGER"
	RoleUser    Role = "USER"
	RoleViewer  Role = "VIEWER"
)

type Session struct {
	UserID    string    `json:"userId"`
	Email     string    `json:"email"`
	Role      Role      `json:"role"`
	ExpiresAt time.Time `json:"expiresAt"`
}

type Claims struct {
	UserID string `json:"sub"`
	Email  string `json:"email"`
	Role   Role   `json:"role"`
}
