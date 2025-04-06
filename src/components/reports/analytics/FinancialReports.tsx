
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

export const FinancialReports: React.FC = () => {
  return (
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
  );
};
