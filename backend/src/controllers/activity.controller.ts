import { Activity } from "../models/activity.model.js";
import { Lead } from "../models/lead.model.js";
import { UserRole } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler, validateObjectId } from "../utils/utils.js";
import type { Request, Response } from "express";

export const getLeadActivities = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        throw new ApiError({
            message: "Not authenticated",
            statusCode: 401,
            error: "Unauthorized",
        });
    }

    const leadId = validateObjectId(req.params.id as string | undefined, "Lead ID");
    const orgId = req.user.organizationId;

    const lead = await Lead.findOne({ _id: leadId, organizationId: orgId });
    if (!lead) {
        throw new ApiError({
            message: "Lead not found",
            statusCode: 404,
            error: "Not Found",
        });
    }

    if (req.user.role === UserRole.MEMBER && (!lead.assignedTo || lead.assignedTo.toString() !== req.user._id.toString())) {
        throw new ApiError({
            message: "You are not authorized to view activities for this lead",
            statusCode: 403,
            error: "Forbidden",
        });
    }

    const activities = await Activity.find({ leadId, organizationId: orgId })
        .sort({ createdAt: -1 })
        .populate("userId", "name email role");

    res.status(200).json(
        new ApiResponse({
            statusCode: 200,
            message: "Lead activities retrieved successfully",
            data: activities,
        })
    );
});

export const getOrganizationActivities = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        throw new ApiError({
            message: "Not authenticated",
            statusCode: 401,
            error: "Unauthorized",
        });
    }

    const orgId = req.user.organizationId;
    const query: any = { organizationId: orgId };

    if (req.user.role === UserRole.MEMBER) {
        const leadIds = await Lead.find({ organizationId: orgId, assignedTo: req.user._id }).distinct("_id");
        query.leadId = { $in: leadIds };
    }

    const activities = await Activity.find(query)
        .sort({ createdAt: -1 })
        .populate("userId", "name email role")
        .populate("leadId", "firstName lastName email");

    res.status(200).json(
        new ApiResponse({
            statusCode: 200,
            message: "Organization activities retrieved successfully",
            data: activities,
        })
    );
});
