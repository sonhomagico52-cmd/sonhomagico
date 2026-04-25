/**
 * server/routes/auth.ts — Autenticação
 * Sonho Mágico Joinville CRM
 */
import { Router } from "express";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { query } from "../db.js";
import { signToken, requireAuth } from "../middleware/auth.js";
import type { RowDataPacket } from "mysql2";

interface UserRow extends RowDataPacket {
    id: string;
    name: string;
    email: string;
    password_hash: string;
    phone: string;
    role: "client" | "admin" | "crew";
    access_level: string;
    custom_permissions: string | null;
    address: string | null;
    city: string | null;
    notes: string | null;
    specialties: string | null;
    availability: string | null;
    app_installed: number;
    created_at: string;
}

const COOKIE_OPTIONS = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
};

function safeParse(str: string | null | undefined, fallback: any = null) {
    if (!str) return fallback;
    try {
        return JSON.parse(str);
    } catch {
        return fallback;
    }
}

export function formatUser(row: UserRow) {
    return {
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        role: row.role,
        accessLevel: row.access_level,
        customPermissions: safeParse(row.custom_permissions),
        address: row.address,
        city: row.city,
        notes: row.notes,
        specialties: safeParse(row.specialties, []),
        availability: row.availability,
        appInstalled: !!row.app_installed,
        createdAt: row.created_at,
    };
}

const router = Router();

// POST /api/auth/login
router.post("/login", async (req, res) => {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
        res.status(400).json({ error: "Email e senha são obrigatórios" });
        return;
    }

    const rows = await query<UserRow[]>(
        "SELECT * FROM users WHERE email = ? LIMIT 1",
        [email.trim().toLowerCase()]
    );

    const user = rows[0];
    if (!user) {
        res.status(401).json({ error: "Credenciais inválidas" });
        return;
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
        res.status(401).json({ error: "Credenciais inválidas" });
        return;
    }

    const token = signToken({ userId: user.id, role: user.role, accessLevel: user.access_level });
    res.cookie("auth_token", token, COOKIE_OPTIONS);
    res.json({ user: formatUser(user) });
});

// POST /api/auth/register
router.post("/register", async (req, res) => {
    const { name, email, password, phone } = req.body as {
        name?: string;
        email?: string;
        password?: string;
        phone?: string;
    };

    if (!name || !email || !password) {
        res.status(400).json({ error: "Nome, email e senha são obrigatórios" });
        return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await query<RowDataPacket[]>(
        "SELECT id FROM users WHERE email = ? LIMIT 1",
        [normalizedEmail]
    );

    if (existing.length > 0) {
        res.status(409).json({ error: "E-mail já cadastrado" });
        return;
    }

    const id = nanoid();
    const hash = await bcrypt.hash(password, 12);

    await query(
        `INSERT INTO users (id, name, email, password_hash, phone, role, access_level, custom_permissions,
      specialties, availability, notes, address, city, app_installed)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,0)`,
        [
            id,
            name,
            normalizedEmail,
            hash,
            phone || "",
            "client",
            "client",
            null,
            null,
            null,
            null,
            null,
            null,
        ]
    );

    const rows = await query<UserRow[]>("SELECT * FROM users WHERE id = ? LIMIT 1", [id]);
    const user = rows[0];
    const token = signToken({ userId: user.id, role: user.role, accessLevel: user.access_level });
    res.cookie("auth_token", token, COOKIE_OPTIONS);
    res.status(201).json({ user: formatUser(user) });
});

// GET /api/auth/me
router.get("/me", requireAuth, async (req, res) => {
    const rows = await query<UserRow[]>(
        "SELECT * FROM users WHERE id = ? LIMIT 1",
        [req.jwtUser!.userId]
    );
    const user = rows[0];
    if (!user) {
        res.status(404).json({ error: "Usuário não encontrado" });
        return;
    }
    res.json({ user: formatUser(user) });
});

// POST /api/auth/logout
router.post("/logout", (_req, res) => {
    res.clearCookie("auth_token");
    res.json({ success: true });
});

export default router;
