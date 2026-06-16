#!/bin/sh
set -eu

export AZURACAST_UPSTREAM="${AZURACAST_UPSTREAM:-https://demo.azuracast.com}"
export STRAPI_UPSTREAM="${STRAPI_UPSTREAM:-http://strapi:1337}"

envsubst '${AZURACAST_UPSTREAM} ${STRAPI_UPSTREAM}' \
  < /etc/nginx/templates/default.conf.template \
  > /etc/nginx/conf.d/default.conf

exec nginx -g 'daemon off;'
