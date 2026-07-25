import api from "@/lib/axios";
import type {
    ApiResponse,
    Lead,
    CreateLeadPayload,
    UpdateLeadPayload,
    GetLeadsParams,
    PaginatedLeadsResponse,
    Note,
    CreateNotePayload,
    Activity,
    PublicLeadPayload,
} from "@/lib/types";

//  * Retrieves a list of leads belonging to the user's organization, with optional filters, search, sorting, and pagination.
export async function getLeads(params?: GetLeadsParams): Promise<ApiResponse<PaginatedLeadsResponse>> {
    const response = await api.get<ApiResponse<PaginatedLeadsResponse>>("/leads", { params });
    return response.data;
}

//  * Retrieves a single lead's details by ID.
export async function getLeadById(id: string): Promise<ApiResponse<Lead>> {
    const response = await api.get<ApiResponse<Lead>>(`/leads/${id}`);
    return response.data;
}

//  * Creates a new lead in the organization.
export async function createLead(payload: CreateLeadPayload): Promise<ApiResponse<Lead>> {
    const response = await api.post<ApiResponse<Lead>>("/leads", payload);
    return response.data;
}

//  * Updates an existing lead's details.
export async function updateLead(id: string, payload: UpdateLeadPayload): Promise<ApiResponse<Lead>> {
    const response = await api.patch<ApiResponse<Lead>>(`/leads/${id}`, payload);
    return response.data;
}

//  * Deletes a lead and all associated notes/activities. (Admin only)
export async function deleteLead(id: string): Promise<ApiResponse<null>> {
    const response = await api.delete<ApiResponse<null>>(`/leads/${id}`);
    return response.data;
}

//  * Assigns or reassigns a lead to a user. (Admin only)
export async function assignLead(id: string, userId: string | null): Promise<ApiResponse<Lead>> {
    const response = await api.patch<ApiResponse<Lead>>(`/leads/${id}/assign`, { userId });
    return response.data;
}

//  * Retrieves all notes associated with a specific lead.
export async function getLeadNotes(id: string): Promise<ApiResponse<Note[]>> {
    const response = await api.get<ApiResponse<Note[]>>(`/leads/${id}/notes`);
    return response.data;
}

//  * Creates a new note for a specific lead.
export async function createLeadNote(id: string, payload: CreateNotePayload): Promise<ApiResponse<Note>> {
    const response = await api.post<ApiResponse<Note>>(`/leads/${id}/notes`, payload);
    return response.data;
}

//  * Retrieves all activity history associated with a specific lead.
export async function getLeadActivities(id: string): Promise<ApiResponse<Activity[]>> {
    const response = await api.get<ApiResponse<Activity[]>>(`/leads/${id}/activities`);
    return response.data;
}

/**
 * Submits a public lead form on behalf of a specific organization.
 * @param orgSlug The organization slug
 * @param payload The public lead submission details
 */
export async function submitPublicLead(
    orgSlug: string,
    payload: PublicLeadPayload
): Promise<ApiResponse<Lead>> {
    const response = await api.post<ApiResponse<Lead>>(`/leads/public/${orgSlug}`, payload);
    return response.data;
}
