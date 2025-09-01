import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileWarning, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// Mock data for recent damage reports
const recentDamageReports = [
  {
    id: '1',
    title: 'Broken shower door',
    property: 'Ocean View Villa',
    reportedBy: 'Guest #456',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    severity: 'medium',
    status: 'pending'
  },
  {
    id: '2',
    title: 'Stained carpet in bedroom',
    property: 'Beach House',
    reportedBy: 'Maria Garcia',
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    severity: 'low',
    status: 'in_review'
  },
  {
    id: '3',
    title: 'Pool heater malfunction',
    property: 'Garden Villa',
    reportedBy: 'John Smith',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    severity: 'high',
    status: 'assigned'
  }
];

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'high': return 'border-red-500 text-red-700';
    case 'medium': return 'border-yellow-500 text-yellow-700';
    case 'low': return 'border-green-500 text-green-700';
    default: return 'border-gray-500 text-gray-700';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-yellow-500';
    case 'in_review': return 'bg-blue-500';
    case 'assigned': return 'bg-orange-500';
    case 'resolved': return 'bg-green-500';
    default: return 'bg-gray-500';
  }
};

export const RecentDamageReportsWidget: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileWarning className="h-5 w-5 text-red-500" />
          Recent Damage Reports
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentDamageReports.map((report) => (
            <div
              key={report.id}
              className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <AlertTriangle className="h-4 w-4 mt-1 text-muted-foreground" />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm truncate">{report.title}</h4>
                  <Badge variant="outline" className={getSeverityColor(report.severity)}>
                    {report.severity}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {report.property} • Reported by {report.reportedBy}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(report.timestamp), { addSuffix: true })}
                </p>
              </div>
              
              <div className={`w-2 h-2 rounded-full ${getStatusColor(report.status)}`} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};