
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Save, Trash, ArrowDown, FileDown, Eye } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toastService } from "@/services/toast/toast.service";

export const CustomReportBuilder = () => {
  const [metrics, setMetrics] = useState<string[]>([]);
  const [dimensions, setDimensions] = useState<string[]>([]);
  const [reportName, setReportName] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  
  const availableMetrics = [
    "Revenue", "Expenses", "Profit", "Bookings", 
    "Average Stay", "Occupancy Rate", "Task Completion Rate"
  ];
  
  const availableDimensions = [
    "Property", "Date", "Room Type", "Staff Member", "Task Type", "Guest Type"
  ];
  
  const addMetric = (metric: string) => {
    if (!metrics.includes(metric)) {
      setMetrics([...metrics, metric]);
    } else {
      toastService.warning("Metric already added");
    }
  };
  
  const addDimension = (dimension: string) => {
    if (!dimensions.includes(dimension)) {
      setDimensions([...dimensions, dimension]);
    } else {
      toastService.warning("Dimension already added");
    }
  };
  
  const removeMetric = (index: number) => {
    setMetrics(metrics.filter((_, i) => i !== index));
  };
  
  const removeDimension = (index: number) => {
    setDimensions(dimensions.filter((_, i) => i !== index));
  };

  const handlePreviewReport = () => {
    if (metrics.length === 0) {
      toastService.error("Please select at least one metric");
      return;
    }
    
    if (dimensions.length === 0) {
      toastService.error("Please select at least one dimension");
      return;
    }
    
    setIsPreviewOpen(true);
  };

  const handleExportReport = () => {
    if (metrics.length === 0 || dimensions.length === 0) {
      toastService.error("Please select metrics and dimensions");
      return;
    }
    
    // Generate CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add headers - first the dimensions, then the metrics
    const headers = [...dimensions, ...metrics];
    csvContent += headers.join(",") + "\n";
    
    // Add sample data - in a real app this would be real data
    if (dimensions.includes("Property")) {
      csvContent += "Villa Caldera,";
      
      // Add values for each metric
      const values = metrics.map(() => Math.floor(Math.random() * 100));
      csvContent += values.join(",") + "\n";
      
      csvContent += "Villa Sunset,";
      const values2 = metrics.map(() => Math.floor(Math.random() * 100));
      csvContent += values2.join(",") + "\n";
    }
    
    // Download the CSV file
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "custom-report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toastService.success("Report exported successfully");
  };

  const handleSaveReport = () => {
    if (!reportName.trim()) {
      toastService.error("Please enter a report name");
      return;
    }
    
    if (metrics.length === 0 || dimensions.length === 0) {
      toastService.error("Please select metrics and dimensions");
      return;
    }
    
    // In a real app, this would save to a database
    toastService.success("Report configuration saved", {
      description: `"${reportName}" has been saved and can be accessed later.`
    });
    
    setIsSaveDialogOpen(false);
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
          <Button variant="outline" onClick={handlePreviewReport}>
            <Eye className="mr-2 h-4 w-4" />
            Preview Report
          </Button>
          <Button variant="outline" onClick={handleExportReport}>
            <FileDown className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button onClick={() => setIsSaveDialogOpen(true)}>
            <Save className="mr-2 h-4 w-4" />
            Save Report
          </Button>
        </div>
      </CardContent>
      
      {/* Preview Report Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Report Preview</DialogTitle>
          </DialogHeader>
          <div className="pt-4 overflow-auto">
            <table className="w-full border-collapse border">
              <thead>
                <tr>
                  {dimensions.map((dim, idx) => (
                    <th key={idx} className="border p-2 bg-muted">{dim}</th>
                  ))}
                  {metrics.map((metric, idx) => (
                    <th key={idx} className="border p-2 bg-muted">{metric}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Sample data rows - in a real app this would be real data */}
                <tr>
                  {dimensions.includes("Property") && (
                    <td className="border p-2">Villa Caldera</td>
                  )}
                  {dimensions.includes("Date") && (
                    <td className="border p-2">Last 7 days</td>
                  )}
                  {dimensions.includes("Room Type") && (
                    <td className="border p-2">Deluxe</td>
                  )}
                  {dimensions.includes("Staff Member") && (
                    <td className="border p-2">Maria K.</td>
                  )}
                  {dimensions.includes("Task Type") && (
                    <td className="border p-2">Cleaning</td>
                  )}
                  {dimensions.includes("Guest Type") && (
                    <td className="border p-2">Family</td>
                  )}
                  
                  {/* Generate random values for metrics */}
                  {metrics.map((metric, idx) => (
                    <td key={idx} className="border p-2 text-right">
                      {metric.includes("Rate") 
                        ? `${Math.floor(60 + Math.random() * 30)}%`
                        : metric.includes("Average")
                        ? `${Math.floor(2 + Math.random() * 5)} days`
                        : `$${Math.floor(1000 + Math.random() * 9000)}`}
                    </td>
                  ))}
                </tr>
                
                {/* Another sample row */}
                <tr>
                  {dimensions.includes("Property") && (
                    <td className="border p-2">Villa Sunset</td>
                  )}
                  {dimensions.includes("Date") && (
                    <td className="border p-2">Last 7 days</td>
                  )}
                  {dimensions.includes("Room Type") && (
                    <td className="border p-2">Standard</td>
                  )}
                  {dimensions.includes("Staff Member") && (
                    <td className="border p-2">Thomas L.</td>
                  )}
                  {dimensions.includes("Task Type") && (
                    <td className="border p-2">Maintenance</td>
                  )}
                  {dimensions.includes("Guest Type") && (
                    <td className="border p-2">Business</td>
                  )}
                  
                  {/* Generate random values for metrics */}
                  {metrics.map((metric, idx) => (
                    <td key={idx} className="border p-2 text-right">
                      {metric.includes("Rate") 
                        ? `${Math.floor(60 + Math.random() * 30)}%`
                        : metric.includes("Average")
                        ? `${Math.floor(2 + Math.random() * 5)} days`
                        : `$${Math.floor(1000 + Math.random() * 9000)}`}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>Close</Button>
            <Button onClick={handleExportReport}>
              <FileDown className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Save Report Dialog */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Report Configuration</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Report Name</label>
              <input
                className="w-full border rounded-md p-2" 
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                placeholder="Enter a name for this report"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description (optional)</label>
              <textarea
                className="w-full border rounded-md p-2" 
                placeholder="Enter a description for this report"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Schedule (optional)</label>
              <select className="w-full border rounded-md p-2">
                <option value="">Do not schedule</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveReport}>Save Report</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default CustomReportBuilder;
