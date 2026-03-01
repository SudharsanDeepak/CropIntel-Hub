@echo off
echo ====================================================================
echo    TESTING BACKEND CORS CONFIGURATION
echo ====================================================================
echo.
echo Testing if backend allows mobile app requests...
echo.

echo Test 1: Health endpoint (should work)
curl -s https://cropintel-hub-bnd.onrender.com/health
echo.
echo.

echo Test 2: Auth endpoint with no origin (mobile app simulation)
curl -s -H "Authorization: Bearer test-token" https://cropintel-hub-bnd.onrender.com/api/auth/me
echo.
echo.

echo Test 3: Check CORS headers
curl -s -I -H "Origin: capacitor://localhost" https://cropintel-hub-bnd.onrender.com/api/auth/me
echo.
echo.

echo ====================================================================
echo If you see "Access-Control-Allow-Origin" in Test 3, CORS is fixed!
echo If you see 401 Unauthorized in Test 2, that's OK (means endpoint works)
echo If you see CORS error or no response, backend needs redeployment
echo ====================================================================
echo.
pause
