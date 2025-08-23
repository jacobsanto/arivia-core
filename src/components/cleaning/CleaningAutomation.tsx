import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Bot, Zap, Clock, CheckCircle2, AlertCircle, Play, Pause, BarChart3 } from 'lucide-react';
import { CleaningRule, EnhancedHousekeepingTask } from '@/hooks/useRuleBasedCleaningSystem';

interface CleaningAutomationProps {
  rules: CleaningRule[];
  tasks: EnhancedHousekeepingTask[];
  onTaskUpdate: (taskId: string, additionalActions: string[]) => void;
}

export const CleaningAutomation: React.FC<CleaningAutomationProps> = ({
  rules,
  tasks,
  onTaskUpdate
}) => {
  const [automationEnabled, setAutomationEnabled] = useState(true);
  const [autoAssignment, setAutoAssignment] = useState(true);
  const [autoNotifications, setAutoNotifications] = useState(true);

  // Calculate automation stats
  const activeRules = rules.filter(rule => rule.is_active).length;
  const automatedTasks = tasks.filter(task => task.source_rule_id).length;
  const totalTasks = tasks.length;
  const automationRate = totalTasks > 0 ? (automatedTasks / totalTasks) * 100 : 0;

  const tasksByStatus = {
    pending: tasks.filter(t => t.status === 'pending').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Automation Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Automation Settings
          </CardTitle>
          <CardDescription>
            Configure how the system automatically handles cleaning tasks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Enable Automation</Label>
              <p className="text-sm text-muted-foreground">
                Automatically create and assign cleaning tasks based on rules
              </p>
            </div>
            <Switch
              checked={automationEnabled}
              onCheckedChange={setAutomationEnabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Auto Assignment</Label>
              <p className="text-sm text-muted-foreground">
                Automatically assign tasks to available staff members
              </p>
            </div>
            <Switch
              checked={autoAssignment}
              onCheckedChange={setAutoAssignment}
              disabled={!automationEnabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Auto Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Send notifications when tasks are created or updated
              </p>
            </div>
            <Switch
              checked={autoNotifications}
              onCheckedChange={setAutoNotifications}
              disabled={!automationEnabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Automation Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium">Active Rules</p>
                <p className="text-2xl font-bold">{activeRules}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bot className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Automated Tasks</p>
                <p className="text-2xl font-bold">{automatedTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Automation Rate</p>
                <p className="text-2xl font-bold">{automationRate.toFixed(0)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Total Tasks</p>
                <p className="text-2xl font-bold">{totalTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Automation Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Automation Overview</CardTitle>
          <CardDescription>
            Current automation performance and task distribution
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label className="text-sm">Task Automation Rate</Label>
              <span className="text-sm text-muted-foreground">{automationRate.toFixed(1)}%</span>
            </div>
            <Progress value={automationRate} className="h-2" />
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Clock className="h-4 w-4 text-yellow-500 mr-1" />
                <span className="text-sm font-medium">Pending</span>
              </div>
              <p className="text-2xl font-bold">{tasksByStatus.pending}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Play className="h-4 w-4 text-blue-500 mr-1" />
                <span className="text-sm font-medium">In Progress</span>
              </div>
              <p className="text-2xl font-bold">{tasksByStatus.in_progress}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm font-medium">Completed</span>
              </div>
              <p className="text-2xl font-bold">{tasksByStatus.completed}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Automated Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Automated Tasks</CardTitle>
          <CardDescription>
            Tasks that were automatically created and assigned by the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {automatedTasks === 0 ? (
            <div className="text-center py-8">
              <Bot className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <h3 className="font-medium">No automated tasks yet</h3>
              <p className="text-sm text-muted-foreground">
                Tasks will appear here as they are automatically created by your rules
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks
                .filter(task => task.source_rule_id)
                .slice(0, 5)
                .map(task => (
                  <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Bot className="h-4 w-4 text-primary" />
                      <div>
                        <h4 className="font-medium">{task.task_type}</h4>
                        <p className="text-sm text-muted-foreground">
                          Due: {formatDate(task.due_date)} • Property: {task.listing_id}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(task.status)}>
                        {task.status.replace('_', ' ')}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Day {task.task_day_number}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rule Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Rule Performance</CardTitle>
          <CardDescription>
            How your cleaning rules are performing in terms of task creation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rules.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <h3 className="font-medium">No rules configured</h3>
              <p className="text-sm text-muted-foreground">
                Create cleaning rules to enable automation
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {rules.slice(0, 5).map(rule => {
                const ruleTasks = tasks.filter(task => task.source_rule_id === rule.id);
                const ruleTaskCount = ruleTasks.length;
                
                return (
                  <div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{rule.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {rule.conditions?.stay_length?.min || 1}-{rule.conditions?.stay_length?.max || 999} nights • {Object.values(rule.actions || {}).flat().length} actions
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{ruleTaskCount} tasks</span>
                      <Badge variant={rule.is_active ? "default" : "secondary"}>
                        {rule.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};