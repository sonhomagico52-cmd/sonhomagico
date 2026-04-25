/**
 * server/routes/team.ts — Escalas e mensagens da equipe
 * Sonho Mágico Joinville CRM
 */
import { Router } from "express";
import { nanoid } from "nanoid";
import { query } from "../db.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import type { RowDataPacket } from "mysql2";

interface AssignmentRow extends RowDataPacket {
    id: string;
    event_id: string;
    member_id: string;
    function_label: string;
    status: "confirmed" | "pending";
    notes: string | null;
    created_at: string;
}

interface MessageRow extends RowDataPacket {
    id: string;
    author_id: string;
    event_id: string | null;
    recipient_ids: string;
    title: string;
    content: string;
    channel: "app" | "whatsapp" | "both";
    created_at: string;
}

function fmtAssignment(row: AssignmentRow) {
    return {
        id: row.id, eventId: row.event_id, memberId: row.member_id,
        functionLabel: row.function_label, status: row.status,
        notes: row.notes, createdAt: row.created_at,
    };
}

function fmtMessage(row: MessageRow) {
    return {
        id: row.id, authorId: row.author_id, eventId: row.event_id,
        recipientIds: JSON.parse(row.recipient_ids),
        title: row.title, content: row.content, channel: row.channel,
        createdAt: row.created_at,
    };
}

const router = Router();

// ───────────────────────────── Assignments ─────────────────────────────

router.get("/assignments", requireAuth, async (_req, res) => {
    const rows = await query<AssignmentRow[]>("SELECT * FROM team_assignments ORDER BY created_at DESC");
    res.json(rows.map(fmtAssignment));
});

router.post("/assignments", requireAdmin, async (req, res) => {
    const { eventId, memberId, functionLabel, status, notes } = req.body as Record<string, unknown>;
    if (!eventId || !memberId) { res.status(400).json({ error: "eventId e memberId são obrigatórios" }); return; }
    const id = nanoid();
    await query(
        "INSERT INTO team_assignments (id, event_id, member_id, function_label, status, notes) VALUES (?,?,?,?,?,?)",
        [id, eventId, memberId, functionLabel || "", status || "pending", notes || null]
    );
    const rows = await query<AssignmentRow[]>("SELECT * FROM team_assignments WHERE id = ?", [id]);
    res.status(201).json(fmtAssignment(rows[0]));
});

router.patch("/assignments/:id", requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { functionLabel, status, notes } = req.body as Record<string, unknown>;
    const fields: string[] = [];
    const values: unknown[] = [];
    if (functionLabel !== undefined) { fields.push("function_label = ?"); values.push(functionLabel); }
    if (status !== undefined) { fields.push("status = ?"); values.push(status); }
    if (notes !== undefined) { fields.push("notes = ?"); values.push(notes); }
    if (fields.length === 0) { res.status(400).json({ error: "Nenhum campo para atualizar" }); return; }
    values.push(id);
    await query(`UPDATE team_assignments SET ${fields.join(", ")} WHERE id = ?`, values);
    const rows = await query<AssignmentRow[]>("SELECT * FROM team_assignments WHERE id = ?", [id]);
    res.json(fmtAssignment(rows[0]));
});

router.delete("/assignments/:id", requireAdmin, async (req, res) => {
    await query("DELETE FROM team_assignments WHERE id = ?", [req.params.id]);
    res.json({ success: true });
});

// ────────────────────────────── Messages ───────────────────────────────

router.get("/messages", requireAuth, async (_req, res) => {
    const rows = await query<MessageRow[]>("SELECT * FROM crew_messages ORDER BY created_at DESC");
    res.json(rows.map(fmtMessage));
});

router.post("/messages", requireAdmin, async (req, res) => {
    const { eventId, recipientIds, title, content, channel } = req.body as Record<string, unknown>;
    if (!title || !content) { res.status(400).json({ error: "Título e conteúdo são obrigatórios" }); return; }
    const id = nanoid();
    await query(
        "INSERT INTO crew_messages (id, author_id, event_id, recipient_ids, title, content, channel) VALUES (?,?,?,?,?,?,?)",
        [id, req.jwtUser!.userId, eventId || null, JSON.stringify(recipientIds || []),
            title, content, channel || "app"]
    );
    const rows = await query<MessageRow[]>("SELECT * FROM crew_messages WHERE id = ?", [id]);
    res.status(201).json(fmtMessage(rows[0]));
});

router.delete("/messages/:id", requireAdmin, async (req, res) => {
    await query("DELETE FROM crew_messages WHERE id = ?", [req.params.id]);
    res.json({ success: true });
});

export default router;
