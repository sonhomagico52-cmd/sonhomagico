#!/usr/bin/env sh
set -eu

random_secret() {
  openssl rand -base64 32 | tr -d '\n'
}

echo "MYSQL_PASSWORD=$(random_secret)"
echo "MYSQL_ROOT_PASSWORD=$(random_secret)"
