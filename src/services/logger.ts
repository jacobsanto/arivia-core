/**
 * Centralized logging service for the Arivia Villas application
 * Replaces console.log statements with environment-aware logging
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  component?: string;
  userId?: string;
  feature?: string;
  timestamp?: string;
  [key: string]: unknown;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private isDevMode = localStorage.getItem('arivia-dev-mode') === 'true';

  private shouldLog(level: LogLevel): boolean {
    // Always log errors and warnings
    if (level === 'error' || level === 'warn') return true;
    
    // Log debug/info only in development or dev mode
    return this.isDevelopment || this.isDevMode;
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${level.toUpperCase()}] ${timestamp}`;
    const contextStr = context ? ` (${Object.keys(context).map(k => `${k}:${context[k]}`).join(', ')})` : '';
    return `${prefix} ${message}${contextStr}`;
  }

  /**
   * Debug logging - only shown in development
   */
  debug(message: string, data?: unknown, context?: LogContext): void {
    if (!this.shouldLog('debug')) return;
    
    const formattedMessage = this.formatMessage('debug', message, context);
    if (data) {
      console.log(formattedMessage, data);
    } else {
      console.log(formattedMessage);
    }
  }

  /**
   * Info logging - for general application flow
   */
  info(message: string, data?: unknown, context?: LogContext): void {
    if (!this.shouldLog('info')) return;
    
    const formattedMessage = this.formatMessage('info', message, context);
    if (data) {
      console.log(formattedMessage, data);
    } else {
      console.log(formattedMessage);
    }
  }

  /**
   * Warning logging - always shown, sanitized in production
   */
  warn(message: string, data?: unknown, context?: LogContext): void {
    const formattedMessage = this.formatMessage('warn', message, context);
    if (data && this.isDevelopment) {
      console.warn(formattedMessage, data);
    } else {
      console.warn(formattedMessage);
    }
  }

  /**
   * Error logging - always shown, sanitized in production
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const formattedMessage = this.formatMessage('error', message, context);
    
    if (this.isDevelopment || this.isDevMode) {
      // Show full error details in development
      console.error(formattedMessage, error);
    } else {
      // Show sanitized error in production
      const sanitizedError = error instanceof Error ? error.message : 'Unknown error';
      console.error(formattedMessage, sanitizedError);
    }
  }

  /**
   * Auth-specific logging with user context
   */
  auth(message: string, userId?: string, data?: unknown): void {
    this.info(message, data, { component: 'auth', userId });
  }

  /**
   * API-specific logging
   */
  api(message: string, endpoint?: string, data?: unknown): void {
    this.debug(message, data, { component: 'api', endpoint });
  }

  /**
   * Performance logging
   */
  performance(message: string, duration?: number, operation?: string): void {
    this.debug(message, { duration: `${duration}ms` }, { component: 'performance', operation });
  }
}

// Export singleton instance
export const logger = new Logger();

// Export types for external use
export type { LogLevel, LogContext };