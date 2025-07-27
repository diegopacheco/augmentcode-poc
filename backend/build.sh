#!/bin/bash

echo "Building coaching backend..."

cd "$(dirname "$0")"

go mod tidy

go build -o bin/coaching-backend .

if [ $? -eq 0 ]; then
    echo "Build successful! Binary created at bin/coaching-backend"
else
    echo "Build failed!"
    exit 1
fi
