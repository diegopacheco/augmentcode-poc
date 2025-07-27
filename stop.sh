#!/bin/bash

echo "🛑 Stopping Coaching Application Stack..."
echo "========================================"

# Stop and remove all containers
echo "🔄 Stopping containers..."
docker-compose down

# Optional: Remove volumes (uncomment if you want to clear data)
# echo "🗑️  Removing volumes..."
# docker-compose down -v

# Optional: Remove images (uncomment if you want to clean up images)
# echo "🧹 Removing images..."
# docker rmi $(docker images "augmentcode-poc*" -q) 2>/dev/null || true

# Clean up any orphaned containers
echo "🧹 Cleaning up orphaned containers..."
docker container prune -f

# Clean up any orphaned networks
echo "🌐 Cleaning up orphaned networks..."
docker network prune -f

echo ""
echo "✅ Coaching Application stopped successfully!"
echo ""
echo "📋 To restart the application:"
echo "   ./start.sh"
echo ""
echo "📋 To view logs of stopped containers:"
echo "   docker-compose logs"
echo ""
echo "📋 To completely reset (remove all data):"
echo "   docker-compose down -v"
echo "   docker rmi \$(docker images \"augmentcode-poc*\" -q)"
echo ""
