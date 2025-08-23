/**
 * Security monitoring and event logging service
 */
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/services/logger';

export type SecurityEventType = 
  | 'failed_login' 
  | 'successful_login' 
  | 'password_reset' 
  | 'role_change'
  | 'permission_change'
  | 'suspicious_activity'
  | 'data_access'
  | 'admin_action';

export type SecuritySeverity = 'low' | 'medium' | 'high' | 'critical';

interface SecurityEventDetails {
  user_agent?: string;
  ip_address?: string;
  resource?: string;
  action?: string;
  old_value?: any;
  new_value?: any;
  [key: string]: any;
}

/**
 * Log a security event to the database
 */
export const logSecurityEvent = async (
  eventType: SecurityEventType,
  severity: SecuritySeverity = 'medium',
  details: SecurityEventDetails = {}
): Promise<void> => {
  try {
    // Get user agent and IP info
    const userAgent = navigator.userAgent;
    
    const eventDetails = {
      ...details,
      user_agent: userAgent,
      timestamp: new Date().toISOString(),
    };

    const { error } = await supabase.rpc('log_security_event', {
      event_type: eventType,
      severity,
      details: eventDetails
    });

    if (error) {
      logger.error('SecurityMonitoring', 'Failed to log security event', { error, eventType });
    } else {
      logger.debug('SecurityMonitoring', 'Security event logged', { eventType, severity });
    }
  } catch (error) {
    logger.error('SecurityMonitoring', 'Error logging security event', { error, eventType });
  }
};

/**
 * Log user activity
 */
export const logUserActivity = async (
  action: string,
  resourceType: string,
  resourceId?: string,
  details: Record<string, any> = {}
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('user_activity_log')
      .insert({
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        details
      });

    if (error) {
      logger.error('SecurityMonitoring', 'Failed to log user activity', { error, action });
    }
  } catch (error) {
    logger.error('SecurityMonitoring', 'Error logging user activity', { error, action });
  }
};

/**
 * Check for suspicious login patterns
 */
export const checkSuspiciousLogin = async (email: string): Promise<boolean> => {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const { data, error } = await supabase
      .from('security_events')
      .select('id')
      .eq('event_type', 'failed_login')
      .gte('created_at', oneHourAgo)
      .limit(5);

    if (error) {
      logger.error('SecurityMonitoring', 'Error checking suspicious login', { error });
      return false;
    }

    const failedAttempts = data?.length || 0;
    
    if (failedAttempts >= 5) {
      await logSecurityEvent('suspicious_activity', 'high', {
        description: 'Multiple failed login attempts detected',
        failed_attempts: failedAttempts,
        email
      });
      return true;
    }

    return false;
  } catch (error) {
    logger.error('SecurityMonitoring', 'Error in suspicious login check', { error });
    return false;
  }
};

/**
 * Rate limiting for authentication attempts
 */
class AuthRateLimiter {
  private attempts: Map<string, { count: number; lastAttempt: number }> = new Map();
  private readonly maxAttempts = 5;
  private readonly windowMs = 15 * 60 * 1000; // 15 minutes

  isRateLimited(identifier: string): boolean {
    const now = Date.now();
    const record = this.attempts.get(identifier);

    if (!record) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now });
      return false;
    }

    // Reset if window expired
    if (now - record.lastAttempt > this.windowMs) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now });
      return false;
    }

    // Increment attempts
    record.count++;
    record.lastAttempt = now;

    if (record.count > this.maxAttempts) {
      logger.warn('SecurityMonitoring', 'Rate limit exceeded', { identifier });
      return true;
    }

    return false;
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

export const authRateLimiter = new AuthRateLimiter();

/**
 * Monitor failed authentication attempts
 */
export const monitorAuthAttempt = async (
  email: string,
  success: boolean,
  details: SecurityEventDetails = {}
): Promise<void> => {
  const identifier = email.toLowerCase();

  if (success) {
    authRateLimiter.reset(identifier);
    await logSecurityEvent('successful_login', 'low', { email, ...details });
  } else {
    const isRateLimited = authRateLimiter.isRateLimited(identifier);
    
    await logSecurityEvent('failed_login', isRateLimited ? 'high' : 'medium', {
      email,
      rate_limited: isRateLimited,
      ...details
    });

    // Check for suspicious patterns
    await checkSuspiciousLogin(email);
  }
};