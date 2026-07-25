import { Router } from "express";
import { createOrganization, getOrganization, updateOrganization, deleteOrganization } from "../controllers/organization.controller.js";
import { authenticateUser, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", createOrganization);
router.get("/", authenticateUser, getOrganization);
router.patch("/", authenticateUser, authorizeRoles("admin"), updateOrganization);
router.delete("/", authenticateUser, authorizeRoles("admin"), deleteOrganization);

export default router;
