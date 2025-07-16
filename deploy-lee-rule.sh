#!/bin/bash
# deploy-lee-rule.sh
# Automate the Lee Rule for full-stack deployment (backend, frontend, demo data)

set -e

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

# 3. Prompt user to trigger manual deploy on Render
echo "[Lee Rule] Please go to your Render dashboard and trigger a Manual Deploy for the backend service."
echo "URL: https://dashboard.render.com/"

# 4. If frontend changed, run npm run deploy
echo "[Lee Rule] Do you want to deploy frontend changes as well? (y/n)"
read deploy_frontend
if [ "$deploy_frontend" == "y" ]; then
  npm run deploy
fi

echo "[Lee Rule] All done! Verify backend at /api/phases and frontend at your public URL." 