/**
 * server/routes/users.ts — CRUD de usuários
 * Sonho Mágico Joinville CRM
 */
import { Router } from "express";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { query } from "../db.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { formatUser } from "./auth.js";
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

const router = Router();

// GET /api/users — listagem (admin vê todos, crew vê crew, client vê só si mesmo)
router.get("/", requireAuth, async (req, res) => {
    try {
        const { role, userId } = req.jwtUser!;
        let rows: UserRow[];
        if (role === "admin") {
            rows = await query<UserRow[]>("SELECT * FROM users ORDER BY created_at DESC");
        } else if (role === "crew") {
            rows = await query<UserRow[]>("SELECT * FROM users WHERE role IN ('crew','admin') ORDER BY name");
        } else {
            rows = await query<UserRow[]>("SELECT * FROM users WHERE id = ? LIMIT 1", [userId]);
        }
        res.json(rows.map(formatUser));
    } catch (error) {
        console.error("Erro no GET /api/users:", error);
        res.status(500).json({ error: "Erro interno ao listar usuários" });
    }
});

// POST /api/users — criar usuário (apenas admin)
router.post("/", requireAdmin, async (req, res) => {
    const { name, email, phone, role, accessLevel, password, specialties, availability, notes, address, city, customPermissions, appInstalled } =
        req.body as Record<string, unknown>;

    if (!name || !email || !password) {
        res.status(400).json({ error: "Nome, email e senha são obrigatórios" });
        return;
    }

    try {
        const existing = await query<RowDataPacket[]>("SELECT id FROM users WHERE email = ? LIMIT 1", [
            String(email).toLowerCase(),
        ]);
        if (existing.length > 0) {
            res.status(409).json({ error: "E-mail já cadastrado" });
            return;
        }

        const id = nanoid();
        const hash = await bcrypt.hash(String(password), 12);

        await query(
            `INSERT INTO users (id, name, email, password_hash, phone, role, access_level, custom_permissions,
          specialties, availability, notes, address, city, app_installed)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
                id,
                name,
                String(email).toLowerCase(),
                hash,
                phone || "",
                role || "client",
                accessLevel || "client",
                customPermissions ? JSON.stringify(customPermissions) : null,
                specialties ? JSON.stringify(specialties) : null,
                availability || null,
                notes || null,
                address || null,
                city || null,
                appInstalled ? 1 : 0
            ]
        );

        const rows = await query<UserRow[]>("SELECT * FROM users WHERE id = ?", [id]);
        res.status(201).json(formatUser(rows[0]));
    } catch (error) {
        console.error("Erro ao criar usuário:", error);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
});

// PATCH /api/users/:id
router.patch("/:id", requireAuth, async (req, res) => {
    const { id } = req.params;
    const { role: myRole, userId } = req.jwtUser!;

    // Cliente só pode editar seus próprios dados (e campos limitados)
    if (myRole !== "admin" && userId !== id) {
        res.status(403).json({ error: "Sem permissão" });
        return;
    }

    const { name, email, phone, notes, address, city, availability, specialties, role, accessLevel, customPermissions, appInstalled, password } =
        req.body as Record<string, unknown>;

    try {
        const fields: string[] = [];
        const values: unknown[] = [];

        if (email !== undefined) {
            const emailStr = String(email).toLowerCase();
            const existing = await query<RowDataPacket[]>("SELECT id FROM users WHERE email = ? AND id != ? LIMIT 1", [
                emailStr, id
            ]);
            if (existing.length > 0) {
                res.status(409).json({ error: "E-mail já cadastrado por outro usuário" });
                return;
            }
            fields.push("email = ?");
            values.push(emailStr);
        }

        if (name !== undefined) { fields.push("name = ?"); values.push(name); }
        if (phone !== undefined) { fields.push("phone = ?"); values.push(phone); }
        if (notes !== undefined) { fields.push("notes = ?"); values.push(notes); }
        if (address !== undefined) { fields.push("address = ?"); values.push(address); }
        if (city !== undefined) { fields.push("city = ?"); values.push(city); }
        if (availability !== undefined) { fields.push("availability = ?"); values.push(availability); }
        if (specialties !== undefined) { fields.push("specialties = ?"); values.push(JSON.stringify(specialties)); }
        if (appInstalled !== undefined) { fields.push("app_installed = ?"); values.push(appInstalled ? 1 : 0); }
        // Campos restritos a admin
        if (myRole === "admin") {
            if (role !== undefined) { fields.push("role = ?"); values.push(role); }
            if (accessLevel !== undefined) { fields.push("access_level = ?"); values.push(accessLevel); }
            if (customPermissions !== undefined) { fields.push("custom_permissions = ?"); values.push(JSON.stringify(customPermissions)); }
        }
        if (password) {
            const hash = await bcrypt.hash(String(password), 12);
            fields.push("password_hash = ?");
            values.push(hash);
        }

        if (fields.length === 0) {
            res.status(400).json({ error: "Nenhum campo para atualizar" });
            return;
        }

        values.push(id);
        await query(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, values);
        const rows = await query<UserRow[]>("SELECT * FROM users WHERE id = ?", [id]);
        res.json(formatUser(rows[0]));
    } catch (error) {
        console.error("Erro ao atualizar usuário:", error);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
});

// DELETE /api/users/:id — apenas admin
router.delete("/:id", requireAdmin, async (req, res) => {
    await query("DELETE FROM users WHERE id = ?", [req.params.id]);
    res.json({ success: true });
});

export default router;
