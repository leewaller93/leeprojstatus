# dr1.ps1 - THE ONLY DEPLOYMENT SCRIPT YOU NEED
# This is the definitive working deployment script for HAS Status Report
# Handles both frontend (GitHub Pages) and backend (Render) deployment
# All other deployment files have been deleted to avoid confusion
# 
# Usage: .\dr1.ps1 "Your commit message here"
# Usage: .\dr1.ps1 (uses default commit message)

param(
    [string]$CommitMessage = "Update from dr1 deployment script"
)

Write-Host "=== DR1 DEPLOYMENT STARTING ===" -ForegroundColor Green
Write-Host "This is the ONLY deployment script you need!" -ForegroundColor Cyan
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

# Check if backend has changes
cd has-status-backend
git status --porcelain
$backendChanges = $LASTEXITCODE -eq 0 -and (git status --porcelain | Measure-Object -Line).Lines -gt 0

if ($backendChanges) {
    Write-Host "Backend has changes. Committing..." -ForegroundColor Yellow
    # Commit and push backend changes
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
    Write-Host "Backend changes committed and pushed" -ForegroundColor Green
} else {
    Write-Host "No backend changes to commit" -ForegroundColor Yellow
}
cd ..

# Check if has-status-backend is a submodule
$gitmodulesExists = Test-Path ".gitmodules"
$hasSubmodule = $false
if ($gitmodulesExists) {
    $hasSubmodule = (Get-Content ".gitmodules" -ErrorAction SilentlyContinue | Select-String "has-status-backend") -ne $null
}
$isSubmodule = $gitmodulesExists -and $hasSubmodule

if ($isSubmodule) {
    Write-Host "Updating submodule reference..." -ForegroundColor Yellow
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
} else {
    Write-Host "has-status-backend is not a submodule, skipping submodule update" -ForegroundColor Yellow
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

Write-Host "=== DR1 DEPLOYMENT COMPLETE ===" -ForegroundColor Green
Write-Host "Frontend: https://leewaller93.github.io/leeprojstatus/" -ForegroundColor Cyan
Write-Host "Backend: https://has-status-backend.onrender.com/" -ForegroundColor Cyan
Write-Host "Health Check: https://has-status-backend.onrender.com/health" -ForegroundColor Cyan 