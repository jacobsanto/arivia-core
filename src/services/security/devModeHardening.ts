/**
 * Development mode security hardening
 * Provides additional security controls for dev environments
 */
import { logger } from '@/services/logger';

/**
 * Check if running in strict local development environment
 */
export const isStrictLocalDev = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port;
  
  // Only allow on actual localhost/127.0.0.1
  const isLocalHost = hostname === 'localhost' || 
                     hostname === '127.0.0.1' ||
                     hostname.endsWith('.local');
  
  // Check for development environment indicators
  const isDevEnv = process.env.NODE_ENV === 'development' || 
                   import.meta.env.DEV === true;
  
  // Additional security: require specific dev ports
  const isDevPort = ['3000', '5173', '8080', '4000'].includes(port) || !port;
  
  return isLocalHost && isDevEnv && isDevPort;
};

/**
 * Check if IP address is in allowed dev range
 */
export const isAllowedDevIP = async (): Promise<boolean> => {
  try {
    // Get user's IP (this is a simple check, not foolproof)
    const response = await fetch('https://api.ipify.org?format=json');
    const { ip } = await response.json();
    
    // Allow local IPs and common development ranges
    const allowedRanges = [
      '127.0.0.1',
      '::1',
      /^192\.168\./,
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[01])\./
    ];
    
    return allowedRanges.some(range => 
      typeof range === 'string' ? ip === range : range.test(ip)
    );
  } catch (error) {
    logger.warn('DevSecurity', 'Could not verify IP address', { error });
    return true; // Allow by default if check fails
  }
};

/**
 * Generate dynamic development tokens to prevent hardcoded credentials
 */
export const generateDevToken = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  return `dev-${timestamp}-${random}`;
};

/**
 * Validate development mode access
 */
export const validateDevModeAccess = async (): Promise<boolean> => {
  const isLocal = isStrictLocalDev();
  const isAllowedIP = await isAllowedDevIP();
  
  if (!isLocal) {
    logger.warn('DevSecurity', 'Dev mode attempted from non-local environment');
    return false;
  }
  
  if (!isAllowedIP) {
    logger.warn('DevSecurity', 'Dev mode attempted from disallowed IP');
    return false;
  }
  
  return true;
};

/**
 * Add dev mode security warning banner
 */
export const addDevModeWarning = (): void => {
  if (!isStrictLocalDev()) return;
  
  const banner = document.createElement('div');
  banner.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: linear-gradient(45deg, #ff6b6b, #ffa500);
      color: white;
      text-align: center;
      padding: 8px;
      font-weight: bold;
      z-index: 99999;
      font-size: 14px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    ">
      🚨 DEVELOPMENT MODE ACTIVE - Security Features Bypassed 🚨
    </div>
  `;
  
  document.body.appendChild(banner);
  
  // Adjust body margin to account for banner
  document.body.style.marginTop = '40px';
};

/**
 * Initialize dev mode security measures
 */
export const initDevModeSecurity = async (): Promise<boolean> => {
  const isValid = await validateDevModeAccess();
  
  if (isValid) {
    addDevModeWarning();
    logger.info('DevSecurity', 'Development mode security initialized');
  } else {
    logger.error('DevSecurity', 'Development mode access denied');
  }
  
  return isValid;
};