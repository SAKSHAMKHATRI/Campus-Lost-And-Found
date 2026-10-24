# Issue 4: Create Postman collection and test APIs

**Labels:** `testing`, `api`, `priority:high`

## Goal
Prepare a repeatable Postman demo for local and deployed API testing.

## Tasks
- [ ] Create collection `Campus Lost & Found API`.
- [ ] Add health, create, list, get-by-ID, update, and delete requests.
- [ ] Add invalid-payload and not-found cases.
- [ ] Use a `baseUrl` collection variable for local and Render URLs.
- [ ] Record expected status codes and response examples.
- [ ] Export collection to `backend/postman/` if useful.
- [ ] Ensure collection contains no secrets.

## Acceptance criteria
- Collection runs against local backend.
- Same collection can run against Render by changing `baseUrl`.
- Success and failure cases can be demonstrated.
