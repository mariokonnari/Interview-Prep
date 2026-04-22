import { AuthRequest } from "../middleware/authMiddleware";
import { Response } from "express";
import prisma from "../lib/prisma";

// Questions

export async function getQuestions(_req: AuthRequest, res: Response): Promise<void> {
    try {
        const questions = await prisma.question.findMany({
            orderBy: { id: 'asc' },
        })
        res.json({ questions })
    } catch (err) {
        console.error('getQuestions error:', err)
        res.status(500).json({ error: 'Failed to fetch questions' })
    }
}

export async function createQuestion(req: AuthRequest, res: Response): Promise<void> {
    const { category, text, hint } = req.body

    if (!category || !text || !hint) {
        res.status(400).json({ error: "category, text, and hint are required" })
        return
    }

    try {
        const question = await prisma.question.create({
            data: {
                category,
                text,
                hint,
                createdBy: req.userId!,
            },
        })
        res.status(201).json({ question })
    } catch (err) {
        console.error("createQuestion error:", err)
        res.status(500).json({ error: 'Failed to create question' })
    }
}

export async function updateQuestion(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params
    const { category, text, hint, active } = req.body

    try {
        const question = await prisma.question.update({
            where: { id: parseInt(id as string) },
            data: { category, text, hint, active }
        })
        res.json({ question })
    } catch (err) {
        console.error("updateQuestion error:", err)
        res.status(500).json({ error: "Failed to update question" })
    }
}

export async function deleteQuestion(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params
    
    try {
        await prisma.question.delete({
            where: { id: parseInt(id as string)}
        })
        res.json({ message: "Question deleted" })
    } catch (err) {
        console.error('deleteQuestion error:', err)
        res.status(500).json({ error: "Failed to delete question" })
    }
}

// Users

export async function getUsers(_req:AuthRequest, res: Response): Promise<void> {
    try {
        const users = await prisma.user.findMany({
            select: { 
                id: true, 
                email: true, 
                username: true, 
                role: true, 
                createdAt: true, 
                _count: { select: { sessions: true } },
            },
            orderBy: { createdAt: 'desc' },
        })
        res.json({ users })
    } catch (err) {
        console.error('getUsers error:', err)
        res.status(500).json({ error: "Failed to fetch users" })
    }
}

export async function updateUserRole(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params
    const { role } = req.body

    if (!['USER', 'ADMIN'].includes(role)) {
        res.status(400).json({ error: "Role must be USER or ADMIN" })
        return
    }

    if (id === req.userId) {
        res.status(400).json({ error: "You cannot change your own role" })
        return
    }

    try {
        const user = await prisma.user.update({
            where: { id: id as string },
            data: { role },
            select: {
                id: true,
                email: true,
                username: true,
                role: true,
            },
        })
        res.json({ user })
    } catch (err) {
        console.error("updateUserRole error:", err)
        res.status(500).json({ error: "Failed to update user role" })
    }
}

export async function deleteUser(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params

    if (id === req.userId) {
        res.status(400).json({ error: "You cannot delete your own account" })
        return
    }

    try {
        await prisma.user.delete({ where: { id: id as string } })
        res.json({ message: "User deleted" })
    } catch (err) {
        console.error("deleteUser error:", err)
        res.status(500).json({ error: "Failed to delete user" })
    }
}