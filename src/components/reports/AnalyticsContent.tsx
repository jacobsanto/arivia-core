
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, CalendarIcon, Clock, BarChart } from "lucide-react";
import TaskReporting from "@/components/tasks/TaskReporting";

export const AnalyticsContent: React.FC = () => {
  return (
    <Tabs defaultValue="dashboards" className="space-y-4">
      <TabsList className="grid w-full grid-cols-4 mb-4">
        <TabsTrigger value="dashboards">Dashboards</TabsTrigger>
        <TabsTrigger value="financial">Financial</TabsTrigger>
        <TabsTrigger value="operational">Operational</TabsTrigger>
        <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
      </TabsList>
      
      <TabsContent value="dashboards" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Overview Dashboard</CardTitle>
            <CardDescription>A quick overview of key performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$24,780</div>
                  <p className="text-xs text-muted-foreground">+18% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">86%</div>
                  <p className="text-xs text-muted-foreground">+4% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Task Completion</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">92%</div>
                  <p className="text-xs text-muted-foreground">+2% from last month</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="financial" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Financial Reports</CardTitle>
            <CardDescription>Track revenue, expenses, and profitability</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">Available Reports</label>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Revenue by Property
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Expense Analysis
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Profit & Loss Statement
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="operational" className="space-y-4">
        <TaskReporting />
      </TabsContent>
      
      <TabsContent value="occupancy" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Occupancy Analysis</CardTitle>
            <CardDescription>Analyze booking patterns and trends</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-64 space-y-2">
                <label className="text-sm font-medium">Select Property</label>
                <select className="w-full border rounded-md p-2">
                  <option value="all">All Properties</option>
                  <option value="Villa Caldera">Villa Caldera</option>
                  <option value="Villa Sunset">Villa Sunset</option>
                  <option value="Villa Oceana">Villa Oceana</option>
                  <option value="Villa Paradiso">Villa Paradiso</option>
                  <option value="Villa Azure">Villa Azure</option>
                </select>
              </div>
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">Available Reports</label>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    Monthly Occupancy Rates
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Clock className="mr-2 h-4 w-4" />
                    Average Length of Stay
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart className="mr-2 h-4 w-4" />
                    Seasonal Booking Trends
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
