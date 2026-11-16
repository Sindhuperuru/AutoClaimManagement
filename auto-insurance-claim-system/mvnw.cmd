@echo off
set "DIR=%~dp0"
"%DIR%backend\maven\apache-maven-3.9.6\bin\mvn.cmd" -f "%DIR%backend\pom.xml" %*
