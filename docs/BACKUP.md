# Backups e Restore

## Escopo

Os scripts incluídos atendem o MySQL da stack Docker.

Arquivos:

- [mysql-backup.sh](/home/Mágico/ops/backup/mysql-backup.sh)
- [mysql-restore.sh](/home/Mágico/ops/backup/mysql-restore.sh)

## Gerar backup

```bash
./ops/backup/mysql-backup.sh
```

Ou:

```bash
npm run backup:mysql
make backup
```

Saída:
- `ops/backups/mysql-<database>-<timestamp>.sql.gz`

## Restore

```bash
./ops/backup/mysql-restore.sh ops/backups/mysql-sonho_magico-YYYYMMDD-HHMMSS.sql.gz
```

Ou:

```bash
make restore FILE=ops/backups/mysql-sonho_magico-YYYYMMDD-HHMMSS.sql.gz
```

## Retenção

O backup remove automaticamente arquivos mais antigos que `BACKUP_RETENTION_DAYS`.

## Boas práticas

1. Copie os backups para armazenamento externo.
2. Teste restore periodicamente em ambiente isolado.
3. Não guarde `.env` junto do backup.
4. Restrinja acesso de leitura ao diretório `ops/backups`.
