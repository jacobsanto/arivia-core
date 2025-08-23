import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Bot, Shield, Zap } from 'lucide-react';
import { CleaningRulesManager } from './CleaningRulesManager';
import { CleaningActionsManager } from './CleaningActionsManager';
import { CleaningAutomation } from './CleaningAutomation';
import { useRuleBasedCleaningSystem } from '@/hooks/useRuleBasedCleaningSystem';

export const CleaningSettings: React.FC = () => {
  const {
    rules,
    actions,
    assignments,
    tasks,
    loading,
    error,
    createCleaningRule,
    updateCleaningRule,
    deleteCleaningRule,
    assignRuleToProperties,
    updateTaskActions
  } = useRuleBasedCleaningSystem();

  const [activeTab, setActiveTab] = useState('rules');

  const handleActionCreated = (action: any) => {
    // Refresh data or update local state
    window.location.reload();
  };

  const handleActionUpdated = (action: any) => {
    // Refresh data or update local state
    window.location.reload();
  };

  const handleActionDeleted = (actionId: string) => {
    // Refresh data or update local state
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Cleaning Settings & Automation
          </h1>
          <p className="text-muted-foreground">
            Configure cleaning rules, actions, and automation for your properties
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
            <Bot className="h-3 w-3 mr-1" />
            Automation Active
          </Badge>
          <Badge variant="outline">
            {rules.length} Rules
          </Badge>
          <Badge variant="outline">
            {actions.length} Actions
          </Badge>
        </div>
      </div>

      {error && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-destructive">
              <Shield className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Cleaning Rules
          </TabsTrigger>
          <TabsTrigger value="actions" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Actions
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Automation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cleaning Rules Management</CardTitle>
              <CardDescription>
                Define rules that automatically determine what cleaning actions should be performed based on booking characteristics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CleaningRulesManager
                rules={rules}
                actions={actions}
                assignments={assignments}
                onRuleCreated={createCleaningRule}
                onRuleUpdated={updateCleaningRule}
                onRuleDeleted={deleteCleaningRule}
                onRuleAssigned={assignRuleToProperties}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cleaning Actions Library</CardTitle>
              <CardDescription>
                Manage the available cleaning actions that can be assigned to tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CleaningActionsManager
                actions={actions}
                onActionCreated={handleActionCreated}
                onActionUpdated={handleActionUpdated}
                onActionDeleted={handleActionDeleted}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cleaning Automation</CardTitle>
              <CardDescription>
                Configure automation settings and monitor automated task creation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CleaningAutomation
                rules={rules}
                tasks={tasks}
                onTaskUpdate={updateTaskActions}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};