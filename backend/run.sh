#!/bin/bash

echo "Starting coaching backend..."

cd "$(dirname "$0")"

if [ ! -f "bin/coaching-backend" ]; then
    echo "Binary not found. Building first..."
    ./build.sh
fi

export DB_HOST=${DB_HOST:-localhost}
export DB_PORT=${DB_PORT:-3306}
export DB_USER=${DB_USER:-root}
export DB_PASSWORD=${DB_PASSWORD:-password}
export DB_NAME=${DB_NAME:-coaching_db}
export PORT=${PORT:-8080}

echo "Starting server on port $PORT..."
echo "Database: $DB_USER@$DB_HOST:$DB_PORT/$DB_NAME"

./bin/coaching-backend
