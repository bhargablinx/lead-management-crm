/**
 * Lead Flow Test Suite
 *
 * Covers:
 * - Create lead (admin & member)
 * - Assign lead (admin only)
 * - Status change
 * - Admin sees all leads; member sees only their assigned leads
 * - Member cannot view or update unassigned leads
 */

import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../app.js";
import { Activity } from "../models/activity.model.js";
import { ActivityType } from "../models/activity.model.js";
import {
    authHeader,
    createAdminUser,
    createMemberUser,
    createTestOrg,
    loginUser,
} from "./helpers.js";
import type { Types } from "mongoose";

// ── Shared state ─────────────────────────────────────────────────────────────

let adminToken: string;
let memberToken: string;
let memberId: string;

beforeEach(async () => {
    const org = await createTestOrg("leads-test-org");
    const admin = await createAdminUser(org._id as any, { email: "admin@leads.test" });
    const member = await createMemberUser(org._id as any, { email: "member@leads.test" });

    adminToken = await loginUser(app, admin.email);
    memberToken = await loginUser(app, member.email);
    memberId = (member._id as Types.ObjectId).toString();
});

// ── Create Lead ───────────────────────────────────────────────────────────────

describe("POST /api/v1/leads — create lead", () => {
    it("admin can create a lead and LEAD_CREATED activity is logged", async () => {
        const res = await request(app)
            .post("/api/v1/leads")
            .set(authHeader(adminToken))
            .send({ firstName: "Alice", email: "alice@prospect.com", company: "ACME" });

        expect(res.status).toBe(201);
        expect(res.body.data.firstName).toBe("Alice");
        expect(res.body.data.status).toBe("new");

        // Verify activity was logged
        const activity = await Activity.findOne({
            leadId: res.body.data._id,
            type: ActivityType.LEAD_CREATED,
        });
        expect(activity).not.toBeNull();
    });

    it("returns 400 when firstName or email is missing", async () => {
        const res = await request(app)
            .post("/api/v1/leads")
            .set(authHeader(adminToken))
            .send({ firstName: "NoEmail" }); // email missing

        expect(res.status).toBe(400);
    });

    it("creates lead with initial assignment and logs LEAD_ASSIGNED activity", async () => {
        const res = await request(app)
            .post("/api/v1/leads")
            .set(authHeader(adminToken))
            .send({ firstName: "Bob", email: "bob@prospect.com", assignedTo: memberId });

        expect(res.status).toBe(201);
        expect(res.body.data.assignedTo).toBeTruthy();

        const assignActivity = await Activity.findOne({
            leadId: res.body.data._id,
            type: ActivityType.LEAD_ASSIGNED,
        });
        expect(assignActivity).not.toBeNull();
    });

    it("returns 401 when no auth token is provided", async () => {
        const res = await request(app)
            .post("/api/v1/leads")
            .send({ firstName: "Ghost", email: "ghost@test.com" });

        expect(res.status).toBe(401);
    });
});

// ── Assign Lead ───────────────────────────────────────────────────────────────

describe("PATCH /api/v1/leads/:id/assign — assign lead", () => {
    it("admin can assign a lead to a member and logs LEAD_ASSIGNED activity", async () => {
        const createRes = await request(app)
            .post("/api/v1/leads")
            .set(authHeader(adminToken))
            .send({ firstName: "Charlie", email: "charlie@prospect.com" });

        const leadId = createRes.body.data._id;

        const res = await request(app)
            .patch(`/api/v1/leads/${leadId}/assign`)
            .set(authHeader(adminToken))
            .send({ userId: memberId });

        expect(res.status).toBe(200);

        const assignActivity = await Activity.findOne({
            leadId,
            type: ActivityType.LEAD_ASSIGNED,
        });
        expect(assignActivity).not.toBeNull();
        expect(assignActivity!.description).toContain(memberId);
    });

    it("admin can unassign a lead by sending empty userId", async () => {
        const createRes = await request(app)
            .post("/api/v1/leads")
            .set(authHeader(adminToken))
            .send({ firstName: "Dave", email: "dave@prospect.com", assignedTo: memberId });

        const leadId = createRes.body.data._id;

        const res = await request(app)
            .patch(`/api/v1/leads/${leadId}/assign`)
            .set(authHeader(adminToken))
            .send({ userId: null });

        expect(res.status).toBe(200);
    });

    it("returns 403 when a member tries to assign a lead", async () => {
        const createRes = await request(app)
            .post("/api/v1/leads")
            .set(authHeader(adminToken))
            .send({ firstName: "Eve", email: "eve@prospect.com" });

        const leadId = createRes.body.data._id;

        const res = await request(app)
            .patch(`/api/v1/leads/${leadId}/assign`)
            .set(authHeader(memberToken))
            .send({ userId: memberId });

        expect(res.status).toBe(403);
    });
});

