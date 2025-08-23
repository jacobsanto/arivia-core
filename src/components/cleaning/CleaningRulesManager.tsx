import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Target, Clock, Calendar } from 'lucide-react';
import { CleaningRule, CleaningAction, RuleAssignment } from '@/hooks/useRuleBasedCleaningSystem';

interface CleaningRulesManagerProps {
  rules: CleaningRule[];
  actions: CleaningAction[];
  assignments: RuleAssignment[];
  onRuleCreated: (rule: Omit<CleaningRule, 'id' | 'created_at' | 'updated_at'>) => void;
  onRuleUpdated: (id: string, updates: Partial<CleaningRule>) => void;
  onRuleDeleted: (id: string) => void;
  onRuleAssigned: (ruleId: string, propertyIds: string[]) => void;
}

export const CleaningRulesManager: React.FC<CleaningRulesManagerProps> = ({
  rules,
  actions,
  assignments,
  onRuleCreated,
  onRuleUpdated,
  onRuleDeleted,
  onRuleAssigned
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<CleaningRule | null>(null);
  const [formData, setFormData] = useState({
    rule_name: '',
    min_nights: 1,
    max_nights: 999,
    is_global: true,
    is_active: true,
    actions_by_day: {} as Record<string, string[]>,
    assignable_properties: [] as string[]
  });

  const handleOpenDialog = (rule?: CleaningRule) => {
    if (rule) {
      setEditingRule(rule);
      setFormData({
        rule_name: rule.rule_name,
        min_nights: rule.min_nights,
        max_nights: rule.max_nights,
        is_global: rule.is_global,
        is_active: rule.is_active,
        actions_by_day: rule.actions_by_day,
        assignable_properties: rule.assignable_properties
      });
    } else {
      setEditingRule(null);
      setFormData({
        rule_name: '',
        min_nights: 1,
        max_nights: 999,
        is_global: true,
        is_active: true,
        actions_by_day: {},
        assignable_properties: []
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    const ruleData = {
      ...formData,
      stay_length_range: [formData.min_nights, formData.max_nights],
      config_id: 'default'
    };

    if (editingRule) {
      onRuleUpdated(editingRule.id, ruleData);
    } else {
      onRuleCreated(ruleData);
    }
    setIsDialogOpen(false);
  };

  const handleActionToggle = (day: string, actionId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      actions_by_day: {
        ...prev.actions_by_day,
        [day]: checked 
          ? [...(prev.actions_by_day[day] || []), actionId]
          : (prev.actions_by_day[day] || []).filter(id => id !== actionId)
      }
    }));
  };

  const getDayActions = (day: string) => formData.actions_by_day[day] || [];

  const days = ['check_in', 'during_stay', 'check_out'];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Cleaning Rules</h3>
          <p className="text-sm text-muted-foreground">
            Rules determine which cleaning actions are performed based on stay characteristics
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              New Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingRule ? 'Edit Cleaning Rule' : 'Create New Cleaning Rule'}
              </DialogTitle>
              <DialogDescription>
                Define the conditions and actions for this cleaning rule
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rule_name">Rule Name</Label>
                  <Input
                    id="rule_name"
                    value={formData.rule_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, rule_name: e.target.value }))}
                    placeholder="e.g., Standard Short Stay Rule"
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="min_nights">Minimum Nights</Label>
                  <Input
                    id="min_nights"
                    type="number"
                    value={formData.min_nights}
                    onChange={(e) => setFormData(prev => ({ ...prev, min_nights: parseInt(e.target.value) || 1 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="max_nights">Maximum Nights</Label>
                  <Input
                    id="max_nights"
                    type="number"
                    value={formData.max_nights}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_nights: parseInt(e.target.value) || 999 }))}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_global"
                  checked={formData.is_global}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_global: checked }))}
                />
                <Label htmlFor="is_global">Apply to all properties (Global Rule)</Label>
              </div>

              <div>
                <Label>Actions by Day</Label>
                <div className="mt-2 space-y-4">
                  {days.map(day => (
                    <Card key={day} className="p-4">
                      <h4 className="font-medium mb-2 capitalize">{day.replace('_', ' ')}</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {actions.map(action => (
                          <div key={action.id} className="flex items-center space-x-2">
                            <Switch
                              id={`${day}-${action.id}`}
                              checked={getDayActions(day).includes(action.id)}
                              onCheckedChange={(checked) => handleActionToggle(day, action.id, checked)}
                            />
                            <Label htmlFor={`${day}-${action.id}`} className="text-sm">
                              {action.display_name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {editingRule ? 'Update Rule' : 'Create Rule'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {rules.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="flex flex-col items-center space-y-2">
              <Target className="h-8 w-8 text-muted-foreground" />
              <h3 className="font-medium">No cleaning rules defined</h3>
              <p className="text-sm text-muted-foreground">
                Create your first cleaning rule to automate task assignment
              </p>
            </div>
          </Card>
        ) : (
          rules.map(rule => (
            <Card key={rule.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{rule.rule_name}</CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {rule.min_nights}-{rule.max_nights} nights
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {Object.values(rule.actions_by_day).flat().length} actions
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={rule.is_active ? "default" : "secondary"}>
                      {rule.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant={rule.is_global ? "outline" : "secondary"}>
                      {rule.is_global ? 'Global' : 'Assigned'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDialog(rule)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRuleDeleted(rule.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {days.map(day => {
                    const dayActions = rule.actions_by_day[day] || [];
                    if (dayActions.length === 0) return null;
                    
                    return (
                      <div key={day}>
                        <h4 className="font-medium text-sm capitalize mb-2">
                          {day.replace('_', ' ')}:
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {dayActions.map(actionId => {
                            const action = actions.find(a => a.id === actionId);
                            return action ? (
                              <Badge key={actionId} variant="outline" className="text-xs">
                                {action.display_name}
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};