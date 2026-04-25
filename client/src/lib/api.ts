/**
 * client/src/lib/api.ts — Cliente HTTP centralizado
 * Sonho Mágico Joinville CRM
 */

const BASE = "";

async function request<T>(
    method: string,
    path: string,
    body?: unknown
): Promise<T> {
    const res = await fetch(`${BASE}${path}`, {
        method,
        credentials: "include", // envia cookie auth_token
        headers: body ? { "Content-Type": "application/json" } : {},
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Erro desconhecido" }));
        throw new Error((err as { error?: string }).error || `HTTP ${res.status}`);
    }

    return res.json() as Promise<T>;
}

export const api = {
    get: <T>(path: string) => request<T>("GET", path),
    post: <T>(path: string, body: unknown) => request<T>("POST", path, body),
    patch: <T>(path: string, body: unknown) => request<T>("PATCH", path, body),
    put: <T>(path: string, body: unknown) => request<T>("PUT", path, body),
    delete: <T>(path: string) => request<T>("DELETE", path),
};
