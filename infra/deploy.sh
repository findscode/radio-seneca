#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
INFRA_DIR="$ROOT_DIR/infra"

if [[ ! -f "$INFRA_DIR/.env" ]]; then
  echo "Creating infra/.env from .env.example — edit secrets before production deploy."
  cp "$INFRA_DIR/.env.example" "$INFRA_DIR/.env"
fi

cd "$INFRA_DIR"
docker compose pull postgres strapi web 2>/dev/null || true
docker compose up -d --build

echo ""
echo "Radio Seneca deployed locally via Docker Compose:"
echo "  Web:    http://localhost:8080"
echo "  Strapi: http://localhost:1337/admin"
echo ""
echo "For DigitalOcean: copy this repo to your droplet, configure infra/.env,"
echo "then run: bash infra/deploy.sh"
