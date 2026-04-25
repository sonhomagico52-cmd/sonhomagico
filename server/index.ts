/**
 * server/index.ts — Servidor Express principal
 * Sonho Mágico Joinville CRM
 */
import express from "express";
import { createServer } from "http";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.js";
import usersRouter from "./routes/users.js";
import eventsRouter from "./routes/events.js";
import quotesRouter from "./routes/quotes.js";
import teamRouter from "./routes/team.js";
import { requireAdmin } from "./middleware/auth.js";
import { loadLocalEnv } from "./loadEnv.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const landingContentPath = path.resolve(process.cwd(), "data", "landing-content.json");

loadLocalEnv();

async function readLandingContent(): Promise<Record<string, unknown>> {
  try {
    const content = await fs.readFile(landingContentPath, "utf-8");
    return JSON.parse(content) as Record<string, unknown>;
  } catch {
    return {};
  }
}

async function writeLandingContent(content: Record<string, unknown>) {
  await fs.mkdir(path.dirname(landingContentPath), { recursive: true });
  await fs.writeFile(landingContentPath, JSON.stringify(content, null, 2), "utf-8");
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  const isProduction = process.env.NODE_ENV === "production";

  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use(express.json({ limit: "25mb" }));
  app.use(cookieParser());

  // Segurança HTTP
  app.use((req, res, next) => {
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    if (isProduction) {
      res.setHeader(
        "Content-Security-Policy",
        "default-src 'self'; connect-src 'self' https: ws: wss:; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https:; font-src 'self' data: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
      );
      res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
    }
    if (req.method === "OPTIONS") {
      res.sendStatus(204);
      return;
    }
    next();
  });

  // Healthcheck
  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      app: "sonho-magico-joinville",
      environment: process.env.NODE_ENV || "development",
      timestamp: new Date().toISOString(),
    });
  });

  // Rotas da API
  app.use("/api/auth", authRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/events", eventsRouter);
  app.use("/api/quotes", quotesRouter);
  app.use("/api/team", teamRouter);

  // Landing content (mantido para compatibilidade)
  app.get("/api/landing-content", async (_req, res) => {
    const content = await readLandingContent();
    res.json(content);
  });

  app.put("/api/landing-content", requireAdmin, async (req, res) => {
    try {
      const current = await readLandingContent();
      const next = {
        ...current,
        ...req.body,
        updatedAt: new Date().toISOString(),
      };
      await writeLandingContent(next);
      res.json({ success: true, updatedAt: next.updatedAt });
    } catch (error) {
      console.error("Failed to save landing content", error);
      res.status(500).json({ success: false, message: "Falha ao salvar conteúdo da landing" });
    }
  });

  // Servir frontend estático em produção
  const staticPath = isProduction
    ? path.resolve(__dirname, "public")
    : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // SPA fallback
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = Number(process.env.PORT) || 6100;
  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${port}/`);
    console.log(`Domínio configurado: https://sonhomagico.re9suainternet.com.br`);
  });
}

startServer().catch(console.error);
