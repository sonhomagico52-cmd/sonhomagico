/**
 * server/seed.ts — Popula o banco com usuário admin inicial
 * Executar apenas uma vez: npx tsx server/seed.ts
 */
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { getPool } from "./db.js";

const ADMIN_EMAIL = "admin@sonhomagico.com";
const ADMIN_PASSWORD = process.env.ADMIN_INITIAL_PASSWORD || "Admin@SMJ2026!";

async function seed() {
    const pool = getPool();
    const [existing] = await pool.execute(
        "SELECT id FROM users WHERE email = ? LIMIT 1",
        [ADMIN_EMAIL]
    );

    if ((existing as unknown[]).length > 0) {
        console.log("✅ Usuário admin já existe. Nada a fazer.");
        await pool.end();
        return;
    }

    const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);
    const id = nanoid();

    await pool.execute(
        `INSERT INTO users (id, name, email, password_hash, phone, role, access_level)
     VALUES (?, ?, ?, ?, ?, 'admin', 'super_admin')`,
        [id, "Admin Sonho Mágico", ADMIN_EMAIL, hash, "(47) 99944-7152"]
    );

    console.log("✅ Usuário admin criado!");
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Senha: ${ADMIN_PASSWORD}`);
    console.log("   ⚠️  Guarde esta senha em local seguro e altere após o primeiro acesso.");
    await pool.end();
}

seed().catch((err) => {
    console.error("❌ Erro no seed:", err);
    process.exit(1);
});
