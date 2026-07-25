import api from "@/lib/axios";
import type {
    ApiResponse,
    User,
    CreateUserPayload,
    UpdateUserPayload,
    GetUsersParams,
} from "@/lib/types";

//  * Creates a new user in the organization. (Admin only)
export async function createUser(payload: CreateUserPayload): Promise<ApiResponse<User>> {
    const response = await api.post<ApiResponse<User>>("/users", payload);
    return response.data;
}

//  * Retrieves a list of users belonging to the same organization. (Admin only)
export async function getUsers(params?: GetUsersParams): Promise<ApiResponse<User[]>> {
    const response = await api.get<ApiResponse<User[]>>("/users", { params });
    return response.data;
}

//  * Retrieves a single user's profile details.
export async function getUserById(id: string): Promise<ApiResponse<User>> {
    const response = await api.get<ApiResponse<User>>(`/users/${id}`);
    return response.data;
}

//  * Updates a user's profile details or status.
export async function updateUser(id: string, payload: UpdateUserPayload): Promise<ApiResponse<User>> {
    const response = await api.patch<ApiResponse<User>>(`/users/${id}`, payload);
    return response.data;
}

//  * Deletes a user by ID. (Admin only)
export async function deleteUser(id: string): Promise<ApiResponse<null>> {
    const response = await api.delete<ApiResponse<null>>(`/users/${id}`);
    return response.data;
}
