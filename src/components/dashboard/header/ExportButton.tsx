
import React from 'react';
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ExportButtonProps {
  isExporting: boolean;
  onClick: () => void;
  isMobile?: boolean;
}

const ExportButton: React.FC<ExportButtonProps> = ({ 
  isExporting, 
  onClick, 
  isMobile = false 
}) => {
  return isMobile ? (
    <Button 
      variant="outline" 
      onClick={onClick}
      disabled={isExporting}
      className="flex-1 flex items-center justify-center gap-2"
    >
      <span className="flex items-center">
        {isExporting ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <FileDown className="h-4 w-4 mr-2" />
        )}
        <span>Export</span>
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
            disabled={isExporting}
          >
            <span className="flex items-center">
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <FileDown className="h-4 w-4 mr-2" />
              )}
              <span>Export Reports</span>
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Export dashboard data in various formats</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ExportButton;
