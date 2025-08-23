/**
 * Input sanitization service for security
 * Prevents XSS and injection attacks
 */

// HTML entities to escape
const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
};

/**
 * Escape HTML entities to prevent XSS
 */
export const escapeHtml = (text: string): string => {
  return text.replace(/[&<>"'/]/g, (char) => HTML_ESCAPE_MAP[char]);
};

/**
 * Sanitize string input by trimming and escaping
 */
export const sanitizeString = (input: string | undefined | null): string => {
  if (!input) return '';
  return escapeHtml(input.trim());
};

/**
 * Sanitize email input
 */
export const sanitizeEmail = (email: string | undefined | null): string => {
  if (!email) return '';
  return email.trim().toLowerCase();
};

/**
 * Validate and sanitize URL
 */
export const sanitizeUrl = (url: string | undefined | null): string => {
  if (!url) return '';
  
  try {
    const parsed = new URL(url);
    // Only allow http/https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return '';
    }
    return parsed.toString();
  } catch {
    return '';
  }
};

/**
 * Sanitize object by recursively cleaning all string values
 */
export const sanitizeObject = (obj: Record<string, any>): Record<string, any> => {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeString(item) : 
        typeof item === 'object' && item !== null ? sanitizeObject(item) : 
        item
      );
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

/**
 * Validate IP address format
 */
export const isValidIpAddress = (ip: string): boolean => {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
};

/**
 * Sanitize and validate IP addresses list
 */
export const sanitizeIpList = (ipList: string | undefined | null): string => {
  if (!ipList) return '';
  
  const ips = ipList.split(',').map(ip => ip.trim()).filter(ip => ip);
  const validIps = ips.filter(isValidIpAddress);
  
  return validIps.join(', ');
};