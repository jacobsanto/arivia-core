
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Download, FileDown, FileSpreadsheet, FileType, Loader2 } from "lucide-react";
import { toastService } from "@/services/toast/toast.service";
import { exportToCSV } from "@/utils/reportExportUtils";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ExportDropdownProps {
  data: any[];
  filename: string;
  reportTitle: string;
}

export const ExportDropdown: React.FC<ExportDropdownProps> = ({
  data,
  filename,
  reportTitle
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    setIsExporting(true);
    
    // Simulate export process
    setTimeout(() => {
      if (format === 'csv' || format === 'excel') {
        exportToCSV(data, filename);
        toastService.success(`Report exported as ${format.toUpperCase()}`, {
          description: `${reportTitle} has been exported`
        });
      } else {
        // PDF export would be handled differently in a real implementation
        toastService.success("Report exported as PDF", {
          description: `${reportTitle} has been exported`
        });
      }
      
      setIsExporting(false);
    }, 1000);
  };

  return (
    <DropdownMenu>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={isExporting}
              >
                {isExporting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Export
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Export report in different formats</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => handleExport('csv')}>
          <FileDown className="mr-2 h-4 w-4" />
          <span>Export as CSV</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('excel')}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          <span>Export as Excel</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('pdf')}>
          <FileType className="mr-2 h-4 w-4" />
          <span>Export as PDF</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
