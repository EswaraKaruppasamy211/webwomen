@echo off
title SafeHer AI - Launcher
echo ==============================================================================
echo 🛡️  Starting SafeHer AI - Women Safety Navigation & Emergency Response System
echo ==============================================================================

set "PATH=%LOCALAPPDATA%\Programs\node;%PATH%"

echo Starting Backend Server on http://localhost:5000...
start cmd /k "cd backend && npm run dev"

echo Starting Frontend Next.js App on http://localhost:3000...
start cmd /k "cd frontend && npm run dev"

echo.
echo Application instances spawned in separate terminal windows.
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:5000/api
echo.
pause
