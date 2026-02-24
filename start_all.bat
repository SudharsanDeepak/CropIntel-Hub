@echo off
echo ========================================
echo  Starting Market Intelligence Platform
echo ========================================
echo.

REM Start ML API (Python)
echo [1/3] Starting ML API on port 8000...
start "ML API" cmd /k "cd AIML Project - ML Model && .venv\Scripts\activate && uvicorn ml_api:app --host 0.0.0.0 --port 8000 --reload"
timeout /t 5 /nobreak >nul

REM Start Backend (Node.js)
echo [2/3] Starting Backend on port 5000...
start "Backend Server" cmd /k "cd AIML Project - Server && node index.js"
timeout /t 5 /nobreak >nul

REM Start Frontend (React)
echo [3/3] Starting Frontend on port 5173...
start "Frontend" cmd /k "cd AIML Project - Website && npm run dev"

echo.
echo ========================================
echo  All servers started successfully!
echo ========================================
echo.
echo  ML API:    http://localhost:8000
echo  Backend:   http://localhost:5000
echo  Frontend:  http://localhost:5173
echo.
echo  Press any key to exit this window...
echo  (Servers will continue running)
echo ========================================
pause >nul
