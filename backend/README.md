# Campus Lost & Found — Backend Service

Backend REST API for the Campus Lost & Found project built with Node.js, Express, and MongoDB using MVC (Model-View-Controller) architecture.

## Architecture

```text
backend/
├── config/             # Configuration modules (db.js)
├── controllers/        # Request handlers & business logic (healthController.js, itemController.js)
├── middleware/         # Custom Express middlewares (404, global error handler)
├── models/             # Mongoose data schemas (Item.js)
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

### Request & Response Examples

#### Create Item (`POST /api/items`)
```json
// Request Body
{
  "title": "Blue Hydroflask Bottle",
  "type": "lost",
  "category": "Bottles & Lunchboxes",
  "description": "Lost on the 2nd floor library near silent study area",
  "location": "Library",
  "date": "2026-10-24",
  "color": "Blue"
}

// 201 Created Response
{
  "success": true,
  "message": "Item report created successfully",
  "data": {
    "_id": "671ad190f845a7201c10d321",
    "title": "Blue Hydroflask Bottle",
    "type": "lost",
    "category": "Bottles & Lunchboxes",
    "description": "Lost on the 2nd floor library near silent study area",
    "location": "Library",
    "date": "2026-10-24T00:00:00.000Z",
    "color": "Blue",
    "status": "open",
    "imageUrl": "",
    "createdAt": "2026-10-25T01:30:00.000Z",
    "updatedAt": "2026-10-25T01:30:00.000Z"
  }
}
```

#### List Items (`GET /api/items?type=lost`)
```json
// 200 OK Response
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "671ad190f845a7201c10d321",
      "title": "Blue Hydroflask Bottle",
      "type": "lost",
      "category": "Bottles & Lunchboxes",
      "location": "Library",
      "status": "open"
    }
  ]
}
```

## Automated Tests

Run the test suite using Node's built-in test runner:
```bash
npm test
```
The suite runs 29 tests covering:
- Health and 404 routing
- Offline Item schema validation rules
- Safe in-memory isolated CRUD API endpoint tests (mocked DB, safe from altering real data)
