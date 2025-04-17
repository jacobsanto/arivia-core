
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAnalytics } from '@/contexts/AnalyticsContext';
import { useReports } from '@/hooks/useReports';
import { Button } from '@/components/ui/button';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatAnalyticsDataForReport } from '@/services/reports/analyticsToReportConverter';
import { ReportPreview } from '@/components/reports/ReportPreview';
import { toastService } from '@/services/toast/toast.service';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

export const FromAnalyticsTab: React.FC = () => {
  const [selectedChart, setSelectedChart] = useState('financial');
  const [reportData, setReportData] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const { selectedProperty, dateRange } = useAnalytics();
  const { createReport } = useReports('custom');
  
  // Get the user ID for report creation
  useEffect(() => {
    const getUserId = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUserId(data.user.id);
      }
    };
    
    getUserId();
  }, []);
  
  // Empty data to indicate no sample data
  const financialData: any[] = [];
  const occupancyData: any[] = [];

  useEffect(() => {
    // Format data based on selected chart (empty for now)
    if (selectedChart === 'financial') {
      setReportData(formatAnalyticsDataForReport(financialData, 'financial'));
    } else if (selectedChart === 'occupancy') {
      setReportData(formatAnalyticsDataForReport(occupancyData, 'occupancy'));
    }
  }, [selectedChart]);
  
  const handleCreateReport = async () => {
    if (!userId) {
      toastService.error("Authentication required", {
        description: "Please login to create reports"
      });
      return;
    }
    
    try {
      const reportName = `${selectedChart === 'financial' ? 'Financial Performance' : 'Occupancy Trends'} Report`;
      
      await createReport({
        name: reportName,
        type: 'custom',
        filters: {
          chartType: selectedChart,
          property: selectedProperty
        },
        date_range: {
          start_date: dateRange.from?.toISOString() || null,
          end_date: dateRange.to?.toISOString() || null
        }
      });
      
      toastService.success("Report created", {
        description: `${reportName} has been created successfully`
      });
    } catch (error: any) {
      toastService.error("Failed to create report", {
        description: error.message || "An unknown error occurred"
      });
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Report from Analytics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="preview" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="preview">Chart Preview</TabsTrigger>
            <TabsTrigger value="data">Data Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="preview" className="space-y-6">
            <div className="border rounded-md p-4 bg-muted/50">
              <div className="mb-4">
                <div className="text-sm font-medium">Select chart type:</div>
                <div className="flex gap-2 mt-2">
                  <Button 
                    variant={selectedChart === 'financial' ? 'default' : 'outline'}
                    onClick={() => setSelectedChart('financial')}
                    size="sm"
                  >
                    Financial
                  </Button>
                  <Button 
                    variant={selectedChart === 'occupancy' ? 'default' : 'outline'}
                    onClick={() => setSelectedChart('occupancy')}
                    size="sm"
                  >
                    Occupancy
                  </Button>
                </div>
              </div>
              
              <div className="bg-background rounded-md">
                <Alert className="bg-muted/50 mb-4">
                  <InfoIcon className="h-4 w-4" />
                  <AlertTitle>No analytics data available</AlertTitle>
                  <AlertDescription>
                    Analytics data will appear here once it's recorded.
                  </AlertDescription>
                </Alert>
                
                <AnalyticsDashboard 
                  showAllCharts={false} 
                  showMonitoring={false}
                  propertyFilter={selectedProperty} 
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="data">
            {reportData.length > 0 ? (
              <ReportPreview
                title={`${selectedChart === 'financial' ? 'Financial Performance' : 'Occupancy Trends'}`}
                description={`Data for ${selectedProperty === 'all' ? 'all properties' : selectedProperty}`}
                data={reportData}
              />
            ) : (
              <Alert className="bg-muted/50">
                <InfoIcon className="h-4 w-4" />
                <AlertTitle>No report data available</AlertTitle>
                <AlertDescription>
                  Report data will appear here once analytics data is recorded.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end">
          <Button onClick={handleCreateReport}>
            Create Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
