@echo off
cd /d "%~dp0"
start "" "http://localhost:3000"
npm.cmd run dev -- --hostname localhost --port 3000
pause
