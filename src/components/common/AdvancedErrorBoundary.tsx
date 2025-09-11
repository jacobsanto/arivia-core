import React, { Component, ReactNode, ErrorInfo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  FileText, 
  Copy,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { logger } from '@/services/logger';
import { useCache } from '@/contexts/CacheContext';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  context?: string;
  showTechnicalDetails?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId: string;
  retryCount: number;
  showDetails: boolean;
}

// Enhanced error boundary with context awareness and recovery mechanisms
export class AdvancedErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;
  private retryTimeout?: NodeJS.Timeout;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      errorId: '',
      retryCount: 0,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
    
    // Enhanced error logging with context
    logger.error('Advanced error boundary triggered', error, {
      component: 'AdvancedErrorBoundary',
      context: this.props.context || 'unknown',
      errorInfo: JSON.stringify(errorInfo),
      stack: error.stack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      errorId: this.state.errorId,
    });

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Attempt automatic recovery for certain error types
    this.attemptAutoRecovery(error);
  }

  private attemptAutoRecovery = (error: Error) => {
    const errorMessage = error.message.toLowerCase();
    
    // Auto-retry for network-related errors
    if (
      errorMessage.includes('network') ||
      errorMessage.includes('fetch') ||
      errorMessage.includes('timeout')
    ) {
      this.scheduleRetry(2000); // Retry after 2 seconds
    }
    
    // Auto-clear cache for cache-related errors
    if (errorMessage.includes('cache') || errorMessage.includes('storage')) {
      this.clearAppCache();
    }
  };

  private scheduleRetry = (delay: number) => {
    if (this.state.retryCount < this.maxRetries) {
      this.retryTimeout = setTimeout(() => {
        this.handleRetry();
      }, delay);
    }
  };

  private clearAppCache = () => {
    try {
      // Clear various caches
      localStorage.clear();
      sessionStorage.clear();
      
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => caches.delete(name));
        });
      }
      
      logger.info('App cache cleared due to error recovery');
    } catch (cacheError) {
      logger.error('Failed to clear cache during error recovery', cacheError);
    }
  };

  private handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: prevState.retryCount + 1,
    }));
    
    logger.info('Error boundary retry attempted', {
      retryCount: this.state.retryCount + 1,
      errorId: this.state.errorId,
    });
  };

  private handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  private handleReloadPage = () => {
    window.location.reload();
  };

  private copyErrorDetails = () => {
    const errorDetails = {
      errorId: this.state.errorId,
      message: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2))
      .then(() => {
        logger.info('Error details copied to clipboard');
      })
      .catch(err => {
        logger.error('Failed to copy error details', err);
      });
  };

  private getErrorSeverity = (error: Error): 'low' | 'medium' | 'high' => {
    const errorMessage = error.message.toLowerCase();
    
    if (
      errorMessage.includes('network') ||
      errorMessage.includes('fetch') ||
      errorMessage.includes('timeout')
    ) {
      return 'low'; // Network errors are usually temporary
    }
    
    if (
      errorMessage.includes('permission') ||
      errorMessage.includes('unauthorized') ||
      errorMessage.includes('forbidden')
    ) {
      return 'medium'; // Permission errors need attention
    }
    
    return 'high'; // Unknown errors are potentially serious
  };

  private getRecoveryActions = (error: Error) => {
    const errorMessage = error.message.toLowerCase();
    const actions = [];

    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      actions.push('Check your internet connection');
      actions.push('Try refreshing the page');
    }

    if (errorMessage.includes('permission') || errorMessage.includes('auth')) {
      actions.push('Try logging out and back in');
      actions.push('Contact your administrator');
    }

    if (errorMessage.includes('storage') || errorMessage.includes('cache')) {
      actions.push('Clear your browser cache');
      actions.push('Try an incognito/private window');
    }

    if (actions.length === 0) {
      actions.push('Try refreshing the page');
      actions.push('Contact support if the problem persists');
    }

    return actions;
  };

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const severity = this.state.error ? this.getErrorSeverity(this.state.error) : 'high';
      const recoveryActions = this.state.error ? this.getRecoveryActions(this.state.error) : [];
      const canRetry = this.state.retryCount < this.maxRetries;

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              
              <div className="flex items-center justify-center gap-2 mb-2">
                <CardTitle>Something went wrong</CardTitle>
                <Badge 
                  variant={severity === 'high' ? 'destructive' : severity === 'medium' ? 'secondary' : 'outline'}
                >
                  {severity} severity
                </Badge>
              </div>
              
              <CardDescription>
                We encountered an unexpected error. This has been logged and our team will investigate.
              </CardDescription>
              
              {this.state.errorId && (
                <div className="text-xs text-muted-foreground font-mono">
                  Error ID: {this.state.errorId}
                </div>
              )}
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Recovery Actions */}
              {recoveryActions.length > 0 && (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Suggested actions:
                  </h4>
                  <ul className="text-sm space-y-1">
                    {recoveryActions.map((action, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-muted-foreground">•</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  {canRetry && (
                    <Button onClick={this.handleRetry} className="w-full">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Try Again {this.state.retryCount > 0 && `(${this.state.retryCount}/${this.maxRetries})`}
                    </Button>
                  )}
                  
                  <Button variant="outline" onClick={this.handleReloadPage} className="w-full">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reload Page
                  </Button>
                </div>
                
                <Button variant="outline" onClick={this.handleGoHome} className="w-full">
                  <Home className="w-4 h-4 mr-2" />
                  Go to Dashboard
                </Button>
              </div>

              {/* Technical Details */}
              {(this.props.showTechnicalDetails || import.meta.env.DEV) && this.state.error && (
                <div className="border-t pt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => this.setState(prev => ({ showDetails: !prev.showDetails }))}
                    className="mb-3"
                  >
                    {this.state.showDetails ? (
                      <ChevronUp className="w-4 h-4 mr-2" />
                    ) : (
                      <ChevronDown className="w-4 h-4 mr-2" />
                    )}
                    Technical Details
                  </Button>

                  {this.state.showDetails && (
                    <div className="space-y-3">
                      <div className="bg-muted p-3 rounded-md">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">Error Message:</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={this.copyErrorDetails}
                            className="h-6 px-2"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                        <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-all">
                          {this.state.error.message}
                        </pre>
                      </div>

                      {this.state.error.stack && (
                        <div className="bg-muted p-3 rounded-md">
                          <span className="font-medium text-sm">Stack Trace:</span>
                          <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-all mt-2 max-h-32 overflow-y-auto">
                            {this.state.error.stack}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook to use with error boundary context
export const useErrorRecovery = () => {
  const cache = useCache();

  const clearAppState = React.useCallback(() => {
    // Clear React Query cache
    if ((window as any).queryClient) {
      (window as any).queryClient.clear();
    }

    // Clear application cache
    cache.clear();

    // Clear browser storage
    localStorage.clear();
    sessionStorage.clear();

    logger.info('Application state cleared for error recovery');
  }, [cache]);

  const reportError = React.useCallback((error: Error, context?: string) => {
    logger.error('Manual error report', error, {
      context: context || 'user-reported',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    });
  }, []);

  return {
    clearAppState,
    reportError,
  };
};