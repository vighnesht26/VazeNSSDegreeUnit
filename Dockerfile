FROM php:8.2-apache

# Set Apache document root
ENV APACHE_DOCUMENT_ROOT /var/www/html/authentication

# 1. Install database extensions
RUN docker-php-ext-install mysqli pdo pdo_mysql

# 2. Enable Apache rewrite
RUN a2enmod rewrite

# 3. Allow .htaccess overrides
RUN sed -i 's/AllowOverride None/AllowOverride All/g' /etc/apache2/apache2.conf

# 4. Point Apache to the authentication directory
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}/!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# 5. PHP configuration
RUN echo "short_open_tag=On" > /usr/local/etc/php/conf.d/custom.ini
RUN echo "display_errors=On" >> /usr/local/etc/php/conf.d/custom.ini
RUN echo "error_reporting=E_ALL" >> /usr/local/etc/php/conf.d/custom.ini

# 6. Copy project files
COPY . /var/www/html/
RUN chown -R www-data:www-data /var/www/html

EXPOSE 80
