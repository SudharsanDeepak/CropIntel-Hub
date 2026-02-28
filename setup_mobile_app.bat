@echo off
echo.
echo ========================================
echo   CropIntel HUB - Mobile App Setup
echo ========================================
echo.
echo This script will create a mobile app from your website
echo Location: B:\AIML\AIML Project - App
echo.
pause

echo.
echo [1/8] Creating App folder...
if not exist "AIML Project - App" (
    mkdir "AIML Project - App"
    echo Created folder: AIML Project - App
) else (
    echo Folder already exists
)

echo.
echo [2/8] Copying website files to App folder...
xcopy "AIML Project - Website\*" "AIML Project - App\" /E /I /H /Y /EXCLUDE:exclude_files.txt
echo Files copied successfully

echo.
echo [3/8] Navigating to App folder...
cd "AIML Project - App"

echo.
echo [4/8] Installing Capacitor dependencies...
call npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
call npm install @capacitor/app @capacitor/haptics @capacitor/keyboard @capacitor/status-bar @capacitor/splash-screen

echo.
echo [5/8] Initializing Capacitor...
call npx cap init "CropIntel HUB" "com.cropintelhub.app" --web-dir=dist

echo.
echo [6/8] Building web app...
call npm run build

echo.
echo [7/8] Adding Android platform...
call npx cap add android

echo.
echo [8/8] Syncing files...
call npx cap sync

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Next steps:
echo   1. Open Android Studio: npx cap open android
echo   2. Build APK in Android Studio
echo   3. Install on device
echo.
echo For iOS (Mac only):
echo   1. Run: npx cap add ios
echo   2. Open Xcode: npx cap open ios
echo   3. Build and run
echo.
echo See CREATE_MOBILE_APP.md for detailed instructions
echo.
pause
