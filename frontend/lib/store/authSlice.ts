import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { getCurrentUser, login, register, logout } from "@/lib/api/auth";
import type { User, LoginPayload, RegisterPayload } from "@/lib/types";

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    loading: true, // Start as true since we check auth immediately on mount
    error: null,
};

// Async Thunks
export const checkAuth = createAsyncThunk("auth/checkAuth", async (_, { rejectWithValue }) => {
    try {
        const response = await getCurrentUser();
        return response.data;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        // Session check failed, meaning no valid active session
        return rejectWithValue(
            err.response?.data?.message || err.message || "Failed to retrieve user session"
        );
    }
});

export const loginUser = createAsyncThunk(
    "auth/loginUser",
    async (payload: LoginPayload, { rejectWithValue }) => {
        try {
            const response = await login(payload);
            return response.data.user;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            return rejectWithValue(
                err.response?.data?.message || err.message || "Login failed"
            );
        }
    }
);

export const registerUser = createAsyncThunk(
    "auth/registerUser",
    async (payload: RegisterPayload, { rejectWithValue }) => {
        try {
            const response = await register(payload);
            return response.data.user;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            return rejectWithValue(
                err.response?.data?.message || err.message || "Registration failed"
            );
        }
    }
);

export const logoutUser = createAsyncThunk("auth/logoutUser", async (_, { rejectWithValue }) => {
    try {
        await logout();
        return null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        return rejectWithValue(
            err.response?.data?.message || err.message || "Logout failed"
        );
    }
});

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        clearError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Check Auth
        builder.addCase(checkAuth.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(checkAuth.fulfilled, (state, action: PayloadAction<User>) => {
            state.user = action.payload;
            state.isAuthenticated = true;
            state.loading = false;
        });
        builder.addCase(checkAuth.rejected, (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.loading = false;
        });

        // Login User
        builder.addCase(loginUser.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(loginUser.fulfilled, (state, action: PayloadAction<User>) => {
            state.user = action.payload;
            state.isAuthenticated = true;
            state.loading = false;
        });
        builder.addCase(loginUser.rejected, (state, action) => {
            state.error = action.payload as string;
            state.loading = false;
        });

        // Register User
        builder.addCase(registerUser.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(registerUser.fulfilled, (state, action: PayloadAction<User>) => {
            state.user = action.payload;
            state.isAuthenticated = true;
            state.loading = false;
        });
        builder.addCase(registerUser.rejected, (state, action) => {
            state.error = action.payload as string;
            state.loading = false;
        });

        // Logout User
        builder.addCase(logoutUser.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(logoutUser.fulfilled, (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.loading = false;
        });
        builder.addCase(logoutUser.rejected, (state, action) => {
            state.error = action.payload as string;
            state.loading = false;
        });
    },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
