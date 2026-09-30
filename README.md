# Taskly — Enterprise Task Management Platform

Taskly is a production-grade, full-stack enterprise task management platform featuring real-time state synchronization, drag-and-drop Kanban workflows, five KPI summary metrics, detailed audit logs, and customizable workspace administration.

---

## 🏗 Architecture & Stack Overview

- **Frontend**: Next.js 16.3 + React 19 + TypeScript + Custom Vanilla CSS Design System + Lucide Icons
- **Backend**: Go 1.22+ REST Microservice (`net/http` + `pgx/v5` PostgreSQL connection pool)
- **Database**: PostgreSQL with normalized relational schemas for tasks, categories, statuses, priorities, checklists, comments, and audit logs
- **Reverse Proxy & Deployment**: Nginx reverse proxy + Docker Compose multi-container configuration
- **Standalone Mode**: Zero-dependency `index.html` with real-time UI, drag-and-drop Kanban, slide-over task drawer, and local storage persistence

---

## 📁 Repository Directory Structure

```text
taskly/
├── index.html                                # Standalone production web app (runs in any browser)
├── serve.ps1                                 # Background web server on http://localhost:3000/
├── docker-compose.yml                        # Multi-container orchestration (PostgreSQL + Go API + Next.js)
├── .env.example                              # Environment variable configuration template
├── .gitignore                                # Git ignore rules
├── README.md                                 # Documentation & setup guide
│
├── frontend/                                 # Next.js 16.3 + React 19 Application
│   ├── app/
│   │   ├── layout.tsx                        # Root HTML layout and metadata
│   │   ├── globals.css                       # Taskly Design System tokens and styles (#FFAA00 palette)
│   │   ├── page.tsx                          # Dashboard root view
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
│   │   └── api.ts                            # Typed REST API client with offline fallback
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

### Option 1: Instant Local Browser Access (No Prerequisites)
Run `serve.ps1` or open [index.html](file:///c:/Users/Mahesh%20Kumar%20Mahato/Downloads/easymylearning-task-manager-full-stack/taskly/index.html) directly:
- **Local Server**: `http://localhost:3000/`
- **Standalone**: Double click `index.html` to run offline with zero dependencies!

### Option 2: Docker Compose (Production Environment)
```bash
cp .env.example .env
docker compose up --build
```
- **Frontend**: `http://localhost:3000`
- **Go API**: `http://localhost:8080`
- **API Health**: `http://localhost:8080/health`

---

## 🛡 License
MIT License. Created for enterprise task management.
