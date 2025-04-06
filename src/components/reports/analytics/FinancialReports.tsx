
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Loader2 } from "lucide-react";
import { toastService } from "@/services/toast/toast.service";
import { ReportPreview } from "@/components/reports/ReportPreview";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  revenueByPropertyData, 
  expenseAnalysisData, 
  profitLossData,
  formatFinancialReportData 
} from "./financialData";

export const FinancialReports: React.FC = () => {
  const [selectedProperty, setSelectedProperty] = useState<string>("all");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [activeReport, setActiveReport] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [reportTitle, setReportTitle] = useState<string>("");
  
  const handleReportClick = (reportName: string) => {
    setIsGenerating(true);
    setActiveReport(reportName);
    
    // Simulate report generation
    setTimeout(() => {
      let data: any[] = [];
      let title = reportName;
      
      // Get the appropriate data based on the selected report
      switch (reportName) {
        case "Revenue by Property":
          data = formatFinancialReportData(revenueByPropertyData, selectedProperty);
          break;
        case "Expense Analysis":
          data = formatFinancialReportData(expenseAnalysisData, selectedProperty);
          break;
        case "Profit & Loss Statement":
          data = formatFinancialReportData(profitLossData, selectedProperty);
          break;
        default:
          data = [];
      }
      
      setReportData(data);
      setReportTitle(title);
      setShowPreview(true);
      setIsGenerating(false);
      toastService.success(`${reportName} Generated`, {
        description: `The report has been generated for ${selectedProperty === "all" ? "all properties" : selectedProperty}.`
      });
      setActiveReport(null);
    }, 1500);
  };
  
  // Close the report preview
  const handleClosePreview = () => {
    setShowPreview(false);
    setReportData([]);
  };

  // Handle property selection change
  const handlePropertyChange = (value: string) => {
    setSelectedProperty(value);
    
    // If there's an active report, regenerate it with the new property filter
    if (showPreview && reportTitle) {
      handleReportClick(reportTitle);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Financial Reports</CardTitle>
          <CardDescription>Track revenue, expenses, and profitability</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-64 space-y-2">
              <label className="text-sm font-medium">Select Property</label>
              <Select 
                value={selectedProperty} 
                onValueChange={handlePropertyChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Properties</SelectItem>
                  <SelectItem value="Villa Caldera">Villa Caldera</SelectItem>
                  <SelectItem value="Villa Sunset">Villa Sunset</SelectItem>
                  <SelectItem value="Villa Oceana">Villa Oceana</SelectItem>
                  <SelectItem value="Villa Paradiso">Villa Paradiso</SelectItem>
                  <SelectItem value="Villa Azure">Villa Azure</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">Available Reports</label>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => handleReportClick("Revenue by Property")}
                  disabled={isGenerating}
                >
                  {activeReport === "Revenue by Property" ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FileText className="mr-2 h-4 w-4" />
                  )}
                  Revenue by Property
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => handleReportClick("Expense Analysis")}
                  disabled={isGenerating}
                >
                  {activeReport === "Expense Analysis" ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FileText className="mr-2 h-4 w-4" />
                  )}
                  Expense Analysis
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => handleReportClick("Profit & Loss Statement")}
                  disabled={isGenerating}
                >
                  {activeReport === "Profit & Loss Statement" ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FileText className="mr-2 h-4 w-4" />
                  )}
                  Profit & Loss Statement
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {showPreview && (
        <ReportPreview
          title={reportTitle}
          description={`${reportTitle} for ${selectedProperty === "all" ? "All Properties" : selectedProperty}`}
          data={reportData}
          onExport={() => toastService.success("Report exported successfully")}
          onPrint={() => toastService.success("Report sent to printer")}
        />
      )}
    </div>
  );
};
