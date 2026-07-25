import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import {
    getLeads,
    createLead,
    updateLead,
    deleteLead,
    assignLead,
} from "@/lib/api/leads";
import type { Lead, CreateLeadPayload, UpdateLeadPayload, GetLeadsParams } from "@/lib/types";

export interface LeadsState {
    leads: Lead[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    } | null;
    loading: boolean;
    error: string | null;
}

const initialState: LeadsState = {
    leads: [],
    pagination: null,
    loading: false,
    error: null,
};

// Async Thunks
export const fetchLeads = createAsyncThunk(
    "leads/fetchLeads",
    async (params: GetLeadsParams | undefined, { rejectWithValue }) => {
        try {
            const response = await getLeads(params);
            return response.data;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            return rejectWithValue(
                err.response?.data?.message || err.message || "Failed to fetch leads"
            );
        }
    }
);

export const addNewLead = createAsyncThunk(
    "leads/addNewLead",
    async (payload: CreateLeadPayload, { rejectWithValue }) => {
        try {
            const response = await createLead(payload);
            return response.data;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            return rejectWithValue(
                err.response?.data?.message || err.message || "Failed to create lead"
            );
        }
    }
);

export const editLead = createAsyncThunk(
    "leads/editLead",
    async ({ id, payload }: { id: string; payload: UpdateLeadPayload }, { rejectWithValue }) => {
        try {
            const response = await updateLead(id, payload);
            return response.data;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            return rejectWithValue(
                err.response?.data?.message || err.message || "Failed to update lead"
            );
        }
    }
);

export const removeLead = createAsyncThunk(
    "leads/removeLead",
    async (id: string, { rejectWithValue }) => {
        try {
            await deleteLead(id);
            return id;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            return rejectWithValue(
                err.response?.data?.message || err.message || "Failed to delete lead"
            );
        }
    }
);

export const assignLeadToUser = createAsyncThunk(
    "leads/assignLeadToUser",
    async ({ id, userId }: { id: string; userId: string | null }, { rejectWithValue }) => {
        try {
            const response = await assignLead(id, userId);
            return response.data;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            return rejectWithValue(
                err.response?.data?.message || err.message || "Failed to assign lead"
            );
        }
    }
);

const leadsSlice = createSlice({
    name: "leads",
    initialState,
    reducers: {
        clearLeadsError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Fetch Leads
        builder.addCase(fetchLeads.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchLeads.fulfilled, (state, action) => {
            state.leads = action.payload.leads;
            state.pagination = action.payload.pagination;
            state.loading = false;
        });
        builder.addCase(fetchLeads.rejected, (state, action) => {
            state.error = action.payload as string;
            state.loading = false;
        });

        // Add New Lead
        builder.addCase(addNewLead.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(addNewLead.fulfilled, (state, action: PayloadAction<Lead>) => {
            state.leads.unshift(action.payload);
            state.loading = false;
        });
        builder.addCase(addNewLead.rejected, (state, action) => {
            state.error = action.payload as string;
            state.loading = false;
        });

        // Edit Lead
        builder.addCase(editLead.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(editLead.fulfilled, (state, action: PayloadAction<Lead>) => {
            const idx = state.leads.findIndex((l) => l._id === action.payload._id);
            if (idx !== -1) {
                state.leads[idx] = action.payload;
            }
            state.loading = false;
        });
        builder.addCase(editLead.rejected, (state, action) => {
            state.error = action.payload as string;
            state.loading = false;
        });

        // Remove Lead
        builder.addCase(removeLead.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(removeLead.fulfilled, (state, action: PayloadAction<string>) => {
            state.leads = state.leads.filter((l) => l._id !== action.payload);
            state.loading = false;
        });
        builder.addCase(removeLead.rejected, (state, action) => {
            state.error = action.payload as string;
            state.loading = false;
        });

        // Assign Lead
        builder.addCase(assignLeadToUser.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(assignLeadToUser.fulfilled, (state, action: PayloadAction<Lead>) => {
            const idx = state.leads.findIndex((l) => l._id === action.payload._id);
            if (idx !== -1) {
                state.leads[idx] = action.payload;
            }
            state.loading = false;
        });
        builder.addCase(assignLeadToUser.rejected, (state, action) => {
            state.error = action.payload as string;
            state.loading = false;
        });
    },
});

export const { clearLeadsError } = leadsSlice.actions;
export default leadsSlice.reducer;
