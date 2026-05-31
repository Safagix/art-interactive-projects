@echo off
echo.
echo   Open Design + OpenCode
echo   ----------------------
echo.
powershell -NoProfile -ExecutionPolicy Bypass -Command "Set-Location '%~dp0'; pnpm tools-dev run web"
pause
