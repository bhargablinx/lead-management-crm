// Core API Response Wrapper
export interface ApiResponse<T> {
    success: boolean;
    statusCode: number;
    message: string;
    data: T;
}

// User-related Types
export type UserRole = "admin" | "member";

export interface User {
    _id: string;
    organizationId: string;
    name: string;
    email: string;
    role: UserRole;
    isActive: boolean;
    lastLogin?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateUserPayload {
    name: string;
    email: string;
    password: Required<string> | string;
    role?: UserRole;
}

export interface UpdateUserPayload {
    name?: string;
    email?: string;
    password?: string;
    role?: UserRole;
    isActive?: boolean;
}

export interface GetUsersParams {
    role?: UserRole;
    isActive?: boolean | string;
    search?: string;
}

// Organization-related Types
export interface Organization {
    _id: string;
    name: string;
    slug: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateOrganizationPayload {
    name: string;
    slug: string;
}

export interface UpdateOrganizationPayload {
    name?: string;
    slug?: string;
    isActive?: boolean;
}

// Lead-related Types
export type LeadStatus =
    | "new"
    | "contacted"
    | "qualified"
    | "proposal_sent"
    | "negotiation"
    | "won"
    | "lost";

export interface Lead {
    _id: string;
    organizationId: string;
    assignedTo?: {
        _id: string;
        name: string;
        email: string;
        role: UserRole;
    } | string | null;
    firstName: string;
    lastName?: string;
    email: string;
    phone?: string;
    company?: string;
    source?: string;
    status: LeadStatus;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateLeadPayload {
    firstName: string;
    lastName?: string;
    email: string;
    phone?: string;
    company?: string;
    source?: string;
    status?: LeadStatus;
    assignedTo?: string | null;
    notes?: string;
}

export interface UpdateLeadPayload {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    company?: string;
    source?: string;
    status?: LeadStatus;
    assignedTo?: string | null;
    notes?: string;
}

export interface GetLeadsParams {
    status?: LeadStatus;
    assignedTo?: string;
    source?: string;
    search?: string;
    sort?: string;
    page?: number | string;
    limit?: number | string;
}

export interface PaginatedLeadsResponse {
    leads: Lead[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}

// Note-related Types
export interface Note {
    _id: string;
    organizationId: string;
    leadId: string;
    authorId: {
        _id: string;
        name: string;
        email: string;
        role: UserRole;
    } | string;
    content: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateNotePayload {
    content: string;
}

export interface UpdateNotePayload {
    content: string;
}

// Activity-related Types
export type ActivityType =
    | "lead_created"
    | "lead_updated"
    | "status_changed"
    | "lead_assigned"
    | "note_added"
    | "note_updated"
    | "note_deleted"
    | "lead_deleted";

export interface Activity {
    _id: string;
    organizationId: string;
    leadId: {
        _id: string;
        firstName: string;
        lastName?: string;
        email: string;
    } | string;
    userId: {
        _id: string;
        name: string;
        email: string;
        role: UserRole;
    } | string;
    type: ActivityType;
    description: string;
    metadata?: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
}

// Auth-specific Payloads and Response data
export interface RegisterPayload {
    orgName: string;
    orgSlug: string;
    name: string;
    email: string;
    password: Required<string> | string;
}

export interface LoginPayload {
    email: string;
    password: Required<string> | string;
}

export interface RegisterResponseData {
    user: Omit<User, "password">;
    organization: Organization;
    accessToken: string;
    refreshToken: string;
}

export interface LoginResponseData {
    user: Omit<User, "password">;
}

export interface PublicLeadPayload {
    firstName: string;
    lastName?: string;
    email: string;
    phone?: string;
    company?: string;
    notes?: string;
}
