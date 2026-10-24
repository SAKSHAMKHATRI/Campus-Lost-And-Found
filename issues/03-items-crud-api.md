# Issue 3: Implement item CRUD API

**Labels:** `backend`, `api`, `priority:high`

## Goal
Implement working create, read, update, and delete endpoints for lost/found reports.

## Endpoints
- `POST /api/items` — create report
- `GET /api/items` — list reports; support `?type=lost` or `?type=found`
- `GET /api/items/:id` — get one report
- `PUT /api/items/:id` — update report
- `DELETE /api/items/:id` — delete report

## Tasks
- [ ] Implement controller methods connected to MongoDB.
- [ ] Validate body, IDs, and filters.
- [ ] Return appropriate status codes (201, 400, 404, 500 as applicable).
- [ ] Use consistent JSON response and error formats.
- [ ] Do not expose stack traces or credentials to clients.
- [ ] Document request and response examples.

## Acceptance criteria
- CRUD works with MongoDB, not hard-coded arrays.
- Invalid IDs and payloads return controlled errors.
- Lost/found filtering works.
- Requests are verified in Postman.
