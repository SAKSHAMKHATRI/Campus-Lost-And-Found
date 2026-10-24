# Issue 1: Create backend scaffold using MVC

**Labels:** `backend`, `enhancement`, `priority:high`

## Goal
Add a maintainable Node.js + Express backend to the existing repository using MVC architecture.

## Tasks
- [ ] Inspect current files and any existing backend before changing structure.
- [ ] Add a `backend/` folder in the same repository.
- [ ] Initialize Node.js and install Express, dotenv, Mongoose, and suitable development tools.
- [ ] Separate routes, controllers, models, config, and server startup.
- [ ] Add `GET /api/health`.
- [ ] Add `.env.example`; ignore `.env` and secrets.
- [ ] Add JSON error handling and a 404 handler.
- [ ] Document install and start commands.

## Acceptance criteria
- `npm install` and the documented start command work in `backend/`.
- Server uses `process.env.PORT`.
- `/api/health` returns HTTP 200 and JSON.
- MVC responsibilities are separated.
- Existing frontend and repository URL are preserved.
