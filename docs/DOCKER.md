# Docker e MySQL

## Objetivo

A stack Docker entrega:

- aplicação Node/Express em produção
- MySQL 8.4 persistido em volume
- healthchecks de app e banco

## Subir a stack

```bash
cp .env.example .env
docker compose up -d --build
docker compose ps
```

## Serviços

### `app`

- buildado a partir de `Dockerfile`
- expõe a aplicação na porta `6100`
- depende do MySQL saudável

### `mysql`

- imagem `mysql:8.4`
- volume nomeado `mysql_data`
- init scripts em `ops/mysql/init`
- porta publicada apenas em `127.0.0.1:${MYSQL_PUBLIC_PORT}`

## Arquivos relevantes

- [compose.yaml](/home/Mágico/compose.yaml)
- [Dockerfile](/home/Mágico/Dockerfile)
- [ops/mysql/init/001-schema.sql](/home/Mágico/ops/mysql/init/001-schema.sql)
- [.env.example](/home/Mágico/.env.example)

## Comandos úteis

```bash
docker compose up -d --build
docker compose down
docker compose logs -f app
docker compose logs -f mysql
docker compose exec mysql mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"
```

## Observação importante

O MySQL está operacional no Docker, mas a aplicação atual ainda não usa esse banco para persistir seus dados de negócio. A infraestrutura foi preparada para a futura camada server-side.
