
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Printer, Loader2 } from "lucide-react";
import { toastService } from "@/services/toast/toast.service";
import { preparePrint } from "@/utils/reportExportUtils";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface PrintButtonProps {
  data: any[];
  reportTitle: string;
}

export const PrintButton: React.FC<PrintButtonProps> = ({
  data,
  reportTitle
}) => {
  const [isPrinting, setIsPrinting] = useState(false);
  
  const handlePrint = () => {
    setIsPrinting(true);
    
    // Simulate print preparation
    setTimeout(() => {
      toastService.info("Preparing report for printing...");
      preparePrint(data, reportTitle);
      setIsPrinting(false);
    }, 1500);
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handlePrint}
            disabled={isPrinting}
          >
            {isPrinting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Printer className="mr-2 h-4 w-4" />
            )}
            Print
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Print this report</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
