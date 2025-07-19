
#!/bin/bash

# SSL Certificate Setup Script for Arivia Villas
# Run this after your domain is pointing to your server

set -e

# Configuration
DOMAIN="your-domain.com"
EMAIL="your-email@domain.com"

echo "🔐 Setting up SSL certificates for $DOMAIN..."

# Install Certbot if not already installed
if ! command -v certbot &> /dev/null; then
    echo "📦 Installing Certbot..."
    sudo apt update
    sudo apt install -y certbot python3-certbot-nginx
fi

# Stop nginx temporarily
echo "⏸️ Stopping nginx temporarily..."
sudo systemctl stop nginx

# Obtain SSL certificate
echo "📜 Obtaining SSL certificate..."
sudo certbot certonly --standalone -d $DOMAIN -d www.$DOMAIN --email $EMAIL --agree-tos --no-eff-email

# Create SSL directory for Docker
echo "📁 Setting up SSL directory..."
sudo mkdir -p /opt/arivia-villas/deployment/ssl
sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem /opt/arivia-villas/deployment/ssl/
sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem /opt/arivia-villas/deployment/ssl/
sudo chown -R $USER:$USER /opt/arivia-villas/deployment/ssl

# Set up auto-renewal
echo "🔄 Setting up auto-renewal..."
sudo crontab -l | { cat; echo "0 3 * * * certbot renew --quiet && systemctl reload nginx"; } | sudo crontab -

# Update nginx configuration with actual domain
echo "⚙️ Updating nginx configuration..."
cd /opt/arivia-villas
sed -i "s/your-domain.com/$DOMAIN/g" deployment/nginx-proxy.conf

# Start services
echo "🚀 Starting services..."
sudo systemctl start nginx
docker-compose restart

echo "✅ SSL setup completed!"
echo "🌐 Your site should now be available at https://$DOMAIN"
