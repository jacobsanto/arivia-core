import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DamageReport, UpdateDamageReportData } from '@/types/damage-reports.types';
import { useIsMobile } from '@/hooks/use-mobile';
import { format } from 'date-fns';
import { 
  MapPin, 
  User, 
  DollarSign, 
  Calendar, 
  Camera,
  Wrench,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface ReviewReportModalProps {
  report: DamageReport | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (reportId: string, updates: UpdateDamageReportData) => void;
  onCreateMaintenanceTask?: (report: DamageReport) => void;
  isLoading?: boolean;
}

export const ReviewReportModal: React.FC<ReviewReportModalProps> = ({
  report,
  isOpen,
  onClose,
  onUpdate,
  onCreateMaintenanceTask,
  isLoading = false
}) => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('details');
  const [updates, setUpdates] = useState<UpdateDamageReportData>({});

  if (!report) return null;

  const handleUpdate = () => {
    if (Object.keys(updates).length > 0) {
      onUpdate(report.id, updates);
      setUpdates({});
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reported': return 'bg-yellow-100 text-yellow-800';
      case 'in_review': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'reported': return Clock;
      case 'in_review': return AlertTriangle;
      case 'resolved': return CheckCircle;
      case 'rejected': return FileText;
      default: return Clock;
    }
  };

  const cost = report.actualCost || report.estimatedCost;
  const StatusIcon = getStatusIcon(report.status);

  const content = (
    <>
      {/* Header */}
      <div className="space-y-3 pb-4 border-b">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold leading-tight">{report.title}</h2>
          <div className="flex items-center gap-2">
            <Badge className={getPriorityColor(report.priority)}>
              {report.priority}
            </Badge>
            <Badge variant="outline" className={getStatusColor(report.status)}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {report.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>
        
        <p className="text-muted-foreground">{report.description}</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="photos">
            Photos ({report.photos.length})
          </TabsTrigger>
          <TabsTrigger value="management">Management</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Property */}
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{report.property.name}</p>
                <p className="text-xs text-muted-foreground">{report.location}</p>
              </div>
            </div>

            {/* Reporter */}
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{report.reportedBy.name}</p>
                <p className="text-xs text-muted-foreground">{report.reportedBy.role}</p>
              </div>
            </div>

            {/* Cost */}
            <div className="flex items-center gap-3">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">€{cost.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">
                  {report.actualCost ? 'Actual cost' : 'Estimated cost'}
                </p>
              </div>
            </div>

            {/* Date */}
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  {format(new Date(report.createdAt), 'MMM d, yyyy')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(report.createdAt), 'h:mm a')}
                </p>
              </div>
            </div>
          </div>

          {/* Reviewer Info */}
          {report.reviewedBy && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <h4 className="text-sm font-medium mb-1">Reviewed By</h4>
              <div className="flex items-center gap-2">
                <User className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm">{report.reviewedBy.name}</span>
                <span className="text-xs text-muted-foreground">({report.reviewedBy.role})</span>
              </div>
            </div>
          )}

          {/* Resolution Notes */}
          {report.resolutionNotes && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="text-sm font-medium text-green-800 mb-1">Resolution Notes</h4>
              <p className="text-sm text-green-700">{report.resolutionNotes}</p>
              {report.resolvedAt && (
                <p className="text-xs text-green-600 mt-1">
                  Resolved on {format(new Date(report.resolvedAt), 'MMM d, yyyy h:mm a')}
                </p>
              )}
            </div>
          )}

          {/* Maintenance Task Link */}
          {report.maintenanceTaskId && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-1">Linked Maintenance Task</h4>
              <div className="flex items-center justify-between">
                <p className="text-sm text-blue-700">Task ID: {report.maintenanceTaskId}</p>
                <Button variant="outline" size="sm">
                  <Wrench className="h-3 w-3 mr-1" />
                  View Task
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="photos" className="space-y-4">
          {report.photos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.photos.map((photo) => (
                <div key={photo.id} className="space-y-2">
                  <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                    <img
                      src={photo.url}
                      alt={photo.caption || 'Damage photo'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {photo.caption && (
                    <p className="text-sm text-muted-foreground">{photo.caption}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Uploaded {format(new Date(photo.uploadedAt), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Camera className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No photos uploaded</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="management" className="space-y-4">
          {/* Status Update */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select 
              value={updates.status || report.status} 
              onValueChange={(value) => setUpdates(prev => ({ ...prev, status: value as any }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="reported">Reported</SelectItem>
                <SelectItem value="in_review">In Review</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Priority Update */}
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select 
              value={updates.priority || report.priority} 
              onValueChange={(value) => setUpdates(prev => ({ ...prev, priority: value as any }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actual Cost */}
          <div className="space-y-2">
            <Label>Actual Cost (€)</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={updates.actualCost !== undefined ? updates.actualCost : report.actualCost || ''}
              onChange={(e) => setUpdates(prev => ({ 
                ...prev, 
                actualCost: parseFloat(e.target.value) || 0 
              }))}
              placeholder={`Estimated: €${report.estimatedCost.toFixed(2)}`}
            />
          </div>

          {/* Resolution Notes */}
          <div className="space-y-2">
            <Label>Resolution Notes</Label>
            <Textarea
              value={updates.resolutionNotes !== undefined ? updates.resolutionNotes : report.resolutionNotes || ''}
              onChange={(e) => setUpdates(prev => ({ ...prev, resolutionNotes: e.target.value }))}
              placeholder="Describe how the issue was resolved, any parts used, costs incurred, etc."
              rows={4}
            />
          </div>

          {/* Create Maintenance Task */}
          {!report.maintenanceTaskId && onCreateMaintenanceTask && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Create Maintenance Task</h4>
              <p className="text-sm text-blue-700 mb-3">
                Generate a maintenance task to address this damage report.
              </p>
              <Button 
                variant="outline" 
                onClick={() => onCreateMaintenanceTask(report)}
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                <Wrench className="h-4 w-4 mr-2" />
                Create Maintenance Task
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        <div className="flex gap-2">
          {Object.keys(updates).length > 0 && (
            <Button onClick={handleUpdate} disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Save Changes'}
            </Button>
          )}
        </div>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="bottom" className="h-[90vh] pt-6 overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Damage Report Review</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            {content}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Damage Report Review</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
};