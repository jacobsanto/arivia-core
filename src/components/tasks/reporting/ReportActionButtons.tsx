
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { FileDown, Printer, Save, Loader2 } from "lucide-react";
import { toastService } from "@/services/toast/toast.service";
import { exportToCSV, preparePrint } from "@/utils/reportExportUtils";

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
  
  const handleExport = () => {
    setIsExporting(true);
    
    // Simulate export process
    setTimeout(() => {
      // Determine which data to export based on active tab
      let filename = '';
      
      switch (activeTab) {
        case 'properties':
          filename = `property-tasks-report-${dateRange}`;
          break;
        case 'staff':
          filename = `staff-performance-report-${dateRange}`;
          break;
        case 'time':
          filename = `time-analysis-report-${dateRange}`;
          break;
        default:
          filename = `tasks-report-${dateRange}`;
      }
      
      exportToCSV(data, filename);
      toastService.success("Report exported successfully");
      setIsExporting(false);
    }, 1000);
  };
  
  const handlePrint = () => {
    setIsPrinting(true);
    
    // Simulate print preparation
    setTimeout(() => {
      // Determine which data to print based on active tab
      let title = '';
      
      switch (activeTab) {
        case 'properties':
          title = "Property Tasks Report";
          break;
        case 'staff':
          title = "Staff Performance Report";
          break;
        case 'time':
          title = "Time Analysis Report";
          break;
        default:
          title = "Tasks Report";
      }
      
      toastService.info("Preparing report for printing...");
      preparePrint(data, title);
      setIsPrinting(false);
    }, 1500);
  };
  
  const handleSaveReport = () => {
    setIsSaving(true);
    
    // Simulate saving process
    setTimeout(() => {
      // In a real app, this would open a dialog to name and save the report
      toastService.success("Report saved successfully", {
        description: "You can access this report from the Scheduled Reports tab."
      });
      setIsSaving(false);
    }, 1200);
  };
  
  return (
    <div className="flex space-x-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleExport}
        disabled={isExporting}
      >
        {isExporting ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <FileDown className="mr-2 h-4 w-4" />
        )}
        Export
      </Button>
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
    </div>
  );
};
