@echo off
echo ========================================
echo  Daily Market Data Update Setup
echo ========================================
echo.

cd /d "%~dp0"

echo [1/2] Activating Python environment...
call .venv\Scripts\activate

echo [2/2] Running daily market update...
python daily_market_update.py

echo.
echo ========================================
echo  Update Complete!
echo ========================================
echo.
pause
