import { Router } from "express";
import { saveSession, getMySessions, getSession } from "../controllers/sessionController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router()

router.use(authMiddleware)

router.post("/", saveSession)
router.get("/", getMySessions)
router.get("/id", getSession)

export default router