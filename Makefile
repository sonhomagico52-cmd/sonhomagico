SHELL := /bin/sh

.PHONY: install dev build check docker-up docker-down docker-build backup restore security-audit

install:
	npm ci

dev:
	npm run dev

build:
	npm run build

check:
	npm run check

docker-build:
	docker compose build

docker-up:
	docker compose up -d --build

docker-down:
	docker compose down

backup:
	./ops/backup/mysql-backup.sh

restore:
	@echo "Use: make restore FILE=ops/backups/<file.sql.gz>"
	@test -n "$(FILE)"
	./ops/backup/mysql-restore.sh "$(FILE)"

security-audit:
	./ops/security/security-audit.sh
