# deploy-senior.ps1
# SENIOR DEVELOPER DEPLOYMENT SCRIPT
# This script handles the monorepo architecture properly

param(
    [string]$CommitMessage = "Senior deployment $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
)

$ErrorActionPreference = "Stop"

# Create comprehensive log
$logFile = "senior-deploy-$(Get-Date -Format 'yyyyMMdd-HHmmss').txt"
function Write-SeniorLog {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    $logMessage = "[$timestamp] [$Level] $Message"
    Write-Host $logMessage -ForegroundColor $(if($Level -eq "ERROR"){"Red"}elseif($Level -eq "SUCCESS"){"Green"}elseif($Level -eq "WARNING"){"Yellow"}else{"Cyan"})
    Add-Content -Path $logFile -Value $logMessage
}

Write-SeniorLog "=== SENIOR DEVELOPER DEPLOYMENT STARTING ===" "SUCCESS"
Write-SeniorLog "Log: $logFile"

# STEP 1: ARCHITECTURE VALIDATION
Write-SeniorLog "Step 1: Validating architecture..."
if (-not (Test-Path "has-status-backend")) {
    Write-SeniorLog "CRITICAL: Backend submodule missing" "ERROR"
    exit 1
}
if (-not (Test-Path "src/App.js")) {
    Write-SeniorLog "CRITICAL: Frontend missing" "ERROR"
    exit 1
}
Write-SeniorLog "Architecture validated" "SUCCESS"

# STEP 2: GIT STATE MANAGEMENT
Write-SeniorLog "Step 2: Managing git state..."
try {
    # Clean main repo
    $mainStatus = git status --porcelain
    if ($mainStatus) {
        Write-SeniorLog "Stashing main repo changes..."
        git stash push -m "Senior deployment stash"
    }
    
    # Clean backend submodule
    Push-Location has-status-backend
    $backendStatus = git status --porcelain
    if ($backendStatus) {
        Write-SeniorLog "Stashing backend changes..."
        git stash push -m "Senior deployment backend stash"
    }
    Pop-Location
    
    # Pull latest
    git pull origin main
    Write-SeniorLog "Git state managed successfully" "SUCCESS"
} catch {
    Write-SeniorLog "Git management failed: $($_.Exception.Message)" "ERROR"
    exit 1
}

# STEP 3: FRONTEND DEPLOYMENT (GitHub Pages)
Write-SeniorLog "Step 3: Frontend deployment..."
try {
    Write-SeniorLog "Installing frontend dependencies..."
    npm install
    
    Write-SeniorLog "Building frontend..."
    $buildResult = npm run build
    if ($LASTEXITCODE -ne 0) {
        throw "Frontend build failed"
    }
    
    Write-SeniorLog "Deploying to GitHub Pages..."
    $deployResult = npx gh-pages -d build
    if ($LASTEXITCODE -ne 0) {
        throw "GitHub Pages deployment failed"
    }
    
    Write-SeniorLog "Frontend deployed successfully" "SUCCESS"
} catch {
    Write-SeniorLog "Frontend deployment failed: $($_.Exception.Message)" "ERROR"
    exit 1
}

# STEP 4: BACKEND DEPLOYMENT (Render)
Write-SeniorLog "Step 4: Backend deployment..."
try {
    # Commit any backend changes
    Push-Location has-status-backend
    $backendChanges = git status --porcelain
    if ($backendChanges) {
        Write-SeniorLog "Committing backend changes..."
        git add .
        git commit -m "Backend update - $CommitMessage"
        git push
        Write-SeniorLog "Backend changes committed" "SUCCESS"
    } else {
        Write-SeniorLog "No backend changes to commit" "INFO"
    }
    Pop-Location
    
    # Update submodule reference
    Write-SeniorLog "Updating submodule reference..."
    git add has-status-backend
    git commit -m "Update backend submodule - $CommitMessage"
    git push
    
    Write-SeniorLog "Backend deployment triggered" "SUCCESS"
} catch {
    Write-SeniorLog "Backend deployment failed: $($_.Exception.Message)" "ERROR"
    exit 1
}

# STEP 5: VERIFICATION
Write-SeniorLog "Step 5: Verification..."
Write-SeniorLog "Waiting for services to be ready..."

# Wait for backend
$maxAttempts = 12
$attempt = 0
$backendReady = $false

do {
    Start-Sleep -Seconds 30
    $attempt++
    Write-SeniorLog "Backend health check attempt $attempt/$maxAttempts"
    
    try {
        $response = Invoke-WebRequest -Uri "https://has-status-backend.onrender.com/api/phases?clientId=demo" -UseBasicParsing -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            $backendReady = $true
            Write-SeniorLog "Backend is ready" "SUCCESS"
        }
    } catch {
        Write-SeniorLog "Backend not ready yet (attempt $attempt)" "WARNING"
    }
} while (-not $backendReady -and $attempt -lt $maxAttempts)

if (-not $backendReady) {
    Write-SeniorLog "Backend failed to become ready after $maxAttempts attempts" "ERROR"
    Write-SeniorLog "Manual intervention required" "ERROR"
    exit 1
}

# Test frontend
try {
    $frontendResponse = Invoke-WebRequest -Uri "https://leewaller93.github.io/leeprojstatus/" -UseBasicParsing -TimeoutSec 10
    if ($frontendResponse.StatusCode -eq 200) {
        Write-SeniorLog "Frontend is ready" "SUCCESS"
    }
} catch {
    Write-SeniorLog "Frontend health check failed: $($_.Exception.Message)" "WARNING"
}

# STEP 6: FINAL STATUS
Write-SeniorLog "=== SENIOR DEPLOYMENT COMPLETE ===" "SUCCESS"
Write-SeniorLog "Frontend: https://leewaller93.github.io/leeprojstatus/" "SUCCESS"
Write-SeniorLog "Backend: https://has-status-backend.onrender.com/" "SUCCESS"
Write-SeniorLog "Log file: $logFile" "INFO"

if ($backendReady) {
    Write-SeniorLog "DEPLOYMENT SUCCESSFUL - All systems operational" "SUCCESS"
} else {
    Write-SeniorLog "DEPLOYMENT PARTIAL - Backend needs manual attention" "WARNING"
} 