import api from "@/lib/axios";
import type { ApiResponse, Activity } from "@/lib/types";

//  Retrieves the activities associated with the user's organization.
//  Filters activities by user role permissions automatically on the backend.
export async function getActivities(): Promise<ApiResponse<Activity[]>> {
    const response = await api.get<ApiResponse<Activity[]>>("/activities");
    return response.data;
}
