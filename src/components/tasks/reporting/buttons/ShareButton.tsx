
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Share2, Loader2 } from "lucide-react";
import { toastService } from "@/services/toast/toast.service";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface ShareButtonProps {
  reportTitle: string;
}

export const ShareButton: React.FC<ShareButtonProps> = ({
  reportTitle
}) => {
  const [isSharing, setIsSharing] = useState(false);
  
  const handleShareReport = () => {
    setIsSharing(true);
    
    // Simulate sharing process
    setTimeout(() => {
      toastService.success("Report shared", {
        description: "Report has been shared with selected recipients."
      });
      setIsSharing(false);
    }, 1000);
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleShareReport}
            disabled={isSharing}
          >
            <span className="flex items-center">
              {isSharing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Share2 className="mr-2 h-4 w-4" />
              )}
              <span>Share</span>
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Share this report with team members</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
