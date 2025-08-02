# HAS Status Report App

A modern web application for tracking hospital accounting system (HAS) project status, team assignments, and feedback.

## Tech Stack

- **Frontend:** React (with React Select for dropdowns)
- **Backend:** Node.js + Express
- **Database:** MongoDB Atlas (for persistence)
- **Deployment:** GitHub Pages (frontend), Render (backend)

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
- **Persistent Data:** Uses MongoDB Atlas for data persistence.

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

### Backend Setup

> **Note:** The backend code is included as a git submodule from [https://github.com/leewaller93/whiteboard-backend](https://github.com/leewaller93/whiteboard-backend).

1. **Start the backend:**
   ```sh
   cd has-status-backend
   npm install
   npm start
   ```
   - The backend runs on http://localhost:5000.

---

## Deployment

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
