import bcrypt from "bcrypt";
import { User, UserRole } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler, validateObjectId } from "../utils/utils.js";
import type { Request, Response } from "express";

export const createUser = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        throw new ApiError({
            message: "Not authenticated",
            statusCode: 401,
            error: "Unauthorized",
        });
    }

    if (req.user.role !== UserRole.ADMIN) {
        throw new ApiError({
            message: "Only administrators can create users",
            statusCode: 403,
            error: "Forbidden",
        });
    }

    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
        throw new ApiError({
            message: "Name, email, and password are required",
            statusCode: 400,
            error: "Bad Request",
        });
    }

    if (password.length < 8) {
        throw new ApiError({
            message: "Password must be at least 8 characters long",
            statusCode: 400,
            error: "Bad Request",
        });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
        throw new ApiError({
            message: "User with this email already exists",
            statusCode: 400,
            error: "Bad Request",
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        organizationId: req.user.organizationId,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: role || UserRole.MEMBER,
        isActive: true,
    });

    const userWithoutPassword = user.toObject();
    delete (userWithoutPassword as any).password;

    res.status(201).json(
        new ApiResponse({
            statusCode: 201,
            message: "User created successfully",
            data: userWithoutPassword,
        })
    );
});

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        throw new ApiError({
            message: "Not authenticated",
            statusCode: 401,
            error: "Unauthorized",
        });
    }

    if (req.user.role !== UserRole.ADMIN) {
        throw new ApiError({
            message: "Only administrators can list users",
            statusCode: 403,
            error: "Forbidden",
        });
    }

    const orgId = req.user.organizationId;
    const { role, isActive, search } = req.query;

    const query: any = { organizationId: orgId };

    if (role) {
        query.role = role;
    }

    if (isActive !== undefined) {
        query.isActive = isActive === "true";
    }

    if (search) {
        query.$or = [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
        ];
    }

    const users = await User.find(query).sort({ createdAt: -1 });

    res.status(200).json(
        new ApiResponse({
            statusCode: 200,
            message: "Users retrieved successfully",
            data: users,
        })
    );
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        throw new ApiError({
            message: "Not authenticated",
            statusCode: 401,
            error: "Unauthorized",
        });
    }

    const id = req.params.id as string | undefined;
    const userId = validateObjectId(id, "User ID");
    const orgId = req.user.organizationId;

    if (req.user.role !== UserRole.ADMIN && req.user._id.toString() !== userId.toString()) {
        throw new ApiError({
            message: "You are not authorized to view this user",
            statusCode: 403,
            error: "Forbidden",
        });
    }

    const user = await User.findOne({ _id: userId, organizationId: orgId });
    if (!user) {
        throw new ApiError({
            message: "User not found",
            statusCode: 404,
            error: "Not Found",
        });
    }

    res.status(200).json(
        new ApiResponse({
            statusCode: 200,
            message: "User retrieved successfully",
            data: user,
        })
    );
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        throw new ApiError({
            message: "Not authenticated",
            statusCode: 401,
            error: "Unauthorized",
        });
    }

    const id = req.params.id as string | undefined;
    const targetUserId = validateObjectId(id, "User ID");
    const orgId = req.user.organizationId;

    const isSelf = req.user._id.toString() === targetUserId.toString();
    const isAdmin = req.user.role === UserRole.ADMIN;

    if (!isAdmin && !isSelf) {
        throw new ApiError({
            message: "You are not authorized to update this user",
            statusCode: 403,
            error: "Forbidden",
        });
    }

    const { name, email, password, role, isActive } = req.body;

    const user = await User.findOne({ _id: targetUserId, organizationId: orgId });
    if (!user) {
        throw new ApiError({
            message: "User not found",
            statusCode: 404,
            error: "Not Found",
        });
    }

    if (name !== undefined) {
        user.name = name.trim();
    }

    if (email !== undefined && email.toLowerCase().trim() !== user.email) {
        const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
        if (existingUser) {
            throw new ApiError({
                message: "Email is already in use by another user",
                statusCode: 400,
                error: "Bad Request",
            });
        }
        user.email = email.toLowerCase().trim();
    }

    if (password !== undefined) {
        if (password.length < 8) {
            throw new ApiError({
                message: "Password must be at least 8 characters long",
                statusCode: 400,
                error: "Bad Request",
            });
        }
        user.password = await bcrypt.hash(password, 10);
    }

    if (role !== undefined) {
        if (!isAdmin) {
            throw new ApiError({
                message: "Only administrators can change user roles",
                statusCode: 403,
                error: "Forbidden",
            });
        }
        user.role = role;
    }

    if (isActive !== undefined) {
        if (!isAdmin) {
            throw new ApiError({
                message: "Only administrators can toggle user status",
                statusCode: 403,
                error: "Forbidden",
            });
        }
        user.isActive = isActive;
    }

    await user.save();

    const updatedUser = user.toObject();
    delete (updatedUser as any).password;

    res.status(200).json(
        new ApiResponse({
            statusCode: 200,
            message: "User updated successfully",
            data: updatedUser,
        })
    );
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        throw new ApiError({
            message: "Not authenticated",
            statusCode: 401,
            error: "Unauthorized",
        });
    }

    if (req.user.role !== UserRole.ADMIN) {
        throw new ApiError({
            message: "Only administrators can delete users",
            statusCode: 403,
            error: "Forbidden",
        });
    }

    const id = req.params.id as string | undefined;
    const targetUserId = validateObjectId(id, "User ID");
    const orgId = req.user.organizationId;

    if (req.user._id.toString() === targetUserId.toString()) {
        throw new ApiError({
            message: "You cannot delete your own account",
            statusCode: 400,
            error: "Bad Request",
        });
    }

    const user = await User.findOneAndDelete({ _id: targetUserId, organizationId: orgId });
    if (!user) {
        throw new ApiError({
            message: "User not found",
            statusCode: 404,
            error: "Not Found",
        });
    }

    res.status(200).json(
        new ApiResponse({
            statusCode: 200,
            message: "User deleted successfully",
            data: null,
        })
    );
});
