# Multi-stage production build for Render & cloud deployment
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production PHP + Nginx runtime
FROM php:8.3-fpm-alpine

# Install system dependencies & Nginx
RUN apk add --no-cache \
    git \
    curl \
    nginx \
    libpng-dev \
    oniguruma-dev \
    libxml2-dev \
    zip \
    unzip \
    sqlite-dev \
    icu-dev

RUN docker-php-ext-install pdo pdo_sqlite mbstring exif pcntl bcmath gd intl

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Copy vendor dependencies from composer
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader --no-scripts

# Copy full application
COPY . .

# Copy built frontend assets from builder stage
COPY --from=frontend-builder /app/public/build ./public/build

# Finish Composer dump
RUN composer dump-autoload --optimize --no-dev

# Setup Nginx config & Entrypoint
COPY docker/nginx-standalone.conf /etc/nginx/nginx.conf
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Ensure required directories exist before setting permissions
RUN mkdir -p \
    /var/www/storage/framework/cache/data \
    /var/www/storage/framework/sessions \
    /var/www/storage/framework/views \
    /var/www/storage/logs \
    /var/www/bootstrap/cache \
    /var/www/database

# Permissions
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache /var/www/database \
    && chmod -R 775 /var/www/storage /var/www/bootstrap/cache /var/www/database

EXPOSE 80

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

