/**
 * Auth Test Suite
 *
 * Covers:
 * - Login: success, wrong password, missing fields, suspended account
 * - Protected route (/me): no token, invalid token, valid token
 * - Permission guards: member accessing admin-only routes
 */

import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../app.js";
import { Lead } from "../models/lead.model.js";
import {
    authHeader,
    createAdminUser,
    createMemberUser,
    createTestOrg,
    DEFAULT_PASSWORD,
    loginUser,
} from "./helpers.js";

// ── Shared state ─────────────────────────────────────────────────────────────

let adminToken: string;
let memberToken: string;

beforeEach(async () => {
    const org = await createTestOrg("auth-test-org");
    const admin = await createAdminUser(org._id as any, { email: "admin@auth.test" });
    const member = await createMemberUser(org._id as any, { email: "member@auth.test" });

    adminToken = await loginUser(app, admin.email);
    memberToken = await loginUser(app, member.email);
});

// ── Login tests ──────────────────────────────────────────────────────────────

describe("POST /api/v1/auth/login", () => {
    it("returns 200 and sets accessToken cookie on valid credentials", async () => {
        const org = await createTestOrg("login-success-org");
        const user = await createAdminUser(org._id as any, { email: "success@login.test" });

        const res = await request(app)
            .post("/api/v1/auth/login")
            .send({ email: user.email, password: DEFAULT_PASSWORD });

        expect(res.status).toBe(200);
        expect(res.body.data.user.email).toBe(user.email);

        const cookies = res.headers["set-cookie"] as string[] | string;
        const cookieArr = Array.isArray(cookies) ? cookies : [cookies];
        expect(cookieArr.some((c: string) => c.startsWith("accessToken="))).toBe(true);
    });

    it("returns 401 on wrong password", async () => {
        const org = await createTestOrg("wrong-pw-org");
        const user = await createAdminUser(org._id as any, { email: "wrong@login.test" });

        const res = await request(app)
            .post("/api/v1/auth/login")
            .send({ email: user.email, password: "WrongPassword!" });

        expect(res.status).toBe(401);
    });

    it("returns 400 when fields are missing", async () => {
        const res = await request(app)
            .post("/api/v1/auth/login")
            .send({ email: "someone@test.com" }); // missing password

        expect(res.status).toBe(400);
    });

    it("returns 401 when email does not exist", async () => {
        const res = await request(app)
            .post("/api/v1/auth/login")
            .send({ email: "ghost@test.com", password: DEFAULT_PASSWORD });

        expect(res.status).toBe(401);
    });

    it("returns 403 when user account is suspended", async () => {
        const org = await createTestOrg("suspended-org");
        const user = await createAdminUser(org._id as any, {
            email: "suspended@login.test",
            isActive: false,
        });

        const res = await request(app)
            .post("/api/v1/auth/login")
            .send({ email: user.email, password: DEFAULT_PASSWORD });

        expect(res.status).toBe(403);
    });
});

// ── Protected route tests ────────────────────────────────────────────────────

describe("GET /api/v1/auth/me", () => {
    it("returns 401 when no token is provided", async () => {
        const res = await request(app).get("/api/v1/auth/me");
        expect(res.status).toBe(401);
    });

    it("returns 401 when token is invalid", async () => {
        const res = await request(app)
            .get("/api/v1/auth/me")
            .set("Authorization", "Bearer this-is-not-a-valid-token");
        expect(res.status).toBe(401);
    });

    it("returns 200 with the current user when a valid token is provided", async () => {
        const res = await request(app)
            .get("/api/v1/auth/me")
            .set(authHeader(adminToken));

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveProperty("email");
        expect(res.body.data).not.toHaveProperty("password");
    });
});

// ── Permission tests ─────────────────────────────────────────────────────────

describe("Admin-only route guards", () => {
    it("returns 403 when a member tries to DELETE a lead", async () => {
        // Create a lead first via admin
        const createRes = await request(app)
            .post("/api/v1/leads")
            .set(authHeader(adminToken))
            .send({ firstName: "Test", email: "test@lead.com" });

        const leadId = createRes.body.data._id;

        const res = await request(app)
            .delete(`/api/v1/leads/${leadId}`)
            .set(authHeader(memberToken));

        expect(res.status).toBe(403);
        expect(createRes.body.data).toBeDefined();
    });

    it("returns 403 when a member tries to ASSIGN a lead", async () => {
        const createRes = await request(app)
            .post("/api/v1/leads")
            .set(authHeader(adminToken))
            .send({ firstName: "Test", email: "assign@lead.com" });

        const leadId = createRes.body.data._id;

        const res = await request(app)
            .patch(`/api/v1/leads/${leadId}/assign`)
            .set(authHeader(memberToken))
            .send({ userId: null });

        expect(res.status).toBe(403);
    });
});
