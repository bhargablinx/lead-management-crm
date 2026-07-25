import bcrypt from "bcrypt";
import jwt, { type SignOptions } from "jsonwebtoken";
import { User, UserRole } from "../models/user.model.js";
import { Organization } from "../models/organization.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler, cookieOption } from "../utils/utils.js";
import type { Request, Response } from "express";

export const register = asyncHandler(async (req: Request, res: Response) => {
    const { orgName, orgSlug, name, email, password } = req.body;

    if (!orgName || !orgSlug || !name || !email || !password) {
        throw new ApiError({
            message: "All fields are required (orgName, orgSlug, name, email, password)",
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

    // Check if slug is taken
    const existingOrg = await Organization.findOne({ slug: orgSlug.toLowerCase().trim() });
    if (existingOrg) {
        throw new ApiError({
            message: "Organization slug is already in use",
            statusCode: 400,
            error: "Bad Request",
        });
    }

    // Check if user email is taken
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
        throw new ApiError({
            message: "User with this email already exists",
            statusCode: 400,
            error: "Bad Request",
        });
    }

    // Create organization
    const organization = await Organization.create({
        name: orgName.trim(),
        slug: orgSlug.toLowerCase().trim(),
        isActive: true,
    });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create Admin user
    const user = await User.create({
        organizationId: organization._id,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: UserRole.ADMIN,
        isActive: true,
    });

    // Remove password from user object before sending response
    const userWithoutPassword = user.toObject();
    delete (userWithoutPassword as any).password;

    // Generate JWT tokens
    const accessToken = jwt.sign(
        { _id: user._id, role: user.role, organizationId: user.organizationId },
        process.env.ACCESS_TOKEN_SECRET || "access_secret",
        { expiresIn: (process.env.ACCESS_TOKEN_EXPIRY || "1d") } as SignOptions
    );
    const refreshToken = jwt.sign(
        { _id: user._id },
        process.env.REFRESH_TOKEN_SECRET || "refresh_secret",
        { expiresIn: (process.env.REFRESH_TOKEN_EXPIRY || "15d") } as SignOptions
    );

    res.cookie("accessToken", accessToken, cookieOption)
        .cookie("refreshToken", refreshToken, cookieOption)
        .status(201)
        .json(
            new ApiResponse({
                statusCode: 201,
                message: "Registration successful",
                data: {
                    user: userWithoutPassword,
                    organization,
                    accessToken,
                    refreshToken,
                },
            })
        );
});

export const login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError({
            message: "Email and password are required",
            statusCode: 400,
            error: "Bad Request",
        });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
    if (!user) {
        throw new ApiError({
            message: "Invalid email or password",
            statusCode: 401,
            error: "Unauthorized",
        });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new ApiError({
            message: "Invalid email or password",
            statusCode: 401,
            error: "Unauthorized",
        });
    }

    if (!user.isActive) {
        throw new ApiError({
            message: "User account is suspended",
            statusCode: 403,
            error: "Forbidden",
        });
    }

    // Update lastLogin
    user.lastLogin = new Date();
    await user.save();

    const userWithoutPassword = user.toObject();
    delete (userWithoutPassword as any).password;

    // Generate JWT tokens
    const accessToken = jwt.sign(
        { _id: user._id, role: user.role, organizationId: user.organizationId },
        process.env.ACCESS_TOKEN_SECRET || "access_secret",
        { expiresIn: (process.env.ACCESS_TOKEN_EXPIRY || "1d") } as SignOptions
    );
    const refreshToken = jwt.sign(
        { _id: user._id },
        process.env.REFRESH_TOKEN_SECRET || "refresh_secret",
        { expiresIn: (process.env.REFRESH_TOKEN_EXPIRY || "15d") } as SignOptions
    );

    res.cookie("accessToken", accessToken, cookieOption)
        .cookie("refreshToken", refreshToken, cookieOption)
        .status(200)
        .json(
            new ApiResponse({
                statusCode: 200,
                message: "Login successful",
                data: {
                    user: userWithoutPassword,
                    accessToken,
                    refreshToken,
                },
            })
        );
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
    res.clearCookie("accessToken", cookieOption)
        .clearCookie("refreshToken", cookieOption)
        .status(200)
        .json(
            new ApiResponse({
                statusCode: 200,
                message: "Logged out successfully",
                data: null,
            })
        );
});

export const me = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        throw new ApiError({
            message: "Not authenticated",
            statusCode: 401,
            error: "Unauthorized",
        });
    }

    res.status(200).json(
        new ApiResponse({
            statusCode: 200,
            message: "Current user retrieved successfully",
            data: req.user,
        })
    );
});
