@echo off
cd /d "%~dp0"

echo ========================================
echo   AIR CANVAS - DEVELOPMENT SERVER
echo ========================================
echo.

:: Use Eira's local portable Node.js to avoid PATH issues
set "PATH=Eira_App\bin\node-v22.12.0-win-x64;%PATH%"

echo Checking Node.js Environment...
node --version > nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Could not find Eira's Node.js environment.
    pause
    exit /b 1
)

echo Starting Vite Development Server...
echo.
npm run dev

pause
