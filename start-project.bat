@echo off
echo Starting AI Trip Planner...
echo.

echo Checking if dependencies are installed...

cd frontend
if not exist node_modules (
    echo Installing frontend dependencies...
    npm install
)

cd ../backend
if not exist node_modules (
    echo Installing backend dependencies...
    npm install
)

echo.
echo Starting backend server...
start cmd /k "cd /d %~dp0backend && npm run dev"

echo Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo Starting frontend development server...
start cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Both servers should be starting...
echo Frontend: http://localhost:5173
echo Backend: http://localhost:5000
echo.
echo Opening browser...
timeout /t 3 /nobreak > nul
start http://localhost:5173
echo.
pause
