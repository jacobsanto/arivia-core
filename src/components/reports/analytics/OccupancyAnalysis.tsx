
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Clock, BarChart, Loader2 } from "lucide-react";
import { toastService } from "@/services/toast/toast.service";

export const OccupancyAnalysis: React.FC = () => {
  const [selectedProperty, setSelectedProperty] = useState<string>("all");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [activeReport, setActiveReport] = useState<string | null>(null);

  const handleReportClick = (reportName: string) => {
    setIsGenerating(true);
    setActiveReport(reportName);
    
    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false);
      toastService.success(`${reportName} Generated`, {
        description: `The report has been generated for ${selectedProperty === "all" ? "all properties" : selectedProperty}.`
      });
      setActiveReport(null);
    }, 1800);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Occupancy Analysis</CardTitle>
        <CardDescription>Analyze booking patterns and trends</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-64 space-y-2">
            <label className="text-sm font-medium">Select Property</label>
            <select 
              className="w-full border rounded-md p-2"
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
            >
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
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleReportClick("Monthly Occupancy Rates")}
                disabled={isGenerating}
              >
                {activeReport === "Monthly Occupancy Rates" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CalendarIcon className="mr-2 h-4 w-4" />
                )}
                Monthly Occupancy Rates
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleReportClick("Average Length of Stay")}
                disabled={isGenerating}
              >
                {activeReport === "Average Length of Stay" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Clock className="mr-2 h-4 w-4" />
                )}
                Average Length of Stay
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleReportClick("Seasonal Booking Trends")}
                disabled={isGenerating}
              >
                {activeReport === "Seasonal Booking Trends" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <BarChart className="mr-2 h-4 w-4" />
                )}
                Seasonal Booking Trends
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
