import { Schema, model, Document, Types } from "mongoose";

export enum ActivityType {
    LEAD_CREATED = "lead_created",
    LEAD_UPDATED = "lead_updated",
    STATUS_CHANGED = "status_changed",
    LEAD_ASSIGNED = "lead_assigned",
    NOTE_ADDED = "note_added",
    NOTE_UPDATED = "note_updated",
    NOTE_DELETED = "note_deleted",
    LEAD_DELETED = "lead_deleted",
}

export interface IActivity extends Document {
    organizationId: Types.ObjectId;
    leadId: Types.ObjectId;
    userId: Types.ObjectId;

    type: ActivityType;
    description: string;

    metadata?: Record<string, unknown>;

    createdAt: Date;
    updatedAt: Date;
}

const activitySchema = new Schema<IActivity>(
    {
        organizationId: {
            type: Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
            index: true,
        },

        leadId: {
            type: Schema.Types.ObjectId,
            ref: "Lead",
            required: true,
            index: true,
        },

        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        type: {
            type: String,
            enum: Object.values(ActivityType),
            required: true,
            index: true,
        },

        description: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500,
        },

        metadata: {
            type: Schema.Types.Mixed,
            default: {},
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

activitySchema.index({ leadId: 1, createdAt: -1 });
activitySchema.index({ organizationId: 1, createdAt: -1 });

export const Activity = model<IActivity>(
    "Activity",
    activitySchema
);