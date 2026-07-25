import { Schema, model, Document, Types } from "mongoose";

export enum LeadStatus {
    NEW = "new",
    CONTACTED = "contacted",
    QUALIFIED = "qualified",
    PROPOSAL_SENT = "proposal_sent",
    NEGOTIATION = "negotiation",
    WON = "won",
    LOST = "lost",
}

export interface ILead extends Document {
    organizationId: Types.ObjectId;
    assignedTo?: Types.ObjectId;

    firstName: string;
    lastName?: string;
    email: string;
    phone?: string;
    company?: string;
    source?: string;

    status: LeadStatus;
    notes?: string;

    createdAt: Date;
    updatedAt: Date;
}

const leadSchema = new Schema<ILead>(
    {
        organizationId: {
            type: Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
            index: true,
        },

        assignedTo: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
            index: true,
        },

        firstName: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },

        lastName: {
            type: String,
            trim: true,
            maxlength: 100,
        },

        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            index: true,
        },

        phone: {
            type: String,
            trim: true,
        },

        company: {
            type: String,
            trim: true,
        },

        source: {
            type: String,
            trim: true,
        },

        status: {
            type: String,
            enum: Object.values(LeadStatus),
            default: LeadStatus.NEW,
            index: true,
        },

        notes: {
            type: String,
            trim: true,
            maxlength: 5000,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// Helpful indexes
leadSchema.index({ organizationId: 1, status: 1 });
leadSchema.index({ organizationId: 1, assignedTo: 1 });
leadSchema.index({ organizationId: 1, createdAt: -1 });

export const Lead = model<ILead>("Lead", leadSchema);