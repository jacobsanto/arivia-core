import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { CleaningRule, useRuleBasedCleaningSystem } from '@/hooks/useRuleBasedCleaningSystem';
import { centralizedPropertyService } from '@/services/property/centralizedProperty.service';
import { Trash2, Plus } from 'lucide-react';

interface RuleBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  existingRule?: CleaningRule | null;
}

export const RuleBuilder: React.FC<RuleBuilderProps> = ({
  isOpen,
  onClose,
  onSave,
  existingRule
}) => {
  const { actions, createCleaningRule, updateCleaningRule, assignRuleToProperties } = useRuleBasedCleaningSystem();
  
  // Form state
  const [ruleName, setRuleName] = useState('');
  const [isGlobal, setIsGlobal] = useState(true);
  const [stayRangeMin, setStayRangeMin] = useState(1);
  const [stayRangeMax, setStayRangeMax] = useState(7);
  const [actionsByDay, setActionsByDay] = useState<Record<string, string[]>>({});
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newDayNumber, setNewDayNumber] = useState(1);

  // Load form data when rule changes
  useEffect(() => {
    if (existingRule) {
      setRuleName(existingRule.rule_name);
      setIsGlobal(existingRule.is_global);
      setStayRangeMin(existingRule.min_nights);
      setStayRangeMax(existingRule.max_nights);
      setActionsByDay(existingRule.actions_by_day || {});
      setSelectedProperties(existingRule.assignable_properties || []);
    } else {
      // Reset form for new rule
      setRuleName('');
      setIsGlobal(true);
      setStayRangeMin(1);
      setStayRangeMax(7);
      setActionsByDay({});
      setSelectedProperties([]);
    }
  }, [existingRule, isOpen]);

  // Load properties when dialog opens
  useEffect(() => {
    if (isOpen) {
      loadProperties();
    }
  }, [isOpen]);

  const loadProperties = async () => {
    try {
      const data = await centralizedPropertyService.getAllProperties();
      setProperties(data);
    } catch (error) {
      console.error('Error loading properties:', error);
      toast({
        title: "Error",
        description: "Failed to load properties",
        variant: "destructive",
      });
    }
  };

  const getDefaultActionsForRule = (ruleType: string, stayLength: number): Record<string, string[]> => {
    const defaults: Record<string, string[]> = {};
    
    // Get available actions by category
    const cleaningActions = actions.filter(a => a.category === 'cleaning').map(a => a.action_name);
    const linenActions = actions.filter(a => a.category === 'linen').map(a => a.action_name);
    const inspectionActions = actions.filter(a => a.category === 'inspection').map(a => a.action_name);
    
    if (ruleType.toLowerCase().includes('short')) {
      defaults['1'] = [...cleaningActions.slice(0, 2)]; // Basic cleaning actions
    } else if (ruleType.toLowerCase().includes('medium')) {
      defaults['1'] = [...cleaningActions.slice(0, 2)];
      defaults[Math.floor(stayLength / 2).toString()] = [...linenActions.slice(0, 1)]; // Mid-stay linen change
      defaults[stayLength.toString()] = [...cleaningActions.slice(0, 1)]; // Final cleaning
    } else if (ruleType.toLowerCase().includes('extended')) {
      defaults['1'] = [...cleaningActions.slice(0, 2)];
      defaults['3'] = [...linenActions.slice(0, 2)];
      defaults['7'] = [...cleaningActions, ...inspectionActions.slice(0, 1)];
    }
    
    return defaults;
  };

  const addDefaultActions = () => {
    if (actions.length === 0) {
      toast({
        title: "No Actions Available",
        description: "Please create some cleaning actions first",
        variant: "destructive",
      });
      return;
    }
    
    const defaults = getDefaultActionsForRule(ruleName, stayRangeMax);
    if (Object.keys(defaults).length === 0) {
      toast({
        title: "No Default Actions",
        description: "No default actions available for this rule type",
        variant: "destructive",
      });
      return;
    }
    
    setActionsByDay(prev => ({
      ...prev,
      ...defaults
    }));
    
    toast({
      title: "Default Actions Added",
      description: `Added default actions for ${ruleName}`,
    });
  };

  const addNewDay = () => {
    if (newDayNumber < 1 || newDayNumber > 365) {
      toast({
        title: "Invalid Day",
        description: "Day must be between 1 and 365",
        variant: "destructive",
      });
      return;
    }

    const dayKey = newDayNumber.toString();
    if (actionsByDay[dayKey]) {
      toast({
        title: "Day Already Exists",
        description: `Day ${newDayNumber} is already configured`,
        variant: "destructive",
      });
      return;
    }

    setActionsByDay(prev => ({ ...prev, [dayKey]: [] }));
    setNewDayNumber(prev => prev + 1); // Auto-increment for next day
  };

  const removeDay = (day: string) => {
    setActionsByDay(prev => {
      const newActions = { ...prev };
      delete newActions[day];
      return newActions;
    });
  };

  const addActionToDay = (day: string, actionName: string) => {
    setActionsByDay(prev => ({
      ...prev,
      [day]: [...(prev[day] || []), actionName]
    }));
  };

  const removeActionFromDay = (day: string, actionIndex: number) => {
    setActionsByDay(prev => ({
      ...prev,
      [day]: (prev[day] || []).filter((_, index) => index !== actionIndex)
    }));
  };

  const handleSave = async () => {
    if (!ruleName.trim()) {
      toast({
        title: "Validation Error",
        description: "Rule name is required",
        variant: "destructive",
      });
      return;
    }

    // Check if actions are configured
    const hasActions = Object.values(actionsByDay).some(dayActions => dayActions.length > 0);
    if (!hasActions) {
      toast({
        title: "Validation Error",
        description: "Please configure at least one action for this rule",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const ruleData = {
        rule_name: ruleName,
        stay_length_range: [stayRangeMin, stayRangeMax],
        actions_by_day: actionsByDay,
        is_global: isGlobal,
        assignable_properties: selectedProperties,
        is_active: true,
        config_id: existingRule?.config_id || undefined, // Don't set config_id for new rules, let DB handle it
        min_nights: stayRangeMin,
        max_nights: stayRangeMax
      };

      let savedRule;
      if (existingRule) {
        savedRule = await updateCleaningRule(existingRule.id, ruleData);
        toast({
          title: "Rule Updated",
          description: `"${ruleName}" has been updated successfully`,
        });
      } else {
        savedRule = await createCleaningRule(ruleData);
        toast({
          title: "Rule Created",
          description: `"${ruleName}" has been created successfully`,
        });
      }

      // Handle assignments
      if (isGlobal && savedRule) {
        try {
          const allProperties = await centralizedPropertyService.getAllProperties();
          const propertyIds = allProperties.map((p: any) => p.id);

          if (propertyIds.length > 0) {
            await assignRuleToProperties(savedRule.id, propertyIds);
            toast({
              title: "Global Rule Assignment",
              description: `Rule automatically assigned to ${propertyIds.length} properties`,
            });
          }
        } catch (assignError) {
          console.error('Error auto-assigning global rule:', assignError);
          toast({
            title: "Assignment Warning",
            description: "Rule created but auto-assignment failed. Please assign manually.",
            variant: "destructive",
          });
        }
      } else if (!isGlobal && selectedProperties.length > 0 && savedRule) {
        try {
          await assignRuleToProperties(savedRule.id, selectedProperties);
          toast({
            title: "Rule Assignment",
            description: `Rule assigned to ${selectedProperties.length} selected properties`,
          });
        } catch (assignError) {
          console.error('Error assigning rule to properties:', assignError);
          toast({
            title: "Assignment Warning",
            description: "Rule created but property assignment failed.",
            variant: "destructive",
          });
        }
      }

      onSave();
    } catch (err) {
      console.error('Error saving rule:', err);
      toast({
        title: "Error Saving Rule",
        description: err instanceof Error ? err.message : 'Failed to save rule',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderDayActions = (day: string) => {
    const dayActions = actionsByDay[day] || [];
    const availableActions = actions.filter(action => 
      !dayActions.includes(action.action_name)
    );

    return (
      <Card key={day}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Day {day}</CardTitle>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => removeDay(day)}
            className="h-6 w-6 p-0"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Add Action Dropdown */}
          <Select onValueChange={(actionName) => addActionToDay(day, actionName)}>
            <SelectTrigger>
              <SelectValue placeholder="Add action..." />
            </SelectTrigger>
            <SelectContent>
              {availableActions.map((action) => (
                <SelectItem key={action.id} value={action.action_name}>
                  {action.display_name} ({action.category})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Current Actions */}
          <div className="space-y-2">
            {dayActions.map((actionName, index) => {
              const action = actions.find(a => a.action_name === actionName);
              return (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                  <div>
                    <span className="text-sm font-medium">
                      {action?.display_name || actionName}
                    </span>
                    {action && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        {action.category}
                      </Badge>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeActionFromDay(day, index)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              );
            })}
            {dayActions.length === 0 && (
              <p className="text-sm text-muted-foreground">No actions scheduled</p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {existingRule ? 'Edit Cleaning Rule' : 'Create New Cleaning Rule'}
          </DialogTitle>
          <DialogDescription>
            Configure a cleaning rule with day-based action scheduling
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Rule Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Rule Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ruleName">Rule Name</Label>
                  <Input
                    id="ruleName"
                    value={ruleName}
                    onChange={(e) => setRuleName(e.target.value)}
                    placeholder="e.g., Short Stay (1-3 nights)"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isGlobal"
                    checked={isGlobal}
                    onCheckedChange={(checked) => setIsGlobal(checked === true)}
                  />
                  <Label htmlFor="isGlobal">Global Rule (applies to all properties)</Label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="stayRangeMin">Minimum Nights</Label>
                  <Input
                    id="stayRangeMin"
                    type="number"
                    min="1"
                    value={stayRangeMin}
                    onChange={(e) => setStayRangeMin(parseInt(e.target.value) || 1)}
                  />
                </div>
                <div>
                  <Label htmlFor="stayRangeMax">Maximum Nights</Label>
                  <Input
                    id="stayRangeMax"
                    type="number"
                    min={stayRangeMin}
                    value={stayRangeMax}
                    onChange={(e) => setStayRangeMax(parseInt(e.target.value) || 999)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Property Assignment - Only show for custom rules */}
          {!isGlobal && (
            <Card>
              <CardHeader>
                <CardTitle>Property Assignment</CardTitle>
                <CardDescription>
                  Select which properties this rule should apply to
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {properties.map((property) => (
                    <div key={property.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={property.id}
                        checked={selectedProperties.includes(property.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedProperties(prev => [...prev, property.id]);
                          } else {
                            setSelectedProperties(prev => prev.filter(id => id !== property.id));
                          }
                        }}
                      />
                      <Label htmlFor={property.id} className="text-sm">
                        {property.title}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cleaning Actions by Day */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Cleaning Actions by Day</CardTitle>
                <CardDescription>
                  Schedule specific actions for each day of the stay
                </CardDescription>
              </div>
              <Button variant="outline" onClick={addDefaultActions} disabled={actions.length === 0}>
                <Plus className="h-4 w-4 mr-2" />
                Add Default Actions
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2 mb-4 items-end">
                  <div className="flex-1">
                    <Label htmlFor="newDayNumber">Add Day</Label>
                    <Input
                      id="newDayNumber"
                      type="number"
                      min="1"
                      max="365"
                      value={newDayNumber}
                      onChange={(e) => setNewDayNumber(parseInt(e.target.value) || 1)}
                      className="w-20"
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={addNewDay}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Day {newDayNumber}
                  </Button>
                </div>

                <div className="grid gap-4">
                  {Object.keys(actionsByDay).sort((a, b) => parseInt(a) - parseInt(b)).map(day => 
                    renderDayActions(day)
                  )}
                  {Object.keys(actionsByDay).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No actions configured. Use "Add Default Actions" or add days manually.
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : (existingRule ? 'Update Rule' : 'Create Rule')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};