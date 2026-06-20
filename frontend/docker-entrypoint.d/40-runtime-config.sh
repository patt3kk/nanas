#!/bin/sh
set -eu

TEMPLATE="/usr/share/nginx/html/js/runtime-config.template.js"
TARGET="/usr/share/nginx/html/js/runtime-config.js"

if [ -f "$TEMPLATE" ]; then
  envsubst '${FRONTEND_API_BASE_URL} ${ENABLE_MOCK}' < "$TEMPLATE" > "$TARGET"
fi
