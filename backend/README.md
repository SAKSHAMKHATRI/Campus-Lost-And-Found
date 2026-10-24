# Campus Lost & Found — Backend Service

Backend REST API for the Campus Lost & Found project built with Node.js, Express, and MongoDB using MVC (Model-View-Controller) architecture.

## Architecture

```text
backend/
├── config/             # Configuration modules (e.g., db.js)
├── controllers/        # Request handlers & business logic (e.g., healthController.js)
├── middleware/         # Custom Express middlewares (404, global error handler)
├── models/             # Mongoose data schemas (Item model in Issue #2)
├── routes/             # Express API routes (healthRoutes.js, index.js)
├── tests/              # Automated tests (health.test.js)
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

## Running the Server

- **Development mode** (with auto-reload via nodemon):
  ```bash
  npm run dev
  ```

- **Production mode**:
  ```bash
  npm start
  ```

By default, the server will start on port `5000` (or the port specified by `PORT` in your `.env` or hosting environment like Render).

## Endpoints Implemented (Issue #1)

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

## Automated Tests

Run the test suite using Node's built-in test runner:
```bash
npm test
```
