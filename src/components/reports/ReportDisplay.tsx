import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileDown, Printer, Calendar, Filter } from 'lucide-react';
import { GeneratedReport } from '@/types/reports.types';
import { exportReportToCSV, exportReportToPDF } from '@/utils/reportExportUtils';
import { toast } from '@/hooks/use-toast';

interface ReportDisplayProps {
  report: GeneratedReport;
  onClear: () => void;
}

export const ReportDisplay: React.FC<ReportDisplayProps> = ({ report, onClear }) => {
  const handleCSVExport = () => {
    try {
      exportReportToCSV(report);
      toast({
        title: "CSV Export",
        description: "Report exported to CSV successfully."
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export CSV. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handlePDFExport = () => {
    try {
      exportReportToPDF(report);
      toast({
        title: "PDF Export",
        description: "Report exported to PDF successfully."
      });
    } catch (error) {
      toast({
        title: "Export Failed", 
        description: "Failed to export PDF. Please try again.",
        variant: "destructive"
      });
    }
  };

  const formatCellValue = (value: any, type?: string) => {
    if (value === null || value === undefined || value === '') {
      return '-';
    }

    switch (type) {
      case 'currency':
        return typeof value === 'number' ? `€${value.toFixed(2)}` : value;
      case 'date':
        return value ? new Date(value).toLocaleDateString() : '-';
      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : value;
      default:
        return String(value);
    }
  };

  const hasFilters = report.filters && Object.values(report.filters).some(v => v);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">{report.title}</CardTitle>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Generated: {report.generatedAt.toLocaleString()}
              </div>
              {report.dateRange && (
                <div className="flex items-center gap-1">
                  <Badge variant="outline">
                    {report.dateRange.startDate} to {report.dateRange.endDate}
                  </Badge>
                </div>
              )}
              {hasFilters && (
                <div className="flex items-center gap-1">
                  <Filter className="h-4 w-4" />
                  <Badge variant="secondary">Filtered</Badge>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCSVExport}>
              <FileDown className="mr-2 h-4 w-4" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handlePDFExport}>
              <Printer className="mr-2 h-4 w-4" />
              PDF
            </Button>
            <Button variant="secondary" size="sm" onClick={onClear}>
              Clear
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="mb-6 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Records:</span>
            <Badge variant="outline">{report.data.length}</Badge>
          </div>
          {hasFilters && (
            <div className="mt-2 space-y-1">
              <span className="text-sm text-muted-foreground">Active Filters:</span>
              <div className="flex flex-wrap gap-1">
                {Object.entries(report.filters || {})
                  .filter(([_, value]) => value)
                  .map(([key, value]) => (
                    <Badge key={key} variant="secondary" className="text-xs">
                      {key}: {value}
                    </Badge>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Data Table */}
        <div className="border rounded-lg overflow-hidden">
          <div className="max-h-96 overflow-auto">
            <table className="w-full">
              <thead className="bg-muted/50 sticky top-0">
                <tr>
                  {report.columns.map((column) => (
                    <th
                      key={column.key}
                      className="px-4 py-3 text-left text-sm font-medium border-b"
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {report.data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={report.columns.length}
                      className="px-4 py-8 text-center text-muted-foreground"
                    >
                      No data found for the selected criteria
                    </td>
                  </tr>
                ) : (
                  report.data.map((row, index) => (
                    <tr
                      key={index}
                      className="hover:bg-muted/25 border-b border-border/50"
                    >
                      {report.columns.map((column) => (
                        <td key={column.key} className="px-4 py-3 text-sm">
                          {formatCellValue(row[column.key], column.type)}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Info */}
        {report.data.length > 0 && (
          <div className="mt-4 text-xs text-muted-foreground text-center">
            Showing {report.data.length} record{report.data.length !== 1 ? 's' : ''} • 
            Generated from Arivia Core Property Management System
          </div>
        )}
      </CardContent>
    </Card>
  );
};