# Issue 5: Deploy backend to Render

**Labels:** `deployment`, `backend`, `priority:high`

## Goal
Deploy backend from the existing GitHub repository and verify the public API.

## Tasks
- [ ] Configure a Render Web Service with the correct backend root directory.
- [ ] Set build/start commands based on `backend/package.json`.
- [ ] Add `MONGODB_URI` and other required values in Render environment settings.
- [ ] Ensure the app listens on `process.env.PORT`.
- [ ] Configure CORS for the deployed frontend.
- [ ] Verify public `/api/health`.
- [ ] Run Postman tests against the deployed base URL.
- [ ] Document the Render API URL in README.

## Acceptance criteria
- Render deploys without startup errors.
- Public health endpoint returns HTTP 200.
- API reads/writes to MongoDB.
- Postman requests pass against deployed service.
- No secrets are hard-coded.
