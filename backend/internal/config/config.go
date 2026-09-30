package config

import (
	"os"
	"strconv"
	"strings"
)

type Config struct {
	Port        int
	DatabaseURL string
	CORSOrigins []string
	AppEnv      string
}

func Load() Config {
	port := 8080
	if raw := os.Getenv("PORT"); raw != "" {
		if parsed, err := strconv.Atoi(raw); err == nil {
			port = parsed
		}
	}

	origins := []string{"http://localhost:3000"}
	if raw := os.Getenv("CORS_ORIGINS"); raw != "" {
		origins = nil
		for _, item := range strings.Split(raw, ",") {
			item = strings.TrimSpace(item)
			if item != "" {
				origins = append(origins, item)
			}
		}
	}

	return Config{
		Port:        port,
		DatabaseURL: os.Getenv("DATABASE_URL"),
		CORSOrigins: origins,
		AppEnv:      getenv("APP_ENV", "development"),
	}
}

func getenv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
