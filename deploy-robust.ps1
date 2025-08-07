# deploy-robust.ps1 - Robust deployment script for HAS Status Report
# This script handles both frontend and backend deployment with proper error handling

param(
    [string]$CommitMessage = "Update from robust deployment script"
)

Write-Host "=== ROBUST DEPLOYMENT STARTING ===" -ForegroundColor Green
Write-Host "Commit Message: $CommitMessage" -ForegroundColor Cyan

# Step 1: Check git status
Write-Host "Step 1: Checking git status..." -ForegroundColor Yellow
git status
if ($LASTEXITCODE -ne 0) {
    Write-Host "Git status check failed!" -ForegroundColor Red
    exit 1
}

# Step 2: Deploy Backend (Render)
Write-Host "Step 2: Deploying backend to Render..." -ForegroundColor Yellow

# Commit and push backend changes
cd has-status-backend
git add .
git commit -m "Backend update: $CommitMessage"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Backend commit failed!" -ForegroundColor Red
    exit 1
}

git push
if ($LASTEXITCODE -ne 0) {
    Write-Host "Backend push failed!" -ForegroundColor Red
    exit 1
}
cd ..

Write-Host "Backend changes committed and pushed" -ForegroundColor Green

# Update submodule reference
git add has-status-backend
git commit -m "Update backend submodule: $CommitMessage"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Submodule commit failed!" -ForegroundColor Red
    exit 1
}

git push
if ($LASTEXITCODE -ne 0) {
    Write-Host "Submodule push failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Backend deployment triggered" -ForegroundColor Green

# Step 3: Deploy Frontend (GitHub Pages)
Write-Host "Step 3: Deploying frontend to GitHub Pages..." -ForegroundColor Yellow

# Build frontend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Frontend build failed!" -ForegroundColor Red
    exit 1
}

# Deploy to GitHub Pages
npx gh-pages -d build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Frontend deployment failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Frontend deployed successfully" -ForegroundColor Green

# Step 4: Wait and verify backend
Write-Host "Step 4: Waiting for backend to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

try {
    $response = Invoke-WebRequest -Uri "https://has-status-backend.onrender.com/health" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "Backend health check passed!" -ForegroundColor Green
    }
} catch {
    Write-Host "Backend health check failed, but deployment was triggered" -ForegroundColor Yellow
    Write-Host "Backend may still be deploying..." -ForegroundColor Yellow
}

# Step 5: Final verification
Write-Host "Step 5: Final verification..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://leewaller93.github.io/leeprojstatus/" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "Frontend is accessible!" -ForegroundColor Green
    }
} catch {
    Write-Host "Frontend verification failed, but deployment completed" -ForegroundColor Yellow
}

Write-Host "=== ROBUST DEPLOYMENT COMPLETE ===" -ForegroundColor Green
Write-Host "Frontend: https://leewaller93.github.io/leeprojstatus/" -ForegroundColor Cyan
Write-Host "Backend: https://has-status-backend.onrender.com/" -ForegroundColor Cyan
Write-Host "Health Check: https://has-status-backend.onrender.com/health" -ForegroundColor Cyan 