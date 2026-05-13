@echo off

echo Starting backend...
start cmd /k "cd /d %~dp0backend && npm.cmd install && node app.js"

echo Starting frontend...
start cmd /k "cd /d %~dp0frontend && npm.cmd install && npm run dev"

pause