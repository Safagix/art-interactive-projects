@echo off
:: PROJECT CODICE - VISION ENGINE ADMIN LAUNCHER
:: Simplified elevation logic based on working Eira profiles.

:: Check for permissions
>nul 2>&1 "%SYSTEMROOT%\system32\cacls.exe" "%SYSTEMROOT%\system32\config\system"

:: If error flag set, we do not have admin.
if '%errorlevel%' NEQ '0' (
    echo Requesting Administrative Privileges...
    goto UACPrompt
) else ( goto gotAdmin )

:UACPrompt
    echo Set UAC = CreateObject^("Shell.Application"^) > "%temp%\getadmin_codice.vbs"
    echo UAC.ShellExecute "%~s0", "", "", "runas", 1 >> "%temp%\getadmin_codice.vbs"
    "%temp%\getadmin_codice.vbs"
    exit /B

:gotAdmin
    if exist "%temp%\getadmin_codice.vbs" ( del "%temp%\getadmin_codice.vbs" )
    pushd "%~dp0"
    cls
    echo ======================================================
    echo           PROJECT CODICE: VISION ENGINE (ADMIN)
    echo ======================================================
    echo.
    set "PYTHON_EXE=python"
    set "SCRIPT_FILE=%~dp0VisionEngine\main_Codice.py"

    echo Checking environment...
    
    :: Try generic python first (likely has CV2 installed)
    python --version >nul 2>&1
    if %errorlevel% equ 0 (
        echo Using global 'python'...
        python "%SCRIPT_FILE%"
        goto postExecution
    )

    :: Fallback to dedicated path if exists
    if exist "%PYTHON_EXE%" (
        echo Using dedicated Python: %PYTHON_EXE%
        "%PYTHON_EXE%" "%SCRIPT_FILE%"
        goto postExecution
    )

    echo [!] ERROR: No se encontro Python funcional.
    pause
    exit /B

:postExecution

    if %errorlevel% neq 0 (
        echo.
        echo [!] The Vision Engine crashed with error code %errorlevel%.
        pause
    )

    echo.
    echo Press any key to exit...
    pause > nul
