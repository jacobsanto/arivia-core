import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DamageReport } from '@/types/damage-reports.types';
import { format } from 'date-fns';
import { AlertTriangle, Camera, DollarSign, MapPin, User } from 'lucide-react';

interface ReportCardProps {
  report: DamageReport;
  onClick: (report: DamageReport) => void;
}

export const ReportCard: React.FC<ReportCardProps> = ({ report, onClick }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-l-4 border-l-destructive';
      case 'high': return 'border-l-4 border-l-orange-500';
      case 'normal': return 'border-l-4 border-l-primary';
      case 'low': return 'border-l-4 border-l-muted-foreground';
      default: return 'border-l-4 border-l-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reported': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_review': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'guest': return '👤';
      case 'staff': return '👷';
      case 'wear_tear': return '⚙️';
      case 'accident': return '⚠️';
      default: return '❓';
    }
  };

  const cost = report.actualCost || report.estimatedCost;

  return (
    <Card 
      className={`hover:shadow-md transition-shadow cursor-pointer ${getPriorityColor(report.priority)}`}
      onClick={() => onClick(report)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base line-clamp-2">{report.title}</CardTitle>
            <CardDescription className="line-clamp-2 mt-1">
              {report.description}
            </CardDescription>
          </div>
          {report.photos.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Camera className="h-3 w-3" />
              <span>{report.photos.length}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <Badge className={getStatusColor(report.status)}>
            {report.status.replace('_', ' ')}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {report.priority}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-3">
        {/* Property and Location */}
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-3 w-3 text-muted-foreground" />
          <span className="font-medium">{report.property.name}</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">{report.location}</span>
        </div>
        
        {/* Cost */}
        <div className="flex items-center gap-2 text-sm">
          <DollarSign className="h-3 w-3 text-muted-foreground" />
          <span className="font-medium">€{cost.toFixed(2)}</span>
          {report.actualCost && report.actualCost !== report.estimatedCost && (
            <span className="text-xs text-muted-foreground">
              (est. €{report.estimatedCost.toFixed(2)})
            </span>
          )}
        </div>
        
        {/* Reporter and Date */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>{report.reportedBy.name}</span>
          </div>
          <span>{format(new Date(report.createdAt), 'MMM d, yyyy')}</span>
        </div>
        
        {/* Source */}
        <div className="flex items-center gap-2">
          <span className="text-sm">
            {getSourceIcon(report.source)} {report.source.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>
        </div>
        
        {/* Priority indicator for urgent items */}
        {report.priority === 'urgent' && (
          <div className="flex items-center gap-1 text-xs text-destructive">
            <AlertTriangle className="h-3 w-3" />
            <span className="font-medium">Urgent attention required</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};