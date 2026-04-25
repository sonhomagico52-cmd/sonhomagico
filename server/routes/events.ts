/**
 * server/routes/events.ts — CRUD de eventos
 * Sonho Mágico Joinville CRM
 */
import { Router } from "express";
import { nanoid } from "nanoid";
import { query } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import type { RowDataPacket } from "mysql2";

interface EventRow extends RowDataPacket {
    id: string;
    client_id: string;
    title: string;
    event_date: string;
    event_time: string;
    location: string;
    attendees: number;
    service: string;
    status: "pending" | "confirmed" | "completed" | "cancelled";
    budget: string | null;
    notes: string | null;
    created_at: string;
}

function formatEvent(row: EventRow) {
    return {
        id: row.id,
        clientId: row.client_id,
        title: row.title,
        date: row.event_date,
        time: row.event_time,
        location: row.location,
        attendees: row.attendees,
        service: row.service,
        status: row.status,
        budget: row.budget ? parseFloat(row.budget) : undefined,
        notes: row.notes,
        createdAt: row.created_at,
    };
}

const router = Router();

// GET /api/events
router.get("/", requireAuth, async (req, res) => {
    const { role, userId } = req.jwtUser!;
    let rows: EventRow[];
    if (role === "admin" || role === "crew") {
        rows = await query<EventRow[]>("SELECT * FROM events ORDER BY event_date DESC");
    } else {
        rows = await query<EventRow[]>("SELECT * FROM events WHERE client_id = ? ORDER BY event_date DESC", [userId]);
    }
    res.json(rows.map(formatEvent));
});

// POST /api/events
router.post("/", requireAuth, async (req, res) => {
    const { role, userId } = req.jwtUser!;
    const { clientId, title, date, time, location, attendees, service, status, budget, notes } =
        req.body as Record<string, unknown>;

    const targetClientId = role === "admin" ? (clientId || userId) : userId;
    if (!title || !date) {
        res.status(400).json({ error: "Título e data são obrigatórios" });
        return;
    }

    const id = nanoid();
    await query(
        `INSERT INTO events (id, client_id, title, event_date, event_time, location, attendees, service, status, budget, notes)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
        [id, targetClientId, title, date, time || "", location || "", attendees || 0, service || "", status || "pending",
            budget || null, notes || null]
    );
    const rows = await query<EventRow[]>("SELECT * FROM events WHERE id = ?", [id]);
    res.status(201).json(formatEvent(rows[0]));
});

// PATCH /api/events/:id
router.patch("/:id", requireAuth, async (req, res) => {
    const { role, userId } = req.jwtUser!;
    const { id } = req.params;

    const existing = await query<EventRow[]>("SELECT * FROM events WHERE id = ? LIMIT 1", [id]);
    if (!existing[0]) { res.status(404).json({ error: "Evento não encontrado" }); return; }
    if (role !== "admin" && existing[0].client_id !== userId) {
        res.status(403).json({ error: "Sem permissão" }); return;
    }

    const { title, date, time, location, attendees, service, status, budget, notes } =
        req.body as Record<string, unknown>;

    const fields: string[] = [];
    const values: unknown[] = [];
    if (title !== undefined) { fields.push("title = ?"); values.push(title); }
    if (date !== undefined) { fields.push("event_date = ?"); values.push(date); }
    if (time !== undefined) { fields.push("event_time = ?"); values.push(time); }
    if (location !== undefined) { fields.push("location = ?"); values.push(location); }
    if (attendees !== undefined) { fields.push("attendees = ?"); values.push(attendees); }
    if (service !== undefined) { fields.push("service = ?"); values.push(service); }
    if (status !== undefined) { fields.push("status = ?"); values.push(status); }
    if (budget !== undefined) { fields.push("budget = ?"); values.push(budget || null); }
    if (notes !== undefined) { fields.push("notes = ?"); values.push(notes); }

    if (fields.length === 0) { res.status(400).json({ error: "Nenhum campo para atualizar" }); return; }
    values.push(id);
    await query(`UPDATE events SET ${fields.join(", ")} WHERE id = ?`, values);
    const rows = await query<EventRow[]>("SELECT * FROM events WHERE id = ?", [id]);
    res.json(formatEvent(rows[0]));
});

// DELETE /api/events/:id
router.delete("/:id", requireAuth, async (req, res) => {
    const { role, userId } = req.jwtUser!;
    const { id } = req.params;
    const existing = await query<EventRow[]>("SELECT * FROM events WHERE id = ? LIMIT 1", [id]);
    if (!existing[0]) { res.status(404).json({ error: "Evento não encontrado" }); return; }
    if (role !== "admin" && existing[0].client_id !== userId) {
        res.status(403).json({ error: "Sem permissão" }); return;
    }
    await query("DELETE FROM events WHERE id = ?", [id]);
    res.json({ success: true });
});

export default router;
