# Lead Management CRM API Documentation

This document contains specifications for the Lead Management CRM REST API.

---

## 🔑 Global Specifications

### Base URL
```
http://localhost:8000/api/v1
```

### Authentication
Authentication is handled using JSON Web Tokens (JWT). The API checks for the token in two places:
1. Cookie: `accessToken`
2. Authorization Header: `Bearer <JWT_TOKEN>`

---

### 📦 Standard Response Wrappers

All successful API responses return a status code and follow this format:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success message details",
  "data": { ... }
}
```

All error responses return a status code and follow this format:
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error details",
  "error": "Bad Request",
  "errors": []
}
```

---

### 🛡️ RBAC Permissions Matrix

| Endpoint | Method | Authentication Required | Allowed Roles | Description |
|---|---|---|---|---|
| `/auth/register` | `POST` | No | Public | Register new Tenant Org and Admin User |
| `/auth/login` | `POST` | No | Public | Authenticate user and set cookies |
| `/auth/logout` | `POST` | Yes | All | Clear active JWT cookies |
| `/auth/me` | `GET` | Yes | All | Get current user's profile |
| `/organizations` | `GET` | Yes | All | Get organization details |
| `/organizations` | `PATCH` | Yes | Admin | Update organization settings |
| `/organizations` | `DELETE` | Yes | Admin | Permanent deletion of organization |
| `/users` | `POST` | Yes | Admin | Create a new user (Member or Admin) |
| `/users` | `GET` | Yes | Admin | List all organization members |
| `/users/:id` | `GET` | Yes | Admin, Self | Get user profile by ID |
| `/users/:id` | `PATCH` | Yes | Admin, Self | Update user details (status/role is Admin-only) |
| `/users/:id` | `DELETE` | Yes | Admin | Delete user (cannot delete self) |
| `/leads` | `POST` | Yes | All | Create a lead |
| `/leads` | `GET` | Yes | All | List leads (Members only see assigned leads) |
| `/leads/:id` | `GET` | Yes | Admin, Assignee | Get lead by ID |
| `/leads/:id` | `PATCH` | Yes | Admin, Assignee | Update lead (Members cannot reassign) |
| `/leads/:id` | `DELETE` | Yes | Admin | Delete lead and all notes/activities |
| `/leads/:id/assign` | `PATCH` | Yes | Admin | Assign/reassign lead to a user |
| `/leads/:id/notes` | `POST` | Yes | Admin, Assignee | Add a note to a lead |
| `/leads/:id/notes` | `GET` | Yes | Admin, Assignee | Get all notes for a lead |
| `/notes/:id` | `PATCH` | Yes | Owner | Update note content |
| `/notes/:id` | `DELETE` | Yes | Owner, Admin | Delete note |
| `/leads/:id/activities` | `GET` | Yes | Admin, Assignee | Get activities timeline for a lead |
| `/activities` | `GET` | Yes | All | List activities (Members see assigned-only) |
| `/health` | `GET` | No | Public | Health status check |

---

## 🚀 Endpoint Reference

### 🔐 1. Authentication

#### Register Organization & Admin
*   **Method**: `POST`
*   **Path**: `/auth/register`
*   **Request Body**:
    ```json
    {
      "orgName": "Acme Corp",
      "orgSlug": "acme",
      "name": "Jane Doe",
      "email": "jane@acme.com",
      "password": "securepassword123"
    }
    ```
*   **Response (201 Created)**:
    ```json
    {
      "success": true,
      "statusCode": 201,
      "message": "Registration successful",
      "data": {
        "user": {
          "_id": "60d0fe4f5311236168a109ca",
          "organizationId": "60d0fe4f5311236168a109c9",
          "name": "Jane Doe",
          "email": "jane@acme.com",
          "role": "admin",
          "isActive": true,
          "createdAt": "2026-07-25T11:00:00.000Z",
          "updatedAt": "2026-07-25T11:00:00.000Z"
        },
        "organization": {
          "_id": "60d0fe4f5311236168a109c9",
          "name": "Acme Corp",
          "slug": "acme",
          "isActive": true,
          "createdAt": "2026-07-25T11:00:00.000Z",
          "updatedAt": "2026-07-25T11:00:00.000Z"
        },
        "accessToken": "eyJhbGciOi...",
        "refreshToken": "eyJhbGciOi..."
      }
    }
    ```

#### Login
*   **Method**: `POST`
*   **Path**: `/auth/login`
*   **Request Body**:
    ```json
    {
      "email": "jane@acme.com",
      "password": "securepassword123"
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Login successful",
      "data": {
        "user": {
          "_id": "60d0fe4f5311236168a109ca",
          "organizationId": "60d0fe4f5311236168a109c9",
          "name": "Jane Doe",
          "email": "jane@acme.com",
          "role": "admin",
          "isActive": true,
          "lastLogin": "2026-07-25T11:05:00.000Z",
          "createdAt": "2026-07-25T11:00:00.000Z",
          "updatedAt": "2026-07-25T11:05:00.000Z"
        },
        "accessToken": "eyJhbGciOi..."
      }
    }
    ```

