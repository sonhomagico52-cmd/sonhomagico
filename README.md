# Sonho Mágico Joinville

Plataforma web para operação comercial e administrativa da Sonho Mágico Joinville. O projeto reúne landing page, login, dashboards por perfil, gestão de clientes, eventos, equipes, mensagens e perfis de acesso.

## Estado atual

A aplicação possui um backend em Node/Express operando com banco de dados MySQL para a persistência dos cadastros de equipe e usuários. A Área Administrativa (Módulos de Clientes, Equipes e Usuários) foi modernizada com uma interface premium, responsiva e focada na experiência do usuário, utilizando paletas de cores OKLCH, Slide-overs flutuantes e cards ricos.

## Sumário

- [Visão Geral](./README.md#visao-geral)
- [Arquitetura](./docs/ARCHITECTURE.md)
- [Instalação Local](./docs/INSTALLATION.md)
- [Docker e MySQL](./docs/DOCKER.md)
- [Deploy](./docs/DEPLOYMENT.md)
- [Backups e Restore](./docs/BACKUP.md)
- [Segurança](./docs/SECURITY.md)
- [Operação diária](./docs/OPERATIONS.md)

## Visão Geral

### Perfis suportados

- `admin`: área administrativa com dashboards e módulos operacionais
- `crew`: painel da equipe para escalas e mensagens
- `client`: painel do cliente para eventos e orçamentos

### Funcionalidades atuais

- landing page institucional
- autenticação local
- dashboard administrativo
- CRM de clientes
- gestão de eventos
- gestão de equipes e escalação
- mensagens operacionais para equipe
- painel do integrante
- gerenciamento de usuários com níveis de permissão

## Stack técnica

- Frontend: React 19 + Vite + TypeScript
- UI: Tailwind CSS 4 + Radix UI + Lucide
- Backend web: Express
- Build server: esbuild
- Infraestrutura: Docker + Docker Compose + MySQL 8.4

## Comandos principais

```bash
npm ci
npm run dev
npm run check
npm run build
npm run start
```

## Docker rápido

```bash
cp .env.example .env
docker compose up -d --build
docker compose ps
```

Aplicação:
- `http://localhost:6100`

Healthcheck:
- `http://localhost:6100/health`

## Scripts operacionais

- `npm run backup:mysql`
- `npm run security:audit`
- `make docker-up`
- `make backup`

## Deploy

Guias de deploy:

- [Deploy com Docker ou PM2/Nginx](./docs/DEPLOYMENT.md)

## Estrutura principal

```text
client/                 frontend React
server/                 servidor Express
shared/                 constantes compartilhadas
ops/backup/             scripts de backup e restore
ops/security/           scripts de segurança
ops/mysql/init/         bootstrap do MySQL
docs/                   documentação operacional
compose.yaml            stack Docker
Dockerfile              imagem da aplicação
```
