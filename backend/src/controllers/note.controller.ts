import { Note } from "../models/note.model.js";
import { Lead } from "../models/lead.model.js";
import { UserRole } from "../models/user.model.js";
import { ActivityType } from "../models/activity.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler, validateObjectId } from "../utils/utils.js";
import { logActivity } from "../utils/activity.js";
import type { Request, Response } from "express";

export const createNote = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        throw new ApiError({
            message: "Not authenticated",
            statusCode: 401,
            error: "Unauthorized",
        });
    }

    const leadId = validateObjectId(req.params.id as string | undefined, "Lead ID");
    const orgId = req.user.organizationId;
    const { content } = req.body;

    if (!content || !content.trim()) {
        throw new ApiError({
            message: "Note content is required",
            statusCode: 400,
            error: "Bad Request",
        });
    }

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
            message: "You are not authorized to add notes to this lead",
            statusCode: 403,
            error: "Forbidden",
        });
    }

    const note = await Note.create({
        organizationId: orgId,
        leadId,
        authorId: req.user._id,
        content: content.trim(),
    });

    await logActivity({
        organizationId: orgId,
        leadId,
        userId: req.user._id as any,
        type: ActivityType.NOTE_ADDED,
        description: `Note added by ${req.user.name}`,
    });

    const populatedNote = await note.populate("authorId", "name email role");

    res.status(201).json(
        new ApiResponse({
            statusCode: 201,
            message: "Note created successfully",
            data: populatedNote,
        })
    );
});

export const getLeadNotes = asyncHandler(async (req: Request, res: Response) => {
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
            message: "You are not authorized to view notes for this lead",
            statusCode: 403,
            error: "Forbidden",
        });
    }

    const notes = await Note.find({ leadId, organizationId: orgId })
        .sort({ createdAt: -1 })
        .populate("authorId", "name email role");

    res.status(200).json(
        new ApiResponse({
            statusCode: 200,
            message: "Notes retrieved successfully",
            data: notes,
        })
    );
});

export const updateNote = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        throw new ApiError({
            message: "Not authenticated",
            statusCode: 401,
            error: "Unauthorized",
        });
    }

    const noteId = validateObjectId(req.params.id as string | undefined, "Note ID");
    const orgId = req.user.organizationId;
    const { content } = req.body;

    if (!content || !content.trim()) {
        throw new ApiError({
            message: "Note content is required",
            statusCode: 400,
            error: "Bad Request",
        });
    }

    const note = await Note.findOne({ _id: noteId, organizationId: orgId });
    if (!note) {
        throw new ApiError({
            message: "Note not found",
            statusCode: 404,
            error: "Not Found",
        });
    }

    if (note.authorId.toString() !== req.user._id.toString()) {
        throw new ApiError({
            message: "You are not authorized to update this note",
            statusCode: 403,
            error: "Forbidden",
        });
    }

    note.content = content.trim();
    await note.save();

    await logActivity({
        organizationId: orgId,
        leadId: note.leadId,
        userId: req.user._id as any,
        type: ActivityType.NOTE_UPDATED,
        description: `Note updated by ${req.user.name}`,
    });

    const populatedNote = await note.populate("authorId", "name email role");

    res.status(200).json(
        new ApiResponse({
            statusCode: 200,
            message: "Note updated successfully",
            data: populatedNote,
        })
    );
});

export const deleteNote = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        throw new ApiError({
            message: "Not authenticated",
            statusCode: 401,
            error: "Unauthorized",
        });
    }

    const noteId = validateObjectId(req.params.id as string | undefined, "Note ID");
    const orgId = req.user.organizationId;

    const note = await Note.findOne({ _id: noteId, organizationId: orgId });
    if (!note) {
        throw new ApiError({
            message: "Note not found",
            statusCode: 404,
            error: "Not Found",
        });
    }

    const isAuthor = note.authorId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === UserRole.ADMIN;

    if (!isAuthor && !isAdmin) {
        throw new ApiError({
            message: "You are not authorized to delete this note",
            statusCode: 403,
            error: "Forbidden",
        });
    }

    await Note.deleteOne({ _id: noteId, organizationId: orgId });

    await logActivity({
        organizationId: orgId,
        leadId: note.leadId,
        userId: req.user._id as any,
        type: ActivityType.NOTE_DELETED,
        description: `Note deleted by ${req.user.name}`,
    });

    res.status(200).json(
        new ApiResponse({
            statusCode: 200,
            message: "Note deleted successfully",
            data: null,
        })
    );
});
