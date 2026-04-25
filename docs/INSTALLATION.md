# Instalação Local

## Pré-requisitos

- Node.js 20+
- npm 10+
- Docker e Docker Compose opcionais

## Instalação rápida

```bash
cp .env.example .env
npm ci
npm run dev
```

Aplicação local:
- `http://localhost:6100`

## Build de produção

```bash
npm run check
npm run build
npm run start
```

## Variáveis de ambiente

Crie `.env` a partir de `.env.example`.

Variáveis principais:

- `NODE_ENV`
- `PORT`
- `MYSQL_DATABASE`
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `MYSQL_ROOT_PASSWORD`
- `MYSQL_HOST`
- `MYSQL_PORT`
- `MYSQL_PUBLIC_PORT`
- `BACKUP_RETENTION_DAYS`

## Credenciais demo

- Admin: `admin@sonhomagico.com` / `admin123`
- Cliente: `joao@email.com` / `cliente123`
- Equipe: `ana.equipe@sonhomagico.com` / `equipe123`

## Verificações recomendadas

```bash
npm run check
npm run build
curl http://localhost:6100/health
```
