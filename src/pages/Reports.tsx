import React from "react";
import { ReportsErrorBoundary } from "@/components/error-boundaries/ReportsErrorBoundary";
import { ReportGenerator } from "@/components/reports/ReportGenerator";
import { ReportDisplay } from "@/components/reports/ReportDisplay";
import { useReportsGenerator } from "@/hooks/useReportsGenerator";

const Reports: React.FC = () => {
  const { generatedReport, clearReport } = useReportsGenerator();

  return (
    <ReportsErrorBoundary>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Business Intelligence Hub</h1>
          <p className="text-muted-foreground mt-2">
            Transform operational data into structured reports for financial analysis, performance reviews, and record-keeping
          </p>
        </div>

        {/* Report Generator */}
        <ReportGenerator />

        {/* Report Display */}
        {generatedReport && (
          <ReportDisplay 
            report={generatedReport} 
            onClear={clearReport} 
          />
        )}
      </div>
    </ReportsErrorBoundary>
  );
};

export default Reports;