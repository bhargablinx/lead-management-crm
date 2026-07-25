import { Lead, LeadStatus } from "../models/lead.model.js";
import { User, UserRole } from "../models/user.model.js";
import { Types } from "mongoose";
import { Note } from "../models/note.model.js";
import { Activity, ActivityType } from "../models/activity.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler, validateObjectId } from "../utils/utils.js";
import { logActivity } from "../utils/activity.js";
import type { Request, Response } from "express";

export const createLead = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        throw new ApiError({
            message: "Not authenticated",
            statusCode: 401,
            error: "Unauthorized",
        });
    }

    const orgId = req.user.organizationId;
    const { firstName, lastName, email, phone, company, source, status, assignedTo, notes } = req.body;

    if (!firstName || !email) {
        throw new ApiError({
            message: "First name and email are required",
            statusCode: 400,
            error: "Bad Request",
        });
    }

    let assignedToId: Types.ObjectId | undefined = undefined;
    if (assignedTo) {
        assignedToId = validateObjectId(assignedTo, "Assigned User ID");
        const user = await User.findOne({ _id: assignedToId, organizationId: orgId });
        if (!user) {
            throw new ApiError({
                message: "Assigned user not found in this organization",
                statusCode: 400,
                error: "Bad Request",
            });
        }
    }

    const lead = await Lead.create({
        organizationId: orgId,
        assignedTo: assignedToId as any,
        firstName: firstName.trim(),
        lastName: lastName ? lastName.trim() : undefined,
        email: email.toLowerCase().trim(),
        phone: phone ? phone.trim() : undefined,
        company: company ? company.trim() : undefined,
        source: source ? source.trim() : undefined,
        status: status || LeadStatus.NEW,
        notes: notes ? notes.trim() : undefined,
    });

    await logActivity({
        organizationId: orgId,
        leadId: lead._id as any,
        userId: req.user._id as any,
        type: ActivityType.LEAD_CREATED,
        description: `Lead created for ${lead.firstName} ${lead.lastName || ""}`.trim(),
    });

    if (assignedToId) {
        await logActivity({
            organizationId: orgId,
            leadId: lead._id as any,
            userId: req.user._id as any,
            type: ActivityType.LEAD_ASSIGNED,
            description: `Lead assigned to user ID ${assignedToId}`,
        });
    }

    res.status(201).json(
        new ApiResponse({
            statusCode: 201,
            message: "Lead created successfully",
            data: lead,
        })
    );
});

export const getLeads = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        throw new ApiError({
            message: "Not authenticated",
            statusCode: 401,
            error: "Unauthorized",
        });
    }

    const orgId = req.user.organizationId;
    const { status, assignedTo, source, search, sort = "-createdAt", page = "1", limit = "10" } = req.query;

    const query: any = { organizationId: orgId };

    if (req.user.role === UserRole.MEMBER) {
        query.assignedTo = req.user._id;
    } else if (assignedTo) {
        const assignedToId = validateObjectId(assignedTo as string, "Assigned User ID");
        query.assignedTo = assignedToId;
    }

    if (status) {
        query.status = status;
    }

    if (source) {
        query.source = source;
    }

    if (search) {
        query.$or = [
            { firstName: { $regex: search, $options: "i" } },
            { lastName: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { company: { $regex: search, $options: "i" } },
        ];
    }

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.max(1, parseInt(limit as string, 10));
    const skipNum = (pageNum - 1) * limitNum;
    const sortStr = sort as string;

    const totalLeads = await Lead.countDocuments(query);
    const leads = await Lead.find(query)
        .sort(sortStr)
        .skip(skipNum)
        .limit(limitNum)
        .populate("assignedTo", "name email role");

    res.status(200).json(
        new ApiResponse({
            statusCode: 200,
            message: "Leads retrieved successfully",
            data: {
                leads,
                pagination: {
                    total: totalLeads,
                    page: pageNum,
                    limit: limitNum,
                    pages: Math.ceil(totalLeads / limitNum),
                },
            },
        })
    );
});

