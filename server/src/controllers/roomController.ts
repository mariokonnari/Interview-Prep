import { Response } from "express";
import prisma from "../lib/prisma";
import { AuthRequest } from "../middleware/authMiddleware";

function generateCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ23456789'
    return Array.from({ length: 6 }, () =>
        chars[Math.floor(Math.random() * chars.length)]
    ).join('')
}

export async function createRoom(req: AuthRequest, res: Response): Promise<void> {
    try {
        //clean up old waiting rooms by this user
        await prisma.room.deleteMany({
            where: { hostId: req.userId!, status: 'waiting' },
        })

        let code = generateCode()
        let attempts = 0

        //ensure unique code
        while (attempts < 10) {
            const existing = await prisma.room.findUnique({ where: { code } })
            if (!existing) break
            code = generateCode()
            attempts++
        }

        const room = await prisma.room.create({
            data: {
                code,
                hostId: req.userId!,
                participants: {
                    create: {
                        userId: req.userId!,
                        role: 'HOST',
                    },
                },
            },
            include: {
                participants: {
                    include: { user: { select: { id: true, username: true } } },
                },
            },
        })

        res.status(201).json({ room })
    } catch (err) {
        console.error('createRoom error:', err)
        res.status(500).json({ error: 'Failed to create room' })
    }
}

