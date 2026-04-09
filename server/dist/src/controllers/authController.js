"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.me = me;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../lib/prisma"));
function signToken(userId) {
    const secret = process.env.JWT_SECRET;
    if (!secret)
        throw new Error('JWT_SECRET not configured');
    return jsonwebtoken_1.default.sign({ userId }, secret, {
        expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
    });
}
async function register(req, res) {
    const { email, username, password } = req.body;
    if (!email || !username || !password) {
        res.status(400).json({ error: 'email, username, and password are required' });
        return;
    }
    if (password.length < 8) {
        res.status(400).json({ error: 'Password must be at least 8 characters' });
        return;
    }
    try {
        const existing = await prisma_1.default.user.findFirst({
            where: { OR: [{ email }, { username }] },
        });
        if (existing) {
            const field = existing.email === email ? 'email' : 'username';
            res.status(409).json({ error: `That ${field} is already taken` });
            return;
        }
        const hashed = await bcryptjs_1.default.hash(password, 12);
        const user = await prisma_1.default.user.create({
            data: { email, username, password: hashed },
            select: { id: true, email: true, username: true, createdAt: true },
        });
        const token = signToken(user.id);
        res.status(201).json({ token, user });
    }
    catch (err) {
        console.error('register error:', err);
        res.status(500).json({ error: 'Registration failed' });
    }
}
async function login(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ error: 'email and password are required' });
        return;
    }
    try {
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user || !(await bcryptjs_1.default.compare(password, user.password))) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }
        const token = signToken(user.id);
        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                createdAt: user.createdAt,
            },
        });
    }
    catch (err) {
        console.error('login error:', err);
        res.status(500).json({ error: 'Login failed' });
    }
}
async function me(req, res) {
    try {
        const user = await prisma_1.default.user.findUnique({
            where: { id: req.userId },
            select: { id: true, email: true, username: true, createdAt: true },
        });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json({ user });
    }
    catch (err) {
        console.error('me error:', err);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
}
