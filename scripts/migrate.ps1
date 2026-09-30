$dbUrl = if ($env:DATABASE_URL) { $env:DATABASE_URL } else { "postgres://taskly:taskly_password@localhost:5432/taskly_tasks?sslmode=disable" }
$migrationPath = Join-Path $PSScriptRoot "..\database\migrations\001_init.sql"
Write-Host "Running database migrations against $dbUrl..."
psql "$dbUrl" -f "$migrationPath"
