import React from 'react';
import { BaseErrorBoundary } from './BaseErrorBoundary';
import { MessageSquare, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface ChatErrorBoundaryProps {
  children: React.ReactNode;
}

export const ChatErrorBoundary: React.FC<ChatErrorBoundaryProps> = ({ children }) => {
  return (
    <BaseErrorBoundary
      fallback={
        <div className="min-h-[400px] flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <CardTitle>Chat Error</CardTitle>
              </div>
              <CardDescription>
                There was a problem loading the chat. Please try refreshing.
              </CardDescription>
            </CardHeader>
            
            <CardFooter>
              <Button 
                onClick={() => window.location.reload()}
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Chat
              </Button>
            </CardFooter>
          </Card>
        </div>
      }
    >
      {children}
    </BaseErrorBoundary>
  );
};
