import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/utils.js";
import type { Request, Response, NextFunction } from "express";

export const authenticateUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        throw new ApiError({
            message: "Authentication token missing or invalid",
            statusCode: 401,
            error: "Unauthorized",
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || "access_secret") as { _id: string };
        const user = await User.findById(decoded._id);

        if (!user) {
            throw new ApiError({
                message: "User not found",
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

        req.user = user;
        next();
    } catch (error: any) {
        throw new ApiError({
            message: error.message || "Invalid authentication token",
            statusCode: 401,
            error: "Unauthorized",
        });
    }
});

export const authorizeRoles = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(
                new ApiError({
                    message: "Authentication required",
                    statusCode: 401,
                    error: "Unauthorized",
                })
            );
        }

        if (!roles.includes(req.user.role)) {
            return next(
                new ApiError({
                    message: "You are not authorized to access this resource",
                    statusCode: 403,
                    error: "Forbidden",
                })
            );
        }

        next();
    };
};
