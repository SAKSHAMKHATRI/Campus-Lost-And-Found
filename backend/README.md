# Campus Lost & Found — Backend Service

Backend REST API for the Campus Lost & Found project built with Node.js, Express, and MongoDB using MVC (Model-View-Controller) architecture.

## Architecture

```text
backend/
├── config/             # Configuration modules (db.js)
├── controllers/        # Request handlers & business logic (healthController.js, itemController.js)
├── middleware/         # Custom Express middlewares (404, global error handler)
├── models/             # Mongoose data schemas (Item.js)
├── postman/            # Postman API Collection (Campus-Lost-And-Found.postman_collection.json)
├── routes/             # Express API routes (healthRoutes.js, itemRoutes.js, index.js)
├── tests/              # Automated tests (health.test.js, item.test.js, items.test.js)
├── .env.example        # Template for required environment variables
├── .gitignore          # Backend-specific ignore rules
├── app.js              # Express app setup and middleware configuration
├── package.json        # Dependencies and scripts
├── README.md           # Documentation
└── server.js           # Server entry point and port listener
```

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended; v20+ supported)
- npm (installed with Node.js)
- A MongoDB Atlas account (free M0 cluster) or a local MongoDB instance
- [Postman](https://www.postman.com/downloads/) (for API testing and evaluation demonstration)
- A [Render](https://render.com/) account for cloud deployment

## Setup & Local Installation

1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your local environment configuration:
   ```bash
   cp .env.example .env
   ```
   *(Note: Never commit `.env` containing real credentials to version control)*

## MongoDB Atlas Setup Guide (Issue #2)

1. **Sign up / Log in:** Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free Shared cluster (M0).
2. **Database User:** Navigate to **Security > Database Access** and create a user (e.g. `campusAdmin`) with password authentication and `readWriteAnyDatabase` privileges.
3. **Network Access (IP Whitelist for Local & Render):**
   - Navigate to **Security > Network Access**.
   - Click **Add IP Address**.
   - Select **Allow Access from Anywhere** (`0.0.0.0/0`).
   - *Why `0.0.0.0/0` is required for Render:* Cloud platforms like Render assign dynamic outbound IP addresses that change across redeploys. Access is secured by your database username and strong password.
4. **Connection String:**
   - Go to **Database > Clusters > Connect > Drivers (Node.js)**.
   - Copy the connection string:
     `mongodb+srv://<username>:<password>@cluster0.mongodb.net/campus-lost-found?retryWrites=true&w=majority`
   - Paste it into your local `.env` file as `MONGODB_URI` and replace `<username>` and `<password>` with your database user credentials.

## Running Locally

- **Development mode** (with auto-reload via nodemon):
  ```bash
  npm run dev
  ```

- **Production mode**:
  ```bash
  npm start
  ```

By default, the server starts on port `5000` (or `process.env.PORT`). If `MONGODB_URI` is not configured, the server starts safely in health-only mode with a helpful console notice.

## Data Models

### Item Model (`backend/models/Item.js`)
| Field | Type | Required | Details |
|---|---|---|---|
| `title` | String | Yes | Name/title of item (min length 3). Also accepts `itemName` |
| `type` | String | Yes | Enum: `'lost'` or `'found'` |
| `category` | String | Yes | Category name (e.g., Electronics, Keys, Books & Notes) |
| `description` | String | Yes | Description (min length 5) |
| `location` | String | Yes | Campus zone or location |
| `date` | Date | Yes | Date lost or found |
| `imageUrl` | String | No | Optional image URL (default `""`) |
| `color` | String | No | Optional color (default `""`) |
| `status` | String | No | Enum: `'open'`, `'match-found'`, `'claim-requested'`, `'verified'`, `'returned'` (default `'open'`) |
| `createdAt` / `updatedAt` | Date | Auto | Managed by Mongoose timestamps |

## API Endpoints (Issue #1 & #3)

### 1. System Endpoints
| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | API welcome banner and endpoint directory |
| GET | `/api/health` | Service health, uptime, and environment check |

### 2. Item CRUD Endpoints (`/api/items`)
| Method | Endpoint | Purpose | Query / Params | Success Status |
|---|---|---|---|---|
| POST | `/api/items` | Create lost or found report | JSON body required | 201 Created |
| GET | `/api/items` | List all reports (newest first) | Optional: `?type=lost` or `?type=found` | 200 OK |
| GET | `/api/items/:id` | Get single report by ID | `:id` (24-char hex ObjectId) | 200 OK |
| PUT | `/api/items/:id` | Update report fields | `:id`, JSON body | 200 OK |
| DELETE | `/api/items/:id` | Delete report | `:id` | 200 OK |

---

## Render Cloud Deployment Guide (Issue #5)

The backend is configured for direct deployment as a **Render Web Service** from this GitHub repository (`SAKSHAMKHATRI/Campus-Lost-And-Found`).

### Live Deployed Backend URL
- **Production URL:** `https://<YOUR-RENDER-SERVICE-NAME>.onrender.com`
- **Public Health Endpoint:** `https://<YOUR-RENDER-SERVICE-NAME>.onrender.com/api/health`

*(Replace `<YOUR-RENDER-SERVICE-NAME>` with your actual service slug created on Render)*

### Monorepo Configuration on Render
Because this repository holds both frontend files at the root and backend files in `backend/`, configure the following fields in the Render dashboard:

| Setting | Value | Why it's needed |
|---|---|---|
| **Repository** | `https://github.com/SAKSHAMKHATRI/Campus-Lost-And-Found` | Connects your GitHub repo |
| **Branch** | `main` | Deploys verified commits from main |
| **Environment** | `Node` | Runtime environment |
| **Root Directory** | `backend` | **Crucial:** Tells Render to run build and start commands inside `backend/` |
| **Build Command** | `npm install` | Installs production dependencies |
| **Start Command** | `npm start` | Executes `node server.js` |
| **Health Check Path** | `/api/health` | Render automatically pings this to verify deployment health before routing traffic |

### Required Environment Variables on Render
Add these under **Environment** in the Render Web Service settings:

| Variable | Value | Purpose |
|---|---|---|
| `NODE_ENV` | `production` | Optimizes Express and disables sensitive stack traces |
| `MONGODB_URI` | `mongodb+srv://...` | Your live MongoDB Atlas connection string (entered directly into Render, never committed) |
| `CLIENT_ORIGIN` | `https://campuslost-and-found.netlify.app` | Configures CORS to allow browser requests from your live Netlify frontend |

> [!IMPORTANT]
> **Do not hardcode or set `PORT` in Render environment settings.** Render automatically assigns a dynamic port via `process.env.PORT`. `backend/server.js` listens on `0.0.0.0` and automatically binds to Render's assigned port.

### Step-by-Step Deployment Instructions
1. Log in to [dashboard.render.com](https://dashboard.render.com).
2. Click **New +** > **Web Service**.
3. Choose **Build and deploy from a Git repository** and connect `SAKSHAMKHATRI/Campus-Lost-And-Found`.
4. Configure service parameters:
   - **Name:** `campus-lost-and-found-backend` (or your preferred name)
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Click **Advanced** and set **Health Check Path** to `/api/health`.
6. Add the **Environment Variables** (`NODE_ENV`, `MONGODB_URI`, `CLIENT_ORIGIN`).
7. Click **Create Web Service**.
8. Inspect the **Logs** tab. Verify the following output:
   ```text
   [MongoDB] Connected successfully to host: ...
   Campus Lost & Found backend listening on 0.0.0.0:10000 [env: production]
   Health check available at /api/health
   ==> Your service is live 🎉
   ```

### Post-Deployment Verification
1. **Verify Health Endpoint:**
   Open `https://<YOUR-RENDER-SERVICE-NAME>.onrender.com/api/health` in your browser. It should return HTTP 200 with:
   ```json
   {
     "success": true,
     "message": "Campus Lost and Found API is healthy and running",
     "environment": "production"
   }
   ```
2. **Run Postman Against Render:**
   In your Postman collection:
   - Click the collection name **Campus Lost & Found API**.
   - Under the **Variables** tab, change the `baseUrl` value from `http://localhost:5000` to `https://<YOUR-RENDER-SERVICE-NAME>.onrender.com`.
   - Run the collection runner. All 12 requests (health, create, filter, update, delete, 404, validations) will execute against the cloud server and pass with green checkmarks!

---

## Postman API Collection (Issue #4)

A complete, importable Postman collection is available at:
`backend/postman/Campus-Lost-And-Found.postman_collection.json`

### Importing into Postman
1. Open the Postman application.
2. Click **Import** in the top left.
3. Drag and drop `backend/postman/Campus-Lost-And-Found.postman_collection.json`.
4. Run requests in sequence (01 to 12) or use the Postman Collection Runner.

---

## Automated Tests

Run the backend test suite using Node's built-in test runner:
```bash
npm test
```
The suite runs 29 tests covering:
- Health and 404 routing
- Offline Item schema validation rules
- Safe in-memory isolated CRUD API endpoint tests (mocked DB, safe from altering real data)
