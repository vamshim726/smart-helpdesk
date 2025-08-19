@echo off
echo Starting Smart Helpdesk Development Environment...

echo Starting Backend Server...
start "Backend Server" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak >nul

echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo Development servers started!
echo Backend: http://localhost:8080
echo Frontend: http://localhost:5173
echo.
pause
