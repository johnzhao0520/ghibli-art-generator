#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$ROOT_DIR/.env.production"
ENV_EXAMPLE="$ROOT_DIR/.env.production.example"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required but not installed." >&2
  exit 1
fi

if docker compose version >/dev/null 2>&1; then
  COMPOSE_CMD=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE_CMD=(docker-compose)
else
  echo "Docker Compose is required but not installed." >&2
  exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
  if [ -f "$ENV_EXAMPLE" ]; then
    cp "$ENV_EXAMPLE" "$ENV_FILE"
    echo "Created $ENV_FILE from example. Please edit it with real secrets before continuing." >&2
  else
    echo "Missing $ENV_FILE. Create it before deployment." >&2
  fi
  exit 1
fi

cd "$ROOT_DIR"
"${COMPOSE_CMD[@]}" up -d --build
