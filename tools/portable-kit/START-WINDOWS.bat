@echo off
setlocal
cd /d "%~dp0"
title Jaco and Anuscha portfolio
echo.
echo  Starting Jaco ^& Anuscha portfolio...
echo  Keep this window open. Close it when you are done.
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-ChildItem -LiteralPath '%~dp0' -File | Unblock-File -ErrorAction SilentlyContinue" >nul 2>&1

if exist "%~dp0Jaco-and-Anuscha.exe" (
  "%~dp0Jaco-and-Anuscha.exe"
  if not errorlevel 1 goto :done
  echo  Jaco-and-Anuscha.exe could not start — trying server.exe...
)

if exist "%~dp0server.exe" (
  "%~dp0server.exe"
  if not errorlevel 1 goto :done
  echo  server.exe could not start — trying PowerShell...
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve.ps1"

:done
echo.
echo  Site stopped.
pause
