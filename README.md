# Taskly — Enterprise Task Management Platform

Taskly is a production-grade, full-stack enterprise task management platform built entirely in **TypeScript (Next.js 16.3 + React 19)** and **Go 1.22+**. It features real-time state synchronization, drag-and-drop Kanban workflows, five KPI summary metrics, detailed audit logs, and customizable workspace administration.

---

## 🏗 Architecture & Stack Overview

- **Frontend**: Next.js 16.3 + React 19 + TypeScript + Custom Vanilla CSS Design System + Lucide Icons
- **State & Storage**: Pure TypeScript client-side state engine (`lib/store.ts`) with typed local storage persistence and REST API sync
- **Backend**: Go 1.22+ REST Microservice (`net/http` + `pgx/v5` PostgreSQL connection pool)
- **Database**: PostgreSQL with normalized relational schemas for tasks, categories, statuses, priorities, checklists, comments, and audit logs
- **Reverse Proxy & Deployment**: Nginx reverse proxy + Docker Compose multi-container configuration

---

## 📁 Repository Directory Structure

```text
taskly/
├── docker-compose.yml                        # Multi-container orchestration (PostgreSQL + Go API + Next.js)
├── .env.example                              # Environment variable configuration template
├── .gitignore                                # Git ignore rules
├── README.md                                 # Documentation & setup guide
│
├── frontend/                                 # Next.js 16.3 + React 19 TypeScript Application
│   ├── app/
│   │   ├── layout.tsx                        # Root HTML layout and metadata
│   │   ├── globals.css                       # Taskly Design System tokens and styles (#FFAA00 palette)
│   │   ├── page.tsx                          # Dashboard root view (pure TypeScript / TSX)
│   │   ├── dashboard/page.tsx                # /dashboard route alias
│   │   ├── tasks/page.tsx                    # /tasks workspace (Table + Kanban views)
│   │   ├── categories/page.tsx               # /categories management
│   │   ├── admin/page.tsx                    # /admin configuration console
│   │   └── settings/page.tsx                 # /settings user preferences
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx                   # Navigation sidebar with focus progress
│   │   │   └── Topbar.tsx                    # Glassmorphic topbar with breadcrumb and notifications
│   │   ├── dashboard/
│   │   │   ├── SummaryGrid.tsx               # 5 KPI summary metric cards
│   │   │   ├── Insights.tsx                  # Completion progress and focus recommendations
│   │   │   └── UpcomingList.tsx              # Upcoming deadline tiles
│   │   ├── tasks/
│   │   │   ├── TaskTable.tsx                 # Interactive task data table with inline badges
│   │   │   ├── TaskKanban.tsx                # Drag-and-drop Kanban workflow board
│   │   │   ├── TaskDrawer.tsx                # Slide-over drawer with checklist, comments, and audit
│   │   │   ├── TaskModal.tsx                 # Task creation/editing modal dialog
│   │   │   ├── BulkActions.tsx               # Multi-select batch action toolbar
│   │   │   └── FilterBar.tsx                 # Filter tabs, quick search, and saved views
│   │   ├── admin/
│   │   │   ├── CategoryManager.tsx           # Category CRUD & color customizer
│   │   │   ├── StatusManager.tsx             # Workflow status states & codes
│   │   │   └── SystemSettings.tsx            # System branding & theme color settings
│   │   └── ui/
│   │       ├── button.tsx                    # Styled button component
│   │       ├── badge.tsx                     # Status and priority badge pills
│   │       ├── input.tsx                     # Form input field with label and error
│   │       └── modal.tsx                     # Reusable accessible dialog modal
│   ├── lib/
│   │   ├── api.ts                            # Typed REST API client with offline fallback
│   │   └── store.ts                          # Pure TypeScript state manager & persistence
│   └── types/
│       └── task.ts                           # Complete TypeScript interfaces
│
├── backend/                                  # Go REST API Microservice
│   ├── cmd/
│   │   └── api/main.go                       # HTTP server entrypoint with graceful shutdown
│   ├── internal/
│   │   ├── config/config.go                  # Environment configuration loader
│   │   ├── db/db.go                          # PostgreSQL connection pool manager
│   │   ├── httpapi/
│   │   │   ├── router.go                     # HTTP request routing & CORS middleware
│   │   │   └── handlers.go                   # REST API endpoint handlers
│   │   ├── task/model.go                     # Task entity domain models
│   │   ├── auth/auth.go                      # Roles, sessions, and claims definitions
│   │   ├── user/user.go                      # User accounts and preferences models
│   │   ├── dashboard/dashboard.go            # Dashboard KPI metrics and widget models
│   │   ├── notification/notification.go      # In-app notifications
│   │   ├── configuration/configuration.go    # Categories, statuses, and custom field models
│   │   └── middleware/middleware.go          # Request logging and security headers
│   ├── openapi.yaml                          # OpenAPI 3.0 API specification
│   └── Dockerfile                            # Multi-stage Go production container
│
├── database/                                 # Database Schema & Data Assets
│   ├── migrations/
│   │   └── 001_init.sql                      # Normalized PostgreSQL relational schema
│   └── seeds/
│       └── 001_seed.sql                      # Default seed data and demo records
│
├── deploy/                                   # Deployment & Infrastructure
│   └── nginx/
│       └── taskly.conf                       # Reverse proxy configuration
│
└── scripts/                                  # Automation & Maintenance Scripts
    ├── migrate.sh / migrate.ps1              # Run schema migrations
    ├── seed.sh / seed.ps1                    # Seed demo and reference data
    └── backup.sh / backup.ps1                # Dump database backup file
```

---

## 🚀 Quick Start Guide

### Option 1: One-Command Full Stack (Recommended)
Starts both the **Go REST API (with automatic PostgreSQL database)** and the **Next.js Frontend**:
```bash
npm run dev:all
```
Or use the native Windows scripts:
- **PowerShell**: `.\scripts\start-all.ps1`
- **Batch**: `.\scripts\start-all.bat`

Once running:
- **Frontend App**: [http://localhost:3000](http://localhost:3000)
- **Go REST API**: [http://localhost:8080](http://localhost:8080)
- **API Health**: [http://localhost:8080/health](http://localhost:8080/health)
- **Database**: PostgreSQL (Auto-migrated & persisted in `database/pg_data`)

---

### Option 2: Go Backend Only
Starts the Go 1.22+ REST microservice with automatic embedded PostgreSQL and seed data:
```bash
npm run backend
```
*(Or directly `cd backend && go run ./cmd/api`)*

---

### Option 3: Frontend Development Only
Starts the Next.js frontend on port 3000 with automatic fallback to persistent database storage in `database/data/taskly_store.json`:
```bash
npm run dev
```

---

### Option 4: Docker Compose (Containers)
If Docker Desktop is installed:
```bash
cp .env.example .env
docker compose up --build
```

---

## 🛡 License
MIT License. Created for enterprise task management.
