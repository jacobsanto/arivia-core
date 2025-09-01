import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DamageReport, DamageSort } from '@/types/damage-reports.types';
import { format } from 'date-fns';
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown,
  MapPin, 
  User, 
  DollarSign,
  Camera,
  Eye
} from 'lucide-react';

interface ReportListViewProps {
  reports: DamageReport[];
  onReportClick: (report: DamageReport) => void;
  sort?: DamageSort;
  onSortChange?: (sort: DamageSort) => void;
  loading?: boolean;
}

export const ReportListView: React.FC<ReportListViewProps> = ({
  reports,
  onReportClick,
  sort = { field: 'createdAt', direction: 'desc' },
  onSortChange,
  loading = false
}) => {
  const handleSort = (field: DamageSort['field']) => {
    if (!onSortChange) return;
    
    const direction = sort.field === field && sort.direction === 'asc' ? 'desc' : 'asc';
    onSortChange({ field, direction });
  };

  const SortIcon = ({ field }: { field: DamageSort['field'] }) => {
    if (sort.field !== field) return <ArrowUpDown className="h-3 w-3" />;
    return sort.direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reported': return 'bg-yellow-100 text-yellow-800';
      case 'in_review': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-orange-500 text-white';
      case 'normal': return 'bg-primary text-primary-foreground';
      case 'low': return 'bg-muted text-muted-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Damage Reports</CardTitle>
          <CardDescription>Loading reports...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg animate-pulse">
                <div className="flex items-center gap-4 flex-1">
                  <div className="h-4 bg-muted rounded w-1/4" />
                  <div className="h-4 bg-muted rounded w-1/6" />
                  <div className="h-4 bg-muted rounded w-1/8" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (reports.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No damage reports found</CardTitle>
          <CardDescription>
            Try adjusting your filters or create a new damage report.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Damage Reports</CardTitle>
        <CardDescription>
          {reports.length} report{reports.length !== 1 ? 's' : ''} found
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 p-3 border-b bg-muted/50 rounded-t-lg text-sm font-medium">
          <button 
            className="col-span-3 flex items-center gap-1 hover:text-primary"
            onClick={() => handleSort('title')}
          >
            Report <SortIcon field="title" />
          </button>
          <button 
            className="col-span-2 flex items-center gap-1 hover:text-primary"
            onClick={() => handleSort('property')}
          >
            Property <SortIcon field="property" />
          </button>
          <button 
            className="col-span-1 flex items-center gap-1 hover:text-primary"
            onClick={() => handleSort('priority')}
          >
            Priority <SortIcon field="priority" />
          </button>
          <button 
            className="col-span-1 flex items-center gap-1 hover:text-primary"
            onClick={() => handleSort('status')}
          >
            Status <SortIcon field="status" />
          </button>
          <button 
            className="col-span-2 flex items-center gap-1 hover:text-primary"
            onClick={() => handleSort('estimatedCost')}
          >
            Cost <SortIcon field="estimatedCost" />
          </button>
          <button 
            className="col-span-2 flex items-center gap-1 hover:text-primary"
            onClick={() => handleSort('createdAt')}
          >
            Date <SortIcon field="createdAt" />
          </button>
          <div className="col-span-1 text-center">Actions</div>
        </div>

        {/* Table Rows */}
        <div className="space-y-1">
          {reports.map((report) => {
            const cost = report.actualCost || report.estimatedCost;
            
            return (
              <div
                key={report.id}
                className="grid grid-cols-12 gap-4 p-3 border-b hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => onReportClick(report)}
              >
                {/* Report Title & Description */}
                <div className="col-span-3 min-w-0">
                  <div className="font-medium text-sm truncate">{report.title}</div>
                  <div className="text-xs text-muted-foreground truncate">{report.description}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground truncate">{report.location}</span>
                    {report.photos.length > 0 && (
                      <>
                        <Camera className="h-3 w-3 text-muted-foreground ml-2" />
                        <span className="text-xs text-muted-foreground">{report.photos.length}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Property */}
                <div className="col-span-2 min-w-0">
                  <div className="text-sm font-medium truncate">{report.property.name}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <User className="h-3 w-3" />
                    <span className="truncate">{report.reportedBy.name}</span>
                  </div>
                </div>

                {/* Priority */}
                <div className="col-span-1">
                  <Badge className={`text-xs ${getPriorityColor(report.priority)}`}>
                    {report.priority}
                  </Badge>
                </div>

                {/* Status */}
                <div className="col-span-1">
                  <Badge variant="outline" className={`text-xs ${getStatusColor(report.status)}`}>
                    {report.status.replace('_', ' ')}
                  </Badge>
                </div>

                {/* Cost */}
                <div className="col-span-2">
                  <div className="flex items-center gap-1 text-sm">
                    <DollarSign className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium">€{cost.toFixed(2)}</span>
                  </div>
                  {report.actualCost && report.actualCost !== report.estimatedCost && (
                    <div className="text-xs text-muted-foreground">
                      est. €{report.estimatedCost.toFixed(2)}
                    </div>
                  )}
                </div>

                {/* Date */}
                <div className="col-span-2 text-sm">
                  <div>{format(new Date(report.createdAt), 'MMM d, yyyy')}</div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(report.createdAt), 'HH:mm')}
                  </div>
                </div>

                {/* Actions */}
                <div className="col-span-1 flex justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onReportClick(report);
                    }}
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};