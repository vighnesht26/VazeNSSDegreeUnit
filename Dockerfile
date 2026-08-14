FROM php:8.2-apache

# Install database extensions
RUN docker-php-ext-install mysqli pdo pdo_mysql

# Enable Apache rewrite module
RUN a2enmod rewrite

# Allow .htaccess files to override Apache settings
RUN sed -i 's/AllowOverride None/AllowOverride All/g' /etc/apache2/apache2.conf

# Enable short tags and error display
RUN echo "short_open_tag=On" > /usr/local/etc/php/conf.d/custom.ini \
 && echo "display_errors=On" >> /usr/local/etc/php/conf.d/custom.ini \
 && echo "error_reporting=E_ALL" >> /usr/local/etc/php/conf.d/custom.ini

ENV APACHE_DOCUMENT_ROOT /var/www/html/authentication
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf
