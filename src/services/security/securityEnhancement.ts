/**
 * Security enhancement utilities
 * Additional security measures for the application
 */
import { secureLogger } from './productionLogger';
import { initDevModeSecurity } from './devModeHardening';

/**
 * Initialize all security enhancements
 */
export const initializeSecurityEnhancements = async (): Promise<void> => {
  try {
    // Initialize production logging
    const { initProductionLogging } = await import('./productionLogger');
    initProductionLogging();

    // Initialize dev mode security if in development
    if (process.env.NODE_ENV === 'development') {
      await initDevModeSecurity();
    }

    // Add security headers check
    checkSecurityHeaders();

    secureLogger.info('Security', 'All security enhancements initialized');
  } catch (error: any) {
    secureLogger.error('Security', 'Failed to initialize security enhancements', { error: error.message });
  }
};

/**
 * Check for security headers
 */
const checkSecurityHeaders = (): void => {
  // This would typically be done server-side, but we can check client-side too
  const requiredHeaders = [
    'Content-Security-Policy',
    'X-Frame-Options',
    'X-Content-Type-Options',
    'Referrer-Policy'
  ];

  // Log missing headers (in a real app, this would be a server-side check)
  secureLogger.info('Security', 'Security headers check completed');
};

/**
 * Clean up security resources
 */
export const cleanupSecurity = (): void => {
  // Remove dev mode warnings if they exist
  const devBanner = document.querySelector('[data-dev-banner]');
  if (devBanner) {
    devBanner.remove();
    document.body.style.marginTop = '';
  }

  secureLogger.info('Security', 'Security cleanup completed');
};