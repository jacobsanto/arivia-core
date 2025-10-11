// @ts-nocheck
import React, { Component, ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Bug } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/services/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  enableRetry?: boolean;
  enableReporting?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  retryCount: number;
  isReporting: boolean;
}

export class EnhancedErrorBoundary extends Component<Props, State> {
  private retryTimer: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      isReporting: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    
    // Call custom error handler
    this.props.onError?.(error, errorInfo);
    
    // Log error using logger service
    logger.error('ErrorBoundary caught an error', error, { componentStack: errorInfo.componentStack });
    
    // Log error to database if enabled
    if (this.props.enableReporting !== false) {
      this.logErrorToDatabase(error, errorInfo);
    }
  }

  private async logErrorToDatabase(error: Error, errorInfo: React.ErrorInfo) {
    try {
      await supabase.from('audit_logs').insert({
        table_name: 'error_boundary',
        action: 'ERROR_CAUGHT',
        new_values: {
          error_message: error.message,
          error_stack: error.stack,
          component_stack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
          retry_count: this.state.retryCount
        }
      });
    } catch (dbError) {
      logger.error('Failed to log error to database', dbError);
    }
  }

  private handleRetry = () => {
    const maxRetries = 3;
    
    if (this.state.retryCount >= maxRetries) {
      alert('Maximum retry attempts reached. Please refresh the page.');
      return;
    }

    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));

    // Auto-retry with exponential backoff
    const delay = Math.min(1000 * Math.pow(2, this.state.retryCount), 10000);
    this.retryTimer = setTimeout(() => {
      // Force re-render
      this.forceUpdate();
    }, delay);
  };

  private handleReportError = async () => {
    if (!this.state.error) return;

    this.setState({ isReporting: true });

    try {
      // Create detailed error report
      const errorReport = {
        timestamp: new Date().toISOString(),
        error_message: this.state.error.message,
        error_stack: this.state.error.stack,
        component_stack: this.state.errorInfo?.componentStack,
        user_agent: navigator.userAgent,
        url: window.location.href,
        retry_count: this.state.retryCount,
        additional_info: {
          react_version: React.version,
          timestamp_ms: Date.now()
        }
      };

      // Send to monitoring system
      await supabase.from('audit_logs').insert({
        table_name: 'error_reports',
        action: 'USER_REPORTED_ERROR',
        new_values: errorReport
      });

      alert('Error report sent successfully. Thank you for helping us improve!');
    } catch (reportError) {
      logger.error('Failed to send error report', reportError);
      alert('Failed to send error report. Please try again later.');
    } finally {
      this.setState({ isReporting: false });
    }
  };

  componentWillUnmount() {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-6 max-w-2xl mx-auto">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription className="mt-2">
              <div className="space-y-3">
                <p>An error occurred while rendering this component.</p>
                
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm font-medium">
                      Error Details (Development Mode)
                    </summary>
                    <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-auto max-h-32">
                      {this.state.error.message}
                      {'\n\n'}
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
                
                <div className="flex gap-2 mt-4">
                  {this.props.enableRetry !== false && (
                    <Button 
                      onClick={this.handleRetry}
                      variant="outline"
                      size="sm"
                      disabled={this.state.retryCount >= 3}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retry ({3 - this.state.retryCount} left)
                    </Button>
                  )}
                  
                  {this.props.enableReporting !== false && (
                    <Button 
                      onClick={this.handleReportError}
                      variant="outline"
                      size="sm"
                      disabled={this.state.isReporting}
                    >
                      <Bug className="h-4 w-4 mr-2" />
                      {this.state.isReporting ? 'Reporting...' : 'Report Error'}
                    </Button>
                  )}
                  
                  <Button 
                    onClick={() => window.location.reload()}
                    size="sm"
                  >
                    Reload Page
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}