import { Router } from "express";
import { createUser, getUsers, getUserById, updateUser, deleteUser } from "../controllers/user.controller.js";
import { authenticateUser, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", authenticateUser, authorizeRoles("admin"), createUser);
router.get("/", authenticateUser, authorizeRoles("admin"), getUsers);
router.get("/:id", authenticateUser, getUserById);
router.patch("/:id", authenticateUser, updateUser);
router.delete("/:id", authenticateUser, authorizeRoles("admin"), deleteUser);

export default router;
