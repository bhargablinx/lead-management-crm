import { Router } from "express";
import { createLead, getLeads, getLeadById, updateLead, deleteLead, assignLead, createPublicLead } from "../controllers/lead.controller.js";
import { createNote, getLeadNotes } from "../controllers/note.controller.js";
import { getLeadActivities } from "../controllers/activity.controller.js";
import { authenticateUser, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

// Public Lead endpoint (requires no authentication)
router.post("/public/:orgSlug", createPublicLead);

// Base Lead endpoints
router.post("/", authenticateUser, createLead);
router.get("/", authenticateUser, getLeads);
router.get("/:id", authenticateUser, getLeadById);
router.patch("/:id", authenticateUser, updateLead);
router.delete("/:id", authenticateUser, authorizeRoles("admin"), deleteLead);

// Lead Assignment endpoint
router.patch("/:id/assign", authenticateUser, authorizeRoles("admin"), assignLead);

// Nested Note endpoints
router.post("/:id/notes", authenticateUser, createNote);
router.get("/:id/notes", authenticateUser, getLeadNotes);

// Nested Activity endpoints
router.get("/:id/activities", authenticateUser, getLeadActivities);

export default router;
