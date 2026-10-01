package user

import "time"

type User struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	AvatarURL *string   `json:"avatarUrl,omitempty"`
	Avatar    string    `json:"avatar,omitempty"`
	Role      string    `json:"role,omitempty"`
	Roles     []string  `json:"roles,omitempty"`
	Status    string    `json:"status,omitempty"`
	IsActive  bool      `json:"isActive"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type RoleItem struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
}

type CreateUserRequest struct {
	Name  string `json:"name"`
	Email string `json:"email"`
	Role  string `json:"role,omitempty"`
}

type UserPreferences struct {
	UserID          string `json:"userId"`
	Theme           string `json:"theme"`
	Timezone        string `json:"timezone"`
	DefaultTaskView string `json:"defaultTaskView"`
}
