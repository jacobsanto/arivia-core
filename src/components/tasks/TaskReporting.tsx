
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PropertyReporting } from './reporting/PropertyReporting';
import { StaffReporting } from './reporting/StaffReporting';
import { TimeAnalysis } from './reporting/TimeAnalysis';
import { ReportingHeader } from './reporting/ReportingHeader';

const TaskReporting = () => {
  const [dateRange, setDateRange] = useState('month'); // week, month, quarter, year
  
  return (
    <div className="space-y-6">
      <ReportingHeader dateRange={dateRange} setDateRange={setDateRange} />
      
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
