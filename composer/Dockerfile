FROM php:7.2-fpm-alpine

LABEL com.github.actions.name="GitHub Action for Composer"
LABEL com.github.actions.description="Wraps the Composer CLI to enable common Composer commands."
LABEL com.github.actions.icon="package"
LABEL com.github.actions.color="red"

RUN apk update && apk add curl && apk add --no-cache libpng libpng-dev && docker-php-ext-install gd && apk del libpng-dev && \
    curl -sS https://getcomposer.org/installer | \
    php -- --install-dir=/usr/bin/ --filename=composer

COPY "./entrypoint.sh" "/entrypoint.sh"
RUN [ "chmod", "+x", "/entrypoint.sh" ]

ENTRYPOINT [ "/entrypoint.sh" ]