
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  RefreshCcw, 
  AlertTriangle, 
  HelpCircle
} from "lucide-react";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface GuestySyncControlsProps {
  onTest: () => void;
  onSync: () => void;
  isTesting: boolean;
  isSyncing: boolean;
  isConnected: boolean;
}

const GuestySyncControls: React.FC<GuestySyncControlsProps> = ({
  onTest,
  onSync,
  isTesting,
  isSyncing,
  isConnected
}) => {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              onClick={onTest} 
              disabled={isTesting}
              className="shrink-0"
            >
              {isTesting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test Connection'
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Verify API credentials and connectivity</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              onClick={onSync}
              disabled={isSyncing || !isConnected}
              className="shrink-0 relative"
            >
              <RefreshCcw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync Properties'}
              {!isConnected && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-md">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mr-1" />
                  <span className="text-xs">Disconnected</span>
                </div>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent className="max-w-[250px]">
            <p>Sync properties from Guesty. Progressive backoff is applied on rate limit errors.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-[250px]">
            <div className="space-y-2">
              <p className="font-medium">About Rate Limiting</p>
              <p className="text-xs">
                Guesty API has rate limits. If limits are reached, the system will automatically 
                implement progressive backoff (15-240 min) before retrying.
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default GuestySyncControls;
