
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DamageReport } from "@/services/damage/damage.service";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

interface DamageReportListProps {
  reports: DamageReport[];
  onOpenReport: (report: DamageReport) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-500 hover:bg-yellow-600";
    case "investigating":
      return "bg-blue-500 hover:bg-blue-600";
    case "resolved":
      return "bg-green-500 hover:bg-green-600";
    case "compensation_required":
      return "bg-orange-500 hover:bg-orange-600";
    case "compensation_paid":
      return "bg-purple-500 hover:bg-purple-600";
    case "closed":
      return "bg-gray-500 hover:bg-gray-600";
    default:
      return "bg-gray-500 hover:bg-gray-600";
  }
};

const DamageReportList: React.FC<DamageReportListProps> = ({ reports, onOpenReport }) => {
  const { user } = useAuth();

  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <p className="text-muted-foreground text-lg">No damage reports found</p>
        <p className="text-sm text-muted-foreground">Create a new report to get started</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {reports.map((report) => (
        <Card
          key={report.id}
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onOpenReport(report)}
        >
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium truncate flex-1">{report.title}</h3>
              <Badge className={`ml-2 ${getStatusColor(report.status)}`}>
                {report.status.replace('_', ' ')}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {report.description}
            </p>

            <div className="flex justify-between text-xs text-muted-foreground mt-4">
              <span>Reported: {format(new Date(report.created_at), 'MMM d, yyyy')}</span>
              {report.assigned_to === user?.id && (
                <Badge variant="outline" className="text-xs">Assigned to you</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DamageReportList;
