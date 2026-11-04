#!/bin/sh
set -e

echo "==> Preparing environment..."
if [ ! -f /var/www/.env ]; then
    cp /var/www/.env.example /var/www/.env
fi

# Ensure SQLite database exists
mkdir -p /var/www/database
touch /var/www/database/database.sqlite

# Run migrations and seeders if not seeded
echo "==> Running migrations & seeding demo data..."
php artisan migrate --force --seed

# Cache configurations for production performance
echo "==> Optimizing caches..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Start nginx and php-fpm
echo "==> Starting Nginx and PHP-FPM on port ${PORT:-80}..."
php-fpm -D
exec nginx -g "daemon off;"
