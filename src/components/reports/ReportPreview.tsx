
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, Printer } from "lucide-react";
import { exportToCSV, preparePrint } from "@/utils/reportExportUtils";

interface ReportPreviewProps {
  title: string;
  description?: string;
  data: any[];
  isLoading?: boolean;
  error?: Error | null;
  onExport?: () => void;
  onPrint?: () => void;
}

export const ReportPreview: React.FC<ReportPreviewProps> = ({
  title,
  description,
  data,
  isLoading = false,
  error = null,
  onExport,
  onPrint,
}) => {
  const handleExport = () => {
    if (onExport) {
      onExport();
    } else if (data && data.length) {
      exportToCSV(data, title.replace(/\s+/g, '_').toLowerCase());
    }
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else if (data && data.length) {
      preparePrint(data, title);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">
            <p>Error loading report data</p>
            <p className="text-sm mt-2">{error.message}</p>
          </div>
        ) : data.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No data available for this report
          </div>
        ) : (
          <div className="overflow-auto max-h-[500px]">
            <table className="w-full">
              <thead className="bg-muted sticky top-0">
                <tr>
                  {Object.keys(data[0]).map((header) => (
                    <th key={header} className="text-left p-3 font-medium">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b hover:bg-muted/50">
                    {Object.values(row).map((value, colIndex) => (
                      <td key={colIndex} className="p-3">
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2 border-t bg-muted/50 p-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={isLoading || !data.length}
        >
          <FileDown className="mr-2 h-4 w-4" /> Export
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrint}
          disabled={isLoading || !data.length}
        >
          <Printer className="mr-2 h-4 w-4" /> Print
        </Button>
      </CardFooter>
    </Card>
  );
};
