# Issue 6: Integrate frontend with deployed API and update README

**Labels:** `frontend`, `integration`, `documentation`, `priority:high`

## Goal
Connect the existing frontend to the deployed backend without unnecessary UI changes.

## Tasks
- [x] Inspect current pages and flows for posting and browsing reports.
- [x] Replace mock/local-only item operations with API calls where appropriate.
- [x] Keep API base URL in one clear config location (`API_BASE_URL` in `js/storage.js`).
- [x] Ensure production frontend uses live Render API (`https://campus-lost-and-found-r1d3.onrender.com/api`) and not `localhost`.
- [x] Handle loading, empty results, API errors, and validation gracefully.
- [x] Preserve current UI and test all affected pages.
- [x] Document architecture, local setup, environment variables, endpoints, Render, and Postman in main README.
- [x] Keep frontend and backend in the same repository.

## Acceptance criteria
- Frontend creates and lists reports using deployed API.
- Reports persist in MongoDB Atlas after refresh.
- API errors are visible and handled.
- Live frontend uses the Render API.
- README and project structure match actual code.
