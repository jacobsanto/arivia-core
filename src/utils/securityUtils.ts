
/**
 * Security utility functions for checking browser features and security settings
 */
export const securityUtils = {
  /**
   * Checks if the current context is secure (HTTPS)
   */
  isSecureContext: () => {
    return window.isSecureContext;
  },
  
  /**
   * Checks if cookies are enabled
   */
  areCookiesEnabled: () => {
    try {
      document.cookie = "cookietest=1";
      const result = document.cookie.indexOf("cookietest=") !== -1;
      document.cookie = "cookietest=1; expires=Thu, 01-Jan-1970 00:00:01 GMT";
      return result;
    } catch (e) {
      return false;
    }
  },
  
  /**
   * Checks if localStorage is available
   */
  isLocalStorageAvailable: () => {
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      return true;
    } catch (e) {
      return false;
    }
  },
  
  /**
   * Checks if sessionStorage is available
   */
  isSessionStorageAvailable: () => {
    try {
      sessionStorage.setItem('test', 'test');
      sessionStorage.removeItem('test');
      return true;
    } catch (e) {
      return false;
    }
  },
  
  /**
   * Checks if modern security features are supported
   */
  supportsModernSecurity: () => {
    // Check for Content-Security-Policy support
    const hasCSP = 'securityPolicy' in document || 'webkitSecurityPolicy' in document;
    
    // Check for Cross-Origin-Embedder-Policy support
    const hasCoep = !!(window.crossOriginIsolated);
    
    // Check for Cross-Origin-Opener-Policy support
    const hasCoop = typeof window.opener !== 'undefined';
    
    // Simple check for SharedArrayBuffer which indicates cross-origin isolation
    const hasSAB = typeof SharedArrayBuffer !== 'undefined';
    
    return hasCSP || hasCoep || hasCoop || hasSAB;
  }
};

// Export individual functions for direct import
export const { isSecureContext, areCookiesEnabled, isLocalStorageAvailable, isSessionStorageAvailable, supportsModernSecurity } = securityUtils;

export default securityUtils;
