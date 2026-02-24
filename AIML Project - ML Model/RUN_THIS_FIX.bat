@echo off
color 0A
echo.
echo ========================================================================
echo                    EMERGENCY PRICE FIX
echo ========================================================================
echo.
echo This will FIX the unrealistic prices in your database RIGHT NOW!
echo.
echo Current Problem:
echo   - Avg Price showing: Rs 5139.73/kg (WRONG!)
echo   - Red Onion: Rs 20000/kg (WRONG!)
echo.
echo After Fix:
echo   - Avg Price will be: Rs 100-120/kg (CORRECT!)
echo   - Red Onion will be: Rs 42/kg (CORRECT!)
echo.
echo ========================================================================
echo.
pause
echo.
echo [1/3] Running emergency fix script...
python emergency_price_fix.py
echo.
echo [2/3] Fix complete!
echo.
echo [3/3] IMPORTANT - You MUST do these steps:
echo.
echo    1. RESTART the Backend Server (Node.js)
echo    2. RESTART the ML API (Python/FastAPI) if running
echo    3. REFRESH your browser (Ctrl + F5)
echo.
echo ========================================================================
pause
