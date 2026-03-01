@echo off
echo ====================================================================
echo    CHECKING BACKEND STATUS
echo ====================================================================
echo.
echo Checking if backend is deployed and running...
echo.

curl -s https://cropintel-hub-bnd.onrender.com/health

echo.
echo.
echo ====================================================================
echo If you see JSON with "status": "ok", the backend is running!
echo If you see an error or timeout, the backend needs to be deployed.
echo ====================================================================
echo.
pause
