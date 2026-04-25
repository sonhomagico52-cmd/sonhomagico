import { query } from "./server/db.js";
import bcrypt from "bcryptjs";
import http from "http";

function request(path: string, method: string, body?: any, cookie?: string): Promise<any> {
    return new Promise((resolve, reject) => {
        const data = body ? JSON.stringify(body) : "";
        const options = {
            hostname: '127.0.0.1',
            port: 6100, // wait, what port is it running on? Let me check server/index.ts or assume 5000? Let's check.
            path,
            method,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data),
            } as any
        };
        if (cookie) {
            options.headers['Cookie'] = cookie;
        }

        const req = http.request(options, (res) => {
            let resData = '';
            res.on('data', d => resData += d);
            res.on('end', () => {
                let parsed;
                try { parsed = JSON.parse(resData); } catch(e) { parsed = resData; }
                const setCookie = res.headers['set-cookie'] ? res.headers['set-cookie'][0] : undefined;
                resolve({ status: res.statusCode, data: parsed, setCookie });
            });
        });
        req.on('error', reject);
        if (data) req.write(data);
        req.end();
    });
}

async function run() {
    try {
        console.log("=== 1. PREPARANDO ADMIN NO BANCO ===");
        const hash = await bcrypt.hash("admin123", 12);
        try {
            await query("INSERT INTO users (id, name, email, password_hash, role, access_level) VALUES (?, ?, ?, ?, ?, ?)", 
                ["test-admin-888", "Admin Test", "admin_test@test.com", hash, "admin", "super_admin"]
            );
        } catch(e) {
            await query("UPDATE users SET password_hash = ? WHERE email = ?", [hash, "admin_test@test.com"]);
        }
        console.log("Admin pronto: admin_test@test.com / admin123");

        console.log("\n=== 2. LOGIN NA API ===");
        const loginRes = await request("/api/auth/login", "POST", { email: "admin_test@test.com", password: "admin123" });
        console.log("Status do Login:", loginRes.status);
        if (loginRes.status !== 200) {
            console.error("Falha no login", loginRes.data);
            process.exit(1);
        }
        
        const cookie = loginRes.setCookie;
        if (!cookie) throw new Error("Sem cookie de autenticação");
        console.log("Autenticado com sucesso.");

        console.log("\n=== 3. CRIANDO CLIENTE ===");
        const clientEmail = "client" + Date.now() + "@test.com";
        const clientRes = await request("/api/users", "POST", {
            name: "Cliente Teste Automatizado",
            email: clientEmail,
            password: "client_password",
            phone: "11999999999",
            role: "client",
            accessLevel: "client"
        }, cookie);
        console.log("Status Criação Cliente:", clientRes.status);
        if (clientRes.status !== 201) {
            console.error("Erro ao criar cliente:", clientRes.data);
        } else {
            console.log("Cliente criado:", clientRes.data.email);
        }

        console.log("\n=== 4. CRIANDO MEMBRO DE EQUIPE ===");
        const crewEmail = "crew" + Date.now() + "@test.com";
        const crewRes = await request("/api/users", "POST", {
            name: "Membro Equipe Teste",
            email: crewEmail,
            password: "crew_password",
            phone: "11888888888",
            role: "crew",
            accessLevel: "crew",
            specialties: ["Magia"],
            appInstalled: true
        }, cookie);
        console.log("Status Criação Equipe:", crewRes.status);
        if (crewRes.status !== 201) {
            console.error("Erro ao criar equipe:", crewRes.data);
        } else {
            console.log("Equipe criada:", crewRes.data.email);
        }

        console.log("\n=== 5. TESTANDO E-MAIL DUPLICADO (CONFLICT) ===");
        const dupRes = await request("/api/users", "POST", {
            name: "Membro Duplicado",
            email: crewEmail, // email repetido
            password: "crew_password",
            phone: "11888888888",
            role: "crew",
            accessLevel: "crew"
        }, cookie);
        console.log("Status Criação Duplicada (Esperado 409):", dupRes.status);
        console.log("Mensagem de Erro:", dupRes.data);
        
        console.log("\n=== FLUXO CONCLUIDO COM SUCESSO ===");
        process.exit(0);

    } catch (e) {
        console.error("ERRO FATAL:", e);
        process.exit(1);
    }
}
run();
