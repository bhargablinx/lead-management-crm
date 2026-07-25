/**
 * Public Submission Test Suite
 *
 * Covers:
 * - Valid anonymous lead submission via the public form endpoint
 * - Missing required fields
 * - Unknown organization slug → 404
 * - Suspended organization → 403
 */

import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../app.js";
import { Activity } from "../models/activity.model.js";
import { ActivityType } from "../models/activity.model.js";
import { createAdminUser, createTestOrg } from "./helpers.js";

describe("POST /api/v1/leads/public/:orgSlug — public lead submission", () => {
    let orgSlug: string;

    beforeEach(async () => {
        orgSlug = `pub-org-${Date.now()}`;
        const org = await createTestOrg(orgSlug);
        // Admin user needed so logActivity in createPublicLead can resolve an admin
        await createAdminUser(org._id as any, { email: `admin@${orgSlug}.test` });
    });

    it("returns 201 and creates a lead with source = 'Public Form' on valid submission", async () => {
        const res = await request(app)
            .post(`/api/v1/leads/public/${orgSlug}`)
            .send({
                firstName: "John",
                lastName: "Doe",
                email: "john.doe@external.com",
                phone: "9876543210",
                company: "External Corp",
            });

        expect(res.status).toBe(201);
        expect(res.body.data.firstName).toBe("John");
        expect(res.body.data.email).toBe("john.doe@external.com");
        expect(res.body.data.source).toBe("Public Form");
        expect(res.body.data.status).toBe("new");
    });

    it("logs a LEAD_CREATED activity after public submission", async () => {
        const res = await request(app)
            .post(`/api/v1/leads/public/${orgSlug}`)
            .send({ firstName: "Jane", email: "jane@external.com" });

        expect(res.status).toBe(201);

        const activity = await Activity.findOne({
            leadId: res.body.data._id,
            type: ActivityType.LEAD_CREATED,
        });
        expect(activity).not.toBeNull();
        expect(activity!.description).toContain("Jane");
    });

    it("accepts a custom source value from the form body", async () => {
        const res = await request(app)
            .post(`/api/v1/leads/public/${orgSlug}`)
            .send({ firstName: "Tom", email: "tom@external.com", source: "Website Referral" });

        expect(res.status).toBe(201);
        expect(res.body.data.source).toBe("Website Referral");
    });

    it("returns 400 when firstName is missing", async () => {
        const res = await request(app)
            .post(`/api/v1/leads/public/${orgSlug}`)
            .send({ email: "nofirst@external.com" });

        expect(res.status).toBe(400);
    });

    it("returns 400 when email is missing", async () => {
        const res = await request(app)
            .post(`/api/v1/leads/public/${orgSlug}`)
            .send({ firstName: "NoEmail" });

        expect(res.status).toBe(400);
    });

    it("returns 404 when the organization slug does not exist", async () => {
        const res = await request(app)
            .post("/api/v1/leads/public/definitely-nonexistent-slug")
            .send({ firstName: "Ghost", email: "ghost@test.com" });

        expect(res.status).toBe(404);
    });

    it("returns 403 when the organization is suspended", async () => {
        const suspendedSlug = `suspended-${Date.now()}`;
        await createTestOrg(suspendedSlug, { isActive: false });

        const res = await request(app)
            .post(`/api/v1/leads/public/${suspendedSlug}`)
            .send({ firstName: "Sus", email: "sus@test.com" });

        expect(res.status).toBe(403);
    });
});
