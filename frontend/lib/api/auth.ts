import api from "@/lib/axios";
import type {
    ApiResponse,
    RegisterPayload,
    RegisterResponseData,
    LoginPayload,
    LoginResponseData,
    User,
} from "@/lib/types";

//  Registers a new organization along with an administrator user account.
export async function register(payload: RegisterPayload): Promise<ApiResponse<RegisterResponseData>> {
    const response = await api.post<ApiResponse<RegisterResponseData>>("/auth/register", payload);
    return response.data;
}

//  Log in a user with email and password credentials.
export async function login(payload: LoginPayload): Promise<ApiResponse<LoginResponseData>> {
    const response = await api.post<ApiResponse<LoginResponseData>>("/auth/login", payload);
    return response.data;
}

//  Logs out the currently authenticated user by clearing the access and refresh tokens.
export async function logout(): Promise<ApiResponse<null>> {
    const response = await api.post<ApiResponse<null>>("/auth/logout");
    return response.data;
}

//  Retrieves the current authenticated user's profile details.
export async function getCurrentUser(): Promise<ApiResponse<User>> {
    const response = await api.get<ApiResponse<User>>("/auth/me");
    return response.data;
}
