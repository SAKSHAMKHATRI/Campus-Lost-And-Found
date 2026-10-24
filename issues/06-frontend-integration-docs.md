# Issue 6: Integrate frontend with deployed API and update README

**Labels:** `frontend`, `integration`, `documentation`, `priority:high`

## Goal
Connect the existing frontend to the deployed backend without unnecessary UI changes.

## Tasks
- [ ] Inspect current pages and flows for posting and browsing reports.
- [ ] Replace mock/local-only item operations with API calls where appropriate.
- [ ] Keep API base URL in one clear config location.
- [ ] Ensure production frontend does not call `localhost`.
- [ ] Handle loading, empty results, API errors, and validation.
- [ ] Preserve current UI and test all affected pages.
- [ ] Document architecture, local setup, environment variables, endpoints, Render, and Postman.
- [ ] Keep frontend and backend in the same repository.

## Acceptance criteria
- Frontend creates and lists reports using deployed API.
- Reports persist in MongoDB after refresh.
- API errors are visible and handled.
- Live frontend uses the Render API.
- README and project structure match actual code.