export const getLeadById = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        throw new ApiError({
            message: "Not authenticated",
            statusCode: 401,
            error: "Unauthorized",
        });
    }

    const id = req.params.id as string | undefined;
    const leadId = validateObjectId(id, "Lead ID");
    const orgId = req.user.organizationId;

    const lead = await Lead.findOne({ _id: leadId, organizationId: orgId }).populate("assignedTo", "name email role");

    if (!lead) {
        throw new ApiError({
            message: "Lead not found",
            statusCode: 404,
            error: "Not Found",
        });
    }

    if (req.user.role === UserRole.MEMBER && (!lead.assignedTo || lead.assignedTo._id.toString() !== req.user._id.toString())) {
        throw new ApiError({
            message: "You are not authorized to view this lead",
            statusCode: 403,
            error: "Forbidden",
        });
    }

    res.status(200).json(
        new ApiResponse({
            statusCode: 200,
            message: "Lead retrieved successfully",
            data: lead,
        })
    );
});

export const updateLead = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        throw new ApiError({
            message: "Not authenticated",
            statusCode: 401,
            error: "Unauthorized",
        });
    }

    const id = req.params.id as string | undefined;
    const leadId = validateObjectId(id, "Lead ID");
    const orgId = req.user.organizationId;

    const lead = await Lead.findOne({ _id: leadId, organizationId: orgId });

    if (!lead) {
        throw new ApiError({
            message: "Lead not found",
            statusCode: 404,
            error: "Not Found",
        });
    }

    const isAssignedToMe = lead.assignedTo && lead.assignedTo.toString() === req.user._id.toString();
    if (req.user.role === UserRole.MEMBER && !isAssignedToMe) {
        throw new ApiError({
            message: "You are not authorized to update this lead",
            statusCode: 403,
            error: "Forbidden",
        });
    }

    const { firstName, lastName, email, phone, company, source, status, assignedTo, notes } = req.body;

    if (assignedTo !== undefined && req.user.role === UserRole.MEMBER) {
        const assignedToId = assignedTo ? validateObjectId(assignedTo, "Assigned User ID").toString() : null;
        const currentAssignee = lead.assignedTo ? lead.assignedTo.toString() : null;
        if (assignedToId !== currentAssignee) {
            throw new ApiError({
                message: "Only administrators can assign/reassign leads",
                statusCode: 403,
                error: "Forbidden",
            });
        }
    }

    const previousStatus = lead.status;
    const previousAssignedTo = lead.assignedTo ? lead.assignedTo.toString() : null;

    if (firstName !== undefined) lead.firstName = firstName.trim();
    if (lastName !== undefined) lead.lastName = lastName ? lastName.trim() : undefined;
    if (email !== undefined) lead.email = email.toLowerCase().trim();
    if (phone !== undefined) lead.phone = phone ? phone.trim() : undefined;
    if (company !== undefined) lead.company = company ? company.trim() : undefined;
    if (source !== undefined) lead.source = source ? source.trim() : undefined;
    if (notes !== undefined) lead.notes = notes ? notes.trim() : undefined;

    if (status !== undefined) {
        lead.status = status as LeadStatus;
    }

    if (assignedTo !== undefined && req.user.role === UserRole.ADMIN) {
        if (assignedTo) {
            const assignedToId = validateObjectId(assignedTo, "Assigned User ID");
            const user = await User.findOne({ _id: assignedToId, organizationId: orgId });
            if (!user) {
                throw new ApiError({
                    message: "Assigned user not found in this organization",
                    statusCode: 400,
                    error: "Bad Request",
                });
            }
            lead.assignedTo = assignedToId;
        } else {
            lead.assignedTo = undefined as any;
        }
    }

    await lead.save();

    await logActivity({
        organizationId: orgId,
        leadId: lead._id as any,
        userId: req.user._id as any,
        type: ActivityType.LEAD_UPDATED,
        description: `Lead details updated for ${lead.firstName} ${lead.lastName || ""}`.trim(),
    });

    if (status !== undefined && status !== previousStatus) {
        await logActivity({
            organizationId: orgId,
            leadId: lead._id as any,
            userId: req.user._id as any,
            type: ActivityType.STATUS_CHANGED,
            description: `Status changed from ${previousStatus} to ${status}`,
            metadata: { previousStatus, newStatus: status },
        });
    }

    const currentAssignedTo = lead.assignedTo ? lead.assignedTo.toString() : null;
    if (assignedTo !== undefined && currentAssignedTo !== previousAssignedTo) {
        await logActivity({
            organizationId: orgId,
            leadId: lead._id as any,
            userId: req.user._id as any,
            type: ActivityType.LEAD_ASSIGNED,
            description: currentAssignedTo ? `Lead reassigned to user ID ${currentAssignedTo}` : `Lead unassigned`,
            metadata: { previousAssignedTo, newAssignedTo: currentAssignedTo },
        });
    }

    res.status(200).json(
        new ApiResponse({
            statusCode: 200,
            message: "Lead updated successfully",
            data: lead,
        })
    );
});

