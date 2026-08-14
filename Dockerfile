FROM php:8.2-apache

# 1. Install database extensions
RUN docker-php-ext-install mysqli pdo pdo_mysql

# 2. Enable Apache rewrite
RUN a2enmod rewrite

# 3. Allow .htaccess overrides
RUN sed -i 's/AllowOverride None/AllowOverride All/g' /etc/apache2/apache2.conf

# 4. PHP configuration
RUN echo "short_open_tag=On" > /usr/local/etc/php/conf.d/custom.ini \
 && echo "display_errors=On" >> /usr/local/etc/php/conf.d/custom.ini \
 && echo "error_reporting=E_ALL" >> /usr/local/etc/php/conf.d/custom.ini

# 5. Copy project files
COPY . /var/www/html/
RUN chown -R www-data:www-data /var/www/html

EXPOSE 80
