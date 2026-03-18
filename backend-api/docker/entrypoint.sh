#!/usr/bin/env sh
set -eu

cd /var/www/html

echo "[backend] Waiting for database..."
max_tries=30
try=1
while [ "$try" -le "$max_tries" ]; do
  if php -r 'try { new PDO("mysql:host=" . getenv("DB_HOST") . ";port=" . getenv("DB_PORT") . ";dbname=" . getenv("DB_DATABASE"), getenv("DB_USERNAME"), getenv("DB_PASSWORD")); echo "ok"; } catch (Throwable $e) { exit(1); }' >/dev/null 2>&1; then
    echo "[backend] Database is ready."
    break
  fi
  echo "[backend] DB not ready yet ($try/$max_tries), retrying..."
  try=$((try + 1))
  sleep 2
done

if [ "$try" -gt "$max_tries" ]; then
  echo "[backend] Could not connect to DB after retries."
  exit 1
fi

if [ -z "${APP_KEY:-}" ]; then
  echo "[backend] APP_KEY missing, generating key..."
  php artisan key:generate --force
fi

echo "[backend] Clearing stale bootstrap cache manifests..."
rm -f bootstrap/cache/*.php

echo "[backend] Regenerating package manifest..."
php artisan package:discover --ansi

echo "[backend] Running migrations..."
php artisan migrate --force

echo "[backend] Refreshing storage symlink..."
php artisan storage:link || true

echo "[backend] Clearing caches..."
php artisan optimize:clear

echo "[backend] Starting Laravel API on 0.0.0.0:8000"
exec php artisan serve --host=0.0.0.0 --port=8000
