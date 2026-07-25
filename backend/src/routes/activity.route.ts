import { Router } from "express";
import { getOrganizationActivities } from "../controllers/activity.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", authenticateUser, getOrganizationActivities);

export default router;
