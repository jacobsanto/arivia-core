
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  FileDown, 
  Printer, 
  Save, 
  Loader2, 
  Share2, 
  Download, 
  FileSpreadsheet, 
  FilePdf 
} from "lucide-react";
import { toastService } from "@/services/toast/toast.service";
import { exportToCSV, preparePrint } from "@/utils/reportExportUtils";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ReportActionButtonsProps {
  activeTab: string;
  dateRange: string;
  data: any[];
}

export const ReportActionButtons: React.FC<ReportActionButtonsProps> = ({
  activeTab,
  dateRange,
  data
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  
  const getReportTitle = () => {
    switch (activeTab) {
      case 'properties':
        return "Property Maintenance Report";
      case 'technicians':
        return "Technician Performance Report";
      case 'types':
        return "Maintenance Types Report";
      default:
        return "Maintenance Report";
    }
  };
  
  const getFilename = () => {
    const title = getReportTitle().toLowerCase().replace(/\s+/g, '-');
    return `${title}-${dateRange}`;
  };
  
  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    setIsExporting(true);
    
    // Simulate export process
    setTimeout(() => {
      const filename = getFilename();
      
      if (format === 'csv' || format === 'excel') {
        exportToCSV(data, filename);
        toastService.success(`Report exported as ${format.toUpperCase()}`, {
          description: `${getReportTitle()} has been exported`
        });
      } else {
        // PDF export would be handled differently in a real implementation
        toastService.success("Report exported as PDF", {
          description: `${getReportTitle()} has been exported`
        });
      }
      
      setIsExporting(false);
    }, 1000);
  };
  
  const handlePrint = () => {
    setIsPrinting(true);
    
    // Simulate print preparation
    setTimeout(() => {
      toastService.info("Preparing report for printing...");
      preparePrint(data, getReportTitle());
      setIsPrinting(false);
    }, 1500);
  };
  
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
    <div className="flex space-x-2">
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
            <FilePdf className="mr-2 h-4 w-4" />
            <span>Export as PDF</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
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
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Save this report for later</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleShareReport}
              disabled={isSharing}
            >
              {isSharing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Share2 className="mr-2 h-4 w-4" />
              )}
              Share
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Share this report with team members</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
