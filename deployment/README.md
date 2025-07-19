
# Arivia Villas VPS Deployment Guide

This guide provides complete instructions for deploying the Arivia Villas MVP application to a Hostinger VPS.

## Prerequisites

- Hostinger VPS with Ubuntu 22.04
- Domain name pointed to your VPS IP
- SSH access to your server
- Basic knowledge of Linux commands

## Quick Start

1. **Initial Server Setup**
```bash
# Connect to your VPS
ssh root@your-server-ip

# Run the setup script
wget https://raw.githubusercontent.com/your-repo/deployment/setup-vps.sh
chmod +x setup-vps.sh
./setup-vps.sh
```

2. **Upload Application Files**
```bash
# Upload your application files to /opt/arivia-villas/
# You can use scp, rsync, or git clone
```

3. **Configure Domain and SSL**
```bash
# Edit the environment file
nano /opt/arivia-villas/.env

# Update DOMAIN and EMAIL variables
# Run SSL setup
cd /opt/arivia-villas/deployment
./ssl-setup.sh
```

4. **Deploy Application**
```bash
cd /opt/arivia-villas
./deployment/deploy.sh
```

## Detailed Setup Instructions

### 1. Server Preparation

#### Update System
```bash
sudo apt update && sudo apt upgrade -y
```

#### Install Docker
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

#### Configure Firewall
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
```

### 2. Application Deployment

#### File Structure
```
/opt/arivia-villas/
├── deployment/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── nginx.conf
│   ├── nginx-proxy.conf
│   ├── start.sh
│   └── ssl/
├── src/
├── package.json
├── .env
└── README.md
```

#### Environment Configuration
Create `/opt/arivia-villas/.env`:
```bash
NODE_ENV=production
DOMAIN=your-domain.com
EMAIL=your-email@domain.com
VITE_SUPABASE_URL=https://lhhxxnbfdrkvjjbzxdjs.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. SSL Certificate Setup

#### Prerequisites
- Domain DNS pointing to your server
- Port 80 and 443 open in firewall

#### Automatic Setup
```bash
cd /opt/arivia-villas/deployment
./ssl-setup.sh
```

#### Manual Setup
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### 4. Deployment Commands

#### Initial Deployment
```bash
cd /opt/arivia-villas
docker-compose up -d --build
```

#### Update Deployment
```bash
./deployment/deploy.sh
```

#### Check Status
```bash
docker-compose ps
docker-compose logs -f
```

## Monitoring and Maintenance

### Health Checks
```bash
# Manual health check
curl http://localhost:3000/health

# Automated monitoring
/usr/local/bin/monitor-arivia.sh
```

### Log Management
```bash
# View application logs
docker-compose logs -f arivia-app

# View nginx logs
docker-compose logs -f nginx-proxy

# System logs
tail -f /var/log/arivia-health.log
```

### Backup and Recovery
```bash
# Create backup
/usr/local/bin/backup-arivia.sh

# Restore from backup
cd /opt/arivia-villas
docker-compose down
tar -xzf /backups/arivia-villas/app_YYYYMMDD_HHMMSS.tar.gz -C /
docker-compose up -d
```

## Troubleshooting

### Common Issues

#### Application not starting
```bash
# Check container status
docker-compose ps

# Check logs
docker-compose logs arivia-app

# Restart services
docker-compose restart
```

#### SSL certificate issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificates
sudo certbot renew

# Test renewal
sudo certbot renew --dry-run
```

#### High resource usage
```bash
# Check system resources
htop
df -h
free -h

# Restart application
docker-compose restart
```

### Performance Optimization

#### Enable caching
- Nginx static file caching is pre-configured
- Browser caching headers are set
- Gzip compression is enabled

#### Monitor performance
```bash
# Check response times
curl -w "@curl-format.txt" -o /dev/null -s https://your-domain.com

# Monitor resources
watch -n 5 'docker stats --no-stream'
```

## Security Best Practices

### Firewall Configuration
```bash
# Check firewall status
sudo ufw status

# Only allow necessary ports
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
```

### SSL/TLS Security
- TLS 1.2+ only
- Strong cipher suites
- HSTS headers enabled
- Automatic certificate renewal

### Application Security
- Security headers configured
- Rate limiting enabled
- Regular security updates

## Maintenance Schedule

### Daily
- Automated health checks (every 5 minutes)
- Automated backups (2 AM daily)

### Weekly
- Review application logs
- Check disk space and clean up old files
- Monitor SSL certificate expiry

### Monthly
- System updates
- Security audit
- Performance review

## Support and Documentation

### Useful Commands
```bash
# Service management
sudo systemctl start|stop|restart|status arivia-villas.service

# Docker management
docker-compose up|down|restart|ps|logs

# System monitoring
htop
df -h
free -h
netstat -tlnp
```

### Log Locations
- Application logs: `docker-compose logs`
- Nginx logs: `/var/log/nginx/`
- System logs: `/var/log/syslog`
- Health logs: `/var/log/arivia-health.log`

### Emergency Contacts
- Server issues: Contact Hostinger support
- Application issues: Check logs and restart services
- SSL issues: Use Certbot troubleshooting guide

## Scaling Considerations

### Horizontal Scaling
- Set up load balancer
- Configure multiple application instances
- Implement session management

### Vertical Scaling
- Upgrade VPS resources
- Optimize container resource limits
- Database performance tuning

### CDN Integration
- Configure Cloudflare or similar CDN
- Optimize static asset delivery
- Implement edge caching
