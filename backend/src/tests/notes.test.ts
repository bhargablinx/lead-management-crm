/**
 * Notes Test Suite
 *
 * Covers:
 * - Member adds note to an assigned lead → 201 + NOTE_ADDED activity logged
 * - Member cannot add note to an unassigned lead → 403
 * - Empty note content → 400
 * - Admin can view notes on any lead
 * - Member can only view notes on their assigned lead
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

// Lead that is assigned to the member
let assignedLeadId: string;
// Lead that belongs to the org but is NOT assigned
let unassignedLeadId: string;

beforeEach(async () => {
    const org = await createTestOrg("notes-test-org");
    const admin = await createAdminUser(org._id as any, { email: "admin@notes.test" });
    const member = await createMemberUser(org._id as any, { email: "member@notes.test" });

    adminToken = await loginUser(app, admin.email);
    memberToken = await loginUser(app, member.email);
    memberId = (member._id as Types.ObjectId).toString();

    // Create an assigned lead
    const assignedRes = await request(app)
        .post("/api/v1/leads")
        .set(authHeader(adminToken))
        .send({ firstName: "Assigned", email: "assigned@lead.com", assignedTo: memberId });
    assignedLeadId = assignedRes.body.data._id;

    // Create an unassigned lead
    const unassignedRes = await request(app)
        .post("/api/v1/leads")
        .set(authHeader(adminToken))
        .send({ firstName: "Unassigned", email: "unassigned@lead.com" });
    unassignedLeadId = unassignedRes.body.data._id;
});

// ── Create Note ───────────────────────────────────────────────────────────────

describe("POST /api/v1/leads/:id/notes — add note", () => {
    it("member adds a note to their assigned lead → 201 and NOTE_ADDED activity logged", async () => {
        const res = await request(app)
            .post(`/api/v1/leads/${assignedLeadId}/notes`)
            .set(authHeader(memberToken))
            .send({ content: "Spoke to the prospect — interested!" });

        expect(res.status).toBe(201);
        expect(res.body.data.content).toBe("Spoke to the prospect — interested!");
        expect(res.body.data.authorId).toBeDefined();

        const noteActivity = await Activity.findOne({
            leadId: assignedLeadId,
            type: ActivityType.NOTE_ADDED,
        });
        expect(noteActivity).not.toBeNull();
        expect(noteActivity!.description).toContain("Note added by");
    });

    it("admin can also add a note to any lead", async () => {
        const res = await request(app)
            .post(`/api/v1/leads/${unassignedLeadId}/notes`)
            .set(authHeader(adminToken))
            .send({ content: "Admin note on unassigned lead" });

        expect(res.status).toBe(201);
    });

    it("member cannot add a note to an unassigned lead → 403", async () => {
        const res = await request(app)
            .post(`/api/v1/leads/${unassignedLeadId}/notes`)
            .set(authHeader(memberToken))
            .send({ content: "Trying to add unauthorized note" });

        expect(res.status).toBe(403);
    });

    it("returns 400 when note content is empty", async () => {
        const res = await request(app)
            .post(`/api/v1/leads/${assignedLeadId}/notes`)
            .set(authHeader(memberToken))
            .send({ content: "   " }); // whitespace only

        expect(res.status).toBe(400);
    });

    it("returns 400 when content field is missing entirely", async () => {
        const res = await request(app)
            .post(`/api/v1/leads/${assignedLeadId}/notes`)
            .set(authHeader(memberToken))
            .send({});

        expect(res.status).toBe(400);
    });

    it("returns 401 when no auth token is provided", async () => {
        const res = await request(app)
            .post(`/api/v1/leads/${assignedLeadId}/notes`)
            .send({ content: "Unauthenticated note" });

        expect(res.status).toBe(401);
    });
});

// ── Get Notes ────────────────────────────────────────────────────────────────

describe("GET /api/v1/leads/:id/notes — view notes", () => {
    beforeEach(async () => {
        // Seed a note on the assigned lead
        await request(app)
            .post(`/api/v1/leads/${assignedLeadId}/notes`)
            .set(authHeader(adminToken))
            .send({ content: "Initial note" });
    });

    it("admin can retrieve notes for any lead", async () => {
        const res = await request(app)
            .get(`/api/v1/leads/${assignedLeadId}/notes`)
            .set(authHeader(adminToken));

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThan(0);
    });

    it("member can retrieve notes for their assigned lead", async () => {
        const res = await request(app)
            .get(`/api/v1/leads/${assignedLeadId}/notes`)
            .set(authHeader(memberToken));

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("member cannot retrieve notes for an unassigned lead → 403", async () => {
        // Seed a note on unassigned lead (by admin)
        await request(app)
            .post(`/api/v1/leads/${unassignedLeadId}/notes`)
            .set(authHeader(adminToken))
            .send({ content: "Private admin note" });

        const res = await request(app)
            .get(`/api/v1/leads/${unassignedLeadId}/notes`)
            .set(authHeader(memberToken));

        expect(res.status).toBe(403);
    });
});
