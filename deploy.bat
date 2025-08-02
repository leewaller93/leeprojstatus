@echo off
REM deploy.bat - Quick deployment script
REM Usage: deploy [commit message]

if "%1"=="" (
    powershell -ExecutionPolicy Bypass -File "deploy-robust.ps1"
) else (
    powershell -ExecutionPolicy Bypass -File "deploy-robust.ps1" -CommitMessage "%~1"
) 