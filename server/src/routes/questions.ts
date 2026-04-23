import { Router } from "express";
import prisma from "../lib/prisma";

const router = Router()

router.get('/', async (_req, res) => {
    try {
        const questions = await prisma.question.findMany({
            where: { active: true },
            orderBy: { id: 'asc' },
            select: { id: true, category: true, text: true, hint: true },
        })
        res.json({ questions })
    } catch (err) {
        console.error('getQuestions error:', err)
        res.status(500).json({ error: 'Failed to fetch questions' })
    }
})

export default router