// ── Change Status ─────────────────────────────────────────────────────────────

describe("PATCH /api/v1/leads/:id — change status", () => {
    it("admin can change lead status and STATUS_CHANGED activity is logged", async () => {
        const createRes = await request(app)
            .post("/api/v1/leads")
            .set(authHeader(adminToken))
            .send({ firstName: "Frank", email: "frank@prospect.com" });

        const leadId = createRes.body.data._id;

        const res = await request(app)
            .patch(`/api/v1/leads/${leadId}`)
            .set(authHeader(adminToken))
            .send({ status: "contacted" });

        expect(res.status).toBe(200);
        expect(res.body.data.status).toBe("contacted");

        const statusActivity = await Activity.findOne({
            leadId,
            type: ActivityType.STATUS_CHANGED,
        });
        expect(statusActivity).not.toBeNull();
        expect(statusActivity!.metadata).toMatchObject({
            previousStatus: "new",
            newStatus: "contacted",
        });
    });

    it("member can change status on an assigned lead", async () => {
        // Admin creates and assigns lead to member
        const createRes = await request(app)
            .post("/api/v1/leads")
            .set(authHeader(adminToken))
            .send({ firstName: "Grace", email: "grace@prospect.com", assignedTo: memberId });

        const leadId = createRes.body.data._id;

        const res = await request(app)
            .patch(`/api/v1/leads/${leadId}`)
            .set(authHeader(memberToken))
            .send({ status: "qualified" });

        expect(res.status).toBe(200);
        expect(res.body.data.status).toBe("qualified");
    });

    it("member cannot update a lead they are not assigned to", async () => {
        const createRes = await request(app)
            .post("/api/v1/leads")
            .set(authHeader(adminToken))
            .send({ firstName: "Henry", email: "henry@prospect.com" });

        const leadId = createRes.body.data._id;

        const res = await request(app)
            .patch(`/api/v1/leads/${leadId}`)
            .set(authHeader(memberToken))
            .send({ status: "won" });

        expect(res.status).toBe(403);
    });

    it("member cannot reassign a lead to another user", async () => {
        const createRes = await request(app)
            .post("/api/v1/leads")
            .set(authHeader(adminToken))
            .send({ firstName: "Iris", email: "iris@prospect.com", assignedTo: memberId });

        const leadId = createRes.body.data._id;

        const res = await request(app)
            .patch(`/api/v1/leads/${leadId}`)
            .set(authHeader(memberToken))
            .send({ assignedTo: null });

        expect(res.status).toBe(403);
    });
});

// ── Get Leads — scoping ───────────────────────────────────────────────────────

describe("GET /api/v1/leads — lead visibility scoping", () => {
    it("admin sees all leads in the organization", async () => {
        await request(app)
            .post("/api/v1/leads")
            .set(authHeader(adminToken))
            .send({ firstName: "Lead1", email: "lead1@test.com" });

        await request(app)
            .post("/api/v1/leads")
            .set(authHeader(adminToken))
            .send({ firstName: "Lead2", email: "lead2@test.com" });

        const res = await request(app)
            .get("/api/v1/leads")
            .set(authHeader(adminToken));

        expect(res.status).toBe(200);
        expect(res.body.data.leads.length).toBeGreaterThanOrEqual(2);
    });

    it("member sees only leads assigned to them", async () => {
        // Unassigned lead
        await request(app)
            .post("/api/v1/leads")
            .set(authHeader(adminToken))
            .send({ firstName: "Unassigned", email: "unassigned@test.com" });

        // Assigned to member
        await request(app)
            .post("/api/v1/leads")
            .set(authHeader(adminToken))
            .send({ firstName: "Assigned", email: "assigned@test.com", assignedTo: memberId });

        const res = await request(app)
            .get("/api/v1/leads")
            .set(authHeader(memberToken));

        expect(res.status).toBe(200);
        // Member should only see their assigned lead
        expect(res.body.data.leads.length).toBe(1);
        expect(res.body.data.leads[0].firstName).toBe("Assigned");
    });

    it("member gets 403 when directly fetching an unassigned lead by ID", async () => {
        const createRes = await request(app)
            .post("/api/v1/leads")
            .set(authHeader(adminToken))
            .send({ firstName: "Private", email: "private@test.com" });

        const leadId = createRes.body.data._id;

        const res = await request(app)
            .get(`/api/v1/leads/${leadId}`)
            .set(authHeader(memberToken));

        expect(res.status).toBe(403);
    });
});