export const deleteLead = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        throw new ApiError({
            message: "Not authenticated",
            statusCode: 401,
            error: "Unauthorized",
        });
    }

    if (req.user.role !== UserRole.ADMIN) {
        throw new ApiError({
            message: "Only administrators can delete leads",
            statusCode: 403,
            error: "Forbidden",
        });
    }

    const id = req.params.id as string | undefined;
    const leadId = validateObjectId(id, "Lead ID");
    const orgId = req.user.organizationId;

    const lead = await Lead.findOne({ _id: leadId, organizationId: orgId });
    if (!lead) {
        throw new ApiError({
            message: "Lead not found",
            statusCode: 404,
            error: "Not Found",
        });
    }

    await Note.deleteMany({ leadId, organizationId: orgId });
    await Activity.deleteMany({ leadId, organizationId: orgId });
    await Lead.deleteOne({ _id: leadId, organizationId: orgId });

    res.status(200).json(
        new ApiResponse({
            statusCode: 200,
            message: "Lead and all associated notes/activities deleted successfully",
            data: null,
        })
    );
});

export const assignLead = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        throw new ApiError({
            message: "Not authenticated",
            statusCode: 401,
            error: "Unauthorized",
        });
    }

    if (req.user.role !== UserRole.ADMIN) {
        throw new ApiError({
            message: "Only administrators can assign leads",
            statusCode: 403,
            error: "Forbidden",
        });
    }

    const id = req.params.id as string | undefined;
    const leadId = validateObjectId(id, "Lead ID");
    const orgId = req.user.organizationId;

    const lead = await Lead.findOne({ _id: leadId, organizationId: orgId });
    if (!lead) {
        throw new ApiError({
            message: "Lead not found",
            statusCode: 404,
            error: "Not Found",
        });
    }

    const { userId } = req.body;
    let targetUserId = null;

    if (userId) {
        targetUserId = validateObjectId(userId, "User ID");
        const user = await User.findOne({ _id: targetUserId, organizationId: orgId });
        if (!user) {
            throw new ApiError({
                message: "User not found in this organization",
                statusCode: 400,
                error: "Bad Request",
            });
        }
    }

    const previousAssignedTo = lead.assignedTo ? lead.assignedTo.toString() : null;
    lead.assignedTo = (targetUserId || undefined) as any;
    await lead.save();

    await logActivity({
        organizationId: orgId,
        leadId: lead._id as any,
        userId: req.user._id as any,
        type: ActivityType.LEAD_ASSIGNED,
        description: targetUserId ? `Lead assigned to user ID ${targetUserId}` : `Lead unassigned`,
        metadata: { previousAssignedTo, newAssignedTo: targetUserId ? targetUserId.toString() : null },
    });

    res.status(200).json(
        new ApiResponse({
            statusCode: 200,
            message: "Lead assigned successfully",
            data: lead,
        })
    );
});
