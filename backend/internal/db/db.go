package db

import (
	"context"
	_ "embed"
	"fmt"
	"log"
	"net"
	"os"
	"path/filepath"
	"time"

	embeddedpostgres "github.com/fergusstrange/embedded-postgres"
	"github.com/jackc/pgx/v5/pgxpool"
)

//go:embed sql/init.sql
var initSQL string

//go:embed sql/seed.sql
var seedSQL string

type Handle struct {
	Pool       *pgxpool.Pool
	IsEmbedded bool
	cleanup    func()
}

func (h *Handle) Close() {
	if h.Pool != nil {
		h.Pool.Close()
	}
	if h.cleanup != nil {
		h.cleanup()
	}
}

// Open connects to PostgreSQL or automatically spins up an embedded instance.
func Open(ctx context.Context, databaseURL string) (*Handle, error) {
	// 1. If databaseURL is specified, try connecting to it.
	if databaseURL != "" {
		pool, err := tryConnect(ctx, databaseURL)
		if err == nil {
			log.Printf("[Database] Connected to external PostgreSQL at %s", sanitizeURL(databaseURL))
			if err := EnsureMigrated(ctx, pool); err != nil {
				log.Printf("[Database] Migration check warning: %v", err)
			}
			return &Handle{Pool: pool, IsEmbedded: false}, nil
		}
		log.Printf("[Database] External PostgreSQL connection failed: %v. Falling back to embedded PostgreSQL...", err)
	} else {
		log.Printf("[Database] DATABASE_URL not specified. Initializing embedded PostgreSQL...")
	}

	// 2. Fall back to embedded PostgreSQL.
	port := findAvailablePort(5433, 5439)
	dataDir := getEmbeddedDataDir()

	log.Printf("[Database] Starting embedded PostgreSQL on port %d (data: %s)...", port, dataDir)
	cfg := embeddedpostgres.DefaultConfig().
		Port(uint32(port)).
		Database("taskly_tasks").
		Username("taskly").
		Password("taskly_password").
		DataPath(dataDir)

	pg := embeddedpostgres.NewDatabase(cfg)
	if err := pg.Start(); err != nil {
		return nil, fmt.Errorf("starting embedded postgres: %w", err)
	}

	connURL := fmt.Sprintf("postgres://taskly:taskly_password@127.0.0.1:%d/taskly_tasks?sslmode=disable", port)
	pool, err := tryConnect(ctx, connURL)
	if err != nil {
		_ = pg.Stop()
		return nil, fmt.Errorf("connecting to embedded postgres: %w", err)
	}

	log.Printf("[Database] Embedded PostgreSQL connected successfully on port %d.", port)

	if err := EnsureMigrated(ctx, pool); err != nil {
		log.Printf("[Database] Migration error: %v", err)
		pool.Close()
		_ = pg.Stop()
		return nil, err
	}

	cleanup := func() {
		log.Println("[Database] Stopping embedded PostgreSQL database...")
		if err := pg.Stop(); err != nil {
			log.Printf("[Database] Warning stopping embedded postgres: %v", err)
		}
	}

	return &Handle{
		Pool:       pool,
		IsEmbedded: true,
		cleanup:    cleanup,
	}, nil
}

func tryConnect(ctx context.Context, databaseURL string) (*pgxpool.Pool, error) {
	cfg, err := pgxpool.ParseConfig(databaseURL)
	if err != nil {
		return nil, err
	}
	cfg.MaxConns = 10
	cfg.MinConns = 2
	cfg.MaxConnLifetime = 30 * time.Minute
	cfg.HealthCheckPeriod = 30 * time.Second

	pool, err := pgxpool.NewWithConfig(ctx, cfg)
	if err != nil {
		return nil, err
	}

	ctxPing, cancel := context.WithTimeout(ctx, 4*time.Second)
	defer cancel()
	if err := pool.Ping(ctxPing); err != nil {
		pool.Close()
		return nil, err
	}

	return pool, nil
}

func EnsureMigrated(ctx context.Context, pool *pgxpool.Pool) error {
	var exists bool
	err := pool.QueryRow(ctx, "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tasks')").Scan(&exists)
	if err != nil {
		return fmt.Errorf("checking schema existence: %w", err)
	}

	if exists {
		log.Println("[Database] Schema already verified.")
		return nil
	}

	log.Println("[Database] Initializing schema (001_init.sql)...")
	if _, err := pool.Exec(ctx, initSQL); err != nil {
		return fmt.Errorf("executing init schema: %w", err)
	}

	log.Println("[Database] Applying seed data (001_seed.sql)...")
	if _, err := pool.Exec(ctx, seedSQL); err != nil {
		return fmt.Errorf("executing seed data: %w", err)
	}

	log.Println("[Database] Schema migration and seed completed successfully!")
	return nil
}

func getEmbeddedDataDir() string {
	// Prefer workspace database/pg_data if writable
	cwd, err := os.Getwd()
	if err == nil {
		target := filepath.Join(cwd, "..", "database", "pg_data")
		if abs, err := filepath.Abs(target); err == nil {
			_ = os.MkdirAll(abs, 0755)
			return abs
		}
	}

	userHome, err := os.UserHomeDir()
	if err == nil {
		target := filepath.Join(userHome, ".taskly", "pg_data")
		_ = os.MkdirAll(target, 0755)
		return target
	}

	return filepath.Join(os.TempDir(), "taskly_pg_data")
}

func findAvailablePort(start, end int) int {
	for p := start; p <= end; p++ {
		ln, err := net.Listen("tcp", fmt.Sprintf("127.0.0.1:%d", p))
		if err == nil {
			_ = ln.Close()
			return p
		}
	}
	return start
}

func sanitizeURL(raw string) string {
	if len(raw) > 30 {
		return raw[:20] + "..."
	}
	return raw
}
