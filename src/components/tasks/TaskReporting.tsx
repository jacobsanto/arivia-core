
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PropertyReporting } from './reporting/PropertyReporting';
import { StaffReporting } from './reporting/StaffReporting';
import { TimeAnalysis } from './reporting/TimeAnalysis';
import { ReportingHeader } from './reporting/ReportingHeader';
import { FileDown, Printer } from "lucide-react";
import { toastService } from "@/services/toast/toast.service";

const TaskReporting = () => {
  const [dateRange, setDateRange] = useState('month'); // week, month, quarter, year
  
  const handleExport = () => {
    // Using our standardized toast service
    toastService.success("Report exported successfully");
    
    // Create a CSV string of the report data
    const csvData = generateReportCSV(dateRange);
    downloadCSV(csvData, `tasks-report-${dateRange}.csv`);
  };
  
  const handlePrint = () => {
    toastService.info("Preparing report for printing...");
    setTimeout(() => {
      window.print();
    }, 500);
  };
  
  // Function to generate CSV data from our report data
  const generateReportCSV = (range: string) => {
    // In a real app, this would generate actual CSV based on the report data
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Property,Tasks Completed,Avg Cleaning Time,Approval Rate\n";
    csvContent += "Villa Caldera,45,72,91%\n";
    csvContent += "Villa Sunset,36,68,89%\n";
    csvContent += "Villa Oceana,52,65,98%\n";
    return csvContent;
  };
  
  // Function to download CSV data
  const downloadCSV = (csvData: string, filename: string) => {
    const encodedUri = encodeURI(csvData);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
        <ReportingHeader dateRange={dateRange} setDateRange={setDateRange} />
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <FileDown className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="properties">
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
