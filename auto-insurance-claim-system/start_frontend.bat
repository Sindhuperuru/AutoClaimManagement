@echo off
title AutoSure React Frontend (Port 3000)
echo ==================================================================
echo   STARTING AUTOSURE REACT FRONTEND (VITE)
echo   Dashboard URL: http://localhost:3000
echo   Demo Login Accounts (Password for all: password123):
echo     - Customer:       customer1 / password123
echo     - Field Agent:    agent1    / password123
echo     - Surveyor:       surveyor1 / password123
echo     - Claims Officer: officer1  / password123
echo     - Administrator:  admin1    / password123
echo ==================================================================
echo.

cd /d "%~dp0frontend"
npm.cmd run dev
pause