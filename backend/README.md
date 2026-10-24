# Campus Lost & Found — Backend Service

Backend REST API for the Campus Lost & Found project built with Node.js, Express, and MongoDB using MVC (Model-View-Controller) architecture.

## Architecture

```text
backend/
├── config/             # Configuration modules (db.js)
├── controllers/        # Request handlers & business logic (healthController.js)
├── middleware/         # Custom Express middlewares (404, global error handler)
├── models/             # Mongoose data schemas (Item.js)
├── routes/             # Express API routes (healthRoutes.js, index.js)
├── tests/              # Automated tests (health.test.js, item.test.js)
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

## Setup & Installation

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
3. **Network Access (IP Whitelist):**
   - Navigate to **Security > Network Access**.
   - Click **Add IP Address**.
   - For development and cloud hosting (Render), select **Allow Access from Anywhere** (`0.0.0.0/0`).
4. **Connection String:**
   - Go to **Database > Clusters > Connect > Drivers (Node.js)**.
   - Copy the connection string:
     `mongodb+srv://<username>:<password>@cluster0.mongodb.net/campus-lost-found?retryWrites=true&w=majority`
   - Paste it into your local `.env` file as `MONGODB_URI` and replace `<username>` and `<password>` with your database user credentials.

## Running the Server

- **Development mode** (with auto-reload via nodemon):
  ```bash
  npm run dev
  ```

- **Production mode**:
  ```bash
  npm start
  ```

By default, the server starts on port `5000` (or `process.env.PORT`). If `MONGODB_URI` is not configured, the server starts safely in health-only mode with a helpful console notice.

## Data Models (Issue #2)

### Item Model (`backend/models/Item.js`)
| Field | Type | Required | Details |
|---|---|---|---|
| `title` | String | Yes | Name/title of item (min length 3). Also accepts `itemName` |
| `type` | String | Yes | Enum: `'lost'` or `'found'` |
| `category` | String | Yes | Category name (e.g., Electronics, Keys, Books) |
| `description` | String | Yes | Description (min length 5) |
| `location` | String | Yes | Campus zone or location |
| `date` | Date | Yes | Date lost or found |
| `imageUrl` | String | No | Optional image URL (default `""`) |
| `color` | String | No | Optional color (default `""`) |
| `status` | String | No | Enum: `'open'`, `'match-found'`, `'claim-requested'`, `'verified'`, `'returned'` (default `'open'`) |
| `createdAt` / `updatedAt` | Date | Auto | Managed by Mongoose timestamps |

## Endpoints Implemented

### 1. Health Check
- **URL:** `GET /api/health`
- **Description:** Verifies service status and operational uptime.
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Campus Lost and Found API is healthy and running",
    "timestamp": "2026-10-23T15:35:00.000Z",
    "uptime": "12.45s",
    "environment": "development"
  }
  ```

### 2. 404 Route Handling
- Any request to an undefined route returns HTTP 404 with structured JSON:
  ```json
  {
    "success": false,
    "message": "Cannot GET /api/unknown - Route not found"
  }
  ```

*(Note: CRUD endpoints `/api/items` will be implemented in Issue #3)*

## Automated Tests

Run the test suite using Node's built-in test runner:
```bash
npm test
```
The suite verifies health routing, 404 handling, and offline Item model schema validations.
