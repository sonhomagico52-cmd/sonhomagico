#!/usr/bin/env sh
set -eu

if [ "$#" -ne 1 ]; then
  echo "Usage: $0 <backup-file.sql.gz>"
  exit 1
fi

ROOT_DIR="$(CDPATH= cd -- "$(dirname "$0")/../.." && pwd)"
ENV_FILE="$ROOT_DIR/.env"
BACKUP_FILE="$1"

if [ ! -f "$ENV_FILE" ]; then
  echo ".env not found at $ENV_FILE"
  exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Backup file not found: $BACKUP_FILE"
  exit 1
fi

set -a
. "$ENV_FILE"
set +a

gunzip -c "$BACKUP_FILE" | docker compose -f "$ROOT_DIR/compose.yaml" exec -T mysql \
  mysql -u"${MYSQL_USER}" -p"${MYSQL_PASSWORD}" "${MYSQL_DATABASE}"

echo "Restore completed from $BACKUP_FILE"
