FROM php:8.2-apache

# Set Document Root
ENV APACHE_DOCUMENT_ROOT=/var/www/html/authentication

# Install extensions & enable mod_rewrite
RUN docker-php-ext-install mysqli pdo pdo_mysql \
    && a2enmod rewrite

# Fix Apache paths & enable .htaccess
RUN sed -i 's/AllowOverride None/AllowOverride All/g' /etc/apache2/apache2.conf \
    && sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf \
    && sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}/!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# PHP configuration
RUN echo "short_open_tag=On" > /usr/local/etc/php/conf.d/custom.ini \
 && echo "display_errors=On" >> /usr/local/etc/php/conf.d/custom.ini \
 && echo "error_reporting=E_ALL" >> /usr/local/etc/php/conf.d/custom.ini
${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf
