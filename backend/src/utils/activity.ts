import { Activity, type ActivityType } from "../models/activity.model.js";
import { type Types } from "mongoose";

export interface LogActivityParams {
    organizationId: Types.ObjectId;
    leadId: Types.ObjectId;
    userId: Types.ObjectId;
    type: ActivityType;
    description: string;
    metadata?: Record<string, unknown>;
}

export const logActivity = async (params: LogActivityParams): Promise<void> => {
    try {
        await Activity.create({
            organizationId: params.organizationId,
            leadId: params.leadId,
            userId: params.userId,
            type: params.type,
            description: params.description,
            metadata: params.metadata || {},
        });
    } catch (error) {
        console.error("Failed to log activity:", error);
    }
};
