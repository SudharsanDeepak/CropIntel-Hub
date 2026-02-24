@echo off
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
python quick_populate_db.py
echo.
echo ========================================
echo   DONE!
echo ========================================
echo.
echo Please refresh your browser to see the changes.
echo.
pause
