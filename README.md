# Campus Lost & Found Matching System

A web-based Campus Lost & Found Matching System designed to help students report lost and found items and identify possible matches between them.

The project is developed progressively in phases. Phase 1 focuses on a frontend-based implementation using Vanilla JavaScript and LocalStorage, while the planned Phase 2 moves the application toward a full-stack architecture.

---
Live Demo : https://campuslost-and-found.netlify.app/
## 📌 Project Overview

Finding lost belongings on a college campus can be difficult because students may have to manually search through different reports.

The Campus Lost & Found Matching System provides a centralized platform where users can:

- Register and log in
- Report lost items
- Report found items
- Browse available reports
- Search and filter items
- Get possible match suggestions
- Submit/verify claims
- Track their reports

An Admin panel is also included for managing users, reports and claims.

---

# 🚀 Phase 1 — Frontend & Local Storage

### Technologies

- HTML5
- CSS3
- Vanilla JavaScript
- Browser LocalStorage / SessionStorage

### Phase 1 Objective

The first phase focuses on building the complete working frontend without a backend or database.

All application data is stored locally in the browser using LocalStorage.

### Features

#### 🔐 Authentication

- User Signup
- User Login
- Logout
- Current user/session handling
- User roles
- Admin login

#### 📦 Lost Item Reports

Users can create lost-item reports containing information such as:

- Item name
- Category
- Color
- Campus zone
- Date
- Description

#### 🎒 Found Item Reports

Users can also report items they have found using similar information.

#### 🔎 Browse & Search

Users can browse all available Lost and Found reports.

The system provides:

- Search
- Lost/Found filtering
- Category filtering
- Color filtering
- Campus zone filtering

#### 📍 Campus Zones

Instead of requiring exact GPS coordinates, the application uses predefined campus locations such as:

- Main Gate
- Library
- Academic Block
- Lecture Halls
- Canteen
- Hostel
- Sports Complex
- Parking
- Labs
- Other

This makes location reporting simple and suitable for a campus environment.

---

# 🧠 Smart Matching System

The system compares Lost and Found reports using a simple weighted similarity score.

| Matching Attribute | Weight |
|--------------------|--------|
| Category | +3 |
| Color | +2 |
| Campus Location | +2 |
| Date within 3 days | +2 |
| Shared Description Keyword | +1 |
| **Maximum Score** | **10** |

### Match Strength

- **8–10** → Strong Match
- **5–7** → Possible Match
- **1–4** → Weak Match

The system also displays why two reports were considered a match.

Example:

```text
10/10 Strong Match

✓ Same category
✓ Same color
✓ Same campus zone
✓ Date within 3 days
✓ Shared description keyword
