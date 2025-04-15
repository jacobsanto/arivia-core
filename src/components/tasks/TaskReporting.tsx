
import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PropertyReporting } from './reporting/PropertyReporting';
import { StaffReporting } from './reporting/StaffReporting';
import { TimeAnalysis } from './reporting/TimeAnalysis';
import { ReportingHeader } from './reporting/ReportingHeader';
import { DateRangeSelector } from '@/components/reports/DateRangeSelector';
import { ReportActionButtons } from './reporting/ReportActionButtons';
import { useIsMobile } from "@/hooks/use-mobile";
import { getDateRangeForTimeFilter } from '@/utils/dateRangeUtils';
import { 
  reportDataService, 
  PropertyReportData, 
  StaffReportData, 
  TimeAnalysisData 
} from '@/services/reports/reportDataService';
import { toastService } from '@/services/toast/toast.service';

const TaskReporting = () => {
  const [dateRange, setDateRange] = useState('month'); // week, month, quarter, year
  const [customDateRange, setCustomDateRange] = useState({
    from: getDateRangeForTimeFilter('month').from,
    to: getDateRangeForTimeFilter('month').to
  });
  const [activeTab, setActiveTab] = useState("properties");
  const isMobile = useIsMobile();
  
  // State for our data
  const [propertyData, setPropertyData] = useState<PropertyReportData[]>([]);
  const [staffData, setStaffData] = useState<StaffReportData[]>([]);
  const [timeData, setTimeAnalysisData] = useState<TimeAnalysisData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // When dateRange changes, update the customDateRange if it's not a custom range
  useEffect(() => {
    if (dateRange !== 'custom') {
      const newDateRange = getDateRangeForTimeFilter(dateRange);
      setCustomDateRange(newDateRange);
    }
  }, [dateRange]);
  
  // Load data whenever the date range changes
  useEffect(() => {
    loadReportData();
  }, [customDateRange, activeTab]);
  
  const loadReportData = async () => {
    try {
      setIsLoading(true);
      
      // Only load data for the active tab to improve performance
      switch (activeTab) {
        case 'properties':
          const propertyResult = await reportDataService.getPropertyData({ dateRange: customDateRange });
          setPropertyData(propertyResult);
          break;
        case 'staff':
          const staffResult = await reportDataService.getStaffData({ dateRange: customDateRange });
          setStaffData(staffResult);
          break;
        case 'time':
          const timeResult = await reportDataService.getTimeAnalysisData({ dateRange: customDateRange });
          setTimeAnalysisData(timeResult);
          break;
      }
    } catch (error) {
      console.error('Error loading report data:', error);
      toastService.error('Failed to load report data');
    } finally {
      setIsLoading(false);
    }
  };
  
  const getCurrentData = () => {
    switch (activeTab) {
      case 'properties':
        return propertyData;
      case 'staff':
        return staffData;
      case 'time':
        return timeData;
      default:
        return [];
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
        <ReportingHeader 
          dateRange={dateRange} 
          setDateRange={setDateRange} 
          isLoading={isLoading}
        />
        
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
            <PropertyReporting 
              data={propertyData} 
              isLoading={isLoading} 
            />
          </TabsContent>
          
          <TabsContent value="staff" className="space-y-4">
            <StaffReporting 
              data={staffData} 
              isLoading={isLoading} 
            />
          </TabsContent>
          
          <TabsContent value="time" className="space-y-4">
            <TimeAnalysis 
              data={timeData} 
              isLoading={isLoading} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TaskReporting;
