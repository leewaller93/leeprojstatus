# HAS Status Report App

A modern web application for tracking hospital accounting system (HAS) project status, team assignments, and feedback.

## Tech Stack

- **Frontend:** React (with React Select for dropdowns)
- **Backend:** Node.js + Express
- **Database:** MongoDB Atlas (for persistence; previously SQLite for local dev)
- **Deployment:** GitHub Pages (frontend), Node/Express backend (local or server)

---

## Features

- **Project Phases Table:** Track goals, comments, feedback, frequency, status, and assignments for each project phase.
- **Team Management:** Add, remove, and reassign team members.
- **Modern Filters:** Multi-select dropdowns for filtering by team member and status (using React Select).
- **Smart Pop-Out Editing:**  
  - Hover over a cell (Goal, Comments, Feedback) to see a wide, yellow, floating pop-out with the full content (scrollable if needed).
  - Click the pop-out to edit the text in a textarea.
  - Changes save on blur or Enter.
- **Partners Logo:** Displayed at the top right of the page.
- **Persistent Data:** Uses localStorage for frontend persistence; backend endpoints available for real data.

---

## Local Development

### Prerequisites

- Node.js (v16+ recommended)
- npm

### Setup

1. **Clone the repo:**
   ```sh
   git clone https://github.com/leewaller93/leeprojstatus.git
   cd leeprojstatus
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Start the frontend:**
   ```sh
   npm start
   ```
   - The app runs on http://localhost:3000 by default.

### Backend Setup (MongoDB Atlas)

> **Note:** The backend code is now included as a git submodule from [https://github.com/leewaller93/whiteboard-backend](https://github.com/leewaller93/whiteboard-backend). To make changes to the backend, edit and push to that repository, then update the submodule reference in this project and push again.

1. **Create a free MongoDB Atlas cluster** (https://www.mongodb.com/atlas/database).
2. **Get your connection string** and set it as an environment variable:
   - Locally: create a `.env` file in `has-status-backend/` with:
     ```
     MONGODB_URI=your-mongodb-atlas-connection-string
     ```
   - On Render: add `MONGODB_URI` in the Environment tab with your connection string.
3. **Start the backend:**
   ```sh
   cd has-status-backend
   npm install
   npm start
   ```
   - The backend runs on http://localhost:5000.

---

## Deployment

> **Note:** The backend is managed as a submodule from [https://github.com/leewaller93/whiteboard-backend](https://github.com/leewaller93/whiteboard-backend). If you update the backend, be sure to update the submodule reference in this repo and push.

### 🚀 Quick Deploy (Recommended)

**Use the robust deployment script for reliable deployments:**

```powershell
# Quick deploy (dr1 = deploy-robust.ps1)
.\dr1.ps1

# Deploy with custom commit message
.\dr1.ps1 "Your custom message"
```

### 📋 What the Deployment Script Does

The `deploy-robust.ps1` (dr1) script provides:

- ✅ **Pre-deployment health checks** - Tests both backend and frontend
- ✅ **Automatic git cleanup** - Stashes changes and pulls latest code
- ✅ **Backend deployment** - Commits changes, triggers Render, waits for health
- ✅ **Frontend deployment** - Builds React app, deploys to GitHub Pages
- ✅ **Post-deployment verification** - Confirms everything is working
- ✅ **Detailed logging** - Saves logs to `deploy-log-YYYYMMDD-HHMMSS.txt`

### 🔧 Manual Deployment (Legacy)

- **Frontend:** Automatically deployed to GitHub Pages at  
  https://leewaller93.github.io/leeprojstatus/
- **To deploy manually:**  
  1. Commit and push changes to the `main` branch.
  2. Wait a few minutes for GitHub Pages to update.
  3. Refresh the site (Ctrl+F5 for hard refresh).

### 📊 Deployment URLs

- **Frontend:** https://leewaller93.github.io/leeprojstatus/
- **Backend:** https://has-status-backend.onrender.com/
- **Health Check:** https://has-status-backend.onrender.com/api/phases?clientId=demo

---

## Troubleshooting

- **Build Fails with Syntax Error:**  
  - Remove any stray JSX comments like `{/* Filter UI with single selection */}` outside of JSX return blocks.
- **Pop-Out Not Working:**  
  - Ensure the `ExpandingCell` component uses a React portal for the pop-out, so it floats above the table and is not constrained by table layout.
- **Port Conflicts:**  
  - If something is running on port 3000, stop it or run the app on another port.

---

## Recent UI/UX Improvements

- Multi-select dropdown filters for team members and statuses.
- Modern, user-friendly filter UI (React Select).
- Smart pop-out for table cells (hover to view, click to edit, wide yellow box, scrollable).
- Partners logo moved to top right.
- Incremental improvements based on user feedback.

---

## Contact

For questions or further development, contact [leewaller93](https://github.com/leewaller93) or share this README with your developer.

---

## Backend Auto-Deploy (Recommended for Shareable Test Environment)

To ensure your backend is always up-to-date and accessible for your GitHub Pages frontend, set up auto-deploy using GitHub Actions and SSH to your own server (VPS, cloud, or on-prem).

### Prerequisites
- A server (VPS, cloud, or on-prem) with Node.js and npm installed
- SSH access to the server
- Your backend repo cloned on the server
- (Optional) A process manager like pm2 for running the backend

### Setup Steps
1. **Generate an SSH key pair** on your local machine or in the GitHub Actions UI:
   ```sh
   ssh-keygen -t ed25519 -C "github-actions-deploy"
   ```
   - Add the public key (`.pub`) to your server's `~/.ssh/authorized_keys`.
   - Add the private key as a GitHub Actions secret (e.g., `SSH_PRIVATE_KEY`).
2. **Configure your server for passwordless SSH login from GitHub Actions.**
3. **Add the provided GitHub Actions workflow file to `.github/workflows/deploy-backend.yml`.**
4. **Push to `main` branch:**
   - On every push, GitHub Actions will SSH into your server, pull the latest code, install dependencies, and restart the backend.

### Example SSH Deploy Workflow
See `.github/workflows/deploy-backend.yml` in this repo for a template.

### Environment Variables
- Set your backend API URL in the frontend to your server's public address (e.g., `https://your-server.com/api`).
- Use `.env` files for secrets and configuration on your server.

