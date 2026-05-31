#!/usr/bin/env bash
# Run Django development server with custom port from .env
# Usage: bash run.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Load .env if it exists
if [ -f "$SCRIPT_DIR/.env" ]; then
  set -a
  source "$SCRIPT_DIR/.env"
  set +a
fi

PORT="${DJANGO_PORT:-8000}"

echo "🚀 Starting Nota backend on port $PORT..."
python manage.py runserver "0.0.0.0:$PORT"
