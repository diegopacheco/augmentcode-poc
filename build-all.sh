#!/bin/bash

# Build All Script for Coaching Application
# This script builds the backend, frontend, and Docker images

set -e

echo "🔨 Building Coaching Application Components"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v go &> /dev/null; then
        print_error "Go is not installed. Please install Go and try again."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install Node.js and npm and try again."
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker and try again."
        exit 1
    fi
    
    print_success "All dependencies are available"
}

# Build backend
build_backend() {
    print_status "Building backend..."
    
    cd backend
    
    # Clean previous builds
    rm -rf bin/
    
    # Download dependencies
    print_status "Downloading Go dependencies..."
    go mod tidy
    
    # Run tests
    print_status "Running backend tests..."
    go test ./... -v
    
    # Build the application
    print_status "Building Go application..."
    ./build.sh
    
    cd ..
    print_success "Backend build completed"
}

# Build frontend
build_frontend() {
    print_status "Building frontend..."
    
    cd frontend
    
    # Clean previous builds
    rm -rf dist/ node_modules/.cache/
    
    # Install dependencies
    print_status "Installing npm dependencies..."
    npm install
    
    # Run tests
    print_status "Running frontend tests..."
    npm test -- --run
    
    # Build the application
    print_status "Building React application..."
    npm run build
    
    cd ..
    print_success "Frontend build completed"
}

# Build Docker images
build_docker_images() {
    print_status "Building Docker images..."
    
    # Build backend Docker image
    print_status "Building backend Docker image..."
    docker build -t coaching-backend:latest ./backend
    
    # Build frontend Docker image
    print_status "Building frontend Docker image..."
    docker build -t coaching-frontend:latest ./frontend
    
    print_success "Docker images built successfully"
}

# Clean up function
cleanup() {
    print_status "Cleaning up temporary files..."
    
    # Clean backend
    if [ -d "backend/bin" ]; then
        rm -rf backend/bin/
    fi
    
    # Clean frontend
    if [ -d "frontend/dist" ]; then
        rm -rf frontend/dist/
    fi
    
    if [ -d "frontend/node_modules/.cache" ]; then
        rm -rf frontend/node_modules/.cache/
    fi
    
    print_success "Cleanup completed"
}

# Show build information
show_build_info() {
    echo ""
    echo "📊 Build Information"
    echo "==================="
    
    # Backend info
    if [ -f "backend/bin/coaching-backend" ]; then
        backend_size=$(du -h backend/bin/coaching-backend | cut -f1)
        echo "Backend binary: ${backend_size}"
    fi
    
    # Frontend info
    if [ -d "frontend/dist" ]; then
        frontend_size=$(du -sh frontend/dist | cut -f1)
        echo "Frontend build: ${frontend_size}"
    fi
    
    # Docker images info
    echo ""
    echo "Docker Images:"
    docker images | grep coaching- | awk '{print $1 ":" $2 " - " $7}'
    
    echo ""
    echo "🎉 Build Summary"
    echo "==============="
    echo "✅ Backend: Go application built successfully"
    echo "✅ Frontend: React application built successfully"
    echo "✅ Docker: Container images built successfully"
    echo ""
    echo "🚀 Next Steps:"
    echo "  • Run './start.sh' to start the full stack"
    echo "  • Run 'docker-compose up' to start with Docker"
    echo "  • Run individual components with their respective run scripts"
}

# Main execution
main() {
    # Parse command line arguments
    SKIP_TESTS=false
    SKIP_DOCKER=false
    CLEAN_ONLY=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-tests)
                SKIP_TESTS=true
                shift
                ;;
            --skip-docker)
                SKIP_DOCKER=true
                shift
                ;;
            --clean)
                CLEAN_ONLY=true
                shift
                ;;
            -h|--help)
                echo "Usage: $0 [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  --skip-tests    Skip running tests during build"
                echo "  --skip-docker   Skip building Docker images"
                echo "  --clean         Only clean up build artifacts"
                echo "  -h, --help      Show this help message"
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                echo "Use --help for usage information"
                exit 1
                ;;
        esac
    done
    
    # If clean only, just cleanup and exit
    if [ "$CLEAN_ONLY" = true ]; then
        cleanup
        exit 0
    fi
    
    # Start build process
    echo "Starting build process..."
    echo "Skip tests: $SKIP_TESTS"
    echo "Skip Docker: $SKIP_DOCKER"
    echo ""
    
    # Check dependencies
    check_dependencies
    
    # Build components
    build_backend
    build_frontend
    
    # Build Docker images if not skipped
    if [ "$SKIP_DOCKER" = false ]; then
        build_docker_images
    fi
    
    # Show build information
    show_build_info
    
    print_success "All builds completed successfully! 🎉"
}

# Handle script interruption
trap 'print_error "Build interrupted"; exit 1' INT TERM

# Run main function
main "$@"
