import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, X } from 'lucide-react';
import { useAppUpdate } from '@/hooks/useAppUpdate';

export const UpdatePrompt: React.FC = () => {
  const { needRefresh, updateApp, dismissUpdate } = useAppUpdate();

  if (!needRefresh) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-slide-in-from-bottom md:left-auto md:right-4 md:w-96 md:bottom-4">
      <Card className="border-2 border-primary shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <RefreshCw className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Update Available</CardTitle>
                <CardDescription className="text-xs">
                  A new version is ready to install
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 -mr-2 -mt-1"
              onClick={dismissUpdate}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          <Button onClick={updateApp} className="w-full" size="lg">
            <RefreshCw className="mr-2 h-4 w-4" />
            Update Now
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            The app will reload with the latest version
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
