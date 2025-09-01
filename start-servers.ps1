# AI Trip Planner - Server Startup Script
Write-Host "🚀 Starting AI Trip Planner..." -ForegroundColor Green
Write-Host ""

# Get the script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Frontend directory
$frontendDir = Join-Path $scriptDir "frontend"
$backendDir = Join-Path $scriptDir "backend"

Write-Host "📁 Project Directory: $scriptDir" -ForegroundColor Yellow
Write-Host "📁 Frontend Directory: $frontendDir" -ForegroundColor Yellow
Write-Host "📁 Backend Directory: $backendDir" -ForegroundColor Yellow
Write-Host ""

# Check if directories exist
if (-not (Test-Path $frontendDir)) {
    Write-Host "❌ Frontend directory not found!" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $backendDir)) {
    Write-Host "❌ Backend directory not found!" -ForegroundColor Red
    exit 1
}

# Check if node_modules exist
$frontendNodeModules = Join-Path $frontendDir "node_modules"
$backendNodeModules = Join-Path $backendDir "node_modules"

if (-not (Test-Path $frontendNodeModules)) {
    Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Blue
    Set-Location $frontendDir
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install frontend dependencies!" -ForegroundColor Red
        exit 1
    }
}

if (-not (Test-Path $backendNodeModules)) {
    Write-Host "📦 Installing backend dependencies..." -ForegroundColor Blue
    Set-Location $backendDir
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install backend dependencies!" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Dependencies are ready!" -ForegroundColor Green
Write-Host ""

# Start backend server
Write-Host "🔧 Starting backend server..." -ForegroundColor Blue
Set-Location $backendDir
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Normal

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start frontend server
Write-Host "🎨 Starting frontend development server..." -ForegroundColor Blue
Set-Location $frontendDir
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Normal

# Wait a moment for frontend to start
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "🎉 Both servers are starting!" -ForegroundColor Green
Write-Host "📱 Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "🔧 Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host ""

# Open browser
Write-Host "🌐 Opening browser..." -ForegroundColor Blue
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "✨ AI Trip Planner is ready!" -ForegroundColor Green
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
