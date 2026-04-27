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

export async function joinRoom(req: AuthRequest, res: Response): Promise<void> {
    const { code } = req.body

    if (!code) {
        res.status(400).json({ error: "Room code is required" })
        return
    }

    try {
        const room = await prisma.room.findUnique({
            where: { code: code.toUpperCase() },
            include: { participants: true },
        })

        if (!room) {
            res.status(404).json({ error: "Room not found" })
            return
        }

        if (room.status !== 'waiting') {
            res.status(400).json({ error: "Room is no longer accepting players" })
            return
        }

        if (room.participants.length >= 2) {
            res.status(400).json({ error: 'Room is full' })
            return
        }

        if (room.participants.some((p) => p.userId === req.userId)) {
            res.status(400).json({ error: "You are already in this room" })
            return
        }

        // add guest and set room to active
        await prisma.roomParticipant.create({
            data: { roomId: room.id, userId: req.userId!, role: 'GUEST' },
        })

        const updatedRoom = await prisma.room.update({
            where: { id: room.id },
            data: { status: 'active' },
            include: {
                participants: {
                    include: { user: { select: { id: true, username: true } } },
                },
            },
        })

        res.json({ room: updatedRoom })
    } catch (err) {
        console.error('joinRoom error', err)
        res.status(500).json({ error: 'Failed to join room' })
    }
}

export async function getRoom(req: AuthRequest, res: Response): Promise<void> {
    const { code } = req.params

    try {
        const room = await prisma.room.findUnique({
            where: { code },
            include: { 
                participants: {
                    include: { user: { select: { id: true, username: true } } },
                }
            }
        })

        if (!room) {
            res.status(404).json({ error: 'Room not found' })
            return
        }

        res.json({ room })
    } catch (err) {
        console.error('getRoom error:', err)
        res.status(500).json({ error: 'Failed to get room'})
    }
}

export async function advanceQuestion(req: AuthRequest, res: Response) :Promise<void> {
    const { code } = req.params

    try {
        const room = await prisma.room.findUnique({ where: { code } })

        if (!room) {
            res.status(404).json({ error: 'Room not found' })
            return
        }

        if (room.hostId !== req.userId) {
            res.status(403).json({ error: 'Only the host can advance questions' })
            return
        }

        const updated = await prisma.room.update({
            where: { code },
            data: { currentQ: room.currentQ + 1 },
            include: {
                participants: {
                    include: { user: { select: { id: true, username: true } } }
                }
            }
        })

        res.json({ room: updated })
    } catch (err) {
        console.error('advanceQuestion error:', err)
        res.status(500).json({ error: 'Failed to advance questions' })
    }
}

export async function finishRoom(req: AuthRequest, res: Response): Promise<void> {
    const { code } = req.params

    try {
        const room = await prisma.room.findUnique({
            where: { code }
        })

        if (!room) {
            res.status(404).json({ error: 'Room not found' })
            return
        }

        if (room.hostId !== req.userId) {
            res.status(403).json({ error: "Only the host can finish the room" })
            return
        }

        const updated = await prisma.room.update({
            where: { code },
            data: { status: 'finished' },
            include: {
                participants: {
                    include: { user: { select: { id: true, username: true } } }
                }
            }
        })

        res.json({ room: updated })
    } catch (err) {
        console.error('finishRoom error:', err)
        res.status(500).json({ error: 'Failed to finish room' })
    }
}