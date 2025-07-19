
#!/bin/bash

# Health monitoring script for Arivia Villas
# This script checks various aspects of the application health

LOG_FILE="/var/log/arivia-health.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

log_message() {
    echo "[$DATE] $1" | tee -a $LOG_FILE
}

# Check if application is responding
check_app_health() {
    if curl -f -s http://localhost:3000/health > /dev/null; then
        log_message "✅ Application health check passed"
        return 0
    else
        log_message "❌ Application health check failed"
        return 1
    fi
}

# Check Docker containers
check_containers() {
    if docker ps | grep -q arivia-villas-app; then
        log_message "✅ Docker containers are running"
        return 0
    else
        log_message "❌ Docker containers are not running"
        return 1
    fi
}

# Check disk space
check_disk_space() {
    DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    if [ $DISK_USAGE -lt 80 ]; then
        log_message "✅ Disk usage is healthy: ${DISK_USAGE}%"
        return 0
    else
        log_message "⚠️ High disk usage: ${DISK_USAGE}%"
        return 1
    fi
}

# Check memory usage
check_memory() {
    MEM_USAGE=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
    if [ $MEM_USAGE -lt 80 ]; then
        log_message "✅ Memory usage is healthy: ${MEM_USAGE}%"
        return 0
    else
        log_message "⚠️ High memory usage: ${MEM_USAGE}%"
        return 1
    fi
}

# Check SSL certificate expiry
check_ssl() {
    DOMAIN="your-domain.com"
    EXPIRY_DATE=$(echo | openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null | openssl x509 -noout -dates | grep notAfter | cut -d= -f2)
    EXPIRY_EPOCH=$(date -d "$EXPIRY_DATE" +%s)
    CURRENT_EPOCH=$(date +%s)
    DAYS_LEFT=$(( ($EXPIRY_EPOCH - $CURRENT_EPOCH) / 86400 ))
    
    if [ $DAYS_LEFT -gt 30 ]; then
        log_message "✅ SSL certificate is valid for $DAYS_LEFT more days"
        return 0
    else
        log_message "⚠️ SSL certificate expires in $DAYS_LEFT days"
        return 1
    fi
}

# Run all checks
FAILED_CHECKS=0

check_app_health || ((FAILED_CHECKS++))
check_containers || ((FAILED_CHECKS++))
check_disk_space || ((FAILED_CHECKS++))
check_memory || ((FAILED_CHECKS++))
check_ssl || ((FAILED_CHECKS++))

if [ $FAILED_CHECKS -eq 0 ]; then
    log_message "🎉 All health checks passed"
else
    log_message "⚠️ $FAILED_CHECKS health check(s) failed"
fi

# If critical checks fail, attempt restart
if ! check_app_health || ! check_containers; then
    log_message "🔄 Attempting to restart application..."
    cd /opt/arivia-villas
    docker-compose restart
    sleep 30
    if check_app_health; then
        log_message "✅ Application restart successful"
    else
        log_message "❌ Application restart failed - manual intervention required"
    fi
fi
