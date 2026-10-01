package main

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/taskly/task-manager/backend/internal/auth"
	"github.com/taskly/task-manager/backend/internal/config"
	"github.com/taskly/task-manager/backend/internal/configuration"
	"github.com/taskly/task-manager/backend/internal/dashboard"
	"github.com/taskly/task-manager/backend/internal/db"
	"github.com/taskly/task-manager/backend/internal/httpapi"
	"github.com/taskly/task-manager/backend/internal/notification"
	"github.com/taskly/task-manager/backend/internal/task"
	"github.com/taskly/task-manager/backend/internal/user"
)

func main() {
	cfg := config.Load()
	if cfg.DatabaseURL == "" {
		log.Fatal("DATABASE_URL is required")
	}

	ctx := context.Background()
	pool, err := db.Open(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("database connection failed: %v", err)
	}
	defer pool.Close()

	// Repositories
	taskRepo := task.NewRepository(pool)
	dashRepo := dashboard.NewRepository(pool)
	confRepo := configuration.NewRepository(pool)
	userRepo := user.NewRepository(pool)
	notifRepo := notification.NewRepository(pool)

	// Domain Services
	taskSvc := task.NewService(taskRepo)
	dashSvc := dashboard.NewService(dashRepo)
	confSvc := configuration.NewService(confRepo)
	userSvc := user.NewService(userRepo)
	authSvc := auth.NewService(userSvc)
	notifSvc := notification.NewService(notifRepo)

	handlers := httpapi.NewHandlers(pool, taskSvc, dashSvc, confSvc, userSvc, authSvc, notifSvc)
	router := httpapi.New(handlers, cfg.CORSOrigins)

	server := &http.Server{
		Addr:              fmt.Sprintf(":%d", cfg.Port),
		Handler:           router,
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       15 * time.Second,
		WriteTimeout:      15 * time.Second,
		IdleTimeout:       60 * time.Second,
	}

	go func() {
		log.Printf("EasyMyLearning Task API listening on %s", server.Addr)
		if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("server failed: %v", err)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)
	<-stop

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := server.Shutdown(shutdownCtx); err != nil {
		log.Printf("shutdown error: %v", err)
	}
}
