/**
 * Centralized error handling service
 */
import { logger } from "@/services/logger";
import { toast } from "sonner";
import { recordAudit } from "@/services/auditLogs";

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface HandledError {
  id: string;
  message: string;
  userMessage: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  context?: ErrorContext;
  stack?: string;
}

class ErrorHandler {
  private errors: HandledError[] = [];
  private maxErrors = 50;
  
  handle(error: Error | string, context?: ErrorContext): HandledError {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    const errorId = this.generateErrorId();
    
    const handledError: HandledError = {
      id: errorId,
      message: errorObj.message,
      userMessage: this.getUserFriendlyMessage(errorObj.message),
      severity: this.determineSeverity(errorObj.message, context),
      timestamp: new Date(),
      context,
      stack: errorObj.stack
    };
    
    // Store error for debugging
    this.errors.unshift(handledError);
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }
    
    // Log error
    logger.error('Error handled', errorObj, {
      component: context?.component,
      action: context?.action,
      userId: context?.userId,
      errorId
    });
    
    // Record audit log for critical errors
    if (handledError.severity === 'critical' || handledError.severity === 'high') {
      recordAudit('error', `${context?.component || 'System'}: ${handledError.message}`, {
        error_name: errorObj.name,
        error_stack: errorObj.stack,
        component: context?.component,
        metadata: context?.metadata
      }).catch(err => {
        logger.warn('Failed to record audit log', err);
      });
    }
    
    // Show user notification
    this.showUserNotification(handledError);
    
    return handledError;
  }
  
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private getUserFriendlyMessage(message: string): string {
    // Map technical errors to user-friendly messages
    const errorMap: Record<string, string> = {
      'JWT expired': 'Your session has expired. Please log in again.',
      'Network Error': 'Connection problem. Please check your internet connection.',
      'Failed to fetch': 'Unable to connect to the server. Please try again.',
      'Permission denied': 'You don\'t have permission to perform this action.',
      'Validation failed': 'Please check your input and try again.',
      'Rate limit exceeded': 'Too many requests. Please wait a moment and try again.',
      'Not found': 'The requested item could not be found.',
      'Duplicate key': 'This item already exists.',
      'Foreign key violation': 'Cannot delete item - it is being used elsewhere.'
    };
    
    for (const [technical, friendly] of Object.entries(errorMap)) {
      if (message.toLowerCase().includes(technical.toLowerCase())) {
        return friendly;
      }
    }
    
    // Default to sanitized technical message
    return message.replace(/[^a-zA-Z0-9\s.,!?-]/g, '').trim() || 'An unexpected error occurred.';
  }
  
  private determineSeverity(message: string, context?: ErrorContext): HandledError['severity'] {
    const criticalPatterns = ['authentication', 'authorization', 'security', 'payment'];
    const highPatterns = ['database', 'api', 'network', 'server'];
    const mediumPatterns = ['validation', 'form', 'user input'];
    
    const lowerMessage = message.toLowerCase();
    
    if (criticalPatterns.some(pattern => lowerMessage.includes(pattern))) {
      return 'critical';
    }
    
    if (highPatterns.some(pattern => lowerMessage.includes(pattern))) {
      return 'high';
    }
    
    if (mediumPatterns.some(pattern => lowerMessage.includes(pattern))) {
      return 'medium';
    }
    
    return 'low';
  }
  
  private showUserNotification(error: HandledError): void {
    switch (error.severity) {
      case 'critical':
        toast.error('Critical Error', {
          description: error.userMessage,
          duration: 10000
        });
        break;
      case 'high':
        toast.error('Error', {
          description: error.userMessage,
          duration: 6000
        });
        break;
      case 'medium':
        toast.warning('Warning', {
          description: error.userMessage,
          duration: 4000
        });
        break;
      case 'low':
        toast.info('Notice', {
          description: error.userMessage,
          duration: 3000
        });
        break;
    }
  }
  
  getRecentErrors(limit = 10): HandledError[] {
    return this.errors.slice(0, limit);
  }
  
  clearErrors(): void {
    this.errors = [];
  }
  
  getErrorById(id: string): HandledError | undefined {
    return this.errors.find(error => error.id === id);
  }
}

export const errorHandler = new ErrorHandler();

// Convenience functions
export const handleError = (error: Error | string, context?: ErrorContext) => 
  errorHandler.handle(error, context);

export const getRecentErrors = (limit?: number) => 
  errorHandler.getRecentErrors(limit);