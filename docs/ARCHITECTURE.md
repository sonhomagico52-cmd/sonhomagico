# Arquitetura

## Visão de alto nível

O projeto é composto por:

- `client/`: SPA React entregue pelo Vite
- `server/`: servidor Express que publica o build em produção
- `shared/`: constantes compartilhadas
- `ops/`: automação operacional para banco, backup e segurança

## Fluxo de execução

### Desenvolvimento

1. `vite` sobe o frontend com HMR
2. o debug collector grava logs locais em `.manus-logs/`
3. os dados da aplicação são persistidos no navegador via `localStorage`

### Produção

1. `vite build` gera os arquivos em `dist/public`
2. `esbuild` empacota `server/index.ts` em `dist/index.js`
3. `node dist/index.js` publica o frontend compilado
4. o endpoint `/health` expõe status básico para monitoramento

## Perfis e rotas

- `/admin`: área administrativa
- `/dashboard`: área do cliente
- `/equipe`: área do integrante da equipe
- `/login`: autenticação

## Persistência atual

Persistência atual:
- `localStorage` no navegador

Infraestrutura preparada:
- MySQL 8.4 no Docker
- scripts de backup e restore
- bootstrap inicial do banco

## Segurança aplicada no servidor

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` restritiva
- `Strict-Transport-Security` em produção
- `Content-Security-Policy` básica em produção

## Evoluções recomendadas

1. Migrar autenticação e dados de negócio para backend persistente.
2. Conectar o app ao MySQL com migrations e ORM.
3. Substituir autenticação local por sessão segura ou JWT com refresh.
4. Implementar logs estruturados e observabilidade.
