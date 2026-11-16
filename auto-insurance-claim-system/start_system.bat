@echo off
title AutoSure System Launcher
echo ==================================================================
echo   LAUNCHING AUTOSURE - AI-POWERED AUTO ACCIDENT INSURANCE CLAIM SYSTEM
echo   (Camunda BPMN + Spring Boot 3 + SQLite + React 18)
echo ==================================================================
echo.

echo [1/2] Starting Spring Boot ^& Camunda Backend in new window...
start "AutoSure Backend" cmd /k "cd /d %~dp0 && call start_backend.bat"

echo Waiting 5 seconds for backend initialization...
timeout /t 5 /nobreak > nul

echo [2/2] Starting React Frontend in new window...
start "AutoSure Frontend" cmd /k "cd /d %~dp0 && call start_frontend.bat"

echo.
echo ==================================================================
echo   AutoSure System launched!
echo   Open in browser: http://localhost:3000
echo   SQLite Database: To query data, double-click 'open_sqlite.bat'
echo ==================================================================
pause