/**
 * server/routes/quotes.ts — CRUD de orçamentos
 * Sonho Mágico Joinville CRM
 */
import { Router } from "express";
import { nanoid } from "nanoid";
import { query } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import type { RowDataPacket } from "mysql2";

interface QuoteRow extends RowDataPacket {
    id: string;
    client_id: string;
    event_id: string | null;
    title: string;
    description: string;
    amount: string;
    status: "pending" | "approved" | "rejected";
    created_at: string;
}

function formatQuote(row: QuoteRow) {
    return {
        id: row.id,
        clientId: row.client_id,
        eventId: row.event_id,
        title: row.title,
        description: row.description,
        amount: parseFloat(row.amount),
        status: row.status,
        createdAt: row.created_at,
    };
}

const router = Router();

// GET /api/quotes
router.get("/", requireAuth, async (req, res) => {
    const { role, userId } = req.jwtUser!;
    let rows: QuoteRow[];
    if (role === "admin") {
        rows = await query<QuoteRow[]>("SELECT * FROM quotes ORDER BY created_at DESC");
    } else {
        rows = await query<QuoteRow[]>("SELECT * FROM quotes WHERE client_id = ? ORDER BY created_at DESC", [userId]);
    }
    res.json(rows.map(formatQuote));
});

// POST /api/quotes
router.post("/", requireAuth, async (req, res) => {
    const { userId, role } = req.jwtUser!;
    const { clientId, eventId, title, description, amount, status } = req.body as Record<string, unknown>;
    if (!title) { res.status(400).json({ error: "Título é obrigatório" }); return; }

    const id = nanoid();
    const targetClient = role === "admin" ? (clientId || userId) : userId;
    await query(
        "INSERT INTO quotes (id, client_id, event_id, title, description, amount, status) VALUES (?,?,?,?,?,?,?)",
        [id, targetClient, eventId || null, title, description || "", amount || 0, status || "pending"]
    );
    const rows = await query<QuoteRow[]>("SELECT * FROM quotes WHERE id = ?", [id]);
    res.status(201).json(formatQuote(rows[0]));
});

// PATCH /api/quotes/:id
router.patch("/:id", requireAuth, async (req, res) => {
    const { role, userId } = req.jwtUser!;
    const { id } = req.params;
    const existing = await query<QuoteRow[]>("SELECT * FROM quotes WHERE id = ? LIMIT 1", [id]);
    if (!existing[0]) { res.status(404).json({ error: "Orçamento não encontrado" }); return; }
    if (role !== "admin" && existing[0].client_id !== userId) {
        res.status(403).json({ error: "Sem permissão" }); return;
    }

    const { title, description, amount, status, eventId } = req.body as Record<string, unknown>;
    const fields: string[] = [];
    const values: unknown[] = [];
    if (title !== undefined) { fields.push("title = ?"); values.push(title); }
    if (description !== undefined) { fields.push("description = ?"); values.push(description); }
    if (amount !== undefined) { fields.push("amount = ?"); values.push(amount); }
    if (status !== undefined) { fields.push("status = ?"); values.push(status); }
    if (eventId !== undefined) { fields.push("event_id = ?"); values.push(eventId || null); }

    if (fields.length === 0) { res.status(400).json({ error: "Nenhum campo para atualizar" }); return; }
    values.push(id);
    await query(`UPDATE quotes SET ${fields.join(", ")} WHERE id = ?`, values);
    const rows = await query<QuoteRow[]>("SELECT * FROM quotes WHERE id = ?", [id]);
    res.json(formatQuote(rows[0]));
});

// DELETE /api/quotes/:id — admin apenas
router.delete("/:id", requireAuth, async (req, res) => {
    const { role } = req.jwtUser!;
    if (role !== "admin") { res.status(403).json({ error: "Sem permissão" }); return; }
    await query("DELETE FROM quotes WHERE id = ?", [req.params.id]);
    res.json({ success: true });
});

export default router;
