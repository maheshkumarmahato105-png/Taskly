package user

import "time"

type User struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	AvatarURL *string   `json:"avatarUrl,omitempty"`
	IsActive  bool      `json:"isActive"`
	Roles     []string  `json:"roles,omitempty"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type UserPreferences struct {
	UserID          string `json:"userId"`
	Theme           string `json:"theme"`
	Timezone        string `json:"timezone"`
	DefaultTaskView string `json:"defaultTaskView"`
}
