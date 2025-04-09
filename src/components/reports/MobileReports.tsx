
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { FileText, BarChart, Plus, PieChart, Calendar, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import MobileReportsList from './mobile/MobileReportsList';
import MobileAnalyticsDashboard from './mobile/MobileAnalyticsDashboard';

interface MobileReportsProps {
  dateRange: {from: Date | undefined, to: Date | undefined};
  setDateRange: (range: {from: Date | undefined, to: Date | undefined}) => void;
  reports: any[];
  isLoading: boolean;
}

const MobileReports: React.FC<MobileReportsProps> = ({
  dateRange,
  setDateRange,
  reports,
  isLoading
}) => {
  const [activeView, setActiveView] = useState<'reporting' | 'analytics'>('reporting');

  const handleCreateReport = () => {
    // Handle report creation
    console.log("Creating new report");
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-bold tracking-tight flex items-center">
          {activeView === 'reporting' ? (
            <>
              <FileText className="mr-2 h-5 w-5" /> Reports
            </>
          ) : (
            <>
              <BarChart className="mr-2 h-5 w-5" /> Analytics
            </>
          )}
        </h1>
        <div className="flex gap-2">
          <Button 
            variant={activeView === 'reporting' ? "default" : "outline"} 
            size="sm"
            onClick={() => setActiveView('reporting')}
            className="flex-1"
          >
            <FileText className="mr-2 h-4 w-4" />
            Reports
          </Button>
          <Button 
            variant={activeView === 'analytics' ? "default" : "outline"} 
            size="sm"
            onClick={() => setActiveView('analytics')}
            className="flex-1"
          >
            <BarChart className="mr-2 h-4 w-4" />
            Analytics
          </Button>
        </div>
      </div>
      
      <div className="pb-2">
        <DatePickerWithRange value={dateRange} onChange={setDateRange} />
      </div>
      
      <Tabs value={activeView} className="space-y-4">
        <TabsContent value="reporting" className="mt-0">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Task Reports</CardTitle>
                <Button size="sm" variant="outline" onClick={handleCreateReport}>
                  <Plus className="h-4 w-4 mr-1" />
                  New
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <MobileReportsList reports={reports} isLoading={isLoading} />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                Scheduled Reports
                <Badge variant="outline" className="ml-2">2</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                <div className="py-3 px-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Weekly Performance</h3>
                    <div className="text-xs text-muted-foreground flex items-center">
                      <Calendar className="h-3 w-3 mr-1" /> Every Monday
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="py-3 px-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Monthly Summary</h3>
                    <div className="text-xs text-muted-foreground flex items-center">
                      <Calendar className="h-3 w-3 mr-1" /> 1st of month
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="mt-0">
          <MobileAnalyticsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MobileReports;
