import { Response, NextFunction } from "express";
import { AuthRequest } from "./authMiddleware";

export function requireRole(...roles: string[]) {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        const userRole = req.userRole

        if (!userRole) {
            res.status(403).json({ error: "No role found on request" })
            return
        }

        if (!roles.includes(userRole)) {
            res.status(403).json({ error: "Insufficient permissions" })
            return
        }

        next()
    }
}