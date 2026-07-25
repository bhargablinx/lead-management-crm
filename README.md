# Lead Management CRM

An authenticated, multi-tenant Lead Management CRM platform designed to capture, assign, and track leads through a complete lifecycle pipeline. Built with a decoupled architecture utilizing an Express/Mongoose backend and a Next.js (App Router)/Redux frontend.

---

## 📂 Project Structure

```
lead-management-crm/
├── backend/                  # Express API Server (Node + TypeScript)
│   ├── src/
│   │   ├── controllers/      # Route controllers (Auth, Leads, Notes, Users, etc.)
│   │   ├── middlewares/      # Authentication & Authorization middlewares
│   │   ├── models/           # Mongoose Database Models
│   │   ├── routes/           # Express API Route declarations
│   │   └── utils/            # Shared utilities (ApiError, ApiResponse, logging)
│   └── tsconfig.json
│
├── frontend/                 # Next.js App (Next.js 16 + TypeScript + Tailwind)
│   ├── app/                  # Next.js App Router pages & layouts
│   │   ├── dashboard/        # Authenticated dashboard views (Leads, Users)
│   │   └── public/           # Publicly shareable lead capture form pages
│   ├── components/           # UI and Page layout components (shadcn/ui + custom)
│   ├── hooks/                # Reusable React hooks
│   └── lib/                  # State management & network clients
│       ├── api/              # Axios API request clients
│       └── store/            # Redux Toolkit store, slices, and selectors
│
└── documentations/           # Documentation, ERDs, roadmap, and specs
    ├── db-design.md          # ERD diagram (mermaid) and schema documentation
    ├── api-documentation.md  # Detailed endpoint declarations
    └── roadmap.md            # Score-based project roadmap
```

---

## ⚙️ Architecture & Tech Stack

### Backend
* **Core**: Node.js, Express, TypeScript, Mongoose
* **Database**: MongoDB (Mongoose schemas)
* **Authentication**: JWT-based session management. Access tokens are passed via secure HTTP-only cookies (`accessToken`, `refreshToken`) or `Authorization` headers.
* **Middlewares**:
  * [auth.middleware.ts](file:///home/bhargab/WebD/lead-management-crm/backend/src/middlewares/auth.middleware.ts): Authenticates users and enforces role-based access control (RBAC).

### Frontend
* **Core**: Next.js (App Router), TypeScript, TailwindCSS
* **State Management**: Redux Toolkit (Slices for auth, leads, users)
* **API Client**: Axios instance configured with `withCredentials: true` to support cookie-based sessions. Matches proxy routes under `/api/*` mapped via Next.js rewrites (`next.config.ts`).
* **UI Components**: shadcn/ui components powered by Tailwind and `@base-ui/react`.

---

## 🗄️ Database & Domain Models

The platform tracks entities across 5 primary database collections:
1. **Organization**: Multi-tenant containers isolating users and leads.
2. **User**: CRM operators. Assigned a role of either `"admin"` or `"member"`.
3. **Lead**: Customers or prospects in the sales funnel. Tracks status (`new` ➔ `contacted` ➔ `qualified` ➔ `proposal_sent` ➔ `negotiation` ➔ `won`/`lost`).
4. **Note**: Timestamps, rich descriptions, and records authored by users on specific leads.
5. **Activity**: Immutable trail tracking actions (`lead_created`, `status_changed`, `lead_assigned`, `note_added`) performed by users on leads.

---

## 🔑 Permissions & Role Enforcement

* **Server-Side Enforcement**: Enforced via `authorizeRoles("admin")` middleware on sensitive endpoints (e.g. deleting leads, managing team members, reassigning leads).
* **Client-Side Enforcement**: Conditionally hides navigation links and restricts page access at path-level ([users/page.tsx](file:///home/bhargab/WebD/lead-management-crm/frontend/app/dashboard/users/page.tsx)), showing an "Access Denied" view to non-admin roles.

---

## ⚡ Quick Start & Run Commands

### 1. Running Backend Dev Server
```bash
cd backend
npm install
npm run dev      # Runs dev server on Port 8000 via tsx watch
npm run check    # Run typescript validation check (tsc --noEmit)
```

### 2. Running Frontend Dev Server
```bash
cd frontend
npm install
npm run dev      # Runs Next.js app on Port 3000
npm run typecheck # Run typescript compilation validation (tsc --noEmit)
```
