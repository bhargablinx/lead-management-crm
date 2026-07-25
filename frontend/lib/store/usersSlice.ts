import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { getUsers, createUser, updateUser, deleteUser } from "@/lib/api/users";
import type { User, CreateUserPayload, UpdateUserPayload, GetUsersParams } from "@/lib/types";

export interface UsersState {
    users: User[];
    loading: boolean;
    error: string | null;
}

const initialState: UsersState = {
    users: [],
    loading: false,
    error: null,
};

// Async Thunks
export const fetchUsers = createAsyncThunk(
    "users/fetchUsers",
    async (params: GetUsersParams | undefined, { rejectWithValue }) => {
        try {
            const response = await getUsers(params);
            return response.data;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            return rejectWithValue(
                err.response?.data?.message || err.message || "Failed to fetch users"
            );
        }
    }
);

export const addNewUser = createAsyncThunk(
    "users/addNewUser",
    async (payload: CreateUserPayload, { rejectWithValue }) => {
        try {
            const response = await createUser(payload);
            return response.data;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            return rejectWithValue(
                err.response?.data?.message || err.message || "Failed to create user"
            );
        }
    }
);

export const editUser = createAsyncThunk(
    "users/editUser",
    async ({ id, payload }: { id: string; payload: UpdateUserPayload }, { rejectWithValue }) => {
        try {
            const response = await updateUser(id, payload);
            return response.data;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            return rejectWithValue(
                err.response?.data?.message || err.message || "Failed to update user"
            );
        }
    }
);

export const removeUser = createAsyncThunk(
    "users/removeUser",
    async (id: string, { rejectWithValue }) => {
        try {
            await deleteUser(id);
            return id;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            return rejectWithValue(
                err.response?.data?.message || err.message || "Failed to delete user"
            );
        }
    }
);

const usersSlice = createSlice({
    name: "users",
    initialState,
    reducers: {
        clearUsersError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Fetch Users
        builder.addCase(fetchUsers.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
            state.users = action.payload;
            state.loading = false;
        });
        builder.addCase(fetchUsers.rejected, (state, action) => {
            state.error = action.payload as string;
            state.loading = false;
        });

        // Add New User
        builder.addCase(addNewUser.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(addNewUser.fulfilled, (state, action: PayloadAction<User>) => {
            state.users.unshift(action.payload);
            state.loading = false;
        });
        builder.addCase(addNewUser.rejected, (state, action) => {
            state.error = action.payload as string;
            state.loading = false;
        });

        // Edit User
        builder.addCase(editUser.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(editUser.fulfilled, (state, action: PayloadAction<User>) => {
            const idx = state.users.findIndex((u) => u._id === action.payload._id);
            if (idx !== -1) {
                state.users[idx] = action.payload;
            }
            state.loading = false;
        });
        builder.addCase(editUser.rejected, (state, action) => {
            state.error = action.payload as string;
            state.loading = false;
        });

        // Remove User
        builder.addCase(removeUser.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(removeUser.fulfilled, (state, action: PayloadAction<string>) => {
            state.users = state.users.filter((u) => u._id !== action.payload);
            state.loading = false;
        });
        builder.addCase(removeUser.rejected, (state, action) => {
            state.error = action.payload as string;
            state.loading = false;
        });
    },
});

export const { clearUsersError } = usersSlice.actions;
export default usersSlice.reducer;
