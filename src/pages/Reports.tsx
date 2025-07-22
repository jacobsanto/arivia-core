import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScheduledReports } from "@/components/reporting/ScheduledReports";
import { ExportCenter } from "@/components/reporting/ExportCenter";
import { ReportBuilder } from "@/components/reporting/ReportBuilder";
import { ReportsErrorBoundary } from "@/components/error-boundaries/ReportsErrorBoundary";

const Reports: React.FC = () => {
  return (
    <ReportsErrorBoundary>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Operational Reports</h1>
          <p className="text-muted-foreground mt-2">
            Create, schedule, and export operational reports for your property management operations
          </p>
        </div>

        <Tabs defaultValue="builder" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="builder">Report Builder</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
            <TabsTrigger value="exports">Export Center</TabsTrigger>
          </TabsList>

          <TabsContent value="builder">
            <Card>
              <CardHeader>
                <CardTitle>Build Custom Operational Reports</CardTitle>
                <CardDescription>
                  Create custom reports focusing on housekeeping, maintenance, property performance, and inventory management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ReportBuilder />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scheduled">
            <Card>
              <CardHeader>
                <CardTitle>Scheduled Operational Reports</CardTitle>
                <CardDescription>
                  Manage and monitor your automated operational reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScheduledReports />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exports">
            <Card>
              <CardHeader>
                <CardTitle>Export Operations Data</CardTitle>
                <CardDescription>
                  Export operational data in various formats for analysis and record keeping
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ExportCenter />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ReportsErrorBoundary>
  );
};

export default Reports;