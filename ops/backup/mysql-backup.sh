#!/usr/bin/env sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname "$0")/../.." && pwd)"
ENV_FILE="$ROOT_DIR/.env"

if [ ! -f "$ENV_FILE" ]; then
  echo ".env not found at $ENV_FILE"
  exit 1
fi

set -a
. "$ENV_FILE"
set +a

BACKUP_DIR_ABS="${ROOT_DIR}/ops/backups"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_FILE="${BACKUP_DIR_ABS}/mysql-${MYSQL_DATABASE}-${TIMESTAMP}.sql.gz"

mkdir -p "$BACKUP_DIR_ABS"

docker compose -f "$ROOT_DIR/compose.yaml" exec -T mysql \
  mysqldump \
    --single-transaction \
    --quick \
    --routines \
    --triggers \
    -u"${MYSQL_USER}" \
    -p"${MYSQL_PASSWORD}" \
    "${MYSQL_DATABASE}" | gzip > "$BACKUP_FILE"

find "$BACKUP_DIR_ABS" -type f -name 'mysql-*.sql.gz' -mtime +"${BACKUP_RETENTION_DAYS:-14}" -delete

echo "Backup created at $BACKUP_FILE"
