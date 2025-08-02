# deploy-robust.ps1
# Ultra-reliable deployment script with comprehensive error handling
# This script will fix your deployment issues once and for all

param(
    [string]$CommitMessage = "Auto-deploy $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
)

# Set error action preference
$ErrorActionPreference = "Stop"

# Create log file
$logFile = "deploy-log-$(Get-Date -Format 'yyyyMMdd-HHmmss').txt"
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    $logMessage = "[$timestamp] [$Level] $Message"
    Write-Host $logMessage -ForegroundColor $(if($Level -eq "ERROR"){"Red"}elseif($Level -eq "SUCCESS"){"Green"}else{"Yellow"})
    Add-Content -Path $logFile -Value $logMessage
}

Write-Log "=== STARTING ROBUST DEPLOYMENT ===" "SUCCESS"
Write-Log "Log file: $logFile"

# Function to test backend health
function Test-BackendHealth {
    Write-Log "Testing backend health..."
    try {
        $response = Invoke-WebRequest -Uri "https://has-status-backend.onrender.com/api/phases?clientId=demo" -UseBasicParsing -TimeoutSec 30
        if ($response.StatusCode -eq 200) {
            Write-Log "Backend is healthy" "SUCCESS"
            return $true
        } else {
            Write-Log "Backend returned status: $($response.StatusCode)" "ERROR"
            return $false
        }
    } catch {
        Write-Log "Backend health check failed: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

# Function to test frontend health
function Test-FrontendHealth {
    Write-Log "Testing frontend health..."
    try {
        $response = Invoke-WebRequest -Uri "https://leewaller93.github.io/leeprojstatus/" -UseBasicParsing -TimeoutSec 30
        if ($response.StatusCode -eq 200) {
            Write-Log "Frontend is healthy" "SUCCESS"
            return $true
        } else {
            Write-Log "Frontend returned status: $($response.StatusCode)" "ERROR"
            return $false
        }
    } catch {
        Write-Log "Frontend health check failed: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

# Step 1: Pre-deployment health check
Write-Log "Step 1: Pre-deployment health check"
$backendHealthy = Test-BackendHealth
$frontendHealthy = Test-FrontendHealth

if (-not $backendHealthy) {
    Write-Log "Backend is not healthy. Attempting to trigger redeploy..." "ERROR"
    try {
        $renderResponse = Invoke-WebRequest -Uri "https://api.render.com/deploy/srv-d1se50je5dus739jr700?key=PEv39pOpIA4" -UseBasicParsing
        Write-Log "Render redeploy triggered: $($renderResponse.StatusCode)" "SUCCESS"
        Write-Log "Waiting 60 seconds for backend to restart..."
        Start-Sleep -Seconds 60
        $backendHealthy = Test-BackendHealth
    } catch {
        Write-Log "Failed to trigger backend redeploy: $($_.Exception.Message)" "ERROR"
    }
}

# Step 2: Clean git state
Write-Log "Step 2: Cleaning git state"
try {
    # Check if we're in a clean state
    $gitStatus = git status --porcelain
    if ($gitStatus) {
        Write-Log "Git state is not clean. Stashing changes..."
        git stash push -m "Auto-stash before deployment"
    }
    
    # Pull latest changes
    Write-Log "Pulling latest changes..."
    git pull origin main
    
    Write-Log "Git state cleaned successfully" "SUCCESS"
} catch {
    Write-Log "Git cleanup failed: $($_.Exception.Message)" "ERROR"
    exit 1
}

# Step 3: Backend deployment
Write-Log "Step 3: Backend deployment"
try {
    Write-Log "Committing backend changes..."
    Push-Location has-status-backend
    
    # Check if there are changes to commit
    $backendStatus = git status --porcelain
    if ($backendStatus) {
        git add .
        git commit -m "Backend update - $CommitMessage"
        git push
        Write-Log "Backend changes committed and pushed" "SUCCESS"
    } else {
        Write-Log "No backend changes to commit" "INFO"
    }
    
    Pop-Location
    
    # Update submodule reference
    Write-Log "Updating submodule reference..."
    git add has-status-backend
    git commit -m "Update backend submodule - $CommitMessage"
    git push
    
    # Trigger Render deployment
    Write-Log "Triggering Render deployment..."
    $renderResponse = Invoke-WebRequest -Uri "https://api.render.com/deploy/srv-d1se50je5dus739jr700?key=PEv39pOpIA4" -UseBasicParsing
    Write-Log "Render deployment triggered: $($renderResponse.StatusCode)" "SUCCESS"
    
    # Wait for backend to be ready
    Write-Log "Waiting for backend to be ready..."
    $maxAttempts = 10
    $attempt = 0
    do {
        Start-Sleep -Seconds 30
        $attempt++
        Write-Log "Health check attempt $attempt/$maxAttempts"
        $backendHealthy = Test-BackendHealth
    } while (-not $backendHealthy -and $attempt -lt $maxAttempts)
    
    if (-not $backendHealthy) {
        Write-Log "Backend failed to become healthy after $maxAttempts attempts" "ERROR"
        exit 1
    }
    
    # Seed backend data
    Write-Log "Seeding backend data..."
    try {
        $seedResponse = Invoke-WebRequest -Uri "https://has-status-backend.onrender.com/api/seed" -Method POST -UseBasicParsing
        Write-Log "Backend seeded successfully: $($seedResponse.StatusCode)" "SUCCESS"
    } catch {
        Write-Log "Backend seeding failed: $($_.Exception.Message)" "ERROR"
    }
    
} catch {
    Write-Log "Backend deployment failed: $($_.Exception.Message)" "ERROR"
    exit 1
}

# Step 4: Frontend deployment
Write-Log "Step 4: Frontend deployment"
try {
    # Install dependencies
    Write-Log "Installing frontend dependencies..."
    npm install
    
    # Build frontend
    Write-Log "Building frontend..."
    $buildResult = npm run build
    if ($LASTEXITCODE -ne 0) {
        throw "Frontend build failed with exit code $LASTEXITCODE"
    }
    Write-Log "Frontend build completed successfully" "SUCCESS"
    
    # Deploy to GitHub Pages
    Write-Log "Deploying to GitHub Pages..."
    $deployResult = npx gh-pages -d build
    if ($LASTEXITCODE -ne 0) {
        throw "GitHub Pages deployment failed with exit code $LASTEXITCODE"
    }
    Write-Log "Frontend deployed to GitHub Pages successfully" "SUCCESS"
    
} catch {
    Write-Log "Frontend deployment failed: $($_.Exception.Message)" "ERROR"
    exit 1
}

# Step 5: Post-deployment verification
Write-Log "Step 5: Post-deployment verification"
Write-Log "Waiting 30 seconds for deployment to propagate..."
Start-Sleep -Seconds 30

$backendHealthy = Test-BackendHealth
$frontendHealthy = Test-FrontendHealth

if ($backendHealthy -and $frontendHealthy) {
    Write-Log "=== DEPLOYMENT SUCCESSFUL ===" "SUCCESS"
    Write-Log "Frontend: https://leewaller93.github.io/leeprojstatus/" "SUCCESS"
    Write-Log "Backend: https://has-status-backend.onrender.com/" "SUCCESS"
    Write-Log "Log file: $logFile" "INFO"
} else {
    Write-Log "=== DEPLOYMENT FAILED ===" "ERROR"
    Write-Log "Backend healthy: $backendHealthy" "ERROR"
    Write-Log "Frontend healthy: $frontendHealthy" "ERROR"
    Write-Log "Check log file: $logFile" "ERROR"
    exit 1
} 