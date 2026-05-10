#!/bin/sh
set -e

if [ -n "$DATABASE_URL" ]; then
  echo "→ Running prisma db push..."
  ./node_modules/.bin/prisma db push --accept-data-loss --skip-generate || {
    echo "  prisma db push failed; continuing without schema sync."
  }
else
  echo "→ DATABASE_URL not set; skipping prisma db push."
fi

exec "$@"
