FROM php:8.2-apache

# 1. Install system dependencies & libraries for GD / Zip
RUN apt-get update && apt-get install -y \
    libfreetype6-dev \
    libjpeg62-turbo-dev \
    libpng-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    && rm -rf /var/lib/apt/lists/*

# 2. Configure and install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        gd \
        zip \
        mysqli \
        pdo \
        pdo_mysql

# 3. Enable Apache rewrite & AllowOverride
RUN a2enmod rewrite \
    && sed -i 's/AllowOverride None/AllowOverride All/g' /etc/apache2/apache2.conf

# 4. Custom PHP INI configuration
RUN echo "short_open_tag=On" > /usr/local/etc/php/conf.d/custom.ini \
    && echo "display_errors=On" >> /usr/local/etc/php/conf.d/custom.ini \
    && echo "error_reporting=E_ALL" >> /usr/local/etc/php/conf.d/custom.ini

# 5. Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 6. Set working directory
WORKDIR /var/www/html

# 7. Leverage Docker caching for Composer dependencies
# (Only reinstalls if composer.json or composer.lock changes)
COPY composer.json composer.lock* ./
RUN composer install --no-dev --optimize-autoloader --no-scripts

# 8. Copy the rest of the application codebase
COPY . .

# 9. Set proper file permissions
RUN chown -R www-data:www-data /var/www/html

EXPOSE 80