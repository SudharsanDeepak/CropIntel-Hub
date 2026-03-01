@echo off
echo ====================================================================
echo    MOBILE APP BUILD - STATUS BAR + OAUTH FIXES
echo ====================================================================
echo.
echo Fixes included:
echo   - Status bar safe area padding (CSS + Capacitor)
echo   - OAuth deep link with Browser.close()
echo   - Enhanced logging for debugging
echo   - AuthCallback setUser fix
echo.
pause

echo ====================================================================
echo Step 1: Installing/Checking required packages...
echo ====================================================================
cd "AIML Project - App"
call npm install @capacitor/status-bar @capacitor/browser @capacitor/app
if %errorlevel% neq 0 (
    echo    Failed to install packages
    pause
    exit /b 1
)
echo    All packages ready

echo ====================================================================
echo Step 2: Cleaning previous builds...
echo ====================================================================
if exist "dist" rmdir /s /q "dist"
if exist "android\app\build" rmdir /s /q "android\app\build"
echo    Cleaned build folders

echo ====================================================================
echo Step 3: Building production bundle...
echo ====================================================================
call npm run build
if %errorlevel% neq 0 (
    echo    Build failed
    pause
    exit /b 1
)
echo    Build successful

echo ====================================================================
echo Step 4: Syncing with Capacitor...
echo ====================================================================
call npx cap sync android
if %errorlevel% neq 0 (
    echo    Capacitor sync failed
    pause
    exit /b 1
)
echo    Capacitor sync successful

echo ====================================================================
echo Step 5: Building APK...
echo ====================================================================
cd android
call gradlew assembleDebug
if %errorlevel% neq 0 (
    echo    APK build failed
    pause
    exit /b 1
)
cd ..

echo ====================================================================
echo    BUILD COMPLETE!
echo ====================================================================
echo.
echo APK Location:
echo    AIML Project - App\android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo Next Steps:
echo    1. Install APK on your device
echo    2. Test status bar (should not overlap)
echo    3. Test OAuth login with Gmail
echo    4. Check console logs in Chrome DevTools (chrome://inspect)
echo.
echo Backend Status:
echo    - Changes already pushed to GitHub
echo    - Deploy to Render if not auto-deployed
echo.
pause
