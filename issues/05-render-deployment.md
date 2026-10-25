# Issue 5: Deploy backend to Render

**Labels:** `deployment`, `backend`, `priority:high`

## Goal
Deploy backend from the existing GitHub repository (`SAKSHAMKHATRI/Campus-Lost-And-Found`) and verify the public API.

## Tasks
- [x] Configure backend server to bind to public interface (`HOST = '0.0.0.0'`) and dynamic `process.env.PORT`.
- [x] Configure container graceful shutdown handling for Render lifecycles (`SIGTERM`, `SIGINT`).
- [x] Configure CORS for deployed Netlify frontend (`https://campuslost-and-found.netlify.app`).
- [x] Document monorepo Web Service parameters (Root Directory: `backend`, Build: `npm install`, Start: `npm start`).
- [x] Document environment variables (`NODE_ENV=production`, `MONGODB_URI`, `CLIENT_ORIGIN`).
- [x] Document MongoDB Atlas network access requirements (`0.0.0.0/0` for dynamic cloud IPs).
- [ ] Connect GitHub repository in Render dashboard and create Web Service.
- [ ] Verify public `/api/health` returns HTTP 200 on Render URL.
- [ ] Run Postman collection against deployed Render URL (`baseUrl`).
- [ ] Document live Render service URL.

## Acceptance criteria
- Render deploys without startup errors.
- Public health endpoint returns HTTP 200.
- API reads/writes to MongoDB Atlas.
- Postman requests pass against deployed service.
- No secrets are hard-coded in Git.
