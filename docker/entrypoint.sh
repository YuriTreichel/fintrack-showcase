#!/bin/sh
set -e

echo "==> Preparing environment..."
if [ ! -f /var/www/.env ]; then
    cp /var/www/.env.example /var/www/.env
fi

# Ensure APP_KEY is populated if not provided via environment variable
if [ -z "$APP_KEY" ]; then
    echo "==> Generating fallback application key..."
    php artisan key:generate --force
fi

# Ensure SQLite database exists and has writable permissions
mkdir -p /var/www/database
touch /var/www/database/database.sqlite
chown -R www-data:www-data /var/www/database /var/www/storage /var/www/bootstrap/cache
chmod -R 777 /var/www/database
chmod 666 /var/www/database/database.sqlite
chmod -R 775 /var/www/storage /var/www/bootstrap/cache

# Run migrations and seeders if not seeded
echo "==> Running migrations & seeding demo data..."
php artisan migrate --force --seed
chown -R www-data:www-data /var/www/database
chmod 666 /var/www/database/database.sqlite

# Cache configurations for production performance
echo "==> Optimizing caches..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Start nginx and php-fpm
echo "==> Starting Nginx and PHP-FPM on port ${PORT:-80}..."
php-fpm -D
exec nginx -g "daemon off;"

