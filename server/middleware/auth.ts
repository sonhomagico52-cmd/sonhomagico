/**
 * server/middleware/auth.ts — Middleware de autenticação JWT
 * Sonho Mágico Joinville CRM
 */
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface JwtPayload {
    userId: string;
    role: "client" | "admin" | "crew";
    accessLevel: string;
}

declare global {
    namespace Express {
        interface Request {
            jwtUser?: JwtPayload;
        }
    }
}

function getSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET não configurado no .env");
    return secret;
}

export function signToken(payload: JwtPayload): string {
    return jwt.sign(payload, getSecret(), { expiresIn: "7d" });
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
    const token = req.cookies?.auth_token as string | undefined;
    if (!token) {
        res.status(401).json({ error: "Não autenticado" });
        return;
    }
    try {
        req.jwtUser = jwt.verify(token, getSecret()) as JwtPayload;
        next();
    } catch {
        res.status(401).json({ error: "Token inválido ou expirado" });
    }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
    requireAuth(req, res, () => {
        if (req.jwtUser?.role !== "admin") {
            res.status(403).json({ error: "Acesso restrito a administradores" });
            return;
        }
        next();
    });
}
