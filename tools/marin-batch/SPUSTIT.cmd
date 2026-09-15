@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
 echo V pocitaci chybi Node.js. Posli Nele tuto zpravu.
 pause
 exit /b 1
)
node start.mjs
pause
