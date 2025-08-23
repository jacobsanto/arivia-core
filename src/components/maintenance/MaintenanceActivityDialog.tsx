import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, Clock, AlertTriangle, Wrench, Activity } from 'lucide-react';

interface MaintenanceActivityDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MaintenanceActivityDialog: React.FC<MaintenanceActivityDialogProps> = ({
  isOpen,
  onOpenChange,
}) => {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['maintenance-all-activity'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    },
    enabled: isOpen,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'pending': return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-orange-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>All Maintenance Activity</DialogTitle>
          <DialogDescription>
            Complete history of maintenance tasks and updates
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Loading activity...</p>
            </div>
          ) : activities?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>No maintenance activity found</p>
            </div>
          ) : (
            activities?.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2 mt-1">
                  {getStatusIcon(activity.status)}
                  <Wrench className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{activity.title}</h4>
                      {activity.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {activity.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-muted-foreground">
                          Task Type: {activity.task_type}
                        </span>
                        <span className={`text-xs font-medium ${getPriorityColor(activity.priority)}`}>
                          {activity.priority} priority
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {activity.assigned_to ? 'Assigned' : 'Unassigned'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <Badge className={getStatusColor(activity.status)}>
                        {activity.status.replace('_', ' ')}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {activity.updated_at 
                          ? new Date(activity.updated_at).toLocaleString()
                          : 'No timestamp'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};