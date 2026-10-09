# EasyMyLearning Task Manager - Full Stack Startup (PowerShell)
Write-Host "=========================================================" -ForegroundColor Yellow
Write-Host "  EasyMyLearning Task Manager - Full Stack Startup       " -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Yellow
Write-Host "Frontend:  http://localhost:3000" -ForegroundColor Green
Write-Host "Backend:   http://localhost:8080" -ForegroundColor Green
Write-Host "API Health: http://localhost:8080/health" -ForegroundColor Green
Write-Host "Database:  PostgreSQL" -ForegroundColor Green
Write-Host "=========================================================" -ForegroundColor Yellow

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootDir = Split-Path -Parent $scriptDir
$backendDir = Join-Path $rootDir "backend"

# Start Go Backend in a separate window or background job
Write-Host "Starting Go REST API backend..." -ForegroundColor Cyan
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$backendDir'; go run ./cmd/api" -WorkingDirectory $backendDir

# Wait 3 seconds for backend database initialization
Start-Sleep -Seconds 3

# Start Next.js Frontend
Write-Host "Starting Next.js frontend on http://localhost:3000..." -ForegroundColor Cyan
Set-Location $rootDir
npm run dev
