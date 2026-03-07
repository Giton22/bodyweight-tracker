#!/bin/sh
set -e

# Bootstrap the initial superuser from environment variables if provided.
# `superuser upsert` is idempotent: creates on first run, updates password on subsequent runs.
if [ -n "$PB_ADMIN_EMAIL" ] && [ -n "$PB_ADMIN_PASSWORD" ]; then
  echo "Bootstrapping superuser: $PB_ADMIN_EMAIL"
  /usr/local/bin/pocketbase superuser upsert "$PB_ADMIN_EMAIL" "$PB_ADMIN_PASSWORD" \
    --dir /pb/pb_data \
    --migrationsDir /pb/pb_migrations
fi

# Start PocketBase. Migrations in /pb/pb_migrations run automatically on serve.
exec /usr/local/bin/pocketbase serve \
  --http=0.0.0.0:8090 \
  --dir /pb/pb_data \
  --migrationsDir /pb/pb_migrations \
  --publicDir /pb/pb_public
