@echo off
title AutoSure SQLite Database Console
echo ==================================================================
echo   AUTOSURE INSURANCE CLAIM SYSTEM - SQLITE DATABASE CONSOLE
echo   Database: insurance.db
echo ==================================================================
echo.
echo Useful SQLite commands:
echo   .tables                                     (List all tables)
echo   .schema insurance_claims                    (View claims table structure)
echo   SELECT * FROM insurance_claims;             (View all claims)
echo   SELECT * FROM users;                        (View all user accounts)
echo   SELECT * FROM insurance_policies;           (View all policies)
echo   SELECT * FROM settlements;                  (View settled payments)
echo   .exit                                       (Exit SQLite console)
echo.
echo ==================================================================

if exist "C:\sqlite\sqlite3.exe" (
    "C:\sqlite\sqlite3.exe" insurance.db
) else (
    sqlite3 insurance.db
)
pause