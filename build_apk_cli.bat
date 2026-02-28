@echo off
echo.
echo ========================================
echo   CropIntel HUB - Build APK (CLI Only)
echo   No Android Studio Required!
echo ========================================
echo.
echo This will:
echo   1. Copy website to App folder
echo   2. Install Capacitor
echo   3. Build web app
echo   4. Add Android platform
echo   5. Build APK using Gradle CLI
echo.
pause

echo.
echo [1/9] Copying website to App folder...
xcopy "AIML Project - Website" "AIML Project - App" /E /I /H /Y
if errorlevel 1 (
    echo ERROR: Failed to copy files
    pause
    exit /b 1
)
echo Done!

echo.
echo [2/9] Navigating to App folder...
cd "AIML Project - App"
echo Done!

echo.
echo [3/9] Installing Capacitor dependencies...
call npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/app @capacitor/haptics @capacitor/keyboard @capacitor/status-bar @capacitor/splash-screen
if errorlevel 1 (
    echo ERROR: npm install failed
    pause
    exit /b 1
)
echo Done!

echo.
echo [4/9] Initializing Capacitor...
call npx cap init "CropIntel HUB" "com.cropintelhub.app" --web-dir=dist
if errorlevel 1 (
    echo ERROR: Capacitor init failed
    pause
    exit /b 1
)
echo Done!

echo.
echo [5/9] Creating production environment file...
copy ..\env.production.template .env.production
echo Done!

echo.
echo [6/9] Building web app...
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed
    pause
    exit /b 1
)
echo Done!

echo.
echo [7/9] Adding Android platform...
call npx cap add android
if errorlevel 1 (
    echo ERROR: Failed to add Android platform
    pause
    exit /b 1
)
echo Done!

echo.
echo [8/9] Syncing files...
call npx cap sync
echo Done!

echo.
echo [9/9] Building APK with Gradle...
cd android
call gradlew.bat assembleDebug
if errorlevel 1 (
    echo ERROR: Gradle build failed
    echo.
    echo Possible issues:
    echo   - Java JDK not installed
    echo   - ANDROID_HOME not set
    echo   - Android SDK not installed
    echo.
    echo See BUILD_APK_WITHOUT_ANDROID_STUDIO.txt for help
    pause
    exit /b 1
)
echo Done!

echo.
echo ========================================
echo   BUILD COMPLETE! 🎉
echo ========================================
echo.
echo APK Location:
echo   app\build\outputs\apk\debug\app-debug.apk
echo.
echo Full path:
echo   B:\AIML\AIML Project - App\android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo Next steps:
echo   1. Copy APK to your phone
echo   2. Install APK on phone
echo   3. Open CropIntel HUB app
echo   4. Enjoy!
echo.
echo Or install via ADB:
echo   adb install app\build\outputs\apk\debug\app-debug.apk
echo.
pause
