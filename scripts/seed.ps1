$dbUrl = if ($env:DATABASE_URL) { $env:DATABASE_URL } else { "postgres://taskly:taskly_password@localhost:5432/taskly_tasks?sslmode=disable" }
$seedPath = Join-Path $PSScriptRoot "..\database\seeds\001_seed.sql"
Write-Host "Seeding database with demo and reference data..."
psql "$dbUrl" -f "$seedPath"
