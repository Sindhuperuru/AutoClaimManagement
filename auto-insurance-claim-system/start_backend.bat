@echo off
title AutoSure Spring Boot Backend (Port 8080)
echo ==================================================================
echo   STARTING AUTOSURE SPRING BOOT ^& CAMUNDA 7 BACKEND
echo   Database: SQLite (insurance.db)
echo   API Port: http://localhost:8080
echo   Camunda Cockpit: http://localhost:8080/camunda/app/cockpit/default/
echo   Default Camunda Login: admin / admin
echo ==================================================================
echo.

cd /d "%~dp0backend"
call mvnw.cmd spring-boot:run
pause