import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Minus, 
  X,
  Zap,
  Filter,
  Play,
  Save,
  AlertCircle
} from 'lucide-react';

interface LogicBuilderProps {
  onClose: () => void;
  onSave: () => void;
}

interface Condition {
  id: string;
  condition_type: string;
  operator: string;
  value: any;
  logical_operator: 'AND' | 'OR';
}

interface Action {
  id: string;
  action_type: string;
  action_data: any;
}

export const LogicBuilder: React.FC<LogicBuilderProps> = ({ onClose, onSave }) => {
  const [ruleName, setRuleName] = useState('');
  const [ruleDescription, setRuleDescription] = useState('');
  const [minNights, setMinNights] = useState(1);
  const [maxNights, setMaxNights] = useState(999);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [activeTab, setActiveTab] = useState<'conditions' | 'actions'>('conditions');

  const conditionTypes = [
    { value: 'stay_duration', label: 'Stay Duration' },
    { value: 'guest_count', label: 'Guest Count' },
    { value: 'checkout_time', label: 'Checkout Time' },
    { value: 'checkin_time', label: 'Check-in Time' },
    { value: 'property_type', label: 'Property Type' },
    { value: 'booking_source', label: 'Booking Source' }
  ];

  const operators = [
    { value: 'equals', label: 'Equals' },
    { value: 'greater_than', label: 'Greater Than' },
    { value: 'less_than', label: 'Less Than' },
    { value: 'between', label: 'Between' },
    { value: 'contains', label: 'Contains' }
  ];

  const actionTypes = [
    { value: 'create_task', label: 'Create Cleaning Task' },
    { value: 'add_fee', label: 'Add Extra Fee' },
    { value: 'send_notification', label: 'Send Notification' },
    { value: 'assign_staff', label: 'Assign Staff Member' },
    { value: 'schedule_inspection', label: 'Schedule Inspection' }
  ];

  const addCondition = () => {
    const newCondition: Condition = {
      id: Date.now().toString(),
      condition_type: 'stay_duration',
      operator: 'equals',
      value: { value: 1 },
      logical_operator: conditions.length > 0 ? 'AND' : 'AND'
    };
    setConditions([...conditions, newCondition]);
  };

  const updateCondition = (id: string, updates: Partial<Condition>) => {
    setConditions(conditions.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const removeCondition = (id: string) => {
    setConditions(conditions.filter(c => c.id !== id));
  };

  const addAction = () => {
    const newAction: Action = {
      id: Date.now().toString(),
      action_type: 'create_task',
      action_data: { task_type: 'Standard Cleaning', description: '' }
    };
    setActions([...actions, newAction]);
  };

  const updateAction = (id: string, updates: Partial<Action>) => {
    setActions(actions.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const removeAction = (id: string) => {
    setActions(actions.filter(a => a.id !== id));
  };

  const handleSave = async () => {
    // TODO: Implement save logic
    console.log('Saving rule:', {
      ruleName,
      ruleDescription,
      minNights,
      maxNights,
      conditions,
      actions
    });
    onSave();
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Advanced Logic Builder
          </DialogTitle>
          <DialogDescription>
            Create sophisticated cleaning automation rules with conditions and actions
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Rule Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Rule Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ruleName">Rule Name</Label>
                  <Input
                    id="ruleName"
                    value={ruleName}
                    onChange={(e) => setRuleName(e.target.value)}
                    placeholder="e.g., Extended Stay Deep Clean"
                  />
                </div>
                <div>
                  <Label htmlFor="ruleDescription">Description</Label>
                  <Input
                    id="ruleDescription"
                    value={ruleDescription}
                    onChange={(e) => setRuleDescription(e.target.value)}
                    placeholder="Brief description of the rule"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minNights">Minimum Nights</Label>
                  <Input
                    id="minNights"
                    type="number"
                    value={minNights}
                    onChange={(e) => setMinNights(parseInt(e.target.value) || 1)}
                    min="1"
                  />
                </div>
                <div>
                  <Label htmlFor="maxNights">Maximum Nights</Label>
                  <Input
                    id="maxNights"
                    type="number"
                    value={maxNights}
                    onChange={(e) => setMaxNights(parseInt(e.target.value) || 999)}
                    min="1"
                    placeholder="999 for unlimited"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs for Conditions and Actions */}
          <div className="flex space-x-1 p-1 bg-muted rounded-lg">
            <button
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'conditions' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab('conditions')}
            >
              <Filter className="h-4 w-4 inline mr-2" />
              Conditions ({conditions.length})
            </button>
            <button
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'actions' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab('actions')}
            >
              <Play className="h-4 w-4 inline mr-2" />
              Actions ({actions.length})
            </button>
          </div>

          {/* Conditions Tab */}
          {activeTab === 'conditions' && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg">Rule Conditions</CardTitle>
                    <CardDescription>
                      Define when this rule should trigger based on booking data
                    </CardDescription>
                  </div>
                  <Button onClick={addCondition} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Condition
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {conditions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No conditions defined yet</p>
                    <p className="text-sm">Add conditions to control when this rule triggers</p>
                  </div>
                ) : (
                  conditions.map((condition, index) => (
                    <div key={condition.id} className="space-y-3">
                      {index > 0 && (
                        <div className="flex items-center gap-2">
                          <Separator className="flex-1" />
                          <Select
                            value={condition.logical_operator}
                            onValueChange={(value: 'AND' | 'OR') => 
                              updateCondition(condition.id, { logical_operator: value })
                            }
                          >
                            <SelectTrigger className="w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="AND">
                                <Badge variant="default" className="text-xs">AND</Badge>
                              </SelectItem>
                              <SelectItem value="OR">
                                <Badge variant="secondary" className="text-xs">OR</Badge>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <Separator className="flex-1" />
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 border rounded-lg">
                        <Select
                          value={condition.condition_type}
                          onValueChange={(value) => updateCondition(condition.id, { condition_type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Condition Type" />
                          </SelectTrigger>
                          <SelectContent>
                            {conditionTypes.map(type => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select
                          value={condition.operator}
                          onValueChange={(value) => updateCondition(condition.id, { operator: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Operator" />
                          </SelectTrigger>
                          <SelectContent>
                            {operators.map(op => (
                              <SelectItem key={op.value} value={op.value}>
                                {op.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Input
                          value={condition.value?.value || ''}
                          onChange={(e) => updateCondition(condition.id, { 
                            value: { ...condition.value, value: e.target.value } 
                          })}
                          placeholder="Value"
                        />

                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => removeCondition(condition.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions Tab */}
          {activeTab === 'actions' && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg">Rule Actions</CardTitle>
                    <CardDescription>
                      Define what happens when conditions are met
                    </CardDescription>
                  </div>
                  <Button onClick={addAction} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Action
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {actions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Play className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No actions defined yet</p>
                    <p className="text-sm">Add actions to specify what should happen</p>
                  </div>
                ) : (
                  actions.map((action, index) => (
                    <div key={action.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">Action {index + 1}</Badge>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => removeAction(action.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label>Action Type</Label>
                          <Select
                            value={action.action_type}
                            onValueChange={(value) => updateAction(action.id, { action_type: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select action type" />
                            </SelectTrigger>
                            <SelectContent>
                              {actionTypes.map(type => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {action.action_type === 'create_task' && (
                          <div>
                            <Label>Task Type</Label>
                            <Select
                              value={action.action_data?.task_type || ''}
                              onValueChange={(value) => updateAction(action.id, {
                                action_data: { ...action.action_data, task_type: value }
                              })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select task type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Standard Cleaning">Standard Cleaning</SelectItem>
                                <SelectItem value="Deep Cleaning">Deep Cleaning</SelectItem>
                                <SelectItem value="Linen Change">Linen Change</SelectItem>
                                <SelectItem value="Maintenance Check">Maintenance Check</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <Label>Description/Notes</Label>
                        <Textarea
                          value={action.action_data?.description || ''}
                          onChange={(e) => updateAction(action.id, {
                            action_data: { ...action.action_data, description: e.target.value }
                          })}
                          placeholder="Additional details for this action"
                        />
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}

          {/* Rule Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Rule Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium mb-2">
                  {ruleName || 'Unnamed Rule'} ({minNights}-{maxNights === 999 ? '∞' : maxNights} nights)
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  {ruleDescription || 'No description'}
                </p>
                
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Conditions:</strong> {conditions.length === 0 ? 'None' : `${conditions.length} defined`}
                  </div>
                  <div>
                    <strong>Actions:</strong> {actions.length === 0 ? 'None' : `${actions.length} defined`}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer Actions */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button variant="outline">
                <Play className="h-4 w-4 mr-2" />
                Test Rule
              </Button>
              <Button 
                onClick={handleSave}
                disabled={!ruleName.trim() || conditions.length === 0 || actions.length === 0}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Rule
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};