# Campus Lost & Found — Frontend Application

Modern, responsive client-side web application for the **Campus Lost & Found** system. Built with Vanilla HTML5, CSS3, and JavaScript, integrated with the deployed Express/MongoDB REST API on Render and deployed on Netlify.

- **Live Frontend Application:** [https://campuslost-and-found.netlify.app/](https://campuslost-and-found.netlify.app/)
- **Live Backend REST API:** [https://campus-lost-and-found-r1d3.onrender.com/api](https://campus-lost-and-found-r1d3.onrender.com/api)

---

## 📸 Screenshots & Visual Tour

| Screen | Preview |
| :--- | :--- |
| **Login Page** | ![Login Page](./screenshots/login.png) |
| **Sign Up Page** | ![Sign Up Page](./screenshots/signup.png) |
| **User Dashboard** | ![Dashboard](./screenshots/dashboard.png) |
| **Recent Reports** | ![Recent Reports](./screenshots/recent-reports.png) |
| **Lost Items Catalog** | ![Lost Items](./screenshots/lost.png) |
| **Found Items Catalog** | ![Found Items](./screenshots/found.png) |
| **Smart Match Suggestions** | ![Smart Match Suggestions](./screenshots/match.png) |

---

## 📁 Frontend Directory Structure

```text
frontend/
├── css/
│   └── style.css                 # Unified responsive design system & component styles
├── js/
│   ├── admin.js                  # Admin management panel logic & CRUD operations
│   ├── auth.js                   # Client authentication, session persistence, role checks
│   ├── browse.js                 # Catalog browsing, search filtering, live API synchronization
│   ├── dashboard.js              # User metrics, quick stats, and recent report activity
│   ├── items.js                  # Item card rendering, badges, and ISO-8601 date formatters
│   ├── matches.js                # 10-point heuristic smart match engine & claim modal
│   ├── post-item.js              # Item submission form handler & async API POST
│   └── storage.js                # Central API client, data normalization, LocalStorage cache
├── screenshots/                  # High-resolution UI screenshots for documentation
├── admin.html                    # Administrative panel for managing reports and users
├── browse.html                   # Filterable catalog of lost and found items
├── dashboard.html                # User dashboard with summary stats and quick links
├── index.html                    # Application landing and login page
├── matches.html                  # Automated match recommendations and claim submission
├── post-item.html                # Form to report lost or found belongings
├── signup.html                   # Student and campus user registration
└── README.md                     # Frontend documentation (this file)
```

---

## ✨ Features

1. **Authentication & Session Management (`js/auth.js`):**
   - Client-side user registration, login, and secure session management.
   - Route protection (`protectPage()`) and role-based access control (`requireAdmin()`).
2. **Asynchronous API Integration (`js/storage.js`):**
   - Automatically synchronizes with the deployed Render backend (`https://campus-lost-and-found-r1d3.onrender.com/api`).
   - Normalizes data models seamlessly between MongoDB Atlas (`title`, `_id`) and frontend conventions (`itemName`, `id`).
   - Robust offline/network fallback using browser LocalStorage.
3. **Live Browsing & Filtering (`js/browse.js`):**
   - Instant search across item titles, categories, and campus locations.
   - Filter tabs for "All Items", "Lost", and "Found".
   - Loading skeletons and friendly empty-state handling.
4. **Report Submission (`js/post-item.js`):**
   - Interactive report creation with campus zone selection and date tracking.
   - Asynchronous button loading state (`"Submitting Report..."`) to prevent accidental double submissions.
5. **Smart Matching Algorithm (`js/matches.js`):**
   - Automatically scores lost vs. found items on a 10-point scale:
     - **Category Match:** +3 points
     - **Campus Location Agreement:** +2 points
     - **Color Matching:** +2 points
     - **Date Proximity (within 3 days):** +2 points
     - **Description Keyword Overlap:** +1 point
   - Classified into **Strong (8–10)**, **Possible (5–7)**, or **Weak (1–4)** matches.
6. **Admin Dashboard (`js/admin.js`):**
   - Overview of all campus reports with status updates (`open`, `claimed`, `returned`) and direct report editing.

---

## 🛠️ Local Development

Because the frontend is built using standard web technologies (HTML, CSS, JavaScript), no node build step is strictly required.

### Option 1: Using VS Code Live Server
1. Open the repository in VS Code.
2. Right-click on [`frontend/index.html`](file:///Users/mayank/Downloads/Campus-Lost-And-Found/frontend/index.html) and select **Open with Live Server**.
3. Live Server will serve the frontend from `http://127.0.0.1:5501/frontend/` (or port configured in `.vscode/settings.json`).

### Option 2: Using Node `serve`
Run from the repository root:
```bash
npx serve frontend
```
Navigate to `http://localhost:3000` in your browser.

### Option 3: Python HTTP Server
Run from inside the `frontend/` directory:
```bash
cd frontend
python3 -m http.server 8080
```
Navigate to `http://localhost:8080`.

---

## 🌐 API Configuration

By default, the client points to the production Render API:
```javascript
// js/storage.js
const API_BASE_URL = window.API_BASE_URL || 'https://campus-lost-and-found-r1d3.onrender.com/api';
```

### Pointing to Local Backend:
If running the backend locally at `http://localhost:5000`:
- You can override `window.API_BASE_URL = 'http://localhost:5000/api'` in the browser console, or update the fallback in [`js/storage.js`](file:///Users/mayank/Downloads/Campus-Lost-And-Found/frontend/js/storage.js#L4).

---

## ☁️ Netlify Deployment Guide

The frontend is deployed to Netlify from this Git repository.

### Configuration via `netlify.toml`
The repository includes a root [`netlify.toml`](file:///Users/mayank/Downloads/Campus-Lost-And-Found/netlify.toml) configured as follows:
```toml
[build]
  publish = "frontend"
```

### Manual Netlify Dashboard Verification:
If your Netlify site was previously linked to the repository root before restructuring:
1. Log in to [Netlify](https://app.netlify.com/).
2. Select your site: **campuslost-and-found**.
3. Navigate to **Site configuration > Build & deploy > Build settings**.
4. Verify the following:
   - **Base directory:** (leave empty or set to `/`)
   - **Publish directory:** `frontend`
   - **Build command:** (leave empty)
5. Save any changes and trigger a new deployment.
