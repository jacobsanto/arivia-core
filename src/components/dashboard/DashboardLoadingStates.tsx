
import React, { memo } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const DashboardLoader = memo(() => (
  <div className="flex items-center justify-center h-64">
    <div className="flex flex-col items-center gap-2">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Loading dashboard data...</p>
    </div>
  </div>
));
DashboardLoader.displayName = 'DashboardLoader';

const DashboardErrorFallback = memo(({ error, onRetry }: {
  error: string;
  onRetry: () => void;
}) => (
  <div className="flex flex-col items-center justify-center h-64 px-4">
    <Alert variant="destructive" className="max-w-md w-full mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Error loading dashboard</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
    </Alert>
    <Button onClick={onRetry} variant="outline">
      <Loader2 className="mr-2 h-4 w-4" />
      Retry
    </Button>
  </div>
));
DashboardErrorFallback.displayName = 'DashboardErrorFallback';

const DashboardLoadingStates = {
  Loader: DashboardLoader,
  ErrorFallback: DashboardErrorFallback
};

export default DashboardLoadingStates;
