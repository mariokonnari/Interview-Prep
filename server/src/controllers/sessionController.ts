import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middleware/authMiddleware";

const prisma = new PrismaClient();

interface ResultInput {
    questionId: number
    category: string
    questionText: string
    answer: string
    score: number
    feedback: string
}

interface SessionParams {
    id: string
}

export async function saveSession(req: AuthRequest, res: Response) : Promise<void> {
    const { results, totalQuestions } = req.body as {
        results: ResultInput[]
        totalQuestions: number
    }

    if (!results || !Array.isArray(results) || results.length === 0) {
        res.status(400).json({ error: "Results array is required and cannot be empty" })
        return
    }

    try{
        const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length
        const totalScore = results.reduce((sum, r) => sum + r.score, 0)

        const session = await prisma.session.create({
            data: {
                userId: req.userId!,
                totalScore,
                avgScore,
                answeredCount: results.length,
                totalQuestions: totalQuestions ?? results.length,
                results: {
                    create: results.map((r) => ({
                        questionId: r.questionId,
                        category: r.category,
                        questionText: r.questionText,
                        answer: r.answer,
                        score: r.score,
                        feedback: r.feedback,
                    })),
                },
            },
            include: { results: true },
        })
        res.status(201).json({ session })
    } catch (err) {
        console.error("saveSession error:", err)
        res.status(500).json({ error: "Failed to save session" })
    }
}

export async function getMySessions(req: AuthRequest, res: Response): Promise<void> {
    try {
        const sessions = await prisma.session.findMany({
            where: { userId: req.userId },
            orderBy: { completedAt: 'desc' },
            take: 20,
            include: {
                results: {
                    select: {
                        questionId: true,
                        category: true,
                        score: true,
                        feedback: true,
                    },
                },
            },
        })
        res.json({ sessions })
    } catch (err) {
        console.error('getMySessions:', err)
        res.status(500).json({ error: 'Failed to fetch sessions' })
    }
}

export async function getSession(req: AuthRequest & { params: SessionParams}, res: Response): Promise<void> {
    const { id } = req.params

    try {
        const session = await prisma.session.findFirst({
            where: { id, userId: req.userId },
            include: { results: true },
        })

        if (!session) {
            res.status(404).json({ error: 'Session not found' })
            return
        }
        res.json({ session })
    } catch (err) {
        console.error('getSession error:', err)
        res.status(500).json({ error: 'Failed to fetch session' })
    }
}