### Keeping Everything in Sync
- Frontend auto-deploys to GitHub Pages on push.
- Backend auto-deploys to your server on push.
- All users can access the live test environment at your public GitHub Pages URL.

---

## MongoDB Atlas Setup for Persistence

1. Go to https://cloud.mongodb.com/ and create a free account if you don't have one.
2. Create a new project and then click "Create Deployment" (this is the new name for creating a cluster).
3. Choose the Free Tier (Shared, M0) and follow the prompts to create your cluster.
4. Once the cluster is ready, create a database user (username and password).
5. Click "Connect" and choose "Shell" or "Compass" to view your connection string. It will look like:
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/<dbname>?retryWrites=true&w=majority&appName=Cluster0
6. Replace <username>, <password>, and <dbname> as needed (e.g., hasstatus).
7. In your Render backend service, go to the Environment tab and add a new variable:
   - Key: MONGODB_URI
   - Value: (your full connection string)
8. Save and redeploy your backend.

After this, all data will be persistent and shareable across devices and browsers.

## Render Deployment Settings (Backend in Subdirectory)

- **Root Directory:** has-status-backend
- **Build Command:** npm install
- **Start Command:** node server.js

These settings ensure Render runs your Node/Express backend, not the frontend React dev server. Always double-check these after creating or updating your Render service.

---

## Submodule Restore & Recovery Guide (Critical Backend Fix)

If your backend submodule (`has-status-backend`) is not being cloned or deployed correctly (e.g., Render cannot find `server.js`), follow these steps to restore or fix it:

### 1. Ensure All Backend Data is Safe
- Go to your backend repo (e.g., https://github.com/leewaller93/whiteboard-backend).
- Make sure all important files (including seed/demo data) are committed and pushed.
- If you have local changes in `has-status-backend`, commit and push them to the backend repo before proceeding.

### 2. Remove and Re-Add the Submodule
- In your main project root, run:
  ```sh
  git submodule deinit -f has-status-backend
  git rm -f has-status-backend
  git commit -m "Remove broken backend submodule"
  git push
  # Delete the local has-status-backend directory if it still exists
  rm -rf has-status-backend
  # Re-add the submodule
  git submodule add https://github.com/leewaller93/whiteboard-backend has-status-backend
  git commit -m "Re-add backend submodule, clean state"
  git push
  ```
- Confirm on GitHub that the `has-status-backend` folder in your main repo points to the correct backend repo and commit.

### 3. Redeploy on Render
- Trigger a manual deploy on Render.
- Check the build logs to ensure `server.js` is found and the backend starts successfully.

### 4. Why This Works
- This process guarantees the submodule pointer is correct, the backend repo is public, and all files are available to Render.
- As long as your backend repo is up to date, you will not lose any data.

**If you ever need to restore or fix the backend submodule, follow these steps for a safe recovery.**

### Automated Restore Script

You can use the provided `restore-has-status-backend.sh` script to automate the submodule restore process:

```sh
bash restore-has-status-backend.sh
```

This script will:
- Deinitialize and remove the existing submodule (if present)
- Commit and push the removal
- Re-add the backend submodule from the correct repo
- Commit and push the new submodule pointer

**After running the script, trigger a manual deploy on Render and check the build logs.**

---

### What to do next (very easy):

1. **Create a file called `.env` in your project root (where `src/` is).**
2. Add this line to the file (replace the URL with your actual Render backend URL if different):  
   ```
   REACT_APP_API_URL=https://has-status-backend.onrender.com
   ```

3. **Restart your frontend development server** (if running) so it picks up the new environment variable.

---

### Final Checklist

- [x] Backend is in its own repo and not tracked by the main project.
- [x] Frontend code is ready to use the deployed backend.
- [ ] You just need to add the `.env` file as above.
- [ ] Deploy the backend to Render (instructions above).
- [ ] Set your MongoDB Atlas URI as `MONGODB_URI` in Render.

---

**Once you’ve done these steps, your frontend will talk to your deployed backend, and everything will be clean and easy to maintain.**

If you want, I can also provide a quick summary of how to update the backend or frontend in the future, or help with any other step.  
Let me know when you’re ready for the next part, or if you want me to check anything else!
