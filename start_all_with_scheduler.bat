@echo off
echo ========================================
echo  Starting Market Intelligence Platform
echo  WITH AUTOMATIC DAILY UPDATES
echo ========================================
echo.

REM Start Data Scheduler (runs in background)
echo [1/4] Starting Data Scheduler (24-hour updates)...
start "Data Scheduler" cmd /k "cd AIML Project - ML Model && .venv\Scripts\activate && python start_scheduler.py"
timeout /t 5 /nobreak >nul

REM Start ML API (Python)
echo [2/4] Starting ML API on port 8000...
start "ML API" cmd /k "cd AIML Project - ML Model && .venv\Scripts\activate && uvicorn ml_api:app --host 0.0.0.0 --port 8000 --reload"
timeout /t 5 /nobreak >nul

REM Start Backend (Node.js)
echo [3/4] Starting Backend on port 5000...
start "Backend Server" cmd /k "cd AIML Project - Server && node index.js"
timeout /t 5 /nobreak >nul

REM Start Frontend (React)
echo [4/4] Starting Frontend on port 5173...
start "Frontend" cmd /k "cd AIML Project - Website && npm run dev"

echo.
echo ========================================
echo  All servers started successfully!
echo ========================================
echo.
echo  Data Scheduler: Running (updates every 24 hours)
echo  ML API:         http://localhost:8000
echo  Backend:        http://localhost:5000
echo  Frontend:       http://localhost:5173
echo.
echo  The Data Scheduler will automatically update
echo  market prices every 24 hours from real sources:
echo  - Agmarknet API (Indian government data)
echo  - USDA API (US agriculture data)
echo  - OpenWeather API (weather data)
echo  - Blinkit API (if configured)
echo.
echo  Press any key to exit this window...
echo  (Servers will continue running)
echo ========================================
pause >nul
