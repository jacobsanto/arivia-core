
/**
 * Utility functions for checking security context and features
 */

/**
 * Checks if running in a secure context (HTTPS)
 */
export const isSecureContext = (): boolean => {
  return window.isSecureContext;
};

/**
 * Checks if cookies are enabled
 */
export const areCookiesEnabled = (): boolean => {
  try {
    document.cookie = "testcookie=1";
    const cookieEnabled = document.cookie.indexOf("testcookie") !== -1;
    
    // Clean up the test cookie
    document.cookie = "testcookie=1; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    
    return cookieEnabled;
  } catch (e) {
    return false;
  }
};

/**
 * Checks if localStorage is available
 */
export const isLocalStorageAvailable = (): boolean => {
  try {
    const test = '__test__';
    localStorage.setItem(test, test);
    const result = localStorage.getItem(test) === test;
    localStorage.removeItem(test);
    return result;
  } catch (e) {
    return false;
  }
};

/**
 * Checks if the browser supports modern security features
 */
export const supportsModernSecurity = (): boolean => {
  return (
    typeof crypto !== 'undefined' &&
    typeof crypto.subtle !== 'undefined' &&
    typeof TextEncoder !== 'undefined'
  );
};

/**
 * Checks if session storage is available
 */
export const isSessionStorageAvailable = (): boolean => {
  try {
    const test = '__test__';
    sessionStorage.setItem(test, test);
    const result = sessionStorage.getItem(test) === test;
    sessionStorage.removeItem(test);
    return result;
  } catch (e) {
    return false;
  }
};
