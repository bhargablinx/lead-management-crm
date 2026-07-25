import bcrypt from "bcrypt";
import type { Express } from "express";
import request from "supertest";
import { Organization } from "../models/organization.model.js";
import { User, UserRole } from "../models/user.model.js";
import type { IUser } from "../models/user.model.js";
import type { IOrganization } from "../models/organization.model.js";
import type { Types } from "mongoose";

// ── Organization helpers ─────────────────────────────────────────────────────

export const createTestOrg = async (
    slug = "test-org",
    overrides: Partial<{ name: string; isActive: boolean }> = {}
): Promise<IOrganization> => {
    return Organization.create({
        name: overrides.name ?? "Test Organization",
        slug,
        isActive: overrides.isActive ?? true,
    });
};

// ── User helpers ─────────────────────────────────────────────────────────────

const DEFAULT_PASSWORD = "Password123";

export const createAdminUser = async (
    organizationId: Types.ObjectId,
    overrides: Partial<{ email: string; name: string; isActive: boolean }> = {}
): Promise<IUser> => {
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    return User.create({
        organizationId,
        name: overrides.name ?? "Admin User",
        email: overrides.email ?? `admin-${Date.now()}@test.com`,
        password: hashedPassword,
        role: UserRole.ADMIN,
        isActive: overrides.isActive ?? true,
    });
};

export const createMemberUser = async (
    organizationId: Types.ObjectId,
    overrides: Partial<{ email: string; name: string; isActive: boolean }> = {}
): Promise<IUser> => {
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    return User.create({
        organizationId,
        name: overrides.name ?? "Member User",
        email: overrides.email ?? `member-${Date.now()}@test.com`,
        password: hashedPassword,
        role: UserRole.MEMBER,
        isActive: overrides.isActive ?? true,
    });
};

// ── Auth helpers ─────────────────────────────────────────────────────────────

/**
 * Log in a user and return the access token extracted from the response cookie.
 */
export const loginUser = async (
    app: Express,
    email: string,
    password = DEFAULT_PASSWORD
): Promise<string> => {
    const res = await request(app).post("/api/v1/auth/login").send({ email, password });

    // Token can come from cookie or response body (fallback)
    const cookieHeader: string | undefined = (res.headers["set-cookie"] as string[] | undefined)
        ?.find((c) => c.startsWith("accessToken="));

    if (cookieHeader) {
        const match = cookieHeader.match(/accessToken=([^;]+)/);
        if (match && match[1]) return match[1];
    }

    throw new Error(`Login failed for ${email} — status ${res.status}: ${JSON.stringify(res.body)}`);
};

/**
 * Returns a Bearer auth header object ready to be passed to supertest `.set()`.
 */
export const authHeader = (token: string) => ({
    Authorization: `Bearer ${token}`,
});

export { DEFAULT_PASSWORD };