#### Logout
*   **Method**: `POST`
*   **Path**: `/auth/logout`
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Logged out successfully",
      "data": null
    }
    ```

#### Get Current User Profile
*   **Method**: `GET`
*   **Path**: `/auth/me`
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Current user retrieved successfully",
      "data": {
        "_id": "60d0fe4f5311236168a109ca",
        "organizationId": "60d0fe4f5311236168a109c9",
        "name": "Jane Doe",
        "email": "jane@acme.com",
        "role": "admin",
        "isActive": true,
        "createdAt": "2026-07-25T11:00:00.000Z",
        "updatedAt": "2026-07-25T11:05:00.000Z"
      }
    }
    ```

---

### 🏢 2. Organization Management

#### Get Organization details
*   **Method**: `GET`
*   **Path**: `/organizations`
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Organization retrieved successfully",
      "data": {
        "_id": "60d0fe4f5311236168a109c9",
        "name": "Acme Corp",
        "slug": "acme",
        "isActive": true,
        "createdAt": "2026-07-25T11:00:00.000Z",
        "updatedAt": "2026-07-25T11:00:00.000Z"
      }
    }
    ```

#### Update Organization settings
*   **Method**: `PATCH`
*   **Path**: `/organizations`
*   **Request Body** (All fields optional):
    ```json
    {
      "name": "Acme Corporation Inc.",
      "slug": "acme-corp"
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Organization updated successfully",
      "data": {
        "_id": "60d0fe4f5311236168a109c9",
        "name": "Acme Corporation Inc.",
        "slug": "acme-corp",
        "isActive": true,
        "createdAt": "2026-07-25T11:00:00.000Z",
        "updatedAt": "2026-07-25T11:15:00.000Z"
      }
    }
    ```

---

### 👥 3. User Management

#### Create User (Admin Only)
*   **Method**: `POST`
*   **Path**: `/users`
*   **Request Body**:
    ```json
    {
      "name": "John Member",
      "email": "john@acme.com",
      "password": "securememberpass",
      "role": "member"
    }
    ```
*   **Response (201 Created)**:
    ```json
    {
      "success": true,
      "statusCode": 201,
      "message": "User created successfully",
      "data": {
        "_id": "60d0fed65311236168a109ce",
        "organizationId": "60d0fe4f5311236168a109c9",
        "name": "John Member",
        "email": "john@acme.com",
        "role": "member",
        "isActive": true,
        "createdAt": "2026-07-25T11:20:00.000Z",
        "updatedAt": "2026-07-25T11:20:00.000Z"
      }
    }
    ```

#### List Organization Users (Admin Only)
*   **Method**: `GET`
*   **Path**: `/users`
*   **Query Parameters**:
    *   `role` (Optional): "admin" or "member"
    *   `isActive` (Optional): "true" or "false"
    *   `search` (Optional): Matches name or email (regex match)
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Users retrieved successfully",
      "data": [
        {
          "_id": "60d0fed65311236168a109ce",
          "organizationId": "60d0fe4f5311236168a109c9",
          "name": "John Member",
          "email": "john@acme.com",
          "role": "member",
          "isActive": true
        }
      ]
    }
    ```

#### Update User
*   **Method**: `PATCH`
*   **Path**: `/users/:id`
*   **Request Body** (All fields optional):
    ```json
    {
      "name": "John F. Member",
      "password": "newpassword123"
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "User updated successfully",
      "data": {
        "_id": "60d0fed65311236168a109ce",
        "organizationId": "60d0fe4f5311236168a109c9",
        "name": "John F. Member",
        "email": "john@acme.com",
        "role": "member",
        "isActive": true
      }
    }
    ```

---

### 📈 4. Lead Management

#### Create Lead
*   **Method**: `POST`
*   **Path**: `/leads`
*   **Request Body**:
    ```json
    {
      "firstName": "Mark",
      "lastName": "Spencer",
      "email": "mark@spencer.com",
      "phone": "+1234567890",
      "company": "Spencer Media",
      "source": "Website",
      "notes": "Interested in premium subscription package."
    }
    ```
*   **Response (201 Created)**:
    ```json
    {
      "success": true,
      "statusCode": 201,
      "message": "Lead created successfully",
      "data": {
        "_id": "60d100345311236168a109da",
        "organizationId": "60d0fe4f5311236168a109c9",
        "assignedTo": null,
        "firstName": "Mark",
        "lastName": "Spencer",
        "email": "mark@spencer.com",
        "phone": "+1234567890",
        "company": "Spencer Media",
        "source": "Website",
        "status": "new",
        "notes": "Interested in premium subscription package.",
        "createdAt": "2026-07-25T11:30:00.000Z",
        "updatedAt": "2026-07-25T11:30:00.000Z"
      }
    }
    ```

