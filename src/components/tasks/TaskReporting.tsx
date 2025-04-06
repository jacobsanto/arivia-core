
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PropertyReporting } from './reporting/PropertyReporting';
import { StaffReporting } from './reporting/StaffReporting';
import { TimeAnalysis } from './reporting/TimeAnalysis';
import { ReportingHeader } from './reporting/ReportingHeader';
import { FileDown, Printer, Save } from "lucide-react";
import { toastService } from "@/services/toast/toast.service";
import { exportToCSV, preparePrint } from "@/utils/reportExportUtils";
import { completionData, staffData, performanceByDayData } from './reporting/reportingData';
import { DateRangeSelector } from '@/components/reports/DateRangeSelector';

const TaskReporting = () => {
  const [dateRange, setDateRange] = useState('month'); // week, month, quarter, year
  const [customDateRange, setCustomDateRange] = useState({
    from: undefined,
    to: undefined
  });
  const [activeTab, setActiveTab] = useState("properties");
  
  const handleExport = () => {
    // Determine which data to export based on active tab
    let dataToExport = [];
    let filename = '';
    
    switch (activeTab) {
      case 'properties':
        dataToExport = completionData;
        filename = `property-tasks-report-${dateRange}`;
        break;
      case 'staff':
        dataToExport = staffData;
        filename = `staff-performance-report-${dateRange}`;
        break;
      case 'time':
        dataToExport = performanceByDayData;
        filename = `time-analysis-report-${dateRange}`;
        break;
      default:
        dataToExport = completionData;
        filename = `tasks-report-${dateRange}`;
    }
    
    exportToCSV(dataToExport, filename);
    toastService.success("Report exported successfully");
  };
  
  const handlePrint = () => {
    // Determine which data to print based on active tab
    let dataToPrint = [];
    let title = '';
    
    switch (activeTab) {
      case 'properties':
        dataToPrint = completionData;
        title = "Property Tasks Report";
        break;
      case 'staff':
        dataToPrint = staffData;
        title = "Staff Performance Report";
        break;
      case 'time':
        dataToPrint = performanceByDayData;
        title = "Time Analysis Report";
        break;
      default:
        dataToPrint = completionData;
        title = "Tasks Report";
    }
    
    toastService.info("Preparing report for printing...");
    preparePrint(dataToPrint, title);
  };
  
  const handleSaveReport = () => {
    // In a real app, this would open a dialog to name and save the report
    toastService.success("Report saved successfully", {
      description: "You can access this report from the Scheduled Reports tab."
    });
  };

  const handleDateRangeChange = (range: any) => {
    setCustomDateRange(range);
    // If custom date range is selected, switch dateRange to 'custom'
    if (range.from && range.to) {
      setDateRange('custom');
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <ReportingHeader dateRange={dateRange} setDateRange={setDateRange} />
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          {dateRange === 'custom' && (
            <div className="w-full sm:w-64">
              <DateRangeSelector 
                value={customDateRange}
                onChange={handleDateRangeChange}
              />
            </div>
          )}
          
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <FileDown className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" size="sm" onClick={handleSaveReport}>
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="properties" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="time">Time Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="properties" className="space-y-4">
          <PropertyReporting />
        </TabsContent>
        
        <TabsContent value="staff" className="space-y-4">
          <StaffReporting />
        </TabsContent>
        
        <TabsContent value="time" className="space-y-4">
          <TimeAnalysis />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TaskReporting;
