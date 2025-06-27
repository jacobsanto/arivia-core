
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin, User, DollarSign, FileText, Clock } from "lucide-react";
import { DamageReport } from "@/types/damage";
import { useUser } from "@/contexts/UserContext";
import { format } from "date-fns";

interface DamageReportDetailProps {
  report: DamageReport;
  onClose: () => void;
  onStatusChange?: (reportId: string, status: DamageReport['status']) => void;
}

const getStatusColor = (status: DamageReport['status']) => {
  switch (status) {
    case 'pending': return 'bg-yellow-500';
    case 'investigating': return 'bg-blue-500';
    case 'resolved': return 'bg-green-500';
    case 'disputed': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

const DamageReportDetail: React.FC<DamageReportDetailProps> = ({
  report,
  onClose,
  onStatusChange
}) => {
  const { user } = useUser();
  
  // Check if user can manage damage reports
  const canManage = user?.role === "tenant_admin" || user?.role === "property_manager";

  const handleStatusChange = (newStatus: DamageReport['status']) => {
    if (onStatusChange) {
      onStatusChange(report.id, newStatus);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">{report.title}</h2>
          <Badge className={`${getStatusColor(report.status)} text-white mt-2`}>
            {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
          </Badge>
        </div>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Report Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Damage Date: {format(new Date(report.damageDate), 'PPP')}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Property: {report.propertyId}</span>
            </div>

            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Reported by: {report.reportedBy}</span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Created: {format(new Date(report.createdAt), 'PPp')}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Financial Impact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {report.estimatedCost && (
              <div>
                <span className="text-sm font-medium">Estimated Cost:</span>
                <p className="text-lg font-bold text-orange-600">
                  ${report.estimatedCost.toFixed(2)}
                </p>
              </div>
            )}

            {report.finalCost && (
              <div>
                <span className="text-sm font-medium">Final Cost:</span>
                <p className="text-lg font-bold text-red-600">
                  ${report.finalCost.toFixed(2)}
                </p>
              </div>
            )}

            {report.compensationAmount && (
              <div>
                <span className="text-sm font-medium">Compensation:</span>
                <p className="text-lg font-bold text-green-600">
                  ${report.compensationAmount.toFixed(2)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">{report.description}</p>
        </CardContent>
      </Card>

      {report.conclusion && (
        <Card>
          <CardHeader>
            <CardTitle>Conclusion</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{report.conclusion}</p>
          </CardContent>
        </Card>
      )}

      {canManage && report.status !== 'resolved' && (
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {report.status === 'pending' && (
                <Button 
                  onClick={() => handleStatusChange('investigating')}
                  variant="outline"
                >
                  Start Investigation
                </Button>
              )}
              
              {report.status === 'investigating' && (
                <Button 
                  onClick={() => handleStatusChange('resolved')}
                  variant="default"
                >
                  Mark Resolved
                </Button>
              )}
              
              <Button 
                onClick={() => handleStatusChange('disputed')}
                variant="destructive"
              >
                Mark as Disputed
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DamageReportDetail;
