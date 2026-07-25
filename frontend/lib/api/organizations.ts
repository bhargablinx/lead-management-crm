import api from "@/lib/axios";
import type {
    ApiResponse,
    Organization,
    CreateOrganizationPayload,
    UpdateOrganizationPayload,
} from "@/lib/types";

//  * Creates a new organization. (Public endpoint, usually handled automatically by registration)
export async function createOrganization(payload: CreateOrganizationPayload): Promise<ApiResponse<Organization>> {
    const response = await api.post<ApiResponse<Organization>>("/organizations", payload);
    return response.data;
}

//  * Retrieves the current user's organization profile.
export async function getOrganization(): Promise<ApiResponse<Organization>> {
    const response = await api.get<ApiResponse<Organization>>("/organizations");
    return response.data;
}

//  * Updates the current organization settings. (Admin only)
export async function updateOrganization(payload: UpdateOrganizationPayload): Promise<ApiResponse<Organization>> {
    const response = await api.patch<ApiResponse<Organization>>("/organizations", payload);
    return response.data;
}

//  * Deletes the current organization and all associated data. (Admin only)
export async function deleteOrganization(): Promise<ApiResponse<null>> {
    const response = await api.delete<ApiResponse<null>>("/organizations");
    return response.data;
}
