# Issue 2: Connect MongoDB and create Item model

**Labels:** `backend`, `database`, `priority:high`

## Goal
Persist lost and found reports in MongoDB.

## Tasks
- [ ] Add a Mongoose database connection using `MONGODB_URI`.
- [ ] Create an Item model with `title`, `type` (`lost` or `found`), `category`, `description`, `location`, `date`, optional `imageUrl`, and timestamps.
- [ ] Validate required fields and allowed `type` values.
- [ ] Handle missing/invalid configuration without exposing secrets.
- [ ] Document MongoDB Atlas setup and safe network access.
- [ ] Keep credentials out of source control.

## Acceptance criteria
- Backend connects using environment configuration.
- Valid items can be saved and retrieved.
- Invalid types and missing required fields are rejected.
- No real connection string is committed.
