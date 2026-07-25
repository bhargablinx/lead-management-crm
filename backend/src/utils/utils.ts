import type { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import { ApiError } from "./ApiError.js";

export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => void) => (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);

export const cookieOption = {
    httpOnly: true,
    secure: true,
};

export const validateObjectId = (id: string | undefined, paramName = "ID"): Types.ObjectId => {
    if (!id || !Types.ObjectId.isValid(id)) {
        throw new ApiError({
            message: `Invalid ${paramName} format`,
            statusCode: 400,
            error: "Bad Request",
        });
    }
    return new Types.ObjectId(id);
};