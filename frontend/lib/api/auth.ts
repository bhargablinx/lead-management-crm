import api from "@/lib/axios";

// User roles definition
export type UserRole = "admin" | "member";

// Interfaces for user and organization details
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

export interface Organization {
    _id: string;
    name: string;
    slug: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// Interfaces for request payloads
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

// Interfaces for api responses
export interface ApiResponse<T> {
    success: boolean;
    statusCode: number;
    message: string;
    data: T;
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

/**
 * Registers a new organization along with an administrator user account.
 * @param payload The registration details (orgName, orgSlug, name, email, password)
 */
export async function register(payload: RegisterPayload): Promise<ApiResponse<RegisterResponseData>> {
    const response = await api.post<ApiResponse<RegisterResponseData>>("/auth/register", payload);
    return response.data;
}

/**
 * Log in a user with email and password credentials.
 * @param payload User credentials (email, password)
 */
export async function login(payload: LoginPayload): Promise<ApiResponse<LoginResponseData>> {
    const response = await api.post<ApiResponse<LoginResponseData>>("/auth/login", payload);
    return response.data;
}

/**
 * Logs out the currently authenticated user by clearing the access and refresh tokens.
 */
export async function logout(): Promise<ApiResponse<null>> {
    const response = await api.post<ApiResponse<null>>("/auth/logout");
    return response.data;
}

/**
 * Retrieves the current authenticated user's profile details.
 */
export async function getCurrentUser(): Promise<ApiResponse<User>> {
    const response = await api.get<ApiResponse<User>>("/auth/me");
    return response.data;
}
