@echo off
color 0B
title Iniciando ProfessionalStats (Modo Administrador)

:: Obtener la ruta de este script quitando la barra diagonal inversa final si existe
set "CURRENT_DIR=%~dp0"
if "%CURRENT_DIR:~-1%"=="\" set "CURRENT_DIR=%CURRENT_DIR:~0,-1%"

:: Comprobar si ya tiene permisos de administrador
NET SESSION >nul 2>&1
if %errorLevel% == 0 (
    goto :iniciar_app
) else (
    echo -----------------------------------------------------
    echo Solicitando elevacion de permisos a Administrador...
    echo Se abrira una nueva ventana pidiendo confirmacion.
    echo -----------------------------------------------------
    :: Relanzar este mismo .bat pero forzando permisos elevados
    powershell -Command "Start-Process cmd -ArgumentList '/k cd /d \"%CURRENT_DIR%\" & call .\Iniciar_ProfessionalStats.bat' -Verb RunAs"
    exit
)

:iniciar_app
:: Si llego aqui, ya es administrador (ej: si ejecutaste clic derecho > Ejecutar como Admin o mediante elevacion)
color 0A
title ProfessionalStats - RPG Personal local (Modo Administrador)
echo ======================================================================
echo          INICIANDO PROFESSIONALSTATS - COGNITIVE GYM (RPG)
echo ======================================================================
echo.

cd /d "%CURRENT_DIR%"
if %errorlevel% NEQ 0 (
    echo ERROR: No se pudo entrar a la carpeta de ProfessionalStats.
    pause
    exit /b
)

:: Inyectar Node de NVM si existe
if exist "%LOCALAPPDATA%\nvm\v24.15.0" (
    set "PATH=%LOCALAPPDATA%\nvm\v24.15.0;%PATH%"
)

echo [INFO] Directorio de ejecucion: %CD%
echo [INFO] Usando Node version:
node -v
echo.
echo [LISTO] Levantando el servidor de desarrollo Vite...
echo.

call npm run dev

echo.
echo ProfessionalStats se detuvo.
pause
