# Deploy

## Modos suportados

O projeto agora tem dois caminhos de deploy documentados:

- Docker com `compose.yaml`
- Node + PM2 + Nginx

## Deploy com Docker

```bash
cp .env.example .env
docker compose up -d --build
docker compose ps
```

Aplicação:
- `http://localhost:6100`

## Deploy com PM2

### Build

```bash
npm ci
npm run build
```

### Subir com PM2

Arquivo:
- [ecosystem.config.cjs](/home/Mágico/ops/deploy/ecosystem.config.cjs)

Comandos:

```bash
pm2 start ops/deploy/ecosystem.config.cjs
pm2 save
pm2 status
```

## Proxy reverso com Nginx

Template:
- [nginx-sonhomagico.conf](/home/Mágico/ops/deploy/nginx-sonhomagico.conf)

Fluxo básico:

1. Copiar o arquivo para `/etc/nginx/sites-available/`
2. Criar symlink em `/etc/nginx/sites-enabled/`
3. Validar com `nginx -t`
4. Recarregar com `systemctl reload nginx`
5. Emitir certificado com Certbot

## Agendamento de backup

Arquivo exemplo:
- [backup.cron.example](/home/Mágico/ops/deploy/backup.cron.example)

Instalação:

```bash
crontab -e
```

Depois copie as linhas do arquivo de exemplo.

## Ordem recomendada de deploy

1. `npm run check`
2. `npm run build`
3. `pm2 restart sonhomagico-web` ou `docker compose up -d --build`
4. validar `/health`
5. validar o domínio publicado
