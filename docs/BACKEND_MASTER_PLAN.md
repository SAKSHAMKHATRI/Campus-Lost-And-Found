# Campus Lost & Found — Backend Master Plan

## Project context
- Existing repository: `SAKSHAMKHATRI/Campus-Lost-And-Found`
- Live frontend: https://campuslost-and-found.netlify.app/
- Frontend: existing HTML, CSS, and JavaScript.
- Requirement: add backend to the same repository. Do not create a new repository or change the repository URL.

## Evaluation requirements
1. Develop backend APIs for the existing frontend.
2. Use MVC (Model–View–Controller) architecture.
3. Deploy the backend and verify APIs.
4. Demonstrate API testing using Postman or Thunder Client.
5. Connect frontend to the deployed API URL.
6. Use MongoDB for data storage.
7. Keep frontend and backend folders in the same repository.

## Proposed stack
- Node.js + Express.js
- MongoDB Atlas + Mongoose
- MVC: models, controllers, routes
- Render Web Service
- Postman
- Existing HTML/CSS/JavaScript frontend

Before coding, inspect the repository and preserve working frontend files. If backend code already exists, extend it rather than duplicating it.

## Target structure
```text
Campus-Lost-And-Found/
├── frontend/                 # Existing frontend; preserve pages and assets
│   ├── css/
│   ├── js/
│   ├── screenshots/
│   └── *.html
├── backend/
│   ├── config/db.js
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── app.js
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
├── README.md
└── .gitignore
```
This is a proposed target, not an instruction to blindly move files. Inspect the current layout first.

## Suggested initial API
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Verify service health |
| POST | `/api/items` | Create a lost/found report |
| GET | `/api/items` | List reports; optionally filter by type |
| GET | `/api/items/:id` | Retrieve one report |
| PUT | `/api/items/:id` | Update a report |
| DELETE | `/api/items/:id` | Delete a report |

Suggested fields: `title`, `type` (`lost` or `found`), `category`, `description`, `location`, `date`, optional `imageUrl`, timestamps.

## Security rules
- Store `MONGODB_URI` in environment variables and Render settings.
- Commit `.env.example`, never real `.env` files or credentials.
- Configure CORS for the deployed frontend origin.
- Validate inputs and return meaningful status codes.
- Never hard-code secrets or claim endpoints work without testing.

## Definition of done
- [ ] Existing frontend remains functional.
- [ ] MVC separation is clear.
- [ ] MongoDB connection works.
- [ ] CRUD endpoints are tested in Postman.
- [ ] Render deployment and `/api/health` work.
- [ ] Production frontend uses the deployed API URL, not `localhost`.
- [ ] Frontend and backend remain in the same GitHub repository.
- [ ] README documents setup, routes, deployment, and Postman tests.
- [ ] No secrets are committed.

## Implementation order
1. Inspect repository and scaffold MVC backend.
2. Connect MongoDB and define Item model.
3. Implement and test CRUD APIs.
4. Deploy to Render.
5. Integrate frontend.
6. Update README and prepare demo.

Use the six issue drafts in `issues/` to track the work. Close each issue only when its acceptance criteria pass.
