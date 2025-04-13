
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnalyticsProvider } from '@/contexts/AnalyticsContext';
import { FilePlus } from "lucide-react";
import { useAnalytics } from '@/contexts/AnalyticsContext';

// Wrap the actual component with a provider
export const FromAnalyticsTab = () => {
  return (
    <AnalyticsProvider>
      <FromAnalyticsTabContent />
    </AnalyticsProvider>
  );
};

const FromAnalyticsTabContent = () => {
  const { selectedProperty } = useAnalytics();
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Report from Analytics</CardTitle>
          <CardDescription>
            Transform analytics data into shareable, scheduled reports
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="p-4 border-dashed border-2 hover:border-primary/50 cursor-pointer transition-colors">
              <div className="flex flex-col items-center justify-center h-full py-6 text-center space-y-3">
                <FilePlus className="h-10 w-10 text-muted-foreground" />
                <h3 className="font-medium">Financial Report</h3>
                <p className="text-sm text-muted-foreground">Create reports from financial analytics</p>
                <Button size="sm" className="mt-2">Create Report</Button>
              </div>
            </Card>
            <Card className="p-4 border-dashed border-2 hover:border-primary/50 cursor-pointer transition-colors">
              <div className="flex flex-col items-center justify-center h-full py-6 text-center space-y-3">
                <FilePlus className="h-10 w-10 text-muted-foreground" />
                <h3 className="font-medium">Occupancy Report</h3>
                <p className="text-sm text-muted-foreground">Generate reports on property occupancy</p>
                <Button size="sm" className="mt-2">Create Report</Button>
              </div>
            </Card>
            <Card className="p-4 border-dashed border-2 hover:border-primary/50 cursor-pointer transition-colors">
              <div className="flex flex-col items-center justify-center h-full py-6 text-center space-y-3">
                <FilePlus className="h-10 w-10 text-muted-foreground" />
                <h3 className="font-medium">Performance Report</h3>
                <p className="text-sm text-muted-foreground">Staff and task performance metrics</p>
                <Button size="sm" className="mt-2">Create Report</Button>
              </div>
            </Card>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Select a report type to create a new report from analytics data.
            {selectedProperty !== 'all' && ` Current filter: ${selectedProperty}`}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
