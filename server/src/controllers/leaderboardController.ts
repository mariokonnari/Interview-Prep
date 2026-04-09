import { Request, Response } from "express";
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from "../middleware/authMiddleware";
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

export async function getLeaderboard(_req: Request, res: Response): Promise<void> {
    try{
        //Best single session per user ranked by average score
        const topSessions = await prisma.session.findMany({
            orderBy: { avgScore: 'desc' },
            take: 20,
            distinct: ['userId'],
            select: {
                id: true,
                avgScore: true,
                answeredCount: true,
                totalQuestions: true,
                completedAt: true,
                user: {
                    select: { username: true },
                },
            },
        })

        const leaderboard = topSessions.map((s, index) => ({
            rank: index + 1,
            username: s.user.username,
            avgScore: Math.round(s.avgScore * 10) / 10,
            answeredCount: s.answeredCount,
            totalQuestions: s.totalQuestions,
            completedAt: s.completedAt,
        }))
        res.json({ leaderboard })
    } catch (err) {
        console.error('getLeaderboard error:', err)
        res.status(500).json({ error: 'Failed to fetch leaderboard'})
    }
}

export async function getMyStats(req: AuthRequest, res: Response): Promise<void> {
    try {
        const sessions = await prisma.session.findMany({
            where: { userId: req.userId },
            orderBy: { completedAt: 'desc' },
        })

        if (sessions.length === 0) {
            res.json({
                stats: {
                    totalSessions: 0,
                    bestAvgScore: 0,
                    overallAvgScore: 0,
                    totalQuestionsAnswered: 0,
                    categoryBreakdown: [],
                },
            })
            return
        }

        const totalSessions = sessions.length
        const bestAvgScore = Math.max(...sessions.map((s) => s.avgScore))
        const overallAvgScore = sessions.reduce((sum, s) => sum + s.avgScore, 0) / totalSessions
        const totalQuestionsAnswered = sessions.reduce((sum, s) => s.answeredCount, 0)

        const allResults = await prisma.sessionResult.findMany({
            where: { session: { userId: req.userId } },
            select: { category: true, score: true },
        })

        const categoryMap = new Map<string, { total: number; count: number }>()
        for (const r of allResults) {
            const existing = categoryMap.get(r.category) ?? { total: 0, count: 0 }
            categoryMap.set(r.category, {
                total: existing.total + r.score,
                count: existing.count + 1,
            })
        }

        const categoryBreakdown = Array.from(categoryMap.entries()).map(
            ([category, data]) => ({
                category,
                avgScore: Math.round((data.total / data.count) * 10) / 10,
                questionsAnswered: data.count
            })
        )

        res.json({
            stats: {
                totalSessions,
                bestAvgScore: Math.round(bestAvgScore * 10) / 10,
                overallAvgScore: Math.round(overallAvgScore * 10) / 10,
                totalQuestionsAnswered,
                categoryBreakdown,
            },
        })
    } catch (err) {
        console.error('getMyStats error:', err)
        res.status(500).json({ error: 'Failed to fetch stats' })
    }
}