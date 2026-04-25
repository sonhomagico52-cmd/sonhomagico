/**
 * server/db.ts — Pool de conexão MySQL
 * Sonho Mágico Joinville CRM
 */
import mysql from "mysql2/promise";
import type { QueryResult, RowDataPacket } from "mysql2";

let pool: mysql.Pool | null = null;

export function getPool(): mysql.Pool {
    if (!pool) {
        pool = mysql.createPool({
            host: process.env.MYSQL_HOST || "127.0.0.1",
            port: Number(process.env.MYSQL_PORT) || 3306,
            database: process.env.MYSQL_DATABASE || "sonho_magico",
            user: process.env.MYSQL_USER || "sonho_magico",
            password: process.env.MYSQL_PASSWORD || "",
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            timezone: "-03:00",
        });
    }
    return pool;
}

export async function query<T extends QueryResult | RowDataPacket[] = RowDataPacket[]>(
    sql: string,
    values?: unknown[] | Record<string, unknown>
): Promise<T> {
    const [rows] = await getPool().execute<T>(sql, values as never);
    return rows;
}
