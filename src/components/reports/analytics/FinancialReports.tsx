
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { toastService } from "@/services/toast/toast.service";

export const FinancialReports: React.FC = () => {
  const [selectedProperty, setSelectedProperty] = useState<string>("all");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const generateReport = (reportName: string) => {
    setIsGenerating(true);
    
    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false);
      toastService.success("Report Generated", {
        description: `${reportName} has been generated successfully.`
      });
    }, 1500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Reports</CardTitle>
        <CardDescription>Track revenue, expenses, and profitability</CardDescription>
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
              <option value="villa-caldera">Villa Caldera</option>
              <option value="villa-sunset">Villa Sunset</option>
              <option value="villa-oceana">Villa Oceana</option>
              <option value="villa-paradiso">Villa Paradiso</option>
              <option value="villa-azure">Villa Azure</option>
            </select>
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium">Available Reports</label>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => generateReport("Revenue by Property")}
                disabled={isGenerating}
              >
                <FileText className="mr-2 h-4 w-4" />
                Revenue by Property
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => generateReport("Expense Analysis")}
                disabled={isGenerating}
              >
                <FileText className="mr-2 h-4 w-4" />
                Expense Analysis
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => generateReport("Profit & Loss Statement")}
                disabled={isGenerating}
              >
                <FileText className="mr-2 h-4 w-4" />
                Profit & Loss Statement
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
