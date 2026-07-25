import { Organization } from "../models/organization.model.js";
import { UserRole } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler, cookieOption } from "../utils/utils.js";
import type { Request, Response } from "express";

export const createOrganization = asyncHandler(async (req: Request, res: Response) => {
    const { name, slug } = req.body;

    if (!name || !slug) {
        throw new ApiError({
            message: "Organization name and slug are required",
            statusCode: 400,
            error: "Bad Request",
        });
    }

    const existingOrg = await Organization.findOne({ slug: slug.toLowerCase().trim() });
    if (existingOrg) {
        throw new ApiError({
            message: "Organization slug is already in use",
            statusCode: 400,
            error: "Bad Request",
        });
    }

    const organization = await Organization.create({
        name: name.trim(),
        slug: slug.toLowerCase().trim(),
        isActive: true,
    });

    res.status(201).json(
        new ApiResponse({
            statusCode: 201,
            message: "Organization created successfully",
            data: organization,
        })
    );
});

export const getOrganization = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        throw new ApiError({
            message: "Not authenticated",
            statusCode: 401,
            error: "Unauthorized",
        });
    }

    const orgId = req.user.organizationId;
    const organization = await Organization.findById(orgId);

    if (!organization) {
        throw new ApiError({
            message: "Organization not found",
            statusCode: 404,
            error: "Not Found",
        });
    }

    res.status(200).json(
        new ApiResponse({
            statusCode: 200,
            message: "Organization retrieved successfully",
            data: organization,
        })
    );
});

export const updateOrganization = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        throw new ApiError({
            message: "Not authenticated",
            statusCode: 401,
            error: "Unauthorized",
        });
    }

    if (req.user.role !== UserRole.ADMIN) {
        throw new ApiError({
            message: "Only administrators can update organization settings",
            statusCode: 403,
            error: "Forbidden",
        });
    }

    const orgId = req.user.organizationId;
    const { name, slug, isActive } = req.body;

    const organization = await Organization.findById(orgId);
    if (!organization) {
        throw new ApiError({
            message: "Organization not found",
            statusCode: 404,
            error: "Not Found",
        });
    }

    if (name !== undefined) {
        organization.name = name.trim();
    }

    if (slug !== undefined && slug.toLowerCase().trim() !== organization.slug) {
        const existingOrg = await Organization.findOne({ slug: slug.toLowerCase().trim() });
        if (existingOrg) {
            throw new ApiError({
                message: "Organization slug is already in use",
                statusCode: 400,
                error: "Bad Request",
            });
        }
        organization.slug = slug.toLowerCase().trim();
    }

    if (isActive !== undefined) {
        organization.isActive = isActive;
    }

    await organization.save();

    res.status(200).json(
        new ApiResponse({
            statusCode: 200,
            message: "Organization updated successfully",
            data: organization,
        })
    );
});

export const deleteOrganization = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        throw new ApiError({
            message: "Not authenticated",
            statusCode: 401,
            error: "Unauthorized",
        });
    }

    if (req.user.role !== UserRole.ADMIN) {
        throw new ApiError({
            message: "Only administrators can delete organizations",
            statusCode: 403,
            error: "Forbidden",
        });
    }

    const orgId = req.user.organizationId;
    const organization = await Organization.findById(orgId);
    if (!organization) {
        throw new ApiError({
            message: "Organization not found",
            statusCode: 404,
            error: "Not Found",
        });
    }

    await Organization.findByIdAndDelete(orgId);

    res.clearCookie("accessToken", cookieOption)
        .clearCookie("refreshToken", cookieOption)
        .status(200)
        .json(
            new ApiResponse({
                statusCode: 200,
                message: "Organization deleted successfully",
                data: null,
            })
        );
});
