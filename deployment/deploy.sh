
#!/bin/bash

# Deployment script for Arivia Villas
# Run this script to deploy updates to production

set -e

DEPLOY_DIR="/opt/arivia-villas"
BACKUP_DIR="/backups/arivia-villas"
DATE=$(date +%Y%m%d_%H%M%S)

echo "🚀 Starting deployment process..."

# Create backup before deployment
echo "💾 Creating backup..."
mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/pre_deploy_$DATE.tar.gz $DEPLOY_DIR

# Change to deployment directory
cd $DEPLOY_DIR

# Pull latest changes (if using git)
if [ -d ".git" ]; then
    echo "📥 Pulling latest changes..."
    git pull origin main
fi

# Build and deploy
echo "🔨 Building and deploying application..."
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Health check
echo "🏥 Performing health check..."
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Deployment successful! Application is healthy."
else
    echo "❌ Health check failed. Rolling back..."
    docker-compose down
    tar -xzf $BACKUP_DIR/pre_deploy_$DATE.tar.gz -C /
    docker-compose up -d
    echo "🔄 Rollback completed."
    exit 1
fi

# Clean up old images
echo "🧹 Cleaning up old Docker images..."
docker image prune -f

echo "🎉 Deployment completed successfully!"
echo "📊 Application status:"
docker-compose ps
