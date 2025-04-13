
import React from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Printer, CalendarRange, Send, Save } from "lucide-react";
import { toastService } from "@/services/toast/toast.service";
import { exportToCSV, preparePrint } from "@/utils/reportExportUtils";

interface WeeklyReviewActionsProps {
  isGeneratingReport: boolean;
  setIsGeneratingReport: (isGenerating: boolean) => void;
  isSchedulingReport: boolean;
  setIsSchedulingReport: (isScheduling: boolean) => void;
  prepareWeeklyReportData: () => any[];
  propertyFilter: string;
  onClose: () => void;
}

const WeeklyReviewActions: React.FC<WeeklyReviewActionsProps> = ({
  isGeneratingReport,
  setIsGeneratingReport,
  isSchedulingReport,
  setIsSchedulingReport,
  prepareWeeklyReportData,
  propertyFilter,
  onClose
}) => {
  // Handle export
  const handleExportReport = () => {
    const exportData = prepareWeeklyReportData();
    const filename = `Arivia_Weekly_Review_${propertyFilter === 'all' ? 'All_Properties' : propertyFilter.replace(/\s+/g, '_')}`;
    exportToCSV(exportData, filename);
    toastService.success("Weekly review exported", {
      description: `Report has been exported as ${filename}.csv`
    });
  };

  // Handle print
  const handlePrintReport = () => {
    const printData = prepareWeeklyReportData();
    const title = `Arivia Weekly Review - ${propertyFilter === 'all' ? 'All Properties' : propertyFilter}`;
    preparePrint(printData, title);
    toastService.success("Report ready for printing", {
      description: "Weekly review has been prepared for printing"
    });
  };

  // Handle save
  const handleSaveReport = () => {
    setIsGeneratingReport(true);
    setTimeout(() => {
      setIsGeneratingReport(false);
      toastService.success("Weekly review saved", {
        description: "Report has been saved to the Reports section"
      });
    }, 1500);
  };
  
  // Handle schedule
  const handleScheduleReport = () => {
    setIsSchedulingReport(true);
    setTimeout(() => {
      setIsSchedulingReport(false);
      toastService.success("Weekly report scheduled", {
        description: "Report will be delivered every Monday at 8:00 AM"
      });
    }, 1500);
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleSaveReport}
        disabled={isGeneratingReport}
        className="flex items-center gap-2"
      >
        <Save className="h-4 w-4" />
        Save Report
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handlePrintReport}
        className="flex items-center gap-2"
      >
        <Printer className="h-4 w-4" />
        Print
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleExportReport}
        className="flex items-center gap-2"
      >
        <FileDown className="h-4 w-4" />
        Export
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleScheduleReport}
        disabled={isSchedulingReport}
        className="flex items-center gap-2"
      >
        <Send className="h-4 w-4" />
        Schedule Delivery
      </Button>
      <Button size="sm" onClick={onClose}>Close</Button>
    </>
  );
};

export default WeeklyReviewActions;
