import { Router } from "express";
import { updateNote, deleteNote } from "../controllers/note.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";

const router = Router();

router.patch("/:id", authenticateUser, updateNote);
router.delete("/:id", authenticateUser, deleteNote);

export default router;
