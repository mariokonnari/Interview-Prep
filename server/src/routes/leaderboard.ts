import { Router } from "express";
import { getLeaderboard, getMyStats } from "../controllers/leaderboardController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router()

router.get("/", getLeaderboard)
router.get("/my-stats", getMyStats)

export default router