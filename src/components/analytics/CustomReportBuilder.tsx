
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Save, Trash, ArrowDown } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export const CustomReportBuilder = () => {
  const [metrics, setMetrics] = useState<string[]>([]);
  const [dimensions, setDimensions] = useState<string[]>([]);
  
  const availableMetrics = [
    "Revenue", "Expenses", "Profit", "Bookings", 
    "Average Stay", "Occupancy Rate", "Task Completion Rate"
  ];
  
  const availableDimensions = [
    "Property", "Date", "Room Type", "Staff Member", "Task Type", "Guest Type"
  ];
  
  const addMetric = (metric: string) => {
    setMetrics([...metrics, metric]);
  };
  
  const addDimension = (dimension: string) => {
    setDimensions([...dimensions, dimension]);
  };
  
  const removeMetric = (index: number) => {
    setMetrics(metrics.filter((_, i) => i !== index));
  };
  
  const removeDimension = (index: number) => {
    setDimensions(dimensions.filter((_, i) => i !== index));
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Custom Report Builder</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-medium">Select Metrics</h3>
            <div className="flex flex-wrap gap-2">
              {availableMetrics.map((metric) => (
                <Button 
                  key={metric} 
                  variant="outline"
                  size="sm"
                  onClick={() => addMetric(metric)}
                >
                  <Plus className="mr-1 h-3 w-3" />
                  {metric}
                </Button>
              ))}
            </div>
            
            <div className="border rounded-md p-4 min-h-[100px]">
              <h4 className="text-sm font-medium mb-2">Selected Metrics:</h4>
              {metrics.length === 0 ? (
                <p className="text-sm text-muted-foreground">No metrics selected</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {metrics.map((metric, index) => (
                    <div key={index} className="flex items-center bg-secondary rounded-md px-2 py-1 text-sm">
                      {metric}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 ml-1"
                        onClick={() => removeMetric(index)}
                      >
                        <Trash className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium">Select Dimensions</h3>
            <div className="flex flex-wrap gap-2">
              {availableDimensions.map((dimension) => (
                <Button 
                  key={dimension} 
                  variant="outline"
                  size="sm"
                  onClick={() => addDimension(dimension)}
                >
                  <Plus className="mr-1 h-3 w-3" />
                  {dimension}
                </Button>
              ))}
            </div>
            
            <div className="border rounded-md p-4 min-h-[100px]">
              <h4 className="text-sm font-medium mb-2">Selected Dimensions:</h4>
              {dimensions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No dimensions selected</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {dimensions.map((dimension, index) => (
                    <div key={index} className="flex items-center bg-secondary rounded-md px-2 py-1 text-sm">
                      {dimension}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 ml-1"
                        onClick={() => removeDimension(index)}
                      >
                        <Trash className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <h3 className="font-medium">Filters</h3>
          <div className="flex flex-wrap gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Property</label>
              <select className="border rounded-md p-2 w-full sm:w-auto">
                <option value="all">All Properties</option>
                <option value="Villa Caldera">Villa Caldera</option>
                <option value="Villa Sunset">Villa Sunset</option>
                <option value="Villa Oceana">Villa Oceana</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <select className="border rounded-md p-2 w-full sm:w-auto">
                <option value="last7days">Last 7 days</option>
                <option value="last30days">Last 30 days</option>
                <option value="last90days">Last 90 days</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Sort By</label>
              <div className="flex items-center">
                <select className="border rounded-md p-2 w-full sm:w-auto">
                  <option value="revenue">Revenue</option>
                  <option value="date">Date</option>
                  <option value="property">Property</option>
                </select>
                <Button variant="ghost" size="icon">
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div className="flex justify-end gap-2">
          <Button variant="outline">Preview Report</Button>
          <Button>
            <Save className="mr-2 h-4 w-4" />
            Save Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomReportBuilder;
