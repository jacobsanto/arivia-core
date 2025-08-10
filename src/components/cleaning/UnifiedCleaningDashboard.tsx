
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Plus, 
  Eye, 
  Copy, 
  Play, 
  Users, 
  FileText,
  Zap,
  Globe,
  Building
} from 'lucide-react';
import { useAdvancedCleaningSystem } from '@/hooks/useAdvancedCleaningSystem';
import { TemplateLibrary } from './TemplateLibrary';
import { LogicBuilder } from './LogicBuilder';
import { BulkConfigurationManager } from './BulkConfigurationManager';
import { RuleTestingPanel } from './RuleTestingPanel';

export const UnifiedCleaningDashboard = () => {
  const { 
    templates, 
    rules, 
    assignments, 
    loading, 
    createTemplate, 
    updateTemplate,
    testRule,
    refetch 
  } = useAdvancedCleaningSystem();

  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showLogicBuilder, setShowLogicBuilder] = useState(false);
  const [showBulkManager, setShowBulkManager] = useState(false);
  const [showTestingPanel, setShowTestingPanel] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const globalTemplates = templates.filter(t => t.is_global);
  const customTemplates = templates.filter(t => !t.is_global);
  const activeRules = rules.filter(r => r.is_active);
  const totalAssignments = assignments.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">Advanced Cleaning System</h1>
          <p className="text-muted-foreground">
            Unified configuration management with advanced rule logic and bulk operations
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowTestingPanel(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            Test Rules
          </Button>
          <Button 
            onClick={() => setShowBulkManager(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            Bulk Configure
          </Button>
          <Button 
            onClick={() => setShowLogicBuilder(true)}
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
            <CardTitle className="text-sm font-medium">Global Templates</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{globalTemplates.length}</div>
            <p className="text-xs text-muted-foreground">
              Reusable across all properties
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
            <CardTitle className="text-sm font-medium">Property Assignments</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAssignments}</div>
            <p className="text-xs text-muted-foreground">
              Active configurations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custom Templates</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customTemplates.length}</div>
            <p className="text-xs text-muted-foreground">
              Property-specific configs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="rules">Rules & Logic</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Templates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Recent Templates
                </CardTitle>
                <CardDescription>
                  Latest cleaning configuration templates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {templates.slice(0, 5).map((template) => (
                  <div key={template.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${template.is_global ? 'bg-blue-500' : 'bg-green-500'}`} />
                      <div>
                        <p className="font-medium">{template.name}</p>
                        <p className="text-sm text-muted-foreground">{template.description || 'No description'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={template.is_global ? "default" : "secondary"}>
                        {template.is_global ? 'Global' : 'Custom'}
                      </Badge>
                      <Button size="icon" variant="ghost">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {templates.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No templates created yet
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Active Rules */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Active Rules
                </CardTitle>
                <CardDescription>
                  Currently active cleaning automation rules
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {activeRules.slice(0, 5).map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium">{rule.rule_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {rule.min_nights}-{rule.max_nights === 999 ? '∞' : rule.max_nights} nights
                      </p>
                      <div className="flex gap-1 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {rule.conditions.length} conditions
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {rule.actions.length} actions
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="icon" variant="ghost" onClick={() => testRule(rule.id, {})}>
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost">
                        <Settings className="h-4 w-4" />
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
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks and shortcuts for cleaning system management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col gap-2"
                  onClick={() => setShowLogicBuilder(true)}
                >
                  <Plus className="h-6 w-6" />
                  Create New Rule
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col gap-2"
                  onClick={() => setShowBulkManager(true)}
                >
                  <Users className="h-6 w-6" />
                  Bulk Configure Properties
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col gap-2"
                  onClick={() => setShowTestingPanel(true)}
                >
                  <Play className="h-6 w-6" />
                  Test Rules & Logic
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <TemplateLibrary 
            templates={templates}
            onCreateTemplate={createTemplate}
            onUpdateTemplate={updateTemplate}
            onSelectTemplate={setSelectedTemplate}
          />
        </TabsContent>

        <TabsContent value="rules">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Rules & Logic Management</h3>
              <Button onClick={() => setShowLogicBuilder(true)}>
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
                        <CardDescription>{rule.rule_description}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={rule.is_active ? "default" : "secondary"}>
                          {rule.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Button size="icon" variant="ghost">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex gap-4 text-sm">
                        <span>Stay Duration: {rule.min_nights}-{rule.max_nights === 999 ? '∞ nights' : `${rule.max_nights} nights`}</span>
                        <span>Version: {rule.rule_version}</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Conditions ({rule.conditions.length})</h4>
                          <div className="space-y-1">
                            {rule.conditions.map((condition, index) => (
                              <div key={condition.id} className="text-sm text-muted-foreground">
                                {index > 0 && condition.logical_operator === 'AND' && <span className="text-blue-600">AND </span>}
                                {index > 0 && condition.logical_operator === 'OR' && <span className="text-orange-600">OR </span>}
                                <span>{condition.condition_type} {condition.operator} {JSON.stringify(condition.value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Actions ({rule.actions.length})</h4>
                          <div className="space-y-1">
                            {rule.actions.map((action) => (
                              <div key={action.id} className="text-sm text-muted-foreground">
                                <span className="capitalize">{action.action_type.replace('_', ' ')}</span>
                                {action.action_data.task_type && <span>: {action.action_data.task_type}</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
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
              <h3 className="text-lg font-semibold">Configuration Assignments</h3>
              <Button onClick={() => setShowBulkManager(true)}>
                <Users className="h-4 w-4 mr-2" />
                Bulk Assign
              </Button>
            </div>

            <div className="grid gap-4">
              {assignments.map((assignment) => (
                <Card key={assignment.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {assignment.template_id ? 'Template Assignment' : 'Direct Configuration'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Property: {assignment.listing_id}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Assigned: {new Date(assignment.assigned_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Active</Badge>
                        <Button size="icon" variant="ghost">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {assignments.length === 0 && (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">No configuration assignments found</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {showLogicBuilder && (
        <LogicBuilder 
          onClose={() => setShowLogicBuilder(false)}
          onSave={() => {
            setShowLogicBuilder(false);
            refetch();
          }}
        />
      )}

      {showBulkManager && (
        <BulkConfigurationManager 
          templates={templates}
          onClose={() => setShowBulkManager(false)}
          onSave={() => {
            setShowBulkManager(false);
            refetch();
          }}
        />
      )}

      {showTestingPanel && (
        <RuleTestingPanel 
          rules={rules}
          onClose={() => setShowTestingPanel(false)}
          onTest={testRule}
        />
      )}
    </div>
  );
};
