
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PropertyReporting } from './reporting/PropertyReporting';
import { StaffReporting } from './reporting/StaffReporting';
import { TimeAnalysis } from './reporting/TimeAnalysis';
import { ReportingHeader } from './reporting/ReportingHeader';
import { FileDown, Printer } from "lucide-react";
import { toast } from "sonner";

const TaskReporting = () => {
  const [dateRange, setDateRange] = useState('month'); // week, month, quarter, year
  
  const handleExport = () => {
    toast.success("Report exported successfully");
  };
  
  const handlePrint = () => {
    toast.success("Sending to printer...");
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
