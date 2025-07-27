#!/bin/bash

# Coaching Application Startup Script
# This script starts the complete coaching application stack

set -e

echo "🚀 Starting Coaching Application Stack..."
echo "========================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose > /dev/null 2>&1; then
    echo "❌ Error: Docker Compose is not installed. Please install Docker Compose and try again."
    exit 1
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p db/mysql_data

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down --remove-orphans

# Build and start services
echo "🔨 Building and starting services..."
docker-compose up --build -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."

# Function to check service health
check_service_health() {
    local service=$1
    local max_attempts=30
    local attempt=1
    
    echo "   Checking $service..."
    
    while [ $attempt -le $max_attempts ]; do
        if docker-compose ps $service | grep -q "healthy"; then
            echo "   ✅ $service is healthy"
            return 0
        fi
        
        echo "   ⏳ Waiting for $service... (attempt $attempt/$max_attempts)"
        sleep 5
        attempt=$((attempt + 1))
    done
    
    echo "   ❌ $service failed to become healthy"
    return 1
}

# Check each service
check_service_health "mysql"
check_service_health "backend"
check_service_health "frontend"

# Show service status
echo ""
echo "📊 Service Status:"
echo "=================="
docker-compose ps

echo ""
echo "🎉 Coaching Application is ready!"
echo "================================="
echo "Frontend:  http://localhost:3000"
echo "Backend:   http://localhost:8080"
echo "Database:  localhost:3306"
echo ""
echo "📋 Useful commands:"
echo "  View logs:     docker-compose logs -f"
echo "  Stop services: docker-compose down"
echo "  Restart:       docker-compose restart"
echo ""
echo "🔍 Health checks:"
echo "  Frontend: curl http://localhost:3000"
echo "  Backend:  curl http://localhost:8080/health"
echo ""

# Optional: Open browser
if command -v open > /dev/null 2>&1; then
    echo "🌐 Opening application in browser..."
    open http://localhost:3000
elif command -v xdg-open > /dev/null 2>&1; then
    echo "🌐 Opening application in browser..."
    xdg-open http://localhost:3000
fi

echo "✨ Setup complete! Happy coaching! ✨"