#### List Leads
*   **Method**: `GET`
*   **Path**: `/leads`
*   **Query Parameters** (All optional):
    *   `status`: "new", "contacted", "qualified", "proposal_sent", "negotiation", "won", "lost"
    *   `assignedTo`: ObjectId string of assignee
    *   `source`: Lead origin channel (e.g. "Website")
    *   `search`: Search string (searches first name, last name, email, company)
    *   `sort`: field name (prefix with `-` for descending, e.g. `-createdAt`)
    *   `page`: Page number (default: `1`)
    *   `limit`: Items per page (default: `10`)
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Leads retrieved successfully",
      "data": {
        "leads": [
          {
            "_id": "60d100345311236168a109da",
            "organizationId": "60d0fe4f5311236168a109c9",
            "firstName": "Mark",
            "lastName": "Spencer",
            "email": "mark@spencer.com",
            "status": "new",
            "assignedTo": null
          }
        ],
        "pagination": {
          "total": 1,
          "page": 1,
          "limit": 10,
          "pages": 1
        }
      }
    }
    ```

#### Update Lead
*   **Method**: `PATCH`
*   **Path**: `/leads/:id`
*   **Request Body** (All fields optional):
    ```json
    {
      "status": "contacted",
      "phone": "+1987654321"
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Lead updated successfully",
      "data": {
        "_id": "60d100345311236168a109da",
        "firstName": "Mark",
        "lastName": "Spencer",
        "email": "mark@spencer.com",
        "phone": "+1987654321",
        "status": "contacted"
      }
    }
    ```

#### Assign Lead (Admin Only)
*   **Method**: `PATCH`
*   **Path**: `/leads/:id/assign`
*   **Request Body**:
    ```json
    {
      "userId": "60d0fed65311236168a109ce"
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Lead assigned successfully",
      "data": {
        "_id": "60d100345311236168a109da",
        "assignedTo": "60d0fed65311236168a109ce"
      }
    }
    ```

---

### 📝 5. Note Management

#### Add Lead Note
*   **Method**: `POST`
*   **Path**: `/leads/:id/notes`
*   **Request Body**:
    ```json
    {
      "content": "Followed up via phone. Interested in setting up a demo."
    }
    ```
*   **Response (210 Created)**:
    ```json
    {
      "success": true,
      "statusCode": 201,
      "message": "Note created successfully",
      "data": {
        "_id": "60d1012f5311236168a109e2",
        "organizationId": "60d0fe4f5311236168a109c9",
        "leadId": "60d100345311236168a109da",
        "content": "Followed up via phone. Interested in setting up a demo.",
        "authorId": {
          "_id": "60d0fe4f5311236168a109ca",
          "name": "Jane Doe",
          "email": "jane@acme.com",
          "role": "admin"
        },
        "createdAt": "2026-07-25T11:45:00.000Z",
        "updatedAt": "2026-07-25T11:45:00.000Z"
      }
    }
    ```

#### List Lead Notes
*   **Method**: `GET`
*   **Path**: `/leads/:id/notes`
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Notes retrieved successfully",
      "data": [
        {
          "_id": "60d1012f5311236168a109e2",
          "content": "Followed up via phone. Interested in setting up a demo.",
          "authorId": {
            "_id": "60d0fe4f5311236168a109ca",
            "name": "Jane Doe",
            "email": "jane@acme.com",
            "role": "admin"
          }
        }
      ]
    }
    ```

#### Update Note Content
*   **Method**: `PATCH`
*   **Path**: `/notes/:id`
*   **Request Body**:
    ```json
    {
      "content": "Updated content: Followed up via phone. Demo scheduled for Tuesday."
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Note updated successfully",
      "data": {
        "_id": "60d1012f5311236168a109e2",
        "content": "Updated content: Followed up via phone. Demo scheduled for Tuesday.",
        "authorId": {
          "_id": "60d0fe4f5311236168a109ca",
          "name": "Jane Doe",
          "email": "jane@acme.com"
        }
      }
    }
    ```

---

### ⏱️ 6. Activity Timeline

#### Get Lead Activities
*   **Method**: `GET`
*   **Path**: `/leads/:id/activities`
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Lead activities retrieved successfully",
      "data": [
        {
          "_id": "60d100d05311236168a109df",
          "organizationId": "60d0fe4f5311236168a109c9",
          "leadId": "60d100345311236168a109da",
          "userId": {
            "_id": "60d0fe4f5311236168a109ca",
            "name": "Jane Doe",
            "role": "admin"
          },
          "type": "status_changed",
          "description": "Status changed from new to contacted",
          "metadata": {
            "previousStatus": "new",
            "newStatus": "contacted"
          },
          "createdAt": "2026-07-25T11:40:00.000Z"
        }
      ]
    }
    ```

#### Get Organization-wide Activities
*   **Method**: `GET`
*   **Path**: `/activities`
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Organization activities retrieved successfully",
      "data": [
        {
          "_id": "60d100d05311236168a109df",
          "type": "status_changed",
          "description": "Status changed from new to contacted",
          "userId": {
            "_id": "60d0fe4f5311236168a109ca",
            "name": "Jane Doe"
          },
          "leadId": {
            "_id": "60d100345311236168a109da",
            "firstName": "Mark",
            "lastName": "Spencer"
          }
        }
      ]
    }
    ```

---

### 🏥 7. Health Check

#### Application Health Status
*   **Method**: `GET`
*   **Path**: `/health`
*   **Response (200 OK)**:
    ```json
    {
      "message": "ok"
    }
    ```
