import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Building } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class PropertiesErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Properties error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="space-y-6 p-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Properties</h1>
            <p className="text-muted-foreground">
              Manage your property portfolio and sync with booking platforms
            </p>
          </div>

          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Building className="h-5 w-5" />
                Properties System Error
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Unable to load properties data. This might be due to:
                </AlertDescription>
              </Alert>
              
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>Guesty API connection issues or rate limiting</li>
                <li>Database sync problems with property listings</li>
                <li>Insufficient permissions to access property data</li>
                <li>Network connectivity problems</li>
                <li>Booking platform integration failures</li>
              </ul>

              {this.state.error && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium">
                    Technical Details
                  </summary>
                  <code className="text-xs bg-muted p-2 rounded mt-2 block">
                    {this.state.error.message}
                  </code>
                </details>
              )}

              <Button 
                onClick={this.handleRetry}
                className="w-full"
                variant="outline"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Loading Properties
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}