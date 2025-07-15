# HAS Status Report App

A modern web application for tracking hospital accounting system (HAS) project status, team assignments, and feedback.

## Tech Stack

- **Frontend:** React (with React Select for dropdowns)
- **Backend:** Node.js + Express
- **Database:** SQLite (for local development)
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

4. **Start the backend (optional, for real data):**
   ```sh
   cd has-status-backend
   npm install
   npm start
   ```
   - The backend runs on http://localhost:5000.

---

## Deployment

- **Frontend:** Automatically deployed to GitHub Pages at  
  https://leewaller93.github.io/leeprojstatus/
- **To deploy:**  
  1. Commit and push changes to the `main` branch.
  2. Wait a few minutes for GitHub Pages to update.
  3. Refresh the site (Ctrl+F5 for hard refresh).

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
