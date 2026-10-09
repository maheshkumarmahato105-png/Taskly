@echo off
title EasyMyLearning Task Manager
echo =========================================================
echo   EasyMyLearning Task Manager - Full Stack Startup
echo =========================================================
echo Frontend:   http://localhost:3000
echo Backend:    http://localhost:8080
echo API Health: http://localhost:8080/health
echo Database:   PostgreSQL
echo =========================================================

cd /d "%~dp0\..\backend"
start "EasyMyLearning Backend" powershell -NoExit -Command "go run ./cmd/api"

timeout /t 3 /nobreak >nul

cd /d "%~dp0\.."
start "EasyMyLearning Frontend" npm run dev

echo Both services launched!
echo Open http://localhost:3000 in your browser.
pause
