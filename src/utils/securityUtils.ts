
// Security utility functions

export const securityUtils = {
  isSecureContext(): boolean {
    return typeof window !== 'undefined' && window.isSecureContext;
  },

  areCookiesEnabled(): boolean {
    try {
      document.cookie = "cookietest=1";
      const result = document.cookie.indexOf("cookietest=") !== -1;
      document.cookie = "cookietest=1; expires=Thu, 01-Jan-1970 00:00:01 GMT";
      return result;
    } catch (e) {
      return false;
    }
  },

  isLocalStorageAvailable(): boolean {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  },

  isSessionStorageAvailable(): boolean {
    try {
      const testKey = '__storage_test__';
      sessionStorage.setItem(testKey, testKey);
      sessionStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  },

  supportsModernSecurity(): boolean {
    return typeof window !== 'undefined' && 
      'crypto' in window && 
      'subtle' in window.crypto;
  },

  generateUUID(): string {
    // Simple UUID generator for client-side use
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
};
