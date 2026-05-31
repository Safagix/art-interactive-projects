@echo off
setlocal

:: TITLE
title EIRA DIGITAL LAB (POLIGLOTA MODE)

:: ==========================================
:: ADMIN PRIVILEGE CHECK & ELEVATION
:: ==========================================
net session >nul 2>&1
if %errorLevel% == 0 (
    echo [ADMIN] Privileges Confirmed.
    goto :START
) else (
    echo [REQUEST] Requesting Admin Privileges...
    echo.
    echo Please accept the UAC prompt to allow Eira to control the PC.
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

:START
:: ==========================================
:: ENVIRONMENT SETUP
:: ==========================================
cd /d "g:\Digital Lab\Eira_Poliglota"

:: CHECK PYTHON
python --version >nul 2>&1
if %errorlevel% equ 0 (
    set PYTHON_CMD=python
) else (
    py --version >nul 2>&1
    if %errorlevel% equ 0 (
        set PYTHON_CMD=py
    ) else (
        echo [ERROR] Python not found! Install Python from python.org
        pause
        exit /b
    )
)

echo.
echo ===================================================
echo     EIRA DIGITAL LAB: MULTILINGUAL SYSTEM
echo ===================================================
echo.
echo [INFO] Environment: Eira_Poliglota
echo [INFO] Path: %CD%
echo [INFO] Languages: ES / EN / JA
echo [INFO] Voice: Mixed Neural
echo.
echo Launching Core...
echo.

%PYTHON_CMD% main_eira_lab.py

if %errorlevel% neq 0 (
    echo.
    echo [CRASH] System halted with error code %errorlevel%.
    pause
)
