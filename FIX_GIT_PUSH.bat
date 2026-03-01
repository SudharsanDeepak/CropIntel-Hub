@echo off
echo ====================================================================
echo 🔧 FIXING GIT PUSH ISSUES
echo ====================================================================
echo.

echo Step 1: Adding all changes (including deletions)...
echo ====================================================================
git add -A
echo ✅ All changes staged
echo.

echo Step 2: Checking status...
echo ====================================================================
git status
echo.

echo Step 3: Committing changes...
echo ====================================================================
git commit -m "Add mobile app with Capacitor and update documentation"
echo.

echo Step 4: Pushing to GitHub (master branch)...
echo ====================================================================
git push origin master
echo.

if errorlevel 1 (
    echo ❌ Push failed
    echo.
    echo Trying alternative push methods...
    echo.
    echo Method 1: Push with upstream
    git push -u origin master
    echo.
    if errorlevel 1 (
        echo Method 2: Force push (use with caution)
        echo Run this manually if needed: git push -f origin master
    )
) else (
    echo ✅ Successfully pushed to GitHub!
)

echo.
echo ====================================================================
pause
