
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Save, Loader2 } from "lucide-react";
import { toastService } from "@/services/toast/toast.service";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface SaveButtonProps {
  reportTitle: string;
}

export const SaveButton: React.FC<SaveButtonProps> = ({
  reportTitle
}) => {
  const [isSaving, setIsSaving] = useState(false);
  
  const handleSaveReport = () => {
    setIsSaving(true);
    
    // Simulate saving process
    setTimeout(() => {
      toastService.success("Report saved successfully", {
        description: "You can access this report from the Scheduled Reports tab."
      });
      setIsSaving(false);
    }, 1200);
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSaveReport}
            disabled={isSaving}
          >
            {isSaving ? (
              <span className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </span>
            ) : (
              <span className="flex items-center">
                <Save className="mr-2 h-4 w-4" />
                <span>Save</span>
              </span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Save this report for later</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
