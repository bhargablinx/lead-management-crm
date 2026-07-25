Since this is a scoring-based project, the roadmap should prioritize the highest-weighted criteria first: **Architecture (30%)**, **Authentication (25%)**, **Testing & Deployment (25%)**, and **API Design (20%)**.

---

# 🚀 Lead Management Platform Roadmap

## Phase 0 — Planning (Day 1)

### Goals

- Define project scope
- Design database
- Plan API
- Plan UI

### Deliverables

- [x] Create GitHub repository
- [ ] Initialize README
- [x] Create project board (GitHub Projects)
- [x] Define folder structure
- [x] Draw ER Diagram
- [x] Define user roles
- [x] Define lead lifecycle
- [x] Define API endpoints

---

## Phase 1 — Project Setup

### Backend

- [x] Express + TypeScript
- [x] Prettier
- [x] Environment validation
- [x] Logging
- [x] Global error handler
- [x] Health check endpoint

### Frontend

- [x] Next.js
- [x] Tailwind CSS
- [x] shadcn/ui
- [x] Redux Toolkit / TanStack Query
- [x] Axios
- [x] Protected routing
- [x] Theme

---

## Phase 2 — Database Design

### Models

```
User
Lead
LeadNote
LeadActivity
RefreshToken (optional)
```

### User

- id
- name
- email
- password
- role

### Lead

- id
- name
- email
- phone
- company
- source
- status
- assignedTo
- createdBy
- createdAt
- updatedAt

### Lead Note

- id
- leadId
- authorId
- content
- createdAt

### Lead Activity

- id
- leadId
- actorId
- action
- metadata
- createdAt

---

## Phase 3 — Authentication

### Backend

- [x] Register Admin
- [x] Login
- [x] Logout
- [x] JWT Authentication
- [x] Password hashing
- [x] Refresh token (optional)
- [x] Auth middleware
- [x] Role middleware

### Frontend

- [x] Login page
- [x] Auth context/store
- [x] Protected routes
- [x] Session persistence

---

## Phase 4 — User Management (Admin)

### Admin Features

- [x] Create member
- [x] List members
- [x] Update member
- [x] Delete member
- [x] View member details

Permissions

```
Admin
    ✓

Member
    ✗
```

---

# Phase 5 — Public Lead Capture

Public page

```
/lead
```

Features

- [ ] Capture lead
- [ ] Validation
- [ ] Success page
- [ ] Spam prevention
- [ ] Default status = NEW
- [ ] Create activity log

---

# Phase 6 — Lead Management

### Admin

- [ ] View all leads
- [ ] Search
- [] Filter
- [ ] Pagination
- [ ] Assign lead
- [ ] Delete lead

### Member

- [ ] View assigned leads
- [ ] Update status
- [ ] Add notes

---

# Phase 7 — Lead Lifecycle

Statuses

```
NEW

↓

CONTACTED

↓

QUALIFIED

↓

PROPOSAL

↓

WON

or

LOST
```

Backend

- [ ] Validate status transitions
- [ ] Store history
- [ ] Activity log

Frontend

- [ ] Status badge
- [ ] Dropdown
- [ ] Timeline

---

# Phase 8 — Notes

Backend

- [ ] Create note
- [ ] Delete own note
- [ ] List notes

Frontend

- [ ] Notes panel
- [ ] Markdown (optional)
- [ ] Timestamp
- [ ] Author

---

# Phase 9 — Activity Timeline

Automatically log

- Lead created
- Assigned
- Reassigned
- Status changed
- Note added
- Note deleted
- Lead updated
- Lead deleted

Timeline example

```
Today

John created lead

↓

Assigned to Alice

↓

Status changed

↓

Alice added note

↓

Status changed

↓

Lead Won
```

---

# Phase 10 — REST API

## Authentication

```
POST /auth/login

POST /auth/register

GET /auth/me
```

---

## Users

```
GET /users

POST /users

PATCH /users/:id

DELETE /users/:id
```

---

## Leads

```
GET /leads

POST /leads

GET /leads/:id

PATCH /leads/:id

DELETE /leads/:id
```

---

## Assignment

```
PATCH /leads/:id/assign
```

---

## Notes

```
GET /leads/:id/notes

POST /leads/:id/notes

DELETE /notes/:id
```

---

## Activities

```
GET /leads/:id/activity
```

---

Support

- pagination
- filtering
- searching
- sorting

Example

```
GET /leads?page=1

GET /leads?status=NEW

GET /leads?assignedTo=2

GET /leads?search=john

GET /leads?sort=createdAt
```

---

# Phase 11 — Dashboard

Cards

```
Total Leads

New Leads

Qualified

Won

Lost
```

Charts

- Leads per month
- Status distribution

Tables

- Recent Leads
- Recent Activity

---

# Phase 12 — Permissions

Backend

Admin

- Full CRUD
- Manage users
- Delete leads

Member

- Assigned leads only
- Notes
- Status updates

Frontend

- Hide unauthorized routes
- Hide unauthorized buttons
- Redirect unauthorized users

---

# Phase 13 — Validation

Backend

- Zod
- Prisma validation
- Request validation

Frontend

- React Hook Form
- Zod Resolver

---

# Phase 14 — Testing

## Unit Tests

- Password hashing
- Validators
- Permissions

---

## Integration Tests

Authentication

- Login
- Invalid login
- Unauthorized request

Lead Creation

```
Public Form

↓

Lead Created

↓

Status NEW

↓

Activity Logged
```

Assignment Flow

```
Admin assigns lead

↓

Member updates status

↓

Note created

↓

Activity recorded
```

Permissions

```
Member cannot delete lead

Admin can delete lead

Member cannot create users
```

Aim for **80%+ coverage** on core business logic.

---

# Phase 15 — Documentation

README

- Installation
- Environment variables
- Running locally
- Testing
- Deployment
- API documentation
- Folder structure
- User roles

Include a complete API reference with request/response examples and expected HTTP status codes.

---

# Phase 16 — Deployment

Backend

- [ ] Render / Railway

Frontend

- [ ] Vercel

Database

- [ ] Neon PostgreSQL

CI/CD

- [ ] GitHub Actions
- [ ] Run tests on pull requests
- [ ] Deploy on merge to main

---

# Final Polish

- [ ] Loading skeletons
- [ ] Toast notifications
- [ ] Error boundaries
- [ ] Empty states
- [ ] Responsive design
- [ ] Accessibility checks
- [ ] Seed script
- [ ] Demo accounts
- [ ] API collection (Postman or Bruno)

---

# 📌 Recommended Development Order

```
Phase 0  → Planning
Phase 1  → Project Setup
Phase 2  → Database Design
Phase 3  → Authentication
Phase 4  → User Management
Phase 5  → Public Lead Capture
Phase 6  → Lead Management
Phase 7  → Lead Lifecycle
Phase 8  → Notes
Phase 9  → Activity Timeline
Phase 10 → REST API
Phase 11 → Dashboard
Phase 12 → Permissions
Phase 13 → Validation
Phase 14 → Testing
Phase 15 → Documentation
Phase 16 → Deployment
```

This roadmap follows a **vertical-slice approach**, ensuring you have a working application early (authentication → public lead capture → lead management) while building toward the grading criteria. By completing the phases in this order, you'll satisfy the evaluation requirements incrementally and have a deployable MVP before adding dashboards, polishing, and comprehensive tests.
