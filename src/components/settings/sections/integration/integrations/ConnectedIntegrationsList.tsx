import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Settings, 
  Trash2, 
  Power, 
  PowerOff,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface ExternalIntegration {
  id: string;
  name: string;
  provider: string;
  category: string;
  status: string;
  health_score: number;
  last_sync: string | null;
  last_error: string | null;
  integration_type: string;
  is_active: boolean;
  created_at: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800';
    case 'inactive': return 'bg-gray-100 text-gray-800';
    case 'error': return 'bg-red-100 text-red-800';
    case 'configuring': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active': return CheckCircle;
    case 'error': return AlertTriangle;
    case 'configuring': return Clock;
    default: return Activity;
  }
};

const getHealthColor = (score: number) => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
};

const ConnectedIntegrationsList: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: integrations, isLoading } = useQuery({
    queryKey: ['external-integrations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('external_integrations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ExternalIntegration[];
    }
  });

  const toggleIntegrationMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('external_integrations')
        .update({ 
          is_active, 
          status: is_active ? 'active' : 'inactive'
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external-integrations'] });
      toast({
        title: "Integration Updated",
        description: "Integration status has been updated.",
      });
    },
    onError: (error) => {
      console.error('Error updating integration:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update integration status.",
        variant: "destructive",
      });
    }
  });

  const deleteIntegrationMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('external_integrations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external-integrations'] });
      toast({
        title: "Integration Deleted",
        description: "Integration has been removed successfully.",
      });
    },
    onError: (error) => {
      console.error('Error deleting integration:', error);
      toast({
        title: "Deletion Failed",
        description: "Failed to delete integration.",
        variant: "destructive",
      });
    }
  });

  const handleToggle = (integration: ExternalIntegration) => {
    toggleIntegrationMutation.mutate({
      id: integration.id,
      is_active: !integration.is_active
    });
  };

  const handleDelete = (id: string) => {
    deleteIntegrationMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!integrations || integrations.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Integrations</h3>
          <p className="text-muted-foreground">
            You haven't set up any integrations yet. Browse the marketplace to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {integrations.map((integration) => {
        const StatusIcon = getStatusIcon(integration.status);
        
        return (
          <Card key={integration.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <CardTitle className="text-lg">{integration.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="secondary" 
                      className={getStatusColor(integration.status)}
                    >
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {integration.status}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {integration.integration_type}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggle(integration)}
                    disabled={toggleIntegrationMutation.isPending}
                  >
                    {integration.is_active ? (
                      <PowerOff className="h-4 w-4" />
                    ) : (
                      <Power className="h-4 w-4" />
                    )}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Integration</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete the "{integration.name}" integration? 
                          This action cannot be undone and will remove all associated data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(integration.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Provider</div>
                  <div className="font-medium capitalize">{integration.provider}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Category</div>
                  <div className="font-medium capitalize">
                    {integration.category.replace('_', ' ')}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Health Score</span>
                  <span className={`font-medium ${getHealthColor(integration.health_score)}`}>
                    {integration.health_score}%
                  </span>
                </div>
                <Progress 
                  value={integration.health_score} 
                  className="h-2"
                />
              </div>

              {integration.last_sync && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Last Sync: </span>
                  <span className="font-medium">
                    {new Date(integration.last_sync).toLocaleDateString()}
                  </span>
                </div>
              )}

              {integration.last_error && (
                <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                  <div className="font-medium mb-1">Last Error:</div>
                  <div className="text-xs">{integration.last_error}</div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sync Now
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ConnectedIntegrationsList;