#!/bin/bash
# deploy-lee-rule.sh
# NOTE: If using MongoDB Atlas, set the MONGODB_URI environment variable in Render and in your local .env file for backend.
# This script:
#   - Commits and pushes backend changes
#   - Updates and pushes the backend submodule reference in the main repo
#   - Triggers the Render backend deploy via deploy hook
#   - Deploys the frontend
#   - Ensures all users see the same persistent data (phases, team, whiteboard, project/client name) across devices and browsers
# Automate the Lee Rule for full-stack deployment (backend, frontend, demo data)

# Detect Windows and run PowerShell commands if needed
if [[ "$(uname -s)" =~ MINGW|MSYS|CYGWIN ]]; then
  echo "[Lee Rule] Detected Windows shell. Running PowerShell steps automatically..."
  powershell -Command "
    Write-Host '[Lee Rule] Step 1: Commit and push backend changes...';
    cd has-status-backend;
    git add .;
    git commit -m 'Update backend and demo data for public demo';
    git push;
    cd ..;
    Write-Host '[Lee Rule] Step 2: Update submodule reference in main repo...';
    git add has-status-backend;
    git commit -m 'Update backend submodule ref for redeploy';
    git push;
    Write-Host '[Lee Rule] Step 3: Trigger Render backend deploy via Deploy Hook...';
    curl.exe -fsSL 'https://api.render.com/deploy/srv-d1rbgqm3jp1c73bm52i0?key=f1_fTd-OeYk';
    Write-Host '[Lee Rule] Step 4: Deploy frontend...';
    npm run deploy;
    Write-Host '[Lee Rule] All done! Backend and frontend are live.';
  "
  exit 0
fi

# 1. Commit and push backend changes (including demo data)
echo "[Lee Rule] Committing and pushing backend changes..."
cd has-status-backend

git add .
echo "Enter a commit message for backend (or press Enter for default):"
read backend_msg
if [ -z "$backend_msg" ]; then
  backend_msg="Update backend and demo data for public demo"
fi
git commit -m "$backend_msg" || echo "No backend changes to commit."
git push
cd ..

# 2. Update submodule reference in main repo and push
echo "[Lee Rule] Updating submodule reference in main repo..."
git add has-status-backend
git commit -m "Update backend submodule ref for redeploy" || echo "No submodule changes to commit."
git push

# 3. Automatically trigger Render backend deploy via Deploy Hook
echo "[Lee Rule] Triggering backend deploy on Render via Deploy Hook..."
curl -fsSL "https://api.render.com/deploy/srv-d1rbgqm3jp1c73bm52i0?key=f1_fTd-OeYk" && echo "[Lee Rule] Render backend deploy triggered!"

# 4. Always deploy frontend
npm run deploy

echo "[Lee Rule] All done! Backend and frontend are live. Verify backend at /api/phases and frontend at your public URL." 