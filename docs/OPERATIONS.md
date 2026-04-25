# Operação Diária

## Desenvolvimento

```bash
npm ci
npm run dev
```

## Build e validação

```bash
npm run check
npm run build
```

## Execução com Docker

```bash
docker compose up -d --build
docker compose ps
docker compose logs -f app
```

## Saúde da aplicação

```bash
curl http://localhost:6100/health
```

Resposta esperada:

```json
{
  "status": "ok",
  "app": "sonho-magico-joinville"
}
```

## Rotina mínima de operação

1. Verificar `docker compose ps`.
2. Consultar `/health`.
3. Executar backup diário do MySQL.
4. Revisar logs do app e do proxy.
5. Rodar auditoria operacional antes de deploy maior.

## Deploy manual fora do Docker

```bash
npm ci
npm run build
NODE_ENV=production PORT=6100 npm run start
```
