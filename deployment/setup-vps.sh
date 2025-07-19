
#!/bin/bash

# Arivia Villas VPS Setup Script for Hostinger
# Run this script on your Hostinger VPS to set up the production environment

set -e

echo "🚀 Starting Arivia Villas VPS Setup..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install required packages
echo "🔧 Installing required packages..."
sudo apt install -y \
    curl \
    wget \
    git \
    nginx \
    certbot \
    python3-certbot-nginx \
    ufw \
    htop \
    unzip

# Install Docker
echo "🐳 Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
echo "🔨 Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Configure firewall
echo "🔒 Configuring firewall..."
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /opt/arivia-villas
sudo chown $USER:$USER /opt/arivia-villas

# Clone repository (you'll need to update this with your actual repo)
echo "📥 Setting up application files..."
cd /opt/arivia-villas

# Create environment file
echo "⚙️ Creating environment configuration..."
cat > .env << EOF
NODE_ENV=production
DOMAIN=your-domain.com
EMAIL=your-email@domain.com
VITE_SUPABASE_URL=https://lhhxxnbfdrkvjjbzxdjs.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoaHh4bmJmZHJrdmpqYnp4ZGpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM3OTE0NDMsImV4cCI6MjA1OTM2NzQ0M30.1-WdcaRFaxjvq_dLlQ-XJaOHQANb_jYcTuXP3gpxR5w
EOF

# Set up SSL certificates (you'll need to configure your domain first)
echo "🔐 SSL certificate setup instructions:"
echo "1. Point your domain to this server's IP"
echo "2. Run: sudo certbot --nginx -d your-domain.com -d www.your-domain.com"

# Create systemd service for auto-start
echo "🔄 Creating systemd service..."
sudo tee /etc/systemd/system/arivia-villas.service << EOF
[Unit]
Description=Arivia Villas Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/arivia-villas
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

# Enable the service
sudo systemctl enable arivia-villas.service

# Create backup script
echo "💾 Creating backup script..."
sudo tee /usr/local/bin/backup-arivia.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups/arivia-villas"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup application files
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /opt/arivia-villas

# Keep only last 7 days of backups
find $BACKUP_DIR -name "app_*.tar.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/app_$DATE.tar.gz"
EOF

sudo chmod +x /usr/local/bin/backup-arivia.sh

# Set up daily backup cron job
echo "⏰ Setting up daily backups..."
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-arivia.sh") | crontab -

# Create monitoring script
echo "📊 Creating monitoring script..."
sudo tee /usr/local/bin/monitor-arivia.sh << 'EOF'
#!/bin/bash

# Check if containers are running
if docker ps | grep -q arivia-villas-app; then
    echo "✅ Arivia Villas app is running"
else
    echo "❌ Arivia Villas app is not running"
    # Restart the service
    systemctl restart arivia-villas.service
fi

# Check disk space
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "⚠️ Disk usage is high: ${DISK_USAGE}%"
fi

# Check memory usage
MEM_USAGE=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
if [ $MEM_USAGE -gt 80 ]; then
    echo "⚠️ Memory usage is high: ${MEM_USAGE}%"
fi
EOF

sudo chmod +x /usr/local/bin/monitor-arivia.sh

# Set up monitoring cron job (every 5 minutes)
(crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/monitor-arivia.sh") | crontab -

echo "✅ VPS setup completed!"
echo ""
echo "Next steps:"
echo "1. Update your domain DNS to point to this server"
echo "2. Edit /opt/arivia-villas/.env with your actual domain"
echo "3. Run SSL certificate setup: sudo certbot --nginx -d your-domain.com"
echo "4. Upload your application files to /opt/arivia-villas/"
echo "5. Start the application: sudo systemctl start arivia-villas.service"
echo ""
echo "Useful commands:"
echo "- Check status: sudo systemctl status arivia-villas.service"
echo "- View logs: docker-compose logs -f"
echo "- Monitor: /usr/local/bin/monitor-arivia.sh"
echo "- Backup: /usr/local/bin/backup-arivia.sh"
