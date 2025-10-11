import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, MessageSquare, Wifi, WifiOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { logger } from '@/services/logger';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class TeamChatErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('Team Chat error', error, { component: 'TeamChatErrorBoundary', errorInfo: errorInfo.componentStack });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="h-[calc(100vh-10rem)] flex flex-col p-6">
          <div className="mb-4">
            <h1 className="text-3xl font-bold tracking-tight">Team Chat</h1>
            <p className="text-muted-foreground">
              Communicate in real-time with your team members.
            </p>
          </div>
          
          <Card className="max-w-2xl mx-auto mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <MessageSquare className="h-5 w-5" />
                Chat Connection Error
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <WifiOff className="h-4 w-4" />
                <AlertDescription>
                  Unable to connect to team chat. This might be due to:
                </AlertDescription>
              </Alert>
              
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>WebSocket connection failure</li>
                <li>Network connectivity issues</li>
                <li>Chat server maintenance or downtime</li>
                <li>Browser security settings blocking real-time connections</li>
                <li>Insufficient permissions to access chat channels</li>
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

              <div className="flex gap-2">
                <Button 
                  onClick={this.handleRetry}
                  className="flex-1"
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Connection
                </Button>
                <Button 
                  onClick={() => window.location.reload()}
                  className="flex-1"
                  variant="default"
                >
                  <Wifi className="h-4 w-4 mr-2" />
                  Refresh Page
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