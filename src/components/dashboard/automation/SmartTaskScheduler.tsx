import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Zap, 
  Settings,
  PlayCircle,
  PauseCircle,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { format, addDays, addHours } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  type: 'task_creation' | 'assignment' | 'scheduling' | 'notification';
  enabled: boolean;
  trigger: string;
  action: string;
  conditions: any;
  lastRun?: string;
  successRate: number;
}

export const SmartTaskScheduler: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: automationRules, isLoading } = useQuery({
    queryKey: ['automation-rules'],
    queryFn: async () => {
      // Simulate automation rules data
      const rules: AutomationRule[] = [
        {
          id: 'auto-cleaning-assignment',
          name: 'Auto-Assign Cleaning Tasks',
          description: 'Automatically assign cleaning tasks based on staff availability and location',
          type: 'assignment',
          enabled: true,
          trigger: 'New booking confirmed',
          action: 'Create and assign cleaning tasks',
          conditions: { minHoursBeforeCheckIn: 24, skillRequired: 'Housekeeping' },
          lastRun: new Date().toISOString(),
          successRate: 94
        },
        {
          id: 'priority-escalation',
          name: 'Priority Task Escalation',
          description: 'Escalate overdue tasks and notify supervisors',
          type: 'notification',
          enabled: true,
          trigger: 'Task overdue > 2 hours',
          action: 'Send escalation notification',
          conditions: { escalationDelay: 2, notifyRoles: ['supervisor', 'manager'] },
          lastRun: format(addHours(new Date(), -3), 'yyyy-MM-dd HH:mm:ss'),
          successRate: 89
        },
        {
          id: 'smart-clustering',
          name: 'Smart Task Clustering',
          description: 'Group nearby tasks for the same staff member',
          type: 'scheduling',
          enabled: true,
          trigger: 'Multiple tasks same property',
          action: 'Cluster tasks by location and time',
          conditions: { maxDistance: '1km', timeWindow: 4 },
          lastRun: format(addHours(new Date(), -1), 'yyyy-MM-dd HH:mm:ss'),
          successRate: 97
        },
        {
          id: 'predictive-maintenance',
          name: 'Predictive Maintenance Scheduling',
          description: 'Create maintenance tasks based on usage patterns',
          type: 'task_creation',
          enabled: false,
          trigger: 'Property usage threshold',
          action: 'Generate maintenance tasks',
          conditions: { usageThreshold: 15, taskTypes: ['HVAC Check', 'Deep Clean'] },
          successRate: 76
        },
        {
          id: 'checkout-prep',
          name: 'Checkout Preparation',
          description: 'Auto-schedule post-checkout tasks',
          type: 'task_creation',
          enabled: true,
          trigger: 'Guest checkout complete',
          action: 'Create inspection and cleaning tasks',
          conditions: { delayMinutes: 30, autoAssign: true },
          lastRun: format(addHours(new Date(), -2), 'yyyy-MM-dd HH:mm:ss'),
          successRate: 91
        },
        {
          id: 'staff-workload-balancing',
          name: 'Workload Balancing',
          description: 'Redistribute tasks when staff workload is uneven',
          type: 'assignment',
          enabled: true,
          trigger: 'Workload imbalance detected',
          action: 'Reassign tasks to balance workload',
          conditions: { maxWorkloadRatio: 1.5, rebalanceThreshold: 3 },
          lastRun: format(addHours(new Date(), -6), 'yyyy-MM-dd HH:mm:ss'),
          successRate: 85
        }
      ];

      return rules;
    }
  });

  const toggleRuleMutation = useMutation({
    mutationFn: async ({ ruleId, enabled }: { ruleId: string; enabled: boolean }) => {
      // In a real app, this would update the automation rule in the database
      console.log(`Toggling rule ${ruleId} to ${enabled}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return { ruleId, enabled };
    },
    onSuccess: (data) => {
      toast({
        title: "Automation Rule Updated",
        description: `Rule has been ${data.enabled ? 'enabled' : 'disabled'} successfully.`,
      });
      
      // Update the local state
      queryClient.setQueryData(['automation-rules'], (oldData: AutomationRule[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(rule => 
          rule.id === data.ruleId ? { ...rule, enabled: data.enabled } : rule
        );
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update automation rule.",
        variant: "destructive",
      });
    }
  });

  const triggerRuleMutation = useMutation({
    mutationFn: async (ruleId: string) => {
      // In a real app, this would manually trigger the automation rule
      console.log(`Manually triggering rule ${ruleId}`);
      
      // Call the edge function to execute the automation
      const { data, error } = await supabase.functions.invoke('task-automation', {
        body: { ruleId, manual: true }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Automation Triggered",
        description: "The automation rule has been executed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error", 
        description: "Failed to trigger automation rule.",
        variant: "destructive",
      });
    }
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'task_creation': return <Calendar className="h-4 w-4" />;
      case 'assignment': return <Users className="h-4 w-4" />;
      case 'scheduling': return <Clock className="h-4 w-4" />;
      case 'notification': return <AlertTriangle className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'task_creation': return 'bg-blue-100 text-blue-800';
      case 'assignment': return 'bg-green-100 text-green-800';
      case 'scheduling': return 'bg-purple-100 text-purple-800';
      case 'notification': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Smart Task Automation Rules
        </h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {automationRules?.filter(r => r.enabled).length || 0} Active Rules
          </Badge>
          <Button size="sm" onClick={() => triggerRuleMutation.mutate('batch-optimization')}>
            <PlayCircle className="h-4 w-4 mr-2" />
            Run All
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {automationRules?.map((rule) => (
          <Card key={rule.id} className={`${rule.enabled ? 'border-green-200' : 'border-gray-200'}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-lg">{rule.name}</CardTitle>
                    <Badge className={getTypeColor(rule.type)}>
                      {getTypeIcon(rule.type)}
                      <span className="ml-1 capitalize">{rule.type.replace('_', ' ')}</span>
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{rule.description}</p>
                </div>
                <Switch
                  checked={rule.enabled}
                  onCheckedChange={(enabled) => toggleRuleMutation.mutate({ ruleId: rule.id, enabled })}
                  disabled={toggleRuleMutation.isPending}
                />
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Trigger:</span>
                  <p className="font-medium">{rule.trigger}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Action:</span>
                  <p className="font-medium">{rule.action}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <span className={getSuccessRateColor(rule.successRate)}>
                      {rule.successRate}% success
                    </span>
                  </div>
                  {rule.lastRun && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>Last: {format(new Date(rule.lastRun), 'MMM dd, HH:mm')}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => triggerRuleMutation.mutate(rule.id)}
                    disabled={!rule.enabled || triggerRuleMutation.isPending}
                  >
                    <PlayCircle className="h-3 w-3 mr-1" />
                    Run Now
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Settings className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Automation Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Automation Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {automationRules?.filter(r => r.enabled).length || 0}
              </div>
              <div className="text-sm text-blue-600">Active Rules</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Math.round((automationRules?.reduce((sum, r) => sum + r.successRate, 0) || 0) / (automationRules?.length || 1))}%
              </div>
              <div className="text-sm text-green-600">Avg Success Rate</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {automationRules?.filter(r => r.enabled && r.lastRun).length || 0}
              </div>
              <div className="text-sm text-purple-600">Recently Active</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {automationRules?.filter(r => !r.enabled).length || 0}
              </div>
              <div className="text-sm text-orange-600">Inactive Rules</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};