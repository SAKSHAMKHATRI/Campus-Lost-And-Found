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

---

## Postman API Collection & Testing (Issue #4)

A complete, importable Postman collection is available at:
`backend/postman/Campus-Lost-And-Found.postman_collection.json`

### Importing into Postman
1. Open the Postman application.
2. Click the **Import** button in the top left.
3. Drag and drop `backend/postman/Campus-Lost-And-Found.postman_collection.json` (or browse to select it).
4. You will see the **Campus Lost & Found API** collection loaded.

### Collection Variables
The collection contains two variables:
- `baseUrl`: The root address of the API.
  - **Local Development:** Default is `http://localhost:5000`
  - **Render Deployment (Issue #5):** Simply update the `baseUrl` value to your Render URL (e.g. `https://campus-lost-found.onrender.com`).
- `itemId`: Automatically captured when you run request `02 - Create Item (POST)` and shared across all subsequent requests.

### Execution Workflow (In Order)
The collection is structured to test the complete lifecycle:
1. `01 - Health Check`: Verifies backend service status (HTTP 200).
2. `02 - Create Item (POST)`: Creates a test record (`[TEST] Dell XPS 65W USB-C Charger`) and stores `_id` into `{{itemId}}` (HTTP 201).
3. `03 - List All Items (GET)`: Retrieves all reports (HTTP 200).
4. `04 - Filter Lost Items (GET ?type=lost)`: Verifies query filtering for lost reports (HTTP 200).
5. `05 - Filter Found Items (GET ?type=found)`: Verifies query filtering for found reports (HTTP 200).
6. `06 - Get Item By ID (GET)`: Retrieves the test item using `{{itemId}}` (HTTP 200).
7. `07 - Update Item By ID (PUT)`: Updates status to `'returned'` (HTTP 200).
8. `08 - Delete Item By ID (DELETE)`: Deletes the test record (HTTP 200).
9. `09 - Verify Deleted Item Returns 404 (GET)`: Confirms the item is deleted by expecting HTTP 404 Not Found.
10. `10 - Validation - Empty Body Error (POST 400)`: Tests empty payload rejection (HTTP 400).
11. `11 - Validation - Invalid Type Filter (GET 400)`: Tests invalid query parameter handling (HTTP 400).
12. `12 - Validation - Invalid ID Format (GET 400)`: Tests malformed ObjectId handling (HTTP 400).

You can run the entire collection at once using the **Postman Collection Runner** or execute requests individually in order.

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
