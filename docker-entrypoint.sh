#!/bin/sh
set -e

if [ -n "$DATABASE_URL" ]; then
  echo "→ Running prisma db push..."
  # Invoke the CLI through node directly: the .bin/prisma symlink is not
  # carried into the Next.js standalone runtime image, but the prisma
  # package itself is.
  node ./node_modules/prisma/build/index.js db push --accept-data-loss --skip-generate || {
    echo "  prisma db push failed; continuing without schema sync."
  }
else
  echo "→ DATABASE_URL not set; skipping prisma db push."
fi

exec "$@"
