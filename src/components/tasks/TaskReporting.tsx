import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PropertyReporting } from './reporting/PropertyReporting';
import { StaffReporting } from './reporting/StaffReporting';
import { TimeAnalysis } from './reporting/TimeAnalysis';
import { ReportingHeader } from './reporting/ReportingHeader';
import { DateRangeSelector } from '@/components/reports/DateRangeSelector';
import { ReportActionButtons } from './reporting/ReportActionButtons';
import { completionData, staffData, performanceByDayData } from './reporting/reportingData';
import { useIsMobile } from "@/hooks/use-mobile";

const TaskReporting = () => {
  const [dateRange, setDateRange] = useState('month'); // week, month, quarter, year
  const [customDateRange, setCustomDateRange] = useState({
    from: undefined,
    to: undefined
  });
  const [activeTab, setActiveTab] = useState("properties");
  const isMobile = useIsMobile();
  
  const getCurrentData = () => {
    switch (activeTab) {
      case 'properties':
        return completionData;
      case 'staff':
        return staffData;
      case 'time':
        return performanceByDayData;
      default:
        return completionData;
    }
  };

  const handleDateRangeChange = (range: any) => {
    setCustomDateRange(range);
    if (range.from && range.to) {
      setDateRange('custom');
    }
  };
  
  return (
    <div className="space-y-6 overflow-hidden">
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
          
          <ReportActionButtons 
            activeTab={activeTab} 
            dateRange={dateRange} 
            data={getCurrentData()} 
          />
        </div>
      </div>
      
      <div className="w-full overflow-hidden">
        <Tabs defaultValue="properties" value={activeTab} onValueChange={setActiveTab}>
          <div className="mobile-scroll">
            <TabsList className={`${isMobile ? 'w-[300px] min-w-full' : 'w-full'} grid grid-cols-3 mb-4`}>
              <TabsTrigger value="properties">Properties</TabsTrigger>
              <TabsTrigger value="staff">Staff</TabsTrigger>
              <TabsTrigger value="time">Time Analysis</TabsTrigger>
            </TabsList>
          </div>
          
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
    </div>
  );
};

export default TaskReporting;
