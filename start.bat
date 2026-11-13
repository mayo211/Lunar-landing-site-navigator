@echo off
cd /d "%~dp0"
start "Backend" cmd /k "cd backend && .venv\Scripts\activate.bat && uvicorn app.main:app --reload"
start "Frontend" cmd /k "cd frontend && npm run dev"
timeout /t 8 >nul
start http://localhost:5173