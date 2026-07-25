# Workspace Rules & AI Agent Context

Welcome, AI Agent! This file is placed in the Workspace Customizations Root (`.agents/AGENTS.md`) to provide you with the critical context and rules of this repository. Read this file before making modifications to avoid redundant scans.

---

## 🛠️ Technology Stack & Configuration

* **Backend**: Express.js + Mongoose (MongoDB) + TypeScript.
  * Node version: module (`"type": "module"`).
  * Build check: `npm run check` (runs `tsc --noEmit`).
* **Frontend**: Next.js 16 (App Router) + TypeScript + TailwindCSS + Redux Toolkit + Axios.
  * Axios client: `frontend/lib/axios.ts` exports `api` instance configured with `withCredentials: true`. Always use this instance for auth-protected endpoints.
  * Build check: `npm run typecheck` (runs `tsc --noEmit`).

---

## 🛑 Important Coding Conventions

### 1. Backend Import Extensions (ESM)
Since the backend uses ES Modules (`"type": "module"` in `package.json`), all local file imports **MUST** include the `.js` file extension (even though the files are written in `.ts`).
* **Correct**: `import { User } from "../models/user.model.js";`
* **Incorrect**: `import { User } from "../models/user.model";`

### 2. Request Params Type Casting
In Express, `req.params` values are typed as `string | string[] | undefined`. Always cast parameters to `string | undefined` using type assertion before performing operations like `toLowerCase()` or `trim()`.
* **Example**: `const orgSlug = req.params.orgSlug as string | undefined;`

### 3. Redux Store Access
Always use the custom hooks `useAppDispatch` and `useAppSelector` from `@/lib/store/store` in React components instead of default `useDispatch` / `useSelector` to preserve typed states.

### 4. Direct DOM / Window access in Next.js
Components in `app/dashboard` use client rendering (`"use client"`). When accessing `window` properties (e.g. `window.location.origin`), check `typeof window !== "undefined"` or verify you are running on the client side.

---

## 💡 Codebase Map & Key References

### User Management & Auth
* [user.model.ts](file:///home/bhargab/WebD/lead-management-crm/backend/src/models/user.model.ts): Defines roles (`admin` or `member`) and schemas.
* [auth.middleware.ts](file:///home/bhargab/WebD/lead-management-crm/backend/src/middlewares/auth.middleware.ts): Exports `authenticateUser` and `authorizeRoles`.
* [users/page.tsx](file:///home/bhargab/WebD/lead-management-crm/frontend/app/dashboard/users/page.tsx): Client-side path role protection.

### Lead Management Lifecycle
* [lead.model.ts](file:///home/bhargab/WebD/lead-management-crm/backend/src/models/lead.model.ts): Defines `LeadStatus` pipeline values (`new`, `contacted`, `qualified`, `proposal_sent`, `negotiation`, `won`, `lost`).
* [lead.controller.ts](file:///home/bhargab/WebD/lead-management-crm/backend/src/controllers/lead.controller.ts): Core controller for lead operations, reassignments, and creations.

### Notes & Activity Trails
* [note.model.ts](file:///home/bhargab/WebD/lead-management-crm/backend/src/models/note.model.ts): Stores lead notes with mongoose timestamps.
* [activity.model.ts](file:///home/bhargab/WebD/lead-management-crm/backend/src/models/activity.model.ts): Defines all tracked activity types (`LEAD_CREATED`, `STATUS_CHANGED`, etc.).
* [activity.js](file:///home/bhargab/WebD/lead-management-crm/backend/src/utils/activity.ts): Exported utility `logActivity` used in controllers to log operations.

### Public Forms
* [public/\[orgSlug\]/page.tsx](file:///home/bhargab/WebD/lead-management-crm/frontend/app/public/%5BorgSlug%5D/page.tsx): Form where anonymous prospects submit their information. Mapped to backend route `POST /api/leads/public/:orgSlug`.
