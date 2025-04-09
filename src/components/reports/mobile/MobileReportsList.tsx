
import React from 'react';
import { Loader2, FileBarChart, FileText, Download, MoreVertical } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface MobileReportsListProps {
  reports: any[];
  isLoading: boolean;
}

const MobileReportsList: React.FC<MobileReportsListProps> = ({
  reports,
  isLoading
}) => {
  // Mock data for the example
  const mockReports = [
    {
      id: 1,
      title: "Housekeeping Efficiency",
      type: "Performance",
      date: "2025-04-08",
      status: "Completed"
    },
    {
      id: 2,
      title: "Inventory Status",
      type: "Stock Levels",
      date: "2025-04-07",
      status: "Completed"
    },
    {
      id: 3,
      title: "Maintenance Response Times",
      type: "Performance",
      date: "2025-04-05",
      status: "Completed"
    }
  ];

  const reportsToRender = reports.length > 0 ? reports : mockReports;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">Loading reports...</p>
      </div>
    );
  }

  if (reportsToRender.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <FileBarChart className="h-10 w-10 text-muted-foreground" />
        <p className="mt-2 text-center text-muted-foreground">No reports available</p>
        <Button className="mt-4" size="sm">Create Your First Report</Button>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {reportsToRender.map((report) => (
        <div key={report.id} className="py-3 px-4">
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-3">
              <div className="mt-1 p-2 bg-muted rounded-md">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-medium">{report.title}</h3>
                <div className="flex items-center mt-1">
                  <Badge variant="outline" className="text-xs mr-2">{report.type}</Badge>
                  <span className="text-xs text-muted-foreground">{report.date}</span>
                </div>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Download className="mr-2 h-4 w-4" />
                  <span>Download</span>
                </DropdownMenuItem>
                <DropdownMenuItem>View Details</DropdownMenuItem>
                <DropdownMenuItem>Share Report</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MobileReportsList;
