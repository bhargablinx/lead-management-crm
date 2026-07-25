/**
 * Activity Logging Test Suite
 *
 * Verifies that the correct Activity documents are written to the database
 * for each key operation in the lead lifecycle.
 *
 * Covers:
 * - LEAD_CREATED on lead creation
 * - LEAD_ASSIGNED on assignment
 * - STATUS_CHANGED on status update (with metadata)
 * - NOTE_ADDED on note creation
 * - GET /api/v1/leads/:id/activities returns activity list
 */

import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../app.js";
import { Activity, ActivityType } from "../models/activity.model.js";
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
    const org = await createTestOrg("activity-test-org");
    const admin = await createAdminUser(org._id as any, { email: "admin@activity.test" });
    const member = await createMemberUser(org._id as any, { email: "member@activity.test" });

    adminToken = await loginUser(app, admin.email);
    memberToken = await loginUser(app, member.email);
    memberId = (member._id as Types.ObjectId).toString();
});

// ── Activity logging ──────────────────────────────────────────────────────────

describe("Activity logging — LEAD_CREATED", () => {
    it("logs LEAD_CREATED activity when a lead is created", async () => {
        const res = await request(app)
            .post("/api/v1/leads")
            .set(authHeader(adminToken))
            .send({ firstName: "Lena", email: "lena@activity.com" });

        expect(res.status).toBe(201);

        const activities = await Activity.find({ leadId: res.body.data._id });
        const types = activities.map((a) => a.type);
        expect(types).toContain(ActivityType.LEAD_CREATED);
    });
});

describe("Activity logging — LEAD_ASSIGNED", () => {
    it("logs LEAD_ASSIGNED activity when a lead is assigned via PATCH /assign", async () => {
        const createRes = await request(app)
            .post("/api/v1/leads")
            .set(authHeader(adminToken))
            .send({ firstName: "Mike", email: "mike@activity.com" });

        const leadId = createRes.body.data._id;

        await request(app)
            .patch(`/api/v1/leads/${leadId}/assign`)
            .set(authHeader(adminToken))
            .send({ userId: memberId });

        const assignActivity = await Activity.findOne({
            leadId,
            type: ActivityType.LEAD_ASSIGNED,
        });
        expect(assignActivity).not.toBeNull();
        expect(assignActivity!.description).toContain(memberId);
    });

    it("logs LEAD_ASSIGNED when assignment happens at lead creation time", async () => {
        const res = await request(app)
            .post("/api/v1/leads")
            .set(authHeader(adminToken))
            .send({ firstName: "Nina", email: "nina@activity.com", assignedTo: memberId });

        const activities = await Activity.find({ leadId: res.body.data._id });
        const types = activities.map((a) => a.type);
        expect(types).toContain(ActivityType.LEAD_ASSIGNED);
    });
});

describe("Activity logging — STATUS_CHANGED", () => {
    it("logs STATUS_CHANGED with correct metadata when status is updated", async () => {
        const createRes = await request(app)
            .post("/api/v1/leads")
            .set(authHeader(adminToken))
            .send({ firstName: "Oscar", email: "oscar@activity.com" });

        const leadId = createRes.body.data._id;

        await request(app)
            .patch(`/api/v1/leads/${leadId}`)
            .set(authHeader(adminToken))
            .send({ status: "qualified" });

        const statusActivity = await Activity.findOne({
            leadId,
            type: ActivityType.STATUS_CHANGED,
        });

        expect(statusActivity).not.toBeNull();
        expect(statusActivity!.metadata).toMatchObject({
            previousStatus: "new",
            newStatus: "qualified",
        });
    });

    it("does NOT log STATUS_CHANGED when status remains the same", async () => {
        const createRes = await request(app)
            .post("/api/v1/leads")
            .set(authHeader(adminToken))
            .send({ firstName: "Paula", email: "paula@activity.com" });

        const leadId = createRes.body.data._id;

        // Update with same status
        await request(app)
            .patch(`/api/v1/leads/${leadId}`)
            .set(authHeader(adminToken))
            .send({ status: "new", firstName: "Paula Updated" });

        const statusActivity = await Activity.findOne({
            leadId,
            type: ActivityType.STATUS_CHANGED,
        });
        expect(statusActivity).toBeNull();
    });
});

describe("Activity logging — NOTE_ADDED", () => {
    it("logs NOTE_ADDED activity when a member adds a note to an assigned lead", async () => {
        const createRes = await request(app)
            .post("/api/v1/leads")
            .set(authHeader(adminToken))
            .send({ firstName: "Quinn", email: "quinn@activity.com", assignedTo: memberId });

        const leadId = createRes.body.data._id;

        await request(app)
            .post(`/api/v1/leads/${leadId}/notes`)
            .set(authHeader(memberToken))
            .send({ content: "Called the prospect, very interested." });

        const noteActivity = await Activity.findOne({
            leadId,
            type: ActivityType.NOTE_ADDED,
        });

        expect(noteActivity).not.toBeNull();
        expect(noteActivity!.description).toContain("Note added by");
    });
});

// ── GET activities endpoint ───────────────────────────────────────────────────

describe("GET /api/v1/leads/:id/activities", () => {
    it("admin can retrieve the activity trail for a lead", async () => {
        // Create lead → assigns → status change = 3 activities
        const createRes = await request(app)
            .post("/api/v1/leads")
            .set(authHeader(adminToken))
            .send({ firstName: "Rose", email: "rose@activity.com", assignedTo: memberId });

        const leadId = createRes.body.data._id;

        await request(app)
            .patch(`/api/v1/leads/${leadId}`)
            .set(authHeader(adminToken))
            .send({ status: "contacted" });

        const res = await request(app)
            .get(`/api/v1/leads/${leadId}/activities`)
            .set(authHeader(adminToken));

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThanOrEqual(3); // CREATED + ASSIGNED + STATUS_CHANGED
    });

    it("returns 401 when accessing activities without a token", async () => {
        const createRes = await request(app)
            .post("/api/v1/leads")
            .set(authHeader(adminToken))
            .send({ firstName: "Sam", email: "sam@activity.com" });

        const leadId = createRes.body.data._id;

        const res = await request(app).get(`/api/v1/leads/${leadId}/activities`);
        expect(res.status).toBe(401);
    });
});
