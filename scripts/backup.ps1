$dbUrl = if ($env:DATABASE_URL) { $env:DATABASE_URL } else { "postgres://taskly:taskly_password@localhost:5432/taskly_tasks?sslmode=disable" }
$backupDir = Join-Path $PSScriptRoot "..\backups"
if (-not (Test-Path $backupDir)) { New-Item -ItemType Directory -Path $backupDir | Out-Null }
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$dest = Join-Path $backupDir "taskly_tasks_$timestamp.sql"
Write-Host "Dumping PostgreSQL database to $dest..."
cmd.exe /c "pg_dump `"$dbUrl`" > `"$dest`""
Write-Host "Backup completed: $dest"
