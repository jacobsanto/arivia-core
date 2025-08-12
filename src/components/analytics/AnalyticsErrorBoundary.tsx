
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, BarChart3 } from 'lucide-react';
import { logger } from '@/services/logger';
import { recordAudit } from '@/services/auditLogs';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class AnalyticsErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('AnalyticsErrorBoundary', error, { component: 'AnalyticsErrorBoundary' });
    recordAudit('error', error.message, {
      error_name: error.name,
      error_stack: error.stack,
      component: 'AnalyticsErrorBoundary',
      metadata: { componentStack: errorInfo.componentStack },
    });
    this.setState({ error, errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="container mx-auto p-6">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Analytics Dashboard Error
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Dashboard Temporarily Unavailable</AlertTitle>
                <AlertDescription>
                  The analytics dashboard encountered an error while loading data. This is likely due to recent security updates.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <h4 className="font-medium">Possible causes:</h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Database permission changes</li>
                  <li>• Network connectivity issues</li>
                  <li>• Authentication token expired</li>
                </ul>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 p-3 bg-muted rounded text-xs">
                  <summary className="cursor-pointer font-medium">Error Details (Development)</summary>
                  <pre className="mt-2 whitespace-pre-wrap break-words text-xs">
                    {this.state.error.message}
                    {this.state.error.stack}
                  </pre>
                </details>
              )}

              <div className="flex gap-2 pt-4">
                <Button onClick={this.handleReset} className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Retry Dashboard
                </Button>
                <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Go to Main Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
