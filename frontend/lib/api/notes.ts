import api from "@/lib/axios";
import type { ApiResponse, Note, UpdateNotePayload } from "@/lib/types";

//  * Updates the content of an existing note. (Author only)

export async function updateNote(id: string, payload: UpdateNotePayload): Promise<ApiResponse<Note>> {
    const response = await api.patch<ApiResponse<Note>>(`/notes/${id}`, payload);
    return response.data;
}

//  * Deletes a note by ID. (Author or Admin only)
export async function deleteNote(id: string): Promise<ApiResponse<null>> {
    const response = await api.delete<ApiResponse<null>>(`/notes/${id}`);
    return response.data;
}
