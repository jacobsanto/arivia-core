
import React from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface RefreshButtonProps {
  isRefreshing: boolean;
  onClick: () => void;
  isMobile?: boolean;
}

const RefreshButton: React.FC<RefreshButtonProps> = ({ 
  isRefreshing, 
  onClick, 
  isMobile = false 
}) => {
  return isMobile ? (
    <Button 
      variant="outline"
      onClick={onClick}
      disabled={isRefreshing}
      className="flex-1 flex items-center justify-center gap-2"
    >
      <span className="flex items-center">
        {isRefreshing ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <RefreshCw className="h-4 w-4 mr-2" />
        )}
        <span>Refresh</span>
      </span>
    </Button>
  ) : (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={onClick}
            disabled={isRefreshing}
          >
            <span className="flex items-center">
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              <span>Refresh</span>
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Refresh all dashboard data</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default RefreshButton;
