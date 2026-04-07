@echo off
setlocal

set "SCRIPT_DIR=%~dp0"
set "VENV_PY=%SCRIPT_DIR%..\.venv\Scripts\python.exe"

echo.
echo ========================================
echo   FIX UNREALISTIC PRICES
echo ========================================
echo.
echo This will populate the database with realistic prices
echo for 50 common fruits and vegetables.
echo.
echo Current issues will be fixed:
echo   - Red Onion: 20000 -^> 42.50 per kg
echo   - Avg Price: 1131.32 -^> ~85 per kg
echo.
pause
echo.
echo Running fix script...
if exist "%VENV_PY%" (
	"%VENV_PY%" "%SCRIPT_DIR%quick_populate_db.py"
) else (
	echo [WARN] Virtual environment Python not found at:
	echo        %VENV_PY%
	echo [INFO] Falling back to system Python.
	python "%SCRIPT_DIR%quick_populate_db.py"
)
echo.
echo ========================================
echo   DONE!
echo ========================================
echo.
echo Please refresh your browser to see the changes.
echo.
pause
