import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Plus, 
  Eye, 
  Edit, 
  Users, 
  Zap,
  Globe,
  Building,
  Calendar,
  CheckSquare,
  Trash2
} from 'lucide-react';
import { useRuleBasedCleaningSystem } from '@/hooks/useRuleBasedCleaningSystem';
import { RuleBuilder } from './RuleBuilder';
import { PropertyAssignmentManager } from './PropertyAssignmentManager';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export const RuleBasedDashboard = () => {
  const {
    rules,
    actions,
    assignments,
    tasks,
    loading,
    deleteCleaningRule,
    refetch
  } = useRuleBasedCleaningSystem();

  const [activeTab, setActiveTab] = useState('overview');
  const [showRuleBuilder, setShowRuleBuilder] = useState(false);
  const [showPropertyManager, setShowPropertyManager] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);
  const [ruleToDelete, setRuleToDelete] = useState(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const globalRules = rules.filter(r => r.is_global);
  const customRules = rules.filter(r => !r.is_global);
  const activeRules = rules.filter(r => r.is_active);
  const ruleBasedTasks = tasks.filter(t => t.source_rule_id);

  const handleDeleteRule = async () => {
    if (!ruleToDelete) return;
    
    try {
      await deleteCleaningRule(ruleToDelete.id);
      setRuleToDelete(null);
    } catch (error) {
      console.error('Error deleting rule:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">Rule-Based Cleaning System</h1>
          <p className="text-muted-foreground">
            Simplified rule management with day-based action scheduling
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowPropertyManager(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            Assign Rules
          </Button>
          <Button 
            onClick={() => setShowRuleBuilder(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Rule
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Global Rules</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{globalRules.length}</div>
            <p className="text-xs text-muted-foreground">
              Apply to all properties
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rules</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeRules.length}</div>
            <p className="text-xs text-muted-foreground">
              Currently processing bookings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rule Assignments</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignments.length}</div>
            <p className="text-xs text-muted-foreground">
              Property-rule pairings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Generated Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ruleBasedTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              Auto-created from rules
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="actions">Action Catalog</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Rules */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Active Rules
                </CardTitle>
                <CardDescription>
                  Currently active cleaning rules
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {activeRules.slice(0, 5).map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium">{rule.rule_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {rule.stay_length_range[0]}-{rule.stay_length_range[1] === 999 ? '∞' : rule.stay_length_range[1]} nights
                      </p>
                      <div className="flex gap-1 mt-1">
                        <Badge variant={rule.is_global ? "default" : "secondary"}>
                          {rule.is_global ? 'Global' : 'Custom'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {Object.keys(rule.actions_by_day).length} days
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="icon" 
                        variant="ghost"
                        onClick={() => {
                          setSelectedRule(rule);
                          setShowRuleBuilder(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {activeRules.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No active rules configured
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Recent Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Recent Rule-Based Tasks
                </CardTitle>
                <CardDescription>
                  Tasks generated from cleaning rules
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {ruleBasedTasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium">Day {task.task_day_number} - {task.task_type}</p>
                      <p className="text-sm text-muted-foreground">
                        Due: {new Date(task.due_date).toLocaleDateString()}
                      </p>
                      <div className="flex gap-1 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {task.default_actions.length} actions
                        </Badge>
                        {task.additional_actions.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            +{task.additional_actions.length} extra
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Badge variant={
                      task.status === 'completed' ? 'default' : 
                      task.status === 'in-progress' ? 'secondary' : 'outline'
                    }>
                      {task.status}
                    </Badge>
                  </div>
                ))}
                {ruleBasedTasks.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No rule-based tasks found
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rules">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Cleaning Rules</h3>
              <Button onClick={() => setShowRuleBuilder(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Rule
              </Button>
            </div>

            <div className="grid gap-4">
              {rules.map((rule) => (
                <Card key={rule.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{rule.rule_name}</CardTitle>
                        <CardDescription>
                          Stay duration: {rule.stay_length_range[0]}-{rule.stay_length_range[1] === 999 ? '∞' : rule.stay_length_range[1]} nights
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={rule.is_active ? "default" : "secondary"}>
                          {rule.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant={rule.is_global ? "default" : "outline"}>
                          {rule.is_global ? 'Global' : 'Custom'}
                        </Badge>
                        <Button 
                          size="icon" 
                          variant="ghost"
                          onClick={() => {
                            setSelectedRule(rule);
                            setShowRuleBuilder(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost"
                          onClick={() => setRuleToDelete(rule)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium mb-2">Actions by Day</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          {Object.entries(rule.actions_by_day).map(([day, dayActions]) => (
                            <div key={day} className="text-sm">
                              <span className="font-medium">Day {day}:</span>
                              <div className="ml-2">
                                {(dayActions as string[]).map(action => {
                                  const actionData = actions.find(a => a.action_name === action);
                                  return (
                                    <div key={action} className="text-muted-foreground">
                                      • {actionData?.display_name || action}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {!rule.is_global && (
                        <div>
                          <h4 className="font-medium mb-2">Assigned Properties</h4>
                          <p className="text-sm text-muted-foreground">
                            {rule.assignable_properties.length} properties assigned
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="assignments">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Rule Assignments</h3>
              <Button onClick={() => setShowPropertyManager(true)}>
                <Users className="h-4 w-4 mr-2" />
                Manage Assignments
              </Button>
            </div>

            <div className="grid gap-4">
              {assignments.map((assignment) => (
                <Card key={assignment.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {assignment.cleaning_rules?.rule_name || 'Unknown Rule'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Property: {assignment.property_id}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Assigned: {new Date(assignment.assigned_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={assignment.is_active ? "default" : "secondary"}>
                          {assignment.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {assignments.length === 0 && (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">No rule assignments found</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="actions">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Cleaning Action Catalog</h3>
            
            <div className="grid gap-4">
              {Object.entries(actions.reduce((acc, action) => {
                if (!acc[action.category]) acc[action.category] = [];
                acc[action.category].push(action);
                return acc;
              }, {} as Record<string, typeof actions>)).map(([category, categoryActions]) => (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="capitalize">{category} Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {categoryActions.map(action => (
                        <div key={action.id} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <p className="font-medium">{action.display_name}</p>
                            <p className="text-sm text-muted-foreground">{action.description}</p>
                          </div>
                          <Badge variant="outline">
                            {action.estimated_duration}min
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <RuleBuilder 
        isOpen={showRuleBuilder}
        onClose={() => {
          setShowRuleBuilder(false);
          setSelectedRule(null);
        }}
        onSave={() => {
          setShowRuleBuilder(false);
          setSelectedRule(null);
        }}
        existingRule={selectedRule}
      />

      <PropertyAssignmentManager 
        isOpen={showPropertyManager}
        onClose={() => setShowPropertyManager(false)}
        rules={rules}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!ruleToDelete} onOpenChange={() => setRuleToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the rule "{ruleToDelete?.rule_name}". 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteRule}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
